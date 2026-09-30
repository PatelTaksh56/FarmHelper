/**
 * Crop Advisor Client Service
 * Connects Soil Health Card PDF extraction, Farm Context, Real Weather,
 * Deterministic Suitability Engine, and Gemini AI Advisory Explanations.
 */

import { auth } from '../config/firebase';
import { Farm } from '../types/models';
import {
  SoilProfileInput,
  evaluateCropSuitabilityDetailed,
  CandidateCropScore,
  RejectedCropResult,
} from './cropSuitabilityEngine';
import {
  generateCropAdvisorInsights,
  CropAdvisorGeminiRequest,
  GeminiExplorationCrop,
  CropAdvisorMode,
} from './geminiCropAdvisorService';
import {
  HistoricalWeatherSummary,
  YearOverYearWeatherSummary,
  getHistoricalFarmWeather,
  getYearOverYearHistoricalWeather,
  getHarvestWindowHistoricalWeather,
  getWeatherForCoordinates,
} from './weatherService';
import { buildFarmAgronomicContext, FarmAgronomicContext } from './farmAgronomicContext';

export interface CropAdvisorRequestInput {
  farm?: Farm | null;
  soil: SoilProfileInput;
  preferredLanguage?: string;
}

export interface RecommendedCropResult {
  cropId: string;
  displayName: string;
  scientificName: string;
  suitabilityScore: number;
  recommendationStatus: 'SUITABLE' | 'SUITABLE_WITH_MANAGEMENT' | 'NOT_SUITABLE';
  nutrientDeficiencies: string[];
  managementConstraints: string[];
  scoreBreakdown?: {
    soilScore?: number;
    seasonScore?: number;
    weatherScore?: number;
    waterScore?: number;
    rotationScore?: number;
    regionalScore?: number;
  };
  soilAssessment: string;
  weatherAssessment: string;
  rotationAssessment: string;
  waterAssessment: string;
  seasonAssessment: string;
  whySuitable?: string;
  keyRisks?: string[];
  managementActions?: string[];
  nutrientAdvice?: string[];
  confidenceExplanation?: string;
  reasons: string[];
  limitations: string[];
  calendarEvidence?: {
    level: string;
    sowingFrom?: string;
    sowingTo?: string;
    sourceRowReference?: string;
  };
}

export interface CropAdvisoryResponse {
  hasRecommendations: boolean;
  mode: CropAdvisorMode;
  recommendations: RecommendedCropResult[];
  explorationCrops?: GeminiExplorationCrop[];
  noRecommendationMessage?: string;
  rejectionBreakdown?: {
    outsideWindowCount: number;
    noDistrictEvidenceCount: number;
    rotationConflictCount: number;
    perennialCount: number;
    phCount: number;
    waterCount: number;
    totalRejectedCount: number;
  };
  aiStatus: 'success' | 'ai-unavailable' | 'none';
  aiStatusMessage?: string;
  overallSummary?: string;
  dataQuality?: {
    soilCompleteness?: string;
    weatherCompleteness?: string;
    forecastHorizonDays?: number;
  };
  farmSummary?: {
    farmName: string;
    location: string;
    currentCrop: string;
  };
  weatherSummary?: {
    historicalWindow: string;
    historicalRainfall: string;
    yearOverYearSummary: string;
    harvestWindowSummary?: string;
    currentTemp: string;
    forecastHorizon: string;
  };
}

/**
 * Dynamically resolve the backend base endpoint URL
 */
function getBackendBaseUrl(): string {
  const envUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.includes('cloudfunctions.net') || trimmed.includes('.a.run.app')) {
      return trimmed;
    }
    try {
      const parsed = new URL(trimmed);
      return parsed.origin;
    } catch (_) {
      return trimmed.replace(/\/(diagnoseCrop|adviseCrop|extractSoilReport|diagnose|api)$/i, '');
    }
  }

  if (import.meta.env.PROD) {
    return '';
  }

  return 'http://localhost:5001';
}

/**
 * Convert PDF File to Base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Extract Soil Health Card Parameters from PDF via Secure Gemini Backend
 */
export async function extractSoilParametersFromPdf(file: File): Promise<SoilProfileInput> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Please upload a valid Soil Health Card PDF document.');
  }

  const base64 = await fileToBase64(file);
  const currentUser = auth.currentUser;
  const idToken = currentUser ? await currentUser.getIdToken(true) : 'dev-token';
  const baseUrl = getBackendBaseUrl();
  const endpoint = `${baseUrl}/extractSoilReport`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        data: {
          pdfBase64: base64,
          pdfMimeType: 'application/pdf',
        },
      }),
    });

    if (!response.ok) {
      let errorMsg = `Server returned status ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errJson.message || errorMsg;
      } catch (_) {}
      throw new Error(`Failed to extract parameters from PDF: ${errorMsg}`);
    }

    const resData = await response.json();
    const extracted = resData.data || resData;
    return extracted as SoilProfileInput;
  } catch (err: any) {
    if (err.name === 'TypeError' || (err.message && err.message.includes('fetch'))) {
      throw new Error(`Unable to connect to PDF extraction backend at ${endpoint}. Please ensure backend is running or enter soil values manually.`);
    }
    throw err;
  }
}

/**
 * Execute Complete Data-Driven Crop Advisory Pipeline
 * 1. Run deterministic feasibility engine (hard feasibility gates + continuous suitability scoring)
 * 2. Check candidate count: if 0, return deterministic result without calling AI
 * 3. If candidates exist, call Firebase Gemini backend for AI reasoning
 * 4. Merge deterministic scores (authoritative!) with Gemini structured AI explanations
 */
export async function runCropAdvisoryPipeline(
  input: CropAdvisorRequestInput
): Promise<CropAdvisoryResponse> {
  const { farm, soil, preferredLanguage } = input;

  // 1. Gather Real Weather Context for selected farm
  let historicalCropCycle: HistoricalWeatherSummary | null = null;
  let historicalYearOverYear: YearOverYearWeatherSummary | null = null;
  let historicalHarvestWindow: YearOverYearWeatherSummary | null = null;
  let currentWeatherSummary: any = null;
  let forecastSummary: any = null;

  if (farm && farm.latitude && farm.longitude) {
    try {
      const harvestDateObj = farm.expectedHarvestDate ? new Date(farm.expectedHarvestDate) : null;
      const validHarvestStr = harvestDateObj && !isNaN(harvestDateObj.getTime()) && harvestDateObj < new Date()
        ? farm.expectedHarvestDate
        : new Date().toISOString().split('T')[0];

      historicalCropCycle = await getHistoricalFarmWeather(
        farm.latitude,
        farm.longitude,
        farm.plantingDate,
        validHarvestStr
      );

      historicalYearOverYear = await getYearOverYearHistoricalWeather(
        farm.latitude,
        farm.longitude,
        new Date().toISOString(),
        7,
        3
      );

      if (farm.expectedHarvestDate) {
        historicalHarvestWindow = await getHarvestWindowHistoricalWeather(
          farm.latitude,
          farm.longitude,
          farm.expectedHarvestDate,
          7,
          3
        );
      }

      const liveWeather = await getWeatherForCoordinates(farm.latitude, farm.longitude);
      currentWeatherSummary = liveWeather.current;
      forecastSummary = liveWeather.forecast;
    } catch (weatherErr) {
      console.warn('[CropAdvisor Service Warning] Weather fetch error, proceeding with available telemetry:', weatherErr);
    }
  }

  // 2. Pre-compute Deterministic Agronomic Suitability Scores via Feasibility Engine
  const farmContextInput = {
    farmId: farm?.id,
    farmName: farm?.farmName,
    state: farm?.state || 'Gujarat',
    district: farm?.district || farm?.locationName || 'Ahmedabad',
    currentCrop: farm?.currentCrop,
    plantingDate: farm?.plantingDate,
    expectedHarvestDate: farm?.expectedHarvestDate,
    waterSource: farm?.waterSource,
    waterSourceOther: farm?.waterSourceOther,
    waterAvailability: farm?.waterAvailability,
    landArea: farm?.landArea,
    landAreaUnit: farm?.landAreaUnit,
  };

  const weatherContextInput = {
    historical: historicalCropCycle || undefined,
    historicalCropCycle: historicalCropCycle || undefined,
    historicalYearOverYear: historicalYearOverYear || undefined,
    historicalHarvestWindow: historicalHarvestWindow || undefined,
    current: currentWeatherSummary || undefined,
    forecast: forecastSummary || undefined,
    forecastHorizonDays: 16,
  };

  const evaluationResult = evaluateCropSuitabilityDetailed(
    soil,
    farmContextInput,
    weatherContextInput
  );

  const { feasibleCandidates, rejectedCrops } = evaluationResult;

  const farmSummary = {
    farmName: farm?.farmName || 'Default Plot',
    location: `${farm?.locationName || farm?.district || 'Farm Location'}, ${farm?.state || 'India'}`,
    currentCrop: farm?.currentCrop || 'None / Fallow',
  };

  const weatherSummary = {
    historicalWindow: historicalCropCycle
      ? `${farm?.plantingDate || historicalCropCycle.startDate} to ${farm?.expectedHarvestDate || historicalCropCycle.endDate} (${historicalCropCycle.meanTemperature}°C mean)`
      : 'Past crop cycle window',
    historicalRainfall: historicalCropCycle ? `${historicalCropCycle.totalRainfall} mm (${historicalCropCycle.rainyDays} rainy days)` : 'Seasonal average',
    yearOverYearSummary: historicalYearOverYear
      ? `3-Yr YoY Avg (${historicalYearOverYear.windowDescription}): ${historicalYearOverYear.multiYearAvgTemp}°C, ${historicalYearOverYear.multiYearAvgRainfall}mm avg rain`
      : '3-Year seasonal baseline',
    harvestWindowSummary: historicalHarvestWindow
      ? `${historicalHarvestWindow.windowDescription}: ${historicalHarvestWindow.multiYearAvgTemp}°C avg`
      : undefined,
    currentTemp: currentWeatherSummary ? `${currentWeatherSummary.temperature}°C, ${currentWeatherSummary.weatherCondition}` : 'Live telemetry',
    forecastHorizon: 'Next 16 days (Open-Meteo)',
  };

  const dataQuality = {
    soilCompleteness: soil.nitrogen && soil.ph ? 'complete' : 'partial',
    weatherCompleteness: historicalCropCycle && historicalYearOverYear ? 'complete' : 'partial',
    forecastHorizonDays: 16,
  };

  // MODE C: ZERO-CANDIDATE BEHAVIOR -> Call Gemini AI for Agronomic Exploration
  if (!feasibleCandidates || feasibleCandidates.length === 0) {
    let outsideWindowCount = 0;
    let noDistrictEvidenceCount = 0;
    let rotationConflictCount = 0;
    let perennialCount = 0;
    let phCount = 0;
    let waterCount = 0;

    for (const r of rejectedCrops) {
      if (r.exclusionReasons.includes('OUTSIDE_DISTRICT_SOWING_WINDOW')) outsideWindowCount++;
      if (r.exclusionReasons.includes('NO_DISTRICT_CALENDAR_EVIDENCE')) noDistrictEvidenceCount++;
      if (r.exclusionReasons.includes('ROTATION_CONFLICT_AVOID_PREVIOUS')) rotationConflictCount++;
      if (r.exclusionReasons.includes('PERENNIAL_ORCHARD_EXCLUDED')) perennialCount++;
      if (r.exclusionReasons.includes('SOIL_PH_OUT_OF_BOUNDS')) phCount++;
      if (r.exclusionReasons.includes('WATER_SOURCE_INCOMPATIBLE')) waterCount++;
    }

    const rejectionBreakdown = {
      outsideWindowCount,
      noDistrictEvidenceCount,
      rotationConflictCount,
      perennialCount,
      phCount,
      waterCount,
      totalRejectedCount: rejectedCrops.length,
    };

    // Calculate target next sowing date for exploration context
    let harvestDateObj: Date | null = null;
    if (farm?.expectedHarvestDate) {
      const d = new Date(farm.expectedHarvestDate);
      if (!isNaN(d.getTime())) harvestDateObj = d;
    }
    const targetSowingDateObj = harvestDateObj
      ? new Date(harvestDateObj.getTime() + 12 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const targetSowingDateStr = targetSowingDateObj.toISOString().split('T')[0];

    const explorationPayload: CropAdvisorGeminiRequest = {
      mode: 'AGRONOMIC_EXPLORATION',
      farm: {
        farmId: farm?.id,
        farmName: farm?.farmName,
        locationName: farm?.locationName,
        district: farmContextInput.district,
        state: farmContextInput.state,
        currentCrop: farm?.currentCrop,
        plantingDate: farm?.plantingDate,
        expectedHarvestDate: farm?.expectedHarvestDate,
        targetSowingDate: targetSowingDateStr,
        waterSource: farm?.waterSource,
        waterSourceOther: farm?.waterSourceOther,
      },
      soil,
      weather: weatherContextInput,
      candidates: [],
      deterministicAudit: {
        totalCropsEvaluated: rejectedCrops.length,
        ...rejectionBreakdown,
      },
      preferredLanguage: preferredLanguage || 'en-IN',
    };

    let explorationResponse: any = null;
    let aiStatus: 'success' | 'ai-unavailable' = 'success';
    let aiStatusMessage: string | undefined = undefined;

    try {
      explorationResponse = await generateCropAdvisorInsights(explorationPayload);
    } catch (aiErr: any) {
      console.warn('[CropAdvisor Exploration Warning] Gemini exploration call failed, falling back to deterministic audit:', aiErr.message);
      aiStatus = 'ai-unavailable';
      aiStatusMessage = 'AI Agronomic Exploration is temporarily unavailable. The deterministic audit breakdown remains accessible below.';
    }

    return {
      hasRecommendations: false,
      mode: 'AGRONOMIC_EXPLORATION',
      recommendations: [],
      explorationCrops: explorationResponse?.potentialCrops || explorationResponse?.recommendedCrops || [],
      overallSummary: explorationResponse?.overallSummary || explorationResponse?.summary,
      noRecommendationMessage: `No validated crop recommendations were found in FarmHelper's district-specific evidence for ${farmContextInput.district} (${farmContextInput.state}) for the target sowing date (${targetSowingDateStr}).`,
      rejectionBreakdown,
      aiStatus,
      aiStatusMessage,
      farmSummary,
      weatherSummary,
      dataQuality,
    };
  }

  // 3. Construct Complete Structured Farm Agronomic Context for Gemini Reasoning
  let harvestDateObj: Date | null = null;
  if (farm?.expectedHarvestDate) {
    const d = new Date(farm.expectedHarvestDate);
    if (!isNaN(d.getTime())) harvestDateObj = d;
  }
  const targetSowingDateObj = harvestDateObj
    ? new Date(harvestDateObj.getTime() + 12 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const targetSowingDateStr = targetSowingDateObj.toISOString().split('T')[0];

  const farmAgronomicContext = buildFarmAgronomicContext(
    soil,
    farmContextInput,
    weatherContextInput,
    evaluationResult,
    targetSowingDateStr
  );

  const topCandidates = feasibleCandidates.slice(0, 5);

  const geminiPayload = {
    mode: feasibleCandidates.length > 0 ? ('VALIDATED_RECOMMENDATION' as CropAdvisorMode) : ('AGRONOMIC_EXPLORATION' as CropAdvisorMode),
    farmAgronomicContext,
    farm: {
      farmId: farm?.id,
      farmName: farm?.farmName,
      locationName: farm?.locationName,
      district: farmContextInput.district,
      state: farmContextInput.state,
      currentCrop: farm?.currentCrop,
      plantingDate: farm?.plantingDate,
      expectedHarvestDate: farm?.expectedHarvestDate,
      targetSowingDate: targetSowingDateStr,
      waterSource: farm?.waterSource,
      waterSourceOther: farm?.waterSourceOther,
    },
    soil,
    weather: weatherContextInput,
    candidates: topCandidates.map((c) => ({
      cropId: c.crop.cropId,
      cropName: c.crop.displayName,
      scientificName: c.crop.scientificName,
      suitabilityScore: c.suitabilityScore,
      recommendationStatus: c.recommendationStatus,
      nutrientDeficiencies: c.nutrientDeficiencies,
      managementConstraints: c.managementConstraints,
      calendarEvidence: {
        level: c.evidence?.level || 'GENERAL_CROP_KNOWLEDGE',
        state: c.evidence?.state,
        district: c.evidence?.district,
        season: c.evidence?.season,
        sowingFrom: c.evidence?.sowingFrom,
        sowingTo: c.evidence?.sowingTo,
        evidencePrecision: c.evidence?.evidencePrecision === 'NONE' ? undefined : c.evidence?.evidencePrecision,
        source: c.evidence?.source,
        sourceRowReference: c.evidence?.sourceRowReference,
      },
      scoreBreakdown: c.scoreBreakdown,
      soilAssessment: c.keyFactors.soilAssessment,
      waterAssessment: c.keyFactors.waterAssessment,
      rotationAssessment: c.keyFactors.rotationAssessment,
      weatherAssessment: c.keyFactors.weatherAssessment,
      seasonAssessment: c.keyFactors.seasonAssessment,
    })),
    preferredLanguage: preferredLanguage || 'en-IN',
  };

  let aiResponse: any = null;
  let aiStatus: 'success' | 'ai-unavailable' = 'success';
  let aiStatusMessage: string | undefined = undefined;

  try {
    aiResponse = await generateCropAdvisorInsights(geminiPayload);
  } catch (aiErr: any) {
    console.warn('[CropAdvisor Service Warning] Gemini backend call failed, falling back to deterministic recommendations:', aiErr.message);
    aiStatus = 'ai-unavailable';
    aiStatusMessage = 'AI analysis is temporarily unavailable. Your validated crop suitability results remain fully accessible.';
  }

  // 4. Merge Deterministic Results (Authoritative Scores) with Gemini AI Insights
  const recommendations: RecommendedCropResult[] = topCandidates.map((c, idx) => {
    const aiRecList = aiResponse?.recommendations || aiResponse?.recommendedCrops;
    const aiRec = aiRecList?.find(
      (r: any) =>
        (r.cropId && r.cropId.toLowerCase() === c.crop.cropId.toLowerCase()) ||
        (r.cropName && r.cropName.toLowerCase() === c.crop.displayName.toLowerCase())
    ) || (aiRecList ? aiRecList[idx] : null);

    // Merge localized nutrientDeficiencies and managementConstraints if Gemini returned them
    const nutrientDefs =
      aiRec?.nutrientDeficiencies && aiRec.nutrientDeficiencies.length > 0
        ? aiRec.nutrientDeficiencies
        : aiRec?.nutrientConsiderations && aiRec.nutrientConsiderations.length > 0
          ? aiRec.nutrientConsiderations
          : c.nutrientDeficiencies;

    const mgmtConstraints =
      aiRec?.managementConstraints && aiRec.managementConstraints.length > 0
        ? aiRec.managementConstraints
        : aiRec?.managementRequirements && aiRec.managementRequirements.length > 0
          ? aiRec.managementRequirements
          : c.managementConstraints;

    const managementActs =
      aiRec?.managementActions && aiRec.managementActions.length > 0
        ? aiRec.managementActions
        : aiRec?.managementRequirements && aiRec.managementRequirements.length > 0
          ? aiRec.managementRequirements
          : [];

    return {
      cropId: c.crop.cropId,
      displayName: c.crop.displayName,
      scientificName: c.crop.scientificName,
      suitabilityScore: c.suitabilityScore, // Strictly preserved from deterministic engine!
      recommendationStatus: c.recommendationStatus,
      nutrientDeficiencies: nutrientDefs,
      managementConstraints: mgmtConstraints,
      scoreBreakdown: c.scoreBreakdown,
      soilAssessment: aiRec?.soilAssessment || c.keyFactors.soilAssessment,
      weatherAssessment: aiRec?.weatherAssessment || c.keyFactors.weatherAssessment,
      rotationAssessment: aiRec?.rotationAssessment || c.keyFactors.rotationAssessment,
      waterAssessment: aiRec?.waterAssessment || c.keyFactors.waterAssessment,
      seasonAssessment: c.keyFactors.seasonAssessment,
      whySuitable: aiRec?.whySuitable || aiRec?.explanation,
      keyRisks: aiRec?.keyRisks || [],
      managementActions: managementActs,
      nutrientAdvice: aiRec?.nutrientAdvice && aiRec.nutrientAdvice.length > 0 ? aiRec.nutrientAdvice : nutrientDefs,
      confidenceExplanation: aiRec?.confidenceExplanation,
      reasons:
        aiRec?.reasons && aiRec.reasons.length > 0
          ? aiRec.reasons
          : [
              aiRec?.whySuitable || aiRec?.explanation || c.keyFactors.soilAssessment,
              aiRec?.weatherAssessment || c.keyFactors.weatherAssessment,
            ],
      limitations:
        aiRec?.limitations && aiRec.limitations.length > 0
          ? aiRec.limitations
          : mgmtConstraints.length > 0
            ? mgmtConstraints
            : [
                `Ensure adequate ${c.crop.waterRequirement.toLowerCase()} water supply during critical growth stages.`,
                `Monitor crop during upcoming sowing window (${c.decisionTrace.nextSowingWindow}).`,
              ],
      calendarEvidence: {
        level: c.evidence?.level || 'EXACT_DISTRICT',
        sowingFrom: c.evidence?.sowingFrom,
        sowingTo: c.evidence?.sowingTo,
        sourceRowReference: c.evidence?.sourceRowReference,
      },
    };
  });

  return {
    hasRecommendations: true,
    mode: 'VALIDATED_RECOMMENDATION',
    recommendations,
    aiStatus,
    aiStatusMessage,
    overallSummary: aiResponse?.overallSummary || aiResponse?.summary,
    farmSummary,
    weatherSummary,
    dataQuality,
  };
}
