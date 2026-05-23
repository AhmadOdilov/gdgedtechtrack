import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface Props {
  /** 0..1 */
  value: number;
  className?: string;
  barClassName?: string;
  delay?: number;
  height?: string;
}

export default function ProgressBar({
  value,
  className,
  barClassName = "bg-grape",
  delay = 0,
  height = "h-2",
}: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn(
        "rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden",
        height,
        className
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
      />
    </div>
  );
}
