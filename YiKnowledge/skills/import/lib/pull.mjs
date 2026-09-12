/**
 * yry-import pull -- remote-to-local pull operations
 * Extracted from sync.mjs for single-responsibility
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join, relative, sep, dirname, basename } from "node:path";
import { existsSync } from "node:fs";
import { querySessionsFull, readRemoteFile } from "./io.mjs";
import { API_X_TOKEN } from "./config.mjs";

export function resolvePullFilter(/** @type {string} */ localDir, /** @type {string} */ projectRoot, /** @type {string} */ projectPrefix) {
  const workspaceName = projectRoot.split(sep).pop() || "workspace";
  const relDir = relative(projectRoot, localDir).split(sep).join("/");

  if (relDir.startsWith("docs/story-task-panel/")) {
    const storyName = relDir.slice("docs/story-task-panel/".length).split("/")[0];
    if (!storyName) return null;
    const filePrefix = projectPrefix || (workspaceName + "-");
    return {
      type: "story",
      storyName,
      filter: (/** @type {any} */ s) => {
        const tags = s.tags || [];
        if (tags[0] !== "story-task-panel" || tags[1] !== storyName) return false;
        const base = (s.file_path || "").split("/").pop();
        return base.startsWith(filePrefix);
      },
      toLocal: (/** @type {string} */ remotePath) => join(localDir, basename(remotePath)),
    };
  }

  if (relDir === ".claude" || relDir.startsWith(".claude/")) {
    return {
      type: "claude",
      filter: (/** @type {any} */ s) => {
        const tags = s.tags || [];
        const fp = s.file_path || "";
        return tags[1] === ".claude" && fp.startsWith(".claude/");
      },
      toLocal: (/** @type {string} */ remotePath) => join(projectRoot, remotePath),
    };
  }

  return null;
}

export async function pullFromRemote(/** @type {string} */ apiUrl, /** @type {string} */ localDir, /** @type {string} */ projectRoot, /** @type {string} */ projectPrefix) {
  const strategy = resolvePullFilter(localDir, projectRoot, projectPrefix);
  if (!strategy) {
    const relDir = relative(projectRoot, localDir).split(sep).join("/");
    console.error(`[yry-import] pull mode: unsupported dir=${relDir}`);
    return { written: 0, failed: 0, reason: `Unsupported pull directory: ${relDir}` };
  }

  const label = strategy.type === "story" ? `story=${strategy.storyName}` : ".claude/";
  console.error(`[yry-import] pull mode: ${label}`);

  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
  } catch (err) {
    console.error(`[yry-import] failed to query remote sessions: ${err.message}`);
    return { written: 0, failed: 0, reason: `Remote query failed: ${err.message}` };
  }

  const matched = sessions.filter(strategy.filter);

  if (matched.length === 0) {
    console.error(`[yry-import] no remote files for: ${label}`);
    return { written: 0, failed: 0, reason: "No matching files on remote" };
  }

  console.error(`[yry-import] found ${matched.length} remote files for ${label}`);

  let written = 0, failed = 0;
  const errors = [];

  for (const sf of matched) {
    const remotePath = sf.file_path || sf.get_file_path?.();
    if (!remotePath) { failed++; continue; }

    try {
      const data = await readRemoteFile(apiUrl, remotePath, API_X_TOKEN);
      const content = (/** @type {any} */ (data))?.data?.content ?? (/** @type {any} */ (data))?.content ?? "";
      const localPath = strategy.toLocal(remotePath);

      const parent = dirname(localPath);
      if (!existsSync(parent)) {
        await mkdir(parent, { recursive: true });
      }

      await writeFile(localPath, content, "utf-8");
      written++;
      console.error(`[yry-import] pulled: ${remotePath} → ${relative(projectRoot, localPath)}`);
    } catch (err) {
      failed++;
      errors.push({ remotePath, error: err.message });
      console.error(`[yry-import] FAILED pull: ${remotePath} -- ${err.message}`);
    }
  }

  console.error(`[yry-import] pull done -- written: ${written}, failed: ${failed}`);
  return { written, failed, type: strategy.type, errors };
}

export async function recommendPullMode(/** @type {string} */ apiUrl) {
  console.error("# yry-import pull mode -- Remote syncable stories\n");

  if (!API_X_TOKEN) {
    console.error("⚠️  API_X_TOKEN: Missing -- cannot query remote");
    return;
  }

  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
  } catch (err) {
    console.error(`⚠️  Remote unreachable: ${err.message}`);
    return;
  }

  const storyMap = new Map();
  for (const s of sessions) {
    const tags = s.tags || s.get_tags?.() || [];
    if (tags[0] !== "story-task-panel" || !tags[1]) continue;
    const name = tags[1];
    if (!storyMap.has(name)) storyMap.set(name, []);
    storyMap.get(name).push(s.file_path || s.get_file_path?.() || "");
  }

  if (storyMap.size === 0) {
    console.error("No story-task-panel files on remote");
    return;
  }

  console.error(`📋 Remote stories: ${storyMap.size}\n`);
  for (const [name, files] of [...storyMap.entries()].sort()) {
    console.error(`   ${name} (${files.length} files)`);
  }

  console.error("\n## Recommended commands\n");
  for (const name of storyMap.keys()) {
    console.error(`   node .claude/yry-import/sync.mjs dir=docs/story-task-panel/${name}/ mode=pull`);
  }
}