import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../context/ToastContext";
import type { ToastKind } from "../types";
import { Check, X, Bolt, Crystal } from "./icons";
import { spring } from "../animations/variants";

const STYLE: Record<ToastKind, { ring: string; icon: JSX.Element }> = {
  success: { ring: "border-l-neon", icon: <Check className="text-neon" width={20} height={20} /> },
  error: { ring: "border-l-red-500", icon: <X className="text-red-500" width={20} height={20} /> },
  info: { ring: "border-l-corp", icon: <Bolt className="text-corp" width={20} height={20} /> },
  reward: { ring: "border-l-tangerine", icon: <Crystal className="text-tangerine" width={20} height={20} /> },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:w-80 flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1, transition: spring }}
            exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.18 } }}
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto text-left flex items-start gap-3 rounded-2xl border-l-4 ${STYLE[t.kind].ring} bg-white dark:bg-slate-800 shadow-xl px-4 py-3 w-full`}
          >
            <span className="mt-0.5 shrink-0">{STYLE[t.kind].icon}</span>
            <div className="min-w-0">
              <p className="font-extrabold text-sm text-ink dark:text-slate-100 leading-tight">{t.title}</p>
              {t.message && (
                <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 leading-snug">
                  {t.message}
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
