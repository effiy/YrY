/**
 * YiWeb / YiAi data-service configuration.
 * These are separate from the main YiVad API_URL because they use a generic
 * RPC-style protocol (module_name + method_name + parameters) instead of REST.
 */

/** Base URL for the YiAi data-service RPC endpoint */
export const YIAI_API_URL: string = import.meta.env.RSBUILD_ENV_API_URL as string;

/** Base URL for Ollama model listing */
export const YIAI_OLLAMA_URL: string = import.meta.env.RSBUILD_ENV_YIAI_OLLAMA_URL as string;

/** Build a full URL from a path, using the YiAi API base */
export function buildYiAiUrl(path: string): string {
  const p = String(path || "");
  if (p.startsWith("http")) return p;
  const base = YIAI_API_URL.replace(/\/+$/, "");
  if (!p) return base;
  // Always insert exactly one "/" between base and path. The old logic
  // stripped the path's leading "/" when base had no trailing slash,
  // producing "/apidelete-file" from base "/api" + path "/delete-file".
  return `${base}/${p.replace(/^\/+/, "")}`;
}

/**
 * Read the JWT issued at login. The Pinia user store (`yivad-user`) is the
 * source of truth — `setToken(token)` writes it into the store's persisted
 * state, which `pinia-plugin-persistedstate` serializes to localStorage as
 * `JSON.stringify({ token, userInfo })` under key `"yivad-user"`. There is no
 * separate `YiWeb.apiToken.v1` key; the previous direct-fetch services all
 * read `localStorage.getItem("YiWeb.apiToken.v1")` and got back `null`,
 * sending an empty `X-Token` header. That worked only because YiAi's
 * optional auth is disabled by default — the moment auth is enabled, every
 * fetch-based call (chat SSE, knowledge read, RAG, file I/O, WeCom) would 401.
 */
export function getYiAiToken(): string {
  try {
    const raw = localStorage.getItem("yivad-user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.token ?? "";
  } catch {
    return "";
  }
}

/**
 * Auth headers for direct-fetch services. YiAi's middleware checks
 * `Authorization: Bearer <jwt>` first (via `verify_jwt`) and falls back to a
 * static-token comparison against `X-Token` only when no Authorization header
 * is present. Sending only `X-Token` would never reach the JWT path — even
 * with a valid JWT in X-Token, the middleware compares it against the static
 * configured `settings.auth_token`, fails, and 401s. So we must send the JWT
 * as a Bearer Authorization header to match what the Axios interceptor does
 * for the RPC envelope. We also send `X-Token` alongside for back-compat
 * with deployments that configured a static token equal to the JWT.
 */
export function yiAiAuthHeaders(): Record<string, string> {
  const token = getYiAiToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  headers["X-Token"] = token;
  return headers;
}
