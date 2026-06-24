#!/usr/bin/env node
// .claude/hooks/commit-guard.mjs
// PreToolUse[Bash] guard: enforces commit granularity and message hygiene.
// Blocks `git commit` when staged file count exceeds threshold or message is too short / pure number.
// Aligns with D3 (complexity growth) prevention — see lib/constants.mjs.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  LARGE_COMMIT_FILE_THRESHOLD,
  COMMIT_MESSAGE_MIN_LENGTH,
} from "../../lib/constants.mjs";

const EXIT_BLOCK = 2;
const EXIT_PASS = 0;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function parseToolCommand(payload) {
  try {
    const obj = JSON.parse(payload);
    return obj?.tool_input?.command ?? "";
  } catch {
    return "";
  }
}

function extractCommitMessage(command) {
  // Git commit messages are quoted in practice. Match double or single quotes.
  const patterns = [
    /-m\s+"([^"]+)"/,
    /-m\s+'([^']+)'/,
  ];
  for (const re of patterns) {
    const m = command.match(re);
    if (m) return m[1];
  }
  return null;
}

function isGitCommit(command) {
  return /^\s*git\s+commit\b/.test(command);
}

function countStagedFiles() {
  try {
    const out = execSync("git diff --cached --name-only", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return out.split("\n").filter(Boolean).length;
  } catch {
    return 0;
  }
}

function block(message) {
  console.error(`[commit-guard] 🚫 ${message}`);
  console.error(
    `[commit-guard] 约束: 消息长度 ≥ ${COMMIT_MESSAGE_MIN_LENGTH} 字符且非纯数字；暂存文件数 ≤ ${LARGE_COMMIT_FILE_THRESHOLD}`
  );
  console.error(
    "[commit-guard] 根因: D3 复杂度增长（大提交占比 > 30% 阈值）。拆分故事后分批提交。"
  );
  process.exit(EXIT_BLOCK);
}

function main() {
  const payload = readStdin();
  const command = parseToolCommand(payload);
  if (!command || !isGitCommit(command)) {
    process.exit(EXIT_PASS);
  }

  const message = extractCommitMessage(command);
  if (message === null) {
    process.exit(EXIT_PASS);
  }

  if (message.length < COMMIT_MESSAGE_MIN_LENGTH) {
    block(
      `提交消息过短 (${message.length} < ${COMMIT_MESSAGE_MIN_LENGTH}): "${message}"`
    );
  }
  if (/^\d+$/.test(message.trim())) {
    block(`提交消息为纯数字，无语义信息: "${message}"`);
  }

  const staged = countStagedFiles();
  if (staged > LARGE_COMMIT_FILE_THRESHOLD) {
    block(
      `暂存文件数 ${staged} > ${LARGE_COMMIT_FILE_THRESHOLD}，请拆分为多个小提交`
    );
  }

  process.exit(EXIT_PASS);
}

main();
