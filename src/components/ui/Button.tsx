import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useSound } from "../../hooks/useSound";

type Variant = "grape" | "neon" | "orange" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  brick?: boolean;
  ariaLabel?: string;
}

const VARIANTS: Record<Variant, string> = {
  grape: "bg-grape text-white hover:bg-grape-dark",
  neon: "bg-neon text-white hover:brightness-105",
  orange: "bg-tangerine-dark text-white hover:brightness-105",
  soft: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
  ghost:
    "border-2 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-2 text-sm gap-1.5 rounded-xl",
  md: "px-4 py-2.5 text-sm gap-2 rounded-2xl",
  lg: "px-6 py-4 text-base gap-2.5 rounded-2xl",
};

export default function Button({
  children,
  onClick,
  variant = "grape",
  size = "md",
  className,
  disabled,
  type = "button",
  brick,
  ariaLabel,
}: Props) {
  const play = useSound();
  return (
    <motion.button
      type={type}
      aria-label={ariaLabel}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={() => {
        if (disabled) return;
        play("click");
        onClick?.();
      }}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-extrabold transition-colors select-none",
        VARIANTS[variant],
        SIZES[size],
        brick && "brick-shadow-sm brick-press",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
