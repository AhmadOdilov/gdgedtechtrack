import type { ConnectionResult, GradeInput } from "../types";
import { requestJSON } from "./client";
import { DEFAULT_MODELS, jsonContract, SYSTEM_PROMPT } from "./prompt";

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

/** Raw OpenAI vision grading call. Returns the model's text (expected JSON). */
export async function gradeWithOpenAI(input: GradeInput): Promise<string> {
  const userContent: any[] = [
    {
      type: "text",
      text:
        (input.textDescription
          ? `Homework description: ${input.textDescription}`
          : "Grade the math homework in the attached photo.") + jsonContract(input.lang),
    },
  ];
  if (input.imageDataUrl) {
    userContent.push({ type: "image_url", image_url: { url: input.imageDataUrl } });
  }

  const data = await requestJSON<any>(ENDPOINT, {
    method: "POST",
    timeoutMs: input.timeoutMs ?? 30_000,
    retries: input.retries ?? 1,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: input.model || DEFAULT_MODELS.openai,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  return data?.choices?.[0]?.message?.content ?? "";
}

/** Lightweight connectivity check used by the Settings "Test connection" button. */
export async function testOpenAI(apiKey: string, model: string): Promise<ConnectionResult> {
  const started = performance.now();
  try {
    await requestJSON(ENDPOINT, {
      method: "POST",
      timeoutMs: 12_000,
      retries: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODELS.openai,
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    return { ok: true, message: "OpenAI reachable", latencyMs: Math.round(performance.now() - started) };
  } catch (err: any) {
    return { ok: false, message: err?.message ?? "Connection failed" };
  }
}
