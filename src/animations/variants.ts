import type { Variants, Transition } from "framer-motion";

export const spring: Transition = { type: "spring", stiffness: 320, damping: 26 };
export const softSpring: Transition = { type: "spring", stiffness: 180, damping: 20 };

/** Page-level enter/exit used with AnimatePresence in the router. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, scale: 0.99, transition: { duration: 0.2, ease: "easeIn" } },
};

/** Staggered list container. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: spring },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: spring },
};

export const scaleHover = {
  whileHover: { y: -4, scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: spring,
};
