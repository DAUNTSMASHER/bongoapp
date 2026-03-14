"use client";

import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { THEMES } from "@/lib/themes";

export default function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
        Theme
      </h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {THEMES.map((t) => {
          const isActive = themeId === t.id;
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 transition-all ${
                isActive
                  ? "border-[var(--primary)] bg-transparent"
                  : "border-white/10 bg-transparent hover:border-white/20"
              }`}
              title={t.name}
            >
              {isActive && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--primary)]" />
              )}
              <span className="text-2xl">{t.emoji}</span>
              <span
                className={`text-xs font-semibold ${
                  isActive ? "text-[var(--primary)]" : "text-white/90"
                }`}
              >
                {t.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
