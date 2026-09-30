/**
 * Farm Agronomic Context Builder
 * Assembles validated factual agricultural data from FarmHelper engine into a single structured payload for Gemini AI reasoning.
 */

import { SoilProfileInput, FarmContextInput, WeatherContextInput, DetailedEvaluationResult, resolveWaterSourceInfo } from './cropSuitabilityEngine';
import { CROP_KNOWLEDGE_BASE, CropSpecification } from '../data/cropKnowledge';
import { getDistrictCalendarEvidence } from '../data/cropCalendarData';
import { getRegionalCropHistory } from '../data/historicalCropSummary';

export interface FarmAgronomicContext {
  farm: {
    farmId: string | null;
    farmName: string;
    state: string;
    district: string;
    taluka: string | null;
    village: string | null;
    latitude: number | null;
    longitude: number | null;
    agroClimaticZone: string | null;
  };
  location: {
    state: string;
    district: string;
    taluka: string | null;
    village: string | null;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  currentCrop: {
    name: string | null;
    previousCrop: string | null;
    sowingDate: string | null;
    expectedHarvestDate: string | null;
    targetNextPlantingDate: string;
    cropDurationDays: number | null;
    cropRotationInfo: string;
  };
  soil: {
    N: number | null;
    P: number | null;
    K: number | null;
    S: number | null;
    Zn: number | null;
    Fe: number | null;
    B: number | null;
    Mn: number | null;
    Cu: number | null;
    pH: number | null;
    EC: number | null;
    OC: number | null;
  };
  water: {
    waterSourceDisplay: string;
    isIrrigated: boolean;
    waterAvailability: string;
  };
  currentWeather: any | null;
  historicalWeather: any | null;
  futureWeather: any | null;
  cropRequirements: Array<{
    cropId: string;
    displayName: string;
    scientificName: string;
    phMin: number;
    phMax: number;
    optimalPhMin: number;
    optimalPhMax: number;
    idealN: { min: number; max: number };
    idealP: { min: number; max: number };
    idealK: { min: number; max: number };
    tempRange: { min: number; max: number; optimalMin: number; optimalMax: number };
    waterRequirement: string;
    waterRequirementMm: { min: number; max: number };
    durationDays: { min: number; max: number };
    seasons: string[];
    sowingMonths: number[];
  }>;
  districtCropCalendar: Array<{
    crop: string;
    district?: string;
    state?: string;
    evidenceLevel: string;
    sowingWindow?: string;
    sourceRef?: string;
  }>;
  regionalCropHistory: Array<{
    crop: string;
    evidenceLevel: string;
    yearsObserved: number | null;
    observationCount: number | null;
    summaryNote: string;
  }>;
  cropRotation: {
    currentCrop: string | null;
    goodNextCrops: string[];
    avoidNextCrops: string[];
  };
  deterministicEvidence: any;
  deterministicAudit: {
    totalEvaluated: number;
    feasibleCount: number;
    rejectedCount: number;
    rejectionReasonsBreakdown: Record<string, number>;
  };
}

export function buildFarmAgronomicContext(
  soilInput: SoilProfileInput,
  farmInput: FarmContextInput,
  weatherInput: WeatherContextInput,
  evaluationResult: DetailedEvaluationResult,
  targetSowingDateStr: string
): FarmAgronomicContext {
  const { waterSourceDisplay, isIrrigated } = resolveWaterSourceInfo(farmInput);

  const soil = {
    N: soilInput.nitrogen ?? null,
    P: soilInput.phosphorus ?? null,
    K: soilInput.potassium ?? null,
    S: soilInput.sulphur ?? null,
    Zn: soilInput.zinc ?? null,
    Fe: soilInput.iron ?? null,
    B: soilInput.boron ?? null,
    Mn: soilInput.manganese ?? null,
    Cu: soilInput.copper ?? null,
    pH: soilInput.ph ?? null,
    EC: soilInput.ec ?? null,
    OC: soilInput.organicCarbon ?? null,
  };

  const state = farmInput.state || 'Gujarat';
  const district = farmInput.district || 'Ahmedabad';

  const candidateCrops = evaluationResult.feasibleCandidates.length > 0
    ? evaluationResult.feasibleCandidates.map((c) => c.crop)
    : CROP_KNOWLEDGE_BASE;

  const cropRequirements = candidateCrops.map((c) => ({
    cropId: c.cropId,
    displayName: c.displayName,
    scientificName: c.scientificName,
    phMin: c.phMin,
    phMax: c.phMax,
    optimalPhMin: c.optimalPhMin,
    optimalPhMax: c.optimalPhMax,
    idealN: c.idealN,
    idealP: c.idealP,
    idealK: c.idealK,
    tempRange: c.tempRange,
    waterRequirement: c.waterRequirement,
    waterRequirementMm: c.waterRequirementMm,
    durationDays: c.durationDays,
    seasons: c.seasons,
    sowingMonths: c.sowingMonths,
  }));

  const targetDateObj = new Date(targetSowingDateStr);
  const districtCropCalendar = candidateCrops.map((c) => {
    const ev = getDistrictCalendarEvidence(c.displayName, state, district, targetDateObj);
    return {
      crop: c.displayName,
      district: ev.district || district,
      state: ev.state || state,
      evidenceLevel: ev.level,
      sowingWindow: ev.sowingFrom ? `${ev.sowingFrom} - ${ev.sowingTo}` : undefined,
      sourceRef: ev.sourceRowReference || ev.source,
    };
  });

  const regionalCropHistory = candidateCrops.map((c) => {
    return getRegionalCropHistory(c.displayName, state, district);
  });

  const rejectionReasonsBreakdown: Record<string, number> = {};
  for (const r of evaluationResult.rejectedCrops) {
    for (const reason of r.exclusionReasons) {
      rejectionReasonsBreakdown[reason] = (rejectionReasonsBreakdown[reason] || 0) + 1;
    }
  }

  let goodNextCrops: string[] = [];
  let avoidNextCrops: string[] = [];
  if (farmInput.currentCrop) {
    const curr = farmInput.currentCrop.toLowerCase();
    for (const c of CROP_KNOWLEDGE_BASE) {
      if (c.goodPreviousCrops.some((g) => curr.includes(g.toLowerCase()))) {
        goodNextCrops.push(c.displayName);
      }
      if (c.avoidPreviousCrops.some((a) => curr.includes(a.toLowerCase()))) {
        avoidNextCrops.push(c.displayName);
      }
    }
  }

  return {
    farm: {
      farmId: farmInput.farmId || null,
      farmName: farmInput.farmName || 'Farm Plot',
      state,
      district,
      taluka: null,
      village: null,
      latitude: null,
      longitude: null,
      agroClimaticZone: null,
    },
    location: {
      state,
      district,
      taluka: null,
      village: null,
      coordinates: {
        latitude: null,
        longitude: null,
      },
    },
    currentCrop: {
      name: farmInput.currentCrop || null,
      previousCrop: null,
      sowingDate: farmInput.plantingDate || null,
      expectedHarvestDate: farmInput.expectedHarvestDate || null,
      targetNextPlantingDate: targetSowingDateStr,
      cropDurationDays: null,
      cropRotationInfo: farmInput.currentCrop ? `Currently growing ${farmInput.currentCrop}` : 'Field is currently fallow',
    },
    soil,
    water: {
      waterSourceDisplay,
      isIrrigated,
      waterAvailability: farmInput.waterAvailability || waterSourceDisplay,
    },
    currentWeather: weatherInput.current || null,
    historicalWeather: weatherInput.historicalYearOverYear || weatherInput.historicalCropCycle || null,
    futureWeather: weatherInput.forecast || null,
    cropRequirements,
    districtCropCalendar,
    regionalCropHistory,
    cropRotation: {
      currentCrop: farmInput.currentCrop || null,
      goodNextCrops,
      avoidNextCrops,
    },
    deterministicEvidence: evaluationResult.feasibleCandidates.map((fc) => ({
      cropName: fc.crop.displayName,
      suitabilityScore: fc.suitabilityScore,
      recommendationStatus: fc.recommendationStatus,
      evidenceLevel: fc.evidence?.level || 'GENERAL_CROP_KNOWLEDGE',
      nutrientDeficiencies: fc.nutrientDeficiencies,
      managementConstraints: fc.managementConstraints,
    })),
    deterministicAudit: {
      totalEvaluated: CROP_KNOWLEDGE_BASE.length,
      feasibleCount: evaluationResult.feasibleCandidates.length,
      rejectedCount: evaluationResult.rejectedCrops.length,
      rejectionReasonsBreakdown,
    },
  };
}
