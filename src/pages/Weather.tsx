import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { localizeWeatherCondition, localizeFarmName } from '../i18n/localize';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { formatTemperature } from '../utils/formatters';
import { getUserFarms } from '../services/farmService';
import { Farm } from '../types/models';
import {
  getWeatherForCoordinates,
  validateCoordinates,
  FarmWeatherResponse,
} from '../services/weatherService';

export const Weather: React.FC = () => {
  const { currentUser, userSettings } = useAuth();
  const { t } = useTranslation();

  // Farm state
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [loadingFarms, setLoadingFarms] = useState<boolean>(true);

  // Fallback Geolocation state for users without a farm
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationState, setLocationState] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error' | 'unsupported'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Weather telemetry state
  const [weatherData, setWeatherData] = useState<FarmWeatherResponse | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Ref to cancel out-of-order weather requests
  const activeRequestIdRef = useRef<number>(0);

  // Browser Geolocation requester function
  const requestBrowserLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationState('unsupported');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationState('requesting');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationState('granted');
        setLocationError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationState('denied');
          setLocationError('Location permission was denied. Please allow location access in your browser settings to view local weather.');
        } else {
          setLocationState('error');
          setLocationError(err.message || 'Unable to detect your device location. Please try again or add a farm plot manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Load farms belonging strictly to authenticated user
  useEffect(() => {
    if (!currentUser?.uid) return;

    let isMounted = true;
    setLoadingFarms(true);

    getUserFarms(currentUser.uid)
      .then((userFarms) => {
        if (!isMounted) return;
        setFarms(userFarms);
        if (userFarms.length > 0) {
          const initialFarm = userFarms.find((f) => (f as any).isPrimary) || userFarms[0];
          setSelectedFarmId(initialFarm.id || '');
        } else {
          // Fallback: If user has no saved farm, request browser geolocation
          requestBrowserLocation();
        }
      })
      .catch((err) => {
        console.error('Error fetching user farms for weather:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingFarms(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  // Derived selected farm object
  const selectedFarm = useMemo(() => {
    return farms.find((f) => f.id === selectedFarmId) || null;
  }, [farms, selectedFarmId]);

  // Determine active target coordinates (Priority: Selected Farm -> Browser Location)
  const activeCoordinates = useMemo(() => {
    if (farms.length > 0 && selectedFarm) {
      return {
        lat: selectedFarm.latitude,
        lng: selectedFarm.longitude,
        source: 'farm' as const,
        title: selectedFarm.farmName,
        subtitle: selectedFarm.locationName,
      };
    } else if (farms.length === 0 && userLocation && locationState === 'granted') {
      return {
        lat: userLocation.lat,
        lng: userLocation.lng,
        source: 'geolocation' as const,
        title: 'Current Location',
        subtitle: 'Device Location',
      };
    }
    return null;
  }, [farms.length, selectedFarm, userLocation, locationState]);

  // Fetch weather telemetry whenever activeCoordinates or temperatureScale changes
  useEffect(() => {
    if (!activeCoordinates) {
      setWeatherData(null);
      setWeatherError(null);
      return;
    }

    const currentRequestId = ++activeRequestIdRef.current;

    setWeatherData(null);
    setWeatherError(null);

    const isValid = validateCoordinates(activeCoordinates.lat, activeCoordinates.lng);
    if (!isValid) {
      setWeatherError(
        activeCoordinates.source === 'farm'
          ? `Farm "${activeCoordinates.title}" has invalid or missing coordinates (${activeCoordinates.lat}, ${activeCoordinates.lng}). Please update its location in My Farm.`
          : 'Your current location returned invalid coordinates. Please try again.'
      );
      setLoadingWeather(false);
      return;
    }

    setLoadingWeather(true);

    getWeatherForCoordinates(
      activeCoordinates.lat,
      activeCoordinates.lng
    )
      .then((res) => {
        if (currentRequestId === activeRequestIdRef.current) {
          setWeatherData(res);
          setWeatherError(null);
        }
      })
      .catch((err: any) => {
        if (currentRequestId === activeRequestIdRef.current) {
          console.error('Weather service error:', err);
          setWeatherError(
            err.message || 'Unable to retrieve weather telemetry. Please check your network connection.'
          );
        }
      })
      .finally(() => {
        if (currentRequestId === activeRequestIdRef.current) {
          setLoadingWeather(false);
        }
      });
  }, [activeCoordinates]);

  // Helper to format lat/lng cleanly
  const formatCoordinates = (lat?: number, lng?: number) => {
    if (lat === undefined || lng === undefined) return 'N/A';
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
            {t('weather.title')}
          </h1>
        </div>
      </div>

      {/* Loading Farms State */}
      {loadingFarms && (
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-8 text-center text-umber-brown space-y-3">
          <div className="inline-block w-8 h-8 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading your registered farm plots...</p>
        </div>
      )}

      {/* Requesting Location State (When user has no farm and geolocation is running) */}
      {!loadingFarms && farms.length === 0 && locationState === 'requesting' && (
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-10 text-center text-umber-brown space-y-3">
          <div className="inline-block w-8 h-8 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin"></div>
          <h3 className="font-headline text-lg font-bold text-charred-soil">Detecting Your Location</h3>
          <p className="text-xs text-umber-brown max-w-md mx-auto">
            Requesting browser location permissions to show local weather for your position...
          </p>
        </div>
      )}

      {/* Location Permission Denied / Error State (When user has no farm) */}
      {!loadingFarms && farms.length === 0 && (locationState === 'denied' || locationState === 'error' || locationState === 'unsupported') && (
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand p-8 sm:p-10 text-center shadow-soft-umber space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">location_off</span>
          </div>

          <div>
            <h3 className="font-headline text-xl font-bold text-charred-soil">
              {locationState === 'denied' ? 'Location Access Required' : 'Unable to Detect Location'}
            </h3>
            <p className="text-sm text-umber-brown max-w-md mx-auto mt-1.5 leading-relaxed">
              {locationState === 'denied'
                ? 'Location access is required to show weather for your current location when no saved farm plot exists.'
                : locationError || 'Location detection failed. Allow location access or add a farm plot to view local weather telemetry.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={requestBrowserLocation}
              className="py-2.5 px-6 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">my_location</span>
              <span>{locationState === 'denied' ? 'Allow Location Access' : 'Try Again'}</span>
            </button>

            <Link
              to="/my-farm"
              className="py-2.5 px-6 rounded-md border border-pressed-sand bg-[#FFFDF9] hover:bg-[#FAF7F2] text-charred-soil text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">add_location_alt</span>
              <span>Add Farm Plot</span>
            </Link>
          </div>
        </div>
      )}

      {/* No Farm Banner (When user has no farm but geolocation granted) */}
      {!loadingFarms && farms.length === 0 && locationState === 'granted' && (
        <div className="bg-[#F0F4E8] rounded-xl border border-[#91A35A]/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-harvest-olive text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-xl">my_location</span>
            </div>
            <div>
              <span className="text-xs font-bold text-charred-soil block">
                Using Current Device Location
              </span>
              <span className="text-[11px] text-umber-brown block">
                Showing live weather for your detected coordinates. Add a farm plot for microclimate telemetry.
              </span>
            </div>
          </div>

          <Link
            to="/my-farm"
            className="py-2 px-4 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add Farm Plot</span>
          </Link>
        </div>
      )}

      {/* Active Weather Dashboard (Runs when activeCoordinates exists) */}
      {!loadingFarms && activeCoordinates && (
        <div className="space-y-6">
          {/* Farm Selector Header (When user has farms) */}
          {farms.length > 0 && selectedFarm && (
            <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pressed-sand/80 pb-4">
                <div className="flex flex-col gap-1.5 min-w-[260px] sm:min-w-[320px]">
                  <label htmlFor="farm-selector" className="text-[11px] font-bold uppercase tracking-wider text-harvest-olive flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>Select Farm Location</span>
                  </label>
                  <div className="relative w-full">
                    <select
                      id="farm-selector"
                      value={selectedFarmId}
                      onChange={(e) => setSelectedFarmId(e.target.value)}
                      className="w-full bg-[#F6F3EC] hover:bg-[#F0ECE1] border border-pressed-sand rounded-lg pl-3.5 pr-10 py-2.5 text-sm font-bold text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none transition-colors cursor-pointer appearance-none shadow-xs"
                    >
                      {farms.map((f) => {
                        const lUnit = f.landAreaUnit || 'Acre';
                        return (
                          <option key={f.id} value={f.id}>
                            {localizeFarmName(f.farmName, t)} — {localizeFarmName(f.locationName, t)} ({f.landArea} {t(`units.${lUnit.toLowerCase()}`) || lUnit})
                          </option>
                        );
                      })}
                    </select>
                    <span className="material-symbols-outlined text-umber-brown text-xl absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      unfold_more
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs bg-[#FAF7F2] sm:bg-transparent p-3 sm:p-0 rounded-lg border border-pressed-sand/60 sm:border-none shrink-0">
                  <span className="text-umber-brown block text-[11px] font-medium">{t('weather.farmLocationCoords', 'Farm Location Coordinates')}</span>
                  <span className="font-mono font-bold text-charred-soil text-sm block mt-0.5">
                    {formatCoordinates(selectedFarm.latitude, selectedFarm.longitude)}
                  </span>
                  <span className="text-[11px] text-harvest-olive font-semibold mt-0.5 block">
                    {localizeFarmName(selectedFarm.locationName, t)}
                  </span>
                </div>
              </div>

              {/* Selected Farm Details Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-umber-brown">
                <span className="flex items-center gap-1 font-medium text-charred-soil bg-[#FAF7F2] px-3 py-1 rounded-md border border-pressed-sand">
                  <span className="material-symbols-outlined text-harvest-olive text-sm">landscape</span>
                  <span>{localizeFarmName(selectedFarm.farmName, t)}</span>
                </span>
                <span className="flex items-center gap-1 bg-[#FAF7F2] px-3 py-1 rounded-md border border-pressed-sand">
                  <span className="material-symbols-outlined text-harvest-olive text-sm">square_foot</span>
                  <span>{selectedFarm.landArea} {t(`units.${(selectedFarm.landAreaUnit || userSettings.landAreaUnit).toLowerCase()}`) || (selectedFarm.landAreaUnit || userSettings.landAreaUnit)}</span>
                </span>
                {selectedFarm.currentCrop && (
                  <span className="flex items-center gap-1 bg-[#FAF7F2] px-3 py-1 rounded-md border border-pressed-sand">
                    <span className="material-symbols-outlined text-harvest-olive text-sm">eco</span>
                    <span>{selectedFarm.currentCrop}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Device Location Coordinates Card (When user has no farm) */}
          {farms.length === 0 && userLocation && (
            <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-harvest-olive text-2xl">location_on</span>
                <div>
                  <span className="text-xs font-bold text-charred-soil block">📍 Current Location</span>
                  <span className="text-xs text-umber-brown">
                    Using live GPS coordinates from your browser
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right font-mono text-xs font-semibold text-charred-soil bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-pressed-sand">
                GPS: {formatCoordinates(userLocation.lat, userLocation.lng)}
              </div>
            </div>
          )}

          {/* Loading Weather State */}
          {loadingWeather && (
            <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand p-12 text-center text-umber-brown shadow-soft-umber space-y-3 animate-pulse">
              <div className="inline-block w-8 h-8 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-charred-soil">
                Loading weather telemetry for {localizeFarmName(activeCoordinates.title, t)}...
              </p>
              <p className="text-xs text-umber-brown">
                Fetching latest satellite observations...
              </p>
            </div>
          )}

          {/* Weather Error State */}
          {weatherError && !loadingWeather && (
            <div className="bg-[#FFFDF9] rounded-xl border border-red-200 p-6 shadow-soft-umber space-y-4">
              <div className="flex items-start gap-3 text-red-800">
                <span className="material-symbols-outlined text-2xl shrink-0 text-red-600">error</span>
                <div>
                  <h3 className="font-headline font-bold text-base">Unable to Fetch Weather</h3>
                  <p className="text-xs mt-1 text-red-700 leading-relaxed">{weatherError}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-red-100">
                {activeCoordinates.source === 'farm' ? (
                  <Link
                    to="/my-farm"
                    className="py-2 px-4 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">edit_location</span>
                    <span>Edit Farm Location</span>
                  </Link>
                ) : (
                  <button
                    onClick={requestBrowserLocation}
                    className="py-2 px-4 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">my_location</span>
                    <span>Retry Location</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (activeCoordinates) {
                      setLoadingWeather(true);
                      setWeatherError(null);
                      getWeatherForCoordinates(
                        activeCoordinates.lat,
                        activeCoordinates.lng
                      )
                        .then((res) => setWeatherData(res))
                        .catch((err) => setWeatherError(err.message))
                        .finally(() => setLoadingWeather(false));
                    }
                  }}
                  className="py-2 px-4 border border-pressed-sand bg-[#FFFDF9] hover:bg-[#FAF7F2] text-charred-soil text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Check Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Weather Display Cards */}
          {weatherData && !loadingWeather && (
            <div className="space-y-6 animate-fadeIn">
              {/* Primary Current Weather Banner */}
              <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pressed-sand pb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#F0F4E8] border border-[#91A35A]/30 flex items-center justify-center text-harvest-olive shrink-0">
                      <span className="material-symbols-outlined text-4xl">
                        {weatherData.current.weatherIcon}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-umber-brown uppercase tracking-wider">
                        {t('weather.currentWeather')}
                      </span>
                      <div className="font-headline text-4xl sm:text-5xl font-bold text-charred-soil mt-0.5">
                        {formatTemperature(weatherData.current.temperature, userSettings.temperatureScale as any || 'Celsius', t)}
                      </div>
                      <p className="text-sm font-medium text-charred-soil mt-1">
                        {localizeWeatherCondition(weatherData.current.weatherCondition, t)} • {t('weather.feelsLike')} {formatTemperature(weatherData.current.apparentTemperature, userSettings.temperatureScale as any || 'Celsius', t)}
                      </p>
                      <p className="text-[11px] text-umber-brown mt-0.5">
                        Updated {weatherData.current.lastUpdated} for {(() => {
                          const titleStr = localizeFarmName(activeCoordinates.title, t);
                          const subtitleStr = localizeFarmName(activeCoordinates.subtitle, t);
                          return (subtitleStr && subtitleStr !== titleStr) ? `${titleStr} (${subtitleStr})` : titleStr;
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Spray Advisory Card */}
                  <div className={`p-4 rounded-xl border text-right max-w-xs shrink-0 ${weatherData.current.sprayIndex.badgeColor}`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider block">
                      {t('weather.sprayAdvice')}
                    </span>
                    <span className="text-lg font-headline font-bold block mt-0.5">
                      {weatherData.current.sprayIndex.status}
                    </span>
                    <p className="text-[11px] leading-tight mt-1">
                      {weatherData.current.sprayIndex.description}
                    </p>
                  </div>
                </div>

                {/* Weather Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#FAF7F2] rounded-lg border border-pressed-sand">
                    <div className="flex items-center gap-1.5 text-umber-brown text-[11px] uppercase font-semibold">
                      <span className="material-symbols-outlined text-harvest-olive text-base">humidity_low</span>
                      <span>{t('weather.relativeHumidity')}</span>
                    </div>
                    <p className="font-headline text-2xl font-bold text-charred-soil mt-1">
                      {weatherData.current.humidity}%
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF7F2] rounded-lg border border-pressed-sand">
                    <div className="flex items-center gap-1.5 text-xs text-umber-brown font-semibold mb-1">
                      <span className="material-symbols-outlined text-harvest-olive text-base">air</span>
                      <span>{t('weather.windVelocity')}</span>
                    </div>
                    <p className="font-headline text-2xl font-bold text-charred-soil mt-1">
                      {weatherData.current.windSpeed} {t('weather.kmh', 'km/h')}
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF7F2] rounded-lg border border-pressed-sand">
                    <div className="flex items-center gap-1.5 text-umber-brown text-[11px] uppercase font-semibold">
                      <span className="material-symbols-outlined text-harvest-olive text-base">rainy</span>
                      <span>{t('weather.rainProbability')}</span>
                    </div>
                    <p className="font-headline text-2xl font-bold text-charred-soil mt-1">
                      {weatherData.current.precipitationProbability}%
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF7F2] rounded-lg border border-pressed-sand">
                    <div className="flex items-center gap-1.5 text-umber-brown text-[11px] uppercase font-semibold">
                      <span className="material-symbols-outlined text-harvest-olive text-base">thermostat</span>
                      <span>{t('weather.dewPoint')}</span>
                    </div>
                    <p className="font-headline text-2xl font-bold text-charred-soil mt-1">
                      {formatTemperature(weatherData.current.dewPoint, userSettings.temperatureScale as any || 'Celsius', t)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5-Day Forecast Section */}
              <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-pressed-sand pb-3">
                  <h3 className="font-headline text-lg font-bold text-charred-soil flex items-center gap-2">
                    <span className="material-symbols-outlined text-harvest-olive">calendar_view_week</span>
                    <span>{t('weather.forecast5Day')}</span>
                  </h3>
                  <span className="text-xs text-umber-brown">
                    Satellite Weather Forecast
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {weatherData.forecast.map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border text-center space-y-2 transition-colors ${
                        idx === 0
                          ? 'bg-[#F0F4E8] border-[#91A35A]/40'
                          : 'bg-[#FAF7F2] border-pressed-sand'
                      }`}
                    >
                      <div className="text-xs font-bold text-charred-soil">{day.dayName}</div>
                      <div className="text-[11px] text-umber-brown">{day.date}</div>

                      <span className="material-symbols-outlined text-3xl text-harvest-olive block my-1">
                        {day.weatherIcon}
                      </span>

                      <div className="text-xs font-bold text-charred-soil">
                        {formatTemperature(day.maxTemp, userSettings.temperatureScale as any || 'Celsius', t)} / <span className="text-umber-brown font-normal">{formatTemperature(day.minTemp, userSettings.temperatureScale as any || 'Celsius', t)}</span>
                      </div>

                      <div className="text-[11px] text-umber-brown truncate" title={localizeWeatherCondition(day.weatherCondition, t)}>
                        {localizeWeatherCondition(day.weatherCondition, t)}
                      </div>

                      {day.precipitationProbability > 0 && (
                        <div className="text-[10px] font-semibold text-harvest-olive flex items-center justify-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">water_drop</span>
                          <span>{day.precipitationProbability}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
