import React, { createContext, useContext, useEffect, useState } from "react";

export const PALETTES = {
  slate:    { label: "Slate",    filter: "",                                  bg: "#21262e", accent: "#525f72" },
  sapphire: { label: "Sapphire", filter: "hue-rotate(0deg) saturate(1.5)",    bg: "#1a273a", accent: "#406191" },
  indigo:   { label: "Indigo",   filter: "hue-rotate(32deg) saturate(1.1)",   bg: "#262337", accent: "#5f5989" },
  azure:    { label: "Azure",    filter: "hue-rotate(342deg) saturate(1.25)", bg: "#172833", accent: "#39657f" },
  sky:      { label: "Sky",      filter: "hue-rotate(330deg) saturate(1.2)",  bg: "#15292f", accent: "#356776" },
  teal:     { label: "Teal",     filter: "hue-rotate(313deg) saturate(1.15)", bg: "#142a2a", accent: "#316a68" },
  jade:     { label: "Jade",     filter: "hue-rotate(292deg) saturate(1.1)",  bg: "#142b23", accent: "#326b58" },
  emerald:  { label: "Emerald",  filter: "hue-rotate(276deg) saturate(1.1)",  bg: "#162b1e", accent: "#366b4c" },
  green:    { label: "Green",    filter: "hue-rotate(258deg) saturate(1.05)", bg: "#192a1a", accent: "#3f6a42" },
  lime:     { label: "Lime",     filter: "hue-rotate(235deg) saturate(1)",    bg: "#1f2917", accent: "#4d663a" },
  gold:     { label: "Gold",     filter: "hue-rotate(194deg) saturate(1.1)",  bg: "#2a2615", accent: "#695e34" },
  amber:    { label: "Amber",    filter: "hue-rotate(183deg) saturate(1.15)", bg: "#2e2515", accent: "#725c35" },
  orange:   { label: "Orange",   filter: "hue-rotate(167deg) saturate(1.2)",  bg: "#322317", accent: "#7e583b" },
  scarlet:  { label: "Scarlet",  filter: "hue-rotate(146deg) saturate(1.2)",  bg: "#36211d", accent: "#885349" },
  crimson:  { label: "Crimson",  filter: "hue-rotate(126deg) saturate(1.1)",  bg: "#372024", accent: "#895159" },
  rose:     { label: "Rose",     filter: "hue-rotate(107deg) saturate(1.15)", bg: "#372029", accent: "#8a4f68" },
  pink:     { label: "Pink",     filter: "hue-rotate(93deg) saturate(1.2)",   bg: "#36202e", accent: "#884f73" },
  magenta:  { label: "Magenta",  filter: "hue-rotate(76deg) saturate(1.1)",   bg: "#322031", accent: "#7d517c" },
  purple:   { label: "Purple",   filter: "hue-rotate(64deg) saturate(1.05)",  bg: "#2f2133", accent: "#755380" },
  violet:   { label: "Violet",   filter: "hue-rotate(49deg) saturate(1)",     bg: "#2b2234", accent: "#6b5683" },
} as const;

export type PaletteName = keyof typeof PALETTES;
export type ColorMode = "dark" | "light";

const LIGHT_BASE = "invert(1) hue-rotate(180deg)";

function buildFilter(palette: PaletteName, mode: ColorMode): string {
  const paletteFilter = PALETTES[palette].filter;
  if (mode === "light") {
    return paletteFilter ? `${LIGHT_BASE} ${paletteFilter}` : LIGHT_BASE;
  }
  return paletteFilter || "none";
}

// Produces a CSS filter that exactly cancels `filter` when applied to a child of
// the element carrying `filter`. Used to keep anatomy colors true regardless of
// the global palette/light-mode filter applied at the app root.
function invertFilter(filter: string): string {
  if (!filter || filter === "none") return "none";
  const tokens = filter.match(/[\w-]+\([^)]*\)/g) || [];
  const inverted = tokens.map((t) => {
    const m = t.match(/^([\w-]+)\(([^)]*)\)$/);
    if (!m) return t;
    const fn = m[1];
    const arg = m[2].trim();
    if (fn === "hue-rotate") return `hue-rotate(${-(parseFloat(arg) || 0)}deg)`;
    if (fn === "saturate") {
      const s = parseFloat(arg) || 1;
      return `saturate(${s === 0 ? 0 : 1 / s})`;
    }
    if (fn === "brightness") {
      const b = parseFloat(arg) || 1;
      return `brightness(${b === 0 ? 0 : 1 / b})`;
    }
    if (fn === "invert") return `invert(${arg})`;
    return t;
  });
  return inverted.reverse().join(" ");
}

interface PaletteContextType {
  palette: PaletteName;
  setPalette: (p: PaletteName) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  filter: string;
  inverseFilter: string;
  swatchFilter: (p: PaletteName) => string;
}

const PaletteContext = createContext<PaletteContextType>({
  palette: "slate",
  setPalette: () => {},
  colorMode: "dark",
  setColorMode: () => {},
  filter: "none",
  inverseFilter: "none",
  swatchFilter: () => "none",
});

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteName>(() => {
    const stored = localStorage.getItem("anatomix_palette") as PaletteName | null;
    return stored && Object.hasOwn(PALETTES, stored) ? stored : "slate";
  });

  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const stored = localStorage.getItem("anatomix_color_mode") as ColorMode | null;
    return stored === "light" ? "light" : "dark";
  });

  const setPalette = (p: PaletteName) => {
    setPaletteState(p);
    localStorage.setItem("anatomix_palette", p);
  };

  const setColorMode = (m: ColorMode) => {
    setColorModeState(m);
    localStorage.setItem("anatomix_color_mode", m);
  };

  const swatchFilter = (p: PaletteName) => buildFilter(p, colorMode);

  return (
    <PaletteContext.Provider value={{
      palette, setPalette,
      colorMode, setColorMode,
      filter: buildFilter(palette, colorMode),
      inverseFilter: invertFilter(buildFilter(palette, colorMode)),
      swatchFilter,
    }}>
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
