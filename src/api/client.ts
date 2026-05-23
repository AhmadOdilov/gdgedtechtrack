/**
 * Edge-function-style fetch wrapper: timeout protection (AbortController),
 * bounded retries with backoff for transient failures, and typed errors.
 */
export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

export class APIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(status: number): boolean {
  return status === 429 || status === 408 || (status >= 500 && status < 600);
}

export async function requestJSON<T = any>(url: string, opts: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 30_000, retries = 1, ...init } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        if (isTransient(res.status) && attempt < retries) {
          await sleep(400 * (attempt + 1));
          continue;
        }
        throw new APIError(res.status, `${res.status} ${detail.slice(0, 240)}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      const aborted = err instanceof DOMException && err.name === "AbortError";
      // retry transient network/abort errors (not deliberate APIErrors handled above)
      if (attempt < retries && (aborted || !(err instanceof APIError))) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      if (aborted) throw new APIError(408, `Request timed out after ${timeoutMs}ms`);
      throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Request failed");
}
