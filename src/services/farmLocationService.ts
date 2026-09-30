import { Farm } from '../types/models';
import { ALL_INDIAN_STATES, normalizeText, fetchDistrictsForState } from './marketService';
import { getGoogleMapsApiKey, loadGoogleMapsLibraries } from './googleMaps';

export interface FarmMarketLocation {
  state: string;
  district: string;
  latitude?: number;
  longitude?: number;
  source: 'stored' | 'parsed' | 'geocoded';
}

export interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

// In-memory cache for reverse geocoded lat/lng locations
const reverseGeocodeCache = new Map<string, { state: string; district: string }>();

/**
 * Match a raw state string against canonical ALL_INDIAN_STATES
 */
export function matchStateName(inputState?: string | null): string | null {
  if (!inputState) return null;
  const cleanInput = normalizeText(inputState).toLowerCase();
  if (!cleanInput || cleanInput === 'all') return null;

  for (const st of ALL_INDIAN_STATES) {
    if (st.toLowerCase() === cleanInput) {
      return st;
    }
  }

  // Substring or fuzzy matching (e.g. "Gujarat State" -> "Gujarat")
  for (const st of ALL_INDIAN_STATES) {
    if (cleanInput.includes(st.toLowerCase()) || st.toLowerCase().includes(cleanInput)) {
      return st;
    }
  }

  return null;
}

/**
 * Perform Google Reverse Geocoding and inspect complete address_components[] response
 * Strictly uses address_components[].types rather than parsing formatted_address string.
 */
export async function googleReverseGeocodeAddressComponents(
  lat: number,
  lng: number
): Promise<{ state?: string; district?: string; rawComponents?: GoogleAddressComponent[] } | null> {
  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;

  const roundLat = lat.toFixed(4);
  const roundLng = lng.toFixed(4);
  const cacheKey = `google:${roundLat},${roundLng}`;

  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey)!;
  }

  let components: GoogleAddressComponent[] = [];

  // 1. Try Google Geocoding REST HTTP API
  try {
    const apiKey = getGoogleMapsApiKey();
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        // Find best result with political administrative components
        const bestResult =
          data.results.find((r: any) =>
            r.types?.includes('administrative_area_level_2') ||
            r.types?.includes('administrative_area_level_1') ||
            r.types?.includes('locality')
          ) || data.results[0];

        components = (bestResult.address_components || []).map((c: any) => ({
          long_name: c.long_name,
          short_name: c.short_name,
          types: Array.isArray(c.types) ? c.types : [],
        }));
      }
    }
  } catch (err) {
    console.warn('[Google Geocode REST] Error, trying JS SDK Geocoder fallback:', err);
  }

  // 2. Fallback to Google Maps JS SDK Geocoder if REST API failed or was blocked
  if (components.length === 0) {
    try {
      const { googleMaps } = await loadGoogleMapsLibraries();
      const geocoder = new googleMaps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results.length > 0) {
        const bestResult =
          response.results.find((r) =>
            r.types?.includes('administrative_area_level_2') ||
            r.types?.includes('administrative_area_level_1') ||
            r.types?.includes('locality')
          ) || response.results[0];

        components = (bestResult.address_components || []).map((c) => ({
          long_name: c.long_name,
          short_name: c.short_name,
          types: c.types as string[],
        }));
      }
    } catch (sdkErr) {
      console.warn('[Google Geocode JS SDK] Error:', sdkErr);
    }
  }

  if (components.length === 0) {
    return null;
  }

  // MANDATORY DEVELOPMENT LOGGING of complete administrative address components
  console.log(`[Google Reverse Geocode] Address Components for Lat: ${lat}, Lng: ${lng}:`);
  components.forEach((comp, idx) => {
    console.log(
      `  [Component ${idx}] long_name: "${comp.long_name}", short_name: "${comp.short_name}", types: [${comp.types.join(', ')}]`
    );
  });

  let stateRaw: string | undefined;
  let level2Raw: string | undefined;
  let level3Raw: string | undefined;
  let localityRaw: string | undefined;

  components.forEach((comp) => {
    if (comp.types.includes('administrative_area_level_1')) {
      stateRaw = comp.long_name;
    }
    if (comp.types.includes('administrative_area_level_2')) {
      level2Raw = comp.long_name;
    }
    if (comp.types.includes('administrative_area_level_3')) {
      level3Raw = comp.long_name;
    }
    if (comp.types.includes('locality')) {
      localityRaw = comp.long_name;
    }
  });

  // Extract State matching official list
  const matchedState = matchStateName(stateRaw) || (stateRaw ? normalizeText(stateRaw) : undefined);

  // Inspect administrative_area_level_2 first (Primary District candidate in India)
  // Inspect administrative_area_level_3 as secondary fallback
  let districtCandidate: string | undefined;

  if (typeof level2Raw === 'string' && level2Raw.trim().length > 0) {
    districtCandidate = level2Raw.replace(/\s+district$/i, '').trim();
  } else if (typeof level3Raw === 'string' && level3Raw.trim().length > 0) {
    districtCandidate = level3Raw.replace(/\s+district$/i, '').trim();
  } else if (typeof localityRaw === 'string' && localityRaw.trim().length > 0) {
    districtCandidate = localityRaw.trim();
  }

  if (districtCandidate) {
    districtCandidate = normalizeText(districtCandidate);
  }

  if (matchedState && districtCandidate) {
    const resolved = { state: matchedState, district: districtCandidate, rawComponents: components };
    reverseGeocodeCache.set(cacheKey, { state: matchedState, district: districtCandidate });
    return resolved;
  } else if (matchedState) {
    return { state: matchedState, rawComponents: components };
  }

  return null;
}

/**
 * Extract State & District from farm text string (e.g. "Dahod, Gujarat" or "Transad, Ahmedabad, Gujarat")
 */
export function parseLocationText(locationText?: string | null): { state?: string; district?: string } {
  if (!locationText || typeof locationText !== 'string') return {};

  const clean = locationText.trim();
  if (!clean) return {};

  const parts = clean
    .split(',')
    .map((p) => normalizeText(p))
    .filter(Boolean);

  let stateMatch: string | null = null;
  let districtCandidate: string | null = null;

  // Search parts backwards to find state first
  for (let i = parts.length - 1; i >= 0; i--) {
    const matched = matchStateName(parts[i]);
    if (matched) {
      stateMatch = matched;
      // If there's a part before state, it's likely district or city
      if (i > 0) {
        districtCandidate = parts[i - 1];
      }
      break;
    }
  }

  // Fallback if no state found in parts: search entire locationText for state
  if (!stateMatch) {
    stateMatch = matchStateName(locationText);
  }

  // If no district candidate found yet, use first part or non-state part
  if (!districtCandidate && parts.length > 0) {
    const nonStateParts = parts.filter((p) => matchStateName(p) === null);
    if (nonStateParts.length > 0) {
      districtCandidate = nonStateParts[0];
    } else {
      districtCandidate = parts[0];
    }
  }

  // Clean up common suffix/prefix words from district candidate (e.g. "Dahod plot" -> "Dahod", "Dahod Farm" -> "Dahod")
  if (districtCandidate) {
    districtCandidate = districtCandidate
      .replace(/\b(farm|plot|field|acres|bigha|nursery|village|tehsil|taluka|block)\b/gi, '')
      .trim();
    districtCandidate = normalizeText(districtCandidate);
  }

  return {
    state: stateMatch || undefined,
    district: districtCandidate || undefined,
  };
}

/**
 * Main farm location resolver enforcing strict location hierarchy:
 * 1. Google Reverse Geocoding from stored latitude/longitude via address_components[]
 * 2. Explicit stored farm.state & farm.district
 * 3. Parsed farm.locationName metadata
 */
export async function getFarmMarketLocation(farm: Farm): Promise<FarmMarketLocation | null> {
  if (!farm) return null;

  const lat = farm.latitude || farm.center?.lat;
  const lng = farm.longitude || farm.center?.lng;

  // STEP 1: Google Reverse Geocoding using stored latitude/longitude via address_components[]
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    const googleRes = await googleReverseGeocodeAddressComponents(lat, lng);
    if (googleRes && googleRes.state) {
      let state = googleRes.state;
      let district = googleRes.district || 'All';

      // If we have state and district candidate, verify with official government districts if available
      if (state && district && district !== 'All') {
        const officialDistricts = await fetchDistrictsForState(state);
        if (officialDistricts.length > 0) {
          // Find exact or case-insensitive match in official government districts
          const matchedDistrict = officialDistricts.find(
            (d) => d.toLowerCase() === district.toLowerCase() || district.toLowerCase().includes(d.toLowerCase())
          );
          if (matchedDistrict) {
            district = matchedDistrict;
          }
        }
      }

      return {
        state,
        district,
        latitude: lat,
        longitude: lng,
        source: 'geocoded',
      };
    }
  }

  // STEP 2: Explicit farm.state & farm.district
  const explicitState = matchStateName(farm.state);
  const explicitDistrict = farm.district ? normalizeText(farm.district) : undefined;

  if (explicitState && explicitDistrict) {
    return {
      state: explicitState,
      district: explicitDistrict,
      latitude: lat,
      longitude: lng,
      source: 'stored',
    };
  }

  // STEP 3: Parse farm.locationName (and farmName as secondary fallback)
  const parsedFromLocName = parseLocationText(farm.locationName);
  const parsedFromFarmName = parseLocationText(farm.farmName);

  let state = explicitState || parsedFromLocName.state || parsedFromFarmName.state;
  let district = explicitDistrict || parsedFromLocName.district || parsedFromFarmName.district;

  if (state && district) {
    return {
      state,
      district,
      latitude: lat,
      longitude: lng,
      source: 'parsed',
    };
  }

  if (state) {
    return {
      state,
      district: district || 'All',
      latitude: lat,
      longitude: lng,
      source: 'parsed',
    };
  }

  return null;
}
