import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { formatArea } from '../utils/formatters';
import { getUserFarms, createFarm, updateFarm, deleteFarm } from '../services/farmService';
import { Farm, FarmBoundaryPoint, WaterSource, WATER_SOURCE_OPTIONS } from '../types/models';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { GoogleFarmMap } from '../components/farm/GoogleFarmMap';

import { CropSelect } from '../components/common/CropSelect';
import {
  getCropTranslationKey,
  getCropGrowthDays,
  parseLocalMidnightDate,
  addDaysToDate,
} from '../data/cropCatalog';
import { localizeFarmName } from '../i18n/localize';

export const MyFarm: React.FC = () => {
  const { currentUser, userSettings } = useAuth();
  const { t } = useTranslation();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  // In-Page Add Plot Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingPlot, setSavingPlot] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Farm Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [editFarmName, setEditFarmName] = useState('');
  const [editLocationName, setEditLocationName] = useState('');
  const [editCurrentCrop, setEditCurrentCrop] = useState('');
  const [editPlantingDate, setEditPlantingDate] = useState('');
  const [editWaterSource, setEditWaterSource] = useState<WaterSource | ''>('');
  const [editWaterSourceOther, setEditWaterSourceOther] = useState('');
  const [savingEditPlot, setSavingEditPlot] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Delete Farm Confirmation Modal state
  const [deletingFarmId, setDeletingFarmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Farm Map toggle for individual farm cards
  const [expandedMapFarmId, setExpandedMapFarmId] = useState<string | null>(null);

  // New farm form state
  const [farmName, setFarmName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [currentCrop, setCurrentCrop] = useState('Wheat (Kanak)');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [waterSource, setWaterSource] = useState<WaterSource | ''>('');
  const [waterSourceOther, setWaterSourceOther] = useState('');

  // Boundary state extracted from GoogleFarmMap
  const [boundary, setBoundary] = useState<FarmBoundaryPoint[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 29.6857,
    lng: 76.9907,
  });
  const [areaSquareMeters, setAreaSquareMeters] = useState<number>(0);
  const [areaAcres, setAreaAcres] = useState<number>(0);
  const [areaHectares, setAreaHectares] = useState<number>(0);

  const fetchFarms = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const userFarms = await getUserFarms(currentUser.uid);
      setFarms(userFarms);
    } catch (err) {
      console.error('Error loading user farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [currentUser]);

  // Callback when boundary or polygon changes in GoogleFarmMap
  const handleBoundaryChange = (
    newBoundary: FarmBoundaryPoint[],
    newCenter: { lat: number; lng: number },
    m2: number,
    acres: number,
    hectares: number
  ) => {
    setBoundary(newBoundary);
    setCenter(newCenter);
    setAreaSquareMeters(m2);
    setAreaAcres(acres);
    setAreaHectares(hectares);
    if (newBoundary.length >= 3 && m2 > 0) {
      setFormError(null);
    }
  };

  const resetFormState = () => {
    setFarmName('');
    setLocationName('');
    setWaterSource('');
    setWaterSourceOther('');
    setBoundary([]);
    setAreaSquareMeters(0);
    setAreaAcres(0);
    setAreaHectares(0);
    setFormError(null);
  };

  const handleCreateFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setFormError('Authentication required. Please sign in again.');
      return;
    }

    // Validation Rules
    if (!farmName.trim()) {
      setFormError('Please enter a valid Farm Plot Name.');
      return;
    }

    if (!waterSource) {
      setFormError('Please select a Water Source for your farm.');
      return;
    }

    if (waterSource === 'Other' && !waterSourceOther.trim()) {
      setFormError('Please specify the water source details.');
      return;
    }

    if (boundary.length < 3) {
      setFormError('Farm boundary polygon must have at least 3 points. Please draw the boundary on the satellite map.');
      return;
    }

    if (areaSquareMeters <= 0 || areaAcres <= 0) {
      setFormError('Calculated farm area must be greater than zero.');
      return;
    }

    setSavingPlot(true);
    setFormError(null);

    try {
      let calculatedExpectedHarvest = '';
      if (plantingDate && currentCrop) {
        const pDate = parseLocalMidnightDate(plantingDate);
        if (pDate) {
          const growthDays = getCropGrowthDays(currentCrop);
          const hDate = addDaysToDate(pDate, growthDays);
          const yyyy = hDate.getFullYear();
          const mm = String(hDate.getMonth() + 1).padStart(2, '0');
          const dd = String(hDate.getDate()).padStart(2, '0');
          calculatedExpectedHarvest = `${yyyy}-${mm}-${dd}`;
        }
      }

      const farmDataToSave: Omit<Farm, 'id'> = {
        userId: currentUser.uid,
        farmName: farmName.trim(),
        locationName: locationName.trim() || 'Farm Field Plot',
        latitude: center.lat,
        longitude: center.lng,
        landArea: areaAcres,
        landAreaUnit: 'Acre',
        boundary,
        center,
        areaSquareMeters,
        areaAcres,
        areaHectares,
        currentCrop,
        plantingDate,
        expectedHarvestDate: calculatedExpectedHarvest,
        status: 'Active',
        waterSource: waterSource as WaterSource,
        waterAvailability: waterSource === 'Rainfed' ? 'Rainfed' : 'Irrigated',
      };

      if (waterSource === 'Other') {
        farmDataToSave.waterSourceOther = waterSourceOther.trim();
      }

      await createFarm(farmDataToSave);

      setIsAddModalOpen(false);
      resetFormState();
      await fetchFarms();
    } catch (err: any) {
      console.error('Error creating farm plot:', err);
      setFormError(err.message || 'Failed to save farm plot. Please try again.');
    } finally {
      setSavingPlot(false);
    }
  };

  const openEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setEditFarmName(farm.farmName || '');
    setEditLocationName(farm.locationName || '');
    setEditCurrentCrop(farm.currentCrop || 'Wheat (Kanak)');
    setEditPlantingDate(farm.plantingDate || '');
    setEditWaterSource(farm.waterSource || '');
    setEditWaterSourceOther(farm.waterSourceOther ?? '');
    setEditFormError(null);
    setIsEditModalOpen(true);
  };

  const handleEditFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarm?.id) return;
    if (!editFarmName.trim()) {
      setEditFormError('Please enter a valid Farm Plot Name.');
      return;
    }
    if (!editWaterSource) {
      setEditFormError('Please select a Water Source.');
      return;
    }
    if (editWaterSource === 'Other' && !editWaterSourceOther.trim()) {
      setEditFormError('Please specify the water source.');
      return;
    }

    setSavingEditPlot(true);
    setEditFormError(null);

    try {
      let calculatedExpectedHarvest = editingFarm.expectedHarvestDate || '';
      if (editPlantingDate && editCurrentCrop) {
        const pDate = parseLocalMidnightDate(editPlantingDate);
        if (pDate) {
          const growthDays = getCropGrowthDays(editCurrentCrop);
          const hDate = addDaysToDate(pDate, growthDays);
          const yyyy = hDate.getFullYear();
          const mm = String(hDate.getMonth() + 1).padStart(2, '0');
          const dd = String(hDate.getDate()).padStart(2, '0');
          calculatedExpectedHarvest = `${yyyy}-${mm}-${dd}`;
        }
      }

      const updateDataToSave: Partial<Farm> = {
        farmName: editFarmName.trim(),
        locationName: editLocationName.trim() || 'Farm Field Plot',
        currentCrop: editCurrentCrop,
        plantingDate: editPlantingDate,
        expectedHarvestDate: calculatedExpectedHarvest,
        waterSource: editWaterSource as WaterSource,
        waterAvailability: editWaterSource === 'Rainfed' ? 'Rainfed' : 'Irrigated',
      };

      if (editWaterSource === 'Other') {
        updateDataToSave.waterSourceOther = editWaterSourceOther.trim();
      }

      await updateFarm(editingFarm.id, updateDataToSave);

      setIsEditModalOpen(false);
      setEditingFarm(null);
      await fetchFarms();
    } catch (err: any) {
      console.error('Error updating farm plot:', err);
      setEditFormError(err.message || 'Failed to update farm plot. Please try again.');
    } finally {
      setSavingEditPlot(false);
    }
  };

  const promptDeletePlot = (farmId: string) => {
    setDeletingFarmId(farmId);
    setDeleteError(null);
  };

  const handleExecuteDeletePlot = async () => {
    if (!deletingFarmId) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteFarm(deletingFarmId);
      await fetchFarms();
      setDeletingFarmId(null);
    } catch (err: any) {
      console.error('Error deleting plot:', err);
      setDeleteError(err.message || 'Failed to remove farm plot. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
            {t('farm.title')}
          </h1>
          <p className="text-sm text-umber-brown mt-1">
            {t('farm.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            resetFormState();
            setIsAddModalOpen(true);
          }}
          className="py-2.5 px-5 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_location_alt</span>
          <span>{t('farm.addBoundary')}</span>
        </button>
      </div>

      {/* Farm Plots Grid / Empty State */}
      {loading ? (
        <div className="py-16 text-center text-umber-brown">
          <div className="inline-block w-8 h-8 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Loading your private farm records from Firestore...</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand p-12 text-center shadow-soft-umber space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F0F4E8] text-harvest-olive flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">landscape</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-charred-soil">
            No farms added yet
          </h3>
          <p className="text-sm text-umber-brown max-w-md mx-auto">
            Draw your exact farm polygon boundary on the high-resolution satellite map to calculate land area, track crop health, and enable microclimate weather warnings.
          </p>
          <button
            onClick={() => {
              resetFormState();
              setIsAddModalOpen(true);
            }}
            className="py-2.5 px-6 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_location</span>
            <span>Add First Farm Boundary</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => {
            const hasBoundary = farm.boundary && farm.boundary.length >= 3;
            const isMapExpanded = expandedMapFarmId === farm.id;

            return (
              <div
                key={farm.id}
                className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 flex flex-col justify-between hover:border-harvest-olive/40 transition-colors"
              >
                <div>
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-charred-soil">
                        {localizeFarmName(farm.farmName, t)}
                      </h3>
                      <p className="text-xs text-umber-brown flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-sm text-harvest-olive">
                          location_on
                        </span>
                        <span>{localizeFarmName(farm.locationName, t)}</span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#F0F4E8] text-harvest-olive border border-[#91A35A]/30 shrink-0">
                      {t(`status.${(farm.status || 'Active').toLowerCase()}`)}
                    </span>
                  </div>

                  {/* Lat / Lng Coordinates badge */}
                  <div className="text-[11px] font-mono text-umber-brown bg-[#FAF7F2] p-2 rounded border border-pressed-sand my-2 flex items-center justify-between">
                    <span>
                      GPS: {farm.latitude?.toFixed(4)}° N, {farm.longitude?.toFixed(4)}° E
                    </span>
                    {hasBoundary && (
                      <span className="text-[10px] text-harvest-olive font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">polyline</span>
                        <span>{t('status.polygonSaved')}</span>
                      </span>
                    )}
                  </div>

                  {/* Quick Metrics Grid */}
                  <div className="my-3 py-3 border-y border-pressed-sand/60 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-umber-brown block text-[11px]">{t('farm.farmArea')}</span>
                      <span className="font-semibold text-charred-soil">
                        {farm.areaSquareMeters 
                          ? formatArea(farm.areaSquareMeters, userSettings.landAreaUnit as any || 'Acre', 2, t)
                          : `${farm.landArea} ${t(`units.${(farm.landAreaUnit || userSettings.landAreaUnit).toLowerCase()}`) || (farm.landAreaUnit || userSettings.landAreaUnit)}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-umber-brown block text-[11px]">{t('farm.currentCrop')}</span>
                      <span className="font-semibold text-charred-soil">
                        {farm.currentCrop ? (t(getCropTranslationKey(farm.currentCrop)) || farm.currentCrop) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-umber-brown block text-[11px]">{t('farm.planted')}</span>
                      <span className="font-semibold text-charred-soil">
                        {farm.plantingDate || 'Seasonal'}
                      </span>
                    </div>
                    <div>
                      <span className="text-umber-brown block text-[11px]">{t('farm.waterSource')}</span>
                      <span className="font-semibold text-charred-soil">
                        {farm.waterSource ? (
                          farm.waterSource === 'Other' ? (
                            farm.waterSourceOther || 'Other'
                          ) : (
                            farm.waterSource
                          )
                        ) : (
                          <span className="text-amber-800 font-normal italic">
                            {t('farm.notSpecified')}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Satellite Map Preview toggle */}
                  {hasBoundary && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMapFarmId(isMapExpanded ? null : farm.id!)
                        }
                        className="w-full py-1.5 px-3 rounded-lg bg-[#FAF7F2] hover:bg-[#F0F4E8] border border-pressed-sand text-xs text-charred-soil font-medium flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-harvest-olive">
                            map
                          </span>
                          <span>
                            {isMapExpanded ? t('farm.hideSatelliteBoundary') : t('farm.viewSatelliteBoundary')}
                          </span>
                        </span>
                        <span className="material-symbols-outlined text-sm">
                          {isMapExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>

                      {isMapExpanded && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-pressed-sand animate-fadeIn">
                          <GoogleFarmMap
                            initialBoundary={farm.boundary}
                            initialCenter={farm.center || { lat: farm.latitude, lng: farm.longitude }}
                            isInteractive={false}
                            mapHeight="240px"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-pressed-sand/60">
                  <span className="text-[11px] text-umber-brown/80">
                    {t('status.userScoped')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(farm)}
                      className="p-1.5 text-umber-brown hover:text-harvest-olive transition-colors cursor-pointer"
                      title="Edit Farm"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => farm.id && promptDeletePlot(farm.id)}
                      className="p-1.5 text-umber-brown hover:text-error transition-colors cursor-pointer"
                      title="Remove Plot"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Farm Boundary Workflow Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charred-soil/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#FFFDF9] rounded-2xl border border-pressed-sand shadow-modal-tray p-5 sm:p-7 my-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pressed-sand pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#F0F4E8] text-harvest-olive flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">polyline</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-charred-soil">
                    Add Farm Plot & Draw Boundary
                  </h3>
                  <p className="text-xs text-umber-brown">
                    Follow the workflow: Details → Location → Draw Boundary → Review Area → Save Farm
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-umber-brown hover:text-charred-soil rounded-full hover:bg-pressed-sand/40 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800 animate-fadeIn">
                <span className="material-symbols-outlined text-base text-red-600">warning</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFarmSubmit} className="space-y-5">
              {/* Step 1: Basic Farm Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                    Farm / Plot Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. North Canal Wheat Field"
                    className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                    Location Name / Village, District & State
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Karnal, Haryana"
                    className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 2 & 3: Satellite Map & Boundary Polygon Drawing */}
              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-harvest-olive text-base">map</span>
                    <span>Search Location & Draw Farm Boundary Polygon</span>
                  </span>
                  <span className="text-[11px] text-umber-brown font-normal">
                    Click points to enclose your field
                  </span>
                </label>

                <GoogleFarmMap
                  initialCenter={center}
                  isInteractive={true}
                  onBoundaryChange={handleBoundaryChange}
                  onLocationSelect={(newCenter, locName) => {
                    setCenter(newCenter);
                    if (locName) {
                      setLocationName(locName);
                    }
                  }}
                  mapHeight="380px"
                />
              </div>

              {/* Step 4: Crop, Planting & Water Source Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-pressed-sand">
                <div>
                  <CropSelect
                    label="Current Crop Sown"
                    value={currentCrop}
                    onChange={(selectedCrop) => setCurrentCrop(selectedCrop)}
                    excludeFarmAddCrops={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                    Sowing / Planting Date
                  </label>
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full bg-[#FFFDF9] border border-pressed-sand rounded-lg px-3.5 py-2 text-xs sm:text-sm text-charred-soil focus:border-harvest-olive focus:outline-none"
                  />
                </div>

                <div className={waterSource === 'Other' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                  <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                    {t('farm.waterSource')} <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value as WaterSource)}
                    className="w-full bg-[#FFFDF9] border border-pressed-sand rounded-lg px-3.5 py-2 text-xs sm:text-sm text-charred-soil focus:border-harvest-olive focus:outline-none"
                    required
                  >
                    <option value="" disabled>
                      {t('farm.selectWaterSource')}
                    </option>
                    {WATER_SOURCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {waterSource === 'Other' && (
                  <div>
                    <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                      {t('farm.specifyWaterSource')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={waterSourceOther}
                      onChange={(e) => setWaterSourceOther(e.target.value)}
                      placeholder="e.g. Community Lift Irrigation"
                      className="w-full bg-[#FFFDF9] border border-pressed-sand rounded-lg px-3.5 py-2 text-xs sm:text-sm text-charred-soil focus:border-harvest-olive focus:outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Step 5: Review & Save Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-pressed-sand">
                <div className="text-xs text-umber-brown">
                  {boundary.length >= 3 ? (
                    <span className="text-harvest-olive-dark font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Boundary Ready ({formatArea(areaSquareMeters, userSettings.landAreaUnit as any || 'Acre', 2, t)})</span>
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">info</span>
                      <span>Draw boundary polygon on map above</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="py-2.5 px-4 rounded-md border border-pressed-sand bg-[#FFFDF9] hover:bg-[#F3F0E8] text-charred-soil text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPlot || boundary.length < 3}
                    className={`py-2.5 px-6 rounded-md text-white text-xs sm:text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${
                      savingPlot || boundary.length < 3
                        ? 'bg-pressed-sand text-umber-brown cursor-not-allowed'
                        : 'bg-harvest-olive hover:bg-harvest-olive-dark cursor-pointer'
                    }`}
                  >
                    {savingPlot ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Saving Farm...</span>
                      </>
                    ) : (
                      <span>Save Farm</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Farm Modal */}
      {isEditModalOpen && editingFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charred-soil/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-xl bg-[#FFFDF9] rounded-2xl border border-pressed-sand shadow-modal-tray p-5 sm:p-7 my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-pressed-sand pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#F0F4E8] text-harvest-olive flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">edit</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-charred-soil">
                    {t('farm.editFarm')}
                  </h3>
                  <p className="text-xs text-umber-brown">
                    Update farm plot details, current crop, planting schedule, and water source.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingFarm(null);
                }}
                className="p-1.5 text-umber-brown hover:text-charred-soil rounded-full hover:bg-pressed-sand/40 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {editFormError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800 animate-fadeIn">
                <span className="material-symbols-outlined text-base text-red-600">warning</span>
                <span>{editFormError}</span>
              </div>
            )}

            <form onSubmit={handleEditFarmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                  {t('farm.plotName')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={editFarmName}
                  onChange={(e) => setEditFarmName(e.target.value)}
                  className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                  {t('farm.plotLocation')}
                </label>
                <input
                  type="text"
                  value={editLocationName}
                  onChange={(e) => setEditLocationName(e.target.value)}
                  className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <CropSelect
                    label={t('farm.currentCropSown')}
                    value={editCurrentCrop}
                    onChange={(selectedCrop) => setEditCurrentCrop(selectedCrop)}
                    excludeFarmAddCrops={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                    {t('farm.sowingDate')}
                  </label>
                  <input
                    type="date"
                    value={editPlantingDate}
                    onChange={(e) => setEditPlantingDate(e.target.value)}
                    className="w-full bg-[#FFFDF9] border border-pressed-sand rounded-lg px-3.5 py-2 text-xs sm:text-sm text-charred-soil focus:border-harvest-olive focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                  {t('farm.waterSource')} <span className="text-red-600">*</span>
                </label>
                <select
                  value={editWaterSource}
                  onChange={(e) => setEditWaterSource(e.target.value as WaterSource)}
                  className="w-full bg-[#FFFDF9] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-charred-soil focus:border-harvest-olive focus:outline-none"
                  required
                >
                  <option value="" disabled>
                    {t('farm.selectWaterSource')}
                  </option>
                  {WATER_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {editWaterSource === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                    {t('farm.specifyWaterSource')} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={editWaterSourceOther}
                    onChange={(e) => setEditWaterSourceOther(e.target.value)}
                    placeholder="e.g. Community Lift Irrigation"
                    className="w-full bg-[#FFFDF9] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-charred-soil focus:border-harvest-olive focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-pressed-sand">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingFarm(null);
                  }}
                  className="py-2.5 px-4 rounded-md border border-pressed-sand bg-[#FFFDF9] hover:bg-[#F3F0E8] text-charred-soil text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingEditPlot}
                  className="py-2.5 px-6 rounded-md text-white text-xs sm:text-sm font-medium transition-colors shadow-sm bg-harvest-olive hover:bg-harvest-olive-dark cursor-pointer disabled:opacity-50"
                >
                  {savingEditPlot ? 'Saving Changes...' : t('farm.updateFarm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Farm Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingFarmId}
        onClose={() => {
          if (!isDeleting) {
            setDeletingFarmId(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleExecuteDeletePlot}
        title="Remove Farm Plot?"
        message={
          deleteError ? (
            <span className="text-red-700 font-medium">{deleteError}</span>
          ) : (
            'Are you sure you want to remove this farm plot? This action cannot be undone.'
          )
        }
        confirmText="Remove Farm"
        cancelText="Cancel"
        loading={isDeleting}
        loadingText="Removing..."
        variant="danger"
        icon="delete_forever"
      />
    </div>
  );
};
