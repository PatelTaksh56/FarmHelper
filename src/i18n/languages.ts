/**
 * Central Language Configuration & Capability Mapping for FarmHelper
 * Defines all 14 supported Indian languages with service-specific BCP-47 codes.
 */

export type AppLanguage =
  | 'en-IN'
  | 'hi-IN'
  | 'gu-IN'
  | 'mr-IN'
  | 'bn-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'pa-IN'
  | 'or-IN'
  | 'as-IN'
  | 'sd-IN'
  | 'ur';

export interface LanguageMeta {
  appCode: AppLanguage;
  englishName: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  geminiTextLanguage: string;
  geminiTranscriptionCode: string;
  browserSpeechCode: string;
  ttsVoiceCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    appCode: 'en-IN',
    englishName: 'English',
    nativeName: 'English',
    direction: 'ltr',
    geminiTextLanguage: 'English',
    geminiTranscriptionCode: 'en-IN',
    browserSpeechCode: 'en-IN',
    ttsVoiceCode: 'en-IN',
  },
  {
    appCode: 'hi-IN',
    englishName: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    geminiTextLanguage: 'Hindi (हिन्दी)',
    geminiTranscriptionCode: 'hi-IN',
    browserSpeechCode: 'hi-IN',
    ttsVoiceCode: 'hi-IN',
  },
  {
    appCode: 'gu-IN',
    englishName: 'Gujarati',
    nativeName: 'ગુજરાતી',
    direction: 'ltr',
    geminiTextLanguage: 'Gujarati (ગુજરાતી)',
    geminiTranscriptionCode: 'gu-IN',
    browserSpeechCode: 'gu-IN',
    ttsVoiceCode: 'gu-IN',
  },
  {
    appCode: 'mr-IN',
    englishName: 'Marathi',
    nativeName: 'मराठी',
    direction: 'ltr',
    geminiTextLanguage: 'Marathi (मराठी)',
    geminiTranscriptionCode: 'mr-IN',
    browserSpeechCode: 'mr-IN',
    ttsVoiceCode: 'mr-IN',
  },
  {
    appCode: 'bn-IN',
    englishName: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    geminiTextLanguage: 'Bengali (বাংলা)',
    geminiTranscriptionCode: 'bn-IN',
    browserSpeechCode: 'bn-IN',
    ttsVoiceCode: 'bn-IN',
  },
  {
    appCode: 'kn-IN',
    englishName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    direction: 'ltr',
    geminiTextLanguage: 'Kannada (ಕನ್ನಡ)',
    geminiTranscriptionCode: 'kn-IN',
    browserSpeechCode: 'kn-IN',
    ttsVoiceCode: 'kn-IN',
  },
  {
    appCode: 'ml-IN',
    englishName: 'Malayalam',
    nativeName: 'മലയാളം',
    direction: 'ltr',
    geminiTextLanguage: 'Malayalam (മലയാളം)',
    geminiTranscriptionCode: 'ml-IN',
    browserSpeechCode: 'ml-IN',
    ttsVoiceCode: 'ml-IN',
  },
  {
    appCode: 'ta-IN',
    englishName: 'Tamil',
    nativeName: 'தமிழ்',
    direction: 'ltr',
    geminiTextLanguage: 'Tamil (தமிழ்)',
    geminiTranscriptionCode: 'ta-IN',
    browserSpeechCode: 'ta-IN',
    ttsVoiceCode: 'ta-IN',
  },
  {
    appCode: 'te-IN',
    englishName: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    geminiTextLanguage: 'Telugu (తెలుగు)',
    geminiTranscriptionCode: 'te-IN',
    browserSpeechCode: 'te-IN',
    ttsVoiceCode: 'te-IN',
  },
  {
    appCode: 'pa-IN',
    englishName: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    direction: 'ltr',
    geminiTextLanguage: 'Punjabi (ਪੰਜਾਬੀ)',
    geminiTranscriptionCode: 'pa-IN',
    browserSpeechCode: 'pa-IN',
    ttsVoiceCode: 'pa-IN',
  },
  {
    appCode: 'or-IN',
    englishName: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    direction: 'ltr',
    geminiTextLanguage: 'Odia (ଓଡ଼ିଆ)',
    geminiTranscriptionCode: 'or-IN',
    browserSpeechCode: 'or-IN',
    ttsVoiceCode: 'or-IN',
  },
  {
    appCode: 'as-IN',
    englishName: 'Assamese',
    nativeName: 'অসমীয়া',
    direction: 'ltr',
    geminiTextLanguage: 'Assamese (অসমীয়া)',
    geminiTranscriptionCode: 'as-IN',
    browserSpeechCode: 'as-IN',
    ttsVoiceCode: 'as-IN',
  },
  {
    appCode: 'sd-IN',
    englishName: 'Sindhi',
    nativeName: 'سنڌي',
    direction: 'rtl',
    geminiTextLanguage: 'Sindhi (سنڌي / Sindhi in Arabic Script)',
    geminiTranscriptionCode: 'sd-Arab-IN',
    browserSpeechCode: 'sd-IN',
    ttsVoiceCode: 'sd-IN',
  },
  {
    appCode: 'ur',
    englishName: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl',
    geminiTextLanguage: 'Urdu (اردو)',
    geminiTranscriptionCode: 'ur-IN',
    browserSpeechCode: 'ur-IN',
    ttsVoiceCode: 'ur-PK',
  },
];

export const DEFAULT_LANGUAGE: AppLanguage = 'en-IN';

/**
 * Get language metadata by code with robust fallback normalization
 */
export function getLanguageMeta(code?: string | null): LanguageMeta {
  if (!code) return SUPPORTED_LANGUAGES[0];

  const normalized = code.trim();
  const match = SUPPORTED_LANGUAGES.find(
    (lang) =>
      lang.appCode === normalized ||
      lang.appCode.split('-')[0] === normalized.split('-')[0]
  );

  return match || SUPPORTED_LANGUAGES[0];
}
