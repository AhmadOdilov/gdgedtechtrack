import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useApp } from "../context/AppContext";
import { ACHIEVEMENTS, REWARD_CRYSTALS, REWARD_XP } from "../utils/gameData";
import type { AIResult, AIFlaggedStep } from "../types";
import Mascot from "../components/Mascot";
import TreasureChest from "../components/TreasureChest";
import Particles from "../components/Particles";
import Button from "../components/ui/Button";
import { Crystal, Star, Trophy, Check, Sparkle, Bolt, Crown } from "../components/icons";
import { fadeUp, staggerContainer } from "../animations/variants";
import { cn } from "../utils/cn";

export default function AIReview() {
  const { t, lastResult, setRole } = useApp();

  if (!lastResult) {
    return (
      <div className="min-h-[calc(100vh-4rem)] grid place-items-center bg-gradient-to-b from-violet-50 to-orange-50/40 dark:from-slate-900 dark:to-slate-900 px-4 py-10">
        <div className="text-center max-w-md">
          <div className="anim-float inline-block"><Mascot size={120} /></div>
          <h2 className="font-display font-bold text-2xl text-grape dark:text-grape-light mt-3">{t("review.empty")}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1">{t("review.emptySub")}</p>
          <Button variant="grape" size="lg" brick className="mt-6" onClick={() => setRole("student")}>
            <Sparkle width={18} height={18} />{t("review.goScan")}
          </Button>
        </div>
      </div>
    );
  }
  return <Result result={lastResult} />;
}

function Result({ result: r }: { result: AIResult }) {
  const { t, lang, crystals, level, unlocked, setRole } = useApp();

  useEffect(() => {
    const fire = (ratio: number, opts: confetti.Options) =>
      confetti({ particleCount: Math.floor(170 * ratio), spread: 70, origin: { y: 0.5 }, colors: ["#7c3aed", "#22c55e", "#fb923c", "#a78bfa", "#4ade80"], ...opts });
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.35, { spread: 60 });
    fire(0.2, { spread: 120, decay: 0.91, scalar: 1.2 });
    const id = setTimeout(() => fire(0.3, { spread: 100, startVelocity: 45 }), 450);
    return () => clearTimeout(id);
  }, []);

  const unlockedAch = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id));

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-grape via-grape-dark to-ink dark:to-slate-950 px-4 py-8 overflow-hidden">
      <Particles count={16} />
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative mx-auto max-w-3xl space-y-5">
        {/* hero */}
        <motion.div variants={fadeUp} className="text-center text-white">
          <TreasureChest />
          <motion.h1 initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 }} className="font-display font-bold text-3xl sm:text-4xl mt-2">
            {t("review.completed")} 🎉
          </motion.h1>

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.6 }} className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/12 backdrop-blur px-5 py-3">
            <span className="flex items-center gap-1.5 font-extrabold text-tangerine"><Star width={18} height={18} /> +{REWARD_XP} {t("student.xp")}</span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1.5 font-extrabold text-neon-light"><Crystal width={18} height={18} /> +{REWARD_CRYSTALS} {t("student.crystals")} 💎</span>
          </motion.div>
          <p className="mt-2 text-violet-100 text-sm font-bold">{t("review.reward", { xp: REWARD_XP, crystals: REWARD_CRYSTALS })}</p>
          <p className="mt-1 text-[12px] font-bold text-violet-200">{t("student.crystals")}: {crystals} · {t("student.level")} {level}</p>
        </motion.div>

        {/* score */}
        <motion.div variants={fadeUp} className="rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <ScoreRing score={r.score} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[12px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">{t("review.score")}</p>
              <SourceBadge source={r.source} />
            </div>
          </div>
        </motion.div>

        {/* AI feedback */}
        <motion.div variants={fadeUp} className="rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-xl">
          <h3 className="flex items-center gap-2 font-display font-bold text-lg text-grape dark:text-grape-light mb-3"><Mascot size={36} /> {t("review.aiFeedback")}</h3>
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-orange-50 dark:from-grape/15 dark:to-tangerine/10 border border-violet-100 dark:border-grape/30 p-4">
            <p className="text-ink dark:text-slate-100 font-bold leading-relaxed whitespace-pre-wrap">{r.feedback}</p>
          </div>
          <div className="mt-4">
            {r.errors.length === 0 ? (
              <div className="flex items-center gap-2 rounded-2xl bg-green-50 dark:bg-neon/15 px-4 py-3 font-extrabold text-green-700 dark:text-neon-light"><Trophy width={18} height={18} /> {t("review.noErrors")}</div>
            ) : (
              <>
                <p className="text-[13px] font-extrabold text-slate-500 dark:text-slate-400 mb-2">{t("review.errorsFound")}</p>
                <ul className="space-y-2">
                  {r.errors.map((e, i) => (
                    <li key={i} className="flex items-start gap-2.5 rounded-2xl bg-orange-50 dark:bg-tangerine/15 px-4 py-2.5 text-sm font-bold text-tangerine-dark"><span className="mt-0.5">🦊</span><span>{e}</span></li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </motion.div>

        {/* mistake map */}
        {r.steps.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-display font-bold text-lg text-ink dark:text-slate-100 mb-3"><Bolt width={18} height={18} className="text-tangerine" /> {t("review.mistakeMap")}</h3>
            <MistakeMap steps={r.steps} t={t} />
          </motion.div>
        )}

        {/* achievements */}
        {unlockedAch.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-display font-bold text-lg text-ink dark:text-slate-100 mb-3"><Trophy width={18} height={18} className="text-tangerine" /> {t("review.unlocked")}</h3>
            <div className="flex flex-wrap gap-2.5">
              {unlockedAch.map((a, i) => (
                <motion.span key={a.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 * i }} className="inline-flex items-center gap-1.5 rounded-2xl bg-violet-50 dark:bg-grape/20 px-3 py-2 text-sm font-extrabold text-grape dark:text-grape-light">
                  <span className="text-lg">{a.icon}</span>{a.name[lang]}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="neon" size="lg" brick onClick={() => setRole("student")}><Sparkle width={20} height={20} />{t("review.tryAnother")}</Button>
          <Button variant="grape" size="lg" brick onClick={() => setRole("leaderboard")}><Crown width={20} height={20} />{t("review.viewLeaderboard")}</Button>
        </motion.div>
        <p className="text-center text-[12px] text-violet-200 font-bold pb-2">{t("common.poweredBy")} · Mindset-21</p>
      </motion.div>
    </div>
  );
}

/* mistake map — notebook-paper canvas with circled errors */
function MistakeMap({ steps, t }: { steps: AIFlaggedStep[]; t: (k: string) => string }) {
  return (
    <div
      className="rounded-2xl border-2 border-slate-200 dark:border-slate-600 p-4 sm:p-5 bg-[length:100%_2.2rem] bg-white dark:bg-slate-900"
      style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent 2.1rem, rgba(99,102,241,0.12) 2.1rem, rgba(99,102,241,0.12) 2.2rem)" }}
    >
      <ul className="space-y-1">
        {steps.map((s, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 h-[2.2rem]"
          >
            <span className={cn("grid place-items-center h-6 w-6 rounded-md text-white shrink-0 text-xs", s.correct ? "bg-neon" : "bg-red-400")}>
              {s.correct ? <Check width={13} height={13} /> : "✕"}
            </span>
            <span className="relative font-mono font-extrabold text-ink dark:text-slate-100">
              {s.step}
              {!s.correct && (
                <motion.span
                  initial={{ scale: 0, rotate: -8 }}
                  animate={{ scale: 1, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 240, delay: 0.3 + i * 0.05 }}
                  className="absolute -inset-x-2 -inset-y-1 rounded-[40%] border-[2.5px] border-red-400 pointer-events-none"
                  aria-hidden
                />
              )}
            </span>
            {!s.correct && (
              <span className="ml-auto text-[12px] font-bold text-red-500 flex items-center gap-1">
                ↳ {s.note || t("review.fix")}
              </span>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const color = score >= 85 ? "#22c55e" : score >= 60 ? "#fb923c" : "#ef4444";
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={R} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="11" />
        <motion.circle cx="55" cy="55" r={R} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C - (score / 100) * C }} transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display font-bold text-4xl text-ink dark:text-slate-100 leading-none">{score}</span>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: "openai" | "gemini" | "mock" }) {
  const { t } = useApp();
  const map = {
    openai: { cls: "bg-green-50 dark:bg-neon/15 text-green-700 dark:text-neon-light", label: t("review.source.openai") },
    gemini: { cls: "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300", label: t("review.source.gemini") },
    mock: { cls: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300", label: t("review.source.mock") },
  }[source];
  return <span className={cn("inline-flex items-center gap-1.5 mt-1 rounded-full px-3 py-1 text-[12px] font-extrabold", map.cls)}><Bolt width={13} height={13} />{map.label}</span>;
}
