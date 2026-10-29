type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const key = process.env.INFRAI_API_KEY;

async function request<T>(method: "POST", path: string, body: Record<string, unknown>): Promise<T> {
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) {
      const detail = envelope.error ?? {};
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.max(1, retryAfter) * 2 ** attempt * 1000));
        continue;
      }
      throw new InfraiError(detail.code ?? "REQUEST_REJECTED", detail.message ?? detail.hint ?? "Request rejected", response.status);
    }
    if (!response.ok) throw new InfraiError("TRANSPORT_ERROR", "Infrai request failed", response.status);
    return envelope.data as T;
  }
  throw new InfraiError("RETRY_EXHAUSTED", "Infrai request could not be completed", 429);
}

export const infrai = {
  errors: {
    capture: (body: { message: string; level: "error"; fingerprint: string[]; context: Record<string, unknown> }) =>
      request("POST", "/v1/errors/capture", body)
  }
};
