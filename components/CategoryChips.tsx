"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/stories";

export default function CategoryChips() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="px-4 py-3"
      aria-label="Categories"
    >
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(({ slug, label }, i) => (
          <motion.div
            key={slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.03 }}
          >
            <Link
              href={`/categories/${slug}`}
              className="block shrink-0 rounded px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
