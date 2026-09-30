/**
 * Centralized Indian Crop Master Catalog
 * Provides crop definitions, categories, seasons, local names (English & Hindi),
 * search terms, and reusable lookup helpers.
 */

export type CropCategory =
  | 'Cereal'
  | 'Pulse'
  | 'Oilseed'
  | 'Cash Crop'
  | 'Vegetable'
  | 'Fruit'
  | 'Spice'
  | 'Other';

export type CropSeason = 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';

export interface Crop {
  id: string;
  name: string;
  localNames: string[];
  category: CropCategory;
  seasons: CropSeason[];
  searchTerms?: string[];
}

export const CROP_CATALOG: Crop[] = [
  // ================= CEREALS =================
  {
    id: 'wheat',
    name: 'Wheat',
    localNames: ['Gehu', 'गेहूं', 'Kanak'],
    category: 'Cereal',
    seasons: ['Rabi'],
    searchTerms: ['gehu', 'gehun', 'kanak', 'wheat', 'गेहूं'],
  },
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    localNames: ['Dhan', 'धान', 'Chawal', 'चावल'],
    category: 'Cereal',
    seasons: ['Kharif'],
    searchTerms: ['dhan', 'chawal', 'paddy', 'rice', 'धान', 'चावल'],
  },
  {
    id: 'basmati-rice',
    name: 'Basmati Rice',
    localNames: ['Basmati Dhan', 'बासमती चावल', 'Basmati'],
    category: 'Cereal',
    seasons: ['Kharif'],
    searchTerms: ['basmati', 'rice', 'dhan', 'chawal', 'बासमती'],
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    localNames: ['Makka', 'मक्का', 'Bhutta', 'भुट्टा'],
    category: 'Cereal',
    seasons: ['Kharif', 'Rabi'],
    searchTerms: ['makka', 'corn', 'maize', 'bhutta', 'मक्का'],
  },
  {
    id: 'barley',
    name: 'Barley',
    localNames: ['Jau', 'जौ'],
    category: 'Cereal',
    seasons: ['Rabi'],
    searchTerms: ['jau', 'barley', 'जौ'],
  },
  {
    id: 'jowar',
    name: 'Sorghum (Jowar)',
    localNames: ['Jowar', 'ज्वार'],
    category: 'Cereal',
    seasons: ['Kharif', 'Rabi'],
    searchTerms: ['jowar', 'sorghum', 'ज्वार'],
  },
  {
    id: 'bajra',
    name: 'Pearl Millet (Bajra)',
    localNames: ['Bajra', 'बाजरा'],
    category: 'Cereal',
    seasons: ['Kharif'],
    searchTerms: ['bajra', 'millet', 'pearl millet', 'बाजरा'],
  },
  {
    id: 'ragi',
    name: 'Finger Millet (Ragi)',
    localNames: ['Ragi', 'रागी', 'Nachni'],
    category: 'Cereal',
    seasons: ['Kharif'],
    searchTerms: ['ragi', 'nachni', 'finger millet', 'रागी'],
  },
  {
    id: 'foxtail-millet',
    name: 'Foxtail Millet',
    localNames: ['Kangni', 'कांगनी', 'Kakum'],
    category: 'Cereal',
    seasons: ['Kharif'],
    searchTerms: ['kangni', 'kakum', 'foxtail millet'],
  },
  {
    id: 'little-millet',
    name: 'Little Millet',
    localNames: ['Kutki', 'कुटकी'],
    category: 'Cereal',
    seasons: ['Kharif'],
    searchTerms: ['kutki', 'little millet'],
  },
  {
    id: 'kodo-millet',
    name: 'Kodo Millet',
    localNames: ['Kodo', 'कोदो'],
    category: 'Cereal',
    seasons: ['Kharif'],
    searchTerms: ['kodo', 'kodo millet'],
  },
  {
    id: 'proso-millet',
    name: 'Proso Millet',
    localNames: ['Chena', 'चेना'],
    category: 'Cereal',
    seasons: ['Zaid', 'Kharif'],
    searchTerms: ['chena', 'proso millet'],
  },

  // ================= PULSES =================
  {
    id: 'chickpea',
    name: 'Chickpea (Chana)',
    localNames: ['Chana', 'चना', 'Bengal Gram'],
    category: 'Pulse',
    seasons: ['Rabi'],
    searchTerms: ['chana', 'bengal gram', 'chickpea', 'gram', 'चना'],
  },
  {
    id: 'pigeon-pea',
    name: 'Pigeon Pea (Tur/Arhar)',
    localNames: ['Tur', 'Arhar', 'अरहर', 'तूर'],
    category: 'Pulse',
    seasons: ['Kharif'],
    searchTerms: ['tur', 'arhar', 'pigeon pea', 'अरहर', 'तूर'],
  },
  {
    id: 'black-gram',
    name: 'Black Gram (Urad)',
    localNames: ['Urad', 'उड़द', 'Black Lentil'],
    category: 'Pulse',
    seasons: ['Kharif', 'Zaid'],
    searchTerms: ['urad', 'black gram', 'उड़द'],
  },
  {
    id: 'green-gram',
    name: 'Green Gram (Moong)',
    localNames: ['Moong', 'मूंग'],
    category: 'Pulse',
    seasons: ['Kharif', 'Zaid'],
    searchTerms: ['moong', 'mung', 'green gram', 'मूंग'],
  },
  {
    id: 'lentil',
    name: 'Lentil (Masoor)',
    localNames: ['Masoor', 'मसूर'],
    category: 'Pulse',
    seasons: ['Rabi'],
    searchTerms: ['masoor', 'lentil', 'मसूर'],
  },
  {
    id: 'field-pea',
    name: 'Field Pea (Matar)',
    localNames: ['Matar', 'मटर'],
    category: 'Pulse',
    seasons: ['Rabi'],
    searchTerms: ['matar', 'field pea', 'peas', 'मटर'],
  },
  {
    id: 'cowpea',
    name: 'Cowpea (Lobia)',
    localNames: ['Lobia', 'लोबिया', 'Chawli'],
    category: 'Pulse',
    seasons: ['Kharif', 'Zaid'],
    searchTerms: ['lobia', 'chawli', 'cowpea', 'लोबिया'],
  },
  {
    id: 'horse-gram',
    name: 'Horse Gram',
    localNames: ['Kulthi', 'कुलथी'],
    category: 'Pulse',
    seasons: ['Kharif'],
    searchTerms: ['kulthi', 'horse gram', 'कुलथी'],
  },
  {
    id: 'moth-bean',
    name: 'Moth Bean',
    localNames: ['Moth', 'मोठ'],
    category: 'Pulse',
    seasons: ['Kharif'],
    searchTerms: ['moth', 'moth bean', 'मोठ'],
  },

  // ================= OILSEEDS =================
  {
    id: 'mustard',
    name: 'Mustard (Sarson)',
    localNames: ['Sarson', 'सरसों', 'Rai', 'राई'],
    category: 'Oilseed',
    seasons: ['Rabi'],
    searchTerms: ['sarson', 'mustard', 'rai', 'सरसों'],
  },
  {
    id: 'soybean',
    name: 'Soybean',
    localNames: ['Soyabean', 'सोयाबीन'],
    category: 'Oilseed',
    seasons: ['Kharif'],
    searchTerms: ['soybean', 'soyabean', 'soya', 'सोयाबीन'],
  },
  {
    id: 'groundnut',
    name: 'Groundnut (Peanut)',
    localNames: ['Moongphali', 'मूंगफली'],
    category: 'Oilseed',
    seasons: ['Kharif'],
    searchTerms: ['groundnut', 'peanut', 'moongphali', 'मूंगफली'],
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    localNames: ['Surajmukhi', 'सूरजमुखी'],
    category: 'Oilseed',
    seasons: ['Kharif', 'Rabi', 'Zaid'],
    searchTerms: ['sunflower', 'surajmukhi', 'सूरजमुखी'],
  },
  {
    id: 'sesame',
    name: 'Sesame (Til)',
    localNames: ['Til', 'तिल'],
    category: 'Oilseed',
    seasons: ['Kharif'],
    searchTerms: ['til', 'sesame', 'तिल'],
  },
  {
    id: 'safflower',
    name: 'Safflower',
    localNames: ['Kusum', 'कुसुम'],
    category: 'Oilseed',
    seasons: ['Rabi'],
    searchTerms: ['safflower', 'kusum', 'कुसुम'],
  },
  {
    id: 'castor',
    name: 'Castor',
    localNames: ['Arandi', 'अरंडी'],
    category: 'Oilseed',
    seasons: ['Kharif'],
    searchTerms: ['castor', 'arandi', 'अरंडी'],
  },
  {
    id: 'linseed',
    name: 'Linseed (Flaxseed)',
    localNames: ['Alsi', 'अलसी'],
    category: 'Oilseed',
    seasons: ['Rabi'],
    searchTerms: ['linseed', 'flaxseed', 'alsi', 'अलसी'],
  },

  // ================= CASH / FIBRE CROPS =================
  {
    id: 'cotton',
    name: 'Cotton (Kapas)',
    localNames: ['Kapas', 'कपास', 'Rui', 'रुई'],
    category: 'Cash Crop',
    seasons: ['Kharif'],
    searchTerms: ['cotton', 'kapas', 'rui', 'कपास'],
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Ganna)',
    localNames: ['Ganna', 'गन्ना', 'Ikkshu'],
    category: 'Cash Crop',
    seasons: ['Perennial'],
    searchTerms: ['sugarcane', 'ganna', 'गन्ना'],
  },
  {
    id: 'jute',
    name: 'Jute',
    localNames: ['Patson', 'पटसन', 'San'],
    category: 'Cash Crop',
    seasons: ['Kharif'],
    searchTerms: ['jute', 'patson', 'पटसन'],
  },
  {
    id: 'tobacco',
    name: 'Tobacco',
    localNames: ['Tambaku', 'तंबाकू'],
    category: 'Cash Crop',
    seasons: ['Rabi'],
    searchTerms: ['tobacco', 'tambaku', 'तंबाकू'],
  },

  // ================= VEGETABLES =================
  {
    id: 'potato',
    name: 'Potato (Aloo)',
    localNames: ['Aloo', 'आलू'],
    category: 'Vegetable',
    seasons: ['Rabi'],
    searchTerms: ['potato', 'aloo', 'aalu', 'आलू'],
  },
  {
    id: 'tomato',
    name: 'Tomato',
    localNames: ['Tamatar', 'टमाटर'],
    category: 'Vegetable',
    seasons: ['Kharif', 'Rabi', 'Zaid'],
    searchTerms: ['tomato', 'tamatar', 'टमाटर'],
  },
  {
    id: 'onion',
    name: 'Onion',
    localNames: ['Pyaz', 'प्याज़', 'Kanda'],
    category: 'Vegetable',
    seasons: ['Rabi', 'Kharif'],
    searchTerms: ['onion', 'pyaz', 'kanda', 'प्याज़'],
  },
  {
    id: 'garlic',
    name: 'Garlic',
    localNames: ['Lahsun', 'लहसुन'],
    category: 'Vegetable',
    seasons: ['Rabi'],
    searchTerms: ['garlic', 'lahsun', 'लहसुन'],
  },
  {
    id: 'carrot',
    name: 'Carrot',
    localNames: ['Gajar', 'गाजर'],
    category: 'Vegetable',
    seasons: ['Rabi'],
    searchTerms: ['carrot', 'gajar', 'गाजर'],
  },
  {
    id: 'radish',
    name: 'Radish',
    localNames: ['Mooli', 'मूली'],
    category: 'Vegetable',
    seasons: ['Rabi', 'Zaid'],
    searchTerms: ['radish', 'mooli', 'मूली'],
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower',
    localNames: ['Phool Gobhi', 'फूलगोभी'],
    category: 'Vegetable',
    seasons: ['Rabi'],
    searchTerms: ['cauliflower', 'phool gobhi', 'gobhi', 'फूलगोभी'],
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    localNames: ['Patta Gobhi', 'पत्तागोभी'],
    category: 'Vegetable',
    seasons: ['Rabi'],
    searchTerms: ['cabbage', 'patta gobhi', 'gobhi', 'पत्तागोभी'],
  },
  {
    id: 'brinjal',
    name: 'Brinjal (Eggplant)',
    localNames: ['Baingan', 'बैंगन'],
    category: 'Vegetable',
    seasons: ['Kharif', 'Rabi'],
    searchTerms: ['brinjal', 'eggplant', 'baingan', 'बैंगन'],
  },
  {
    id: 'okra',
    name: 'Okra (Bhindi)',
    localNames: ['Bhindi', 'भिंडी'],
    category: 'Vegetable',
    seasons: ['Kharif', 'Zaid'],
    searchTerms: ['okra', 'bhindi', 'ladyfinger', 'भिंडी'],
  },
  {
    id: 'spinach',
    name: 'Spinach',
    localNames: ['Palak', 'पालक'],
    category: 'Vegetable',
    seasons: ['Rabi', 'Zaid'],
    searchTerms: ['spinach', 'palak', 'पालक'],
  },
  {
    id: 'chilli-veg',
    name: 'Green Chilli',
    localNames: ['Hari Mirch', 'हरी मिर्च'],
    category: 'Vegetable',
    seasons: ['Kharif', 'Rabi'],
    searchTerms: ['chilli', 'chili', 'mirch', 'hari mirch', 'हरी मिर्च'],
  },
  {
    id: 'capsicum',
    name: 'Capsicum (Bell Pepper)',
    localNames: ['Shimla Mirch', 'शिमला मिर्च'],
    category: 'Vegetable',
    seasons: ['Rabi', 'Zaid'],
    searchTerms: ['capsicum', 'bell pepper', 'shimla mirch', 'शिमला मिर्च'],
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    localNames: ['Khira', 'खीरा', 'Kakdi'],
    category: 'Vegetable',
    seasons: ['Zaid', 'Kharif'],
    searchTerms: ['cucumber', 'khira', 'kheera', 'kakdi', 'खीरा'],
  },
  {
    id: 'bottle-gourd',
    name: 'Bottle Gourd',
    localNames: ['Lauki', 'लौकी', 'Ghiya'],
    category: 'Vegetable',
    seasons: ['Kharif', 'Zaid'],
    searchTerms: ['bottle gourd', 'lauki', 'ghiya', 'लौकी'],
  },
  {
    id: 'bitter-gourd',
    name: 'Bitter Gourd',
    localNames: ['Karela', 'करेला'],
    category: 'Vegetable',
    seasons: ['Kharif', 'Zaid'],
    searchTerms: ['bitter gourd', 'karela', 'करेला'],
  },
  {
    id: 'ridge-gourd',
    name: 'Ridge Gourd',
    localNames: ['Tori', 'तोरी', 'Turai'],
    category: 'Vegetable',
    seasons: ['Kharif', 'Zaid'],
    searchTerms: ['ridge gourd', 'tori', 'turai', 'तोरी'],
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    localNames: ['Kaddu', 'कद्दू'],
    category: 'Vegetable',
    seasons: ['Kharif', 'Zaid'],
    searchTerms: ['pumpkin', 'kaddu', 'कद्दू'],
  },
  {
    id: 'drumstick',
    name: 'Drumstick (Moringa)',
    localNames: ['Sehjan', 'सहजन', 'Moringa'],
    category: 'Vegetable',
    seasons: ['Perennial'],
    searchTerms: ['drumstick', 'moringa', 'sehjan', 'सहजन'],
  },

  // ================= FRUITS =================
  {
    id: 'mango',
    name: 'Mango',
    localNames: ['Aam', 'आम'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['mango', 'aam', 'आम'],
  },
  {
    id: 'banana',
    name: 'Banana',
    localNames: ['Kela', 'केला'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['banana', 'kela', 'केला'],
  },
  {
    id: 'guava',
    name: 'Guava',
    localNames: ['Amrood', 'अमरूद'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['guava', 'amrood', 'अमरूद'],
  },
  {
    id: 'papaya',
    name: 'Papaya',
    localNames: ['Papita', 'पपीता'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['papaya', 'papita', 'पपीता'],
  },
  {
    id: 'pomegranate',
    name: 'Pomegranate',
    localNames: ['Anaar', 'अनार'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['pomegranate', 'anaar', 'अनार'],
  },
  {
    id: 'orange',
    name: 'Orange (Mandarin)',
    localNames: ['Santra', 'संतरा'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['orange', 'santra', 'संतरा'],
  },
  {
    id: 'sweet-lime',
    name: 'Sweet Lime (Mosambi)',
    localNames: ['Mosambi', 'मौसमी'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['sweet lime', 'mosambi', 'मौसमी'],
  },
  {
    id: 'grapes',
    name: 'Grapes',
    localNames: ['Angoor', 'अंगूर'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['grapes', 'angoor', 'अंगूर'],
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    localNames: ['Tarbooz', 'तरबूज'],
    category: 'Fruit',
    seasons: ['Zaid'],
    searchTerms: ['watermelon', 'tarbooz', 'तरबूज'],
  },
  {
    id: 'muskmelon',
    name: 'Muskmelon',
    localNames: ['Kharbooza', 'खरबूजा'],
    category: 'Fruit',
    seasons: ['Zaid'],
    searchTerms: ['muskmelon', 'kharbooza', 'खरबूजा'],
  },
  {
    id: 'apple',
    name: 'Apple',
    localNames: ['Seb', 'सेब'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['apple', 'seb', 'सेब'],
  },
  {
    id: 'litchi',
    name: 'Litchi',
    localNames: ['Litchi', 'लीची'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['litchi', 'lychee', 'लीची'],
  },
  {
    id: 'coconut',
    name: 'Coconut',
    localNames: ['Nariyal', 'नारियल'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['coconut', 'nariyal', 'नारियल'],
  },
  {
    id: 'cashew',
    name: 'Cashew Nut',
    localNames: ['Kaju', 'काजू'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['cashew', 'kaju', 'काजू'],
  },
  {
    id: 'jackfruit',
    name: 'Jackfruit',
    localNames: ['Kathal', 'कटहल'],
    category: 'Fruit',
    seasons: ['Perennial'],
    searchTerms: ['jackfruit', 'kathal', 'कटहल'],
  },

  // ================= SPICES =================
  {
    id: 'red-chilli',
    name: 'Red Chilli',
    localNames: ['Lal Mirch', 'लाल मिर्च'],
    category: 'Spice',
    seasons: ['Kharif', 'Rabi'],
    searchTerms: ['chilli', 'red chilli', 'lal mirch', 'लाल मिर्च'],
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    localNames: ['Haldi', 'हल्दी'],
    category: 'Spice',
    seasons: ['Kharif'],
    searchTerms: ['turmeric', 'haldi', 'हल्दी'],
  },
  {
    id: 'ginger',
    name: 'Ginger',
    localNames: ['Adrak', 'अदरक'],
    category: 'Spice',
    seasons: ['Kharif'],
    searchTerms: ['ginger', 'adrak', 'अदरक'],
  },
  {
    id: 'coriander',
    name: 'Coriander',
    localNames: ['Dhania', 'धनिया'],
    category: 'Spice',
    seasons: ['Rabi'],
    searchTerms: ['coriander', 'dhania', 'dhaniya', 'धनिया'],
  },
  {
    id: 'cumin',
    name: 'Cumin',
    localNames: ['Jeera', 'जीरा'],
    category: 'Spice',
    seasons: ['Rabi'],
    searchTerms: ['cumin', 'jeera', 'जीरा'],
  },
  {
    id: 'fennel',
    name: 'Fennel',
    localNames: ['Saunf', 'सौंफ'],
    category: 'Spice',
    seasons: ['Rabi'],
    searchTerms: ['fennel', 'saunf', 'सौंफ'],
  },
  {
    id: 'fenugreek',
    name: 'Fenugreek',
    localNames: ['Methi', 'मेथी'],
    category: 'Spice',
    seasons: ['Rabi'],
    searchTerms: ['fenugreek', 'methi', 'मेथी'],
  },
  {
    id: 'black-pepper',
    name: 'Black Pepper',
    localNames: ['Kali Mirch', 'काली मिर्च'],
    category: 'Spice',
    seasons: ['Perennial'],
    searchTerms: ['black pepper', 'kali mirch', 'काली मिर्च'],
  },
  {
    id: 'cardamom',
    name: 'Cardamom',
    localNames: ['Elaichi', 'इलायची'],
    category: 'Spice',
    seasons: ['Perennial'],
    searchTerms: ['cardamom', 'elaichi', 'इलायची'],
  },
  {
    id: 'clove',
    name: 'Clove',
    localNames: ['Laung', 'लौंग'],
    category: 'Spice',
    seasons: ['Perennial'],
    searchTerms: ['clove', 'laung', 'लौंग'],
  },

  // ================= OTHER =================
  {
    id: 'other',
    name: 'Other',
    localNames: ['Any Other Crop', 'अन्य फसल'],
    category: 'Other',
    seasons: ['Kharif', 'Rabi', 'Zaid', 'Perennial'],
    searchTerms: ['other', 'custom', 'अन्य'],
  },
];

export const REMOVED_FARM_ADD_CROP_IDS = new Set<string>([
  'foxtail-millet',
  'little-millet',
  'kodo-millet',
  'proso-millet',
  'field-pea',
  'cowpea',
  'groundnut',
  'sesame',
  'safflower',
  'castor',
  'linseed',
  'sugarcane',
  'tobacco',
  'spinach',
  'chilli-veg',
  'capsicum',
  'guava',
  'sweet-lime',
  'litchi',
  'cashew',
  'red-chilli',
  'ginger',
  'cumin',
  'fennel',
  'fenugreek',
  'clove',
]);

/**
 * Helper to check if a crop is excluded from the Farm Add crop selector.
 */
export function isFarmAddExcludedCrop(crop: Crop | string): boolean {
  if (typeof crop === 'string') {
    const lower = crop.trim().toLowerCase();
    const match = CROP_CATALOG.find(
      (c) => c.id.toLowerCase() === lower || c.name.toLowerCase() === lower
    );
    if (match) {
      return REMOVED_FARM_ADD_CROP_IDS.has(match.id);
    }
    return REMOVED_FARM_ADD_CROP_IDS.has(lower);
  }
  return REMOVED_FARM_ADD_CROP_IDS.has(crop.id);
}

/**
 * Retrieve a crop definition by its ID.
 */
export function getCropById(id: string): Crop | undefined {
  return CROP_CATALOG.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

/**
 * Filter crops by category.
 */
export function getCropsByCategory(category: CropCategory): Crop[] {
  return CROP_CATALOG.filter((c) => c.category === category);
}

/**
 * Filter crops by growing season.
 */
export function getCropsBySeason(season: CropSeason): Crop[] {
  return CROP_CATALOG.filter((c) => c.seasons.includes(season));
}

/**
 * Perform multi-field search across crop name, local names, category, and search terms.
 */
export function searchCrops(
  query: string,
  options?: { excludeFarmAddCrops?: boolean }
): Crop[] {
  const normalized = query.trim().toLowerCase();
  let baseList = CROP_CATALOG;
  if (options?.excludeFarmAddCrops) {
    baseList = baseList.filter((crop) => !isFarmAddExcludedCrop(crop));
  }
  if (!normalized) return baseList;

  return baseList.filter((crop) => {
    if (crop.name.toLowerCase().includes(normalized)) return true;
    if (crop.category.toLowerCase().includes(normalized)) return true;
    if (crop.localNames.some((l) => l.toLowerCase().includes(normalized))) return true;
    if (crop.searchTerms?.some((s) => s.toLowerCase().includes(normalized))) return true;
    return false;
  });
}

/**
 * Helper to map existing legacy crop strings (e.g., "Wheat (Kanak)", "Mustard (Sarson)")
 * to clean catalog names or preserve custom names cleanly.
 */
export function mapLegacyCropName(rawCropName: string): string {
  if (!rawCropName || !rawCropName.trim()) return 'Wheat';

  const clean = rawCropName.trim();
  const lower = clean.toLowerCase();

  // Legacy string mappings
  if (lower.includes('wheat') || lower.includes('kanak') || lower.includes('gehu')) return 'Wheat';
  if (lower.includes('basmati')) return 'Basmati Rice';
  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('dhan')) return 'Rice (Paddy)';
  if (lower.includes('mustard') || lower.includes('sarson')) return 'Mustard (Sarson)';
  if (lower.includes('cotton') || lower.includes('kapas')) return 'Cotton (Kapas)';
  if (lower.includes('sugarcane') || lower.includes('ganna')) return 'Sugarcane (Ganna)';
  if (lower.includes('maize') || lower.includes('makka') || lower.includes('corn')) return 'Maize (Corn)';
  if (lower.includes('soyabean') || lower.includes('soybean')) return 'Soybean';
  if (lower.includes('potato') || lower.includes('aloo')) return 'Potato (Aloo)';

  // Check direct catalog match
  const match = CROP_CATALOG.find((c) => c.name.toLowerCase() === lower);
  if (match) return match.name;

  return clean;
}

/**
 * Get i18n translation key for a crop ID or crop name (e.g., 'wheat' -> 'crops.wheat').
 */
export function getCropTranslationKey(cropIdOrName: string): string {
  if (!cropIdOrName) return 'crops.wheat';

  const mappedName = mapLegacyCropName(cropIdOrName);
  const match = CROP_CATALOG.find(
    (c) => c.id.toLowerCase() === cropIdOrName.toLowerCase() || c.name.toLowerCase() === mappedName.toLowerCase()
  );

  if (!match) return '';

  const camelKey = match.id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `crops.${camelKey}`;
}

export const CROP_GROWTH_DAYS: Record<string, number> = {
  // Cereals
  'wheat': 120,
  'rice': 120,
  'basmati-rice': 135,
  'maize': 100,
  'barley': 110,
  'jowar': 110,
  'bajra': 90,
  'ragi': 110,
  'foxtail-millet': 85,
  'little-millet': 85,
  'kodo-millet': 85,
  'proso-millet': 85,
  // Pulses
  'chickpea': 110,
  'pigeon-pea': 180,
  'black-gram': 80,
  'green-gram': 75,
  'lentil': 110,
  'field-pea': 90,
  'cowpea': 80,
  'horse-gram': 90,
  'moth-bean': 75,
  // Oilseeds
  'mustard': 110,
  'soybean': 100,
  'groundnut': 120,
  'sunflower': 95,
  'sesame': 85,
  'safflower': 120,
  'castor': 150,
  'linseed': 110,
  // Cash Crops
  'cotton': 160,
  'sugarcane': 365,
  'jute': 120,
  'tobacco': 120,
  // Vegetables
  'potato': 90,
  'tomato': 90,
  'onion': 120,
  'garlic': 130,
  'carrot': 80,
  'radish': 45,
  'cauliflower': 85,
  'cabbage': 85,
  'brinjal': 100,
  'okra': 60,
  'spinach': 40,
  'chilli-veg': 120,
  'capsicum': 100,
  'cucumber': 60,
  'bottle-gourd': 75,
  'bitter-gourd': 75,
  'ridge-gourd': 75,
  'pumpkin': 75,
  'drumstick': 180,
  // Spices
  'red-chilli': 120,
  'turmeric': 240,
  'ginger': 240,
  'coriander': 90,
  'cumin': 110,
  'fennel': 120,
  'fenugreek': 90,
};

/**
 * Get crop-specific growth duration in days.
 */
export function getCropGrowthDays(rawCropName: string): number {
  if (!rawCropName) return 120;
  const lower = rawCropName.toLowerCase().trim();

  if (CROP_GROWTH_DAYS[lower]) return CROP_GROWTH_DAYS[lower];

  const match = CROP_CATALOG.find(
    (c) =>
      c.id.toLowerCase() === lower ||
      c.name.toLowerCase() === lower ||
      c.localNames.some((l) => l.toLowerCase() === lower) ||
      c.searchTerms?.some((s) => s.toLowerCase() === lower)
  );

  if (match && CROP_GROWTH_DAYS[match.id]) {
    return CROP_GROWTH_DAYS[match.id];
  }

  if (lower.includes('wheat') || lower.includes('gehu') || lower.includes('kanak')) return 120;
  if (lower.includes('basmati')) return 135;
  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('dhan')) return 120;
  if (lower.includes('mustard') || lower.includes('sarson')) return 110;
  if (lower.includes('cotton') || lower.includes('kapas')) return 160;
  if (lower.includes('sugarcane') || lower.includes('ganna')) return 365;
  if (lower.includes('potato') || lower.includes('aloo')) return 90;
  if (lower.includes('onion') || lower.includes('pyaz')) return 120;
  if (lower.includes('maize') || lower.includes('makka')) return 100;
  if (lower.includes('soybean') || lower.includes('soyabean')) return 100;

  return 120;
}

/**
 * Safely parse a date string (YYYY-MM-DD), Date, or Timestamp into a local midnight Date.
 * Avoids UTC timezone offsets when parsing YYYY-MM-DD.
 */
export function parseLocalMidnightDate(input: any): Date | null {
  if (!input) return null;

  if (typeof input === 'object' && typeof input.toDate === 'function') {
    const d = input.toDate();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, month, day);
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return null;
}

/**
 * Add N days to a Date object.
 */
export function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}
