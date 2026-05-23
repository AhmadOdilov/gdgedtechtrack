import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useSound } from "../hooks/useSound";
import { LANGS } from "../i18n";
import type { Lang, Role } from "../types";
import { Gear, Globe, Crystal, Star, Users, Camera, Crown, Sparkle, Sun, Moon } from "./icons";
import { cn } from "../utils/cn";

const ROLE_ICON: Record<Role, (p: any) => JSX.Element> = {
  teacher: Users,
  student: Camera,
  review: Sparkle,
  leaderboard: Crown,
};

export default function Navbar() {
  const { t, role, setRole, lang, setLang, xp, crystals, level, setSettingsOpen, hasKey } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { push } = useToast();
  const play = useSound();
  const [langOpen, setLangOpen] = useState(false);

  const roles: { id: Role; label: string }[] = [
    { id: "teacher", label: t("nav.teacher") },
    { id: "student", label: t("nav.student") },
    { id: "review", label: t("nav.review") },
    { id: "leaderboard", label: t("nav.leaderboard") },
  ];

  const go = (r: Role) => {
    play("click");
    setRole(r);
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    setLangOpen(false);
    play("pop");
    push("info", t("toast.langChanged", { lang: l.toUpperCase() }));
  };

  const flipTheme = () => {
    toggleTheme();
    play("pop");
    push("info", theme === "dark" ? t("toast.themeLight") : t("toast.themeDark"));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Brand */}
          <button onClick={() => go("teacher")} className="flex items-center gap-2.5 shrink-0 group" aria-label="EduCheck AI home">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-grape studs brick-shadow-sm text-white font-display text-xl group-hover:rotate-6 transition-transform">
              E
            </span>
            <span className="hidden sm:block text-left leading-tight">
              <span className="block font-display font-bold text-lg text-ink dark:text-slate-100">EduCheck AI</span>
              <span className="block text-[11px] font-bold text-grape dark:text-grape-light -mt-0.5">by Mindset-21</span>
            </span>
          </button>

          {/* Role tabs (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
            {roles.map((r) => {
              const Icon = ROLE_ICON[r.id];
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => go(r.id)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors",
                    active ? "text-grape dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="navpill"
                      className="absolute inset-0 rounded-xl bg-white dark:bg-grape shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon width={17} height={17} />
                    {r.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:flex items-center gap-1.5">
              <Badge color="text-tangerine-dark bg-orange-50 dark:bg-tangerine/10" icon={<Star width={15} height={15} />}>{xp}</Badge>
              <Badge color="text-grape dark:text-grape-light bg-violet-50 dark:bg-grape/15" icon={<Crystal width={15} height={15} />}>{crystals}</Badge>
              <span className="hidden xl:grid place-items-center h-7 px-2 rounded-full bg-neon/15 text-[12px] font-extrabold text-green-700 dark:text-neon-light">Lv {level}</span>
            </div>

            {/* theme toggle */}
            <button
              onClick={flipTheme}
              className="grid place-items-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-grape transition-colors"
              aria-label={theme === "dark" ? t("nav.toLight") : t("nav.toDark")}
              title={theme === "dark" ? t("nav.toLight") : t("nav.toDark")}
            >
              <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
                {theme === "dark" ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
              </motion.span>
            </button>

            {/* language */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                onBlur={() => setTimeout(() => setLangOpen(false), 150)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-grape-light transition-colors"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                <Globe width={16} height={16} className="text-grape dark:text-grape-light" />
                <span className="uppercase">{lang}</span>
              </button>
              {langOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl z-50"
                  role="listbox"
                >
                  {LANGS.map((l) => (
                    <li key={l.code}>
                      <button
                        onMouseDown={() => switchLang(l.code)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors",
                          lang === l.code ? "bg-violet-50 dark:bg-grape/20 text-grape dark:text-grape-light" : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        )}
                        role="option"
                        aria-selected={lang === l.code}
                      >
                        <span className="text-base">{l.flag}</span>
                        {l.label}
                        <span className="ml-auto text-[11px] uppercase text-slate-400">{l.code}</span>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>

            {/* settings */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="relative grid place-items-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-grape transition-colors"
              aria-label={t("nav.settings")}
              title={t("nav.settings")}
            >
              <Gear width={18} height={18} />
              <span className={cn("absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900", hasKey ? "bg-neon" : "bg-tangerine")} />
            </button>
          </div>
        </div>

        {/* Role tabs (mobile / tablet) */}
        <nav className="lg:hidden flex items-center gap-1 pb-2 -mt-1 overflow-x-auto">
          {roles.map((r) => {
            const Icon = ROLE_ICON[r.id];
            const active = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => go(r.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-bold whitespace-nowrap transition-all",
                  active ? "bg-grape text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}
              >
                <Icon width={15} height={15} />
                {r.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Badge({ children, icon, color }: { children: React.ReactNode; icon: React.ReactNode; color: string }) {
  return <span className={cn("flex items-center gap-1 h-7 px-2 rounded-full text-[12px] font-extrabold", color)}>{icon}{children}</span>;
}
