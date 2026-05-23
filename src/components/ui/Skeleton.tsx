import { cn } from "../../utils/cn";

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-2xl", className)} aria-hidden="true" />;
}
