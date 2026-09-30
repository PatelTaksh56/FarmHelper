import { getCropTranslationKey } from '../data/cropCatalog';

/**
 * Robust display-only localization strategy for dynamic values
 * Translates known values without altering underlying database IDs
 */

export function localizeWeatherCondition(condition: string, t: (key: string, fallback?: string) => string): string {
  if (!condition) return '';
  
  const cleanCond = condition.replace(/^weather\./i, '').trim();
  const normalizedCondition = cleanCond.toLowerCase();
  
  const weatherMap: Record<string, string> = {
    'clear sky': t('weather.clearSky', 'Clear Sky'),
    'clearsky': t('weather.clearSky', 'Clear Sky'),
    'few clouds': t('weather.fewClouds', 'Few Clouds'),
    'fewclouds': t('weather.fewClouds', 'Few Clouds'),
    'scattered clouds': t('weather.scatteredClouds', 'Scattered Clouds'),
    'broken clouds': t('weather.brokenClouds', 'Broken Clouds'),
    'overcast clouds': t('weather.overcastClouds', 'Overcast Clouds'),
    'light rain': t('weather.lightRain', 'Light Rain'),
    'moderate rain': t('weather.moderateRain', 'Moderate Rain'),
    'heavy intensity rain': t('weather.heavyRain', 'Heavy Rain'),
    'very heavy rain': t('weather.veryHeavyRain', 'Very Heavy Rain'),
    'extreme rain': t('weather.extremeRain', 'Extreme Rain'),
    'freezing rain': t('weather.freezingRain', 'Freezing Rain'),
    'light snow': t('weather.lightSnow', 'Light Snow'),
    'snow': t('weather.snow', 'Snow'),
    'heavy snow': t('weather.heavySnow', 'Heavy Snow'),
    'sleet': t('weather.sleet', 'Sleet'),
    'mist': t('weather.mist', 'Mist'),
    'smoke': t('weather.smoke', 'Smoke'),
    'haze': t('weather.haze', 'Haze'),
    'dust': t('weather.dust', 'Dust'),
    'fog': t('weather.fog', 'Fog'),
    'sand': t('weather.sand', 'Sand'),
    'ash': t('weather.ash', 'Ash'),
    'squalls': t('weather.squalls', 'Squalls'),
    'tornado': t('weather.tornado', 'Tornado'),
    'thunderstorm': t('weather.thunderstorm', 'Thunderstorm'),
    'thunderstorm with rain': t('weather.thunderstormWithRain', 'Thunderstorm with Rain'),
  };

  const res = weatherMap[normalizedCondition];
  if (res && !res.startsWith('weather.')) {
    return res;
  }

  // Capitalize words as fallback
  return cleanCond.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function localizeFarmName(name: string, t: (key: string, fallback?: string) => string): string {
  if (!name) return '';
  
  // Strip any leading locations. prefix if present
  const cleanName = name.replace(/^locations\./i, '').trim();
  const normalized = cleanName.toLowerCase();
  
  const map: Record<string, string> = {
    'dahod': t('locations.dahod', 'Dahod'),
    'transad': t('locations.transad', 'Transad'),
    'lj university, sanand x': t('locations.ljUniversity', 'LJ University, Sanand X'),
    'sanand': t('locations.sanand', 'Sanand'),
    'ahmedabad': t('locations.ahmedabad', 'Ahmedabad'),
    'gandhinagar': t('locations.gandhinagar', 'Gandhinagar'),
    'pune': t('locations.pune', 'Pune'),
    'mumbai': t('locations.mumbai', 'Mumbai'),
    'delhi': t('locations.delhi', 'Delhi'),
    'bangalore': t('locations.bangalore', 'Bangalore'),
    'chennai': t('locations.chennai', 'Chennai'),
    'hyderabad': t('locations.hyderabad', 'Hyderabad'),
    'kolkata': t('locations.kolkata', 'Kolkata'),
    'surat': t('locations.surat', 'Surat'),
    'vadodara': t('locations.vadodara', 'Vadodara'),
    'rajkot': t('locations.rajkot', 'Rajkot'),
    'bhavnagar': t('locations.bhavnagar', 'Bhavnagar'),
    'jamnagar': t('locations.jamnagar', 'Jamnagar'),
    'junagadh': t('locations.junagadh', 'Junagadh'),
  };

  const res = map[normalized];
  if (res && !res.startsWith('locations.')) {
    return res;
  }
  
  // Capitalize if it was a raw string
  if (cleanName === cleanName.toLowerCase()) {
    return cleanName.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return cleanName;
}

export function localizeCropName(cropId: string, t: (key: string, fallback?: string) => string): string {
  if (!cropId) return '';
  const key = getCropTranslationKey(cropId);
  const res = t(`crops.${key}`, cropId);
  return res.startsWith('crops.') ? cropId : res;
}
