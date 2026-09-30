import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { getUserFarms } from '../services/farmService';
import { Farm } from '../types/models';
import { SoilProfileInput } from '../services/cropSuitabilityEngine';
import {
  extractSoilParametersFromPdf,
  runCropAdvisoryPipeline,
  CropAdvisoryResponse,
} from '../services/cropAdvisorService';

import { VoiceInputButton } from '../components/common/VoiceInputButton';
import { AudioPlayerButton } from '../components/common/AudioPlayerButton';

export const CropAdvisor: React.FC = () => {
  const { currentUser, userSettings } = useAuth();
  const { t } = useTranslation();

  // User Farm Selection State
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  // Soil Input Mode State
  const [inputMode, setInputMode] = useState<'manual' | 'pdf'>('manual');

  // Soil Parameters State (Soil Health Card parameters)
  const [nitrogen, setNitrogen] = useState('240');
  const [phosphorus, setPhosphorus] = useState('18');
  const [potassium, setPotassium] = useState('280');
  const [sulphur, setSulphur] = useState('');
  const [zinc, setZinc] = useState('');
  const [iron, setIron] = useState('');
  const [copper, setCopper] = useState('');
  const [manganese, setManganese] = useState('');
  const [boron, setBoron] = useState('');
  const [ph, setPh] = useState('7.2');
  const [ec, setEc] = useState('');
  const [organicCarbon, setOrganicCarbon] = useState('');

  const [notes, setNotes] = useState('');

  // PDF Upload & Extraction State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfExtracted, setPdfExtracted] = useState<boolean>(false);

  // Advisory Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [advisoryResponse, setAdvisoryResponse] = useState<CropAdvisoryResponse | null>(null);

  // Request ID ref to prevent stale async overwrites
  const requestIdRef = useRef(0);

  // Fetch farms belonging to authenticated user
  useEffect(() => {
    async function loadFarms() {
      if (currentUser?.uid) {
        try {
          const userFarms = await getUserFarms(currentUser.uid);
          setFarms(userFarms);
          if (userFarms.length > 0) {
            setSelectedFarmId(userFarms[0].id || '');
            setSelectedFarm(userFarms[0]);
          }
        } catch (err) {
          console.warn('[CropAdvisor] Could not load user farms:', err);
        }
      }
    }
    loadFarms();
  }, [currentUser]);

  // Clear advisory results when language changes
  useEffect(() => {
    setAdvisoryResponse(null);
    setErrorMessage(null);
  }, [userSettings.preferredLanguage]);

  // Handle farm selection change
  const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const farmId = e.target.value;
    setSelectedFarmId(farmId);
    const found = farms.find((f) => f.id === farmId) || null;
    setSelectedFarm(found);
    setAdvisoryResponse(null); // Clear recommendations on farm change
    setErrorMessage(null);
  };

  // Handle PDF soil report upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfError(null);
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setPdfError('Please upload a valid Soil Health Card PDF document.');
        return;
      }

      setPdfFile(file);
      setExtractingPdf(true);
      setAdvisoryResponse(null);

      try {
        const extracted = await extractSoilParametersFromPdf(file);

        if (extracted.nitrogen !== undefined && extracted.nitrogen !== null) setNitrogen(String(extracted.nitrogen));
        if (extracted.phosphorus !== undefined && extracted.phosphorus !== null) setPhosphorus(String(extracted.phosphorus));
        if (extracted.potassium !== undefined && extracted.potassium !== null) setPotassium(String(extracted.potassium));
        if (extracted.sulphur !== undefined && extracted.sulphur !== null) setSulphur(String(extracted.sulphur));
        if (extracted.zinc !== undefined && extracted.zinc !== null) setZinc(String(extracted.zinc));
        if (extracted.iron !== undefined && extracted.iron !== null) setIron(String(extracted.iron));
        if (extracted.copper !== undefined && extracted.copper !== null) setCopper(String(extracted.copper));
        if (extracted.manganese !== undefined && extracted.manganese !== null) setManganese(String(extracted.manganese));
        if (extracted.boron !== undefined && extracted.boron !== null) setBoron(String(extracted.boron));
        if (extracted.ph !== undefined && extracted.ph !== null) setPh(String(extracted.ph));
        if (extracted.ec !== undefined && extracted.ec !== null) setEc(String(extracted.ec));
        if (extracted.organicCarbon !== undefined && extracted.organicCarbon !== null) setOrganicCarbon(String(extracted.organicCarbon));

        setPdfExtracted(true);
      } catch (err: any) {
        console.error('[CropAdvisor PDF Error]', err);
        setPdfError(err.message || 'Unable to extract parameters from PDF. Please enter values manually.');
      } finally {
        setExtractingPdf(false);
      }
    }
  };

  // Run Real Data-Driven Advisory Calculation
  const handleCalculateAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAdvisoryResponse(null);

    const currentRequestId = ++requestIdRef.current;
    setAnalyzing(true);

    const soilInput: SoilProfileInput = {
      nitrogen: nitrogen ? parseFloat(nitrogen) : undefined,
      phosphorus: phosphorus ? parseFloat(phosphorus) : undefined,
      potassium: potassium ? parseFloat(potassium) : undefined,
      sulphur: sulphur ? parseFloat(sulphur) : undefined,
      zinc: zinc ? parseFloat(zinc) : undefined,
      iron: iron ? parseFloat(iron) : undefined,
      copper: copper ? parseFloat(copper) : undefined,
      manganese: manganese ? parseFloat(manganese) : undefined,
      boron: boron ? parseFloat(boron) : undefined,
      ph: ph ? parseFloat(ph) : 7.0,
      ec: ec ? parseFloat(ec) : undefined,
      organicCarbon: organicCarbon ? parseFloat(organicCarbon) : undefined,
    };

    try {
      const response = await runCropAdvisoryPipeline({
        farm: selectedFarm,
        soil: soilInput,
        preferredLanguage: userSettings.preferredLanguage || 'en-IN',
      });

      if (currentRequestId === requestIdRef.current) {
        setAdvisoryResponse(response);
      }
    } catch (err: any) {
      console.error('[CropAdvisor Error]', err);
      if (currentRequestId === requestIdRef.current) {
        setErrorMessage(err.message || 'Unable to generate crop recommendation. Please try again.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setAnalyzing(false);
      }
    }
  };

  // Build audio playback text
  const getAudioText = () => {
    if (!advisoryResponse?.recommendations) return '';
    return advisoryResponse.recommendations
      .map(
        (r) =>
          `${r.displayName}: ${r.suitabilityScore}% ${t('cropAdvisor.suitabilityMatch')}. ${r.soilAssessment}. ${r.weatherAssessment}`
      )
      .join('. ');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-body">
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
          {t('cropAdvisor.title')}
        </h1>
        <p className="text-sm text-umber-brown mt-1">
          {t('cropAdvisor.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Farm Selector + Soil Inputs */}
        <div className="space-y-6">
          {/* Farm Plot Selector Card */}
          <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-5 space-y-3">
            <label className="block text-xs font-semibold text-charred-soil uppercase tracking-wider">
              {t('cropAdvisor.selectFarm')}
            </label>

            {farms.length > 0 ? (
              <select
                value={selectedFarmId}
                onChange={handleFarmChange}
                className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.farmName} — {f.locationName || f.district || 'Plot'} ({f.currentCrop || 'No Crop'})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-umber-brown italic">
                {t('cropAdvisor.noFarmSelected')}
              </p>
            )}

            {/* Farm Context Details */}
            {selectedFarm && (
              <div className="p-3 bg-[#FAF7F2] rounded-lg border border-pressed-sand/80 text-xs space-y-1.5 text-umber-brown">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charred-soil">{t('cropAdvisor.currentCrop')}:</span>
                  <span className="font-bold text-harvest-olive">{selectedFarm.currentCrop || 'Fallow / None'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('farm.waterSource')}:</span>
                  <span className="font-semibold text-charred-soil">
                    {selectedFarm.waterSource ? (
                      selectedFarm.waterSource === 'Other' ? (
                        selectedFarm.waterSourceOther || 'Other'
                      ) : (
                        selectedFarm.waterSource
                      )
                    ) : (
                      <span className="text-amber-800 font-normal italic">
                        {t('farm.notSpecified')}
                      </span>
                    )}
                  </span>
                </div>
                {selectedFarm.plantingDate && (
                  <div className="flex items-center justify-between">
                    <span>{t('cropAdvisor.sowingDate')}:</span>
                    <span>{selectedFarm.plantingDate}</span>
                  </div>
                )}
                {selectedFarm.expectedHarvestDate && (
                  <div className="flex items-center justify-between">
                    <span>{t('cropAdvisor.expectedHarvest')}:</span>
                    <span>{selectedFarm.expectedHarvestDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Location:</span>
                  <span>{selectedFarm.locationName || selectedFarm.district || 'Farm'}, {selectedFarm.state || 'India'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Soil Input Card (Manual / PDF Upload Tabs) */}
          <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-lg font-bold text-charred-soil flex items-center gap-2">
                <span className="material-symbols-outlined text-harvest-olive">psychology</span>
                <span>{t('cropAdvisor.soilParams')}</span>
              </h2>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-[#F6F3EC] p-1 rounded-lg border border-pressed-sand text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    inputMode === 'manual'
                      ? 'bg-harvest-olive text-white shadow-sm'
                      : 'text-umber-brown hover:text-charred-soil'
                  }`}
                >
                  {t('cropAdvisor.manualInputTab')}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('pdf')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    inputMode === 'pdf'
                      ? 'bg-harvest-olive text-white shadow-sm'
                      : 'text-umber-brown hover:text-charred-soil'
                  }`}
                >
                  {t('cropAdvisor.pdfUploadTab')}
                </button>
              </div>
            </div>

            {/* Mode B: Soil Report PDF Upload */}
            {inputMode === 'pdf' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-2 border-dashed border-pressed-sand rounded-xl p-6 text-center hover:border-harvest-olive/60 transition-colors bg-[#FAF7F2] relative">
                  <span className="material-symbols-outlined text-4xl text-harvest-olive mb-2 block">
                    picture_as_pdf
                  </span>
                  <p className="text-xs font-semibold text-charred-soil">
                    {t('cropAdvisor.soilReportUpload')}
                  </p>
                  <p className="text-[11px] text-umber-brown mt-0.5">
                    Upload official Soil Health Card PDF report for automated extraction
                  </p>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={extractingPdf || analyzing}
                  />
                </div>

                {extractingPdf && (
                  <div className="p-3 bg-[#F0F4E8] rounded-lg text-xs text-harvest-olive flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-harvest-olive border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('cropAdvisor.extractingPdf')}</span>
                  </div>
                )}

                {pdfError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {pdfError}
                  </div>
                )}

                {pdfExtracted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
                    <span>Soil Health Card parameters extracted successfully. You may review or edit values below.</span>
                    <button
                      type="button"
                      onClick={() => setInputMode('manual')}
                      className="font-bold underline text-emerald-900 cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Soil Health Card Input Form */}
            <form onSubmit={handleCalculateAdvisory} className="space-y-4">
              {/* Group 1: Macronutrients */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-harvest-olive mb-2">
                  {t('cropAdvisor.macronutrients')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.nitrogen')}
                    </label>
                    <input
                      type="number"
                      value={nitrogen}
                      onChange={(e) => {
                        setNitrogen(e.target.value);
                        setAdvisoryResponse(null);
                      }}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3 py-1.5 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="e.g. 240"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.phosphorus')}
                    </label>
                    <input
                      type="number"
                      value={phosphorus}
                      onChange={(e) => {
                        setPhosphorus(e.target.value);
                        setAdvisoryResponse(null);
                      }}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3 py-1.5 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="e.g. 18"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.potassium')}
                    </label>
                    <input
                      type="number"
                      value={potassium}
                      onChange={(e) => {
                        setPotassium(e.target.value);
                        setAdvisoryResponse(null);
                      }}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3 py-1.5 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="e.g. 280"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.sulphur')}
                    </label>
                    <input
                      type="number"
                      value={sulphur}
                      onChange={(e) => {
                        setSulphur(e.target.value);
                        setAdvisoryResponse(null);
                      }}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3 py-1.5 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Micronutrients */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-harvest-olive mb-2">
                  {t('cropAdvisor.micronutrients')}
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.zinc')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={zinc}
                      onChange={(e) => setZinc(e.target.value)}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-2.5 py-1.5 text-xs text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="Zn"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.iron')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={iron}
                      onChange={(e) => setIron(e.target.value)}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-2.5 py-1.5 text-xs text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="Fe"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.boron')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={boron}
                      onChange={(e) => setBoron(e.target.value)}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-2.5 py-1.5 text-xs text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="B"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Soil Physical Properties */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-harvest-olive mb-2">
                  {t('cropAdvisor.soilProperties')}
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.ph')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={ph}
                      onChange={(e) => {
                        setPh(e.target.value);
                        setAdvisoryResponse(null);
                      }}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-2.5 py-1.5 text-xs text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="e.g. 7.2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.ec')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={ec}
                      onChange={(e) => setEc(e.target.value)}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-2.5 py-1.5 text-xs text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="EC"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-charred-soil mb-1">
                      {t('cropAdvisor.oc')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={organicCarbon}
                      onChange={(e) => setOrganicCarbon(e.target.value)}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-2.5 py-1.5 text-xs text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      placeholder="OC %"
                    />
                  </div>
                </div>
              </div>

              {/* Soil Field Observations Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-charred-soil">
                    Soil Notes & Field Observations
                  </label>
                  <VoiceInputButton
                    onTranscript={(speechText) => {
                      setNotes((prev) => (prev ? `${prev} ${speechText}` : speechText));
                    }}
                    disabled={analyzing}
                  />
                </div>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('cropAdvisor.notesPlaceholder')}
                  className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg p-2.5 text-xs text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={analyzing || extractingPdf}
                className="w-full py-3 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-xs sm:text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {analyzing ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('cropAdvisor.calculatingAdvisory')}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">recommend</span>
                    <span>{t('cropAdvisor.calculateBtn')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Advisory Results & Analysis Transparency Panel */}
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-headline text-lg font-bold text-charred-soil flex items-center gap-2">
                <span className="material-symbols-outlined text-harvest-olive">eco</span>
                <span>{t('cropAdvisor.recommendations')}</span>
              </h2>

              {advisoryResponse && (
                <AudioPlayerButton textToSpeak={getAudioText()} />
              )}
            </div>

            {analyzing ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fadeIn">
                <span className="inline-block w-10 h-10 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin mb-2"></span>
                <h3 className="font-headline text-base font-bold text-charred-soil">
                  {t('cropAdvisor.calculatingAdvisory')}
                </h3>
                <div className="text-xs text-umber-brown space-y-1 max-w-xs text-left bg-[#FAF7F2] p-3 rounded-lg border border-pressed-sand">
                  <p className="flex items-center gap-1.5 font-semibold text-harvest-olive">
                    <span className="w-1.5 h-1.5 rounded-full bg-harvest-olive inline-block"></span>
                    Step 1: Checking validated district crop evidence...
                  </p>
                  <p className="flex items-center gap-1.5 font-semibold text-harvest-olive">
                    <span className="w-1.5 h-1.5 rounded-full bg-harvest-olive inline-block"></span>
                    Step 2: Evaluating soil matrix, water & rotation...
                  </p>
                  <p className="flex items-center gap-1.5 font-semibold text-harvest-olive">
                    <span className="w-1.5 h-1.5 rounded-full bg-harvest-olive inline-block animate-pulse"></span>
                    Step 3: Generating AI agronomic analysis...
                  </p>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2 text-red-800 text-xs">
                  <span className="material-symbols-outlined text-base text-red-600">error</span>
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCalculateAdvisory(e)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {t('common.checkAgain')}
                </button>
              </div>
            ) : advisoryResponse?.hasRecommendations === false ? (
              /* Mode C: Zero Candidates -> AI Agronomic Exploration Panel */
              <div className="space-y-4 animate-fadeIn">
                {/* Deterministic Rejection Audit Banner */}
                <div className="p-5 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-2xl text-amber-700">warning</span>
                    <div>
                      <h3 className="font-headline font-bold text-amber-950 text-sm sm:text-base">
                        No Validated Crop Recommendations Found
                      </h3>
                      <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                        {advisoryResponse.noRecommendationMessage ||
                          "No validated crop recommendations were found in FarmHelper's district-specific evidence for this planting window."}
                      </p>
                      <p className="text-[11px] text-amber-800 mt-1 italic">
                        This does not mean cultivation is impossible. AI Agronomic Exploration below analyzes your farm context to identify potential crop alternatives.
                      </p>
                    </div>
                  </div>

                  {advisoryResponse.rejectionBreakdown && (
                    <div className="bg-[#FFFDF9] p-3.5 rounded-lg border border-amber-200 text-xs space-y-2">
                      <h4 className="font-bold text-charred-soil uppercase text-[11px] tracking-wider">
                        {t('cropAdvisor.feasibilityGateAudit', 'Agronomic Feasibility Gate Audit')} ({advisoryResponse.rejectionBreakdown.totalRejectedCount} {t('cropAdvisor.cropsEvaluated', 'Crops Evaluated')}):
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-[#FAF7F2] rounded border border-pressed-sand/80">
                          <span className="font-bold text-amber-800 block">
                            {advisoryResponse.rejectionBreakdown.outsideWindowCount} crops:
                          </span>
                          <span className="text-umber-brown">{t('cropAdvisor.outsideWindow', 'Outside district sowing window')}</span>
                        </div>
                        <div className="p-2 bg-[#FAF7F2] rounded border border-pressed-sand/80">
                          <span className="font-bold text-amber-800 block">
                            {advisoryResponse.rejectionBreakdown.noDistrictEvidenceCount} crops:
                          </span>
                          <span className="text-umber-brown">{t('cropAdvisor.noDistrictEvidence', 'No district-specific calendar evidence')}</span>
                        </div>
                        <div className="p-2 bg-[#FAF7F2] rounded border border-pressed-sand/80">
                          <span className="font-bold text-amber-800 block">
                            {advisoryResponse.rejectionBreakdown.rotationConflictCount} crops:
                          </span>
                          <span className="text-umber-brown">{t('cropAdvisor.rotationConflict', 'Predecessor crop rotation conflict')}</span>
                        </div>
                        <div className="p-2 bg-[#FAF7F2] rounded border border-pressed-sand/80">
                          <span className="font-bold text-amber-800 block">
                            {advisoryResponse.rejectionBreakdown.perennialCount} crops:
                          </span>
                          <span className="text-umber-brown">{t('cropAdvisor.perennialExcluded', 'Perennial orchard excluded')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Unavailable Banner */}
                {advisoryResponse.aiStatus === 'ai-unavailable' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-amber-600">info</span>
                    <span>
                      {advisoryResponse.aiStatusMessage ||
                        'AI Agronomic Exploration is temporarily unavailable. The deterministic audit breakdown remains accessible above.'}
                    </span>
                  </div>
                )}

                {/* AI Agronomic Exploration Section */}
                {advisoryResponse.explorationCrops && advisoryResponse.explorationCrops.length > 0 && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-300 text-xs text-charred-soil space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                        <span className="material-symbols-outlined text-lg text-amber-700">psychology</span>
                        <span>{t('cropAdvisor.aiExplorationTitle', 'AI Agronomic Exploration')}</span>
                      </div>
                      <p className="leading-relaxed text-amber-900 text-[11px]">
                        {t('cropAdvisor.aiExplorationSubtitle', 'Gemini analyzed your farm context, soil profile, weather, and crop rotation to identify potential crop alternatives. These are AI-derived possibilities and are NOT district-validated FarmHelper recommendations.')}
                      </p>
                      {advisoryResponse.overallSummary && (
                        <p className="text-[11px] text-amber-950 font-medium pt-1 border-t border-amber-200/80">
                          {advisoryResponse.overallSummary}
                        </p>
                      )}
                    </div>

                    {advisoryResponse.explorationCrops.map((crop, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-amber-300 bg-[#FFFCF5] hover:border-amber-400 transition-all space-y-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-headline font-bold text-amber-950 text-sm sm:text-base">
                              {crop.cropName}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 mt-1">
                              <span className="material-symbols-outlined text-[12px] text-amber-700">insights</span>
                              <span>{t('cropAdvisor.aiPotential', 'AI Potential:')} {crop.aiPotential}</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <span className="material-symbols-outlined text-xs text-amber-700">science</span>
                              <span>{t('cropAdvisor.aiDerivedNotDistrictValidated', 'AI-Derived — Not District Validated')}</span>
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#FFFDF9] rounded-lg border border-amber-200/80 text-xs space-y-1">
                          <span className="font-bold text-amber-950 text-[11px] block">{t('cropAdvisor.whyItMayFit', 'Why it may fit:')}</span>
                          <p className="text-umber-brown text-[11px] leading-relaxed">{crop.whyItMayFit}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FFFDF9] p-2.5 rounded-lg border border-amber-200/60">
                          <div>
                            <span className="font-bold text-charred-soil block">{t('cropAdvisor.soilFit', 'Soil Fit:')}</span>
                            <span className="text-umber-brown">{crop.soilAssessment}</span>
                          </div>
                          <div>
                            <span className="font-bold text-charred-soil block">{t('cropAdvisor.weatherAndSeason', 'Weather & Season:')}</span>
                            <span className="text-umber-brown">{crop.weatherAssessment}</span>
                          </div>
                          <div>
                            <span className="font-bold text-charred-soil block">{t('cropAdvisor.waterRequirement', 'Water Requirement:')}</span>
                            <span className="text-umber-brown">{crop.waterAssessment}</span>
                          </div>
                          <div>
                            <span className="font-bold text-charred-soil block">{t('cropAdvisor.plantingWindow', 'Planting Window:')}</span>
                            <span className="text-umber-brown">{crop.plantingWindowAssessment || 'AI Seasonal Analysis'}</span>
                          </div>
                        </div>

                        {crop.nutrientConsiderations && crop.nutrientConsiderations.length > 0 && (
                          <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                            <span className="font-bold block">{t('cropAdvisor.nutrientConsiderationsTitle', 'Nutrient Considerations & Correctable Management')}</span>
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                              {crop.nutrientConsiderations.map((note, nIdx) => (
                                <li key={nIdx}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {crop.keyRisks && crop.keyRisks.length > 0 && (
                          <div className="p-2 bg-red-50/60 rounded border border-red-200/80 text-[11px] text-red-900 space-y-0.5">
                            <span className="font-bold block">{t('cropAdvisor.keyRiskConsiderations', 'Key Risk Considerations:')}</span>
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                              {crop.keyRisks.map((risk, rIdx) => (
                                <li key={rIdx}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {crop.uncertainties && crop.uncertainties.length > 0 && (
                          <div className="p-2 bg-amber-100/60 rounded border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                            <span className="font-bold block">{t('cropAdvisor.importantUncertainties', 'Important Uncertainties:')}</span>
                            <p>{crop.uncertainties.join('. ')}</p>
                          </div>
                        )}

                        <div className="p-2 bg-amber-100/80 rounded border border-amber-300 text-[10px] text-amber-950 flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-xs text-amber-700">warning</span>
                          <span>{t('cropAdvisor.aiDisclaimer', '⚠️ AI-derived potential crop — requires local agronomic verification before field implementation.')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : advisoryResponse?.recommendations && advisoryResponse.recommendations.length > 0 ? (
              <div className="space-y-4 animate-fadeIn">
                {/* AI Unavailable Banner */}
                {advisoryResponse.aiStatus === 'ai-unavailable' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-amber-600">info</span>
                    <span>
                      {advisoryResponse.aiStatusMessage ||
                        'AI analysis is temporarily unavailable. Your validated crop suitability results remain fully accessible.'}
                    </span>
                  </div>
                )}

                {/* Overall AI Summary */}
                {advisoryResponse.overallSummary && (
                  <div className="p-3.5 bg-[#F0F4E8] rounded-xl border border-harvest-olive/30 text-xs text-charred-soil space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-harvest-olive">
                      <span className="material-symbols-outlined text-base">auto_awesome</span>
                      <span>{t('cropAdvisor.aiAgronomicOverview', 'AI Agronomic Overview')}</span>
                    </div>
                    <p className="leading-relaxed text-umber-brown">{advisoryResponse.overallSummary}</p>
                  </div>
                )}

                {advisoryResponse.recommendations.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-pressed-sand bg-[#FAF7F2] hover:border-harvest-olive/50 transition-all space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-headline font-bold text-charred-soil text-sm sm:text-base">
                          {t('crops.' + item.cropId, item.displayName)}
                        </h3>
                        <p className="text-[11px] text-umber-brown italic">
                          {item.scientificName}
                        </p>
                        {/* Evidence Level Badge */}
                        <div className="mt-1">
                          {item.calendarEvidence?.level === 'EXACT_DISTRICT' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="material-symbols-outlined text-xs text-emerald-700">verified</span>
                              <span>{t('cropAdvisor.exactDistrictVerified', 'Exact District Verified')}</span>
                            </span>
                          ) : item.calendarEvidence?.level === 'STATE_LEVEL' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                              <span className="material-symbols-outlined text-xs text-blue-700">map</span>
                              <span>{t('cropAdvisor.stateLevelEvidence', 'State Level Evidence')}</span>
                            </span>
                          ) : item.calendarEvidence?.level === 'REGIONAL' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                              <span className="material-symbols-outlined text-xs text-indigo-700">public</span>
                              <span>{t('cropAdvisor.regionalEvidence', 'Regional Evidence')}</span>
                            </span>
                          ) : item.calendarEvidence?.level === 'GENERAL_CROP_KNOWLEDGE' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                              <span className="material-symbols-outlined text-xs text-amber-700">school</span>
                              <span>{t('cropAdvisor.generalCropKnowledge', 'General Crop Knowledge')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                              <span className="material-symbols-outlined text-xs text-purple-700">psychology</span>
                              <span>{t('cropAdvisor.aiDerivedNotDistrictValidated', 'AI-Derived — Not District Validated')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        {item.recommendationStatus === 'SUITABLE_WITH_MANAGEMENT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <span className="material-symbols-outlined text-xs text-amber-600">warning</span>
                            <span>{t('cropAdvisor.suitableWithManagement', 'Suitable with Management')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0F4E8] text-harvest-olive border border-[#91A35A]/40">
                            <span className="material-symbols-outlined text-xs text-harvest-olive">check_circle</span>
                            <span>{t('cropAdvisor.suitableForFarm', 'Suitable for your farm')}</span>
                          </span>
                        )}
                        <span className="text-xs font-bold text-charred-soil">
                          {item.suitabilityScore}% {t('cropAdvisor.suitabilityMatch')}
                        </span>
                        {item.calendarEvidence?.sourceRowReference && (
                          <span className="block text-[10px] text-umber-brown">
                            {t('cropAdvisor.source', 'Source:')} {item.calendarEvidence.sourceRowReference}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nutrient Management Box for SUITABLE_WITH_MANAGEMENT Crops */}
                    {item.recommendationStatus === 'SUITABLE_WITH_MANAGEMENT' && (
                      <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/90 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-sm text-amber-700">science</span>
                          <span>{t('cropAdvisor.nutrientConsiderationsTitle', 'Nutrient Considerations & Correctable Management')}</span>
                        </div>
                        {item.nutrientDeficiencies && item.nutrientDeficiencies.length > 0 ? (
                          <ul className="list-disc list-inside text-[11px] text-amber-900 space-y-0.5 pl-1 font-medium">
                            {item.nutrientDeficiencies.map((def, dIdx) => (
                              <li key={dIdx}>{def}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-amber-900">
                            {t('cropAdvisor.nutrientDefault', 'Soil nutrient levels are below ideal crop demand. Soil management and balanced fertilization are recommended.')}
                          </p>
                        )}
                        <p className="text-[10px] text-amber-800 italic pt-0.5">
                          {t('cropAdvisor.nutrientInterpretation', 'Interpretation: The crop passes all hard district, sowing date, water, and rotation feasibility checks, but targeted soil nutrient management is required.')}
                        </p>
                      </div>
                    )}

                    {/* Section 1: Validated Farm Analysis */}
                    <div>
                      <h4 className="text-[11px] font-bold text-harvest-olive uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span>{t('cropAdvisor.validatedFarmAnalysis', 'Validated Farm Analysis')}</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FFFDF9] p-2.5 rounded-lg border border-pressed-sand/60">
                        <div>
                          <span className="font-bold text-charred-soil block">{t('cropAdvisor.soilFit', 'Soil Fit:')}</span>
                          <span className="text-umber-brown">{item.soilAssessment}</span>
                        </div>
                        <div>
                          <span className="font-bold text-charred-soil block">{t('cropAdvisor.weatherAndSeason', 'Weather & Season:')}</span>
                          <span className="text-umber-brown">{item.weatherAssessment}</span>
                        </div>
                        <div>
                          <span className="font-bold text-charred-soil block">{t('cropAdvisor.cropRotation', 'Crop Rotation:')}</span>
                          <span className="text-umber-brown">{item.rotationAssessment}</span>
                        </div>
                        <div>
                          <span className="font-bold text-charred-soil block">{t('cropAdvisor.waterRequirement', 'Water Requirement:')}</span>
                          <span className="text-umber-brown">{item.waterAssessment}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: AI Agronomic Analysis (Gemini Explanations) */}
                    {(item.whySuitable || (item.keyRisks && item.keyRisks.length > 0) || (item.managementActions && item.managementActions.length > 0)) && (
                      <div className="p-3 bg-[#FBF9F4] rounded-lg border border-harvest-olive/20 space-y-2 text-xs">
                        <h4 className="font-bold text-harvest-olive text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">psychology</span>
                          <span>{t('cropAdvisor.aiAgronomicAnalysis', 'AI Agronomic Analysis')}</span>
                        </h4>

                        {item.whySuitable && (
                          <p className="text-[11px] text-umber-brown leading-relaxed">{item.whySuitable}</p>
                        )}

                        {item.managementActions && item.managementActions.length > 0 && (
                          <div>
                            <span className="font-semibold text-charred-soil text-[11px] block">{t('cropAdvisor.recommendedActions', 'Recommended Actions:')}</span>
                            <ul className="list-disc list-inside text-[11px] text-umber-brown space-y-0.5 pl-1">
                              {item.managementActions.map((act, aIdx) => (
                                <li key={aIdx}>{act}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.keyRisks && item.keyRisks.length > 0 && (
                          <div>
                            <span className="font-semibold text-amber-900 text-[11px] block">{t('cropAdvisor.keyRiskConsiderations', 'Key Risk Considerations:')}</span>
                            <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 pl-1">
                              {item.keyRisks.map((r, rIdx) => (
                                <li key={rIdx}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Agronomic Advantages */}
                    {item.reasons && item.reasons.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-charred-soil mb-1">{t('cropAdvisor.keyAdvantages', 'Key Advantages:')}</h4>
                        <ul className="list-disc list-inside text-xs text-umber-brown space-y-0.5 pl-1">
                          {item.reasons.map((r, rIdx) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.limitations && item.limitations.length > 0 && (
                      <div className="p-2 bg-amber-50/80 rounded border border-amber-200 text-[11px] text-amber-900">
                        <span className="font-bold block">{t('cropAdvisor.managementGuidance', 'Management Guidance:')}</span>
                        <span>{item.limitations.join('. ')}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Analysis Transparency Panel */}
                <div className="p-3.5 bg-[#FAF7F2] rounded-lg border border-pressed-sand text-xs space-y-2 text-umber-brown">
                  <h4 className="font-bold text-charred-soil flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-sm text-harvest-olive">analytics</span>
                    <span>{t('cropAdvisor.analysisBasedOn')}</span>
                  </h4>
                  <ul className="space-y-1 text-[11px] list-disc list-inside pl-1">
                    <li>
                      <strong>Farm:</strong> {advisoryResponse.farmSummary?.farmName} ({advisoryResponse.farmSummary?.location})
                    </li>
                    <li>
                      <strong>Current Crop:</strong> {advisoryResponse.farmSummary?.currentCrop}
                    </li>
                    <li>
                      <strong>Water Source:</strong> {selectedFarm?.waterSource ? (selectedFarm.waterSource === 'Other' ? selectedFarm.waterSourceOther || 'Other' : selectedFarm.waterSource) : 'Not specified'}
                    </li>
                    <li>
                      <strong>Soil Inputs:</strong> pH {ph}, N {nitrogen} kg/ha, P {phosphorus} kg/ha, K {potassium} kg/ha
                    </li>
                    <li>
                      <strong>Historical Crop Cycle:</strong> {advisoryResponse.weatherSummary?.historicalWindow}
                    </li>
                    {advisoryResponse.weatherSummary?.yearOverYearSummary && (
                      <li>
                        <strong>3-Year YoY Climate Baseline:</strong> {advisoryResponse.weatherSummary.yearOverYearSummary}
                      </li>
                    )}
                    {advisoryResponse.weatherSummary?.harvestWindowSummary && (
                      <li>
                        <strong>Harvest Window Historical Climate:</strong> {advisoryResponse.weatherSummary.harvestWindowSummary}
                      </li>
                    )}
                    <li>
                      <strong>Live Telemetry & Forecast Horizon:</strong> {advisoryResponse.weatherSummary?.currentTemp} ({advisoryResponse.weatherSummary?.forecastHorizon})
                    </li>
                  </ul>
                </div>

                {/* Data Limitations Disclaimer Panel */}
                <div className="p-3 bg-[#FAF7F2] rounded-lg border border-amber-300/80 text-[11px] text-umber-brown space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <span className="material-symbols-outlined text-sm text-amber-600">info</span>
                    <span>{t('cropAdvisor.dataLimitations')}</span>
                  </div>
                  <p className="text-[11px] text-umber-brown leading-relaxed">
                    Forecast data incorporates live 16-day Open-Meteo telemetry. Historical 3-year YoY same-season climate and historical harvest window patterns are past evidence used for multi-year risk evaluation — NOT a future forecast. Always consult your local KVK agricultural extension specialist.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-umber-brown p-6">
                <span className="material-symbols-outlined text-4xl text-harvest-olive/50 mb-2">
                  nature_people
                </span>
                <p className="text-xs">
                  {t('cropAdvisor.subtitle')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
