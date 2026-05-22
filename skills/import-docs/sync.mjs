#!/usr/bin/env node
// import-docs sync — scan + filter + upload local documents to remote API
// Triggered by: rui delivery gate step ②, or manual: node skills/import-docs/sync.mjs

import { readFile, readdir, stat, mkdir, writeFile } from "node:fs/promises";
import { join, relative, sep, dirname, resolve, basename } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { homedir } from "node:os";

// --- config ----------------------------------------------------------------
const API_URL = process.env.IMPORT_DOCS_API_URL || "https://api.effiy.cn";
const API_X_TOKEN = process.env.API_X_TOKEN || "";
const DEFAULT_EXTS = ["md"];
const DEFAULT_EXCLUDES = new Set([".git", "node_modules", ".claude-plugin"]);
const CONCURRENCY = 4;
const HTTP_TIMEOUT = 30_000;
const ERROR_MSG_MAX_LEN = 500;
const QUERY_LIMIT = 10_000;
const PREVIEW_COUNT = 10;
const NODE_ARGV_OFFSET = 2;
const DECIMAL_RADIX = 10;

// --- args ------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  const opts = { exts: DEFAULT_EXTS, exclude: [], prefix: [], mode: "import" };
  let scanRoot = null;
  let scanDir = null;

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      showHelp();
    }
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(0, eq);
    const val = arg.slice(eq + 1);
    switch (key) {
      case "workspace": scanRoot = "workspace"; break;
      case "dir": scanDir = val; break;
      case "exts": opts.exts = val.split(",").map(s => s.trim()); break;
      case "exclude": opts.exclude = val.split(",").map(s => s.trim()); break;
      case "prefix": opts.prefix = val.split(",").map(s => s.trim()); break;
      case "apiUrl": opts.apiUrl = val; break;
      case "mode": opts.mode = val; break;
      case "names": opts.names = val.split(",").map(s => s.trim()); break;
    }
  }

  return { scanRoot, scanDir, ...opts };
}

const SKILL_NAME = "import-docs";

function findPluginHelpPath() {
  const pluginRoot = join(homedir(), ".claude/plugins/cache/yry/yry");
  if (!existsSync(pluginRoot)) return null;
  try {
    const versions = readdirSync(pluginRoot).filter(d => /^\d+\.\d+\.\d+$/.test(d)).sort();
    if (versions.length === 0) return null;
    const helpPath = join(pluginRoot, versions[versions.length - 1], "skills", SKILL_NAME, "help.mjs");
    return existsSync(helpPath) ? helpPath : null;
  } catch {
    return null;
  }
}

function showHelp() {
  const helpPath = findPluginHelpPath();
  if (helpPath) {
    try {
      execSync(`node "${helpPath}"`, { stdio: "inherit" });
    } catch {
      fallbackHelp();
    }
  } else {
    fallbackHelp();
  }
  process.exit(0);
}

function fallbackHelp() {
  console.log("import-docs sync — 文档批量同步到远端");
  console.log("");
  console.log("参数 (key=value):");
  console.log("  workspace=true          项目根全量扫描 + 上传");
  console.log("  dir=<path>              指定目录扫描 (绝对路径)");
  console.log("  exts=md,json,yaml       文件扩展名 (默认: md)");
  console.log("  exclude=tmp,build       追加排除目录");
  console.log("  prefix=a,b              远端路径前缀");
  console.log("  apiUrl=<url>            覆盖 API 地址");
  console.log("  mode=list               仅列出，不上传");
  console.log("  mode=pull               远端 → 本地下载");
  console.log("");
  console.log("环境变量:");
  console.log("  API_X_TOKEN             鉴权令牌 (缺失时静默降级)");
  console.log("  IMPORT_DOCS_API_URL     覆盖默认 API 地址");
  console.log("");
  console.log("详细: ~/.claude/plugins/cache/yry/yry/<version>/skills/import-docs/help.mjs");
}

// --- project root ----------------------------------------------------------
function findProjectRoot(startDir) {
  let dir = resolve(startDir);
  while (true) {
    if (existsSync(join(dir, ".git")) || existsSync(join(dir, ".claude")))
      return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(startDir); // fallback to cwd
    dir = parent;
  }
}

// --- scan ------------------------------------------------------------------
async function scanFiles(root, exts, userExcludes) {
  const result = [];
  const excludes = new Set([...DEFAULT_EXCLUDES, ...userExcludes]);

  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (excludes.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { await walk(full); continue; }
      if (entry.isFile()) result.push(full);
    }
  }

  await walk(root);

  return result.filter(file => {
    const rel = relative(root, file);
    const parts = rel.split(sep);
    // .claude/ 全量纳入
    if (parts[0] === ".claude") return true;
    // 其他仅匹配扩展名
    const ext = file.split(".").pop()?.toLowerCase();
    return ext && exts.includes(ext);
  });
}

// --- path mapping ----------------------------------------------------------
function resolveRemotePath(localPath, root, workspaceName, prefix) {
  const rel = relative(root, localPath).split(sep).join("/").replace(/\s/g, "_");
  const segments = [];
  if (prefix.length > 0) segments.push(...prefix);

  // docs/ 下的所有文件：故事任务面板为第一层标签
  // 结果: 故事任务面板/{子路径}/*
  const docsIdx = rel.indexOf("docs/");
  if (docsIdx !== -1) {
    const storyRel = rel.slice(docsIdx + "docs/".length);
    segments.push("故事任务面板");
    segments.push(storyRel);
  } else {
    segments.push(workspaceName);
    segments.push(rel);
  }

  return segments.join("/");
}

function getTags(remotePath) {
  const parts = remotePath.split("/");
  parts.pop(); // remove filename
  return parts;
}

// --- HTTP helpers ----------------------------------------------------------
async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Token": API_X_TOKEN,
        ...options.headers,
      },
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, ERROR_MSG_MAX_LEN)}`);
    try { return JSON.parse(text); }
    catch { return text; }
  } finally { clearTimeout(timer); }
}

async function querySessionsFull(apiUrl) {
  const body = {
    module_name: "services.database.data_service",
    method_name: "query_documents",
    parameters: { cname: "sessions", limit: QUERY_LIMIT },
  };
  const data = await fetchJson(apiUrl + "/", { method: "POST", body: JSON.stringify(body) });
  return data?.data?.list || data?.list || [];
}

async function querySessions(apiUrl) {
  const list = await querySessionsFull(apiUrl);
  const paths = new Set();
  for (const item of list) {
    if (item.file_path) paths.add(item.file_path);
  }
  return paths;
}

async function writeRemoteFile(apiUrl, remotePath, content) {
  const body = { target_file: remotePath, content, is_base64: false };
  return fetchJson(apiUrl + "/write-file", { method: "POST", body: JSON.stringify(body) });
}

async function createSession(apiUrl, remotePath) {
  const basename = remotePath.split("/").pop();
  const tags = getTags(remotePath);
  const now = Date.now();
  const body = {
    module_name: "services.database.data_service",
    method_name: "create_document",
    parameters: {
      cname: "sessions",
      data: {
        url: `aicr-session://${now}-${Math.random().toString(36).slice(2, 8)}`,
        title: basename,
        file_path: remotePath,
        messages: [],
        tags,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
      },
    },
  };
  return fetchJson(apiUrl + "/", { method: "POST", body: JSON.stringify(body) });
}

// --- concurrent upload -----------------------------------------------------
async function uploadAll(files, apiUrl, existingPaths, root, workspaceName, prefix) {
  let created = 0, overwritten = 0, failed = 0;
  const errors = [];

  async function worker(file) {
    const remotePath = resolveRemotePath(file, root, workspaceName, prefix);
    try {
      const content = await readFile(file, "utf-8");
      await writeRemoteFile(apiUrl, remotePath, content);
      if (existingPaths.has(remotePath)) { overwritten++; }
      else {
        await createSession(apiUrl, remotePath);
        created++;
      }
    } catch (err) {
      failed++;
      errors.push({ file, remotePath, error: err.message });
    }
  }

  // Run with concurrency limit
  const queue = [...files];
  async function run() {
    while (queue.length > 0) {
      const file = queue.shift();
      await worker(file);
    }
  }
  const workers = Array.from({ length: Math.min(CONCURRENCY, files.length) }, run);
  await Promise.all(workers);

  return { created, overwritten, failed, errors };
}

// --- remote read (pull mode) ------------------------------------------------
async function readRemoteFile(apiUrl, remotePath) {
  const body = { target_file: remotePath };
  return fetchJson(apiUrl + "/read-file", { method: "POST", body: JSON.stringify(body) });
}

function resolvePullFilter(localDir, projectRoot) {
  const workspaceName = projectRoot.split(sep).pop() || "workspace";
  const relDir = relative(projectRoot, localDir).split(sep).join("/");

  // Story panel: docs/故事任务面板/<name>/
  if (relDir.startsWith("docs/故事任务面板/")) {
    const storyName = relDir.slice("docs/故事任务面板/".length).split("/")[0];
    if (!storyName) return null;
    return {
      type: "story",
      storyName,
      filter: (s) => {
        const tags = s.tags || [];
        return tags[0] === "故事任务面板" && tags[1] === storyName;
      },
      // story files are flat in one dir — local path = localDir + basename
      toLocal: (remotePath) => join(localDir, basename(remotePath)),
    };
  }

  // .claude/ directory
  if (relDir === ".claude" || relDir.startsWith(".claude/")) {
    return {
      type: "claude",
      filter: (s) => {
        const tags = s.tags || [];
        const fp = s.file_path || "";
        return tags[0] === workspaceName && fp.startsWith(`${workspaceName}/.claude/`);
      },
      // preserve nested structure: strip "{workspaceName}/" prefix
      toLocal: (remotePath) => join(projectRoot, remotePath.slice(workspaceName.length + 1)),
    };
  }

  return null;
}

async function pullFromRemote(apiUrl, localDir, projectRoot) {
  const strategy = resolvePullFilter(localDir, projectRoot);
  if (!strategy) {
    const relDir = relative(projectRoot, localDir).split(sep).join("/");
    console.error(`[import-docs] pull mode: unsupported dir=${relDir}`);
    return { written: 0, failed: 0, reason: `不支持的 pull 目录: ${relDir}` };
  }

  const label = strategy.type === "story" ? `story=${strategy.storyName}` : ".claude/";
  console.error(`[import-docs] pull mode: ${label}`);

  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl);
  } catch (err) {
    console.error(`[import-docs] failed to query remote sessions: ${err.message}`);
    return { written: 0, failed: 0, reason: `远端查询失败: ${err.message}` };
  }

  const matched = sessions.filter(strategy.filter);

  if (matched.length === 0) {
    console.error(`[import-docs] no remote files for: ${label}`);
    return { written: 0, failed: 0, reason: "远端无匹配文件" };
  }

  console.error(`[import-docs] found ${matched.length} remote files for ${label}`);

  let written = 0, failed = 0;
  const errors = [];

  for (const sf of matched) {
    const remotePath = sf.file_path || sf.get_file_path?.();
    if (!remotePath) { failed++; continue; }

    try {
      const data = await readRemoteFile(apiUrl, remotePath);
      const content = data?.data?.content ?? data?.content ?? "";
      const localPath = strategy.toLocal(remotePath);

      // Ensure parent directory exists (for nested .claude/ files)
      const parent = dirname(localPath);
      if (!existsSync(parent)) {
        await mkdir(parent, { recursive: true });
      }

      await writeFile(localPath, content, "utf-8");
      written++;
      console.error(`[import-docs] pulled: ${remotePath} → ${relative(projectRoot, localPath)}`);
    } catch (err) {
      failed++;
      errors.push({ remotePath, error: err.message });
      console.error(`[import-docs] FAILED pull: ${remotePath} — ${err.message}`);
    }
  }

  console.error(`[import-docs] pull done — written: ${written}, failed: ${failed}`);
  return { written, failed, type: strategy.type, errors };
}

async function recommendPullMode(apiUrl) {
  console.error("# import-docs pull 模式 — 远端可同步故事\n");

  if (!API_X_TOKEN) {
    console.error("⚠️  API_X_TOKEN: 缺失 — 无法查询远端");
    return;
  }

  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl);
  } catch (err) {
    console.error(`⚠️  远端不可达: ${err.message}`);
    return;
  }

  // Group by story name from tags
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
    console.error(`   node skills/import-docs/sync.mjs dir=docs/故事任务面板/${name}/ mode=pull`);
  }
}

// --- empty input: recommend ------------------------------------------------
function hasArgs(opts) {
  if (opts.mode === "pull") return opts.scanDir !== null;
  return opts.scanRoot === "workspace" || opts.scanDir !== null;
}

async function recommendMode(root, workspaceName, opts, apiUrl) {
  const files = await scanFiles(root, opts.exts, opts.exclude);

  console.log("# import-docs 状态检测与推荐\n");

  // API_X_TOKEN 检测
  if (!API_X_TOKEN) {
    console.log("⚠️  API_X_TOKEN: 缺失");
    console.log("   → 推荐: 配置 token 后执行 `/import-docs workspace=true` 全量导入\n");
  } else {
    console.log("✅ API_X_TOKEN: 已配置");
  }

  // 远端可达性检测
  if (API_X_TOKEN) {
    try {
      const existingPaths = await querySessions(apiUrl);
      console.log(`✅ 远端可达: ${existingPaths.size} 个已有 session\n`);
    } catch (err) {
      console.log(`⚠️  远端不可达: ${err.message}`);
      console.log("   → 推荐: 检查网络或 API 地址后重试\n");
    }
  }

  // 文件清单预览
  console.log(`📋 待同步文件: ${files.length} 个`);
  if (files.length > 0) {
    const preview = files.slice(0, PREVIEW_COUNT);
    for (const f of preview) {
      const rp = resolveRemotePath(f, root, workspaceName, opts.prefix);
      console.log(`   ${relative(root, f)} → ${rp}`);
    }
    if (files.length > PREVIEW_COUNT) console.log(`   ... 等 ${files.length - PREVIEW_COUNT} 个文件`);
  }

  // 推荐任务
  console.log("\n## 推荐任务\n");
  if (!API_X_TOKEN) {
    console.log("1. [凭据缺失] 设置 API_X_TOKEN 环境变量");
  }
  console.log("2. [全量导入] `/import-docs workspace=true` 扫描并上传全部文件");
  console.log("3. [增量同步] `/import-docs workspace=true exclude=...` 跳过指定目录");
  console.log("4. [预览检查] `/import-docs workspace=true mode=list` 仅列出不上传");
  console.log("5. [定期巡检] 定期运行空输入检查 token / 远端可达性 / 文件差异");
}

// --- main ------------------------------------------------------------------
async function main() {
  const opts = parseArgs();
  const apiUrl = opts.apiUrl || API_URL;

  const root = (opts.scanRoot === "workspace")
    ? findProjectRoot(process.cwd())
    : opts.scanDir
      ? resolve(opts.scanDir)
      : findProjectRoot(process.cwd());

  if (!existsSync(root)) {
    console.error(`[import-docs] scan root not found: ${root}`);
    process.exit(0);
  }

  const workspaceName = root.split(sep).pop() || "workspace";

  // 空输入 → 默认 workspace 全量同步；mode=pull 无 dir 时推荐
  if (!hasArgs(opts)) {
    if (opts.mode === "pull") {
      console.error(`[import-docs] scan root: ${root} (pull recommend mode)`);
      await recommendPullMode(apiUrl);
      return;
    }
    opts.scanRoot = "workspace";
  }

  // Pull mode: remote → local download
  if (opts.mode === "pull") {
    if (!API_X_TOKEN) {
      console.error("[import-docs] no API_X_TOKEN — no-token 降级，跳过 pull");
      return;
    }
    console.error(`[import-docs] pull mode: dir=${root}`);
    const result = await pullFromRemote(apiUrl, root, findProjectRoot(process.cwd()));
    console.error(JSON.stringify(result));
    process.exit(result.failed > 0 ? 1 : 0);
  }

  console.error(`[import-docs] scan root: ${root}`);
  console.error(`[import-docs] workspace: ${workspaceName}`);

  // 硬约束：一级目录标签只能是项目目录名或"故事任务面板"
  const allowedLabels = new Set([workspaceName, "故事任务面板"]);
  if (opts.prefix.length > 0) {
    const firstLabel = opts.prefix[0];
    if (!allowedLabels.has(firstLabel)) {
      console.error(`[import-docs] ERROR: prefix 一级标签 "${firstLabel}" 不允许，只能是 "${workspaceName}" 或 "故事任务面板"`);
      process.exit(1);
    }
  }

  const files = await scanFiles(root, opts.exts, opts.exclude);
  console.error(`[import-docs] found ${files.length} files`);

  // List mode
  if (opts.mode === "list") {
    for (const f of files) {
      const remotePath = resolveRemotePath(f, root, workspaceName, opts.prefix);
      console.log(`${f} → ${remotePath}`);
    }
    console.error(`\n[import-docs] ${files.length} files (list mode, no upload)`);
    return;
  }

  // Import mode
  if (!API_X_TOKEN) {
    console.error("[import-docs] no API_X_TOKEN — no-token 降级，跳过上传");
    return;
  }

  console.error("[import-docs] querying existing sessions...");
  let existingPaths;
  try {
    existingPaths = await querySessions(apiUrl);
    console.error(`[import-docs] existing sessions: ${existingPaths.size}`);
  } catch (err) {
    console.error(`[import-docs] failed to query sessions: ${err.message}`);
    existingPaths = new Set();
  }

  console.error(`[import-docs] uploading ${files.length} files (concurrency=${CONCURRENCY})...`);
  const result = await uploadAll(files, apiUrl, existingPaths, root, workspaceName, opts.prefix);

  // Summary
  const { created, overwritten, failed, errors } = result;
  console.error(`[import-docs] done — created: ${created}, overwritten: ${overwritten}, failed: ${failed}`);
  if (errors.length > 0) {
    for (const e of errors) {
      console.error(`[import-docs] FAILED: ${e.file} → ${e.error}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`[import-docs] fatal: ${err.message}`);
  process.exit(0); // 不阻断管线
});
