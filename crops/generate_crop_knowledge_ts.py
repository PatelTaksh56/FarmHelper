import csv
import json
import os

def generate_ts():
    csv_path = 'crops/crop_knowledge.csv'
    ts_path = 'src/data/cropKnowledge.ts'

    with open(csv_path, 'r', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    # Seasons & sowing months mapping by crop ID
    SEASON_MAP = {
        'C001': {'seasons': ['Rabi'], 'months': [10, 11], 'sci': 'Hordeum vulgare', 'good': ['Maize', 'Rice', 'Cotton'], 'avoid': ['Barley', 'Wheat']},
        'C002': {'seasons': ['Kharif'], 'months': [6, 7], 'sci': 'Oryza sativa var. basmati', 'good': ['Chickpea', 'Mustard', 'Green Gram', 'Wheat'], 'avoid': ['Rice', 'Basmati Rice']},
        'C003': {'seasons': ['Kharif'], 'months': [6, 7], 'sci': 'Eleusine coracana', 'good': ['Groundnut', 'Pigeon Pea', 'Horse Gram'], 'avoid': ['Finger Millet']},
        'C004': {'seasons': ['Kharif', 'Rabi', 'Zaid'], 'months': [6, 7, 10, 11, 2, 3], 'sci': 'Zea mays', 'good': ['Chickpea', 'Mustard', 'Potato', 'Green Gram'], 'avoid': ['Maize', 'Sorghum']},
        'C005': {'seasons': ['Kharif'], 'months': [6, 7], 'sci': 'Pennisetum glaucum', 'good': ['Cluster Bean', 'Moth Bean', 'Chickpea'], 'avoid': ['Pearl Millet']},
        'C006': {'seasons': ['Kharif', 'Rabi'], 'months': [6, 7, 11, 12], 'sci': 'Oryza sativa', 'good': ['Chickpea', 'Mustard', 'Green Gram', 'Wheat'], 'avoid': ['Rice']},
        'C007': {'seasons': ['Kharif', 'Rabi'], 'months': [6, 7, 10, 11], 'sci': 'Sorghum bicolor', 'good': ['Chickpea', 'Soya Bean', 'Groundnut'], 'avoid': ['Sorghum', 'Maize']},
        'C008': {'seasons': ['Rabi'], 'months': [11, 12, 1], 'sci': 'Triticum aestivum', 'good': ['Rice', 'Maize', 'Cotton', 'Soybean', 'Green Gram'], 'avoid': ['Wheat', 'Barley']},
        'C009': {'seasons': ['Kharif', 'Zaid'], 'months': [6, 7, 3, 4], 'sci': 'Vigna mungo', 'good': ['Wheat', 'Mustard', 'Rice'], 'avoid': ['Black Gram', 'Green Gram']},
        'C010': {'seasons': ['Rabi'], 'months': [10, 11, 12], 'sci': 'Cicer arietinum', 'good': ['Rice', 'Maize', 'Pearl Millet', 'Sorghum'], 'avoid': ['Chickpea', 'Lentil']},
        'C011': {'seasons': ['Kharif', 'Zaid'], 'months': [6, 7, 3, 4], 'sci': 'Vigna radiata', 'good': ['Wheat', 'Mustard', 'Potato', 'Barley'], 'avoid': ['Green Gram', 'Black Gram']},
        'C012': {'seasons': ['Kharif', 'Rabi'], 'months': [7, 8, 9, 10], 'sci': 'Macrotyloma uniflorum', 'good': ['Finger Millet', 'Sorghum'], 'avoid': ['Horse Gram']},
        'C013': {'seasons': ['Rabi'], 'months': [10, 11], 'sci': 'Lens culinaris', 'good': ['Rice', 'Maize', 'Pearl Millet'], 'avoid': ['Lentil', 'Chickpea']},
        'C014': {'seasons': ['Kharif'], 'months': [6, 7], 'sci': 'Vigna aconitifolia', 'good': ['Pearl Millet', 'Sorghum'], 'avoid': ['Moth Bean']},
        'C015': {'seasons': ['Kharif'], 'months': [6, 7], 'sci': 'Cajanus cajan', 'good': ['Wheat', 'Mustard', 'Barley'], 'avoid': ['Pigeon Pea']},
        'C016': {'seasons': ['Rabi'], 'months': [10, 11, 12], 'sci': 'Brassica juncea', 'good': ['Rice', 'Maize', 'Pearl Millet', 'Cotton'], 'avoid': ['Mustard', 'Cabbage', 'Cauliflower']},
        'C017': {'seasons': ['Kharif'], 'months': [6, 7], 'sci': 'Glycine max', 'good': ['Wheat', 'Mustard', 'Chickpea'], 'avoid': ['Soybean']},
        'C018': {'seasons': ['Kharif', 'Rabi', 'Zaid'], 'months': [2, 6, 7, 10, 11], 'sci': 'Helianthus annuus', 'good': ['Maize', 'Wheat', 'Groundnut'], 'avoid': ['Sunflower']},
        'C019': {'seasons': ['Kharif'], 'months': [5, 6, 7], 'sci': 'Gossypium hirsutum', 'good': ['Wheat', 'Chickpea', 'Mustard', 'Garlic'], 'avoid': ['Cotton', 'Okra']},
        'C020': {'seasons': ['Kharif'], 'months': [3, 4, 5], 'sci': 'Corchorus olitorius', 'good': ['Rice', 'Potato', 'Mustard'], 'avoid': ['Jute']},
        'C021': {'seasons': ['Kharif', 'Zaid'], 'months': [2, 3, 6, 7], 'sci': 'Momordica charantia', 'good': ['Maize', 'Wheat', 'Legumes'], 'avoid': ['Bitter Gourd', 'Cucumber']},
        'C022': {'seasons': ['Kharif', 'Zaid'], 'months': [2, 3, 6, 7], 'sci': 'Lagenaria siceraria', 'good': ['Wheat', 'Maize', 'Mustard'], 'avoid': ['Bottle Gourd', 'Pumpkin']},
        'C023': {'seasons': ['Kharif', 'Rabi', 'Zaid'], 'months': [2, 6, 7, 10, 11], 'sci': 'Solanum melongena', 'good': ['Maize', 'Legumes', 'Wheat'], 'avoid': ['Brinjal', 'Tomato', 'Potato']},
        'C024': {'seasons': ['Rabi'], 'months': [9, 10, 11], 'sci': 'Brassica oleracea var. capitata', 'good': ['Maize', 'Legumes', 'Onion'], 'avoid': ['Cabbage', 'Cauliflower', 'Mustard']},
        'C025': {'seasons': ['Rabi'], 'months': [9, 10], 'sci': 'Daucus carota', 'good': ['Onion', 'Garlic', 'Wheat'], 'avoid': ['Carrot']},
        'C026': {'seasons': ['Rabi'], 'months': [8, 9, 10], 'sci': 'Brassica oleracea var. botrytis', 'good': ['Maize', 'Legumes', 'Onion'], 'avoid': ['Cauliflower', 'Cabbage', 'Mustard']},
        'C027': {'seasons': ['Kharif', 'Zaid'], 'months': [2, 3, 6, 7], 'sci': 'Cucumis sativus', 'good': ['Maize', 'Legumes'], 'avoid': ['Cucumber', 'Pumpkin']},
        'C028': {'seasons': ['Perennial'], 'months': [6, 7, 8, 9], 'sci': 'Moringa oleifera', 'good': ['Intercropped Legumes', 'Pulses'], 'avoid': ['Solanaceous crops']},
        'C029': {'seasons': ['Rabi'], 'months': [9, 10, 11], 'sci': 'Allium sativum', 'good': ['Maize', 'Rice', 'Cotton'], 'avoid': ['Garlic', 'Onion']},
        'C030': {'seasons': ['Kharif', 'Zaid'], 'months': [2, 3, 6, 7], 'sci': 'Abelmoschus esculentus', 'good': ['Legumes', 'Wheat', 'Mustard'], 'avoid': ['Okra', 'Cotton']},
        'C031': {'seasons': ['Kharif', 'Rabi'], 'months': [5, 6, 10, 11], 'sci': 'Allium cepa', 'good': ['Maize', 'Rice', 'Mustard'], 'avoid': ['Onion', 'Garlic']},
        'C032': {'seasons': ['Rabi'], 'months': [10, 11, 12], 'sci': 'Solanum tuberosum', 'good': ['Maize', 'Green Gram', 'Rice'], 'avoid': ['Potato', 'Tomato', 'Brinjal']},
        'C033': {'seasons': ['Kharif', 'Zaid'], 'months': [2, 3, 6, 7], 'sci': 'Cucurbita moschata', 'good': ['Maize', 'Legumes'], 'avoid': ['Pumpkin', 'Cucumber']},
        'C034': {'seasons': ['Rabi', 'Zaid'], 'months': [2, 3, 9, 10, 11], 'sci': 'Raphanus sativus', 'good': ['Onion', 'Garlic', 'Legumes'], 'avoid': ['Radish', 'Cabbage']},
        'C035': {'seasons': ['Kharif', 'Zaid'], 'months': [2, 3, 6, 7], 'sci': 'Luffa acutangula', 'good': ['Maize', 'Legumes'], 'avoid': ['Ridge Gourd']},
        'C036': {'seasons': ['Kharif', 'Rabi', 'Zaid'], 'months': [1, 2, 6, 7, 10, 11], 'sci': 'Solanum lycopersicum', 'good': ['Maize', 'Wheat', 'Mustard', 'Garlic'], 'avoid': ['Tomato', 'Potato', 'Brinjal']},
        'C037': {'seasons': ['Perennial'], 'months': [12, 1, 2], 'sci': 'Malus domestica', 'good': ['Legume cover crops'], 'avoid': ['Solanaceous weeds']},
        'C038': {'seasons': ['Perennial'], 'months': [6, 7, 8], 'sci': 'Musa acuminata', 'good': ['Leguminous intercrops', 'Cowpea'], 'avoid': ['Banana']},
        'C039': {'seasons': ['Perennial'], 'months': [5, 6, 7, 9, 10], 'sci': 'Cocos nucifera', 'good': ['Pineapple', 'Pepper', 'Banana intercrops'], 'avoid': ['Coconut monoculture']},
        'C040': {'seasons': ['Perennial'], 'months': [1, 2], 'sci': 'Vitis vinifera', 'good': ['Legume cover crops'], 'avoid': ['Grapes']},
        'C041': {'seasons': ['Perennial'], 'months': [6, 7, 8], 'sci': 'Artocarpus heterophyllus', 'good': ['Pulse intercrops'], 'avoid': ['Jackfruit monoculture']},
        'C042': {'seasons': ['Perennial'], 'months': [7, 8, 9], 'sci': 'Mangifera indica', 'good': ['Leguminous cover crops', 'Groundnut'], 'avoid': ['Solanaceous intercrops']},
        'C043': {'seasons': ['Zaid'], 'months': [1, 2, 3], 'sci': 'Cucumis melo', 'good': ['Legumes', 'Mustard'], 'avoid': ['Muskmelon', 'Watermelon']},
        'C044': {'seasons': ['Perennial'], 'months': [6, 7, 8], 'sci': 'Citrus reticulata', 'good': ['Legume cover crops'], 'avoid': ['Citrus monoculture']},
        'C045': {'seasons': ['Perennial'], 'months': [2, 3, 6, 7], 'sci': 'Carica papaya', 'good': ['Short duration pulses'], 'avoid': ['Papaya']},
        'C046': {'seasons': ['Perennial'], 'months': [12, 1, 6, 7], 'sci': 'Punica granatum', 'good': ['Legumes', 'Green manure'], 'avoid': ['Pomegranate']},
        'C047': {'seasons': ['Zaid'], 'months': [1, 2, 3], 'sci': 'Citrullus lanatus', 'good': ['Legumes', 'Mustard'], 'avoid': ['Watermelon', 'Muskmelon']},
        'C048': {'seasons': ['Perennial'], 'months': [5, 6], 'sci': 'Piper nigrum', 'good': ['Cardamom', 'Leguminous cover crops'], 'avoid': ['Black Pepper monoculture']},
        'C049': {'seasons': ['Perennial'], 'months': [6, 7], 'sci': 'Elettaria cardamomum', 'good': ['Black Pepper', 'Shade trees'], 'avoid': ['Cardamom monoculture']},
        'C050': {'seasons': ['Rabi'], 'months': [10, 11], 'sci': 'Coriandrum sativum', 'good': ['Maize', 'Rice', 'Legumes'], 'avoid': ['Coriander']},
        'C051': {'seasons': ['Kharif'], 'months': [5, 6], 'sci': 'Curcuma longa', 'good': ['Maize', 'Legumes', 'Banana intercrop'], 'avoid': ['Turmeric', 'Ginger']}
    }

    # Suitable states by crop category / type
    SUITABLE_STATES = {
        'Barley': ['Rajasthan', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh'],
        'Basmati Rice': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand', 'Jammu and Kashmir'],
        'Finger Millet': ['Karnataka', 'Tamil Nadu', 'Uttarakhand', 'Maharashtra', 'Andhra Pradesh'],
        'Maize': ['Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Bihar', 'Rajasthan', 'Gujarat', 'Uttar Pradesh'],
        'Pearl Millet': ['Rajasthan', 'Maharashtra', 'Gujarat', 'Haryana', 'Uttar Pradesh'],
        'Rice': ['West Bengal', 'Punjab', 'Uttar Pradesh', 'Andhra Pradesh', 'Tamil Nadu', 'Odisha', 'Gujarat'],
        'Sorghum': ['Maharashtra', 'Karnataka', 'Rajasthan', 'Madhya Pradesh', 'Andhra Pradesh'],
        'Wheat': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Bihar'],
        'Black Gram': ['Madhya Pradesh', 'Uttar Pradesh', 'Andhra Pradesh', 'Tamil Nadu', 'Maharashtra'],
        'Chickpea': ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'Karnataka'],
        'Green Gram': ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Punjab', 'Haryana'],
        'Horse Gram': ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'Chhattisgarh'],
        'Lentil': ['Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Rajasthan'],
        'Moth Bean': ['Rajasthan', 'Gujarat', 'Haryana', 'Punjab'],
        'Pigeon Pea': ['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Uttar Pradesh', 'Gujarat'],
        'Mustard': ['Gujarat', 'Rajasthan', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh'],
        'Soybean': ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Gujarat'],
        'Sunflower': ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Haryana'],
        'Cotton': ['Gujarat', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Punjab', 'Haryana'],
        'Jute': ['West Bengal', 'Assam', 'Bihar', 'Odisha', 'Meghalaya'],
        'Bitter Gourd': ['Uttar Pradesh', 'Andhra Pradesh', 'Tamil Nadu', 'Kerala', 'Maharashtra'],
        'Bottle Gourd': ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Haryana', 'Punjab'],
        'Brinjal': ['West Bengal', 'Odisha', 'Gujarat', 'Madhya Pradesh', 'Bihar'],
        'Cabbage': ['West Bengal', 'Odisha', 'Bihar', 'Gujarat', 'Karnataka'],
        'Carrot': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Tamil Nadu', 'Karnataka'],
        'Cauliflower': ['West Bengal', 'Bihar', 'Uttar Pradesh', 'Orissa', 'Gujarat'],
        'Cucumber': ['Haryana', 'Karnataka', 'Uttar Pradesh', 'Punjab', 'Gujarat'],
        'Drumstick': ['Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Odisha', 'Gujarat'],
        'Garlic': ['Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'Punjab'],
        'Okra': ['Andhra Pradesh', 'West Bengal', 'Bihar', 'Gujarat', 'Orissa'],
        'Onion': ['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Rajasthan'],
        'Potato': ['Uttar Pradesh', 'West Bengal', 'Bihar', 'Gujarat', 'Punjab'],
        'Pumpkin': ['Uttar Pradesh', 'Odisha', 'Tamil Nadu', 'Kerala', 'Madhya Pradesh'],
        'Radish': ['West Bengal', 'Punjab', 'Haryana', 'Bihar', 'Gujarat'],
        'Ridge Gourd': ['Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Gujarat'],
        'Tomato': ['Andhra Pradesh', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Odisha'],
        'Apple': ['Jammu and Kashmir', 'Himachal Pradesh', 'Uttarakhand'],
        'Banana': ['Tamil Nadu', 'Andhra Pradesh', 'Gujarat', 'Maharashtra', 'Karnataka'],
        'Coconut': ['Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'West Bengal'],
        'Grapes': ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh'],
        'Jackfruit': ['Kerala', 'Tamil Nadu', 'Karnataka', 'Assam', 'West Bengal'],
        'Mango': ['Uttar Pradesh', 'Andhra Pradesh', 'Karnataka', 'Bihar', 'Gujarat'],
        'Muskmelon': ['Punjab', 'Uttar Pradesh', 'Haryana', 'Rajasthan', 'Madhya Pradesh'],
        'Orange/Mandarin': ['Maharashtra', 'Madhya Pradesh', 'Assam', 'Punjab', 'Rajasthan'],
        'Papaya': ['Andhra Pradesh', 'Gujarat', 'Madhya Pradesh', 'Karnataka', 'Maharashtra'],
        'Pomegranate': ['Maharashtra', 'Karnataka', 'Gujarat', 'Andhra Pradesh', 'Rajasthan'],
        'Watermelon': ['Uttar Pradesh', 'Punjab', 'Haryana', 'Karnataka', 'Tamil Nadu'],
        'Black Pepper': ['Kerala', 'Karnataka', 'Tamil Nadu'],
        'Cardamom': ['Kerala', 'Karnataka', 'Tamil Nadu'],
        'Coriander': ['Rajasthan', 'Madhya Pradesh', 'Gujarat', 'Andhra Pradesh'],
        'Turmeric': ['Telangana', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Odisha']
    }

    specs = []
    for r in rows:
        cid = r['crop_id'].strip()
        cname = r['crop_name'].strip()
        ccat = r['crop_category'].strip()

        meta = SEASON_MAP.get(cid, {
            'seasons': ['Kharif'],
            'months': [6, 7],
            'sci': cname,
            'good': ['Legumes', 'Wheat'],
            'avoid': [cname]
        })

        st_list = SUITABLE_STATES.get(cname, ['Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Maharashtra'])

        cat_norm = ccat.lower().rstrip('s')
        if 'cash' in cat_norm or 'commercial' in cat_norm:
            cat_norm = 'commercial'

        spec = {
            'cropId': cid,
            'displayName': cname,
            'scientificName': meta['sci'],
            'category': cat_norm,
            'seasons': meta['seasons'],
            'sowingMonths': meta['months'],
            'phMin': float(r['ph_min']),
            'phMax': float(r['ph_max']),
            'optimalPhMin': float(r['ph_optimal_min']),
            'optimalPhMax': float(r['ph_optimal_max']),
            'idealN': {'min': float(r['nitrogen_min']), 'max': float(r['nitrogen_max'])},
            'idealP': {'min': float(r['phosphorus_min']), 'max': float(r['phosphorus_max'])},
            'idealK': {'min': float(r['potassium_min']), 'max': float(r['potassium_max'])},
            'waterRequirement': r['water_requirement'] if r['water_requirement'] in ['Low', 'Moderate', 'High', 'Very High'] else 'Moderate',
            'waterRequirementMm': {'min': float(r['rainfall_min_mm']), 'max': float(r['rainfall_max_mm'])},
            'tempRange': {
                'min': float(r['temperature_min_c']),
                'optimalMin': float(r['temperature_optimal_min_c']),
                'optimalMax': float(r['temperature_optimal_max_c']),
                'max': float(r['temperature_max_c'])
            },
            'durationDays': {'min': int(float(r['growth_duration_days'])), 'max': int(float(r['growth_duration_days']) * 1.25)},
            'goodPreviousCrops': meta['good'],
            'avoidPreviousCrops': meta['avoid'],
            'suitableStates': st_list,
            'sourceReference': r['source_notes']
        }
        specs.append(spec)

    # Build TS File
    ts_code = """/**
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

export const CROP_KNOWLEDGE_BASE: CropSpecification[] = """

    ts_code += json.dumps(specs, indent=2) + ";\n"

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_code)

    print(f"Successfully generated {ts_path} with {len(specs)} crops.")

if __name__ == '__main__':
    generate_ts()
