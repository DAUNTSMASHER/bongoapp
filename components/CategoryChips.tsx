"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/stories";

const TOP_CATEGORIES = 6;

export default function CategoryChips() {
  const top = CATEGORIES.slice(0, TOP_CATEGORIES);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="py-4 md:py-6 lg:py-8"
      aria-label="Categories"
    >
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {top.map(({ slug, label }, i) => (
          <motion.div
            key={slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.03 }}
          >
            <Link
              href={`/categories/${slug}`}
              className="font-bangla block shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:text-white md:px-5 md:py-3 md:text-base"
            >
              {label}
            </Link>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + TOP_CATEGORIES * 0.03 }}
        >
          <Link
            href="/categories"
            className="font-bangla block shrink-0 rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white md:px-6 md:py-3 md:text-base"
          >
            আরও
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
