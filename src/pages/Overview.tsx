import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { getUserFarms } from '../services/farmService';
import { Farm } from '../types/models';
import { AREA_CONVERSION_CONFIG, convertArea } from '../utils/formatters';
import {
  getCropGrowthDays,
  parseLocalMidnightDate,
  addDaysToDate,
  getCropTranslationKey,
} from '../data/cropCatalog';

const getFarmSqm = (farm: Farm): number => {
  if (typeof farm.areaSquareMeters === 'number' && farm.areaSquareMeters > 0) {
    return farm.areaSquareMeters;
  }
  const rawArea = Number(farm.landArea ?? (farm as any).area ?? farm.areaAcres ?? 0);
  if (isNaN(rawArea) || rawArea <= 0) return 0;

  const unit = farm.landAreaUnit || 'Acre';
  const factor = AREA_CONVERSION_CONFIG[unit] || AREA_CONVERSION_CONFIG['Acre'];
  return rawArea * factor;
};

export const Overview: React.FC = () => {
  const { userProfile, userSettings } = useAuth();
  const { t } = useTranslation();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');

  useEffect(() => {
    if (!userProfile?.uid) return;
    getUserFarms(userProfile.uid)
      .then((data) => setFarms(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userProfile?.uid]);

  const targetUnit = (userSettings?.landAreaUnit as 'Acre' | 'Hectare' | 'Bigha') || 'Acre';

  const selectedFarm = useMemo(() => {
    if (selectedFarmId === 'all') return null;
    return farms.find((f) => f.id === selectedFarmId) || null;
  }, [farms, selectedFarmId]);

  const totalSqm = useMemo(() => {
    return farms.reduce((acc, farm) => acc + getFarmSqm(farm), 0);
  }, [farms]);

  const totalAreaInUserUnit = useMemo(() => {
    return convertArea(totalSqm, targetUnit);
  }, [totalSqm, targetUnit]);

  const formattedTotalArea = `${totalAreaInUserUnit.toFixed(2)} ${targetUnit}`;

  const uniqueLocations = useMemo(() => {
    const locs = farms.map((f) => f.locationName).filter(Boolean);
    return Array.from(new Set(locs));
  }, [farms]);

  const uniqueLocationsSummary = useMemo(() => {
    if (uniqueLocations.length === 0) return 'All Locations';
    if (uniqueLocations.length <= 2) return uniqueLocations.join(', ');
    return `${uniqueLocations.slice(0, 2).join(', ')} +${uniqueLocations.length - 2} more`;
  }, [uniqueLocations]);

  const uniqueCrops = useMemo(() => {
    const crops = farms.map((f) => f.currentCrop).filter(Boolean) as string[];
    return Array.from(new Set(crops));
  }, [farms]);

  const nearestHarvestFarm = useMemo(() => {
    const withHarvest = farms.filter((f) => f.expectedHarvestDate);
    if (withHarvest.length === 0) return null;

    const today = new Date().getTime();
    return [...withHarvest].sort((a, b) => {
      const dateA = (a.expectedHarvestDate as any)?.toDate
        ? (a.expectedHarvestDate as any).toDate().getTime()
        : new Date(a.expectedHarvestDate as string).getTime();
      const dateB = (b.expectedHarvestDate as any)?.toDate
        ? (b.expectedHarvestDate as any).toDate().getTime()
        : new Date(b.expectedHarvestDate as string).getTime();

      const diffA = dateA - today;
      const diffB = dateB - today;
      if (diffA >= 0 && diffB < 0) return -1;
      if (diffA < 0 && diffB >= 0) return 1;
      return Math.abs(diffA) - Math.abs(diffB);
    })[0];
  }, [farms]);

  return (
    <div className="space-y-6 font-body">
      {/* Welcome Banner */}
      <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F0F4E8] text-harvest-olive border border-[#91A35A]/30 inline-block">
              {t('overview.title')}
            </span>
            {farms.length > 0 && (
              <div className="relative inline-flex items-center">
                <select
                  id="overview-farm-selector"
                  aria-label="Select Farm"
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="bg-[#F0F4E8] hover:bg-[#E5EDD4] border border-[#91A35A]/30 text-harvest-olive font-semibold text-xs rounded-full pl-3 pr-8 py-1 focus:outline-none focus:ring-1 focus:ring-harvest-olive transition-colors cursor-pointer appearance-none"
                >
                  <option value="all">🌾 {t('nav.myFarm')} ({farms.length})</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      📍 {f.farmName} ({f.locationName})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-harvest-olive text-sm absolute right-2 pointer-events-none">
                  expand_more
                </span>
              </div>
            )}
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
            Namaste, {userProfile?.fullName ? userProfile.fullName.split(' ')[0] : t('nav.progressiveFarmer')} 🌾
          </h1>
          <p className="text-xs sm:text-sm text-umber-brown mt-1 max-w-xl">
            {t('overview.subtitle')}
          </p>
        </div>
        {farms.length > 0 && (
          <div className="shrink-0 bg-[#F0F4E8] rounded-xl px-5 py-3 border border-[#91A35A]/20 text-center max-w-xs space-y-1">
            <div>
              <span className="text-[11px] text-umber-brown block font-medium">
                {t('farm.currentCrop')}
              </span>
              <span className="font-headline font-bold text-base sm:text-lg text-charred-soil block truncate">
                {selectedFarm
                  ? selectedFarm.currentCrop || '—'
                  : uniqueCrops.length > 0
                  ? uniqueCrops.join(', ')
                  : '—'}
              </span>
            </div>
            {selectedFarm && (
              <div className="pt-1 border-t border-[#91A35A]/20">
                <span className="text-[10px] text-umber-brown block font-medium">
                  {t('farm.waterSource')}
                </span>
                <span className="font-semibold text-xs text-harvest-olive block truncate">
                  {selectedFarm.waterSource
                    ? (selectedFarm.waterSource === 'Other'
                        ? selectedFarm.waterSourceOther || 'Other'
                        : selectedFarm.waterSource)
                    : t('farm.notSpecified')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#FFFDF9] rounded-xl border border-pressed-sand p-5 animate-pulse">
              <div className="h-3 bg-pressed-sand rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-pressed-sand rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-pressed-sand rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* No Farm State */}
      {!loading && farms.length === 0 && (
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F4E8] border border-[#91A35A]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-harvest-olive">add_location_alt</span>
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold text-charred-soil mb-1">{t('farm.noFarmsYet')}</h2>
            <p className="text-sm text-umber-brown max-w-md">
              {t('farm.subtitle')}
            </p>
          </div>
          <Link
            to="/my-farm"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-harvest-olive text-white text-sm font-semibold rounded-lg hover:bg-harvest-olive-dark transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            {t('farm.addBoundary')}
          </Link>
        </div>
      )}

      {/* Farm Metrics — only when at least one farm exists */}
      {!loading && farms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Farm Area / Managed Area */}
          <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-umber-brown uppercase tracking-wider">
                {t('farm.farmArea')}
              </span>
              <span className="material-symbols-outlined text-harvest-olive">pie_chart</span>
            </div>
            <div>
              <div className="font-headline text-3xl font-bold text-charred-soil">
                {selectedFarm
                  ? `${convertArea(getFarmSqm(selectedFarm), targetUnit).toFixed(2)} ${targetUnit}`
                  : formattedTotalArea}
              </div>
              <p className="text-xs text-umber-brown mt-1">
                {farms.length} {t('status.plotsRegistered')}
              </p>
            </div>
            <span className="text-[11px] font-medium text-harvest-olive mt-2 truncate">
              {selectedFarm ? selectedFarm.farmName : t('status.portfolio')}
            </span>
          </div>

          {/* Harvest Countdown */}
          <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-umber-brown uppercase tracking-wider">
                {t('overview.harvestTimer')}
              </span>
              <span className="material-symbols-outlined text-harvest-olive">calendar_month</span>
            </div>
            <div>
              {(() => {
                // 1. ALL FARMS selected
                if (selectedFarmId === 'all' || !selectedFarm) {
                  return (
                    <>
                      <div className="font-headline text-3xl font-bold text-charred-soil">—</div>
                      <p className="text-xs text-umber-brown mt-1">
                        Select a specific farm to view its harvest date
                      </p>
                    </>
                  );
                }

                // 2. SPECIFIC FARM selected
                let harvestDate: Date | null = parseLocalMidnightDate(selectedFarm.expectedHarvestDate);

                if (!harvestDate && selectedFarm.plantingDate) {
                  const plantingDate = parseLocalMidnightDate(selectedFarm.plantingDate);
                  if (plantingDate) {
                    const growthDays = getCropGrowthDays(selectedFarm.currentCrop || '');
                    harvestDate = addDaysToDate(plantingDate, growthDays);
                  }
                }

                // Missing planting date & harvest date
                if (!harvestDate) {
                  return (
                    <>
                      <div className="font-headline text-3xl font-bold text-charred-soil">—</div>
                      <p className="text-xs text-umber-brown mt-1">
                        Add the planting/sowing date for this farm
                      </p>
                    </>
                  );
                }

                // Calculate days remaining relative to today's local midnight
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const diffTime = harvestDate.getTime() - today.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                const formattedHarvestDate = harvestDate.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });

                if (diffDays > 0) {
                  return (
                    <>
                      <div className="font-headline text-3xl font-bold text-charred-soil">
                        {diffDays} {t('overview.daysRemaining')}
                      </div>
                      <p className="text-xs text-umber-brown mt-1 truncate">
                        Harvest Date: {formattedHarvestDate}
                      </p>
                    </>
                  );
                } else if (diffDays === 0) {
                  return (
                    <>
                      <div className="font-headline text-2xl sm:text-3xl font-bold text-harvest-olive">
                        Harvest is today
                      </div>
                      <p className="text-xs text-umber-brown mt-1 truncate">
                        Harvest Date: {formattedHarvestDate}
                      </p>
                    </>
                  );
                } else {
                  const absDays = Math.abs(diffDays);
                  return (
                    <>
                      <div className="font-headline text-2xl sm:text-3xl font-bold text-amber-800">
                        Harvest date passed
                      </div>
                      <p className="text-xs text-umber-brown mt-1 truncate">
                        {absDays} day{absDays === 1 ? '' : 's'} ago ({formattedHarvestDate})
                      </p>
                    </>
                  );
                }
              })()}
            </div>
            <span className="text-[11px] font-medium text-harvest-olive mt-2 truncate">
              {selectedFarmId === 'all' || !selectedFarm
                ? t('status.allActivePlots')
                : selectedFarm.currentCrop
                ? (t(getCropTranslationKey(selectedFarm.currentCrop)) || selectedFarm.currentCrop)
                : selectedFarm.farmName}
            </span>
          </div>

          {/* Kisan Helpline Card */}
          <div className="bg-[#4A3528] text-[#FFFDF9] rounded-xl border border-[#3D2C21] shadow-soft-umber p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#D7EB9A] uppercase tracking-wider">
                {t('help.kisanCallCenter')}
              </span>
              <span className="material-symbols-outlined text-[#D7EB9A]">call</span>
            </div>
            <div>
              <div className="font-headline text-2xl font-bold text-[#F8F5EE]">
                1800-180-1551
              </div>
              <p className="text-xs text-[#C4B9AA] mt-1">{t('help.helplineNumber')}</p>
            </div>
            <a
              href="tel:18001801551"
              className="text-[11px] font-semibold text-[#D7EB9A] hover:underline flex items-center gap-1 mt-2"
            >
              <span>{t('overview.viewDetails')}</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </a>
          </div>
        </div>
      )}

      {/* Quick Nav Cards */}
      <div>
        <h2 className="font-headline text-base font-semibold text-charred-soil mb-3">{t('overview.quickActions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {[
            { to: '/crop-doctor', icon: 'biotech', label: t('nav.cropDoctor'), desc: t('cropDoctor.subtitle') },
            { to: '/crop-advisor', icon: 'eco', label: t('nav.cropAdvisor'), desc: t('cropAdvisor.subtitle') },
            { to: '/market-mandi', icon: 'store', label: t('nav.marketMandi'), desc: t('market.subtitle') },
            { to: '/weather', icon: 'partly_cloudy_day', label: t('nav.weather'), desc: t('weather.subtitle') },
            { to: '/government-schemes', icon: 'account_balance', label: t('nav.govSchemes'), desc: t('schemes.subtitle') },
            { to: '/my-farm', icon: 'agriculture', label: t('nav.myFarm'), desc: t('farm.subtitle') },
          ].map(({ to, icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-4 flex flex-col gap-2 hover:shadow-md hover:border-[#91A35A]/40 transition-all group"
            >
              <span className="w-9 h-9 rounded-lg bg-[#F0F4E8] border border-[#91A35A]/20 flex items-center justify-center group-hover:bg-[#E5EDD4] transition-colors">
                <span className="material-symbols-outlined text-harvest-olive text-xl">{icon}</span>
              </span>
              <div>
                <div className="text-sm font-semibold text-charred-soil">{label}</div>
                <div className="text-[11px] text-umber-brown truncate">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
