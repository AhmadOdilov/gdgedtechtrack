import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface Props {
  children: ReactNode;
  className?: string;
  /** subtle hover lift + shadow */
  hover?: boolean;
}

/** Surface card — light/dark aware, soft rounded with soft shadow. */
export default function Card({ children, className, hover }: Props) {
  return (
    <div
      className={cn(
        "rounded-3xl border bg-white border-slate-200 shadow-sm",
        "dark:bg-slate-800/70 dark:border-slate-700",
        hover && "transition-all hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
