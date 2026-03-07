import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Video } from "@/types/video";

export interface WatchedVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  outboundUrl: string;
  watchedAt: Date;
}

function watchedRef(userId: string) {
  return collection(db, "users", userId, "watchedVideos");
}

export async function addWatchedVideo(userId: string, video: Video): Promise<void> {
  const ref = doc(db, "users", userId, "watchedVideos", video.id);
  await setDoc(ref, {
    videoId: video.id,
    title: video.title,
    thumbnailUrl: video.thumbnailUrl,
    outboundUrl: video.outboundUrl,
    watchedAt: serverTimestamp(),
  });
}

export async function getWatchedVideos(userId: string, max = 50): Promise<WatchedVideo[]> {
  const q = query(
    watchedRef(userId),
    orderBy("watchedAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      videoId: data.videoId,
      title: data.title,
      thumbnailUrl: data.thumbnailUrl,
      outboundUrl: data.outboundUrl,
      watchedAt: data.watchedAt?.toDate?.() ?? new Date(),
    };
  });
}
