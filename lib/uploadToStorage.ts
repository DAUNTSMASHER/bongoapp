/**
 * Upload file to Firebase Storage. Returns public download URL.
 * Use in admin for cover images, video thumbnails.
 */

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fullPath = path.endsWith("/") ? `${path}${safeName}` : `${path}/${safeName}`;
  const storageRef = ref(storage, fullPath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
