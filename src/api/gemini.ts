import type { ConnectionResult, GradeInput } from "../types";
import { requestJSON } from "./client";
import { DEFAULT_MODELS, jsonContract, SYSTEM_PROMPT } from "./prompt";
import { splitDataUrl } from "../utils/image";

const base = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    key.trim()
  )}`;

/** Raw Gemini vision grading call. Returns the model's text (expected JSON). */
export async function gradeWithGemini(input: GradeInput): Promise<string> {
  const model = input.model || DEFAULT_MODELS.gemini;
  const parts: any[] = [
    {
      text:
        SYSTEM_PROMPT +
        "\n\n" +
        (input.textDescription
          ? `Homework description: ${input.textDescription}`
          : "Grade the math homework in the attached photo.") +
        jsonContract(input.lang),
    },
  ];
  if (input.imageDataUrl) {
    const { mime, data } = splitDataUrl(input.imageDataUrl);
    parts.push({ inline_data: { mime_type: mime, data } });
  }

  const data = await requestJSON<any>(base(model, input.apiKey), {
    method: "POST",
    timeoutMs: input.timeoutMs ?? 30_000,
    retries: input.retries ?? 1,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.6, responseMimeType: "application/json" },
    }),
  });

  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function testGemini(apiKey: string, model: string): Promise<ConnectionResult> {
  const started = performance.now();
  try {
    await requestJSON(base(model || DEFAULT_MODELS.gemini, apiKey), {
      method: "POST",
      timeoutMs: 12_000,
      retries: 0,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] }),
    });
    return { ok: true, message: "Gemini reachable", latencyMs: Math.round(performance.now() - started) };
  } catch (err: any) {
    return { ok: false, message: err?.message ?? "Connection failed" };
  }
}
