import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n';
import { UserSettings } from '../types/models';
import { sendTestEmail } from '../services/notificationService';

interface SettingsProps {
  onOpenLogoutModal?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onOpenLogoutModal }) => {
  const { userProfile, userSettings, updateSettings, updateProfileName, currentUser } = useAuth();
  const { t } = useTranslation();
  const outletContext = useOutletContext<{ onOpenLogoutModal: () => void }>();

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameValidationError, setNameValidationError] = useState<string | null>(null);
  const [nameSaveError, setNameSaveError] = useState<string | null>(null);

  // Local state for measurement options
  const language = userSettings.preferredLanguage || 'en-IN';
  const [landUnit, setLandUnit] = useState<UserSettings['landAreaUnit']>(
    userSettings.landAreaUnit || 'Acre'
  );
  const [weightUnit, setWeightUnit] = useState<UserSettings['weightUnit']>(
    userSettings.weightUnit || 'Quintal'
  );
  const [tempScale, setTempScale] = useState<UserSettings['temperatureScale']>(
    userSettings.temperatureScale || 'Celsius'
  );
  const [emailAlerts, setEmailAlerts] = useState<boolean>(
    userSettings.emailNotifications
  );
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Phone-auth vs Auth email status
  const hasAuthEmail = Boolean(userProfile?.email || currentUser?.email);
  const currentNotificationEmail = userSettings.notificationEmail || '';

  // Email Collection Modal State for Phone-Auth Users
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalInput, setEmailModalInput] = useState('');
  const [emailModalError, setEmailModalError] = useState<string | null>(null);
  const [emailModalSaving, setEmailModalSaving] = useState(false);

  const isValidEmailFormat = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleEmailToggle = async (checked: boolean) => {
    if (checked) {
      if (hasAuthEmail) {
        setEmailAlerts(true);
        try {
          await updateSettings({ emailNotifications: true });
        } catch (err) {
          console.error('Failed to update email alert preference:', err);
        }
      } else if (currentNotificationEmail && isValidEmailFormat(currentNotificationEmail)) {
        setEmailAlerts(true);
        try {
          await updateSettings({ emailNotifications: true });
        } catch (err) {
          console.error('Failed to update email alert preference:', err);
        }
      } else {
        // Phone-only user with no email: do not enable immediately, open dialog
        setEmailModalInput('');
        setEmailModalError(null);
        setIsEmailModalOpen(true);
      }
    } else {
      setEmailAlerts(false);
      try {
        await updateSettings({ emailNotifications: false });
      } catch (err) {
        console.error('Failed to disable email alerts:', err);
      }
    }
  };

  const handleOpenEmailDialog = () => {
    setEmailModalInput(currentNotificationEmail || '');
    setEmailModalError(null);
    setIsEmailModalOpen(true);
  };

  const handleSaveNotificationEmail = async () => {
    const trimmed = emailModalInput.trim().toLowerCase();
    if (!trimmed) {
      setEmailModalError('Email address is required.');
      return;
    }
    if (!isValidEmailFormat(trimmed)) {
      setEmailModalError('Please enter a valid email address (e.g., farmer@example.com).');
      return;
    }

    setEmailModalSaving(true);
    setEmailModalError(null);
    try {
      await updateSettings({
        emailNotifications: true,
        notificationEmail: trimmed,
      });
      setEmailAlerts(true);
      setIsEmailModalOpen(false);
      setEmailModalInput('');
      setSuccessMessage('Email address saved and weather alerts enabled.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('[Save Notification Email Error]', err);
      setEmailModalError('Failed to save email address. Please try again.');
    } finally {
      setEmailModalSaving(false);
    }
  };

  const handleSendTestEmailClick = async () => {
    setSendingTestEmail(true);
    setTestEmailStatus(null);
    try {
      const res = await sendTestEmail();
      setTestEmailStatus({
        success: true,
        message: res.message || 'Test email dispatched to registered address.',
      });
      setTimeout(() => setTestEmailStatus(null), 8000);
    } catch (err: any) {
      setTestEmailStatus({
        success: false,
        message: err.message || 'Failed to send test email.',
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Instant reactive language change handler
  const handleLanguageChange = async (newLang: string) => {
    try {
      await updateSettings({ preferredLanguage: newLang });
    } catch (err) {
      console.error('Failed to change language:', err);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    try {
      await updateSettings({
        preferredLanguage: language,
        landAreaUnit: landUnit,
        weightUnit: weightUnit,
        temperatureScale: tempScale,
        emailNotifications: emailAlerts,
        notificationEmail: userSettings.notificationEmail || null,
      });
      setSuccessMessage(t('common.success') + ': ' + t('settings.saveBtn'));
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenNameModal = () => {
    setNameInput(userProfile?.fullName || '');
    setNameValidationError(null);
    setNameSaveError(null);
    setIsEditingName(true);
  };

  const currentFullName = userProfile?.fullName || '';
  const trimmedNameInput = nameInput.trim();

  // Validation state checks
  const isNameEmptyOrWhitespace = !trimmedNameInput;
  const isNameUnchanged = trimmedNameInput === currentFullName;
  const isNameTooShort = trimmedNameInput.length > 0 && trimmedNameInput.length < 2;
  const isNameTooLong = trimmedNameInput.length > 50;

  const isSaveNameDisabled =
    isNameEmptyOrWhitespace ||
    isNameUnchanged ||
    isNameTooShort ||
    isNameTooLong ||
    nameSaving;

  const handleSaveName = async () => {
    setNameValidationError(null);
    setNameSaveError(null);

    if (isNameEmptyOrWhitespace) {
      setNameValidationError(t('validation.nameRequired'));
      return;
    }
    if (isNameTooShort) {
      setNameValidationError(t('validation.nameMinLength'));
      return;
    }
    if (isNameTooLong) {
      setNameValidationError(t('validation.nameMaxLength'));
      return;
    }

    setNameSaving(true);

    try {
      await updateProfileName(trimmedNameInput);
      setIsEditingName(false);
      setSuccessMessage(t('common.success'));
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('[Update Name Error]', err);
      setNameSaveError(t('common.error'));
    } finally {
      setNameSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-body">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-umber-brown mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-sprout-wash border border-sunlit-sage/40 text-harvest-olive text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Localization & Measurement Units Card */}
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-pressed-sand pb-4">
            <div className="w-10 h-10 rounded-lg bg-[#F0F4E8] text-harvest-olive flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">tune</span>
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-charred-soil">
                {t('settings.regionalStandards')}
              </h2>
              <p className="text-xs text-umber-brown">
                {t('settings.regionalStandardsDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Preferred Language Dropdown (Renders all 14 Languages with Native Names) */}
            <div>
              <label className="block text-xs font-semibold text-charred-soil mb-2">
                {t('settings.regionalLanguage')}
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full appearance-none bg-[#F6F3EC] border border-pressed-sand rounded-lg px-4 py-2.5 text-sm text-charred-soil font-medium focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none transition-colors cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.appCode} value={lang.appCode}>
                      {lang.nativeName} ({lang.englishName})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-umber-brown">
                  <span className="material-symbols-outlined text-xl">expand_more</span>
                </div>
              </div>
              <p className="text-[11px] text-umber-brown/80 mt-1.5">
                {t('settings.languageDesc')}
              </p>
            </div>

            {/* Land Area Measurement Unit Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-charred-soil mb-2">
                {t('settings.landAreaUnit')}
              </label>
              <div className="relative">
                <select
                  value={landUnit}
                  onChange={(e) => setLandUnit(e.target.value as any)}
                  className="w-full appearance-none bg-[#F6F3EC] border border-pressed-sand rounded-lg px-4 py-2.5 text-sm text-charred-soil font-medium focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Acre">Acre (Default)</option>
                  <option value="Hectare">Hectare</option>
                  <option value="Bigha">Bigha (Standard Regional)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-umber-brown">
                  <span className="material-symbols-outlined text-xl">expand_more</span>
                </div>
              </div>
              <p className="text-[11px] text-umber-brown/80 mt-1.5">
                {t('settings.landAreaDesc')}
              </p>
            </div>

            {/* Weight / Yield Unit Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-charred-soil mb-2">
                {t('settings.weightUnit')}
              </label>
              <div className="relative">
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as any)}
                  className="w-full appearance-none bg-[#F6F3EC] border border-pressed-sand rounded-lg px-4 py-2.5 text-sm text-charred-soil font-medium focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Quintal">Quintal (100 Kg / Mandi Standard)</option>
                  <option value="Kg">Kilogram (Kg)</option>
                  <option value="Tonne">Metric Tonne (1,000 Kg)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-umber-brown">
                  <span className="material-symbols-outlined text-xl">expand_more</span>
                </div>
              </div>
              <p className="text-[11px] text-umber-brown/80 mt-1.5">
                {t('settings.weightDesc')}
              </p>
            </div>

            {/* Temperature Scale Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-charred-soil mb-2">
                {t('settings.temperatureScale')}
              </label>
              <div className="relative">
                <select
                  value={tempScale}
                  onChange={(e) => setTempScale(e.target.value as any)}
                  className="w-full appearance-none bg-[#F6F3EC] border border-pressed-sand rounded-lg px-4 py-2.5 text-sm text-charred-soil font-medium focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Celsius">Celsius (°C)</option>
                  <option value="Fahrenheit">Fahrenheit (°F)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-umber-brown">
                  <span className="material-symbols-outlined text-xl">expand_more</span>
                </div>
              </div>
              <p className="text-[11px] text-umber-brown/80 mt-1.5">
                {t('settings.tempDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 border-b border-pressed-sand pb-4">
            <div className="w-10 h-10 rounded-lg bg-[#F0F4E8] text-harvest-olive flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-charred-soil">
                {t('settings.alertsTitle')}
              </h2>
              <p className="text-xs text-umber-brown">
                {t('settings.alertsDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-lg border border-pressed-sand bg-[#FAF7F2] space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="pr-3">
                  <span className="text-sm font-semibold text-charred-soil block">
                    {t('settings.emailAlerts')}
                  </span>
                  {hasAuthEmail ? (
                    <span className="text-xs text-umber-brown block mt-0.5">
                      Receive weather advisories via registered email.
                    </span>
                  ) : currentNotificationEmail ? (
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-umber-brown">
                        Weather advisories will be sent to:
                      </span>
                      <span className="text-xs font-semibold text-charred-soil">
                        {currentNotificationEmail}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenEmailDialog();
                        }}
                        className="text-xs text-harvest-olive underline font-medium hover:text-harvest-olive-dark ml-1 cursor-pointer"
                      >
                        Change email
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-800 font-medium block mt-0.5">
                      Add an email address to receive weather advisories.
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts && (hasAuthEmail || Boolean(currentNotificationEmail))}
                  onChange={(e) => handleEmailToggle(e.target.checked)}
                  className="w-5 h-5 accent-harvest-olive rounded cursor-pointer shrink-0 ml-3"
                />
              </label>

              <div className="pt-2 border-t border-pressed-sand/60 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSendTestEmailClick}
                  disabled={sendingTestEmail}
                  className="px-3 py-1.5 rounded bg-harvest-olive/10 hover:bg-harvest-olive/20 text-harvest-olive font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {sendingTestEmail ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-harvest-olive border-t-transparent rounded-full animate-spin"></span>
                      <span>Sending Test Email...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">mark_email_read</span>
                      <span>Send Test Email</span>
                    </>
                  )}
                </button>

                {testEmailStatus && (
                  <span className={`text-xs font-medium flex items-center gap-1.5 ${testEmailStatus.success ? 'text-harvest-olive' : 'text-red-600'}`}>
                    <span className="material-symbols-outlined text-sm">{testEmailStatus.success ? 'check_circle' : 'error'}</span>
                    <span>{testEmailStatus.message}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details & Session Card */}
        <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-pressed-sand pb-4">
            <div className="w-10 h-10 rounded-lg bg-[#F0F4E8] text-harvest-olive flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-charred-soil">
                {t('settings.accountTitle')}
              </h2>
              <p className="text-xs text-umber-brown">
                {t('settings.accountDesc')}
              </p>
            </div>
          </div>

          {/* Personal Information Sub-Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-harvest-olive">
              {t('settings.registeredName')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 bg-[#FAF7F2] rounded-lg border border-pressed-sand flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-umber-brown block text-xs">{t('settings.registeredName')}</span>
                  <span className="font-semibold text-charred-soil truncate block">
                    {userProfile?.fullName || t('nav.progressiveFarmer')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNameModal}
                  className="px-3 py-1.5 rounded bg-harvest-olive/10 hover:bg-harvest-olive/20 text-harvest-olive font-semibold text-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span>{t('settings.changeName')}</span>
                </button>
              </div>
              <div className="p-3.5 bg-[#FAF7F2] rounded-lg border border-pressed-sand">
                <span className="text-umber-brown block text-xs">{t('settings.primaryContact')}</span>
                <span className="font-semibold text-charred-soil truncate block">
                  {userProfile?.email || userProfile?.mobileNumber || 'Firebase User'}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Action in Settings */}
          <div className="pt-4 border-t border-pressed-sand flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-sm font-semibold text-charred-soil block">
                {t('settings.sessionControl')}
              </span>
              <span className="text-xs text-umber-brown">
                End your active authenticated session on this workstation.
              </span>
            </div>

            <button
              type="button"
              onClick={() => outletContext?.onOpenLogoutModal?.()}
              className="py-2.5 px-5 rounded-md border border-error/30 bg-error-container/40 hover:bg-error hover:text-white text-error font-medium text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>{t('settings.signOutBtn')}</span>
            </button>
          </div>
        </div>

        {/* Form Action Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="py-3 px-8 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white font-medium text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                <span>{t('settings.saveBtn')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Change Name Inline Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 bg-charred-soil/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-xl max-w-md w-full p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-pressed-sand pb-3">
              <h3 className="font-headline text-lg font-bold text-charred-soil flex items-center gap-2">
                <span className="material-symbols-outlined text-harvest-olive">badge</span>
                <span>{t('settings.changeName')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                disabled={nameSaving}
                className="text-umber-brown hover:text-charred-soil p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-charred-soil">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameValidationError(null);
                  setNameSaveError(null);
                }}
                maxLength={50}
                placeholder={t('auth.enterFullName')}
                className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                disabled={nameSaving}
              />

              {nameValidationError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-red-600">error</span>
                  <span>{nameValidationError}</span>
                </div>
              )}

              {nameSaveError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-red-600">error</span>
                  <span>{nameSaveError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-pressed-sand">
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                disabled={nameSaving}
                className="px-4 py-2 rounded-md border border-pressed-sand bg-[#FAF7F2] hover:bg-[#F3F0E8] text-charred-soil text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveName}
                disabled={isSaveNameDisabled}
                className="px-5 py-2 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark disabled:opacity-50 text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                {nameSaving ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <span>{t('common.save')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Address Modal for Phone-authenticated Users */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-charred-soil/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-xl max-w-md w-full p-6 space-y-5 animate-fadeIn font-body">
            <div className="flex items-center justify-between border-b border-pressed-sand pb-3">
              <h3 className="font-headline text-lg font-bold text-charred-soil flex items-center gap-2">
                <span className="material-symbols-outlined text-harvest-olive">mail</span>
                <span>Email address required</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                disabled={emailModalSaving}
                className="text-umber-brown hover:text-charred-soil p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-umber-brown leading-relaxed">
                Enter an email address to receive weather advisories from FarmHelper.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charred-soil">
                  Email address
                </label>
                <input
                  type="email"
                  value={emailModalInput}
                  onChange={(e) => {
                    setEmailModalInput(e.target.value);
                    setEmailModalError(null);
                  }}
                  placeholder="farmer@example.com"
                  className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none transition-colors"
                  disabled={emailModalSaving}
                  autoFocus
                />

                {emailModalError && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-sm text-red-600">error</span>
                    <span>{emailModalError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-pressed-sand">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                disabled={emailModalSaving}
                className="px-4 py-2 rounded-md border border-pressed-sand bg-[#FAF7F2] hover:bg-[#F3F0E8] text-charred-soil text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotificationEmail}
                disabled={emailModalSaving || !emailModalInput.trim()}
                className="px-5 py-2 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark disabled:opacity-50 text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {emailModalSaving ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save & Enable</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
