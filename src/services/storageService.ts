/**
 * Firebase Storage Service
 * Handles secure file uploads for Crop Doctor images and Soil Report documents.
 * Isolates files by user UID: `users/{userId}/{folder}/{filename}`
 */
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../config/firebase';

export type UploadFolder = 'cropDoctor' | 'soilReports' | 'profile';

/**
 * Upload a file securely to the user's isolated storage folder
 */
export async function uploadUserFile(
  userId: string,
  file: File,
  folder: UploadFolder
): Promise<{ downloadUrl: string; storagePath: string }> {
  if (!userId) throw new Error('User ID is required for file upload');

  // Generate safe filename with timestamp
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `users/${userId}/${folder}/${timestamp}_${sanitizedName}`;

  const storageRef = ref(storage, storagePath);
  const metadata = {
    contentType: file.type,
    customMetadata: {
      userId,
      uploadedAt: new Date().toISOString(),
    },
  };

  const snapshot = await uploadBytes(storageRef, file, metadata);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return { downloadUrl, storagePath };
}

/**
 * Delete a user file from storage
 */
export async function deleteUserFile(storagePath: string): Promise<void> {
  const fileRef = ref(storage, storagePath);
  await deleteObject(fileRef);
}
