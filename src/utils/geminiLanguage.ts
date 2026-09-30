/**
 * Central Gemini AI Language Instruction Module for FarmHelper
 * Provides explicit language prompts for all 14 supported Indian languages.
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  instruction: string;
}

const LANGUAGE_MAP: Record<string, LanguageConfig> = {
  'gu-IN': {
    code: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    instruction:
      'Respond ENTIRELY in Gujarati (ગુજરાતી). Use simple, clear Gujarati that is easy for Indian farmers to understand. All diagnostic explanations, observed symptoms, causes, treatment steps, and prevention advice MUST be in Gujarati. Keep scientific/Latin names (e.g., Puccinia striiformis) and chemical pesticide names in standard form.',
  },
  gu: {
    code: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    instruction:
      'Respond ENTIRELY in Gujarati (ગુજરાતી). Use simple, clear Gujarati that is easy for Indian farmers to understand. All diagnostic explanations, observed symptoms, causes, treatment steps, and prevention advice MUST be in Gujarati. Keep scientific/Latin names (e.g., Puccinia striiformis) and chemical pesticide names in standard form.',
  },
  'hi-IN': {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    instruction:
      'Respond ENTIRELY in Hindi (हिन्दी). Use simple, clear Hindi that is easy for Indian farmers to understand. All diagnostic explanations, observed symptoms, causes, treatment steps, and prevention advice MUST be in Hindi. Keep scientific/Latin names and chemical names in standard form.',
  },
  hi: {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    instruction:
      'Respond ENTIRELY in Hindi (हिन्दी). Use simple, clear Hindi that is easy for Indian farmers to understand. All diagnostic explanations, observed symptoms, causes, treatment steps, and prevention advice MUST be in Hindi. Keep scientific/Latin names and chemical names in standard form.',
  },
  'mr-IN': {
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    instruction:
      'Respond ENTIRELY in Marathi (मराठी). Use simple, clear Marathi that is easy for Indian farmers to understand. All diagnostic explanations, observed symptoms, causes, treatment steps, and prevention advice MUST be in Marathi. Keep scientific/Latin names and chemical names in standard form.',
  },
  mr: {
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    instruction:
      'Respond ENTIRELY in Marathi (मराठी). Use simple, clear Marathi that is easy for Indian farmers to understand. All diagnostic explanations, observed symptoms, causes, treatment steps, and prevention advice MUST be in Marathi. Keep scientific/Latin names and chemical names in standard form.',
  },
  'bn-IN': {
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    instruction:
      'Respond ENTIRELY in Bengali (বাংলা). Use simple, clear Bengali suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Bengali. Keep scientific/Latin names and chemical names in standard form.',
  },
  bn: {
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    instruction:
      'Respond ENTIRELY in Bengali (বাংলা). Use simple, clear Bengali suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Bengali. Keep scientific/Latin names and chemical names in standard form.',
  },
  'pa-IN': {
    code: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    instruction:
      'Respond ENTIRELY in Punjabi (ਪੰਜਾਬੀ). Use simple, clear Punjabi suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Punjabi. Keep scientific/Latin names and chemical names in standard form.',
  },
  pa: {
    code: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    instruction:
      'Respond ENTIRELY in Punjabi (ਪੰਜਾਬੀ). Use simple, clear Punjabi suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Punjabi. Keep scientific/Latin names and chemical names in standard form.',
  },
  'ta-IN': {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    instruction:
      'Respond ENTIRELY in Tamil (தமிழ்). Use simple, clear Tamil suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Tamil. Keep scientific/Latin names and chemical names in standard form.',
  },
  ta: {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    instruction:
      'Respond ENTIRELY in Tamil (தமிழ்). Use simple, clear Tamil suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Tamil. Keep scientific/Latin names and chemical names in standard form.',
  },
  'te-IN': {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    instruction:
      'Respond ENTIRELY in Telugu (తెలుగు). Use simple, clear Telugu suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Telugu. Keep scientific/Latin names and chemical names in standard form.',
  },
  te: {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    instruction:
      'Respond ENTIRELY in Telugu (తెలుగు). Use simple, clear Telugu suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Telugu. Keep scientific/Latin names and chemical names in standard form.',
  },
  'kn-IN': {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    instruction:
      'Respond ENTIRELY in Kannada (ಕನ್ನಡ). Use simple, clear Kannada suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Kannada. Keep scientific/Latin names and chemical names in standard form.',
  },
  kn: {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    instruction:
      'Respond ENTIRELY in Kannada (ಕನ್ನಡ). Use simple, clear Kannada suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Kannada. Keep scientific/Latin names and chemical names in standard form.',
  },
  'ml-IN': {
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    instruction:
      'Respond ENTIRELY in Malayalam (മലയാളം). Use simple, clear Malayalam suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Malayalam. Keep scientific/Latin names and chemical names in standard form.',
  },
  ml: {
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    instruction:
      'Respond ENTIRELY in Malayalam (മലയാളം). Use simple, clear Malayalam suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Malayalam. Keep scientific/Latin names and chemical names in standard form.',
  },
  'or-IN': {
    code: 'or-IN',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    instruction:
      'Respond ENTIRELY in Odia (ଓଡ଼ିଆ). Use simple, clear Odia suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Odia. Keep scientific/Latin names and chemical names in standard form.',
  },
  or: {
    code: 'or-IN',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    instruction:
      'Respond ENTIRELY in Odia (ଓଡ଼ିଆ). Use simple, clear Odia suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Odia. Keep scientific/Latin names and chemical names in standard form.',
  },
  'as-IN': {
    code: 'as-IN',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    instruction:
      'Respond ENTIRELY in Assamese (অসমীয়া). Use simple, clear Assamese suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Assamese. Keep scientific/Latin names and chemical names in standard form.',
  },
  as: {
    code: 'as-IN',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    instruction:
      'Respond ENTIRELY in Assamese (অসমীয়া). Use simple, clear Assamese suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Assamese. Keep scientific/Latin names and chemical names in standard form.',
  },
  'ur-IN': {
    code: 'ur-IN',
    name: 'Urdu',
    nativeName: 'اردو',
    instruction:
      'Respond ENTIRELY in Urdu (اردو). Use simple, clear Urdu suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Urdu. Keep scientific/Latin names and chemical names in standard form.',
  },
  ur: {
    code: 'ur-IN',
    name: 'Urdu',
    nativeName: 'اردو',
    instruction:
      'Respond ENTIRELY in Urdu (اردو). Use simple, clear Urdu suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Urdu. Keep scientific/Latin names and chemical names in standard form.',
  },
  'sd-IN': {
    code: 'sd-IN',
    name: 'Sindhi',
    nativeName: 'سنڌي',
    instruction:
      'Respond ENTIRELY in Sindhi (سنڌي). Use simple, clear Sindhi suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Sindhi. Keep scientific/Latin names and chemical names in standard form.',
  },
  sd: {
    code: 'sd-IN',
    name: 'Sindhi',
    nativeName: 'سنڌي',
    instruction:
      'Respond ENTIRELY in Sindhi (سنڌي). Use simple, clear Sindhi suitable for farmers. All diagnostic explanations, symptoms, causes, treatment, and prevention advice MUST be in Sindhi. Keep scientific/Latin names and chemical names in standard form.',
  },
  'en-IN': {
    code: 'en-IN',
    name: 'English',
    nativeName: 'English',
    instruction:
      'Respond ENTIRELY in English. Use clear, farmer-friendly terms suitable for Indian agricultural context.',
  },
  en: {
    code: 'en-IN',
    name: 'English',
    nativeName: 'English',
    instruction:
      'Respond ENTIRELY in English. Use clear, farmer-friendly terms suitable for Indian agricultural context.',
  },
};

/**
 * Get explicit Gemini language prompt instruction for a given language code
 */
export function getGeminiLanguageInstruction(langCode?: string): string {
  if (!langCode) {
    return LANGUAGE_MAP['en-IN'].instruction;
  }
  const config = LANGUAGE_MAP[langCode] || LANGUAGE_MAP[langCode.split('-')[0]];
  return config ? config.instruction : LANGUAGE_MAP['en-IN'].instruction;
}
