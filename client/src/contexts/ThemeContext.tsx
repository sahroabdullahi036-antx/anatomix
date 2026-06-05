import React, { createContext, useContext, useEffect, useState } from "react";

export const PALETTES = {
  slate:   { label: "Slate",   filter: "none",                                          bg: "#252830", accent: "#4a6080" },
  ocean:   { label: "Ocean",   filter: "hue-rotate(25deg) saturate(1.15)",              bg: "#1e2838", accent: "#3a6090" },
  emerald: { label: "Emerald", filter: "hue-rotate(88deg) saturate(0.85)",              bg: "#1e2820", accent: "#3a7050" },
  violet:  { label: "Violet",  filter: "hue-rotate(258deg) saturate(0.9)",              bg: "#251e30", accent: "#6050a0" },
  crimson: { label: "Crimson", filter: "hue-rotate(330deg) saturate(0.88)",             bg: "#2a1e1e", accent: "#803040" },
  desert:  { label: "Desert",  filter: "hue-rotate(42deg) saturate(0.72) brightness(0.96)", bg: "#282418", accent: "#806030" },
} as const;

export type PaletteName = keyof typeof PALETTES;

interface PaletteContextType {
  palette: PaletteName;
  setPalette: (p: PaletteName) => void;
  filter: string;
}

const PaletteContext = createContext<PaletteContextType>({
  palette: "slate",
  setPalette: () => {},
  filter: "none",
});

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteName>(() => {
    const stored = localStorage.getItem("anatomix_palette") as PaletteName | null;
    return stored && stored in PALETTES ? stored : "slate";
  });

  const setPalette = (p: PaletteName) => {
    setPaletteState(p);
    localStorage.setItem("anatomix_palette", p);
  };

  return (
    <PaletteContext.Provider value={{ palette, setPalette, filter: PALETTES[palette].filter }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  return useContext(PaletteContext);
}

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    if (switchable) localStorage.setItem("theme", theme);
  }, [theme, switchable]);

  const toggleTheme = switchable ? () => setTheme(prev => prev === "light" ? "dark" : "light") : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
