/**
 * Shared network / HTTP utilities.
 *
 * Usage:
 *   import { fetchJson } from '../../lib/network.mjs';
 */

import { HTTP_TIMEOUT_MS, ERROR_MSG_MAX_LEN, SESSION_QUERY_LIMIT } from "./constants.mjs";

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

/**
 * Query all sessions from the remote document API.
 * Used by rui-import and rui-story for sync operations.
 */
export async function querySessionsFull(apiUrl, apiToken) {
  const body = {
    module_name: "services.database.data_service",
    method_name: "query_documents",
    parameters: { cname: "sessions", limit: SESSION_QUERY_LIMIT },
  };
  const data = await fetchJson(apiUrl + "/", apiToken, { method: "POST", body: JSON.stringify(body) });
  return data?.data?.list || data?.list || [];
}

/**
 * Read a remote file from the document API.
 */
export async function readRemoteFile(apiUrl, remotePath, apiToken) {
  const body = { target_file: remotePath };
  return fetchJson(apiUrl + "/read-file", apiToken, { method: "POST", body: JSON.stringify(body) });
}
