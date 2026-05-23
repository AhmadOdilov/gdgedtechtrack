import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Theme } from "../types";
import { loadJSON, saveJSON } from "../utils/storage";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeState | null>(null);

function initialTheme(): Theme {
  const stored = loadJSON<Theme | null>("ec_theme", null);
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches)
    return "dark";
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    saveJSON("ec_theme", theme);
    const id = setTimeout(() => root.classList.remove("theme-anim"), 450);
    return () => clearTimeout(id);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return <Ctx.Provider value={{ theme, toggleTheme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
