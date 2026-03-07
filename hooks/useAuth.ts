"use client";

import {
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminAuth } from "./useAdminAuth";

/** Can use Archive: Google signed-in or Admin. Anonymous cannot. */
export function useAuth() {
  const { user, isAdmin, loading } = useAdminAuth();
  const isAnonymous = user?.isAnonymous === true;
  const isGoogleUser =
    user != null &&
    !user.isAnonymous &&
    user.providerData?.some((p) => p?.providerId === "google.com");
  const canUseArchive = !isAnonymous && (isGoogleUser || isAdmin);

  return {
    user,
    isAnonymous,
    isGoogleUser,
    isAdmin,
    canUseArchive,
    loading,
  };
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signInAnonymouslyUser() {
  return signInAnonymously(auth);
}

export async function signOut() {
  return firebaseSignOut(auth);
}
