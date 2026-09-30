/**
 * Centralized Google Maps JS API Loader Service
 * Uses @googlemaps/js-api-loader setOptions() and importLibrary() functions.
 * Ensures Google Maps API script is only configured and loaded once.
 */
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let isOptionsConfigured = false;

/**
 * Retrieve and validate the Google Maps API Key from Vite environment variables.
 */
export function getGoogleMapsApiKey(): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || key.trim() === '') {
    throw new Error(
      'Google Maps API Key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.'
    );
  }
  return key;
}

/**
 * Configure global options for Google Maps JS API loader.
 */
export function configureGoogleMaps(): void {
  if (!isOptionsConfigured) {
    const apiKey = getGoogleMapsApiKey();
    setOptions({
      key: apiKey,
      v: 'weekly',
    });
    isOptionsConfigured = true;
  }
}

export interface GoogleMapsLoadedLibraries {
  maps: google.maps.MapsLibrary;
  places: google.maps.PlacesLibrary;
  geometry: google.maps.GeometryLibrary;
  core: google.maps.CoreLibrary;
  marker: google.maps.MarkerLibrary;
  googleMaps: typeof google.maps;
}

/**
 * Dynamically import required Google Maps libraries using modern importLibrary API.
 */
export async function loadGoogleMapsLibraries(): Promise<GoogleMapsLoadedLibraries> {
  configureGoogleMaps();

  const [mapsLib, placesLib, geometryLib, coreLib, markerLib] = await Promise.all([
    importLibrary('maps'),
    importLibrary('places'),
    importLibrary('geometry'),
    importLibrary('core'),
    importLibrary('marker'),
  ]);

  return {
    maps: mapsLib as google.maps.MapsLibrary,
    places: placesLib as google.maps.PlacesLibrary,
    geometry: geometryLib as google.maps.GeometryLibrary,
    core: coreLib as google.maps.CoreLibrary,
    marker: markerLib as google.maps.MarkerLibrary,
    googleMaps: window.google.maps,
  };
}
