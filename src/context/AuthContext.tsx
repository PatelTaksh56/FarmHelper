import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  subscribeToAuthChanges,
  getUserProfile,
  getUserSettings,
  updateUserSettings as updateFirestoreSettings,
  updateUserName as updateFirestoreUserName,
  logoutUser,
  DEFAULT_USER_SETTINGS,
} from '../services/authService';
import { UserProfile, UserSettings } from '../types/models';
import { syncDocumentDirection } from '../i18n';

const LOCAL_STORAGE_KEY_PREFIX = 'farmhelper_language_';

function getStoredLanguage(uid?: string | null): string {
  try {
    const userKey = uid ? `${LOCAL_STORAGE_KEY_PREFIX}${uid}` : `${LOCAL_STORAGE_KEY_PREFIX}guest`;
    const saved = localStorage.getItem(userKey) || localStorage.getItem('farmhelper_language');
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (err) {
    console.warn('Could not read language from localStorage:', err);
  }
  return 'en-IN';
}

function setStoredLanguage(language: string, uid?: string | null): void {
  try {
    const userKey = uid ? `${LOCAL_STORAGE_KEY_PREFIX}${uid}` : `${LOCAL_STORAGE_KEY_PREFIX}guest`;
    localStorage.setItem(userKey, language);
    localStorage.setItem('farmhelper_language', language);
  } catch (err) {
    console.warn('Could not save language to localStorage:', err);
  }
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  userSettings: UserSettings;
  loading: boolean;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateProfileName: (newName: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const initialLang = getStoredLanguage();
const initialSettings: UserSettings = {
  ...DEFAULT_USER_SETTINGS,
  preferredLanguage: initialLang,
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  userSettings: initialSettings,
  loading: true,
  logout: async () => {},
  updateSettings: async () => {},
  updateProfileName: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(initialSettings);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync document direction (LTR/RTL) whenever language changes
  useEffect(() => {
    syncDocumentDirection(userSettings.preferredLanguage || 'en-IN');
  }, [userSettings.preferredLanguage]);

  const fetchUserData = async (user: User) => {
    try {
      const [profile, settings] = await Promise.all([
        getUserProfile(user.uid),
        getUserSettings(user.uid),
      ]);
      setUserProfile(profile);

      // Reconcile language preference from local storage or Firestore
      const localLang = getStoredLanguage(user.uid);
      const firestoreLang = settings.preferredLanguage;
      const finalLang = firestoreLang || localLang || 'en-IN';

      const mergedSettings = { ...settings, preferredLanguage: finalLang };
      setUserSettings(mergedSettings);
      setStoredLanguage(finalLang, user.uid);
    } catch (err) {
      console.error('Error fetching user profile/settings:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Read local storage for this specific user immediately before network fetch finishes
        const userLocalLang = getStoredLanguage(user.uid);
        setUserSettings((prev) => ({ ...prev, preferredLanguage: userLocalLang }));
        await fetchUserData(user);
      } else {
        setUserProfile(null);
        const guestLang = getStoredLanguage(null);
        setUserSettings({ ...DEFAULT_USER_SETTINGS, preferredLanguage: guestLang });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
    const guestLang = getStoredLanguage(null);
    setUserSettings({ ...DEFAULT_USER_SETTINGS, preferredLanguage: guestLang });
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...userSettings, ...newSettings };
    setUserSettings(updated);

    if (newSettings.preferredLanguage) {
      setStoredLanguage(newSettings.preferredLanguage, currentUser?.uid);
      syncDocumentDirection(newSettings.preferredLanguage);
    }

    if (currentUser) {
      await updateFirestoreSettings(currentUser.uid, newSettings);
    }
  };

  const handleUpdateProfileName = async (newName: string) => {
    if (!currentUser) return;
    await updateFirestoreUserName(currentUser.uid, newName);
    await fetchUserData(currentUser);
  };

  const handleRefreshProfile = async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        userSettings,
        loading,
        logout: handleLogout,
        updateSettings: handleUpdateSettings,
        updateProfileName: handleUpdateProfileName,
        refreshProfile: handleRefreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
