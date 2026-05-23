import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { ACHIEVEMENTS, buildLeaderboard } from "../utils/gameData";
import type { LeaderboardEntry } from "../types";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import AchievementBadge from "../components/ui/Badge";
import { Crown, Medal, Star } from "../components/icons";
import { fadeUp, staggerContainer } from "../animations/variants";
import { cn } from "../utils/cn";

export default function Leaderboard() {
  const { t, lang, xp, unlocked } = useApp();
  const [mode, setMode] = useState<"weekly" | "all">("all");

  const entries = useMemo(() => {
    const base = buildLeaderboard(t("lb.you"), xp);
    return [...base].sort((a, b) => (mode === "weekly" ? b.weekly - a.weekly : b.xp - a.xp));
  }, [t, xp, mode]);

  const top = entries.slice(0, 3);
  const rest = entries.slice(3);
  const maxVal = Math.max(...entries.map((e) => (mode === "weekly" ? e.weekly : e.xp)), 1);
  const val = (e: LeaderboardEntry) => (mode === "weekly" ? e.weekly : e.xp);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <motion.div variants={fadeUp} className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink dark:text-slate-100 flex items-center gap-2">
            <Crown width={26} height={26} className="text-tangerine" /> {t("lb.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">{t("lb.subtitle")}</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          {(["all", "weekly"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("px-4 py-2 rounded-xl text-sm font-extrabold transition-colors", mode === m ? "bg-white dark:bg-grape text-grape dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400")}>
              {m === "all" ? t("lb.allTime") : t("lb.weekly")}
            </button>
          ))}
        </div>
      </motion.div>

      {/* podium */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 items-end">
        {[1, 0, 2].map((idx) => {
          const e = top[idx];
          if (!e) return <div key={idx} />;
          const place = idx + 1;
          const h = place === 1 ? "h-28" : place === 2 ? "h-20" : "h-16";
          const ring = place === 1 ? "ring-tangerine" : place === 2 ? "ring-slate-300" : "ring-amber-700";
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * place }} className="flex flex-col items-center">
              <div className={cn("relative grid place-items-center h-14 w-14 rounded-2xl text-3xl bg-white dark:bg-slate-800 ring-4", ring, e.isYou && "outline outline-2 outline-grape")}>
                {e.avatar}
                {place === 1 && <Crown width={20} height={20} className="absolute -top-3 text-tangerine" />}
              </div>
              <p className="mt-1.5 font-extrabold text-sm text-ink dark:text-slate-100 truncate max-w-full">{e.name}</p>
              <p className="text-[12px] font-bold text-grape dark:text-grape-light">{val(e)} {mode === "weekly" ? "" : "XP"}</p>
              <div className={cn("mt-1 w-full rounded-t-xl bg-gradient-to-t from-grape to-grape-light grid place-items-start justify-center pt-1.5", h)}>
                <span className="font-display font-bold text-white text-lg">{place}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* rest list */}
      <motion.div variants={fadeUp}>
        <Card className="divide-y divide-slate-100 dark:divide-slate-700">
          {rest.map((e, i) => {
            const place = i + 4;
            return (
              <motion.div key={e.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn("flex items-center gap-3 p-3.5", e.isYou && "bg-violet-50 dark:bg-grape/15 rounded-2xl")}>
                <span className="grid place-items-center h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-extrabold text-slate-500 dark:text-slate-300 shrink-0">{place}</span>
                <span className="text-2xl shrink-0">{e.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-ink dark:text-slate-100 truncate">{e.name}</p>
                    {e.isYou && <span className="rounded-full bg-grape text-white text-[10px] font-extrabold px-2 py-0.5">{t("lb.you")}</span>}
                  </div>
                  <ProgressBar value={val(e) / maxVal} className="mt-1" height="h-1.5" barClassName="bg-grape" delay={i * 0.04} />
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-grape dark:text-grape-light flex items-center gap-1 justify-end"><Star width={14} height={14} />{val(e)}</p>
                  <p className="text-[11px] font-bold text-green-600 dark:text-neon-light">+{e.weekly} {t("lb.delta")}</p>
                </div>
              </motion.div>
            );
          })}
        </Card>
      </motion.div>

      {/* badges */}
      <motion.div variants={fadeUp}>
        <h2 className="font-display font-bold text-xl text-ink dark:text-slate-100 flex items-center gap-2 mb-3">
          <Medal width={20} height={20} className="text-tangerine" /> {t("lb.badges")}
          <span className="text-sm font-bold text-slate-400">({unlocked.length}/{ACHIEVEMENTS.length})</span>
        </h2>
        <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map((a) => (
            <AchievementBadge key={a.id} achievement={a} lang={lang} unlocked={unlocked.includes(a.id)} lockedLabel={t("lb.locked")} />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
