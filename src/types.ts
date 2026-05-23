export type Lang = "uz" | "ru" | "en";
export type Theme = "light" | "dark";
export type Role = "teacher" | "student" | "review" | "leaderboard";
export type Provider = "openai" | "gemini";

export interface AIFlaggedStep {
  /** The math step / line as the AI read it, e.g. "5 + 2 = 8" */
  step: string;
  /** Whether this step is correct */
  correct: boolean;
  /** Short, gentle note about this step */
  note?: string;
}

export interface AIResult {
  /** Score 1–100 */
  score: number;
  /** Gently-worded list of identified errors (empty if none) */
  errors: string[];
  /** Encouraging gamified feedback message for the child */
  feedback: string;
  /** Per-step breakdown the AI flagged on the calculation */
  steps: AIFlaggedStep[];
  /** Where the result came from */
  source: "openai" | "gemini" | "mock";
  /** Whether a live call was attempted but fell back to mock */
  fellBack?: boolean;
}

export interface GradeInput {
  provider: Provider;
  apiKey: string;
  model: string;
  lang: Lang;
  imageDataUrl?: string;
  textDescription?: string;
  /** ms before aborting a live request */
  timeoutMs?: number;
  /** retry attempts on transient failure */
  retries?: number;
}

export interface ConnectionResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

export interface Achievement {
  id: string;
  icon: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  /** weekly delta */
  weekly: number;
  isYou?: boolean;
}

export type ToastKind = "success" | "error" | "info" | "reward";
export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}
