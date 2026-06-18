/**
 * format.mjs — Story panel output formatters
 *
 * Extracted from rui-story.mjs for single-responsibility.
 * All output formatting: printOverview, printList, printShow, printRecommend, printHealth.
 */

import { bold, dim, red, yellow, cyan, green } from "../../../lib/tty.mjs";
import { determineStatus } from './extract.mjs';

// Display constants
const STATUS_COUNT_PAD = 4;
const RECENT_STORY_COUNT = 5;
const MIN_NAME_COL_WIDTH = 14;
const STATUS_COL_WIDTH = 18;
const FILES_COL_WIDTH = 5;
const DATE_COL_WIDTH = 19;
const TYPE_COL_WIDTH = 10;
const LIST_COL_GAP_WIDTH = 30;
const MIN_COL_GAP = 1;
const FILE_LIST_NAME_PAD = 2;
const RECOMMEND_NAME_WIDTH = 20;
const DATE_ZERO_PAD = 2;

const STATUS_CONFIG = {
  任务: { label: "任务", colorFn: dim },
  设计: { label: "设计", colorFn: yellow },
  实施: { label: "实施", colorFn: (s) => s },
  测试: { label: "测试", colorFn: cyan },
  报告: { label: "报告", colorFn: green },
  改进: { label: "改进", colorFn: green },
};

export const TYPE_LABELS = { backend: "后端", frontend: "前端", fullstack: "全栈", meta: "元" };

export function statusDisplay(status) {
  const cfg = STATUS_CONFIG[status] || { label: status, colorFn: (s) => s };
  return cfg.colorFn(cfg.label);
}

export function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(DATE_ZERO_PAD, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function latestTimestamp(sessions) {
  let max = 0;
  for (const s of sessions) { const t = s.updatedAt || s.updated_at || 0; if (t > max) max = t; }
  return max;
}

export function printOverview(storyMap, projectPrefix, blockedMap) {
  const counts = { 任务: 0, 设计: 0, 实施: 0, 测试: 0, 报告: 0, 改进: 0 };
  const storyStatuses = [];
  for (const [name, sessions] of storyMap) {
    const basenames = new Set(sessions.map(s => (s.file_path || "").split("/").pop()));
    const blocked = blockedMap.get(name);
    const filePaths = sessions.map(s => s.file_path || "");
    const status = determineStatus(basenames, projectPrefix, blocked, filePaths);
    counts[status]++;
    storyStatuses.push({ name, status, updatedAt: latestTimestamp(sessions) });
  }

  console.log("");
  console.log(bold("故事任务面板 · 状态概览"));
  console.log("────────────────────────────────");

  const order = ["改进", "报告", "测试", "实施", "设计", "任务"];
  for (const s of order) {
    const cfg = STATUS_CONFIG[s];
    console.log(`  ${cfg.colorFn(cfg.label.padEnd(STATUS_COL_WIDTH))} ${String(counts[s]).padStart(STATUS_COUNT_PAD)}`);
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log("────────────────────────────────");
  console.log(`  ${"合计".padEnd(STATUS_COL_WIDTH)} ${String(total).padStart(STATUS_COUNT_PAD)} 个故事`);

  storyStatuses.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const recent = storyStatuses.slice(0, RECENT_STORY_COUNT);
  console.log("");
  console.log("最近活动:");
  if (recent.length === 0) { console.log("  无"); }
  else {
    for (const s of recent) {
      console.log(`  ${s.name.padEnd(STATUS_COL_WIDTH)} ${formatDate(s.updatedAt)}   ${statusDisplay(s.status)}`);
    }
  }
  console.log("");
}

export function printList(storyMap, projectPrefix, blockedMap, typeMap, checkGitBranchFn) {
  const entries = [];
  for (const [name, sessions] of storyMap) {
    const basenames = new Set(sessions.map(s => (s.file_path || "").split("/").pop()));
    const blocked = blockedMap.get(name);
    const filePaths = sessions.map(s => s.file_path || "");
    const status = determineStatus(basenames, projectPrefix, blocked, filePaths);
    const files = sessions.length;
    const lastMod = latestTimestamp(sessions);
    const type = typeMap.get(name) || "meta";
    const branch = checkGitBranchFn ? checkGitBranchFn(name) : null;
    entries.push({ name, status, files, lastMod, type, branch });
  }

  entries.sort((a, b) => (b.lastMod || 0) - (a.lastMod || 0));

  console.log("");
  console.log(bold("故事任务面板 · 进度全景"));
  console.log("");
  if (entries.length === 0) { console.log(dim("  远端无故事任务面板数据")); console.log(""); return; }

  const nameW = Math.max(MIN_NAME_COL_WIDTH, ...entries.map(e => e.name.length));
  const pad = (s, w) => { const str = String(s); const visible = str.replace(/\x1b\[[0-9;]*m/g, "").length; return str + " ".repeat(Math.max(MIN_COL_GAP, w - visible)); };

  console.log(`  ${pad("Story", nameW)} ${pad("Status", STATUS_COL_WIDTH)} ${pad("Files", FILES_COL_WIDTH)} ${pad("Last Modified", DATE_COL_WIDTH)} ${pad("Type", TYPE_COL_WIDTH)} Branch`);
  console.log(`  ${dim("─".repeat(nameW + STATUS_COL_WIDTH + FILES_COL_WIDTH + DATE_COL_WIDTH + TYPE_COL_WIDTH + LIST_COL_GAP_WIDTH))}`);

  for (const e of entries) {
    console.log(`  ${pad(e.name, nameW)} ${pad(statusDisplay(e.status), STATUS_COL_WIDTH)} ${pad(String(e.files), FILES_COL_WIDTH)} ${pad(formatDate(e.lastMod), DATE_COL_WIDTH)} ${pad(TYPE_LABELS[e.type] || e.type, TYPE_COL_WIDTH)} ${e.branch || "—"}`);
  }
  console.log("");
}

export function printShow(storyName, sessions, projectPrefix, blockedState, type, checkGitBranchFn) {
  const basenames = new Set(sessions.map(s => (s.file_path || "").split("/").pop()));
  const status = determineStatus(basenames, projectPrefix, blockedState);
  const branch = checkGitBranchFn ? checkGitBranchFn(storyName) : null;
  const files = sessions.map(s => ({ name: (s.file_path || "").split("/").pop(), updatedAt: s.updatedAt || s.updated_at || 0 })).sort((a, b) => a.name.localeCompare(b.name));

  console.log("");
  console.log(bold(`${storyName} · ${statusDisplay(status)}`));
  console.log("");
  console.log(`  📂 远端路径: 故事任务面板/${storyName}/`);
  console.log(`  📋 类型: ${TYPE_LABELS[type] || type}`);
  console.log(`  📄 文件: ${files.length} 个`);
  console.log("");
  if (files.length > 0) {
    console.log("    文件清单:");
    const maxLen = Math.max(...files.map(f => f.name.length));
    for (const f of files) console.log(`    ${f.name.padEnd(maxLen + FILE_LIST_NAME_PAD)} ${formatDate(f.updatedAt)}`);
    console.log("");
  }
  console.log(`  🔀 Git 分支: ${branch || "—"}`);
  console.log("");
  console.log("  📊 元数据:");
  console.log(`    状态: ${statusDisplay(status)}`);
  console.log(`    阻断原因: ${blockedState?.block_reason || "—"}`);
  console.log("");
}

export function printRecommend(storyMap) {
  console.log("");
  if (storyMap.size === 0) { console.log(dim("  远端无故事任务面板数据")); console.log(""); return; }
  console.log(bold("远端可同步故事"));
  console.log("");
  const names = [...storyMap.keys()].sort();
  for (const name of names) {
    const sessions = storyMap.get(name);
    console.log(`  ${name.padEnd(RECOMMEND_NAME_WIDTH)} ${dim(`(${sessions.length} 个文件)`)}`);
  }
  console.log("");
  console.log(bold("推荐命令"));
  console.log("");
  for (const name of names) console.log(`  /rui-story sync ${name}`);
  console.log("");
}

export function printHealth(result) {
  console.log("");
  console.log(bold("rui-story 健康检查"));
  console.log("══════════════════");
  console.log("");

  let pass = 0, warn = 0, fail = 0;
  function check(label, ok, detail) {
    const mark = ok ? green("  ✅") : (detail.includes("缺失") ? yellow("  ⚠️") : red("  ❌"));
    console.log(`${mark} ${label}: ${detail}`);
    if (ok) pass++; else if (detail.includes("缺失")) warn++; else fail++;
  }

  console.log(bold("── API 凭据"));
  check("API_X_TOKEN", !!result.apiToken, result.apiToken ? "已配置" : "缺失 — 无法查询远端");
  console.log("");

  console.log(bold("── 远端可达性"));
  if (result.apiToken) {
    if (result.apiError) { check("API 可达", false, `不可达: ${result.apiError}`); }
    else {
      check("API 可达 (effiy.cn)", true, `查询到 ${result.totalSessions} 个 sessions`);
      const panelCount = result.panelSessions || 0;
      check("故事任务面板 sessions", panelCount > 0, panelCount > 0 ? `${panelCount} 个 (${result.storyCount} 个故事)` : "无故事任务面板数据");
    }
  } else { check("API 可达", false, "跳过 — Token 未配置"); }
  console.log("");

  console.log(bold("── 项目配置"));
  check("CLAUDE.md", !!result.projectName, result.projectName ? `项目名 = ${result.projectName}` : "未找到或无法解析");
  check("Git 仓库", !!result.isGitRepo, result.isGitRepo ? "是" : "否");
  console.log("");
  check("故事任务面板", !!result.hasStoryPanel, result.hasStoryPanel ? `存在 (${result.storyCount || 0} 个故事目录)` : "目录不存在");

  console.log("");
  const total = pass + warn + fail;
  const healthPct = total > 0 ? Math.round((pass / total) * 100) : 0;
  console.log(bold(`健康度: ${healthPct}% (${pass}✅ ${warn}⚠️ ${fail}❌)`));
  console.log("");
}
