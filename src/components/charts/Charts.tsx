import { motion } from "framer-motion";

/* ------------------- Line chart (weekly performance) ------------------- */
export function LineChart({
  data,
  labels,
  color = "#7c3aed",
}: {
  data: number[];
  labels: string[];
  color?: string;
}) {
  const W = 320;
  const H = 140;
  const pad = 24;
  const max = 100;
  const stepX = (W - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: pad + i * stepX,
    y: H - pad - (v / max) * (H - pad * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${H - pad} L${pts[0].x},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 0.5, 1].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={W - pad}
          y1={pad + g * (H - pad * 2)}
          y2={pad + g * (H - pad * 2)}
          className="stroke-slate-100 dark:stroke-slate-700"
          strokeWidth={1}
        />
      ))}
      <defs>
        <linearGradient id="lc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.32" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#lc)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="white"
          stroke={color}
          strokeWidth={2.5}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + i * 0.08 }}
        />
      ))}
      {labels.map((l, i) => (
        <text
          key={l}
          x={pad + i * stepX}
          y={H - 6}
          textAnchor="middle"
          className="fill-slate-400 dark:fill-slate-500"
          style={{ fontSize: 9, fontWeight: 700 }}
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

/* ------------------- Bar chart (student progress) ------------------- */
export function BarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  return (
    <div className="flex items-end justify-between gap-2 h-40 px-1">
      {data.map((d, i) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">{d.value}</span>
          <motion.div
            className="w-full rounded-t-xl"
            style={{ background: d.color ?? "#7c3aed" }}
            initial={{ height: 0 }}
            animate={{ height: `${d.value}%` }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
          />
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------- Donut chart (AI accuracy) ------------------- */
export function DonutChart({
  value,
  label,
  color = "#22c55e",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 130 130" className="w-36 h-36 -rotate-90">
        <circle cx="65" cy="65" r={R} fill="none" className="stroke-slate-100 dark:stroke-slate-700" strokeWidth="14" />
        <motion.circle
          cx="65"
          cy="65"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (value / 100) * C }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center -rotate-0">
        <div>
          <span className="font-display font-bold text-3xl text-ink dark:text-slate-100">{value}%</span>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
