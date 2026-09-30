/**
 * FarmHelper Market Master Data Service
 * Decouples master dropdown selectors (States, Districts, Markets, Commodities)
 * from temporary daily price query results and pagination limits.
 */
import {
  ALL_INDIAN_STATES,
  INDIAN_DISTRICTS_BY_STATE,
  INDIAN_MARKETS_BY_DISTRICT,
  ALL_AGMARKNET_COMMODITIES,
} from '../data/marketMasterData';

// Dynamic caches to store and merge any additional APMC markets or districts discovered from live API queries
const dynamicDistrictsCache = new Map<string, string[]>();
const dynamicMarketsCache = new Map<string, string[]>();

/**
 * 1. STATE MASTER LIST
 * Returns complete official list of 36 Indian States & UTs.
 * Never derived from daily price query results.
 */
export function getMasterStates(): string[] {
  return [...ALL_INDIAN_STATES].sort((a, b) => a.localeCompare(b));
}

/**
 * 2. DISTRICT MASTER LIST FOR STATE
 * Returns ALL official districts belonging to the selected state.
 * Never collapses options based on current price query limit or pagination.
 */
export async function getMasterDistrictsForState(stateName: string): Promise<string[]> {
  if (!stateName || stateName === 'All') return [];

  // Check master reference data first
  const masterDistricts = INDIAN_DISTRICTS_BY_STATE[stateName] || [];

  // Check dynamic cache
  const cachedDynamic = dynamicDistrictsCache.get(stateName) || [];

  const combined = Array.from(new Set([...masterDistricts, ...cachedDynamic]));
  combined.sort((a, b) => a.localeCompare(b));
  return combined.length > 0 ? combined : [...masterDistricts].sort((a, b) => a.localeCompare(b));
}

/**
 * 3. MARKET / MANDI MASTER LIST FOR LOCATION (STATE + DISTRICT)
 * Returns ALL official APMC markets for the given district.
 * Completely independent of commodity selection.
 */
export async function getMasterMarketsForLocation(
  stateName: string,
  districtName: string
): Promise<string[]> {
  if (!stateName || stateName === 'All') return [];

  const cacheKey = `${stateName}::${districtName || 'All'}`;
  const masterMarkets = districtName && districtName !== 'All'
    ? (INDIAN_MARKETS_BY_DISTRICT[districtName] || [])
    : [];

  const cachedDynamic = dynamicMarketsCache.get(cacheKey) || [];

  const combined = Array.from(new Set([...masterMarkets, ...cachedDynamic]));
  combined.sort((a, b) => a.localeCompare(b));
  if (combined.length > 0) return combined;

  // Fallback default APMC names for district if specific list not yet cached
  if (districtName && districtName !== 'All') {
    return [districtName, `${districtName} APMC`, `${districtName} Main Mandi`].sort((a, b) => a.localeCompare(b));
  }

  return [];
}

/**
 * 4. COMMODITY MASTER LIST — CRITICAL
 * Completely INDEPENDENT of State, District, and Market.
 * Returns complete master list of 300+ official commodities.
 * Selecting a Market or District does NOT shrink or alter this list.
 */
export function getMasterCommodityList(): string[] {
  return [...ALL_AGMARKNET_COMMODITIES].sort((a, b) => a.localeCompare(b));
}

/**
 * Helper to dynamically register any extra districts or markets discovered from live API price results
 */
export function registerDiscoveredLocationData(
  state: string,
  district?: string,
  markets?: string[],
  districts?: string[]
): void {
  if (state && districts && districts.length > 0) {
    const existing = dynamicDistrictsCache.get(state) || [];
    const updated = Array.from(new Set([...existing, ...districts]));
    updated.sort((a, b) => a.localeCompare(b));
    dynamicDistrictsCache.set(state, updated);
  }

  if (state && district && markets && markets.length > 0) {
    const cacheKey = `${state}::${district}`;
    const existing = dynamicMarketsCache.get(cacheKey) || [];
    const updated = Array.from(new Set([...existing, ...markets]));
    updated.sort((a, b) => a.localeCompare(b));
    dynamicMarketsCache.set(cacheKey, updated);
  }
}
