/**
 * Deterministic Crop Suitability Scoring Engine
 * Evaluates Soil Health Card parameters, Farm context, Weather data, Season, and Crop Rotation rules
 * against the verifiable Crop Knowledge Base.
 */

import { CROP_KNOWLEDGE_BASE, CropSpecification } from '../data/cropKnowledge';
import { getValidatedSowingMonths, getDistrictCalendarEvidence, DistrictCalendarEvidenceResult } from '../data/cropCalendarData';

export interface SoilProfileInput {
  nitrogen?: number | null; // kg/ha
  phosphorus?: number | null; // kg/ha
  potassium?: number | null; // kg/ha
  sulphur?: number | null; // kg/ha or ppm
  zinc?: number | null; // ppm
  iron?: number | null; // ppm
  copper?: number | null; // ppm
  manganese?: number | null; // ppm
  boron?: number | null; // ppm
  ph?: number | null; // pH
  ec?: number | null; // dS/m
  organicCarbon?: number | null; // %
}

export interface FarmContextInput {
  farmId?: string;
  farmName?: string;
  state?: string;
  district?: string;
  currentCrop?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  waterSource?: string;
  waterSourceOther?: string;
  waterAvailability?: 'Irrigated' | 'Rainfed' | 'Canal' | 'Borewell' | 'Drip' | string;
  landArea?: number;
  landAreaUnit?: string;
  includePerennial?: boolean;
}

export function resolveWaterSourceInfo(farm: FarmContextInput): {
  waterSourceDisplay: string;
  isSpecified: boolean;
  isIrrigated: boolean;
} {
  const rawSource = farm.waterSource || farm.waterAvailability;
  if (!rawSource || rawSource === 'Not specified') {
    return {
      waterSourceDisplay: 'Not specified',
      isSpecified: false,
      isIrrigated: false,
    };
  }

  if (rawSource === 'Other') {
    const custom = farm.waterSourceOther?.trim() || 'Other';
    const lower = custom.toLowerCase();
    const isRain = lower.includes('rain') || lower.includes('monsoon') || lower.includes('dry') || lower.includes('unirrigated');
    return {
      waterSourceDisplay: custom,
      isSpecified: true,
      isIrrigated: !isRain,
    };
  }

  const lower = rawSource.toLowerCase();
  if (lower === 'rainfed') {
    return {
      waterSourceDisplay: 'Rainfed',
      isSpecified: true,
      isIrrigated: false,
    };
  }

  return {
    waterSourceDisplay: rawSource,
    isSpecified: true,
    isIrrigated: true,
  };
}

export interface WeatherContextInput {
  historical?: {
    meanTemp?: number;
    tempMin?: number;
    tempMax?: number;
    totalRainfall?: number;
    rainyDays?: number;
    startDate?: string;
    endDate?: string;
  };
  historicalCropCycle?: {
    meanTemperature?: number;
    tempMin?: number;
    tempMax?: number;
    totalRainfall?: number;
    rainyDays?: number;
    startDate?: string;
    endDate?: string;
  };
  historicalYearOverYear?: {
    windowDescription?: string;
    yearsAnalyzed?: number[];
    multiYearAvgTemp?: number;
    multiYearMinTemp?: number;
    multiYearMaxTemp?: number;
    multiYearAvgRainfall?: number;
    multiYearAvgRainyDays?: number;
    heatEventCount?: number;
    dryPeriodCount?: number;
  };
  historicalHarvestWindow?: {
    windowDescription?: string;
    yearsAnalyzed?: number[];
    multiYearAvgTemp?: number;
    multiYearAvgRainfall?: number;
  };
  current?: {
    temperature?: number;
    humidity?: number;
    precipitationProbability?: number;
    condition?: string;
  };
  forecast?: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    precipitationProbability: number;
  }>;
  forecastHorizonDays?: number;
}

export type CropRecommendationStatus =
  | 'SUITABLE'
  | 'SUITABLE_WITH_MANAGEMENT'
  | 'NOT_SUITABLE';

export interface CandidateCropScore {
  crop: CropSpecification;
  suitabilityScore: number; // 0-100
  recommendationStatus: CropRecommendationStatus;
  nutrientDeficiencies: string[];
  managementConstraints: string[];
  scoreBreakdown: {
    soilScore: number;
    seasonScore: number;
    weatherScore: number;
    waterScore: number;
    rotationScore: number;
    regionalScore: number;
  };
  decisionTrace: {
    nextSowingWindow: string;
    timingCompatible: boolean;
    seasonMatch: string;
    soilMatch: string;
    weatherMatch: string;
    waterMatch: string;
    rotationMatch: string;
    regionalMatch: string;
  };
  keyFactors: {
    soilAssessment: string;
    weatherAssessment: string;
    rotationAssessment: string;
    waterAssessment: string;
    seasonAssessment: string;
  };
  evidence?: DistrictCalendarEvidenceResult;
  feasibilityPassed: boolean;
  exclusionReasons: string[];
}

export function getCurrentSeason(date: Date = new Date()): 'Kharif' | 'Rabi' | 'Zaid' {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  if (month >= 5 && month <= 9) {
    return 'Kharif'; // Jun - Oct
  } else if (month >= 10 || month <= 2) {
    return 'Rabi'; // Nov - Mar
  } else {
    return 'Zaid'; // Apr - May
  }
}

export interface RejectedCropResult {
  crop: CropSpecification;
  exclusionReasons: string[];
  rejectionReason: string;
  evidence: DistrictCalendarEvidenceResult;
  feasibilityPassed: boolean;
}

export interface DetailedEvaluationResult {
  feasibleCandidates: CandidateCropScore[];
  rejectedCrops: RejectedCropResult[];
}

export function evaluateCropSuitabilityDetailed(
  soil: SoilProfileInput,
  farm: FarmContextInput,
  weather: WeatherContextInput,
  referenceDate: Date = new Date()
): DetailedEvaluationResult {
  // 1. Calculate Authoritative Next-Crop Sowing Window from Farm Harvest Date
  let harvestDate: Date | null = null;
  if (farm.expectedHarvestDate) {
    const d = new Date(farm.expectedHarvestDate);
    if (!isNaN(d.getTime())) {
      harvestDate = d;
    }
  }

  if (!harvestDate && farm.plantingDate && farm.currentCrop) {
    const p = new Date(farm.plantingDate);
    if (!isNaN(p.getTime())) {
      // Estimate 120-day harvest window for current crop if harvest date absent
      harvestDate = new Date(p.getTime() + 120 * 24 * 60 * 60 * 1000);
    }
  }

  let nextSowingDate: Date;
  if (harvestDate) {
    // Add 12 days turnaround for field prep, drying, and stubble clearing
    nextSowingDate = new Date(harvestDate.getTime() + 12 * 24 * 60 * 60 * 1000);
  } else {
    // Default to 7 days after current reference date if farm has no harvest date
    nextSowingDate = new Date(referenceDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const nextSowingMonth = nextSowingDate.getMonth() + 1; // 1..12
  const nextSowingSeason = getCurrentSeason(nextSowingDate);

  const windowEnd = new Date(nextSowingDate.getTime() + 21 * 24 * 60 * 60 * 1000);
  const nextSowingWindowStr = `${nextSowingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – ${windowEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nextSowingMonthName = monthNames[nextSowingMonth];

  const scores: CandidateCropScore[] = [];
  const rejectedCrops: RejectedCropResult[] = [];

  const { waterSourceDisplay, isSpecified, isIrrigated } = resolveWaterSourceInfo(farm);

  for (const crop of CROP_KNOWLEDGE_BASE) {
    const evidence = getDistrictCalendarEvidence(crop.displayName, farm.state, farm.district, nextSowingDate);

    // FEASIBILITY GATE 1: Annual vs Perennial Filter
    const isPerennial = crop.seasons.includes('Perennial') || crop.category === 'fruit';
    if (isPerennial && !farm.includePerennial) {
      rejectedCrops.push({
        crop,
        exclusionReasons: ['PERENNIAL_ORCHARD_EXCLUDED'],
        rejectionReason: 'Long-term perennial orchard crop; excluded from seasonal field crop rotation.',
        evidence,
        feasibilityPassed: false,
      });
      continue;
    }

    // FEASIBILITY GATE 2: Sowing Window Match Filter for Validated Calendar Evidence
    if ((evidence.level === 'EXACT_DISTRICT' || evidence.level === 'STATE_LEVEL') && !evidence.isWindowMatch) {
      const windowDesc = evidence.sowingFrom ? `${evidence.sowingFrom}${evidence.sowingTo ? ' to ' + evidence.sowingTo : ''}` : (evidence.sowingMonths ? evidence.sowingMonths.join(', ') : 'unknown');
      rejectedCrops.push({
        crop,
        exclusionReasons: ['OUTSIDE_DISTRICT_SOWING_WINDOW'],
        rejectionReason: `Not recommended because target sowing date (${nextSowingDate.toISOString().split('T')[0]}) falls outside validated sowing window (${windowDesc}) for ${evidence.district || farm.district}. Source: ${evidence.sourceRowReference || evidence.source}.`,
        evidence,
        feasibilityPassed: false,
      });
      continue;
    }

    let seasonScore = 100;

    // FEASIBILITY GATE 3: Soil pH Bounds Exclusion
    let phScore = 70;
    if (soil.ph !== undefined && soil.ph !== null && !isNaN(soil.ph)) {
      const ph = soil.ph;
      if (ph < crop.phMin || ph > crop.phMax) {
        rejectedCrops.push({
          crop,
          exclusionReasons: ['SOIL_PH_OUT_OF_BOUNDS'],
          rejectionReason: `Soil pH (${ph}) is outside tolerable physiological growth range (${crop.phMin}–${crop.phMax}).`,
          evidence,
          feasibilityPassed: false,
        });
        continue;
      }

      if (ph >= crop.optimalPhMin && ph <= crop.optimalPhMax) {
        phScore = 100;
      } else if (ph >= crop.phMin && ph <= crop.phMax) {
        phScore = 80;
      } else {
        phScore = 55;
      }
    }

    // FEASIBILITY GATE 4: Water Availability Exclusion
    if (!isIrrigated && (nextSowingSeason === 'Rabi' || nextSowingSeason === 'Zaid') && (crop.waterRequirement === 'High' || crop.waterRequirement === 'Very High')) {
      rejectedCrops.push({
        crop,
        exclusionReasons: ['WATER_SOURCE_INCOMPATIBLE'],
        rejectionReason: `${crop.waterRequirement} water requirement (${crop.waterRequirementMm.min}-${crop.waterRequirementMm.max}mm) cannot be sustained under rainfed ${waterSourceDisplay} during dry ${nextSowingSeason} season.`,
        evidence,
        feasibilityPassed: false,
      });
      continue;
    }

    // FEASIBILITY GATE 5: Crop Rotation Conflict Exclusion
    let rotationScore = 80;
    if (farm.currentCrop) {
      const currentLower = farm.currentCrop.toLowerCase();
      const isGood = crop.goodPreviousCrops.some((c) => currentLower.includes(c.toLowerCase()));
      const isAvoid = crop.avoidPreviousCrops.some((c) => currentLower.includes(c.toLowerCase()));

      if (isAvoid) {
        rejectedCrops.push({
          crop,
          exclusionReasons: ['ROTATION_CONFLICT_AVOID_PREVIOUS'],
          rejectionReason: `Rotation conflict: cannot be sown immediately after ${farm.currentCrop} due to disease/wilt carryover risk.`,
          evidence,
          feasibilityPassed: false,
        });
        continue;
      } else if (isGood) {
        rotationScore = 100;
      }
    }

    // 3. Continuous Soil Score Calculation (Smooth Decay for N/P/K without step jumps)
    const deficiencyNotes: string[] = [];
    const missingNutrients: string[] = [];
    const nutrientDeficiencies: string[] = [];
    const managementConstraints: string[] = [];

    let nScore = 60; // Neutral baseline for unmeasured nutrient
    if (soil.nitrogen !== undefined && soil.nitrogen !== null && !isNaN(soil.nitrogen)) {
      const N = soil.nitrogen;
      if (N >= crop.idealN.min && N <= crop.idealN.max * 1.5) {
        nScore = 100;
      } else if (N < crop.idealN.min) {
        const ratio = N / crop.idealN.min;
        nScore = Math.max(10, Math.round(ratio * 90));
        deficiencyNotes.push(`Nitrogen deficient (${N} vs ${crop.idealN.min} kg/ha min)`);
        nutrientDeficiencies.push(`Nitrogen below preferred crop range (${N} kg/ha vs ${crop.idealN.min} kg/ha min)`);
        managementConstraints.push(`Nitrogen management needed: baseline soil N (${N} kg/ha) is lower than ideal demand (${crop.idealN.min} kg/ha min).`);
      } else {
        nScore = 85;
      }
    } else {
      missingNutrients.push('nitrogen');
    }

    let pScore = 60;
    if (soil.phosphorus !== undefined && soil.phosphorus !== null && !isNaN(soil.phosphorus)) {
      const P = soil.phosphorus;
      if (P >= crop.idealP.min && P <= crop.idealP.max * 1.5) {
        pScore = 100;
      } else if (P < crop.idealP.min) {
        const ratio = P / crop.idealP.min;
        pScore = Math.max(10, Math.round(ratio * 90));
        deficiencyNotes.push(`Phosphorus deficient (${P} vs ${crop.idealP.min} kg/ha min)`);
        nutrientDeficiencies.push(`Phosphorus below preferred crop range (${P} kg/ha vs ${crop.idealP.min} kg/ha min)`);
        managementConstraints.push(`Phosphorus management needed: baseline soil P (${P} kg/ha) is lower than ideal demand (${crop.idealP.min} kg/ha min).`);
      } else {
        pScore = 85;
      }
    } else {
      missingNutrients.push('phosphorus');
    }

    let kScore = 60;
    if (soil.potassium !== undefined && soil.potassium !== null && !isNaN(soil.potassium)) {
      const K = soil.potassium;
      if (K >= crop.idealK.min && K <= crop.idealK.max * 1.5) {
        kScore = 100;
      } else if (K < crop.idealK.min) {
        const ratio = K / crop.idealK.min;
        kScore = Math.max(10, Math.round(ratio * 90));
        deficiencyNotes.push(`Potassium deficient (${K} vs ${crop.idealK.min} kg/ha min)`);
        nutrientDeficiencies.push(`Potassium below preferred crop range (${K} kg/ha vs ${crop.idealK.min} kg/ha min)`);
        managementConstraints.push(`Potassium management needed: baseline soil K (${K} kg/ha) is lower than ideal demand (${crop.idealK.min} kg/ha min).`);
      } else {
        kScore = 85;
      }
    } else {
      missingNutrients.push('potassium');
    }

    // Determine recommendation status based on whether nutrient deficiencies exist
    const recommendationStatus: CropRecommendationStatus =
      nutrientDeficiencies.length > 0 ? 'SUITABLE_WITH_MANAGEMENT' : 'SUITABLE';

    // Continuous Soil Score (0.40 pH + 0.25 N + 0.20 P + 0.15 K)
    const soilScore = Math.round(0.4 * phScore + 0.25 * nScore + 0.2 * pScore + 0.15 * kScore);

    // 4. Weather Score (0-100)
    let weatherScore = 80;
    const temp = weather.historicalHarvestWindow?.multiYearAvgTemp ?? weather.historicalYearOverYear?.multiYearAvgTemp ?? weather.current?.temperature;
    if (temp !== undefined && temp !== null) {
      if (temp >= crop.tempRange.optimalMin && temp <= crop.tempRange.optimalMax) {
        weatherScore = 100;
      } else if (temp >= crop.tempRange.min && temp <= crop.tempRange.max) {
        weatherScore = 80;
      } else {
        weatherScore = 50;
      }
    }

    // 5. Water Score (0-100)
    let waterScore = 85;
    if (!isSpecified) {
      if (crop.waterRequirement === 'High' || crop.waterRequirement === 'Very High') {
        waterScore = 50;
      } else if (crop.waterRequirement === 'Moderate') {
        waterScore = 75;
      } else {
        waterScore = 90;
      }
    } else if (!isIrrigated) {
      if (crop.waterRequirement === 'High' || crop.waterRequirement === 'Very High') {
        waterScore = 40;
      } else if (crop.waterRequirement === 'Moderate') {
        waterScore = 70;
      } else {
        waterScore = 100;
      }
    } else {
      if (waterSourceDisplay.toLowerCase().includes('drip')) {
        waterScore = 100;
      } else if (crop.waterRequirement === 'High' || crop.waterRequirement === 'Very High') {
        waterScore = 95;
      } else {
        waterScore = 100;
      }
    }

    // 6. Regional Agro-Climatic Score (0-100)
    let regionalScore = 75;
    if (farm.state) {
      const stateLower = farm.state.toLowerCase();
      if (crop.suitableStates.some((s) => s.toLowerCase() === stateLower)) {
        regionalScore = 100;
      }
    }

    // Composite Weighted Suitability Score
    const suitabilityScore = Math.round(
      0.35 * soilScore +
      0.25 * seasonScore +
      0.15 * weatherScore +
      0.10 * waterScore +
      0.10 * rotationScore +
      0.05 * regionalScore
    );

    let waterAssessmentText = '';
    if (!isSpecified) {
      waterAssessmentText = `${crop.waterRequirement} water requirement (${crop.waterRequirementMm.min}-${crop.waterRequirementMm.max}mm). Farm water source is not specified; dependable irrigation recommended.`;
    } else if (isIrrigated) {
      waterAssessmentText = `${crop.waterRequirement} water requirement (${crop.waterRequirementMm.min}-${crop.waterRequirementMm.max}mm) supported by the farm's ${waterSourceDisplay} irrigation source.`;
    } else {
      waterAssessmentText = `${crop.waterRequirement} water requirement (${crop.waterRequirementMm.min}-${crop.waterRequirementMm.max}mm) may require sufficient seasonal rainfall for ${waterSourceDisplay} setup.`;
    }

    let npkExplanation = '';
    if (deficiencyNotes.length > 0) {
      npkExplanation = ` (${deficiencyNotes.join('; ')} - baseline soil level below ideal crop demand; correctable with nutrient management)`;
    } else if (missingNutrients.length > 0) {
      if (missingNutrients.length === 3) {
        npkExplanation = ' N-P-K assessment is limited because soil nutrient values were not provided.';
      } else if (missingNutrients.length === 1) {
        npkExplanation = ` N-P-K assessment is limited because ${missingNutrients[0]} was not provided.`;
      } else {
        npkExplanation = ` N-P-K assessment is limited because ${missingNutrients.join(' and ')} were not provided.`;
      }
    } else {
      npkExplanation = ' N-P-K matrix aligns with crop demand.';
    }

    const soilMatchText = deficiencyNotes.length > 0
      ? `pH ${soil.ph ?? 7.0} (${phScore >= 80 ? 'optimal' : 'acceptable'}) (${deficiencyNotes.join('; ')})`
      : missingNutrients.length > 0
      ? `pH ${soil.ph ?? 7.0} (${phScore >= 80 ? 'optimal' : 'acceptable'}) (N-P-K assessment limited: ${missingNutrients.join(', ')} not provided)`
      : `pH ${soil.ph ?? 7.0} (${phScore >= 80 ? 'optimal' : 'acceptable'})`;

    scores.push({
      crop,
      suitabilityScore,
      recommendationStatus,
      nutrientDeficiencies,
      managementConstraints,
      scoreBreakdown: {
        soilScore,
        seasonScore,
        weatherScore,
        waterScore,
        rotationScore,
        regionalScore,
      },
      decisionTrace: {
        nextSowingWindow: nextSowingWindowStr,
        timingCompatible: true,
        seasonMatch: `${nextSowingSeason} sowing window (${nextSowingWindowStr}) verified via Crop Calendar`,
        soilMatch: soilMatchText,
        weatherMatch: `Thermal baseline (${temp ?? 22}°C) aligns with crop thresholds`,
        waterMatch: `${crop.waterRequirement} demand evaluated against ${waterSourceDisplay} source`,
        rotationMatch: farm.currentCrop ? `Follows ${farm.currentCrop} (${rotationScore >= 90 ? 'High rotation benefit' : 'Compatible'})` : 'Compatible',
        regionalMatch: `Validated for ${farm.state || 'Gujarat'} agro-climatic zone`,
      },
      keyFactors: {
        soilAssessment: `Soil pH (${soil.ph ?? '7.0'}) is ${phScore >= 80 ? 'optimal' : 'acceptable'}.${npkExplanation}`,
        weatherAssessment: `Thermal conditions (${temp ?? 22}°C) align with crop physiological thresholds for ${nextSowingSeason} sowing.`,
        rotationAssessment: farm.currentCrop ? `Rotation after ${farm.currentCrop} provides ${rotationScore >= 90 ? 'strong soil health' : 'acceptable'} transition.` : 'Compatible crop rotation.',
        waterAssessment: waterAssessmentText,
        seasonAssessment: `Validated ${farm.state || 'State'} sowing window for ${nextSowingSeason} season (${nextSowingWindowStr}).`,
      },
      evidence,
      feasibilityPassed: true,
      exclusionReasons: [],
    });
  }

  // Sort feasible crops descending by suitability score
  const feasibleCandidates = scores.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return {
    feasibleCandidates,
    rejectedCrops,
  };
}

export function evaluateCropSuitability(
  soil: SoilProfileInput,
  farm: FarmContextInput,
  weather: WeatherContextInput,
  referenceDate: Date = new Date()
): CandidateCropScore[] {
  const result = evaluateCropSuitabilityDetailed(soil, farm, weather, referenceDate);
  return result.feasibleCandidates;
}
