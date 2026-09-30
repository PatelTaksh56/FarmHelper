import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { formatMarketPrice, getMarketPriceUnitLabel } from '../utils/formatters';
import { getUserFarms } from '../services/farmService';
import { Farm } from '../types/models';
import {
  fetchGovernmentMarketPrices,
  MarketPriceRecord,
} from '../services/marketService';
import {
  getMasterStates,
  getMasterDistrictsForState,
  getMasterMarketsForLocation,
  getMasterCommodityList,
  registerDiscoveredLocationData,
} from '../services/marketMasterService';
import { getFarmMarketLocation, FarmMarketLocation } from '../services/farmLocationService';
import { localizeFarmName, localizeCropName } from '../i18n/localize';

const SESSION_STORAGE_KEY = 'farmhelper_market_filters';

interface SavedFilters {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  farmId?: string;
}

export const MarketMandi: React.FC = () => {
  const { currentUser, userSettings } = useAuth();
  const { t } = useTranslation();

  // Load saved session storage filters on initial component load
  const savedFiltersJson = useMemo(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as SavedFilters) : null;
    } catch {
      return null;
    }
  }, []);

  // User farm scoping state
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(savedFiltersJson?.farmId || '');
  const [loadingFarms, setLoadingFarms] = useState<boolean>(true);

  // Farm location resolution state
  const [resolvingLocation, setResolvingLocation] = useState<boolean>(false);
  const [resolvedLocationInfo, setResolvedLocationInfo] = useState<FarmMarketLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isManualFilterOverride, setIsManualFilterOverride] = useState<boolean>(false);

  // Dynamic Market Filter State (Priority: Farm location -> Saved filters -> Defaults)
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [selectedState, setSelectedState] = useState<string>(savedFiltersJson?.state || 'All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(savedFiltersJson?.district || 'All');
  const [selectedMarket, setSelectedMarket] = useState<string>(savedFiltersJson?.market || 'All');
  const [selectedCommodity, setSelectedCommodity] = useState<string>(savedFiltersJson?.commodity || 'All');

  // Master Dropdown Options
  const allStates = useMemo(() => getMasterStates(), []);
  const allCommodities = useMemo(() => getMasterCommodityList(), []);

  // Location-dependent Master Options
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);

  // Alphabetically Sorted Master Dropdown Options (Strictly A-Z by displayed/localized name)
  const sortedFarms = useMemo(() => {
    return [...farms].sort((a, b) => {
      const labelA = `${localizeFarmName(a.farmName, t)} — ${localizeFarmName(a.locationName, t)}`;
      const labelB = `${localizeFarmName(b.farmName, t)} — ${localizeFarmName(b.locationName, t)}`;
      return labelA.localeCompare(labelB);
    });
  }, [farms, t]);

  const sortedStates = useMemo(() => {
    return [...allStates].sort((a, b) => {
      const nameA = localizeFarmName(a, t);
      const nameB = localizeFarmName(b, t);
      return nameA.localeCompare(nameB);
    });
  }, [allStates, t]);

  const sortedDistricts = useMemo(() => {
    return [...availableDistricts].sort((a, b) => {
      const nameA = localizeFarmName(a, t);
      const nameB = localizeFarmName(b, t);
      return nameA.localeCompare(nameB);
    });
  }, [availableDistricts, t]);

  const sortedMarkets = useMemo(() => {
    return [...availableMarkets].sort((a, b) => a.localeCompare(b));
  }, [availableMarkets]);

  const sortedCommodities = useMemo(() => {
    return [...allCommodities].sort((a, b) => {
      const nameA = localizeCropName(a, t);
      const nameB = localizeCropName(b, t);
      return nameA.localeCompare(nameB);
    });
  }, [allCommodities, t]);

  // Market Price Results & Pagination
  const [mandiRecords, setMandiRecords] = useState<MarketPriceRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // UI status states
  const [loadingPrices, setLoadingPrices] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Ref to handle out-of-order API requests and farm switches
  const requestIdRef = useRef<number>(0);

  /**
   * Helper to resolve location for a selected farm and apply State + District filters
   */
  const applyFarmLocation = async (farm: Farm, reqId: number) => {
    setResolvingLocation(true);
    setLocationError(null);

    try {
      const loc = await getFarmMarketLocation(farm);
      if (reqId !== requestIdRef.current) return;

      if (loc && loc.state) {
        setSelectedState(loc.state);
        setSelectedDistrict(loc.district || 'All');
        setSelectedMarket('All');
        setResolvedLocationInfo(loc);
        setIsManualFilterOverride(false);
      } else {
        setLocationError(`Location information for plot "${farm.farmName}" is incomplete. Please select State and District manually.`);
        setResolvedLocationInfo(null);
      }
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      console.error('Error resolving farm location:', err);
      setLocationError('Unable to resolve farm location coordinates. Please select State and District manually.');
    } finally {
      if (reqId === requestIdRef.current) {
        setResolvingLocation(false);
      }
    }
  };

  // Load user's farms on mount
  useEffect(() => {
    if (!currentUser?.uid) return;

    let isMounted = true;
    const reqId = ++requestIdRef.current;
    setLoadingFarms(true);

    getUserFarms(currentUser.uid)
      .then((userFarms) => {
        if (!isMounted) return;
        setFarms(userFarms);

        if (userFarms.length > 0) {
          // If saved filter farm exists, prioritize it
          const savedFarm = savedFiltersJson?.farmId
            ? userFarms.find((f) => f.id === savedFiltersJson.farmId)
            : null;

          const targetFarm = savedFarm || userFarms[0];
          setSelectedFarmId(targetFarm.id || '');

          if (savedFiltersJson?.state && savedFiltersJson?.district) {
            // Keep saved state and district filters, but resolve location details in background
            setSelectedState(savedFiltersJson.state);
            setSelectedDistrict(savedFiltersJson.district);
            if (savedFiltersJson.market) setSelectedMarket(savedFiltersJson.market);
            if (savedFiltersJson.commodity) setSelectedCommodity(savedFiltersJson.commodity);
            getFarmMarketLocation(targetFarm).then((loc) => {
              if (isMounted) setResolvedLocationInfo(loc);
            });
          } else {
            // Otherwise automatically derive state & district from selected farm location
            applyFarmLocation(targetFarm, reqId);
          }
        }
      })
      .catch((err) => {
        console.error('Error loading user farms for market prices:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingFarms(false);
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  // Save filter selections to sessionStorage for persistence across tab navigation
  useEffect(() => {
    try {
      const filtersToSave: SavedFilters = {
        state: selectedState,
        district: selectedDistrict,
        market: selectedMarket,
        commodity: selectedCommodity,
        farmId: selectedFarmId,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(filtersToSave));
    } catch (e) {
      console.warn('Unable to persist market filters to sessionStorage:', e);
    }
  }, [selectedState, selectedDistrict, selectedMarket, selectedCommodity, selectedFarmId]);

  // Populate Master District options when State changes
  useEffect(() => {
    let isMounted = true;

    if (selectedState !== 'All') {
      getMasterDistrictsForState(selectedState).then((districts) => {
        if (isMounted) {
          setAvailableDistricts(districts);
          if (selectedDistrict !== 'All' && districts.length > 0 && !districts.includes(selectedDistrict)) {
            setSelectedDistrict('All');
          }
        }
      });
    } else {
      setAvailableDistricts([]);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedState]);

  // Populate Master Market/Mandi options when State or District changes (Independent of Commodity)
  useEffect(() => {
    let isMounted = true;

    if (selectedState !== 'All') {
      getMasterMarketsForLocation(selectedState, selectedDistrict).then((markets) => {
        if (isMounted) {
          setAvailableMarkets(markets);
          if (selectedMarket !== 'All' && markets.length > 0 && !markets.includes(selectedMarket)) {
            setSelectedMarket('All');
          }
        }
      });
    } else {
      setAvailableMarkets([]);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedState, selectedDistrict]);

  // Handle user changing farm selection
  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId);
    const reqId = ++requestIdRef.current;
    const farm = farms.find((f) => f.id === farmId);
    if (farm) {
      applyFarmLocation(farm, reqId);
    } else {
      setResolvedLocationInfo(null);
    }
    setCurrentPage(1);
  };

  // Main price data fetch function driven directly by Government API
  const loadMarketPrices = async (page: number = 1) => {
    const currentReqId = ++requestIdRef.current;
    setLoadingPrices(true);
    setApiError(null);

    const offset = (page - 1) * pageSize;

    try {
      const result = await fetchGovernmentMarketPrices({
        state: selectedState,
        district: selectedDistrict,
        market: selectedMarket,
        commodity: selectedCommodity,
        limit: pageSize,
        offset,
      });

      if (currentReqId === requestIdRef.current) {
        setMandiRecords(result.records);
        setTotalRecords(result.total);

        // Register any extra districts or markets discovered from API response into dynamic master cache
        registerDiscoveredLocationData(
          selectedState,
          selectedDistrict,
          result.markets,
          result.districts
        );

        setLoadingPrices(false);
      }
    } catch (err: any) {
      if (currentReqId === requestIdRef.current) {
        console.error('Government Mandi API Error:', err);
        setApiError(
          err.message || 'Unable to load market prices. The government market-price service is currently unavailable. Please try again.'
        );
        setMandiRecords([]);
        setTotalRecords(0);
        setLoadingPrices(false);
      }
    }
  };

  // Fetch market price results whenever filters or page changes (if not currently resolving location or initializing)
  useEffect(() => {
    if (!isInitializing && !resolvingLocation && !loadingFarms) {
      loadMarketPrices(currentPage);
    }
  }, [selectedState, selectedDistrict, selectedMarket, selectedCommodity, currentPage, resolvingLocation, loadingFarms, isInitializing]);

  // Total pages calculation for pagination
  const totalPages = useMemo(() => {
    return Math.ceil(totalRecords / pageSize) || 1;
  }, [totalRecords, pageSize]);

  // Calculate date summary across returned mandi records
  const latestRecordDateSummary = useMemo(() => {
    if (mandiRecords.length === 0) return null;
    const uniqueDates = Array.from(
      new Set(mandiRecords.map((r) => r.formattedDate || r.arrivalDate).filter(Boolean))
    );
    if (uniqueDates.length === 0) return null;
    if (uniqueDates.length === 1) return uniqueDates[0];
    return `${uniqueDates[0]} (${uniqueDates.length} dates)`;
  }, [mandiRecords]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-body">
      {/* Page Title & Header */}
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
          {t('market.title')}
        </h1>
        <p className="text-sm text-umber-brown mt-1">
          {t('market.subtitle')}
        </p>
      </div>

      {/* User Farm Selector Bar (Auto-filters State & District) */}
      {!loadingFarms && farms.length > 0 && (
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#F0F4E8] text-harvest-olive border border-[#91A35A]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">agriculture</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-umber-brown uppercase tracking-wider block">
                  Selected Farm Location
                </span>
                {isManualFilterOverride && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-medium">
                    Manual Override Active
                  </span>
                )}
              </div>
              
              {resolvingLocation ? (
                <span className="text-xs font-semibold text-harvest-olive flex items-center gap-1.5 animate-pulse">
                  <span className="w-3 h-3 border-2 border-harvest-olive border-t-transparent rounded-full animate-spin"></span>
                  <span>Resolving farm location...</span>
                </span>
              ) : selectedState !== 'All' ? (
                <div className="text-xs font-semibold text-charred-soil flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span>Showing mandi prices for:</span>
                  <span className="bg-[#F0ECE1] border border-pressed-sand px-2 py-0.5 rounded text-harvest-olive font-bold">
                    {selectedDistrict !== 'All' ? `${localizeFarmName(selectedDistrict, t)}, ` : ''}{localizeFarmName(selectedState, t)}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-charred-soil">
                  Select a plot to automatically filter district mandi rates
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="user-farm-select" className="sr-only">Select Farm</label>
            <select
              id="user-farm-select"
              value={selectedFarmId}
              onChange={(e) => handleFarmSelect(e.target.value)}
              className="bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3 py-2 text-xs font-bold text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none cursor-pointer"
            >
              {sortedFarms.map((f) => (
                <option key={f.id} value={f.id}>
                  {localizeFarmName(f.farmName, t)} — {localizeFarmName(f.locationName, t)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Location Error Warning if Farm Location is Incomplete */}
      {locationError && !resolvingLocation && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
          <span className="material-symbols-outlined text-amber-700 text-base shrink-0 mt-0.5">info</span>
          <div>
            <span className="font-bold block">Farm Location Notice</span>
            <span>{locationError}</span>
          </div>
        </div>
      )}

      {/* Master 4-Dropdown Filters Card (State -> District -> Market / Mandi & Independent Commodity Master) */}
      <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Master State Selection (36 States & UTs) */}
          <div>
            <label className="block text-xs font-semibold text-charred-soil mb-1.5">
              {t('market.selectState')} ({sortedStates.length})
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                setSelectedDistrict('All'); // Cascading reset: District -> All
                setSelectedMarket('All');   // Cascading reset: Market -> All
                setIsManualFilterOverride(true);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs font-medium text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none cursor-pointer"
            >
              <option value="All">All States ({sortedStates.length})</option>
              {sortedStates.map((st) => (
                <option key={st} value={st}>
                  {localizeFarmName(st, t)}
                </option>
              ))}
            </select>
          </div>

          {/* Master District Selection (Complete official district list per state) */}
          <div>
            <label className="block text-xs font-semibold text-charred-soil mb-1.5">
              {t('market.selectDistrict')} {sortedDistricts.length > 0 ? `(${sortedDistricts.length})` : ''}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const newDistrict = e.target.value;
                setSelectedDistrict(newDistrict);
                setSelectedMarket('All'); // Cascading reset: Market -> All
                setIsManualFilterOverride(true);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs font-medium text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none cursor-pointer"
            >
              <option value="All">All Districts {sortedDistricts.length > 0 ? `(${sortedDistricts.length})` : ''}</option>
              {sortedDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {localizeFarmName(dst, t)}
                </option>
              ))}
            </select>
          </div>

          {/* Master Market / Mandi Selection (Independent of Commodity selection) */}
          <div>
            <label className="block text-xs font-semibold text-charred-soil mb-1.5">
              {t('market.marketMandi')} {sortedMarkets.length > 0 ? `(${sortedMarkets.length})` : ''}
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => {
                setSelectedMarket(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs font-medium text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none cursor-pointer"
            >
              <option value="All">All Markets {sortedMarkets.length > 0 ? `(${sortedMarkets.length})` : ''}</option>
              {sortedMarkets.map((mkt) => (
                <option key={mkt} value={mkt}>
                  {mkt}
                </option>
              ))}
            </select>
          </div>

          {/* Master AGMARKNET Commodity Selection (Completely Independent Master List) */}
          <div>
            <label className="block text-xs font-semibold text-charred-soil mb-1.5">
              {t('market.commodity')} ({sortedCommodities.length})
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => {
                setSelectedCommodity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs font-medium text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none cursor-pointer"
            >
              <option value="All">All Commodities ({sortedCommodities.length})</option>
              {sortedCommodities.map((cmd) => (
                <option key={cmd} value={cmd}>
                  {localizeCropName(cmd, t)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Prices or Location Resolution State */}
      {(resolvingLocation || loadingPrices) && (
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-12 text-center text-umber-brown space-y-3 animate-pulse">
          <div className="inline-block w-8 h-8 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-charred-soil">
            {resolvingLocation ? 'Resolving farm location coordinates...' : 'Loading latest market prices...'}
          </p>
          <p className="text-xs text-umber-brown">
            {resolvingLocation ? 'Matching State and District for selected plot...' : "Fetching today's mandi rates..."}
          </p>
        </div>
      )}

      {/* Error State */}
      {apiError && !loadingPrices && !resolvingLocation && (
        <div className="bg-[#FFFDF9] rounded-xl border border-red-200 p-8 shadow-soft-umber text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">cloud_off</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg text-charred-soil">
              Unable to Fetch Market Prices
            </h3>
            <p className="text-xs text-umber-brown max-w-md mx-auto mt-1">
              {apiError}
            </p>
          </div>
          <button
            onClick={() => loadMarketPrices(currentPage)}
            className="py-2.5 px-6 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>{t('common.checkAgain')}</span>
          </button>
        </div>
      )}

      {/* Mandi Rates Table */}
      {!loadingPrices && !resolvingLocation && !apiError && (
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber overflow-hidden">
          {/* Header Summary Bar with Official Market Date */}
          <div className="p-4 border-b border-pressed-sand bg-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-umber-brown">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Showing {mandiRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords.toLocaleString()} market records
              </span>
              {latestRecordDateSummary && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-charred-soil bg-[#F0ECE1] border border-pressed-sand px-2.5 py-1 rounded-md text-xs">
                  <span className="material-symbols-outlined text-sm text-harvest-olive">calendar_month</span>
                  <span>Price Date: {latestRecordDateSummary}</span>
                </span>
              )}
            </div>
            <span className="text-harvest-olive font-medium flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Official Mandi Rates</span>
            </span>
          </div>

          {/* Empty Results State */}
          {mandiRecords.length === 0 ? (
            <div className="p-12 text-center text-umber-brown space-y-3">
              <span className="material-symbols-outlined text-4xl text-harvest-olive/40">storefront</span>
              <p className="text-sm font-semibold text-charred-soil">No Market Prices Found</p>
              <p className="text-xs max-w-sm mx-auto">
                No mandi records found for {selectedDistrict !== 'All' ? `${selectedDistrict} district, ` : ''}{selectedState}. Try choosing 'All Markets' or 'All Commodities'.
              </p>
            </div>
          ) : (
            <>
              {/* Table Data with Official Market Price Date */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F3F0E8] border-b border-pressed-sand text-umber-brown font-semibold">
                    <tr>
                      <th className="py-3 px-4 sm:px-6">{t('market.commodity')}</th>
                      <th className="py-3 px-4">{t('market.marketMandi')}</th>
                      <th className="py-3 px-4">{t('market.marketDate')}</th>
                      <th className="py-3 px-4">{t('market.minRate')}</th>
                      <th className="py-3 px-4">{t('market.maxRate')}</th>
                      <th className="py-3 px-4 text-right">{t('market.modalRate')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pressed-sand/60 text-charred-soil">
                    {mandiRecords.map((row) => (
                      <tr key={row.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <span className="font-bold block text-charred-soil">{localizeCropName(row.commodity, t)}</span>
                          <span className="text-xs text-umber-brown">
                            {row.variety} {row.grade && row.grade !== 'FAQ' ? `• Grade: ${row.grade}` : ''}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium block">{row.market}</span>
                          <span className="text-[11px] text-umber-brown">
                            {row.district}, {row.state}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 font-medium text-charred-soil bg-[#F5F2EA] border border-pressed-sand/70 px-2.5 py-1 rounded-md text-xs whitespace-nowrap">
                            <span className="material-symbols-outlined text-xs text-harvest-olive">event</span>
                            <span>{row.formattedDate || row.arrivalDate || 'N/A'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-umber-brown">
                          {row.minPrice > 0 ? formatMarketPrice(row.minPrice, userSettings.weightUnit as any || 'Quintal') : '—'}
                        </td>
                        <td className="py-4 px-4 font-mono text-umber-brown">
                          {row.maxPrice > 0 ? formatMarketPrice(row.maxPrice, userSettings.weightUnit as any || 'Quintal') : '—'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-headline font-bold text-base sm:text-lg text-harvest-olive">
                            {row.modalPrice > 0 ? formatMarketPrice(row.modalPrice, userSettings.weightUnit as any || 'Quintal') : '—'}
                          </span>
                          <span className="block text-[11px] text-umber-brown">
                            / {(() => {
                              const label = getMarketPriceUnitLabel(userSettings.weightUnit as any || 'Quintal');
                              return t(`units.${label.toLowerCase()}`) || label;
                            })()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-pressed-sand bg-[#FAF7F2] flex items-center justify-between gap-4 text-xs">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="py-2 px-4 rounded-md border border-pressed-sand bg-[#FFFDF9] hover:bg-[#F3F0E8] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-charred-soil transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    <span>Previous</span>
                  </button>

                  <span className="font-semibold text-charred-soil">
                    Page {currentPage} of {totalPages.toLocaleString()}
                  </span>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="py-2 px-4 rounded-md border border-pressed-sand bg-[#FFFDF9] hover:bg-[#F3F0E8] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-charred-soil transition-colors flex items-center gap-1"
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
