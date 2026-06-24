/**
 * Shared file-system and project utilities.
 *
 * Usage:
 *   import { findProjectRoot, readProjectName, readJsonl, readJson, findStoryDirs } from '../../lib/fs.mjs';
 */

import { join, resolve, dirname, sep } from "node:path";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { STORY_PANEL_DIR } from "./constants.mjs";

// ── Project root discovery ──────────────────────────────────────────

/**
 * Locate project root by walking up until `.git` or `.claude` is found.
 *
 * @param {string} startDir - Absolute or relative path to start from
 * @returns {string} Absolute project root path, or startDir if no marker found
 */
export function findProjectRoot(startDir) {
  let dir = resolve(startDir);
  while (true) {
    if (existsSync(join(dir, ".git")) || existsSync(join(dir, ".claude")))
      return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(startDir);
    dir = parent;
  }
}

// ── Project name from CLAUDE.md ─────────────────────────────────────

/**
 * Extract project name from CLAUDE.md (supports 3 patterns), falling back to directory name.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {string} Project name
 */
export function readProjectName(projectRoot) {
  const claudePath = join(projectRoot, "CLAUDE.md");
  if (!existsSync(claudePath)) return projectRoot.split(sep).pop();

  let content;
  try {
    content = readFileSync(claudePath, "utf-8");
  } catch {
    return projectRoot.split(sep).pop();
  }

  // Pattern 1: Table row (YrY style): | 项目名 | YrY |
  let match = content.match(/\|\s*项目名\s*\|\s*(\S+)\s*\|/);
  if (match) return match[1];

  // Pattern 2: Bold label (YiAi style): **项目名**：YiAi（宜 AI）
  match = content.match(/\*\*项目名\*\*[：:]\s*(\S+?)(?:（[^）]*）)?\s*$/m);
  if (match) return match[1];

  // Pattern 3: 项目名: Value
  match = content.match(/项目名[：:]\s*(\S+)/);
  if (match) return match[1].replace(/（.*）/, "").trim();

  // Fallback: project root directory name
  return projectRoot.split(sep).pop();
}

// ── JSON / JSONL readers ────────────────────────────────────────────

/**
 * Read a JSONL file, returning an array of parsed objects (null/invalid lines filtered).
 *
 * @param {string} path - Absolute path to .jsonl file
 * @returns {Array<object>} Parsed records (empty if file missing or invalid)
 */
export function readJsonl(path) {
  if (!existsSync(path)) return [];
  try {
    const content = readFileSync(path, "utf-8").trim();
    if (!content) return [];
    return content.split("\n").map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Read and parse a JSON file.
 *
 * @param {string} path - Absolute path to .json file
 * @returns {object|null} Parsed JSON, or null if file missing or invalid
 */
export function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Read a JSONL file, find a record by `id`, apply `updater` to it (in-place),
 * and write the file back. Returns true if the file was updated.
 *
 * @param {string} filePath  Path to the .jsonl file.
 * @param {string} id        Value to match against `record.id`.
 * @param {(record: object) => void} updater  Mutates the matched record.
 * @returns {boolean}  Whether the file was updated (false if file missing).
 */
export function updateJsonlById(filePath, id, updater) {
  if (!existsSync(filePath)) return false;
  try {
    const lines = readFileSync(filePath, "utf-8").trim().split("\n").filter(Boolean);
    const updated = lines.map((line) => {
      const parsed = JSON.parse(line);
      if (parsed.id === id) updater(parsed);
      return JSON.stringify(parsed);
    });
    writeFileSync(filePath, updated.join("\n") + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}

// ── JSON write ───────────────────────────────────────────────────────

/**
 * Write an object as pretty-printed JSON (2-space indent, trailing newline).
 *
 * @param {string} path - Absolute path to output file
 * @param {object} obj - JSON-serializable value
 */
export function writeJson(path, obj) {
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf-8");
}

// ── Timestamp ────────────────────────────────────────────────────────

/** @returns {string} Current time as ISO 8601 string */
export function nowISO() {
  return new Date().toISOString();
}

/** @returns {string} Current date as YYYY-MM-DD */
export function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Format an ISO timestamp as `YYYY-MM-DD HH:MM:SS` (timezone-naive).
 *
 * @param {string} iso - ISO 8601 timestamp
 * @returns {string} Display-formatted timestamp
 */
export function fmtDisplay(iso) {
  return iso.replace('T', ' ').slice(0, 19);
}

/**
 * Format a Date as YYYY-MM-DD.
 *
 * @param {Date} d - Date object
 * @returns {string} Date string
 */
export function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

// ── String utilities ─────────────────────────────────────────────────

/** Escape HTML metacharacters in a string (`&` `<` `>` `"`).
 * @param {string} s
 * @returns {string} Escaped string safe for HTML embedding */
export function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Story directory scanner ─────────────────────────────────────────

/** Scan story directories under docs/故事任务面板/.
 * @param {string} projectRoot - Absolute path to project root
 * @returns {Array<{name: string, path: string}>} Story directory entries */
export function findStoryDirs(projectRoot) {
  const panelDir = join(projectRoot, STORY_PANEL_DIR);
  if (!existsSync(panelDir)) return [];

  try {
    return readdirSync(panelDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => ({ name: d.name, path: join(panelDir, d.name) }));
  } catch {
    return [];
  }
}

// ── Main-module detection ──────────────────────────────────────────

/** Detect if the current process was invoked as the main module (CLI entry).
 * @param {string} importMetaUrl - import.meta.url of the calling module
 * @returns {boolean} True if this module is the main entry */
export function isMain(importMetaUrl) {
  return process.argv[1] && fileURLToPath(importMetaUrl) === process.argv[1];
}

