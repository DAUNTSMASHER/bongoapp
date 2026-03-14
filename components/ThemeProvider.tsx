"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";
import { THEMES, type ThemeId, type ThemeTemplate } from "@/lib/themes";

const STORAGE_KEY = "stories-theme";

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeTemplate;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("netflix");
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const setTheme = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  // Lock to Netflix theme – ignore localStorage
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
  //   if (stored && THEMES.some((t) => t.id === stored)) {
  //     setThemeIdState(stored);
  //   }
  // }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme.id === "netflix" ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const t = isDark ? theme.dark : theme.light;
    root.style.setProperty("--primary", t.primary);
    root.style.setProperty("--primary-hover", t.primaryHover);
    root.style.setProperty("--primary-light", t.primaryLight);
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-gradient", t.accentGradient);
    root.classList.toggle("theme-netflix", theme.id === "netflix");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
