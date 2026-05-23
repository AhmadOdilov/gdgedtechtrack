import { motion } from "framer-motion";
import type { Achievement, Lang } from "../../types";
import { cn } from "../../utils/cn";
import { spring } from "../../animations/variants";

interface Props {
  achievement: Achievement;
  lang: Lang;
  unlocked: boolean;
  lockedLabel: string;
}

export default function AchievementBadge({ achievement, lang, unlocked, lockedLabel }: Props) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: spring } }}
      whileHover={{ y: -4, rotate: unlocked ? -3 : 0 }}
      className={cn(
        "relative rounded-3xl border-2 p-4 text-center overflow-hidden",
        unlocked
          ? "border-grape-light bg-gradient-to-br from-violet-50 to-orange-50 dark:from-grape/20 dark:to-tangerine/10 dark:border-grape"
          : "border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40"
      )}
    >
      <div className={cn("text-4xl mb-1", !unlocked && "grayscale opacity-40")}>{achievement.icon}</div>
      <p
        className={cn(
          "font-extrabold text-sm leading-tight",
          unlocked ? "text-grape dark:text-grape-light" : "text-slate-400 dark:text-slate-500"
        )}
      >
        {achievement.name[lang]}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
        {unlocked ? achievement.desc[lang] : lockedLabel}
      </p>
      {unlocked && (
        <span className="absolute top-2 right-2 text-[10px] font-extrabold text-neon bg-neon/15 rounded-full px-1.5 py-0.5">
          ✓
        </span>
      )}
    </motion.div>
  );
}
