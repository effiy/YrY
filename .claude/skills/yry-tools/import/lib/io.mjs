/**
 * yry-import io -- HTTP / concurrency / help utilities inlined from _shared/io.mjs
 * Originally lived in .claude/skills/_shared/; inlined here so the skill is
 * self-contained and runnable without external shared modules.
 */

const DEFAULT_TIMEOUT_MS = 30000;

export function showPluginHelp(_skillName, fallback) {
  if (typeof fallback === "function") fallback();
}

export async function fetchJson(url, token, { method = "GET", body, timeout = DEFAULT_TIMEOUT_MS, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["X-Token"] = token;
    const resp = await fetch(url, { method, headers, body, signal: controller.signal });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`HTTP ${resp.status} ${resp.statusText}${text ? ` -- ${text.slice(0, 200)}` : ""}`);
    }
    return await resp.json();
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

export async function querySessionsFull(apiUrl, token) {
  const body = JSON.stringify({
    module_name: "services.database.data_service",
    method_name: "query_documents",
    parameters: { cname: "sessions" },
  });
  const resp = await fetchJson(apiUrl + "/", token, { method: "POST", body });
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data?.list)) return resp.data.list;
  if (Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp?.items)) return resp.items;
  return [];
}

export async function readRemoteFile(apiUrl, remotePath, token) {
  const body = JSON.stringify({ file_path: remotePath });
  return fetchJson(apiUrl + "/read-file", token, { method: "POST", body });
}

export async function runConcurrent(items, worker, concurrency) {
  if (!items || items.length === 0) return [];
  const limit = Math.max(1, Math.min(concurrency, items.length));
  let index = 0;
  const results = new Array(items.length);

  async function next() {
    while (true) {
      const i = index++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }

  const workers = Array.from({ length: limit }, next);
  await Promise.all(workers);
  return results;
}
