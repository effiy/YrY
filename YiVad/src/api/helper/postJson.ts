/**
 * Shared fetch helper for YiAi REST endpoints.
 *
 * POSTs JSON to a YiAi endpoint, unwraps the {code, message, data} envelope,
 * and returns the data payload. Throws on HTTP errors or non-zero business codes.
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";
import type { YiAiEnvelope } from "@/api/interface/yiweb";

export async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = buildYiAiUrl(path);
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    throw new Error(`Request failed: ${path} HTTP ${resp.status}`);
  }
  const data = (await resp.json()) as YiAiEnvelope<T>;
  if (data.code !== 0) {
    throw new Error(data.message || `Request failed: ${path}`);
  }
  return data.data;
}