"use client";

import { motion, AnimatePresence } from "framer-motion";

interface PageStuckBannerProps {
  show: boolean;
  onRefresh: () => void;
}

export default function PageStuckBanner({ show, onRefresh }: PageStuckBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3"
        >
          <p className="font-bangla text-center text-sm text-amber-200">
            পেজ স্টাক হয়ে গেছে। রিফ্রেশ করুন
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg bg-amber-500/90 px-5 py-2 font-bangla text-sm font-medium text-black transition-colors hover:bg-amber-500"
          >
            রিফ্রেশ করুন
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
