import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMapsLibraries, GoogleMapsLoadedLibraries } from '../../services/googleMaps';
import { FarmBoundaryPoint } from '../../types/models';
import { useAuth } from '../../context/AuthContext';
import { formatArea } from '../../utils/formatters';

export interface GoogleFarmMapProps {
  initialBoundary?: FarmBoundaryPoint[];
  initialCenter?: { lat: number; lng: number };
  isInteractive?: boolean; // true for Add/Edit farm, false for view-only mode
  onBoundaryChange?: (
    boundary: FarmBoundaryPoint[],
    center: { lat: number; lng: number },
    areaM2: number,
    acres: number,
    hectares: number
  ) => void;
  onLocationSelect?: (
    center: { lat: number; lng: number },
    locationName?: string,
    accuracy?: number
  ) => void;
  className?: string;
  mapHeight?: string;
}

export const GoogleFarmMap: React.FC<GoogleFarmMapProps> = ({
  initialBoundary = [],
  initialCenter,
  isInteractive = true,
  onBoundaryChange,
  onLocationSelect,
  className = '',
  mapHeight = '450px',
}) => {
  const { userSettings } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<{
    element: HTMLElement;
    selectListener: (e: any) => void;
    errorListener: (e: any) => void;
  } | null>(null);

  // Map & API instances
  const mapRef = useRef<google.maps.Map | null>(null);
  const googleRef = useRef<GoogleMapsLoadedLibraries | null>(null);
  const locationMarkerRef = useRef<google.maps.Marker | null>(null);

  // Drawing state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<FarmBoundaryPoint[]>([]);
  const [isPolygonFinished, setIsPolygonFinished] = useState(false);

  // Area state
  const [areaM2, setAreaM2] = useState<number>(0);
  const [areaAcres, setAreaAcres] = useState<number>(0);
  const [areaHectares, setAreaHectares] = useState<number>(0);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Maps overlay objects refs
  const tempPolylineRef = useRef<google.maps.Polyline | null>(null);
  const tempMarkersRef = useRef<google.maps.Marker[]>([]);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const pathListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Default coordinates (Karnal, Haryana - Central India Ag Belt default)
  const defaultCenter = initialCenter || { lat: 29.6857, lng: 76.9907 };

  // Helper to update location marker and trigger location callback
  const updateLocationMarkerAndState = useCallback(
    (
      center: { lat: number; lng: number },
      locationName?: string,
      accuracy?: number
    ) => {
      if (!googleRef.current || !mapRef.current) return;
      const libs = googleRef.current;
      const mapInstance = mapRef.current;

      // Update or create current location marker
      if (locationMarkerRef.current) {
        locationMarkerRef.current.setPosition(center);
        locationMarkerRef.current.setMap(mapInstance);
      } else {
        const marker = new libs.marker.Marker({
          position: center,
          map: mapInstance,
          title: locationName || 'Selected Location',
        });
        locationMarkerRef.current = marker;
      }

      if (onLocationSelect) {
        onLocationSelect(center, locationName, accuracy);
      }
    },
    [onLocationSelect]
  );

  // Calculate polygon area and center
  const calculateMetrics = useCallback(
    (points: FarmBoundaryPoint[]) => {
      if (!googleRef.current || points.length < 3) {
        setAreaM2(0);
        setAreaAcres(0);
        setAreaHectares(0);
        return { areaM2: 0, acres: 0, hectares: 0, center: defaultCenter };
      }

      const path = points.map(
        (p) => new googleRef.current!.core.LatLng(p.lat, p.lng)
      );
      const computedM2 =
        googleRef.current.geometry.spherical.computeArea(path);

      const acres = parseFloat((computedM2 / 4046.8564224).toFixed(2));
      const hectares = parseFloat((computedM2 / 10000).toFixed(2));
      const m2Rounded = parseFloat(computedM2.toFixed(2));

      // Calculate centroid
      let latSum = 0;
      let lngSum = 0;
      points.forEach((p) => {
        latSum += p.lat;
        lngSum += p.lng;
      });
      const center = {
        lat: parseFloat((latSum / points.length).toFixed(6)),
        lng: parseFloat((lngSum / points.length).toFixed(6)),
      };

      setAreaM2(m2Rounded);
      setAreaAcres(acres);
      setAreaHectares(hectares);

      return { areaM2: m2Rounded, acres, hectares, center };
    },
    [defaultCenter]
  );

  // Clean temp markers & polylines
  const clearDrawingOverlays = () => {
    tempMarkersRef.current.forEach((m) => m.setMap(null));
    tempMarkersRef.current = [];

    if (tempPolylineRef.current) {
      tempPolylineRef.current.setMap(null);
      tempPolylineRef.current = null;
    }
  };

  // Clean polygon & listeners
  const clearPolygon = () => {
    pathListenersRef.current.forEach((listener) => listener.remove());
    pathListenersRef.current = [];

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
  };

  // 1. Initialize Google Maps
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        const libs = await loadGoogleMapsLibraries();
        if (!isMounted || !mapContainerRef.current) return;

        googleRef.current = libs;

        const controlPositionTopRight =
          libs.core?.ControlPosition?.TOP_RIGHT ??
          libs.googleMaps?.ControlPosition?.TOP_RIGHT;

        const mapInstance = new libs.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: initialBoundary.length > 0 ? 16 : 14,
          mapTypeId: libs.maps.MapTypeId.HYBRID, // Satellite with Roads by default for precise farming boundaries
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: libs.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: controlPositionTopRight,
          },
          fullscreenControl: true,
          streetViewControl: false,
          zoomControl: true,
        });

        mapRef.current = mapInstance;

        // Setup modern PlaceAutocompleteElement Search (Places API New) if container ref exists
        if (searchContainerRef.current) {
          const { PlaceAutocompleteElement } = libs.places;
          const placeAutocomplete = new PlaceAutocompleteElement();
          placeAutocomplete.placeholder = 'Search village, city or location...';
          placeAutocomplete.includedRegionCodes = ['in'];
          (placeAutocomplete as unknown as HTMLElement).style.width = '100%';

          const handleSelect = async ({ placePrediction }: any) => {
            console.log('NEW PLACES SELECT EVENT');

            if (!placePrediction) {
              console.warn('No placePrediction on select event');
              return;
            }

            const place = placePrediction.toPlace();

            console.log('PLACE PREDICTION', placePrediction);
            console.log('PLACE', place);

            try {
              await place.fetchFields({
                fields: [
                  'displayName',
                  'formattedAddress',
                  'location',
                  'viewport',
                ],
              });

              console.log('FETCHED PLACE:', place.toJSON ? place.toJSON() : place);

              if (!place.location) {
                console.error('Selected place has no location');
                setGeoError('Selected place has no location details.');
                return;
              }

              const lat = place.location.lat();
              const lng = place.location.lng();

              console.log('SELECTED LOCATION:', lat, lng);

              const userPosition = { lat, lng };

              if (mapRef.current) {
                if (place.viewport) {
                  mapRef.current.fitBounds(place.viewport);
                } else {
                  mapRef.current.setCenter(userPosition);
                  mapRef.current.setZoom(17);
                }
              }

              const name = place.displayName || place.formattedAddress;
              updateLocationMarkerAndState(userPosition, name);
              setGeoError(null);
            } catch (err: any) {
              console.error('Error fetching place fields:', err);
              setGeoError('Could not retrieve details for the selected location.');
            }
          };

          const handleError = (event: any) => {
            console.error('PLACE AUTOCOMPLETE ERROR:', event);
            setGeoError(
              'Places API (New) search is blocked on your API key. Please enable "Places API (New)" in Google Cloud Console under API Restrictions, or click "Use My Location".'
            );
          };

          placeAutocomplete.addEventListener('gmp-select', handleSelect);
          placeAutocomplete.addEventListener('gmp-error', handleError);

          searchContainerRef.current.replaceChildren(placeAutocomplete as unknown as Node);

          autocompleteRef.current = {
            element: placeAutocomplete as unknown as HTMLElement,
            selectListener: handleSelect,
            errorListener: handleError,
          };
        }

        setMapLoaded(true);

        // Render initial boundary if present (Read-only or preloaded mode)
        if (initialBoundary.length >= 3) {
          renderFinishedPolygon(initialBoundary, mapInstance, libs, isInteractive);
        }
      } catch (err: any) {
        console.error('Failed to load Google Maps:', err);
        if (isMounted) {
          setLoadingError(
            err.message || 'Failed to initialize Google Maps. Check your API key.'
          );
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
      clearDrawingOverlays();
      clearPolygon();
      if (locationMarkerRef.current) {
        locationMarkerRef.current.setMap(null);
        locationMarkerRef.current = null;
      }
      if (autocompleteRef.current) {
        autocompleteRef.current.element.removeEventListener(
          'gmp-select',
          autocompleteRef.current.selectListener
        );
        autocompleteRef.current.element.removeEventListener(
          'gmp-error',
          autocompleteRef.current.errorListener
        );
        autocompleteRef.current = null;
      }
      if (searchContainerRef.current) {
        searchContainerRef.current.replaceChildren();
      }
      if (mapClickListenerRef.current) {
        mapClickListenerRef.current.remove();
        mapClickListenerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, []);

  // Render completed Google Maps Polygon
  const renderFinishedPolygon = (
    pts: FarmBoundaryPoint[],
    mapInstance: google.maps.Map,
    libs: GoogleMapsLoadedLibraries,
    editable: boolean
  ) => {
    clearPolygon();
    clearDrawingOverlays();

    const gPath = pts.map((p) => new libs.core.LatLng(p.lat, p.lng));

    const polygon = new libs.maps.Polygon({
      paths: gPath,
      strokeColor: '#556B2F', // Harvest Olive
      strokeOpacity: 0.9,
      strokeWeight: 3,
      fillColor: '#708238', // Muted sage olive
      fillOpacity: 0.35, // Clear satellite layer visibility
      editable: editable,
      draggable: false,
      map: mapInstance,
    });

    polygonRef.current = polygon;
    setIsPolygonFinished(true);

    const metrics = calculateMetrics(pts);
    if (editable && onBoundaryChange) {
      onBoundaryChange(pts, metrics.center, metrics.areaM2, metrics.acres, metrics.hectares);
    }

    // Fit map bounds to polygon
    const bounds = new libs.core.LatLngBounds();
    pts.forEach((p) => bounds.extend(p));
    mapInstance.fitBounds(bounds);

    // If editable, listen to path events (vertex dragging/editing)
    if (editable) {
      const path = polygon.getPath();

      const handlePathChange = () => {
        const updatedPts: FarmBoundaryPoint[] = [];
        for (let i = 0; i < path.getLength(); i++) {
          const pt = path.getAt(i);
          updatedPts.push({ lat: pt.lat(), lng: pt.lng() });
        }

        setDrawingPoints(updatedPts);
        const updatedMetrics = calculateMetrics(updatedPts);

        if (onBoundaryChange) {
          onBoundaryChange(
            updatedPts,
            updatedMetrics.center,
            updatedMetrics.areaM2,
            updatedMetrics.acres,
            updatedMetrics.hectares
          );
        }
      };

      pathListenersRef.current.push(
        path.addListener('set_at', handlePathChange),
        path.addListener('insert_at', handlePathChange),
        path.addListener('remove_at', handlePathChange)
      );
    }
  };

  // Start Drawing Mode handler
  const handleStartDrawing = () => {
    if (!mapRef.current || !googleRef.current) return;

    clearPolygon();
    clearDrawingOverlays();
    setDrawingPoints([]);
    setIsPolygonFinished(false);
    setIsDrawing(true);
    setAreaM2(0);
    setAreaAcres(0);
    setAreaHectares(0);

    const mapInstance = mapRef.current;
    const libs = googleRef.current;

    // Attach click listener for drawing points
    if (mapClickListenerRef.current) {
      mapClickListenerRef.current.remove();
    }

    const circleSymbol =
      libs.core?.SymbolPath?.CIRCLE ??
      libs.googleMaps?.SymbolPath?.CIRCLE ??
      0;

    const clickListener = mapInstance.addListener(
      'click',
      (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };

        setDrawingPoints((prev) => {
          const nextPoints = [...prev, newPoint];

          // Add point marker
          const marker = new libs.marker.Marker({
            position: e.latLng,
            map: mapInstance,
            icon: {
              path: circleSymbol,
              scale: 5,
              fillColor: '#556B2F',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            },
          });
          tempMarkersRef.current.push(marker);

          // Render connecting polyline
          if (tempPolylineRef.current) {
            tempPolylineRef.current.setMap(null);
          }

          tempPolylineRef.current = new libs.maps.Polyline({
            path: nextPoints.map((p) => new libs.core.LatLng(p.lat, p.lng)),
            strokeColor: '#556B2F',
            strokeOpacity: 0.8,
            strokeWeight: 2.5,
            map: mapInstance,
          });

          return nextPoints;
        });
      }
    );

    mapClickListenerRef.current = clickListener;
  };

  // Finish Boundary Drawing handler
  const handleFinishDrawing = () => {
    if (drawingPoints.length < 3) {
      setGeoError('Please click at least 3 points on the map to close the farm boundary polygon.');
      return;
    }

    if (mapClickListenerRef.current) {
      mapClickListenerRef.current.remove();
      mapClickListenerRef.current = null;
    }

    setIsDrawing(false);
    setGeoError(null);

    if (mapRef.current && googleRef.current) {
      renderFinishedPolygon(
        drawingPoints,
        mapRef.current,
        googleRef.current,
        true
      );
    }
  };

  // Cancel Drawing handler
  const handleCancelDrawing = () => {
    if (mapClickListenerRef.current) {
      mapClickListenerRef.current.remove();
      mapClickListenerRef.current = null;
    }

    clearDrawingOverlays();
    clearPolygon();
    setDrawingPoints([]);
    setIsDrawing(false);
    setIsPolygonFinished(false);
    setAreaM2(0);
    setAreaAcres(0);
    setAreaHectares(0);
    setGeoError(null);
  };

  // Explicit Browser Geolocation handler ("Use My Location")
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser geolocation is unavailable on this device.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log('DEVICE LOCATION:', {
          latitude,
          longitude,
          accuracy,
        });

        const userPosition = { lat: latitude, lng: longitude };

        if (mapRef.current) {
          mapRef.current.setCenter(userPosition);
          mapRef.current.setZoom(17);
        }

        updateLocationMarkerAndState(userPosition, 'Device Current Location', accuracy);
        setGeoError(null);
      },
      (error) => {
        setIsLocating(false);
        console.error('GEOLOCATION ERROR:', {
          code: error.code,
          message: error.message,
        });

        let msg = 'Could not determine your device location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow location access for this site.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Your device location could not be determined.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please try again.';
            break;
        }
        setGeoError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className={`space-y-3 font-body ${className}`}>
      {/* Top Search & Geolocation Toolbar */}
      {isInteractive && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative z-30 overflow-visible">
          <div className="relative flex-1 min-h-[38px] flex items-center overflow-visible">
            <div ref={searchContainerRef} className="w-full relative z-30 overflow-visible" />
          </div>

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="py-2 px-3.5 rounded-lg bg-[#F0F4E8] hover:bg-[#E2EBD4] text-harvest-olive-dark text-xs font-medium border border-[#91A35A]/30 flex items-center justify-center gap-1.5 transition-colors"
            title="Locate device GPS position"
          >
            {isLocating ? (
              <span className="w-3.5 h-3.5 border-2 border-harvest-olive border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-base">my_location</span>
            )}
            <span>Use My Location</span>
          </button>
        </div>
      )}

      {/* Geolocation or Loading Error Banner */}
      {(loadingError || geoError) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-red-600">error</span>
            <span>{loadingError || geoError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeoError(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-xl border border-pressed-sand overflow-hidden shadow-sm bg-[#FAF7F2]">
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: mapHeight }}
          className="w-full"
        />

        {/* Loading Overlay */}
        {!mapLoaded && !loadingError && (
          <div className="absolute inset-0 bg-[#FFFDF9]/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-umber-brown text-xs">
            <div className="w-8 h-8 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin"></div>
            <span>Loading High-Resolution Satellite Map...</span>
          </div>
        )}

        {/* Interactive Drawing Floating Controls Banner */}
        {isInteractive && mapLoaded && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex flex-wrap items-center gap-2 bg-[#FFFDF9]/95 backdrop-blur-sm p-2 rounded-lg border border-pressed-sand shadow-md">
            {!isDrawing && !isPolygonFinished && (
              <button
                type="button"
                onClick={handleStartDrawing}
                className="py-1.5 px-3.5 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-base">polyline</span>
                <span>Draw Farm Boundary</span>
              </button>
            )}

            {isDrawing && (
              <>
                <div className="text-[11px] text-charred-soil font-medium px-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-harvest-olive animate-ping"></span>
                  <span>Click points on map ({drawingPoints.length} added)</span>
                </div>

                <button
                  type="button"
                  onClick={handleFinishDrawing}
                  disabled={drawingPoints.length < 3}
                  className={`py-1.5 px-3 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                    drawingPoints.length >= 3
                      ? 'bg-harvest-olive text-white hover:bg-harvest-olive-dark cursor-pointer'
                      : 'bg-pressed-sand text-umber-brown/60 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Finish Boundary</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelDrawing}
                  className="py-1.5 px-3 rounded-md bg-[#F6F3EC] hover:bg-pressed-sand text-charred-soil text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </>
            )}

            {isPolygonFinished && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-harvest-olive-dark bg-[#F0F4E8] px-2.5 py-1 rounded border border-[#91A35A]/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">edit_location</span>
                  <span>Drag points to adjust</span>
                </span>

                <button
                  type="button"
                  onClick={handleStartDrawing}
                  className="py-1 px-3 rounded bg-[#FFFDF9] hover:bg-[#F0F4E8] text-charred-soil border border-pressed-sand text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  <span>Redraw Boundary</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Farm Area Live Summary Badge */}
      {(areaAcres > 0 || areaHectares > 0) && (
        <div className="p-4 bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber flex items-center justify-between animate-fadeIn">
          <div>
            <span className="text-xs font-semibold text-umber-brown block">
              Calculated Farm Area
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="font-headline text-xl font-bold text-charred-soil">
                {formatArea(areaM2, userSettings.landAreaUnit as any || 'Acre')}
              </span>
              <span className="text-sm font-semibold text-harvest-olive">
                ({areaAcres} acres | {areaHectares} ha)
              </span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-umber-brown block">
              {areaM2.toLocaleString()} m²
            </span>
            <span className="text-[10px] text-harvest-olive font-semibold flex items-center justify-end gap-0.5">
              <span className="material-symbols-outlined text-xs">verified</span>
              <span>GPS Geodesic Area</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
