import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AIResult, Lang, Provider, Role } from "../types";
import { translate } from "../i18n";
import { DEFAULT_MODELS } from "../api/prompt";
import { loadJSON, saveJSON } from "../utils/storage";
import { XP_PER_LEVEL } from "../utils/gameData";

const ENV_OPENAI = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ?? "";
const ENV_GEMINI = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? "";

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;

  role: Role;
  setRole: (r: Role) => void;

  provider: Provider;
  setProvider: (p: Provider) => void;
  openaiKey: string;
  setOpenaiKey: (k: string) => void;
  geminiKey: string;
  setGeminiKey: (k: string) => void;
  model: string;
  setModel: (m: string) => void;
  /** key for the currently-active provider */
  activeKey: string;
  hasKey: boolean;

  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;

  xp: number;
  crystals: number;
  level: number;
  unlocked: string[];
  addReward: (xp: number, crystals: number) => void;
  unlockAchievements: (ids: string[]) => void;

  lastResult: AIResult | null;
  setLastResult: (r: AIResult | null) => void;

  studentUnlocked: boolean;
  setStudentUnlocked: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadJSON<Lang>("ec_lang", "en"));
  const [role, setRole] = useState<Role>("teacher");

  const [provider, setProvider] = useState<Provider>(() => loadJSON<Provider>("ec_provider", "openai"));
  const [openaiKey, setOpenaiKey] = useState<string>(() => loadJSON<string>("ec_openaiKey", ENV_OPENAI));
  const [geminiKey, setGeminiKey] = useState<string>(() => loadJSON<string>("ec_geminiKey", ENV_GEMINI));
  const [model, setModel] = useState<string>(() => loadJSON<string>("ec_model", DEFAULT_MODELS.openai));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [xp, setXp] = useState<number>(() => loadJSON<number>("ec_xp", 120));
  const [crystals, setCrystals] = useState<number>(() => loadJSON<number>("ec_crystals", 8));
  const [unlocked, setUnlocked] = useState<string[]>(() => loadJSON<string[]>("ec_unlocked", []));
  const [lastResult, setLastResult] = useState<AIResult | null>(null);
  const [studentUnlocked, setStudentUnlocked] = useState(false);

  useEffect(() => saveJSON("ec_lang", lang), [lang]);
  useEffect(() => saveJSON("ec_provider", provider), [provider]);
  useEffect(() => saveJSON("ec_openaiKey", openaiKey), [openaiKey]);
  useEffect(() => saveJSON("ec_geminiKey", geminiKey), [geminiKey]);
  useEffect(() => saveJSON("ec_model", model), [model]);
  useEffect(() => saveJSON("ec_xp", xp), [xp]);
  useEffect(() => saveJSON("ec_crystals", crystals), [crystals]);
  useEffect(() => saveJSON("ec_unlocked", unlocked), [unlocked]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );
  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const addReward = useCallback((dxp: number, dcr: number) => {
    setXp((x) => x + dxp);
    setCrystals((c) => c + dcr);
  }, []);

  const unlockAchievements = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setUnlocked((prev) => Array.from(new Set([...prev, ...ids])));
  }, []);

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const activeKey = provider === "openai" ? openaiKey : geminiKey;
  const hasKey = activeKey.trim().length > 0;

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      t,
      role,
      setRole,
      provider,
      setProvider,
      openaiKey,
      setOpenaiKey,
      geminiKey,
      setGeminiKey,
      model,
      setModel,
      activeKey,
      hasKey,
      settingsOpen,
      setSettingsOpen,
      xp,
      crystals,
      level,
      unlocked,
      addReward,
      unlockAchievements,
      lastResult,
      setLastResult,
      studentUnlocked,
      setStudentUnlocked,
    }),
    [lang, setLang, t, role, provider, openaiKey, geminiKey, model, activeKey, hasKey, settingsOpen, xp, crystals, level, unlocked, addReward, unlockAchievements, lastResult, studentUnlocked]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
