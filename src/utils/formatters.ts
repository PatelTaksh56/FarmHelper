/**
 * Centralized formatting and conversion utilities for FarmHelper.
 * Ensures consistent presentation of numbers and units based on user preferences.
 */

// AREA CONVERSIONS
// Base unit: Square Meters (sqm)
export const AREA_CONVERSION_CONFIG: Record<string, number> = {
  // 1 unit = X Square Meters
  'Acre': 4046.8564224,
  'Hectare': 10000,
  // Bigha varies significantly by region in India.
  // Standard Northern India (Punjab, Haryana, Parts of UP) = ~0.25 Hectares
  'Bigha': 2529.28, 
};

export function formatArea(squareMeters: number | undefined | null, unit: 'Acre' | 'Hectare' | 'Bigha', decimals = 2, t?: (key: string) => string): string {
  if (squareMeters === undefined || squareMeters === null || isNaN(squareMeters)) {
    const fallbackUnit = t ? t(`units.${unit.toLowerCase()}`) || unit : unit;
    return '0 ' + fallbackUnit;
  }
  
  const factor = AREA_CONVERSION_CONFIG[unit] || AREA_CONVERSION_CONFIG['Acre'];
  const converted = squareMeters / factor;
  
  // Format nicely (e.g. 1.5 Acre or 1.50 Hectare depending on standard)
  const formattedValue = Number.isInteger(converted) 
    ? converted.toString() 
    : converted.toFixed(decimals).replace(/\.?0+$/, ''); // Remove trailing zeros
    
  const localizedUnit = t ? (t(`units.${unit.toLowerCase()}`) || unit) : unit;
  return `${formattedValue} ${localizedUnit}`;
}

export function convertArea(squareMeters: number | undefined | null, unit: 'Acre' | 'Hectare' | 'Bigha'): number {
  if (squareMeters === undefined || squareMeters === null || isNaN(squareMeters)) return 0;
  const factor = AREA_CONVERSION_CONFIG[unit] || AREA_CONVERSION_CONFIG['Acre'];
  return squareMeters / factor;
}

// TEMPERATURE CONVERSIONS
// Base unit: Celsius (°C)
export function formatTemperature(celsius: number | undefined | null, scale?: 'Celsius' | 'Fahrenheit', _t?: (key: string) => string): string {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  
  if (scale === 'Fahrenheit') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  
  return `${Math.round(celsius)}°C`;
}

// WEIGHT & YIELD CONVERSIONS
// Base unit: Kilogram (Kg)
export const WEIGHT_CONVERSION_CONFIG: Record<string, number> = {
  // 1 unit = X Kg
  'Kg': 1,
  'Quintal': 100,
  'Tonne': 1000,
};

export function formatWeight(kg: number | undefined | null, unit: 'Quintal' | 'Kg' | 'Tonne', decimals = 2, t?: (key: string) => string): string {
  if (kg === undefined || kg === null || isNaN(kg)) {
    const fallbackUnit = unit === 'Kg' ? 'kg' : unit.toLowerCase();
    const localizedZeroUnit = t ? t(`units.${fallbackUnit.toLowerCase()}`) || fallbackUnit : fallbackUnit;
    return `0 ${localizedZeroUnit}`;
  }
  
  const factor = WEIGHT_CONVERSION_CONFIG[unit] || 1;
  const converted = kg / factor;
  
  const formattedValue = Number.isInteger(converted) 
    ? converted.toString() 
    : converted.toFixed(decimals).replace(/\.?0+$/, '');
    
  const displayUnit = unit === 'Kg' ? 'kg' : (unit === 'Tonne' ? 'Tonne' : 'Quintal');
  const localizedUnit = t ? (t(`units.${displayUnit.toLowerCase()}`) || displayUnit) : displayUnit;
  return `${formattedValue} ${localizedUnit}`;
}

// MARKET PRICE CONVERSIONS
// Base rate: ₹ per Quintal
export function formatMarketPrice(pricePerQuintal: number | undefined | null, targetUnit: 'Quintal' | 'Kg' | 'Tonne'): string {
  if (pricePerQuintal === undefined || pricePerQuintal === null || isNaN(pricePerQuintal) || pricePerQuintal <= 0) return '—';
  
  // Calculate price per Kg as intermediate
  const pricePerKg = pricePerQuintal / 100;
  
  let finalPrice = pricePerQuintal;
  let unitLabel = 'Quintal';
  
  if (targetUnit === 'Kg') {
    finalPrice = pricePerKg;
    unitLabel = 'kg';
  } else if (targetUnit === 'Tonne') {
    finalPrice = pricePerKg * 1000;
    unitLabel = 'Tonne';
  }
  
  // Format to 2 decimal places if there are decimals, otherwise whole number
  const formattedPrice = Number.isInteger(finalPrice) 
    ? finalPrice.toString() 
    : finalPrice.toFixed(2);
    
  return `₹${formattedPrice}`;
}

export function getMarketPriceUnitLabel(targetUnit: 'Quintal' | 'Kg' | 'Tonne'): string {
  if (targetUnit === 'Kg') return 'kg';
  if (targetUnit === 'Tonne') return 'Tonne';
  return 'Quintal';
}
