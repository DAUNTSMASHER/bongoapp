"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { INITIAL_ADMIN_EMAIL } from "@/lib/adminAuth";

const ADMINS_DOC = "config/admins";

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  const loadAdmins = async (isRefresh = false) => {
    if (!user || !auth.currentUser) {
      if (!isRefresh) setLoading(false);
      return;
    }
    try {
      const ref = doc(db, ADMINS_DOC);
      const snap = await getDoc(ref);
      const emails: string[] = snap.exists() ? snap.data()?.emails ?? [] : [];
      setAdminEmails(emails);
    } catch {
      setAdminEmails([]);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !auth.currentUser) {
      setLoading(false);
      return;
    }
    loadAdmins();
    const t = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(t);
  }, [user]);

  const isAdmin =
    user?.email != null &&
    (user.email === INITIAL_ADMIN_EMAIL || adminEmails.includes(user.email));

  return { user, isAdmin, adminEmails, loading, refreshAdmins: () => loadAdmins(true) };
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function addAdminEmail(newEmail: string) {
  const ref = doc(db, ADMINS_DOC);
  const snap = await getDoc(ref);
  const emails: string[] = snap.exists() ? snap.data()?.emails ?? [] : [];
  const normalized = newEmail.trim().toLowerCase();
  if (emails.includes(normalized)) return;
  if (normalized === INITIAL_ADMIN_EMAIL) return;
  await setDoc(ref, { emails: [...emails, normalized] });
}
