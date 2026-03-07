export type ThemeId =
  | "netflix"
  | "coral"
  | "ocean"
  | "sunset"
  | "forest"
  | "violet"
  | "mint"
  | "amber";

export interface ThemeTemplate {
  id: ThemeId;
  name: string;
  emoji: string;
  light: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    accent: string;
    accentGradient: string;
  };
  dark: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    accent: string;
    accentGradient: string;
  };
}

export const THEMES: ThemeTemplate[] = [
  {
    id: "netflix",
    name: "Netflix",
    emoji: "🎬",
    light: {
      primary: "#E50914",
      primaryHover: "#f40612",
      primaryLight: "#1a1a1a",
      accent: "#564d4d",
      accentGradient: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
    },
    dark: {
      primary: "#E50914",
      primaryHover: "#f40612",
      primaryLight: "#1a1a1a",
      accent: "#564d4d",
      accentGradient: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
    },
  },
  {
    id: "coral",
    name: "Coral",
    emoji: "🪸",
    light: {
      primary: "#e63946",
      primaryHover: "#d62839",
      primaryLight: "#fff5f5",
      accent: "#f4a261",
      accentGradient: "linear-gradient(135deg, #e63946 0%, #f4a261 100%)",
    },
    dark: {
      primary: "#f87171",
      primaryHover: "#fca5a5",
      primaryLight: "#450a0a",
      accent: "#fdba74",
      accentGradient: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    light: {
      primary: "#0284c7",
      primaryHover: "#0369a1",
      primaryLight: "#f0f9ff",
      accent: "#06b6d4",
      accentGradient: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
    },
    dark: {
      primary: "#38bdf8",
      primaryHover: "#7dd3fc",
      primaryLight: "#0c4a6e",
      accent: "#22d3ee",
      accentGradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    light: {
      primary: "#ea580c",
      primaryHover: "#c2410c",
      primaryLight: "#fff7ed",
      accent: "#f59e0b",
      accentGradient: "linear-gradient(135deg, #ea580c 0%, #f59e0b 50%, #ec4899 100%)",
    },
    dark: {
      primary: "#fb923c",
      primaryHover: "#fdba74",
      primaryLight: "#431407",
      accent: "#fbbf24",
      accentGradient: "linear-gradient(135deg, #f97316 0%, #e879f9 100%)",
    },
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌲",
    light: {
      primary: "#059669",
      primaryHover: "#047857",
      primaryLight: "#f0fdf4",
      accent: "#10b981",
      accentGradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    },
    dark: {
      primary: "#34d399",
      primaryHover: "#6ee7b7",
      primaryLight: "#052e16",
      accent: "#5eead4",
      accentGradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    },
  },
  {
    id: "violet",
    name: "Violet",
    emoji: "💜",
    light: {
      primary: "#7c3aed",
      primaryHover: "#6d28d9",
      primaryLight: "#f5f3ff",
      accent: "#a78bfa",
      accentGradient: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    },
    dark: {
      primary: "#a78bfa",
      primaryHover: "#c4b5fd",
      primaryLight: "#2e1065",
      accent: "#c084fc",
      accentGradient: "linear-gradient(135deg, #8b5cf6 0%, #f472b6 100%)",
    },
  },
  {
    id: "mint",
    name: "Mint",
    emoji: "🍃",
    light: {
      primary: "#14b8a6",
      primaryHover: "#0d9488",
      primaryLight: "#f0fdfa",
      accent: "#2dd4bf",
      accentGradient: "linear-gradient(135deg, #14b8a6 0%, #34d399 100%)",
    },
    dark: {
      primary: "#2dd4bf",
      primaryHover: "#5eead4",
      primaryLight: "#134e4a",
      accent: "#5eead4",
      accentGradient: "linear-gradient(135deg, #0d9488 0%, #10b981 100%)",
    },
  },
  {
    id: "amber",
    name: "Amber",
    emoji: "✨",
    light: {
      primary: "#d97706",
      primaryHover: "#b45309",
      primaryLight: "#fffbeb",
      accent: "#f59e0b",
      accentGradient: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
    },
    dark: {
      primary: "#f59e0b",
      primaryHover: "#fbbf24",
      primaryLight: "#451a03",
      accent: "#fcd34d",
      accentGradient: "linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)",
    },
  },
];
