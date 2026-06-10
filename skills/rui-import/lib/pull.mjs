/**
 * rui-import pull — remote-to-local pull operations
 * Extracted from sync.mjs for single-responsibility
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join, relative, sep, dirname, basename } from "node:path";
import { existsSync } from "node:fs";
import { querySessionsFull, readRemoteFile } from "../../../lib/network.mjs";
import { API_X_TOKEN } from "./config.mjs";

export function resolvePullFilter(localDir, projectRoot, projectPrefix) {
  const workspaceName = projectRoot.split(sep).pop() || "workspace";
  const relDir = relative(projectRoot, localDir).split(sep).join("/");

  if (relDir.startsWith("docs/故事任务面板/")) {
    const storyName = relDir.slice("docs/故事任务面板/".length).split("/")[0];
    if (!storyName) return null;
    const filePrefix = projectPrefix || (workspaceName + "-");
    return {
      type: "story",
      storyName,
      filter: (s) => {
        const tags = s.tags || [];
        if (tags[0] !== "故事任务面板" || tags[1] !== storyName) return false;
        const base = (s.file_path || "").split("/").pop();
        return base.startsWith(filePrefix);
      },
      toLocal: (remotePath) => join(localDir, basename(remotePath)),
    };
  }

  if (relDir === ".claude" || relDir.startsWith(".claude/")) {
    return {
      type: "claude",
      filter: (s) => {
        const tags = s.tags || [];
        const fp = s.file_path || "";
        return tags[1] === ".claude" && fp.startsWith(".claude/");
      },
      toLocal: (remotePath) => join(projectRoot, remotePath),
    };
  }

  return null;
}

export async function pullFromRemote(apiUrl, localDir, projectRoot, projectPrefix) {
  const strategy = resolvePullFilter(localDir, projectRoot, projectPrefix);
  if (!strategy) {
    const relDir = relative(projectRoot, localDir).split(sep).join("/");
    console.error(`[rui-import] pull mode: unsupported dir=${relDir}`);
    return { written: 0, failed: 0, reason: `不支持的 pull 目录: ${relDir}` };
  }

  const label = strategy.type === "story" ? `story=${strategy.storyName}` : ".claude/";
  console.error(`[rui-import] pull mode: ${label}`);

  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
  } catch (err) {
    console.error(`[rui-import] failed to query remote sessions: ${err.message}`);
    return { written: 0, failed: 0, reason: `远端查询失败: ${err.message}` };
  }

  const matched = sessions.filter(strategy.filter);

  if (matched.length === 0) {
    console.error(`[rui-import] no remote files for: ${label}`);
    return { written: 0, failed: 0, reason: "远端无匹配文件" };
  }

  console.error(`[rui-import] found ${matched.length} remote files for ${label}`);

  let written = 0, failed = 0;
  const errors = [];

  for (const sf of matched) {
    const remotePath = sf.file_path || sf.get_file_path?.();
    if (!remotePath) { failed++; continue; }

    try {
      const data = await readRemoteFile(apiUrl, remotePath, API_X_TOKEN);
      const content = data?.data?.content ?? data?.content ?? "";
      const localPath = strategy.toLocal(remotePath);

      const parent = dirname(localPath);
      if (!existsSync(parent)) {
        await mkdir(parent, { recursive: true });
      }

      await writeFile(localPath, content, "utf-8");
      written++;
      console.error(`[rui-import] pulled: ${remotePath} → ${relative(projectRoot, localPath)}`);
    } catch (err) {
      failed++;
      errors.push({ remotePath, error: err.message });
      console.error(`[rui-import] FAILED pull: ${remotePath} — ${err.message}`);
    }
  }

  console.error(`[rui-import] pull done — written: ${written}, failed: ${failed}`);
  return { written, failed, type: strategy.type, errors };
}

export async function recommendPullMode(apiUrl) {
  console.error("# rui-import pull 模式 — 远端可同步故事\n");

  if (!API_X_TOKEN) {
    console.error("⚠️  API_X_TOKEN: 缺失 — 无法查询远端");
    return;
  }

  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
  } catch (err) {
    console.error(`⚠️  远端不可达: ${err.message}`);
    return;
  }

  const storyMap = new Map();
  for (const s of sessions) {
    const tags = s.tags || s.get_tags?.() || [];
    if (tags[0] !== "故事任务面板" || !tags[1]) continue;
    const name = tags[1];
    if (!storyMap.has(name)) storyMap.set(name, []);
    storyMap.get(name).push(s.file_path || s.get_file_path?.() || "");
  }

  if (storyMap.size === 0) {
    console.error("远端无故事任务面板文件");
    return;
  }

  console.error(`📋 远端故事: ${storyMap.size} 个\n`);
  for (const [name, files] of [...storyMap.entries()].sort()) {
    console.error(`   ${name} (${files.length} 个文件)`);
  }

  console.error("\n## 推荐命令\n");
  for (const name of storyMap.keys()) {
    console.error(`   node skills/rui-import/sync.mjs dir=docs/故事任务面板/${name}/ mode=pull`);
  }
}
