/**
 * YiWeb / YiAi data-service configuration.
 * These are separate from the main YiVad API_URL because they use a generic
 * RPC-style protocol (module_name + method_name + parameters) instead of REST.
 */

/** Base URL for the YiAi data-service RPC endpoint */
export const YIAI_API_URL: string = import.meta.env.VITE_API_URL as string;

/** Base URL for Ollama model listing */
export const YIAI_OLLAMA_URL: string = import.meta.env.VITE_YIAI_OLLAMA_URL as string;

/** Build a full URL from a path, using the YiAi API base */
export function buildYiAiUrl(path: string): string {
  const p = String(path || "");
  if (p.startsWith("http")) return p;
  const base = YIAI_API_URL.replace(/\/+$/, "");
  if (!p) return base;
  return base + (p.startsWith("/") ? "" : "/") + p.replace(/^\/+/, "");
}
