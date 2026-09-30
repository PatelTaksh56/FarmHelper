/**
 * FarmHelper Open-Meteo Weather Service
 * High-precision microclimate telemetry calculated for exact farm coordinates.
 */

export interface CurrentWeatherPayload {
  temperature: number;
  temperatureUnit: '°C' | '°F';
  apparentTemperature: number;
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  dewPoint: number;
  precipitationProbability: number; // %
  surfacePressure: number; // hPa
  weatherCode: number;
  weatherCondition: string;
  weatherIcon: string;
  sprayIndex: {
    status: 'Favorable' | 'Caution' | 'Unfavorable';
    badgeColor: string;
    description: string;
  };
  lastUpdated: string;
}

export interface ForecastDayPayload {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
  weatherCode: number;
  weatherCondition: string;
  weatherIcon: string;
}

export interface FarmWeatherResponse {
  current: CurrentWeatherPayload;
  forecast: ForecastDayPayload[];
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * WMO Weather Interpretation Codes (WW) mapping
 * Standardized by the World Meteorological Organization
 */
export function getWMOCodeDetails(code: number): { condition: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: 'wb_sunny' };
    case 1:
      return { condition: 'Mainly Clear', icon: 'wb_sunny' };
    case 2:
      return { condition: 'Partly Cloudy', icon: 'partly_cloudy_day' };
    case 3:
      return { condition: 'Overcast', icon: 'cloud' };
    case 45:
    case 48:
      return { condition: 'Fog & Depositing Rime', icon: 'foggy' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', icon: 'grain' };
    case 56:
    case 57:
      return { condition: 'Freezing Drizzle', icon: 'ac_unit' };
    case 61:
      return { condition: 'Light Rain', icon: 'water_drop' };
    case 63:
      return { condition: 'Moderate Rain', icon: 'rainy' };
    case 65:
      return { condition: 'Heavy Rain', icon: 'thunderstorm' };
    case 66:
    case 67:
      return { condition: 'Freezing Rain', icon: 'severe_cold' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', icon: 'weather_snowy' };
    case 77:
      return { condition: 'Snow Grains', icon: 'ac_unit' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', icon: 'shower' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', icon: 'weather_snowy' };
    case 95:
      return { condition: 'Thunderstorm', icon: 'thunderstorm' };
    case 96:
    case 99:
      return { condition: 'Thunderstorm with Hail', icon: 'thunderstorm' };
    default:
      return { condition: 'Fair Weather', icon: 'partly_cloudy_day' };
  }
}

/**
 * Centralized Spray Advisory Index Calculation
 * Favorable: Wind < 15 km/h AND Rain Prob < 20%
 * Caution: Wind 15-25 km/h OR Rain Prob 20-50%
 * Unfavorable: Wind >= 25 km/h OR Rain Prob >= 50%
 */
export function calculateSprayIndex(windSpeed: number, precipitationProbability: number) {
  if (windSpeed < 15 && precipitationProbability < 20) {
    return {
      status: 'Favorable' as const,
      badgeColor: 'bg-[#F0F4E8] text-harvest-olive border-[#91A35A]/40',
      description: 'Low wind velocity & rain risk. Ideal for foliar fertilizer & pest control application.',
    };
  } else if (windSpeed >= 25 || precipitationProbability >= 50) {
    return {
      status: 'Unfavorable' as const,
      badgeColor: 'bg-red-100 text-red-800 border-red-300',
      description: 'High wind drift or imminent rainfall detected. Spraying may cause wash-off or chemical drift.',
    };
  } else {
    return {
      status: 'Caution' as const,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Moderate wind or rain probability. Monitor local gusts before tank filling.',
    };
  }
}

/**
 * Coordinate Validation Helper
 * Ensures coordinates are valid numbers in real-world ranges.
 * Rejects null, undefined, NaN, and (0,0) unless specifically valid.
 */
export function validateCoordinates(latitude?: number | null, longitude?: number | null): boolean {
  if (latitude === null || latitude === undefined || isNaN(latitude)) return false;
  if (longitude === null || longitude === undefined || isNaN(longitude)) return false;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  // Disallow exact (0, 0) as dummy default
  if (Math.abs(latitude) < 0.0001 && Math.abs(longitude) < 0.0001) return false;
  return true;
}

/**
 * Fetch Weather Telemetry for exact Farm Coordinates using Open-Meteo API
 * Canonical internal temperature is ALWAYS Celsius as per architecture.
 */
export async function getWeatherForCoordinates(
  latitude: number,
  longitude: number
): Promise<FarmWeatherResponse> {
  if (!validateCoordinates(latitude, longitude)) {
    throw new Error('Farm location is missing or has invalid coordinates. Please edit the farm location.');
  }

  // Always request metric (Celsius) for canonical internal storage
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather telemetry server returned error (${response.status}). Please check network connection.`);
  }

  const data = await response.json();

  if (!data || !data.current) {
    throw new Error('Incomplete weather telemetry payload received from server.');
  }

  const current = data.current;
  const currentWMODetails = getWMOCodeDetails(current.weather_code ?? 0);

  // Derive precipitation probability max for current day from daily array if available
  const todayPrecipProb = data.daily?.precipitation_probability_max?.[0] ?? (current.precipitation > 0 ? 80 : 0);
  const sprayIndex = calculateSprayIndex(current.wind_speed_10m ?? 0, todayPrecipProb);

  const currentWeather: CurrentWeatherPayload = {
    temperature: Math.round(current.temperature_2m),
    temperatureUnit: '°C',
    apparentTemperature: Math.round(current.apparent_temperature ?? current.temperature_2m),
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    windSpeed: Math.round(current.wind_speed_10m ?? 0),
    windDirection: Math.round(current.wind_direction_10m ?? 0),
    dewPoint: Math.round(current.dew_point_2m ?? 0),
    precipitationProbability: todayPrecipProb,
    surfacePressure: Math.round(current.surface_pressure ?? 1013),
    weatherCode: current.weather_code ?? 0,
    weatherCondition: currentWMODetails.condition,
    weatherIcon: currentWMODetails.icon,
    sprayIndex,
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };

  // Build 5-day daily forecast
  const forecast: ForecastDayPayload[] = [];
  if (data.daily && Array.isArray(data.daily.time)) {
    const times: string[] = data.daily.time;
    const maxTemps: number[] = data.daily.temperature_2m_max || [];
    const minTemps: number[] = data.daily.temperature_2m_min || [];
    const precips: number[] = data.daily.precipitation_probability_max || [];
    const codes: number[] = data.daily.weather_code || [];

    for (let i = 0; i < Math.min(5, times.length); i++) {
      const d = new Date(times[i]);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const wmo = getWMOCodeDetails(codes[i] ?? 0);

      forecast.push({
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        dayName,
        maxTemp: Math.round(maxTemps[i] ?? 0),
        minTemp: Math.round(minTemps[i] ?? 0),
        precipitationProbability: Math.round(precips[i] ?? 0),
        weatherCode: codes[i] ?? 0,
        weatherCondition: wmo.condition,
        weatherIcon: wmo.icon,
      });
    }
  }

    return {
    current: currentWeather,
    forecast,
    latitude: data.latitude ?? latitude,
    longitude: data.longitude ?? longitude,
    timezone: data.timezone ?? 'Asia/Kolkata',
  };
}

export interface HistoricalWeatherSummary {
  startDate: string;
  endDate: string;
  meanTemperature: number;
  tempMin: number;
  tempMax: number;
  totalRainfall: number; // mm
  rainyDays: number;
}

/**
 * Fetch aggregated historical weather for exact farm coordinates over a crop cycle window
 * Uses Open-Meteo Historical Archive API
 */
export async function getHistoricalFarmWeather(
  latitude: number,
  longitude: number,
  startDateStr?: string,
  endDateStr?: string
): Promise<HistoricalWeatherSummary> {
  if (!validateCoordinates(latitude, longitude)) {
    throw new Error('Invalid coordinates for historical weather lookup.');
  }

  // Default to past 60 days if dates not provided
  const end = endDateStr ? new Date(endDateStr) : new Date();
  const start = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const startFormatted = start.toISOString().split('T')[0];
  const endFormatted = end.toISOString().split('T')[0];

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startFormatted}&end_date=${endFormatted}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Historical weather API returned ${res.status}`);
    }
    const data = await res.json();
    const daily = data.daily || {};

    const means: number[] = daily.temperature_2m_mean || [];
    const maxs: number[] = daily.temperature_2m_max || [];
    const mins: number[] = daily.temperature_2m_min || [];
    const precips: number[] = daily.precipitation_sum || [];

    const totalDays = means.length || 1;
    const meanTemperature = Math.round(means.reduce((acc, curr) => acc + (curr || 0), 0) / totalDays);
    const tempMax = Math.round(Math.max(...(maxs.length ? maxs : [30])));
    const tempMin = Math.round(Math.min(...(mins.length ? mins : [15])));
    const totalRainfall = Math.round(precips.reduce((acc, curr) => acc + (curr || 0), 0));
    const rainyDays = precips.filter((p) => p > 1.0).length;

    return {
      startDate: startFormatted,
      endDate: endFormatted,
      meanTemperature,
      tempMin,
      tempMax,
      totalRainfall,
      rainyDays,
    };
  } catch (err) {
    console.warn('[Weather Service Warning] Could not fetch historical weather, using seasonal estimate:', err);
    return {
      startDate: startFormatted,
      endDate: endFormatted,
      meanTemperature: 24,
      tempMin: 16,
      tempMax: 32,
      totalRainfall: 120,
      rainyDays: 8,
    };
  }
}

export interface YearOverYearWeatherSummary {
  windowDescription: string;
  yearsAnalyzed: number[];
  multiYearAvgTemp: number;
  multiYearMinTemp: number;
  multiYearMaxTemp: number;
  multiYearAvgRainfall: number;
  multiYearAvgRainyDays: number;
  heatEventCount: number; // Total days > 38°C across analyzed windows
  dryPeriodCount: number; // Total dry periods across analyzed windows
  yearlyBreakdown: Array<{
    year: number;
    startDate: string;
    endDate: string;
    meanTemp: number;
    minTemp: number;
    maxTemp: number;
    totalRainfall: number;
    rainyDays: number;
  }>;
}

/**
 * Fetch Same-Season Year-Over-Year (YoY) Historical Weather across multiple previous years.
 * Analyzes a window (e.g. +/- windowDays) around targetDateStr for yearsBack previous years (e.g., 2025, 2024, 2023).
 */
export async function getYearOverYearHistoricalWeather(
  latitude: number,
  longitude: number,
  targetDateStr?: string,
  windowDays: number = 7,
  yearsBack: number = 3
): Promise<YearOverYearWeatherSummary> {
  if (!validateCoordinates(latitude, longitude)) {
    throw new Error('Invalid coordinates for YoY historical weather lookup.');
  }

  const baseDate = targetDateStr ? new Date(targetDateStr) : new Date();
  const currentYear = baseDate.getFullYear();
  const yearlyBreakdown: YearOverYearWeatherSummary['yearlyBreakdown'] = [];
  const yearsAnalyzed: number[] = [];

  const promises = [];
  for (let i = 1; i <= yearsBack; i++) {
    const year = currentYear - i;
    yearsAnalyzed.push(year);

    const yearBase = new Date(baseDate);
    yearBase.setFullYear(year);

    const start = new Date(yearBase.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const end = new Date(yearBase.getTime() + windowDays * 24 * 60 * 60 * 1000);

    const startFormatted = start.toISOString().split('T')[0];
    const endFormatted = end.toISOString().split('T')[0];

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startFormatted}&end_date=${endFormatted}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

    promises.push(
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data || !data.daily) return null;
          const daily = data.daily;
          const means: number[] = daily.temperature_2m_mean || [];
          const maxs: number[] = daily.temperature_2m_max || [];
          const mins: number[] = daily.temperature_2m_min || [];
          const precips: number[] = daily.precipitation_sum || [];

          const totalDays = means.length || 1;
          const meanTemp = Math.round(means.reduce((acc, curr) => acc + (curr || 0), 0) / totalDays);
          const maxTemp = Math.round(Math.max(...(maxs.length ? maxs : [30])));
          const minTemp = Math.round(Math.min(...(mins.length ? mins : [15])));
          const totalRainfall = Math.round(precips.reduce((acc, curr) => acc + (curr || 0), 0));
          const rainyDays = precips.filter((p) => p > 1.0).length;

          return {
            year,
            startDate: startFormatted,
            endDate: endFormatted,
            meanTemp,
            minTemp,
            maxTemp,
            totalRainfall,
            rainyDays,
            maxs,
            precips,
          };
        })
        .catch(() => null)
    );
  }

  const results = await Promise.all(promises);

  let heatEventCount = 0;
  let dryPeriodCount = 0;

  results.forEach((res) => {
    if (res) {
      yearlyBreakdown.push({
        year: res.year,
        startDate: res.startDate,
        endDate: res.endDate,
        meanTemp: res.meanTemp,
        minTemp: res.minTemp,
        maxTemp: res.maxTemp,
        totalRainfall: res.totalRainfall,
        rainyDays: res.rainyDays,
      });

      // Count heat events (> 38°C)
      if (res.maxs) {
        heatEventCount += res.maxs.filter((m) => m >= 38).length;
      }
      // Count dry periods (consecutive 3+ days with zero precipitation)
      if (res.precips) {
        let zeroStreak = 0;
        for (const p of res.precips) {
          if (p <= 0.2) zeroStreak++;
          else {
            if (zeroStreak >= 3) dryPeriodCount++;
            zeroStreak = 0;
          }
        }
        if (zeroStreak >= 3) dryPeriodCount++;
      }
    }
  });

  const validCount = yearlyBreakdown.length || 1;
  const multiYearAvgTemp = Math.round(
    yearlyBreakdown.reduce((acc, curr) => acc + curr.meanTemp, 0) / validCount
  );
  const multiYearMinTemp = Math.min(...yearlyBreakdown.map((b) => b.minTemp));
  const multiYearMaxTemp = Math.max(...yearlyBreakdown.map((b) => b.maxTemp));
  const multiYearAvgRainfall = Math.round(
    yearlyBreakdown.reduce((acc, curr) => acc + curr.totalRainfall, 0) / validCount
  );
  const multiYearAvgRainyDays = Math.round(
    yearlyBreakdown.reduce((acc, curr) => acc + curr.rainyDays, 0) / validCount
  );

  const startMonthDay = baseDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return {
    windowDescription: `±${windowDays} days around ${startMonthDay} across ${yearsAnalyzed.reverse().join(', ')}`,
    yearsAnalyzed,
    multiYearAvgTemp: isNaN(multiYearAvgTemp) ? 25 : multiYearAvgTemp,
    multiYearMinTemp: isNaN(multiYearMinTemp) || multiYearMinTemp === Infinity ? 16 : multiYearMinTemp,
    multiYearMaxTemp: isNaN(multiYearMaxTemp) || multiYearMaxTemp === -Infinity ? 34 : multiYearMaxTemp,
    multiYearAvgRainfall: isNaN(multiYearAvgRainfall) ? 35 : multiYearAvgRainfall,
    multiYearAvgRainyDays: isNaN(multiYearAvgRainyDays) ? 2 : multiYearAvgRainyDays,
    heatEventCount,
    dryPeriodCount,
    yearlyBreakdown,
  };
}

/**
 * Fetch Historical Weather around Expected Harvest Window across previous years
 */
export async function getHarvestWindowHistoricalWeather(
  latitude: number,
  longitude: number,
  expectedHarvestDateStr: string,
  windowDays: number = 7,
  yearsBack: number = 3
): Promise<YearOverYearWeatherSummary> {
  const summary = await getYearOverYearHistoricalWeather(
    latitude,
    longitude,
    expectedHarvestDateStr,
    windowDays,
    yearsBack
  );

  const harvestDate = new Date(expectedHarvestDateStr);
  const harvestMonthDay = harvestDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  summary.windowDescription = `Harvest Window Climate (±${windowDays}d around ${harvestMonthDay} across ${summary.yearsAnalyzed.reverse().join(', ')})`;
  return summary;
}


