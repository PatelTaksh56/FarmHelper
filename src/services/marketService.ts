/**
 * FarmHelper Government Agmarknet Market Price Service
 * Sourced directly from India's Open Government Data (data.gov.in) Platform API
 * Resource ID: 35985678-0d79-46b4-9ed6-6f13308a1d24
 */

import { INDIAN_DISTRICTS_BY_STATE, ALL_AGMARKNET_COMMODITIES } from '../data/marketMasterData';
import { auth } from '../config/firebase';

export interface MarketPriceRecord {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string; // Raw arrival date from API (e.g. "16/09/2026")
  formattedDate: string; // Farmer-friendly formatted date (e.g. "16 Sep 2026")
  minPrice: number; // in ₹ / Quintal
  maxPrice: number; // in ₹ / Quintal
  modalPrice: number; // in ₹ / Quintal
  unit: string;
  source: string;
}

export interface FetchMarketPricesParams {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  limit?: number;
  offset?: number;
}

export interface FetchMarketPricesResult {
  records: MarketPriceRecord[];
  total: number;
  limit: number;
  offset: number;
  states: string[];
  districts: string[];
  markets: string[];
  commodities: string[];
}

// Complete List of All Indian States & UTs for State Dropdown Discovery
export const ALL_INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

// Official Government AGMARKNET Commodity Catalog (100+ Official Commodities)
export const AGMARKNET_COMMODITIES = [
  'Absinthe',
  'Ajwan (Ajwain)',
  'Almond (Badam)',
  'Alsandikai',
  'Amaranthus',
  'Ambada Seed',
  'Ambady / Mesta',
  'Amla (Nelli Kai)',
  'Amphophalus',
  'Anthurium',
  'Apple',
  'Apricot (Jardalu / Khuman)',
  'Arecanut (Betelnut / Supari)',
  'Arhar (Tur / Red Gram) (Whole)',
  'Arhar Dal (Tur Dal)',
  'Ashgourd',
  'Bajra (Pearl Millet / Cumbu)',
  'Banana',
  'Banana - Green',
  'Barley (Jau)',
  'Beans',
  'Beetroot',
  'Bengal Gram (Gram / Chickpea)',
  'Bengal Gram Dal (Chana Dal)',
  'Betel Leaves',
  'Bitter Gourd (Karela)',
  'Black Gram (Urad) (Whole)',
  'Black Gram Dal (Urad Dal)',
  'Bottle Gourd (Lauki)',
  'Brinjal (Baingan)',
  'Cabbage',
  'Capsicum (Shimla Mirch)',
  'Cardamom',
  'Carrot (Gajar)',
  'Cashewnuts',
  'Cauliflower (Gobi)',
  'Chilli (Red / Dry)',
  'Cinnamon',
  'Cloves',
  'Cluster Beans (Gwar)',
  'Coconut',
  'Coffee',
  'Coriander (Dhania)',
  'Cotton (Kapas)',
  'Cowpea (Lobia / Veg)',
  'Cucumber (Kheera)',
  'Cumin (Jeera)',
  'Drumstick',
  'Elephant Yam (Suran)',
  'Field Pea',
  'Fig (Anjeer)',
  'Garlic (Lahsun)',
  'Ginger (Adrak / Green)',
  'Grapes (Angoor)',
  'Green Chilli (Hari Mirch)',
  'Green Gram (Moong) (Whole)',
  'Green Gram Dal (Moong Dal)',
  'Groundnut (Peanut)',
  'Guava (Amrood)',
  'Isabgol (Psyllium)',
  'Jackfruit',
  'Jowar (Sorghum)',
  'Jute',
  'Lemon (Nimbu)',
  'Lentil (Masur) (Whole)',
  'Lentil Dal (Masur Dal)',
  'Linseed (Alsi)',
  'Litchi',
  'Maize (Makka)',
  'Mango',
  'Methi (Fenugreek)',
  'Milk',
  'Mousambi (Sweet Lime)',
  'Mustard (Sarson)',
  'Nutmeg',
  'Okra (Bhindi / Lady Finger)',
  'Onion (Pyaz)',
  'Orange (Santra)',
  'Paddy (Dhan / Basmati)',
  'Papaya',
  'Peas (Green)',
  'Pineapple',
  'Pomegranate (Anar)',
  'Potato (Aloo)',
  'Pumpkin (Kaddu)',
  'Radish (Mooli)',
  'Ragi (Finger Millet)',
  'Red Gram (Tur)',
  'Rice (Chawal)',
  'Rubber',
  'Safflower (Kusum)',
  'Saffron (Kesar)',
  'Sesame (Til)',
  'Soyabean',
  'Spinach (Palak)',
  'Sugarcane (Ganna)',
  'Sunflower',
  'Sweet Potato (Shakarkand)',
  'Tamarind (Imli)',
  'Tea',
  'Tobacco',
  'Tomato (Tamatar)',
  'Turmeric (Haldi)',
  'Walnut (Akhrot)',
  'Watermelon (Tarbooz)',
  'Wheat (Kanak / Gehun)',
];

/**
 * Dynamically resolve the backend base endpoint URL
 */
function getBackendBaseUrl(): string {
  const envUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.includes('cloudfunctions.net') || trimmed.includes('.a.run.app')) {
      return trimmed;
    }
    try {
      const parsed = new URL(trimmed);
      return parsed.origin;
    } catch (_) {
      return trimmed.replace(/\/(diagnoseCrop|adviseCrop|extractSoilReport|getMarketPrices|marketPrices|sendTestEmail|diagnose|api)$/i, '');
    }
  }

  if (import.meta.env.PROD) {
    return '';
  }

  return 'http://localhost:5001';
}

/**
 * Invoke Firebase Backend Cloud Function for Market & Mandi Price Proxy Requests
 */
async function callMarketBackend(payload: any): Promise<any> {
  const currentUser = auth.currentUser;
  const idToken = currentUser ? await currentUser.getIdToken(true) : 'dev-token';
  const baseUrl = getBackendBaseUrl();
  const endpoint = `${baseUrl}/getMarketPrices`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data: payload }),
  });

  if (!response.ok) {
    let errorMsg = `Server returned HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch (_) {}
    throw new Error(`Market backend error: ${errorMsg}`);
  }

  const resJson = await response.json();
  return resJson.data !== undefined ? resJson.data : resJson;
}

/**
 * Helper to normalize string fields (casing, extra whitespace, special characters)
 */
export function normalizeText(str?: string | null): string {
  if (!str) return '';
  const cleaned = str.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  // Title Case conversion if ALL CAPS or lowercase
  if (cleaned === cleaned.toUpperCase() || cleaned === cleaned.toLowerCase()) {
    return cleaned
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return cleaned;
}

/**
 * Format raw API date string (e.g. "16/09/2026", "2026-09-16") into farmer-friendly "16 Sep 2026"
 * MUST come directly from government API field; NEVER uses browser Date()
 */
export function formatArrivalDate(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return 'N/A';
  const trimmed = dateStr.trim();
  if (!trimmed) return 'N/A';

  // Format DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3], 10);
    const dateObj = new Date(year, month, day);
    if (!isNaN(dateObj.getTime())) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[month]} ${year}`;
    }
  }

  // Format YYYY-MM-DD or YYYY/MM/DD
  const yyyymmddMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10) - 1;
    const day = parseInt(yyyymmddMatch[3], 10);
    const dateObj = new Date(year, month, day);
    if (!isNaN(dateObj.getTime())) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[month]} ${year}`;
    }
  }

  return trimmed;
}

/**
 * Normalize Raw Record from Government API to structured MarketPriceRecord
 * Maps exact capitalized fields returned by data.gov.in: State, District, Market, Commodity, Variety, Grade, Arrival_Date, Min_Price, Max_Price, Modal_Price
 * CRITICAL: Arrival_Date originates strictly from government API payload
 */
export function normalizeRawRecord(raw: any, index: number): MarketPriceRecord {
  const stateRaw = raw.State || raw.state || raw.state_name || '';
  const districtRaw = raw.District || raw.district || raw.district_name || '';
  const marketRaw = raw.Market || raw.market || raw.mandi_name || '';
  const commodityRaw = raw.Commodity || raw.commodity || raw.commodity_name || '';
  const varietyRaw = raw.Variety || raw.variety || raw.variety_name || 'Standard';
  const gradeRaw = raw.Grade || raw.grade || 'FAQ';
  
  // Extract date strictly from API response fields — NEVER fallback to new Date()
  const rawArrivalDate = raw.Arrival_Date || raw.arrival_date || raw.date || raw.ArrivalDate || '';
  const arrivalDate = typeof rawArrivalDate === 'string' ? rawArrivalDate.trim() : String(rawArrivalDate || '');
  const formattedDate = formatArrivalDate(arrivalDate);

  const minPrice = parseFloat(raw.Min_Price || raw.min_price || raw.min_price_rs || 0) || 0;
  const maxPrice = parseFloat(raw.Max_Price || raw.max_price || raw.max_price_rs || 0) || 0;
  const modalPrice = parseFloat(raw.Modal_Price || raw.modal_price || raw.modal_price_rs || 0) || minPrice || maxPrice || 0;

  const state = normalizeText(stateRaw) || 'Unknown State';
  const district = normalizeText(districtRaw) || 'Unknown District';
  const market = normalizeText(marketRaw) || 'Grain Market';
  const commodity = normalizeText(commodityRaw) || 'Agricultural Produce';
  const variety = normalizeText(varietyRaw);
  const grade = normalizeText(gradeRaw);

  return {
    id: `${state}-${district}-${market}-${commodity}-${index}`,
    state,
    district,
    market,
    commodity,
    variety,
    grade,
    arrivalDate,
    formattedDate,
    minPrice,
    maxPrice,
    modalPrice,
    unit: 'Quintal',
    source: 'Ministry of Agriculture / AGMARKNET (data.gov.in)',
  };
}

// Caches to optimize repeated state, district, market & commodity queries
const districtsCacheByState = new Map<string, string[]>();
const marketsCacheByLocation = new Map<string, string[]>();
const commoditiesCacheByFilter = new Map<string, string[]>();
const marketPricesQueryCache = new Map<string, { result: FetchMarketPricesResult; timestamp: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minute cache TTL for API queries

/**
 * Fetch All Available Districts for a State directly from Firebase Backend Proxy
 * Ensures direct district switching (e.g. Ahmedabad -> Surat) works without collapsing options
 */
export async function fetchDistrictsForState(stateName: string): Promise<string[]> {
  if (!stateName || stateName === 'All') return [];
  if (districtsCacheByState.has(stateName)) {
    return districtsCacheByState.get(stateName)!;
  }

  try {
    const data = await callMarketBackend({ action: 'districts', stateName });
    if (data && Array.isArray(data.districts) && data.districts.length > 0) {
      districtsCacheByState.set(stateName, data.districts);
      return data.districts;
    }
  } catch (err) {
    console.warn(`Unable to fetch state-level districts for ${stateName}:`, err);
  }

  const fallbackDistricts = INDIAN_DISTRICTS_BY_STATE[stateName] || [];
  districtsCacheByState.set(stateName, fallbackDistricts);
  return fallbackDistricts;
}

/**
 * Fetch All Available Markets / Mandis for a Location (State + District) directly from Firebase Backend Proxy
 * Ensures direct market switching (e.g. Ahmedabad APMC -> Viramgam APMC) works without collapsing options
 */
export async function fetchMarketsForLocation(stateName: string, districtName: string): Promise<string[]> {
  if (!stateName || stateName === 'All') return [];
  const cacheKey = `${stateName}::${districtName || 'All'}`;
  if (marketsCacheByLocation.has(cacheKey)) {
    return marketsCacheByLocation.get(cacheKey)!;
  }

  try {
    const data = await callMarketBackend({ action: 'markets', stateName, districtName });
    if (data && Array.isArray(data.markets) && data.markets.length > 0) {
      marketsCacheByLocation.set(cacheKey, data.markets);
      return data.markets;
    }
  } catch (err) {
    console.warn(`Unable to fetch markets for ${cacheKey}:`, err);
  }

  const fallbackMarkets = [
    `${districtName || stateName} APMC Mandi`,
    `${districtName || stateName} Grain Market`,
    `${districtName || stateName} Vegetable Market`,
  ];
  marketsCacheByLocation.set(cacheKey, fallbackMarkets);
  return fallbackMarkets;
}

/**
 * Fetch All Available Commodities dynamically for given filter context directly from Firebase Backend Proxy
 */
export async function fetchCommoditiesForFilters(
  stateName?: string,
  districtName?: string,
  marketName?: string
): Promise<string[]> {
  const cacheKey = `${stateName || 'All'}::${districtName || 'All'}::${marketName || 'All'}`;
  if (commoditiesCacheByFilter.has(cacheKey)) {
    return commoditiesCacheByFilter.get(cacheKey)!;
  }

  try {
    const data = await callMarketBackend({ action: 'commodities', stateName, districtName, marketName });
    if (data && Array.isArray(data.commodities) && data.commodities.length > 0) {
      commoditiesCacheByFilter.set(cacheKey, data.commodities);
      return data.commodities;
    }
  } catch (err) {
    console.warn(`Unable to fetch commodities for ${cacheKey}:`, err);
  }

  commoditiesCacheByFilter.set(cacheKey, ALL_AGMARKNET_COMMODITIES);
  return ALL_AGMARKNET_COMMODITIES;
}

const inFlightMarketPricesRequests = new Map<string, Promise<FetchMarketPricesResult>>();

/**
 * Fetch Government Market Prices dynamically from Firebase Backend Proxy
 */
export async function fetchGovernmentMarketPrices(
  params: FetchMarketPricesParams = {}
): Promise<FetchMarketPricesResult> {
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;

  const cacheKey = JSON.stringify({
    state: params.state || 'All',
    district: params.district || 'All',
    market: params.market || 'All',
    commodity: params.commodity || 'All',
    limit,
    offset,
  });

  const now = Date.now();
  if (marketPricesQueryCache.has(cacheKey)) {
    const cached = marketPricesQueryCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      console.log('Serving market prices from query cache:', cacheKey);
      return cached.result;
    }
  }

  // Deduplicate simultaneous identical requests
  if (inFlightMarketPricesRequests.has(cacheKey)) {
    console.log('Reusing in-flight market price request:', cacheKey);
    return inFlightMarketPricesRequests.get(cacheKey)!;
  }

  const fetchPromise = (async (): Promise<FetchMarketPricesResult> => {
    try {
      const data = await callMarketBackend({
        action: 'prices',
        state: params.state,
        district: params.district,
        market: params.market,
        commodity: params.commodity,
        limit,
        offset,
      });

      if (!data || !Array.isArray(data.records)) {
        throw new Error('Market price details could not be loaded. Please tap Check Again.');
      }

      const rawRecords: any[] = data.records;
      const total = parseInt(data.total || rawRecords.length, 10) || rawRecords.length;

      const records: MarketPriceRecord[] = rawRecords.map((raw, idx) =>
        normalizeRawRecord(raw, offset + idx)
      );

      const statesSet = new Set<string>();
      const districtsSet = new Set<string>();
      const marketsSet = new Set<string>();
      const commoditiesSet = new Set<string>();

      records.forEach((r) => {
        if (r.state) statesSet.add(r.state);
        if (r.district) districtsSet.add(r.district);
        if (r.market) marketsSet.add(r.market);
        if (r.commodity) commoditiesSet.add(r.commodity);
      });

      const finalResult: FetchMarketPricesResult = {
        records,
        total,
        limit,
        offset,
        states: Array.from(statesSet).sort(),
        districts: Array.from(districtsSet).sort(),
        markets: Array.from(marketsSet).sort(),
        commodities: Array.from(commoditiesSet).sort(),
      };

      marketPricesQueryCache.set(cacheKey, { result: finalResult, timestamp: Date.now() });

      return finalResult;
    } catch (netErr: any) {
      console.error('Market Service Error:', netErr);
      throw new Error(
        netErr.message && !netErr.message.includes('fetch') && !netErr.message.includes('NetworkError')
          ? netErr.message
          : 'Unable to connect to market service. Please check your internet connection and tap Check Again.'
      );
    } finally {
      inFlightMarketPricesRequests.delete(cacheKey);
    }
  })();

  inFlightMarketPricesRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Utility to extract location match from user's farm location string (e.g. "Ahmedabad, Gujarat" -> state: Gujarat, district: Ahmedabad)
 */
export function parseFarmLocationString(locationName?: string | null): { state?: string; district?: string } {
  if (!locationName) return {};

  const parts = locationName.split(',').map((p) => normalizeText(p)).filter(Boolean);
  if (parts.length >= 2) {
    return {
      district: parts[0],
      state: parts[parts.length - 1],
    };
  } else if (parts.length === 1) {
    return {
      district: parts[0],
    };
  }

  return {};
}
