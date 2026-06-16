/**
 * Shared file-system and project utilities.
 *
 * Usage:
 *   import { findProjectRoot, readProjectName, readJsonl, readJson, findStoryDirs } from '../../lib/fs.mjs';
 */

import { join, resolve, dirname, sep } from "node:path";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { STORY_PANEL_DIR } from "./constants.mjs";

// ── Project root discovery ──────────────────────────────────────────

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

// ── Timestamp ────────────────────────────────────────────────────────

export function nowISO() {
  return new Date().toISOString();
}

export function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

// ── Story directory scanner ─────────────────────────────────────────

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

