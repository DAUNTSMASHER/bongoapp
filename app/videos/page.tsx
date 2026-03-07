import { Suspense } from "react";
import VideosPageClient from "@/components/VideosPageClient";

export default function VideosPage() {
  return (
    <Suspense fallback={<p className="font-bangla text-white/60 p-6">লোড হচ্ছে...</p>}>
      <VideosPageClient />
    </Suspense>
  );
}
