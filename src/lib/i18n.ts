/**
 * i18n Configuration
 * 
 * Internationalization setup using react-i18next.
 * Supports: Portuguese (BR), English (US/GB), Spanish, French, Russian, Chinese, Hindi
 * 
 * @module lib/i18n
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enUS from './locales/en-US.json';
import ptBR from './locales/pt-BR.json';
import esES from './locales/es-ES.json';
import frFR from './locales/fr-FR.json';
import ruRU from './locales/ru-RU.json';
import zhCN from './locales/zh-CN.json';
import hiIN from './locales/hi-IN.json';

// Supported languages configuration (deduplicated - single English entry)
export const SUPPORTED_LANGUAGES = {
  'pt-BR': { name: 'Português', flag: '🇧🇷', dir: 'ltr' },
  'en-US': { name: 'English', flag: '🇺🇸', dir: 'ltr' },
  'es-ES': { name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  'fr-FR': { name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  'ru-RU': { name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  'zh-CN': { name: '中文', flag: '🇨🇳', dir: 'ltr' },
  'hi-IN': { name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
} as const;

export type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Resources for i18next (deduplicated)
const resources = {
  'pt-BR': { translation: ptBR },
  'en-US': { translation: enUS },
  'es-ES': { translation: esES },
  'fr-FR': { translation: frFR },
  'ru-RU': { translation: ruRU },
  'zh-CN': { translation: zhCN },
  'hi-IN': { translation: hiIN },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'Vocaid_language',
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React already handles escaping
    },
    
    // React specific options
    react: {
      useSuspense: false, // Disable suspense for immediate re-renders
      bindI18n: 'languageChanged loaded', // Bind to language change events
      bindI18nStore: 'added removed', // Bind to store changes
    },
  });

/**
 * Change the current language
 */
export const changeLanguage = async (languageCode: SupportedLanguageCode): Promise<void> => {
  await i18n.changeLanguage(languageCode);
  localStorage.setItem('Vocaid_language', languageCode);
  
  // Update document direction for RTL languages
  const lang = SUPPORTED_LANGUAGES[languageCode];
  document.documentElement.dir = lang.dir;
  document.documentElement.lang = languageCode;
};

/**
 * Get the current language code
 */
export const getCurrentLanguage = (): SupportedLanguageCode => {
  return (i18n.language as SupportedLanguageCode) || 'en-US';
};

/**
 * Check if a language code is supported
 */
export const isLanguageSupported = (code: string): code is SupportedLanguageCode => {
  return code in SUPPORTED_LANGUAGES;
};

/**
 * Get language display info
 */
export const getLanguageInfo = (code: SupportedLanguageCode) => {
  return SUPPORTED_LANGUAGES[code];
};

export default i18n;
