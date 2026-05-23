import { useMemo } from "react";

interface Props {
  count?: number;
  /** emoji/symbols to float */
  symbols?: string[];
  className?: string;
}

/** Lightweight CSS floating particles for gamified backgrounds. */
export default function Particles({
  count = 14,
  symbols = ["✨", "💎", "⭐", "🔷", "🟢"],
  className = "",
}: Props) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${Math.round((i * 97 + 13) % 100)}%`,
        delay: `${(i * 0.7) % 5}s`,
        dur: `${4 + ((i * 1.3) % 4)}s`,
        drift: `${((i % 5) - 2) * 18}px`,
        size: `${14 + ((i * 7) % 16)}px`,
        symbol: symbols[i % symbols.length],
      })),
    [count, symbols]
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          className="particle absolute bottom-0 select-none"
          style={
            {
              left: p.left,
              fontSize: p.size,
              animationDelay: p.delay,
              ["--dur" as any]: p.dur,
              ["--drift" as any]: p.drift,
            } as React.CSSProperties
          }
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
