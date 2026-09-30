/**
 * FarmHelper Centralized i18n Engine & React Translation Hook
 * Supports all 14 Indian languages with fallback hierarchy and dynamic RTL document handling.
 */
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES, getLanguageMeta, AppLanguage } from './languages';

import enIN from './en-IN.json';
import hiIN from './hi-IN.json';
import guIN from './gu-IN.json';
import mrIN from './mr-IN.json';
import bnIN from './bn-IN.json';
import knIN from './kn-IN.json';
import mlIN from './ml-IN.json';
import taIN from './ta-IN.json';
import teIN from './te-IN.json';
import paIN from './pa-IN.json';
import orIN from './or-IN.json';
import asIN from './as-IN.json';
import sdIN from './sd-IN.json';
import urJSON from './ur.json';

type TranslationDictionary = Record<string, Record<string, string>>;

const dictionaries: Record<string, TranslationDictionary> = {
  'en-IN': enIN,
  'en': enIN,
  'hi-IN': hiIN,
  'hi': hiIN,
  'gu-IN': guIN,
  'gu': guIN,
  'mr-IN': mrIN,
  'mr': mrIN,
  'bn-IN': bnIN,
  'bn': bnIN,
  'kn-IN': knIN,
  'kn': knIN,
  'ml-IN': mlIN,
  'ml': mlIN,
  'ta-IN': taIN,
  'ta': taIN,
  'te-IN': teIN,
  'te': teIN,
  'pa-IN': paIN,
  'pa': paIN,
  'or-IN': orIN,
  'or': orIN,
  'as-IN': asIN,
  'as': asIN,
  'sd-IN': sdIN,
  'sd': sdIN,
  'ur': urJSON,
  'ur-IN': urJSON,
};

/**
 * Resolve a nested dot-separated translation key (e.g. 'nav.overview')
 */
function getNestedValue(dict: TranslationDictionary, key: string): string | undefined {
  if (!dict || !key) return undefined;
  
  const parts = key.split('.');
  if (parts.length === 2 && dict[parts[0]] && dict[parts[0]][parts[1]]) {
    return dict[parts[0]][parts[1]];
  }
  
  // Direct key lookup
  if (typeof dict[key] === 'string') {
    return dict[key] as unknown as string;
  }

  return undefined;
}

/**
 * Synchronize document direction (dir="rtl" / "ltr") and lang attribute
 */
export function syncDocumentDirection(languageCode: string): void {
  const meta = getLanguageMeta(languageCode);
  if (typeof document !== 'undefined') {
    document.documentElement.dir = meta.direction;
    document.documentElement.lang = meta.appCode;
  }
}

export function useTranslation() {
  const { userSettings } = useAuth();
  const currentLangCode = userSettings.preferredLanguage || 'en-IN';
  const meta = getLanguageMeta(currentLangCode);
  
  const currentDict = dictionaries[meta.appCode] || dictionaries['en-IN'];
  const fallbackDict = dictionaries['en-IN'];

  // Apply RTL/LTR document direction automatically
  syncDocumentDirection(meta.appCode);

  const t = (key: string, fallback?: string): string => {
    const val = getNestedValue(currentDict, key);
    if (val !== undefined) return val;

    const fallbackVal = getNestedValue(fallbackDict, key);
    if (fallbackVal !== undefined) return fallbackVal;

    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] Missing translation key: ${meta.appCode}.${key}`);
    }

    return fallback !== undefined ? fallback : key;
  };

  return {
    t,
    lang: meta.appCode,
    languageMeta: meta,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRTL: meta.direction === 'rtl',
  };
}

export { SUPPORTED_LANGUAGES, getLanguageMeta };
