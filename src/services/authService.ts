/**
 * Authentication Service for FarmHelper
 * Handles Firebase Auth methods: Email/Password, Mobile OTP, Google, and Sign Out.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { UserProfile, UserSettings } from '../types/models';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  preferredLanguage: 'en',
  landAreaUnit: 'Acre',
  weightUnit: 'Quintal',
  temperatureScale: 'Celsius',
  emailNotifications: true,
  pushNotifications: false,
  notificationEmail: null,
};

/**
 * Register user with Email and Password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  fullName: string,
  mobileNumber?: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = credential.user;

  await updateProfile(user, { displayName: fullName });

  // Initialize user profile in Firestore
  const userRef = doc(db, 'users', user.uid);
  const profile: UserProfile = {
    uid: user.uid,
    fullName,
    email: user.email,
    mobileNumber: mobileNumber || null,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);

  // Initialize default user settings
  const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
  await setDoc(settingsRef, DEFAULT_USER_SETTINGS);

  return user;
}

/**
 * Sign in user with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;

  // Sync or create user profile in Firestore
  const userRef = doc(db, 'users', user.uid);
  const existingDoc = await getDoc(userRef);

  if (!existingDoc.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      fullName: user.displayName || 'Farmer',
      email: user.email,
      mobileNumber: user.phoneNumber || null,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, profile);

    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    await setDoc(settingsRef, DEFAULT_USER_SETTINGS);
  } else {
    await updateDoc(userRef, { updatedAt: serverTimestamp() });
  }

  return user;
}

/**
 * Initialize reCAPTCHA verifier for Phone Auth
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
  });
}

/**
 * Send OTP to Mobile Number
 */
export async function sendMobileOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/^0+/, '')}`;
  return await signInWithPhoneNumber(auth, formattedNumber, verifier);
}

/**
 * Sign out the currently authenticated user
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
}

/**
 * Fetch user settings from Firestore
 */
export async function getUserSettings(uid: string): Promise<UserSettings> {
  const settingsDoc = await getDoc(doc(db, 'users', uid, 'settings', 'preferences'));
  if (settingsDoc.exists()) {
    return settingsDoc.data() as UserSettings;
  }
  return DEFAULT_USER_SETTINGS;
}

/**
 * Update user settings in Firestore
 */
export async function updateUserSettings(
  uid: string,
  settings: Partial<UserSettings>
): Promise<void> {
  const settingsRef = doc(db, 'users', uid, 'settings', 'preferences');
  await setDoc(settingsRef, settings, { merge: true });
}

/**
 * Update user full name in Firestore and sync Firebase Auth displayName
 */
export async function updateUserName(uid: string, newName: string): Promise<void> {
  const trimmedName = newName.trim();
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
    throw new Error('Name must be between 2 and 50 characters.');
  }

  // Update Firestore profile document
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    fullName: trimmedName,
    updatedAt: serverTimestamp(),
  });

  // Sync Firebase Auth profile displayName
  if (auth.currentUser && auth.currentUser.uid === uid) {
    await updateProfile(auth.currentUser, { displayName: trimmedName });
  }
}

