import { motion } from "framer-motion";
import { useMemo } from "react";
import { Crystal } from "./icons";

/** Animated opening treasure chest with a burst of knowledge crystals. */
export default function TreasureChest() {
  const crystals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = (Math.PI * (i + 0.5)) / 12;
        const dist = 90 + ((i * 37) % 70);
        return {
          x: Math.cos(angle) * -dist,
          y: -Math.sin(angle) * dist,
          rot: ((i * 73) % 360) - 180,
          delay: 0.45 + (i % 4) * 0.06,
          color: ["#a78bfa", "#4ade80", "#fb923c", "#22d3ee", "#f472b6"][i % 5],
          size: 14 + ((i * 5) % 12),
        };
      }),
    []
  );

  return (
    <div className="relative mx-auto h-44 w-44">
      {crystals.map((c, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{ color: c.color }}
          initial={{ x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 }}
          animate={{ x: c.x, y: c.y, scale: 1, opacity: [0, 1, 0], rotate: c.rot }}
          transition={{ duration: 1.1, delay: c.delay, ease: "easeOut" }}
        >
          <Crystal width={c.size} height={c.size} />
        </motion.span>
      ))}

      {/* glow */}
      <div className="absolute inset-x-6 bottom-2 top-10 rounded-full bg-tangerine/40 blur-2xl" />

      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <rect x="22" y="58" width="76" height="44" rx="8" fill="#92400e" />
        <rect x="22" y="58" width="76" height="44" rx="8" fill="url(#wood)" opacity="0.4" />
        <rect x="30" y="66" width="60" height="30" rx="5" fill="#b45309" />
        <rect x="34" y="62" width="52" height="14" rx="4" fill="#fde047" opacity="0.9" />
        <rect x="54" y="74" width="12" height="14" rx="2" fill="#fbbf24" />
        <circle cx="60" cy="80" r="2.5" fill="#92400e" />
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: [0, -105, -92] }}
          transition={{ duration: 0.9, delay: 0.2, times: [0, 0.7, 1], ease: "easeOut" }}
        >
          <path d="M22 58 Q22 34 60 34 Q98 34 98 58 Z" fill="#a16207" />
          <path d="M22 58 Q22 34 60 34 Q98 34 98 58 Z" fill="url(#wood)" opacity="0.4" />
          <rect x="22" y="50" width="76" height="9" rx="3" fill="#fbbf24" />
        </motion.g>
        <defs>
          <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#000" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
