/**
 * io.mjs — Shared I/O utilities: concurrency, network, and plugin helpers.
 *
 * Usage:
 *   import { runConcurrent } from '../../lib/io.mjs';
 *   import { fetchJson, querySessionsFull, readRemoteFile } from '../../lib/io.mjs';
 *   import { findPluginHelpPath, showPluginHelp } from '../../lib/io.mjs';
 */

import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

import { HTTP_TIMEOUT_MS, ERROR_MSG_MAX_LEN, SESSION_QUERY_LIMIT } from "./constants.mjs";

// ── Concurrency ────────────────────────────────────────────────────

/**
 * Run async `fn` over `items` with bounded concurrency.
 *
 * @param {Array} items - Items to process
 * @param {(item: any) => Promise<void>} fn - Async worker function
 * @param {number} concurrency - Max parallel workers
 */
export async function runConcurrent(items, fn, concurrency) {
  const queue = [...items];
  let cursor = 0;
  async function worker() {
    while (cursor < queue.length) {
      await fn(queue[cursor++]);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
}

// ── Network ────────────────────────────────────────────────────────

/**
 * Fetch JSON from an authenticated API endpoint with timeout and X-Token header.
 *
 * @param {string} url - Full API URL
 * @param {string} apiToken - Token injected as X-Token header
 * @param {object} [options] - fetch options (method, body, etc.)
 * @returns {Promise<object|string>} Parsed JSON, or raw text if parse fails
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
 * Query the sessions collection via the project's remote data service.
 *
 * @param {string} apiUrl - Base API URL
 * @param {string} apiToken - Auth token
 * @returns {Promise<Array>} Session records (may be empty)
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
 * Read a remote file's content via the project's read-file API.
 *
 * @param {string} apiUrl - Base API URL
 * @param {string} remotePath - Remote file path
 * @param {string} apiToken - Auth token
 * @returns {Promise<object>} API response payload
 */
export async function readRemoteFile(apiUrl, remotePath, apiToken) {
  const body = { target_file: remotePath };
  return fetchJson(apiUrl + "/read-file", apiToken, { method: "POST", body: JSON.stringify(body) });
}

// ── Plugin utilities ───────────────────────────────────────────────

/**
 * Locate the installed plugin's help.mjs for a skill, preferring the newest version.
 *
 * @param {string} skillName - e.g. "rui-bot"
 * @returns {string|null} Absolute path to help.mjs, or null if not found
 */
export function findPluginHelpPath(skillName) {
  const pluginRoot = join(homedir(), ".claude/plugins/cache/yry/yry");
  if (!existsSync(pluginRoot)) return null;
  try {
    const versions = readdirSync(pluginRoot).filter(d => /^\d+\.\d+\.\d+$/.test(d)).sort();
    if (versions.length === 0) return null;
    const helpPath = join(pluginRoot, versions[versions.length - 1], "skills", skillName, "help.mjs");
    return existsSync(helpPath) ? helpPath : null;
  } catch {
    return null;
  }
}

/**
 * Show plugin help for a skill, falling back to a local function if plugin not installed.
 *
 * @param {string} skillName - e.g. "rui-bot"
 * @param {() => void} fallbackFn - Local help renderer invoked when plugin help is unavailable
 */
export function showPluginHelp(skillName, fallbackFn) {
  const helpPath = findPluginHelpPath(skillName);
  if (helpPath) {
    try {
      execSync(`node "${helpPath}"`, { stdio: "inherit" });
    } catch {
      fallbackFn();
    }
  } else {
    fallbackFn();
  }
}