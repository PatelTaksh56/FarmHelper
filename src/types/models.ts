/**
 * FarmHelper TypeScript Data Models & Firestore Schemas
 */

export interface UserProfile {
  uid: string;
  fullName: string;
  email?: string | null;
  mobileNumber?: string | null;
  photoURL?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

import { AppLanguage } from '../i18n/languages';

export interface UserSettings {
  preferredLanguage: AppLanguage | string;
  landAreaUnit: 'Acre' | 'Hectare' | 'Bigha';
  weightUnit: 'Quintal' | 'Kg' | 'Tonne';
  temperatureScale: 'Celsius' | 'Fahrenheit';
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationEmail?: string | null;
}

export interface FarmBoundaryPoint {
  lat: number;
  lng: number;
}

export type WaterSource =
  | 'Rainfed'
  | 'Borewell'
  | 'Canal'
  | 'Drip Irrigation'
  | 'Well'
  | 'River'
  | 'Farm Pond'
  | 'Other';

export const WATER_SOURCE_OPTIONS: WaterSource[] = [
  'Rainfed',
  'Borewell',
  'Canal',
  'Drip Irrigation',
  'Well',
  'River',
  'Farm Pond',
  'Other',
];

export interface Farm {
  id?: string;
  userId: string;
  farmName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  landArea: number;
  landAreaUnit: 'Acre' | 'Hectare' | 'Bigha';
  boundary?: FarmBoundaryPoint[];
  center?: {
    lat: number;
    lng: number;
  };
  areaSquareMeters?: number;
  areaAcres?: number;
  areaHectares?: number;
  currentCrop?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  status?: 'Active' | 'Fallow' | 'Harvested';
  waterSource?: WaterSource;
  waterSourceOther?: string;
  waterAvailability?: 'Irrigated' | 'Rainfed' | 'Canal' | 'Borewell' | 'Drip' | string;
  state?: string;
  district?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CropDoctorDiagnosisResult {
  diagnosis: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'high' | 'unknown';
  observedSymptoms: string[];
  possibleCauses: string[];
  treatment: string[];
  prevention: string[];
  expertConfirmationRecommended: boolean;
}

export interface CropDoctorRecord {
  id?: string;
  userId: string;
  crop: string;
  imagePath?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  diagnosis: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'high' | 'unknown';
  observedSymptoms: string[];
  possibleCauses: string[];
  treatment: string[];
  prevention: string[];
  expertConfirmationRecommended: boolean;
  createdAt?: any;
}

export interface CropAdvisorRecord {
  id?: string;
  userId: string;
  farmId?: string | null;
  soilMetrics?: {
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    ph?: number;
    electricalConductivity?: number;
    organicCarbon?: number;
  };
  soilReportFileUrl?: string | null;
  soilReportStoragePath?: string | null;
  recommendedCrops: Array<{
    cropName: string;
    suitabilityScore: number;
    season: string;
    reasoning: string;
  }>;
  soilAdvisory?: string;
  createdAt?: any;
}

export interface MarketPrice {
  id?: string;
  commodity: string;
  market: string;
  district: string;
  state: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  dataSource: string;
  lastUpdated: string;
}

export interface GovernmentScheme {
  id: string;
  schemeName: string;
  description: string;
  launchDate?: string;
  administeringAgency: string;
  eligibility: string[];
  benefits: string[];
  officialUrl: string;
  category: string;
}

export interface NotificationItem {
  id?: string;
  userId: string;
  type: 'WEATHER_ALERT' | 'CROP_HEALTH' | 'HARVEST_REMINDER' | 'SCHEME_UPDATE';
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: any;
}
