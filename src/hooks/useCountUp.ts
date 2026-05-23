import { useEffect, useRef, useState } from "react";

/** Animate a number from 0 → target with an ease-out curve. */
export function useCountUp(target: number, durationMs = 1200, decimals = 0): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const next = from + (target - from) * eased;
      setValue(Number(next.toFixed(decimals)));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs, decimals]);

  return value;
}
