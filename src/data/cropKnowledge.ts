/**
 * Authoritative Indian Agricultural Crop Knowledge Base
 * Automatically generated from crops/crop_knowledge.csv (51 official FarmHelper crops C001-C051).
 * Do NOT edit manually. Update crops/crop_knowledge.csv and run crops/generate_crop_knowledge_ts.py.
 */

export interface CropSpecification {
  cropId: string;
  displayName: string;
  scientificName: string;
  category: 'cereal' | 'pulse' | 'oilseed' | 'vegetable' | 'commercial' | 'fruit' | 'spice' | string;
  seasons: Array<'Kharif' | 'Rabi' | 'Zaid' | 'Perennial'>;
  sowingMonths: number[];
  phMin: number;
  phMax: number;
  optimalPhMin: number;
  optimalPhMax: number;
  ecMax?: number;
  ocMin?: number;
  idealN: { min: number; max: number };
  idealP: { min: number; max: number };
  idealK: { min: number; max: number };
  waterRequirement: 'Low' | 'Moderate' | 'High' | 'Very High' | string;
  waterRequirementMm: { min: number; max: number };
  tempRange: { min: number; max: number; optimalMin: number; optimalMax: number };
  durationDays: { min: number; max: number };
  goodPreviousCrops: string[];
  avoidPreviousCrops: string[];
  suitableStates: string[];
  sourceReference: string;
}

export const CROP_KNOWLEDGE_BASE: CropSpecification[] = [
  {
    "cropId": "C001",
    "displayName": "Barley",
    "scientificName": "Hordeum vulgare",
    "category": "cereal",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      10,
      11
    ],
    "phMin": 5.5,
    "phMax": 8.2,
    "optimalPhMin": 6.0,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 40.0,
      "max": 100.0
    },
    "idealP": {
      "min": 20.0,
      "max": 50.0
    },
    "idealK": {
      "min": 20.0,
      "max": 50.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 200.0,
      "max": 750.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 15.0,
      "optimalMax": 25.0,
      "max": 30.0
    },
    "durationDays": {
      "min": 120,
      "max": 150
    },
    "goodPreviousCrops": [
      "Maize",
      "Rice",
      "Cotton"
    ],
    "avoidPreviousCrops": [
      "Barley",
      "Wheat"
    ],
    "suitableStates": [
      "Rajasthan",
      "Haryana",
      "Punjab",
      "Uttar Pradesh",
      "Madhya Pradesh"
    ],
    "sourceReference": "Temperature, rainfall, and pH ranges integrated from ICAR-IIWBR package of practices and merged dataset."
  },
  {
    "cropId": "C002",
    "displayName": "Basmati Rice",
    "scientificName": "Oryza sativa var. basmati",
    "category": "cereal",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      6,
      7
    ],
    "phMin": 5.0,
    "phMax": 7.8,
    "optimalPhMin": 5.5,
    "optimalPhMax": 6.8,
    "idealN": {
      "min": 80.0,
      "max": 140.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 30.0,
      "max": 60.0
    },
    "waterRequirement": "Very High",
    "waterRequirementMm": {
      "min": 1000.0,
      "max": 1600.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 23.0,
      "optimalMax": 30.0,
      "max": 35.0
    },
    "durationDays": {
      "min": 135,
      "max": 168
    },
    "goodPreviousCrops": [
      "Chickpea",
      "Mustard",
      "Green Gram",
      "Wheat"
    ],
    "avoidPreviousCrops": [
      "Rice",
      "Basmati Rice"
    ],
    "suitableStates": [
      "Punjab",
      "Haryana",
      "Uttar Pradesh",
      "Uttarakhand",
      "Jammu and Kashmir"
    ],
    "sourceReference": "Basmati Rice requires high water and specific thermal window during flowering (ICAR-NRRI/IARI)."
  },
  {
    "cropId": "C003",
    "displayName": "Finger Millet",
    "scientificName": "Eleusine coracana",
    "category": "cereal",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      6,
      7
    ],
    "phMin": 5.0,
    "phMax": 8.2,
    "optimalPhMin": 5.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 40.0,
      "max": 80.0
    },
    "idealP": {
      "min": 20.0,
      "max": 50.0
    },
    "idealK": {
      "min": 20.0,
      "max": 45.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 400.0,
      "max": 1200.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 22.0,
      "optimalMax": 30.0,
      "max": 37.0
    },
    "durationDays": {
      "min": 110,
      "max": 137
    },
    "goodPreviousCrops": [
      "Groundnut",
      "Pigeon Pea",
      "Horse Gram"
    ],
    "avoidPreviousCrops": [
      "Finger Millet"
    ],
    "suitableStates": [
      "Karnataka",
      "Tamil Nadu",
      "Uttarakhand",
      "Maharashtra",
      "Andhra Pradesh"
    ],
    "sourceReference": "Finger millet (Ragi) is highly drought-tolerant with low moisture needs (ICAR-IIMR)."
  },
  {
    "cropId": "C004",
    "displayName": "Maize",
    "scientificName": "Zea mays",
    "category": "cereal",
    "seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "sowingMonths": [
      6,
      7,
      10,
      11,
      2,
      3
    ],
    "phMin": 5.5,
    "phMax": 8.0,
    "optimalPhMin": 6.2,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 80.0,
      "max": 150.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 30.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 500.0,
      "max": 1100.0
    },
    "tempRange": {
      "min": 15.0,
      "optimalMin": 21.0,
      "optimalMax": 30.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 105,
      "max": 131
    },
    "goodPreviousCrops": [
      "Chickpea",
      "Mustard",
      "Potato",
      "Green Gram"
    ],
    "avoidPreviousCrops": [
      "Maize",
      "Sorghum"
    ],
    "suitableStates": [
      "Karnataka",
      "Madhya Pradesh",
      "Maharashtra",
      "Bihar",
      "Rajasthan",
      "Gujarat",
      "Uttar Pradesh"
    ],
    "sourceReference": "ICAR-IIMR recommended NPK and growth duration parameters."
  },
  {
    "cropId": "C005",
    "displayName": "Pearl Millet",
    "scientificName": "Pennisetum glaucum",
    "category": "cereal",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      6,
      7
    ],
    "phMin": 5.5,
    "phMax": 8.5,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.8,
    "idealN": {
      "min": 40.0,
      "max": 100.0
    },
    "idealP": {
      "min": 20.0,
      "max": 50.0
    },
    "idealK": {
      "min": 20.0,
      "max": 50.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 250.0,
      "max": 900.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 25.0,
      "optimalMax": 34.0,
      "max": 42.0
    },
    "durationDays": {
      "min": 85,
      "max": 106
    },
    "goodPreviousCrops": [
      "Cluster Bean",
      "Moth Bean",
      "Chickpea"
    ],
    "avoidPreviousCrops": [
      "Pearl Millet"
    ],
    "suitableStates": [
      "Rajasthan",
      "Maharashtra",
      "Gujarat",
      "Haryana",
      "Uttar Pradesh"
    ],
    "sourceReference": "Pearl Millet (Bajra) is exceptionally heat and drought tolerant (ICAR-AICRPPM)."
  },
  {
    "cropId": "C006",
    "displayName": "Rice",
    "scientificName": "Oryza sativa",
    "category": "cereal",
    "seasons": [
      "Kharif",
      "Rabi"
    ],
    "sowingMonths": [
      6,
      7,
      11,
      12
    ],
    "phMin": 5.0,
    "phMax": 7.8,
    "optimalPhMin": 5.5,
    "optimalPhMax": 6.8,
    "idealN": {
      "min": 80.0,
      "max": 150.0
    },
    "idealP": {
      "min": 30.0,
      "max": 75.0
    },
    "idealK": {
      "min": 30.0,
      "max": 75.0
    },
    "waterRequirement": "Very High",
    "waterRequirementMm": {
      "min": 1000.0,
      "max": 2000.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 25.0,
      "optimalMax": 33.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 125,
      "max": 156
    },
    "goodPreviousCrops": [
      "Chickpea",
      "Mustard",
      "Green Gram",
      "Wheat"
    ],
    "avoidPreviousCrops": [
      "Rice"
    ],
    "suitableStates": [
      "West Bengal",
      "Punjab",
      "Uttar Pradesh",
      "Andhra Pradesh",
      "Tamil Nadu",
      "Odisha",
      "Gujarat"
    ],
    "sourceReference": "ICAR-NRRI standard rice recommendations for Kharif/Rabi."
  },
  {
    "cropId": "C007",
    "displayName": "Sorghum",
    "scientificName": "Sorghum bicolor",
    "category": "cereal",
    "seasons": [
      "Kharif",
      "Rabi"
    ],
    "sowingMonths": [
      6,
      7,
      10,
      11
    ],
    "phMin": 5.5,
    "phMax": 8.5,
    "optimalPhMin": 6.2,
    "optimalPhMax": 7.8,
    "idealN": {
      "min": 60.0,
      "max": 120.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 20.0,
      "max": 50.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 400.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 16.0,
      "optimalMin": 24.0,
      "optimalMax": 32.0,
      "max": 40.0
    },
    "durationDays": {
      "min": 110,
      "max": 137
    },
    "goodPreviousCrops": [
      "Chickpea",
      "Soya Bean",
      "Groundnut"
    ],
    "avoidPreviousCrops": [
      "Sorghum",
      "Maize"
    ],
    "suitableStates": [
      "Maharashtra",
      "Karnataka",
      "Rajasthan",
      "Madhya Pradesh",
      "Andhra Pradesh"
    ],
    "sourceReference": "Sorghum (Jowar) ICAR-IIMR agronomic reference."
  },
  {
    "cropId": "C008",
    "displayName": "Wheat",
    "scientificName": "Triticum aestivum",
    "category": "cereal",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      11,
      12,
      1
    ],
    "phMin": 6.0,
    "phMax": 8.4,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 100.0,
      "max": 160.0
    },
    "idealP": {
      "min": 40.0,
      "max": 75.0
    },
    "idealK": {
      "min": 30.0,
      "max": 75.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 350.0,
      "max": 900.0
    },
    "tempRange": {
      "min": 5.0,
      "optimalMin": 15.0,
      "optimalMax": 23.0,
      "max": 32.0
    },
    "durationDays": {
      "min": 130,
      "max": 162
    },
    "goodPreviousCrops": [
      "Rice",
      "Maize",
      "Cotton",
      "Soybean",
      "Green Gram"
    ],
    "avoidPreviousCrops": [
      "Wheat",
      "Barley"
    ],
    "suitableStates": [
      "Punjab",
      "Haryana",
      "Uttar Pradesh",
      "Madhya Pradesh",
      "Rajasthan",
      "Gujarat",
      "Bihar"
    ],
    "sourceReference": "ICAR-IIWBR Rabi wheat specification."
  },
  {
    "cropId": "C009",
    "displayName": "Black Gram",
    "scientificName": "Vigna mungo",
    "category": "pulse",
    "seasons": [
      "Kharif",
      "Zaid"
    ],
    "sowingMonths": [
      6,
      7,
      3,
      4
    ],
    "phMin": 6.0,
    "phMax": 8.2,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.8,
    "idealN": {
      "min": 15.0,
      "max": 35.0
    },
    "idealP": {
      "min": 40.0,
      "max": 75.0
    },
    "idealK": {
      "min": 20.0,
      "max": 50.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 450.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 22.0,
      "optimalMin": 25.0,
      "optimalMax": 33.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 80,
      "max": 100
    },
    "goodPreviousCrops": [
      "Wheat",
      "Mustard",
      "Rice"
    ],
    "avoidPreviousCrops": [
      "Black Gram",
      "Green Gram"
    ],
    "suitableStates": [
      "Madhya Pradesh",
      "Uttar Pradesh",
      "Andhra Pradesh",
      "Tamil Nadu",
      "Maharashtra"
    ],
    "sourceReference": "Black Gram (Urad) pulse crop specifications (ICAR-IIPR)."
  },
  {
    "cropId": "C010",
    "displayName": "Chickpea",
    "scientificName": "Cicer arietinum",
    "category": "pulse",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      10,
      11,
      12
    ],
    "phMin": 6.0,
    "phMax": 8.5,
    "optimalPhMin": 6.8,
    "optimalPhMax": 7.8,
    "idealN": {
      "min": 15.0,
      "max": 40.0
    },
    "idealP": {
      "min": 30.0,
      "max": 75.0
    },
    "idealK": {
      "min": 20.0,
      "max": 50.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 300.0,
      "max": 800.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 18.0,
      "optimalMax": 26.0,
      "max": 33.0
    },
    "durationDays": {
      "min": 110,
      "max": 137
    },
    "goodPreviousCrops": [
      "Rice",
      "Maize",
      "Pearl Millet",
      "Sorghum"
    ],
    "avoidPreviousCrops": [
      "Chickpea",
      "Lentil"
    ],
    "suitableStates": [
      "Madhya Pradesh",
      "Maharashtra",
      "Rajasthan",
      "Gujarat",
      "Uttar Pradesh",
      "Karnataka"
    ],
    "sourceReference": "Chickpea (Chana) Rabi pulse standard (ICAR-IIPR)."
  },
  {
    "cropId": "C011",
    "displayName": "Green Gram",
    "scientificName": "Vigna radiata",
    "category": "pulse",
    "seasons": [
      "Kharif",
      "Zaid"
    ],
    "sowingMonths": [
      6,
      7,
      3,
      4
    ],
    "phMin": 6.2,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 15.0,
      "max": 35.0
    },
    "idealP": {
      "min": 35.0,
      "max": 65.0
    },
    "idealK": {
      "min": 20.0,
      "max": 45.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 350.0,
      "max": 900.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 27.0,
      "optimalMax": 34.0,
      "max": 40.0
    },
    "durationDays": {
      "min": 75,
      "max": 93
    },
    "goodPreviousCrops": [
      "Wheat",
      "Mustard",
      "Potato",
      "Barley"
    ],
    "avoidPreviousCrops": [
      "Green Gram",
      "Black Gram"
    ],
    "suitableStates": [
      "Rajasthan",
      "Madhya Pradesh",
      "Maharashtra",
      "Gujarat",
      "Punjab",
      "Haryana"
    ],
    "sourceReference": "Green Gram (Moong) short-duration pulse (ICAR-IIPR)."
  },
  {
    "cropId": "C012",
    "displayName": "Horse Gram",
    "scientificName": "Macrotyloma uniflorum",
    "category": "pulse",
    "seasons": [
      "Kharif",
      "Rabi"
    ],
    "sowingMonths": [
      7,
      8,
      9,
      10
    ],
    "phMin": 5.0,
    "phMax": 8.0,
    "optimalPhMin": 5.8,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 15.0,
      "max": 35.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 15.0,
      "max": 40.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 300.0,
      "max": 950.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 22.0,
      "optimalMax": 32.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 120,
      "max": 150
    },
    "goodPreviousCrops": [
      "Finger Millet",
      "Sorghum"
    ],
    "avoidPreviousCrops": [
      "Horse Gram"
    ],
    "suitableStates": [
      "Karnataka",
      "Tamil Nadu",
      "Andhra Pradesh",
      "Odisha",
      "Chhattisgarh"
    ],
    "sourceReference": "Horse Gram (Kulthi) hardy drought pulse."
  },
  {
    "cropId": "C013",
    "displayName": "Lentil",
    "scientificName": "Lens culinaris",
    "category": "pulse",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      10,
      11
    ],
    "phMin": 5.8,
    "phMax": 8.2,
    "optimalPhMin": 6.2,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 15.0,
      "max": 35.0
    },
    "idealP": {
      "min": 30.0,
      "max": 65.0
    },
    "idealK": {
      "min": 15.0,
      "max": 40.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 300.0,
      "max": 800.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 18.0,
      "optimalMax": 25.0,
      "max": 30.0
    },
    "durationDays": {
      "min": 115,
      "max": 143
    },
    "goodPreviousCrops": [
      "Rice",
      "Maize",
      "Pearl Millet"
    ],
    "avoidPreviousCrops": [
      "Lentil",
      "Chickpea"
    ],
    "suitableStates": [
      "Madhya Pradesh",
      "Uttar Pradesh",
      "Bihar",
      "West Bengal",
      "Rajasthan"
    ],
    "sourceReference": "Lentil (Masoor) Rabi pulse requirements."
  },
  {
    "cropId": "C014",
    "displayName": "Moth Bean",
    "scientificName": "Vigna aconitifolia",
    "category": "pulse",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      6,
      7
    ],
    "phMin": 5.5,
    "phMax": 8.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 8.2,
    "idealN": {
      "min": 10.0,
      "max": 30.0
    },
    "idealP": {
      "min": 20.0,
      "max": 50.0
    },
    "idealK": {
      "min": 15.0,
      "max": 40.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 200.0,
      "max": 750.0
    },
    "tempRange": {
      "min": 22.0,
      "optimalMin": 26.0,
      "optimalMax": 35.0,
      "max": 42.0
    },
    "durationDays": {
      "min": 75,
      "max": 93
    },
    "goodPreviousCrops": [
      "Pearl Millet",
      "Sorghum"
    ],
    "avoidPreviousCrops": [
      "Moth Bean"
    ],
    "suitableStates": [
      "Rajasthan",
      "Gujarat",
      "Haryana",
      "Punjab"
    ],
    "sourceReference": "Moth Bean (Matki) extreme arid pulse crop."
  },
  {
    "cropId": "C015",
    "displayName": "Pigeon Pea",
    "scientificName": "Cajanus cajan",
    "category": "pulse",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      6,
      7
    ],
    "phMin": 5.5,
    "phMax": 8.4,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.8,
    "idealN": {
      "min": 15.0,
      "max": 40.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 20.0,
      "max": 60.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 600.0,
      "max": 1300.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 24.0,
      "optimalMax": 32.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 160,
      "max": 200
    },
    "goodPreviousCrops": [
      "Wheat",
      "Mustard",
      "Barley"
    ],
    "avoidPreviousCrops": [
      "Pigeon Pea"
    ],
    "suitableStates": [
      "Maharashtra",
      "Madhya Pradesh",
      "Karnataka",
      "Uttar Pradesh",
      "Gujarat"
    ],
    "sourceReference": "Pigeon Pea (Arhar/Tur) long-duration Kharif pulse."
  },
  {
    "cropId": "C016",
    "displayName": "Mustard",
    "scientificName": "Brassica juncea",
    "category": "oilseed",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      10,
      11,
      12
    ],
    "phMin": 6.0,
    "phMax": 8.2,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.8,
    "idealN": {
      "min": 60.0,
      "max": 110.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 20.0,
      "max": 50.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 250.0,
      "max": 700.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 15.0,
      "optimalMax": 25.0,
      "max": 30.0
    },
    "durationDays": {
      "min": 120,
      "max": 150
    },
    "goodPreviousCrops": [
      "Rice",
      "Maize",
      "Pearl Millet",
      "Cotton"
    ],
    "avoidPreviousCrops": [
      "Mustard",
      "Cabbage",
      "Cauliflower"
    ],
    "suitableStates": [
      "Gujarat",
      "Rajasthan",
      "Haryana",
      "Punjab",
      "Uttar Pradesh",
      "Madhya Pradesh"
    ],
    "sourceReference": "Mustard (Sarson) ICAR-DRMR agronomy specs."
  },
  {
    "cropId": "C017",
    "displayName": "Soybean",
    "scientificName": "Glycine max",
    "category": "oilseed",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      6,
      7
    ],
    "phMin": 5.8,
    "phMax": 7.8,
    "optimalPhMin": 6.3,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 20.0,
      "max": 50.0
    },
    "idealP": {
      "min": 60.0,
      "max": 100.0
    },
    "idealK": {
      "min": 30.0,
      "max": 60.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 600.0,
      "max": 1200.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 23.0,
      "optimalMax": 30.0,
      "max": 35.0
    },
    "durationDays": {
      "min": 105,
      "max": 131
    },
    "goodPreviousCrops": [
      "Wheat",
      "Mustard",
      "Chickpea"
    ],
    "avoidPreviousCrops": [
      "Soybean"
    ],
    "suitableStates": [
      "Madhya Pradesh",
      "Maharashtra",
      "Rajasthan",
      "Karnataka",
      "Gujarat"
    ],
    "sourceReference": "Soybean ICAR-IISR Indore specs."
  },
  {
    "cropId": "C018",
    "displayName": "Sunflower",
    "scientificName": "Helianthus annuus",
    "category": "oilseed",
    "seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      6,
      7,
      10,
      11
    ],
    "phMin": 6.0,
    "phMax": 8.2,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.8,
    "idealN": {
      "min": 50.0,
      "max": 100.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 30.0,
      "max": 60.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 500.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 15.0,
      "optimalMin": 20.0,
      "optimalMax": 28.0,
      "max": 35.0
    },
    "durationDays": {
      "min": 95,
      "max": 118
    },
    "goodPreviousCrops": [
      "Maize",
      "Wheat",
      "Groundnut"
    ],
    "avoidPreviousCrops": [
      "Sunflower"
    ],
    "suitableStates": [
      "Karnataka",
      "Andhra Pradesh",
      "Maharashtra",
      "Tamil Nadu",
      "Haryana"
    ],
    "sourceReference": "Sunflower ICAR-IIOR reference."
  },
  {
    "cropId": "C019",
    "displayName": "Cotton",
    "scientificName": "Gossypium hirsutum",
    "category": "commercial",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      5,
      6,
      7
    ],
    "phMin": 6.0,
    "phMax": 8.5,
    "optimalPhMin": 6.8,
    "optimalPhMax": 8.0,
    "idealN": {
      "min": 90.0,
      "max": 160.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 40.0,
      "max": 100.0
    },
    "waterRequirement": "High",
    "waterRequirementMm": {
      "min": 650.0,
      "max": 1300.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 24.0,
      "optimalMax": 32.0,
      "max": 40.0
    },
    "durationDays": {
      "min": 165,
      "max": 206
    },
    "goodPreviousCrops": [
      "Wheat",
      "Chickpea",
      "Mustard",
      "Garlic"
    ],
    "avoidPreviousCrops": [
      "Cotton",
      "Okra"
    ],
    "suitableStates": [
      "Gujarat",
      "Maharashtra",
      "Telangana",
      "Andhra Pradesh",
      "Punjab",
      "Haryana"
    ],
    "sourceReference": "Cotton ICAR-CICR Nagpur specs."
  },
  {
    "cropId": "C020",
    "displayName": "Jute",
    "scientificName": "Corchorus olitorius",
    "category": "commercial",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      3,
      4,
      5
    ],
    "phMin": 5.0,
    "phMax": 7.8,
    "optimalPhMin": 6.0,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 60.0,
      "max": 120.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 30.0,
      "max": 75.0
    },
    "waterRequirement": "High",
    "waterRequirementMm": {
      "min": 1200.0,
      "max": 2200.0
    },
    "tempRange": {
      "min": 24.0,
      "optimalMin": 28.0,
      "optimalMax": 35.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 130,
      "max": 162
    },
    "goodPreviousCrops": [
      "Rice",
      "Potato",
      "Mustard"
    ],
    "avoidPreviousCrops": [
      "Jute"
    ],
    "suitableStates": [
      "West Bengal",
      "Assam",
      "Bihar",
      "Odisha",
      "Meghalaya"
    ],
    "sourceReference": "Jute ICAR-CRIJAF Barrackpore specs."
  },
  {
    "cropId": "C021",
    "displayName": "Bitter Gourd",
    "scientificName": "Momordica charantia",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      3,
      6,
      7
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 60.0,
      "max": 120.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 40.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 500.0,
      "max": 1200.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 24.0,
      "optimalMax": 30.0,
      "max": 36.0
    },
    "durationDays": {
      "min": 85,
      "max": 106
    },
    "goodPreviousCrops": [
      "Maize",
      "Wheat",
      "Legumes"
    ],
    "avoidPreviousCrops": [
      "Bitter Gourd",
      "Cucumber"
    ],
    "suitableStates": [
      "Uttar Pradesh",
      "Andhra Pradesh",
      "Tamil Nadu",
      "Kerala",
      "Maharashtra"
    ],
    "sourceReference": "Bitter Gourd cucurbit vegetable requirements (ICAR-IIHR)."
  },
  {
    "cropId": "C022",
    "displayName": "Bottle Gourd",
    "scientificName": "Lagenaria siceraria",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      3,
      6,
      7
    ],
    "phMin": 6.0,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 80.0,
      "max": 140.0
    },
    "idealP": {
      "min": 40.0,
      "max": 75.0
    },
    "idealK": {
      "min": 40.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 500.0,
      "max": 1200.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 25.0,
      "optimalMax": 32.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 90,
      "max": 112
    },
    "goodPreviousCrops": [
      "Wheat",
      "Maize",
      "Mustard"
    ],
    "avoidPreviousCrops": [
      "Bottle Gourd",
      "Pumpkin"
    ],
    "suitableStates": [
      "Uttar Pradesh",
      "Bihar",
      "Madhya Pradesh",
      "Haryana",
      "Punjab"
    ],
    "sourceReference": "Bottle Gourd (Lauki) cucurbit specs."
  },
  {
    "cropId": "C023",
    "displayName": "Brinjal",
    "scientificName": "Solanum melongena",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      6,
      7,
      10,
      11
    ],
    "phMin": 5.8,
    "phMax": 7.8,
    "optimalPhMin": 6.2,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 80.0,
      "max": 150.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 40.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 600.0,
      "max": 1300.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 22.0,
      "optimalMax": 30.0,
      "max": 35.0
    },
    "durationDays": {
      "min": 120,
      "max": 150
    },
    "goodPreviousCrops": [
      "Maize",
      "Legumes",
      "Wheat"
    ],
    "avoidPreviousCrops": [
      "Brinjal",
      "Tomato",
      "Potato"
    ],
    "suitableStates": [
      "West Bengal",
      "Odisha",
      "Gujarat",
      "Madhya Pradesh",
      "Bihar"
    ],
    "sourceReference": "Brinjal (Eggplant) ICAR-IIVR vegetable reference."
  },
  {
    "cropId": "C024",
    "displayName": "Cabbage",
    "scientificName": "Brassica oleracea var. capitata",
    "category": "vegetable",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      9,
      10,
      11
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 100.0,
      "max": 180.0
    },
    "idealP": {
      "min": 50.0,
      "max": 100.0
    },
    "idealK": {
      "min": 50.0,
      "max": 100.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 450.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 12.0,
      "optimalMin": 15.0,
      "optimalMax": 22.0,
      "max": 28.0
    },
    "durationDays": {
      "min": 90,
      "max": 112
    },
    "goodPreviousCrops": [
      "Maize",
      "Legumes",
      "Onion"
    ],
    "avoidPreviousCrops": [
      "Cabbage",
      "Cauliflower",
      "Mustard"
    ],
    "suitableStates": [
      "West Bengal",
      "Odisha",
      "Bihar",
      "Gujarat",
      "Karnataka"
    ],
    "sourceReference": "Cabbage cool-season vegetable requirements."
  },
  {
    "cropId": "C025",
    "displayName": "Carrot",
    "scientificName": "Daucus carota",
    "category": "vegetable",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      9,
      10
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 50.0,
      "max": 100.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 60.0,
      "max": 120.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 400.0,
      "max": 900.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 15.0,
      "optimalMax": 22.0,
      "max": 28.0
    },
    "durationDays": {
      "min": 85,
      "max": 106
    },
    "goodPreviousCrops": [
      "Onion",
      "Garlic",
      "Wheat"
    ],
    "avoidPreviousCrops": [
      "Carrot"
    ],
    "suitableStates": [
      "Punjab",
      "Haryana",
      "Uttar Pradesh",
      "Tamil Nadu",
      "Karnataka"
    ],
    "sourceReference": "Carrot root crop requirements from fertilizer dataset & ICAR."
  },
  {
    "cropId": "C026",
    "displayName": "Cauliflower",
    "scientificName": "Brassica oleracea var. botrytis",
    "category": "vegetable",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      8,
      9,
      10
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 100.0,
      "max": 180.0
    },
    "idealP": {
      "min": 50.0,
      "max": 100.0
    },
    "idealK": {
      "min": 50.0,
      "max": 100.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 450.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 12.0,
      "optimalMin": 16.0,
      "optimalMax": 22.0,
      "max": 28.0
    },
    "durationDays": {
      "min": 95,
      "max": 118
    },
    "goodPreviousCrops": [
      "Maize",
      "Legumes",
      "Onion"
    ],
    "avoidPreviousCrops": [
      "Cauliflower",
      "Cabbage",
      "Mustard"
    ],
    "suitableStates": [
      "West Bengal",
      "Bihar",
      "Uttar Pradesh",
      "Orissa",
      "Gujarat"
    ],
    "sourceReference": "Cauliflower cool-season vegetable requirements."
  },
  {
    "cropId": "C027",
    "displayName": "Cucumber",
    "scientificName": "Cucumis sativus",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      3,
      6,
      7
    ],
    "phMin": 5.8,
    "phMax": 7.6,
    "optimalPhMin": 6.2,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 60.0,
      "max": 120.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 60.0,
      "max": 120.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 400.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 22.0,
      "optimalMax": 28.0,
      "max": 35.0
    },
    "durationDays": {
      "min": 65,
      "max": 81
    },
    "goodPreviousCrops": [
      "Maize",
      "Legumes"
    ],
    "avoidPreviousCrops": [
      "Cucumber",
      "Pumpkin"
    ],
    "suitableStates": [
      "Haryana",
      "Karnataka",
      "Uttar Pradesh",
      "Punjab",
      "Gujarat"
    ],
    "sourceReference": "Cucumber quick-maturing vegetable specifications."
  },
  {
    "cropId": "C028",
    "displayName": "Drumstick",
    "scientificName": "Moringa oleifera",
    "category": "vegetable",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      6,
      7,
      8,
      9
    ],
    "phMin": 6.0,
    "phMax": 8.5,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.8,
    "idealN": {
      "min": 40.0,
      "max": 80.0
    },
    "idealP": {
      "min": 20.0,
      "max": 50.0
    },
    "idealK": {
      "min": 20.0,
      "max": 50.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 300.0,
      "max": 1200.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 25.0,
      "optimalMax": 35.0,
      "max": 42.0
    },
    "durationDays": {
      "min": 240,
      "max": 300
    },
    "goodPreviousCrops": [
      "Intercropped Legumes",
      "Pulses"
    ],
    "avoidPreviousCrops": [
      "Solanaceous crops"
    ],
    "suitableStates": [
      "Tamil Nadu",
      "Andhra Pradesh",
      "Karnataka",
      "Odisha",
      "Gujarat"
    ],
    "sourceReference": "Drumstick (Moringa) perennial tree vegetable specs."
  },
  {
    "cropId": "C029",
    "displayName": "Garlic",
    "scientificName": "Allium sativum",
    "category": "vegetable",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      9,
      10,
      11
    ],
    "phMin": 6.0,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 60.0,
      "max": 120.0
    },
    "idealP": {
      "min": 40.0,
      "max": 75.0
    },
    "idealK": {
      "min": 40.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 350.0,
      "max": 850.0
    },
    "tempRange": {
      "min": 12.0,
      "optimalMin": 16.0,
      "optimalMax": 24.0,
      "max": 30.0
    },
    "durationDays": {
      "min": 135,
      "max": 168
    },
    "goodPreviousCrops": [
      "Maize",
      "Rice",
      "Cotton"
    ],
    "avoidPreviousCrops": [
      "Garlic",
      "Onion"
    ],
    "suitableStates": [
      "Madhya Pradesh",
      "Rajasthan",
      "Gujarat",
      "Uttar Pradesh",
      "Punjab"
    ],
    "sourceReference": "Garlic Rabi spice/vegetable ICAR-DOGR specs."
  },
  {
    "cropId": "C030",
    "displayName": "Okra",
    "scientificName": "Abelmoschus esculentus",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      3,
      6,
      7
    ],
    "phMin": 6.0,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 70.0,
      "max": 130.0
    },
    "idealP": {
      "min": 40.0,
      "max": 75.0
    },
    "idealK": {
      "min": 40.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 500.0,
      "max": 1200.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 25.0,
      "optimalMax": 34.0,
      "max": 40.0
    },
    "durationDays": {
      "min": 90,
      "max": 112
    },
    "goodPreviousCrops": [
      "Legumes",
      "Wheat",
      "Mustard"
    ],
    "avoidPreviousCrops": [
      "Okra",
      "Cotton"
    ],
    "suitableStates": [
      "Andhra Pradesh",
      "West Bengal",
      "Bihar",
      "Gujarat",
      "Orissa"
    ],
    "sourceReference": "Okra (Bhindi) warm-season vegetable reference."
  },
  {
    "cropId": "C031",
    "displayName": "Onion",
    "scientificName": "Allium cepa",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Rabi"
    ],
    "sowingMonths": [
      5,
      6,
      10,
      11
    ],
    "phMin": 6.0,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 80.0,
      "max": 150.0
    },
    "idealP": {
      "min": 40.0,
      "max": 75.0
    },
    "idealK": {
      "min": 40.0,
      "max": 100.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 450.0,
      "max": 950.0
    },
    "tempRange": {
      "min": 12.0,
      "optimalMin": 16.0,
      "optimalMax": 25.0,
      "max": 34.0
    },
    "durationDays": {
      "min": 130,
      "max": 162
    },
    "goodPreviousCrops": [
      "Maize",
      "Rice",
      "Mustard"
    ],
    "avoidPreviousCrops": [
      "Onion",
      "Garlic"
    ],
    "suitableStates": [
      "Maharashtra",
      "Madhya Pradesh",
      "Karnataka",
      "Gujarat",
      "Rajasthan"
    ],
    "sourceReference": "Onion ICAR-DOGR Pune agronomic specs."
  },
  {
    "cropId": "C032",
    "displayName": "Potato",
    "scientificName": "Solanum tuberosum",
    "category": "vegetable",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      10,
      11,
      12
    ],
    "phMin": 5.2,
    "phMax": 7.0,
    "optimalPhMin": 5.5,
    "optimalPhMax": 6.5,
    "idealN": {
      "min": 120.0,
      "max": 180.0
    },
    "idealP": {
      "min": 60.0,
      "max": 100.0
    },
    "idealK": {
      "min": 80.0,
      "max": 150.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 400.0,
      "max": 900.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 15.0,
      "optimalMax": 22.0,
      "max": 28.0
    },
    "durationDays": {
      "min": 100,
      "max": 125
    },
    "goodPreviousCrops": [
      "Maize",
      "Green Gram",
      "Rice"
    ],
    "avoidPreviousCrops": [
      "Potato",
      "Tomato",
      "Brinjal"
    ],
    "suitableStates": [
      "Uttar Pradesh",
      "West Bengal",
      "Bihar",
      "Gujarat",
      "Punjab"
    ],
    "sourceReference": "Potato ICAR-CPRI Shimla specs."
  },
  {
    "cropId": "C033",
    "displayName": "Pumpkin",
    "scientificName": "Cucurbita moschata",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      3,
      6,
      7
    ],
    "phMin": 5.8,
    "phMax": 7.8,
    "optimalPhMin": 6.2,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 60.0,
      "max": 120.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 30.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 450.0,
      "max": 1100.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 22.0,
      "optimalMax": 28.0,
      "max": 35.0
    },
    "durationDays": {
      "min": 110,
      "max": 137
    },
    "goodPreviousCrops": [
      "Maize",
      "Legumes"
    ],
    "avoidPreviousCrops": [
      "Pumpkin",
      "Cucumber"
    ],
    "suitableStates": [
      "Uttar Pradesh",
      "Odisha",
      "Tamil Nadu",
      "Kerala",
      "Madhya Pradesh"
    ],
    "sourceReference": "Pumpkin cucurbit vegetable specs."
  },
  {
    "cropId": "C034",
    "displayName": "Radish",
    "scientificName": "Raphanus sativus",
    "category": "vegetable",
    "seasons": [
      "Rabi",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      3,
      9,
      10,
      11
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 40.0,
      "max": 80.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 40.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 350.0,
      "max": 850.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 15.0,
      "optimalMax": 22.0,
      "max": 28.0
    },
    "durationDays": {
      "min": 45,
      "max": 56
    },
    "goodPreviousCrops": [
      "Onion",
      "Garlic",
      "Legumes"
    ],
    "avoidPreviousCrops": [
      "Radish",
      "Cabbage"
    ],
    "suitableStates": [
      "West Bengal",
      "Punjab",
      "Haryana",
      "Bihar",
      "Gujarat"
    ],
    "sourceReference": "Radish quick-maturing root vegetable."
  },
  {
    "cropId": "C035",
    "displayName": "Ridge Gourd",
    "scientificName": "Luffa acutangula",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Zaid"
    ],
    "sowingMonths": [
      2,
      3,
      6,
      7
    ],
    "phMin": 6.0,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 60.0,
      "max": 120.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 30.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 450.0,
      "max": 1100.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 24.0,
      "optimalMax": 30.0,
      "max": 36.0
    },
    "durationDays": {
      "min": 80,
      "max": 100
    },
    "goodPreviousCrops": [
      "Maize",
      "Legumes"
    ],
    "avoidPreviousCrops": [
      "Ridge Gourd"
    ],
    "suitableStates": [
      "Andhra Pradesh",
      "Tamil Nadu",
      "Karnataka",
      "Maharashtra",
      "Gujarat"
    ],
    "sourceReference": "Ridge Gourd (Tori) cucurbit vegetable requirements."
  },
  {
    "cropId": "C036",
    "displayName": "Tomato",
    "scientificName": "Solanum lycopersicum",
    "category": "vegetable",
    "seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "sowingMonths": [
      1,
      2,
      6,
      7,
      10,
      11
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.2,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 100.0,
      "max": 160.0
    },
    "idealP": {
      "min": 50.0,
      "max": 100.0
    },
    "idealK": {
      "min": 60.0,
      "max": 120.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 500.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 15.0,
      "optimalMin": 20.0,
      "optimalMax": 28.0,
      "max": 35.0
    },
    "durationDays": {
      "min": 120,
      "max": 150
    },
    "goodPreviousCrops": [
      "Maize",
      "Wheat",
      "Mustard",
      "Garlic"
    ],
    "avoidPreviousCrops": [
      "Tomato",
      "Potato",
      "Brinjal"
    ],
    "suitableStates": [
      "Andhra Pradesh",
      "Madhya Pradesh",
      "Karnataka",
      "Gujarat",
      "Odisha"
    ],
    "sourceReference": "Tomato ICAR-IIVR Varanasi specs."
  },
  {
    "cropId": "C037",
    "displayName": "Apple",
    "scientificName": "Malus domestica",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      12,
      1,
      2
    ],
    "phMin": 5.5,
    "phMax": 7.5,
    "optimalPhMin": 6.0,
    "optimalPhMax": 6.8,
    "idealN": {
      "min": 40.0,
      "max": 100.0
    },
    "idealP": {
      "min": 30.0,
      "max": 70.0
    },
    "idealK": {
      "min": 60.0,
      "max": 150.0
    },
    "waterRequirement": "High",
    "waterRequirementMm": {
      "min": 800.0,
      "max": 1500.0
    },
    "tempRange": {
      "min": 4.0,
      "optimalMin": 12.0,
      "optimalMax": 22.0,
      "max": 28.0
    },
    "durationDays": {
      "min": 180,
      "max": 225
    },
    "goodPreviousCrops": [
      "Legume cover crops"
    ],
    "avoidPreviousCrops": [
      "Solanaceous weeds"
    ],
    "suitableStates": [
      "Jammu and Kashmir",
      "Himachal Pradesh",
      "Uttarakhand"
    ],
    "sourceReference": "Apple temperate fruit ICAR-CITH specs."
  },
  {
    "cropId": "C038",
    "displayName": "Banana",
    "scientificName": "Musa acuminata",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      6,
      7,
      8
    ],
    "phMin": 5.5,
    "phMax": 8.0,
    "optimalPhMin": 6.0,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 150.0,
      "max": 300.0
    },
    "idealP": {
      "min": 50.0,
      "max": 100.0
    },
    "idealK": {
      "min": 200.0,
      "max": 350.0
    },
    "waterRequirement": "Very High",
    "waterRequirementMm": {
      "min": 1200.0,
      "max": 2500.0
    },
    "tempRange": {
      "min": 15.0,
      "optimalMin": 25.0,
      "optimalMax": 30.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 330,
      "max": 412
    },
    "goodPreviousCrops": [
      "Leguminous intercrops",
      "Cowpea"
    ],
    "avoidPreviousCrops": [
      "Banana"
    ],
    "suitableStates": [
      "Tamil Nadu",
      "Andhra Pradesh",
      "Gujarat",
      "Maharashtra",
      "Karnataka"
    ],
    "sourceReference": "Banana ICAR-NRCB Trichy specs."
  },
  {
    "cropId": "C039",
    "displayName": "Coconut",
    "scientificName": "Cocos nucifera",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      5,
      6,
      7,
      9,
      10
    ],
    "phMin": 5.2,
    "phMax": 8.2,
    "optimalPhMin": 5.8,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 500.0,
      "max": 900.0
    },
    "idealP": {
      "min": 250.0,
      "max": 500.0
    },
    "idealK": {
      "min": 750.0,
      "max": 1500.0
    },
    "waterRequirement": "Very High",
    "waterRequirementMm": {
      "min": 1300.0,
      "max": 3000.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 27.0,
      "optimalMax": 32.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 365,
      "max": 456
    },
    "goodPreviousCrops": [
      "Pineapple",
      "Pepper",
      "Banana intercrops"
    ],
    "avoidPreviousCrops": [
      "Coconut monoculture"
    ],
    "suitableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka",
      "Andhra Pradesh",
      "West Bengal"
    ],
    "sourceReference": "Coconut ICAR-CPCRI Kasaragod plantation spec."
  },
  {
    "cropId": "C040",
    "displayName": "Grapes",
    "scientificName": "Vitis vinifera",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      1,
      2
    ],
    "phMin": 6.0,
    "phMax": 8.2,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 100.0,
      "max": 180.0
    },
    "idealP": {
      "min": 40.0,
      "max": 100.0
    },
    "idealK": {
      "min": 150.0,
      "max": 260.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 500.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 12.0,
      "optimalMin": 18.0,
      "optimalMax": 30.0,
      "max": 40.0
    },
    "durationDays": {
      "min": 150,
      "max": 187
    },
    "goodPreviousCrops": [
      "Legume cover crops"
    ],
    "avoidPreviousCrops": [
      "Grapes"
    ],
    "suitableStates": [
      "Maharashtra",
      "Karnataka",
      "Tamil Nadu",
      "Andhra Pradesh"
    ],
    "sourceReference": "Grapes ICAR-NRCG Pune fruit specs."
  },
  {
    "cropId": "C041",
    "displayName": "Jackfruit",
    "scientificName": "Artocarpus heterophyllus",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      6,
      7,
      8
    ],
    "phMin": 5.0,
    "phMax": 7.8,
    "optimalPhMin": 5.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 60.0,
      "max": 120.0
    },
    "idealP": {
      "min": 30.0,
      "max": 60.0
    },
    "idealK": {
      "min": 50.0,
      "max": 100.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 1000.0,
      "max": 2400.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 24.0,
      "optimalMax": 32.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 365,
      "max": 456
    },
    "goodPreviousCrops": [
      "Pulse intercrops"
    ],
    "avoidPreviousCrops": [
      "Jackfruit monoculture"
    ],
    "suitableStates": [
      "Kerala",
      "Tamil Nadu",
      "Karnataka",
      "Assam",
      "West Bengal"
    ],
    "sourceReference": "Jackfruit perennial tree fruit specs."
  },
  {
    "cropId": "C042",
    "displayName": "Mango",
    "scientificName": "Mangifera indica",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      7,
      8,
      9
    ],
    "phMin": 5.5,
    "phMax": 7.8,
    "optimalPhMin": 6.0,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 100.0,
      "max": 250.0
    },
    "idealP": {
      "min": 40.0,
      "max": 100.0
    },
    "idealK": {
      "min": 100.0,
      "max": 250.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 750.0,
      "max": 2000.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 24.0,
      "optimalMax": 32.0,
      "max": 42.0
    },
    "durationDays": {
      "min": 365,
      "max": 456
    },
    "goodPreviousCrops": [
      "Leguminous cover crops",
      "Groundnut"
    ],
    "avoidPreviousCrops": [
      "Solanaceous intercrops"
    ],
    "suitableStates": [
      "Uttar Pradesh",
      "Andhra Pradesh",
      "Karnataka",
      "Bihar",
      "Gujarat"
    ],
    "sourceReference": "Mango ICAR-CISH Lucknow fruit specs."
  },
  {
    "cropId": "C043",
    "displayName": "Muskmelon",
    "scientificName": "Cucumis melo",
    "category": "fruit",
    "seasons": [
      "Zaid"
    ],
    "sowingMonths": [
      1,
      2,
      3
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 80.0,
      "max": 140.0
    },
    "idealP": {
      "min": 40.0,
      "max": 75.0
    },
    "idealK": {
      "min": 40.0,
      "max": 80.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 300.0,
      "max": 800.0
    },
    "tempRange": {
      "min": 22.0,
      "optimalMin": 27.0,
      "optimalMax": 34.0,
      "max": 40.0
    },
    "durationDays": {
      "min": 90,
      "max": 112
    },
    "goodPreviousCrops": [
      "Legumes",
      "Mustard"
    ],
    "avoidPreviousCrops": [
      "Muskmelon",
      "Watermelon"
    ],
    "suitableStates": [
      "Punjab",
      "Uttar Pradesh",
      "Haryana",
      "Rajasthan",
      "Madhya Pradesh"
    ],
    "sourceReference": "Muskmelon (Kharbooza) Zaid fruit specs."
  },
  {
    "cropId": "C044",
    "displayName": "Orange/Mandarin",
    "scientificName": "Citrus reticulata",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      6,
      7,
      8
    ],
    "phMin": 6.0,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 120.0,
      "max": 250.0
    },
    "idealP": {
      "min": 40.0,
      "max": 100.0
    },
    "idealK": {
      "min": 80.0,
      "max": 180.0
    },
    "waterRequirement": "High",
    "waterRequirementMm": {
      "min": 900.0,
      "max": 1800.0
    },
    "tempRange": {
      "min": 12.0,
      "optimalMin": 18.0,
      "optimalMax": 30.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 365,
      "max": 456
    },
    "goodPreviousCrops": [
      "Legume cover crops"
    ],
    "avoidPreviousCrops": [
      "Citrus monoculture"
    ],
    "suitableStates": [
      "Maharashtra",
      "Madhya Pradesh",
      "Assam",
      "Punjab",
      "Rajasthan"
    ],
    "sourceReference": "Mandarin Orange ICAR-CCRI Nagpur specs."
  },
  {
    "cropId": "C045",
    "displayName": "Papaya",
    "scientificName": "Carica papaya",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      2,
      3,
      6,
      7
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 150.0,
      "max": 300.0
    },
    "idealP": {
      "min": 150.0,
      "max": 300.0
    },
    "idealK": {
      "min": 200.0,
      "max": 350.0
    },
    "waterRequirement": "High",
    "waterRequirementMm": {
      "min": 1000.0,
      "max": 2000.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 23.0,
      "optimalMax": 32.0,
      "max": 40.0
    },
    "durationDays": {
      "min": 270,
      "max": 337
    },
    "goodPreviousCrops": [
      "Short duration pulses"
    ],
    "avoidPreviousCrops": [
      "Papaya"
    ],
    "suitableStates": [
      "Andhra Pradesh",
      "Gujarat",
      "Madhya Pradesh",
      "Karnataka",
      "Maharashtra"
    ],
    "sourceReference": "Papaya fruit specs."
  },
  {
    "cropId": "C046",
    "displayName": "Pomegranate",
    "scientificName": "Punica granatum",
    "category": "fruit",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      12,
      1,
      6,
      7
    ],
    "phMin": 6.5,
    "phMax": 8.5,
    "optimalPhMin": 7.0,
    "optimalPhMax": 8.0,
    "idealN": {
      "min": 100.0,
      "max": 200.0
    },
    "idealP": {
      "min": 40.0,
      "max": 80.0
    },
    "idealK": {
      "min": 100.0,
      "max": 200.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 400.0,
      "max": 1000.0
    },
    "tempRange": {
      "min": 15.0,
      "optimalMin": 22.0,
      "optimalMax": 32.0,
      "max": 42.0
    },
    "durationDays": {
      "min": 365,
      "max": 456
    },
    "goodPreviousCrops": [
      "Legumes",
      "Green manure"
    ],
    "avoidPreviousCrops": [
      "Pomegranate"
    ],
    "suitableStates": [
      "Maharashtra",
      "Karnataka",
      "Gujarat",
      "Andhra Pradesh",
      "Rajasthan"
    ],
    "sourceReference": "Pomegranate ICAR-NRCP Solapur specs."
  },
  {
    "cropId": "C047",
    "displayName": "Watermelon",
    "scientificName": "Citrullus lanatus",
    "category": "fruit",
    "seasons": [
      "Zaid"
    ],
    "sowingMonths": [
      1,
      2,
      3
    ],
    "phMin": 6.0,
    "phMax": 7.8,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.2,
    "idealN": {
      "min": 80.0,
      "max": 140.0
    },
    "idealP": {
      "min": 40.0,
      "max": 75.0
    },
    "idealK": {
      "min": 40.0,
      "max": 80.0
    },
    "waterRequirement": "Moderate",
    "waterRequirementMm": {
      "min": 400.0,
      "max": 900.0
    },
    "tempRange": {
      "min": 20.0,
      "optimalMin": 24.0,
      "optimalMax": 32.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 90,
      "max": 112
    },
    "goodPreviousCrops": [
      "Legumes",
      "Mustard"
    ],
    "avoidPreviousCrops": [
      "Watermelon",
      "Muskmelon"
    ],
    "suitableStates": [
      "Uttar Pradesh",
      "Punjab",
      "Haryana",
      "Karnataka",
      "Tamil Nadu"
    ],
    "sourceReference": "Watermelon Zaid fruit crop specs."
  },
  {
    "cropId": "C048",
    "displayName": "Black Pepper",
    "scientificName": "Piper nigrum",
    "category": "spice",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      5,
      6
    ],
    "phMin": 4.5,
    "phMax": 6.8,
    "optimalPhMin": 5.0,
    "optimalPhMax": 6.2,
    "idealN": {
      "min": 50.0,
      "max": 120.0
    },
    "idealP": {
      "min": 30.0,
      "max": 80.0
    },
    "idealK": {
      "min": 100.0,
      "max": 180.0
    },
    "waterRequirement": "High",
    "waterRequirementMm": {
      "min": 1500.0,
      "max": 3500.0
    },
    "tempRange": {
      "min": 15.0,
      "optimalMin": 20.0,
      "optimalMax": 30.0,
      "max": 35.0
    },
    "durationDays": {
      "min": 365,
      "max": 456
    },
    "goodPreviousCrops": [
      "Cardamom",
      "Leguminous cover crops"
    ],
    "avoidPreviousCrops": [
      "Black Pepper monoculture"
    ],
    "suitableStates": [
      "Kerala",
      "Karnataka",
      "Tamil Nadu"
    ],
    "sourceReference": "Black Pepper ICAR-IISR Kozhikode plantation spice spec."
  },
  {
    "cropId": "C049",
    "displayName": "Cardamom",
    "scientificName": "Elettaria cardamomum",
    "category": "spice",
    "seasons": [
      "Perennial"
    ],
    "sowingMonths": [
      6,
      7
    ],
    "phMin": 4.5,
    "phMax": 6.5,
    "optimalPhMin": 5.0,
    "optimalPhMax": 6.0,
    "idealN": {
      "min": 50.0,
      "max": 120.0
    },
    "idealP": {
      "min": 40.0,
      "max": 90.0
    },
    "idealK": {
      "min": 100.0,
      "max": 250.0
    },
    "waterRequirement": "Very High",
    "waterRequirementMm": {
      "min": 1500.0,
      "max": 4000.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 15.0,
      "optimalMax": 25.0,
      "max": 32.0
    },
    "durationDays": {
      "min": 365,
      "max": 456
    },
    "goodPreviousCrops": [
      "Black Pepper",
      "Shade trees"
    ],
    "avoidPreviousCrops": [
      "Cardamom monoculture"
    ],
    "suitableStates": [
      "Kerala",
      "Karnataka",
      "Tamil Nadu"
    ],
    "sourceReference": "Small Cardamom ICAR-IISR shade spice spec."
  },
  {
    "cropId": "C050",
    "displayName": "Coriander",
    "scientificName": "Coriandrum sativum",
    "category": "spice",
    "seasons": [
      "Rabi"
    ],
    "sowingMonths": [
      10,
      11
    ],
    "phMin": 6.0,
    "phMax": 8.0,
    "optimalPhMin": 6.5,
    "optimalPhMax": 7.5,
    "idealN": {
      "min": 30.0,
      "max": 60.0
    },
    "idealP": {
      "min": 20.0,
      "max": 50.0
    },
    "idealK": {
      "min": 20.0,
      "max": 50.0
    },
    "waterRequirement": "Low",
    "waterRequirementMm": {
      "min": 300.0,
      "max": 800.0
    },
    "tempRange": {
      "min": 10.0,
      "optimalMin": 15.0,
      "optimalMax": 25.0,
      "max": 30.0
    },
    "durationDays": {
      "min": 100,
      "max": 125
    },
    "goodPreviousCrops": [
      "Maize",
      "Rice",
      "Legumes"
    ],
    "avoidPreviousCrops": [
      "Coriander"
    ],
    "suitableStates": [
      "Rajasthan",
      "Madhya Pradesh",
      "Gujarat",
      "Andhra Pradesh"
    ],
    "sourceReference": "Coriander ICAR-NRCSS Ajmer spice specs."
  },
  {
    "cropId": "C051",
    "displayName": "Turmeric",
    "scientificName": "Curcuma longa",
    "category": "spice",
    "seasons": [
      "Kharif"
    ],
    "sowingMonths": [
      5,
      6
    ],
    "phMin": 5.0,
    "phMax": 7.5,
    "optimalPhMin": 5.5,
    "optimalPhMax": 6.8,
    "idealN": {
      "min": 60.0,
      "max": 150.0
    },
    "idealP": {
      "min": 30.0,
      "max": 80.0
    },
    "idealK": {
      "min": 80.0,
      "max": 150.0
    },
    "waterRequirement": "High",
    "waterRequirementMm": {
      "min": 1200.0,
      "max": 2500.0
    },
    "tempRange": {
      "min": 18.0,
      "optimalMin": 22.0,
      "optimalMax": 32.0,
      "max": 38.0
    },
    "durationDays": {
      "min": 240,
      "max": 300
    },
    "goodPreviousCrops": [
      "Maize",
      "Legumes",
      "Banana intercrop"
    ],
    "avoidPreviousCrops": [
      "Turmeric",
      "Ginger"
    ],
    "suitableStates": [
      "Telangana",
      "Maharashtra",
      "Tamil Nadu",
      "Karnataka",
      "Odisha"
    ],
    "sourceReference": "Turmeric ICAR-IISR spice specifications."
  }
];
