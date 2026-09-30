/**
 * Farm Management Service
 * Strictly enforces multi-user data isolation by scoping all queries to the authenticated user's UID.
 */
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Farm } from '../types/models';

const FARMS_COLLECTION = 'farms';

/**
 * Get all farms belonging strictly to the authenticated user
 */
export async function getUserFarms(userId: string): Promise<Farm[]> {
  if (!userId) throw new Error('User ID is required to fetch farms');

  const q = query(
    collection(db, FARMS_COLLECTION),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Farm, 'id'>),
  }));
}

/**
 * Create a new farm plot for the authenticated user
 */
export async function createFarm(farmData: Omit<Farm, 'id'>): Promise<Farm> {
  if (!farmData.userId) throw new Error('Cannot create farm without user ID');

  const payload: Record<string, any> = {
    ...farmData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (farmData.waterSource === 'Other') {
    payload.waterSourceOther = farmData.waterSourceOther?.trim() || '';
  } else {
    delete payload.waterSourceOther;
  }

  // Strip all undefined properties to prevent Firestore invalid data errors
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  const docRef = await addDoc(collection(db, FARMS_COLLECTION), payload);

  return {
    id: docRef.id,
    ...farmData,
  };
}

/**
 * Update an existing farm plot (security rules ensure only owner can update)
 */
export async function updateFarm(
  farmId: string,
  data: Partial<Farm>
): Promise<void> {
  const farmRef = doc(db, FARMS_COLLECTION, farmId);

  const updateData: Record<string, any> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if ('waterSource' in data) {
    if (data.waterSource === 'Other') {
      updateData.waterSourceOther = data.waterSourceOther?.trim() || '';
    } else {
      updateData.waterSourceOther = deleteField();
    }
  }

  // Strip all undefined properties to prevent Firestore updateDoc errors
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  await updateDoc(farmRef, updateData);
}

/**
 * Delete a farm plot (security rules ensure only owner can delete)
 */
export async function deleteFarm(farmId: string): Promise<void> {
  const farmRef = doc(db, FARMS_COLLECTION, farmId);
  await deleteDoc(farmRef);
}
