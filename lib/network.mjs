/**
 * Shared network / HTTP utilities.
 *
 * Usage:
 *   import { fetchJson } from '../../lib/network.mjs';
 */

import { HTTP_TIMEOUT_MS, ERROR_MSG_MAX_LEN } from "./constants.mjs";

/**
 * Fetch JSON from a remote API with timeout and auth headers.
 * Expects API_X_TOKEN in process.env. Returns parsed JSON or raw text on parse failure.
 */
export async function fetchJson(url, apiToken, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Token": apiToken,
        ...options.headers,
      },
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, ERROR_MSG_MAX_LEN)}`);
    try { return JSON.parse(text); }
    catch { return text; }
  } finally { clearTimeout(timer); }
}
