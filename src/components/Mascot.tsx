interface Props {
  size?: number;
  className?: string;
  /** "happy" | "wow" | "think" */
  mood?: "happy" | "wow" | "think";
}

/** EduCheck AI mascot — a friendly owl-bot scholar named "Eddy". */
export default function Mascot({ size = 120, className = "", mood = "happy" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      aria-label="EduCheck AI mascot"
      role="img"
    >
      {/* glow */}
      <circle cx="60" cy="64" r="46" fill="#a78bfa" opacity="0.25" />
      {/* body */}
      <rect x="24" y="40" width="72" height="62" rx="26" fill="#7c3aed" />
      <rect x="24" y="40" width="72" height="62" rx="26" fill="url(#bodyShine)" opacity="0.25" />
      {/* belly screen */}
      <rect x="40" y="62" width="40" height="30" rx="12" fill="#ede9fe" />
      <path d="M48 82 q12 8 24 0" stroke="#7c3aed" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* ears / antennae */}
      <circle cx="36" cy="36" r="7" fill="#fb923c" />
      <circle cx="84" cy="36" r="7" fill="#22c55e" />
      <rect x="34" y="20" width="4" height="14" rx="2" fill="#fb923c" />
      <rect x="82" y="20" width="4" height="14" rx="2" fill="#22c55e" />
      {/* face plate */}
      <ellipse cx="60" cy="52" rx="30" ry="22" fill="#ffffff" />
      {/* eyes */}
      <g className="anim-blink">
        {mood === "wow" ? (
          <>
            <circle cx="49" cy="50" r="8" fill="#0f172a" />
            <circle cx="71" cy="50" r="8" fill="#0f172a" />
            <circle cx="51" cy="47" r="2.5" fill="#fff" />
            <circle cx="73" cy="47" r="2.5" fill="#fff" />
          </>
        ) : (
          <>
            <circle cx="49" cy="50" r="6.5" fill="#0f172a" />
            <circle cx="71" cy="50" r="6.5" fill="#0f172a" />
            <circle cx="51" cy="48" r="2" fill="#fff" />
            <circle cx="73" cy="48" r="2" fill="#fff" />
          </>
        )}
      </g>
      {/* beak */}
      <path d="M56 58 l4 6 4-6 z" fill="#fb923c" />
      {/* cheeks */}
      <circle cx="42" cy="58" r="4" fill="#fda4af" opacity="0.7" />
      <circle cx="78" cy="58" r="4" fill="#fda4af" opacity="0.7" />
      {/* graduation cap */}
      <path d="M60 14 L92 26 L60 38 L28 26 Z" fill="#0f172a" />
      <rect x="58" y="26" width="4" height="12" fill="#0f172a" />
      <circle cx="60" cy="40" r="3" fill="#fb923c" />
      <defs>
        <linearGradient id="bodyShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
