/**
 * Geolocation Utility
 * 
 * IP-based country detection with language inference.
 * Uses Vercel Edge headers when available, with fallback to external API.
 * 
 * @module lib/geolocation
 */

import { SupportedLanguageCode } from './i18n';

// ========================================
// TYPES
// ========================================

export interface GeoLocation {
  country: string;        // ISO 3166-1 alpha-2 (e.g., "BR", "US", "ES")
  countryName: string;    // Full name (e.g., "Brazil")
  region: string;         // Geographic region (e.g., "LATAM", "EMEA")
  city?: string;          // City name if available
  ip?: string;            // IP address
  inferredLanguage: SupportedLanguageCode;
  source: 'vercel' | 'api' | 'fallback';
}

// ========================================
// COUNTRY TO LANGUAGE MAPPING
// ========================================

/**
 * Map countries to their most commonly spoken language
 * using our supported language codes
 */
const COUNTRY_TO_LANGUAGE: Record<string, SupportedLanguageCode> = {
  // Portuguese
  BR: 'pt-BR',
  PT: 'pt-BR', // Portugal uses Brazilian Portuguese in our app
  AO: 'pt-BR', // Angola
  MZ: 'pt-BR', // Mozambique
  
  // Spanish
  ES: 'es-ES',
  MX: 'es-ES',
  AR: 'es-ES',
  CO: 'es-ES',
  CL: 'es-ES',
  PE: 'es-ES',
  VE: 'es-ES',
  EC: 'es-ES',
  GT: 'es-ES',
  CU: 'es-ES',
  BO: 'es-ES',
  DO: 'es-ES',
  HN: 'es-ES',
  PY: 'es-ES',
  SV: 'es-ES',
  NI: 'es-ES',
  CR: 'es-ES',
  PA: 'es-ES',
  UY: 'es-ES',
  
  // French
  FR: 'fr-FR',
  BE: 'fr-FR',
  CH: 'fr-FR', // Switzerland (French-speaking)
  CA: 'fr-FR', // Canada (Quebec - could also be en-US)
  SN: 'fr-FR', // Senegal
  CI: 'fr-FR', // Ivory Coast
  
  // Russian
  RU: 'ru-RU',
  BY: 'ru-RU', // Belarus
  KZ: 'ru-RU', // Kazakhstan
  UA: 'ru-RU', // Ukraine (though Ukrainian is primary)
  
  // Chinese
  CN: 'zh-CN',
  TW: 'zh-CN', // Taiwan (Traditional, but we use Simplified)
  HK: 'zh-CN', // Hong Kong
  SG: 'zh-CN', // Singapore
  
  // Hindi
  IN: 'hi-IN',
  
  // English US (consolidated - all English-speaking countries use en-US)
  US: 'en-US',
  PH: 'en-US', // Philippines
  GB: 'en-US', // United Kingdom
  IE: 'en-US', // Ireland
  AU: 'en-US', // Australia
  NZ: 'en-US', // New Zealand
  ZA: 'en-US', // South Africa
};

/**
 * Map countries to geographic regions for analytics
 */
const COUNTRY_TO_REGION: Record<string, string> = {
  // LATAM (Latin America)
  BR: 'LATAM', MX: 'LATAM', AR: 'LATAM', CO: 'LATAM', CL: 'LATAM',
  PE: 'LATAM', VE: 'LATAM', EC: 'LATAM', GT: 'LATAM', CU: 'LATAM',
  BO: 'LATAM', DO: 'LATAM', HN: 'LATAM', PY: 'LATAM', SV: 'LATAM',
  NI: 'LATAM', CR: 'LATAM', PA: 'LATAM', UY: 'LATAM', PR: 'LATAM',
  
  // EMEA (Europe, Middle East, Africa)
  GB: 'EMEA', FR: 'EMEA', DE: 'EMEA', ES: 'EMEA', IT: 'EMEA',
  PT: 'EMEA', NL: 'EMEA', BE: 'EMEA', CH: 'EMEA', AT: 'EMEA',
  SE: 'EMEA', NO: 'EMEA', DK: 'EMEA', FI: 'EMEA', IE: 'EMEA',
  PL: 'EMEA', CZ: 'EMEA', RO: 'EMEA', HU: 'EMEA', GR: 'EMEA',
  ZA: 'EMEA', NG: 'EMEA', EG: 'EMEA', KE: 'EMEA', AE: 'EMEA',
  SA: 'EMEA', IL: 'EMEA', TR: 'EMEA', RU: 'EMEA', UA: 'EMEA',
  
  // APAC (Asia Pacific)
  CN: 'APAC', JP: 'APAC', KR: 'APAC', IN: 'APAC', AU: 'APAC',
  NZ: 'APAC', SG: 'APAC', HK: 'APAC', TW: 'APAC', TH: 'APAC',
  MY: 'APAC', ID: 'APAC', PH: 'APAC', VN: 'APAC',
  
  // NA (North America)
  US: 'NA', CA: 'NA',
};

const COUNTRY_NAMES: Record<string, string> = {
  BR: 'Brazil', US: 'United States', GB: 'United Kingdom',
  ES: 'Spain', MX: 'Mexico', AR: 'Argentina', CO: 'Colombia',
  FR: 'France', DE: 'Germany', IT: 'Italy', PT: 'Portugal',
  RU: 'Russia', CN: 'China', IN: 'India', JP: 'Japan',
  AU: 'Australia', CA: 'Canada', // Add more as needed
};

// ========================================
// DETECTION FUNCTIONS
// ========================================

/**
 * Check for Vercel Edge headers (x-vercel-ip-country, x-vercel-ip-city)
 * These are injected by Vercel Edge Network automatically
 */
function getVercelGeoHeaders(): Partial<GeoLocation> | null {
  // In browser, we can't access response headers directly
  // We need to get these from a server-side endpoint or cookie
  
  // Check if we have the geo data stored in a meta tag or window object
  // (set by a serverless function or middleware)
  if (typeof window !== 'undefined') {
    const geoMeta = document.querySelector('meta[name="x-geo-country"]');
    if (geoMeta) {
      const country = geoMeta.getAttribute('content') || '';
      return {
        country,
        countryName: COUNTRY_NAMES[country] || country,
        region: COUNTRY_TO_REGION[country] || 'UNKNOWN',
        inferredLanguage: COUNTRY_TO_LANGUAGE[country] || 'en-US',
        source: 'vercel',
      };
    }
    
    // Check window.__GEO_DATA__ if set by middleware
    const windowGeo = (window as any).__GEO_DATA__;
    if (windowGeo?.country) {
      return {
        country: windowGeo.country,
        countryName: COUNTRY_NAMES[windowGeo.country] || windowGeo.country,
        region: COUNTRY_TO_REGION[windowGeo.country] || 'UNKNOWN',
        city: windowGeo.city,
        ip: windowGeo.ip,
        inferredLanguage: COUNTRY_TO_LANGUAGE[windowGeo.country] || 'en-US',
        source: 'vercel',
      };
    }
  }
  
  return null;
}

/**
 * Fetch geolocation from external API (fallback)
 * Using ipapi.co which has a free tier
 */
async function fetchGeoFromAPI(): Promise<GeoLocation> {
  try {
    // Use ipapi.co free tier (1000 requests/day)
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    
    if (!response.ok) {
      throw new Error('Geo API request failed');
    }
    
    const data = await response.json();
    const country = data.country_code || '';
    
    return {
      country,
      countryName: data.country_name || COUNTRY_NAMES[country] || country,
      region: COUNTRY_TO_REGION[country] || 'UNKNOWN',
      city: data.city,
      ip: data.ip,
      inferredLanguage: COUNTRY_TO_LANGUAGE[country] || 'en-US',
      source: 'api',
    };
  } catch (error) {
    console.warn('Failed to fetch geolocation from API:', error);
    throw error;
  }
}

/**
 * Get timezone-based country hint as ultimate fallback
 */
function getTimezoneCountryHint(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Common timezone to country mappings
    const timezoneMap: Record<string, string> = {
      'America/Sao_Paulo': 'BR',
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Mexico_City': 'MX',
      'America/Argentina/Buenos_Aires': 'AR',
      'America/Bogota': 'CO',
      'America/Lima': 'PE',
      'America/Santiago': 'CL',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Madrid': 'ES',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Moscow': 'RU',
      'Asia/Shanghai': 'CN',
      'Asia/Tokyo': 'JP',
      'Asia/Kolkata': 'IN',
      'Australia/Sydney': 'AU',
    };
    
    return timezoneMap[timezone] || '';
  } catch {
    return '';
  }
}

// ========================================
// MAIN DETECTION FUNCTION
// ========================================

/**
 * Detect user's geolocation using multiple strategies:
 * 1. Vercel Edge headers (fastest, most accurate)
 * 2. External IP API (fallback)
 * 3. Timezone-based inference (ultimate fallback)
 * 
 * Results are cached in sessionStorage to avoid repeated API calls
 */
export async function detectGeolocation(): Promise<GeoLocation> {
  // Check cache first
  const cached = sessionStorage.getItem('vocaid_geo_cache');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Cache is valid for 24 hours
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.data;
      }
    } catch {
      // Invalid cache, continue with detection
    }
  }
  
  // Strategy 1: Check Vercel headers
  const vercelGeo = getVercelGeoHeaders();
  if (vercelGeo?.country) {
    const result: GeoLocation = {
      country: vercelGeo.country,
      countryName: vercelGeo.countryName || '',
      region: vercelGeo.region || 'UNKNOWN',
      city: vercelGeo.city,
      ip: vercelGeo.ip,
      inferredLanguage: vercelGeo.inferredLanguage || 'en-US',
      source: 'vercel',
    };
    cacheGeoLocation(result);
    return result;
  }
  
  // Strategy 2: External API
  try {
    const apiGeo = await fetchGeoFromAPI();
    cacheGeoLocation(apiGeo);
    return apiGeo;
  } catch {
    // API failed, use fallback
  }
  
  // Strategy 3: Timezone fallback
  const timezoneCountry = getTimezoneCountryHint();
  const fallbackResult: GeoLocation = {
    country: timezoneCountry || 'US',
    countryName: COUNTRY_NAMES[timezoneCountry] || 'Unknown',
    region: COUNTRY_TO_REGION[timezoneCountry] || 'UNKNOWN',
    inferredLanguage: COUNTRY_TO_LANGUAGE[timezoneCountry] || 'en-US',
    source: 'fallback',
  };
  
  cacheGeoLocation(fallbackResult);
  return fallbackResult;
}

/**
 * Cache geolocation data in sessionStorage
 */
function cacheGeoLocation(data: GeoLocation): void {
  try {
    sessionStorage.setItem('vocaid_geo_cache', JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // Storage not available
  }
}

/**
 * Get the inferred language for a country code
 */
export function getLanguageForCountry(countryCode: string): SupportedLanguageCode {
  return COUNTRY_TO_LANGUAGE[countryCode.toUpperCase()] || 'en-US';
}

/**
 * Get the geographic region for a country code
 */
export function getRegionForCountry(countryCode: string): string {
  return COUNTRY_TO_REGION[countryCode.toUpperCase()] || 'UNKNOWN';
}

/**
 * Clear the geolocation cache
 */
export function clearGeoCache(): void {
  try {
    sessionStorage.removeItem('vocaid_geo_cache');
  } catch {
    // Storage not available
  }
}
