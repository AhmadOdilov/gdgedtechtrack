import type { Lang } from "../types";
import { LANG_NAME } from "../i18n";

/* ============================================================
 *  HARDCODED SYSTEM PROMPT (locked persona, shown in Settings)
 * ============================================================ */
export const SYSTEM_PROMPT = `You are an empathetic, encouraging, and supportive primary school teacher and a game quest guide. Analyze the provided math homework image or text description. Your output must strictly contain:
1. A score from 1 to 100.
2. Identified errors (if any) formatted gently.
3. A highly encouraging, gamified feedback message for the child (e.g., 'Great job, space traveler! You solved almost all the riddles. A sneaky fox hid one number in Task 3—can you find it?'). Give the feedback in the language requested by the user interface (UZ, RU, or EN).`;

/** Machine-readable contract appended so the UI can render the structured result. */
export function jsonContract(lang: Lang): string {
  return `\n\nThe interface language is: ${LANG_NAME[lang]}. Write "feedback", "errors" and every "note" in that language.
Respond with ONLY a single minified JSON object (no markdown, no code fences) shaped exactly like:
{"score": <integer 1-100>, "errors": [<short gentle strings>], "feedback": "<one warm gamified paragraph for the child>", "steps": [{"step": "<the calculation line as you read it, e.g. 5 + 2 = 8>", "correct": <true|false>, "note": "<short gentle hint, may be empty>"}]}`;
}

export const DEFAULT_MODELS: Record<"openai" | "gemini", string> = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
};

export const PROVIDER_MODELS: Record<"openai" | "gemini", string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
  gemini: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
};
