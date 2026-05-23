import type { AIResult, ConnectionResult, GradeInput, Provider } from "../types";
import { gradeWithOpenAI, testOpenAI } from "../api/openai";
import { gradeWithGemini, testGemini } from "../api/gemini";
import { mockGrade } from "../utils/mockEngine";

/**
 * Top-level grading service. Picks the provider, parses + normalizes the
 * response, and gracefully falls back to the offline mock so a live demo
 * never breaks.
 */
export async function gradeHomework(input: GradeInput): Promise<AIResult> {
  const hasKey = input.apiKey.trim().length > 0;
  if (!hasKey) return mockGrade(input.lang, input.textDescription);

  try {
    const raw =
      input.provider === "openai" ? await gradeWithOpenAI(input) : await gradeWithGemini(input);
    return normalize(parseJSON(raw), input.provider);
  } catch (err) {
    console.warn("[EduCheck AI] live grading failed, using mock:", err);
    return { ...mockGrade(input.lang, input.textDescription), fellBack: true };
  }
}

export function testConnection(
  provider: Provider,
  apiKey: string,
  model: string
): Promise<ConnectionResult> {
  if (!apiKey.trim()) {
    return Promise.resolve({ ok: false, message: "No API key provided" });
  }
  return provider === "openai" ? testOpenAI(apiKey, model) : testGemini(apiKey, model);
}

/* ---------------- parsing helpers ---------------- */
function parseJSON(raw: string): any {
  if (!raw) return {};
  let txt = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(txt);
  } catch {
    const start = txt.indexOf("{");
    const end = txt.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(txt.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    return { feedback: raw, score: 80, errors: [], steps: [] };
  }
}

function normalize(obj: any, source: AIResult["source"]): AIResult {
  const errors = Array.isArray(obj?.errors)
    ? obj.errors.map((e: any) => String(e)).filter(Boolean)
    : [];
  const steps = Array.isArray(obj?.steps)
    ? obj.steps.map((s: any) => ({
        step: String(s?.step ?? ""),
        correct: Boolean(s?.correct),
        note: s?.note ? String(s.note) : "",
      }))
    : [];
  return {
    score: clampScore(obj?.score),
    errors,
    steps,
    feedback:
      String(obj?.feedback ?? "").trim() || "Great effort! Keep going, young explorer! 🚀",
    source,
  };
}

function clampScore(v: any): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 80;
  return Math.max(1, Math.min(100, n));
}
