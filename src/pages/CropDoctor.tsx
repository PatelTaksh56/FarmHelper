import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { runCropDiagnosis, validateCropImage, getBackendEndpoint, CropDoctorError } from '../services/cropDoctorService';
import { CropDoctorRecord } from '../types/models';

import { CropSelect } from '../components/common/CropSelect';
import { VoiceInputButton } from '../components/common/VoiceInputButton';
import { AudioPlayerButton } from '../components/common/AudioPlayerButton';

export const CropDoctor: React.FC = () => {
  const { currentUser, userSettings } = useAuth();
  const { t } = useTranslation();

  const [crop, setCrop] = useState('Wheat');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptedUrl, setAttemptedUrl] = useState<string | null>(null);
  const [diagnosisRecord, setDiagnosisRecord] = useState<CropDoctorRecord | null>(null);

  // Request ID ref to prevent stale async responses from overwriting newer results
  const requestIdRef = useRef(0);

  // Clear diagnosis record when language changes to prevent displaying stale diagnosis in wrong language
  useEffect(() => {
    setDiagnosisRecord(null);
    setErrorMessage(null);
    setValidationError(null);
  }, [userSettings.preferredLanguage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    setErrorMessage(null);
    setAttemptedUrl(null);
    setDiagnosisRecord(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        validateCropImage(file);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } catch (err: any) {
        setValidationError(err.message || 'Invalid image file.');
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    setDiagnosisRecord(null);
  };

  const executeDiagnosis = async () => {
    setValidationError(null);
    setErrorMessage(null);
    setAttemptedUrl(null);
    setDiagnosisRecord(null);

    if (!currentUser) {
      setValidationError(t('validation.cropRequired'));
      return;
    }

    if (!crop || !crop.trim()) {
      setValidationError(t('validation.cropRequired'));
      return;
    }

    if (!selectedFile && (!description || !description.trim())) {
      setValidationError(t('validation.descriptionOrImageRequired'));
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const result = await runCropDiagnosis(
        {
          userId: currentUser.uid,
          crop: crop,
          description: description,
          file: selectedFile,
          preferredLanguage: userSettings.preferredLanguage || 'en-IN',
        }
      );

      // Only apply result if this request is still the active request
      if (currentRequestId === requestIdRef.current) {
        setDiagnosisRecord(result);
      }
    } catch (err: any) {
      console.error('[CropDoctor Component Error]', err);
      if (currentRequestId === requestIdRef.current) {
        setErrorMessage(err.message || t('common.error'));
        setAttemptedUrl(err instanceof CropDoctorError && err.endpointUrl ? err.endpointUrl : getBackendEndpoint());
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault();
    executeDiagnosis();
  };

  const severityBadgeClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    const key = `cropDoctor.severity${severity.charAt(0).toUpperCase() + severity.slice(1)}`;
    const translated = t(key as any);
    if (translated && translated !== key) return translated;
    return severity.toUpperCase();
  };

  // Build audio transcript text for TTS speaker button
  const getAudioText = () => {
    if (!diagnosisRecord) return '';
    return `${t('cropDoctor.diagnosis')}: ${diagnosisRecord.diagnosis}. ${t('cropDoctor.symptoms')}: ${
      diagnosisRecord.observedSymptoms?.join('. ') || ''
    }. ${t('cropDoctor.treatment')}: ${diagnosisRecord.treatment?.join('. ') || ''}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-body">
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
          {t('cropDoctor.title')}
        </h1>
        <p className="text-sm text-umber-brown mt-1">
          {t('cropDoctor.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input & Upload Form */}
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 space-y-5">
          <h2 className="font-headline text-lg font-bold text-charred-soil flex items-center gap-2">
            <span className="material-symbols-outlined text-harvest-olive">photo_camera</span>
            <span>{t('cropDoctor.uploadTitle')}</span>
          </h2>

          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-sm text-red-600 mt-0.5">error</span>
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleDiagnose} className="space-y-4">
            <div>
              <CropSelect
                label={t('cropDoctor.cropSelectLabel')}
                value={crop}
                onChange={(selectedCrop) => {
                  setCrop(selectedCrop);
                  setValidationError(null);
                  setDiagnosisRecord(null);
                }}
              />
            </div>

            {/* File Drag & Drop Box */}
            <div>
              <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                {t('cropDoctor.uploadLeafPhoto')}
              </label>
              <div className="border-2 border-dashed border-pressed-sand rounded-xl p-6 text-center hover:border-harvest-olive/60 transition-colors bg-[#FAF7F2] relative">
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Crop symptom preview"
                      className="max-h-48 mx-auto rounded-lg object-contain shadow-sm border border-pressed-sand"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs text-red-600 font-medium hover:underline cursor-pointer"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="material-symbols-outlined text-4xl text-harvest-olive mb-2 block">
                      cloud_upload
                    </span>
                    <p className="text-xs font-medium text-charred-soil">
                      {t('cropDoctor.uploadLeafPhoto')}
                    </p>
                    <p className="text-[11px] text-umber-brown mt-0.5">
                      JPEG, PNG, WebP up to 10 MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Problem Description Textarea with Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-charred-soil">
                  {t('cropDoctor.descriptionLabel')}
                </label>
                <VoiceInputButton
                  onTranscript={(speechText) => {
                    setDescription((prev) => (prev ? `${prev} ${speechText}` : speechText));
                    setValidationError(null);
                  }}
                  disabled={loading}
                />
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setValidationError(null);
                }}
                placeholder={t('cropDoctor.symptomPlaceholder')}
                className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg p-3 text-xs sm:text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                disabled={loading}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark disabled:opacity-60 text-white text-xs sm:text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">biotech</span>
                  <span>{t('cropDoctor.runDiagnosisBtn')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Diagnosis Results Card */}
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-headline text-lg font-bold text-charred-soil flex items-center gap-2">
                <span className="material-symbols-outlined text-harvest-olive">diagnosis</span>
                <span>{t('cropDoctor.resultTitle')}</span>
              </h2>

              {/* Speaker Button for Text-To-Speech Output */}
              {diagnosisRecord && (
                <AudioPlayerButton textToSpeak={getAudioText()} />
              )}
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fadeIn">
                <span className="inline-block w-10 h-10 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin mb-2"></span>
                <h3 className="font-headline text-base font-bold text-charred-soil">{t('common.loading')}</h3>
                <p className="text-xs text-umber-brown max-w-xs">
                  Gemini is analyzing the crop image and reported symptoms.
                </p>
              </div>
            ) : errorMessage ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2.5 text-red-800 text-xs">
                  <span className="material-symbols-outlined text-lg text-red-600 mt-0.5">error_outline</span>
                  <div className="space-y-1 w-full">
                    <h4 className="font-bold text-red-900 text-sm">{t('common.error')}</h4>
                    <p className="text-xs text-red-700">{errorMessage}</p>

                    {attemptedUrl && (
                      <div className="mt-2 p-2 bg-red-100/70 rounded border border-red-200 text-[11px] font-mono text-red-900 break-all">
                        <span className="font-sans font-semibold block text-[10px] uppercase text-red-700 mb-0.5">
                          Target API Endpoint
                        </span>
                        {attemptedUrl}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-200/80">
                  <button
                    type="button"
                    onClick={(e) => handleDiagnose(e)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    <span>{t('common.checkAgain')}</span>
                  </button>
                </div>
              </div>
            ) : diagnosisRecord ? (
              <div className="space-y-4 text-xs sm:text-sm animate-fadeIn">
                <div className="p-3.5 bg-[#F0F4E8] rounded-lg border border-[#91A35A]/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-harvest-olive">
                      {t('cropDoctor.diagnosis')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${severityBadgeClass(
                          diagnosisRecord.severity
                        )}`}
                      >
                        {getSeverityLabel(diagnosisRecord.severity)} {t('cropDoctor.severity')}
                      </span>
                      <span className="font-bold text-harvest-olive text-xs">
                        {Math.round(diagnosisRecord.confidence * 100)}% {t('cropDoctor.confidence')}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline text-base sm:text-lg font-bold text-charred-soil">
                    {diagnosisRecord.diagnosis}
                  </h3>
                </div>

                {diagnosisRecord.observedSymptoms && diagnosisRecord.observedSymptoms.length > 0 && (
                  <div>
                    <h4 className="font-bold text-charred-soil mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-harvest-olive">check_circle</span>
                      <span>{t('cropDoctor.symptoms')}</span>
                    </h4>
                    <ul className="space-y-1 text-umber-brown list-disc list-inside text-xs pl-1">
                      {diagnosisRecord.observedSymptoms.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosisRecord.possibleCauses && diagnosisRecord.possibleCauses.length > 0 && (
                  <div>
                    <h4 className="font-bold text-charred-soil mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-harvest-olive">science</span>
                      <span>{t('cropDoctor.causes')}</span>
                    </h4>
                    <ul className="space-y-1 text-umber-brown list-disc list-inside text-xs pl-1">
                      {diagnosisRecord.possibleCauses.map((c: string, idx: number) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosisRecord.treatment && diagnosisRecord.treatment.length > 0 && (
                  <div>
                    <h4 className="font-bold text-charred-soil mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-harvest-olive">medication</span>
                      <span>{t('cropDoctor.treatment')}</span>
                    </h4>
                    <ul className="space-y-1 text-umber-brown list-disc list-inside text-xs pl-1">
                      {diagnosisRecord.treatment.map((tr: string, idx: number) => (
                        <li key={idx}>{tr}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosisRecord.prevention && diagnosisRecord.prevention.length > 0 && (
                  <div>
                    <h4 className="font-bold text-charred-soil mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-harvest-olive">shield</span>
                      <span>{t('cropDoctor.prevention')}</span>
                    </h4>
                    <ul className="space-y-1 text-umber-brown list-disc list-inside text-xs pl-1">
                      {diagnosisRecord.prevention.map((p: string, idx: number) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosisRecord.expertConfirmationRecommended && (
                  <div className="p-3 bg-[#FAF7F2] rounded-lg border border-amber-300 text-[11px] text-umber-brown space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                      <span className="material-symbols-outlined text-sm text-amber-600">warning</span>
                      <span>{t('cropDoctor.expertNote')}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-umber-brown p-6">
                <span className="material-symbols-outlined text-4xl text-harvest-olive/50 mb-2">
                  sanitizer
                </span>
                <p className="text-xs">
                  {t('cropDoctor.uploadTitle')}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-pressed-sand flex items-center justify-between text-xs text-umber-brown">
            <span>{t('help.kisanCallCenter')}: 1800-180-1551</span>
            <span className="text-harvest-olive font-medium">Kisan Portal Linked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
