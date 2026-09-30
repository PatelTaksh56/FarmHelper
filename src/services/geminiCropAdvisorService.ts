/**
 * Gemini Crop Advisor Backend Service Client
 * Securely communicates with Firebase backend for Gemini AI explanations.
 * Secrets are strictly isolated on the server side.
 */

import { auth } from '../config/firebase';

export interface CropAdvisorGeminiCandidateInput {
  cropId: string;
  cropName: string;
  scientificName: string;
  suitabilityScore: number;
  recommendationStatus?: 'SUITABLE' | 'SUITABLE_WITH_MANAGEMENT' | 'NOT_SUITABLE';
  nutrientDeficiencies?: string[];
  managementConstraints?: string[];
  calendarEvidence: {
    level: 'EXACT_DISTRICT' | 'STATE_LEVEL' | 'REGIONAL' | 'GENERAL_CROP_KNOWLEDGE' | 'AI_EXPLORATION' | 'NO_EVIDENCE' | string;
    state?: string;
    district?: string;
    season?: string;
    sowingFrom?: string;
    sowingTo?: string;
    evidencePrecision?: 'MONTH' | 'DATE_RANGE';
    source?: string;
    sourceRowReference?: string;
  };
  scoreBreakdown: {
    soilScore: number;
    seasonScore: number;
    weatherScore: number;
    waterScore: number;
    rotationScore: number;
    regionalScore: number;
  };
  soilAssessment?: string;
  waterAssessment?: string;
  rotationAssessment?: string;
  weatherAssessment?: string;
  seasonAssessment?: string;
}

export type CropAdvisorMode = 'VALIDATED_RECOMMENDATION' | 'AGRONOMIC_EXPLORATION';

export interface CropAdvisorGeminiRequest {
  mode?: CropAdvisorMode;
  farmAgronomicContext?: unknown;
  farm: {
    farmId?: string;
    farmName?: string;
    locationName?: string;
    district: string;
    state: string;
    currentCrop?: string;
    plantingDate?: string;
    expectedHarvestDate?: string;
    targetSowingDate: string;
    waterSource?: string;
    waterSourceOther?: string;
  };
  soil: {
    nitrogen?: number | null;
    phosphorus?: number | null;
    potassium?: number | null;
    ph?: number | null;
    sulphur?: number | null;
    zinc?: number | null;
    iron?: number | null;
    copper?: number | null;
    manganese?: number | null;
    boron?: number | null;
    ec?: number | null;
    organicCarbon?: number | null;
  };
  weather?: {
    current?: unknown;
    forecast?: unknown;
    historicalCropCycle?: unknown;
    historicalYearOverYear?: unknown;
    historicalHarvestWindow?: unknown;
  };
  candidates: CropAdvisorGeminiCandidateInput[];
  deterministicAudit?: {
    totalCropsEvaluated: number;
    outsideWindowCount?: number;
    noDistrictEvidenceCount?: number;
    rotationConflictCount?: number;
    perennialCount?: number;
    phCount?: number;
    waterCount?: number;
  };
  preferredLanguage?: string;
}

export interface CropAdvisorGeminiRecommendation {
  cropId?: string;
  cropName: string;
  whySuitable?: string;
  explanation?: string;
  recommendationStatus?: 'SUITABLE' | 'SUITABLE_WITH_MANAGEMENT' | 'POTENTIAL_AI_CANDIDATE';
  evidenceLevel?: string;
  soilAssessment: string;
  waterAssessment: string;
  rotationAssessment?: string;
  weatherAssessment: string;
  plantingWindowAssessment?: string;
  nutrientDeficiencies?: string[];
  nutrientConsiderations?: string[];
  managementConstraints?: string[];
  managementRequirements?: string[];
  managementActions?: string[];
  nutrientAdvice?: string[];
  keyRisks?: string[];
  reasons?: string[];
  limitations?: string[];
  uncertainties?: string[];
  confidenceExplanation?: string;
}

export interface GeminiExplorationCrop {
  cropName: string;
  aiPotential: 'HIGH' | 'MEDIUM' | 'LOW';
  whyItMayFit: string;
  soilAssessment: string;
  weatherAssessment: string;
  waterAssessment: string;
  rotationAssessment: string;
  plantingWindowAssessment: string;
  nutrientConsiderations: string[];
  keyRisks: string[];
  uncertainties: string[];
  confidenceExplanation: string;
  validationStatus: 'AI_DERIVED_NOT_DISTRICT_VALIDATED';
}

export interface CropAdvisorGeminiResponse {
  mode?: CropAdvisorMode;
  overallSummary?: string;
  summary?: string;
  recommendations?: CropAdvisorGeminiRecommendation[];
  recommendedCrops?: CropAdvisorGeminiRecommendation[];
  potentialCrops?: GeminiExplorationCrop[];
  generalAdvice?: string[];
  limitations?: string[];
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
 * Invoke Firebase Backend Callable / REST Endpoint for Gemini AI Explanations
 */
export async function generateCropAdvisorInsights(
  requestPayload: CropAdvisorGeminiRequest
): Promise<CropAdvisorGeminiResponse> {
  const currentUser = auth.currentUser;
  const idToken = currentUser ? await currentUser.getIdToken(true) : 'dev-token';
  const baseUrl = getBackendBaseUrl();
  const endpoint = `${baseUrl}/adviseCrop`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data: requestPayload }),
  });

  if (!response.ok) {
    let errorMsg = `Server returned HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch (_) {}
    throw new Error(`Firebase Gemini backend error: ${errorMsg}`);
  }

  const resJson = await response.json();
  const advisoryData = resJson.data || resJson;

  if (!advisoryData || typeof advisoryData !== 'object') {
    throw new Error('Invalid response structure returned from Gemini backend.');
  }

  return advisoryData as CropAdvisorGeminiResponse;
}
