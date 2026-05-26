#!/usr/bin/env node
// rui-import sync — scan + filter + upload local documents to remote API
// Triggered by: rui delivery gate step ②, or manual: node skills/rui-import/sync.mjs

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
const PAGINATION_PAGE_SIZE = 500;
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
      case "file": opts.file = val; break;
      case "projectPrefix": opts.projectPrefix = val; break;
    }
  }

  return { scanRoot, scanDir, ...opts };
}

const SKILL_NAME = "rui-import";

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
  console.log("rui-import sync — 文档批量同步到远端");
  console.log("");
  console.log("参数 (key=value):");
  console.log("  workspace=true          项目根全量扫描 + 上传");
  console.log("  dir=<path>              指定目录扫描 (绝对路径)");
  console.log("  exts=md,json,yaml       文件扩展名 (默认: md)");
  console.log("  exclude=tmp,build       追加排除目录");
  console.log("  prefix=a,b              远端路径前缀");
  console.log("  file=<path>             单文件导入（自动附加语义标签）");
  console.log("  apiUrl=<url>            覆盖 API 地址");
  console.log("  mode=list               仅列出，不上传");
  console.log("  mode=pull               远端 → 本地下载");
  console.log("");
  console.log("环境变量:");
  console.log("  API_X_TOKEN             鉴权令牌 (缺失时静默降级)");
  console.log("  IMPORT_DOCS_API_URL     覆盖默认 API 地址");
  console.log("");
  console.log("详细: ~/.claude/plugins/cache/yry/yry/<version>/skills/rui-import/help.mjs");
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
function resolveRemotePath(localPath, root, projectRootName, prefix) {
  let rel = relative(root, localPath).split(sep).join("/").replace(/\s/g, "_");
  rel = projectRootName + "/" + rel;

  const segments = [];
  if (prefix.length > 0) segments.push(...prefix);
  segments.push(...rel.split("/"));
  return segments.join("/");
}

function getTags(remotePath, _localPath, _projectRootName) {
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
  const allItems = [];
  let skip = 0;

  while (true) {
    const body = {
      module_name: "services.database.data_service",
      method_name: "query_documents",
      parameters: { cname: "sessions", limit: PAGINATION_PAGE_SIZE, skip },
    };
    const data = await fetchJson(apiUrl + "/", { method: "POST", body: JSON.stringify(body) });
    const list = data?.data?.list || data?.list || [];
    allItems.push(...list);

    if (list.length < PAGINATION_PAGE_SIZE) break;
    skip += PAGINATION_PAGE_SIZE;
  }

  return allItems;
}

async function querySessions(apiUrl) {
  const list = await querySessionsFull(apiUrl);
  const paths = new Map();
  for (const item of list) {
    if (item.file_path) paths.set(item.file_path, item);
  }
  return paths;
}

async function writeRemoteFile(apiUrl, remotePath, content, overwrite) {
  const body = { target_file: remotePath, content, is_base64: false, overwrite: !!overwrite };
  return fetchJson(apiUrl + "/write-file", { method: "POST", body: JSON.stringify(body) });
}

async function createSession(apiUrl, remotePath, localPath, projectRootName) {
  const basename = remotePath.split("/").pop();
  const tags = getTags(remotePath, localPath, projectRootName);
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
  const resp = await fetchJson(apiUrl + "/", { method: "POST", body: JSON.stringify(body) });
  // Return the created item for dedup tracking (fallback to synthetic marker)
  const created = resp?.data || resp;
  return (created && created.file_path) ? created : { file_path: remotePath, _id: "local-" + now };
}

async function updateSession(apiUrl, remotePath, existingItem) {
  const docId = existingItem._id || existingItem.id;
  if (!docId) return; // can't update without id, skip
  const now = Date.now();
  const body = {
    module_name: "services.database.data_service",
    method_name: "update_document",
    parameters: {
      cname: "sessions",
      doc_id: docId,
      data: { updatedAt: now, lastAccessTime: now },
    },
  };
  return fetchJson(apiUrl + "/", { method: "POST", body: JSON.stringify(body) });
}

// --- single-file upload ----------------------------------------------------
async function uploadSingleFile(filePath, apiUrl, existingPaths, root, workspaceName, prefix) {
  const remotePath = resolveRemotePath(filePath, root, workspaceName, prefix);
  const content = await readFile(filePath, "utf-8");
  const existingItem = existingPaths.get(remotePath);
  await writeRemoteFile(apiUrl, remotePath, content, !!existingItem);
  if (existingItem) {
    await updateSession(apiUrl, remotePath, existingItem);
    return { status: "overwritten", file: filePath, remotePath };
  }
  const created = await createSession(apiUrl, remotePath, filePath, workspaceName);
  // Update existingPaths so concurrent workers don't create duplicates for the same path
  existingPaths.set(remotePath, created);
  return { status: "created", file: filePath, remotePath };
}

// --- concurrent upload -----------------------------------------------------
async function uploadAll(files, apiUrl, existingPaths, root, workspaceName, prefix) {
  let created = 0, overwritten = 0, failed = 0;
  const errors = [];

  async function worker(file) {
    try {
      const result = await uploadSingleFile(file, apiUrl, existingPaths, root, workspaceName, prefix);
      if (result.status === "created") created++;
      else if (result.status === "overwritten") overwritten++;
      else { failed++; errors.push({ file: result.file, remotePath: result.remotePath, error: result.error }); }
    } catch (err) {
      failed++;
      const remotePath = resolveRemotePath(file, root, workspaceName, prefix);
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

function resolvePullFilter(localDir, projectRoot, projectPrefix) {
  const workspaceName = projectRoot.split(sep).pop() || "workspace";
  const relDir = relative(projectRoot, localDir).split(sep).join("/");

  // Story panel: docs/故事任务面板/<name>/
  if (relDir.startsWith("docs/故事任务面板/")) {
    const storyName = relDir.slice("docs/故事任务面板/".length).split("/")[0];
    if (!storyName) return null;
    // Default prefix filter: project root dir name + "-" (e.g. "YrY-")
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
        return tags[1] === ".claude" && fp.startsWith(".claude/");
      },
      // remote path mirrors local: toLocal = projectRoot + remotePath
      toLocal: (remotePath) => join(projectRoot, remotePath),
    };
  }

  return null;
}

async function pullFromRemote(apiUrl, localDir, projectRoot, projectPrefix) {
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
    sessions = await querySessionsFull(apiUrl);
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

async function recommendPullMode(apiUrl) {
  console.error("# rui-import pull 模式 — 远端可同步故事\n");

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
    console.error(`   node skills/rui-import/sync.mjs dir=docs/故事任务面板/${name}/ mode=pull`);
  }
}

// --- empty input: recommend ------------------------------------------------
function hasArgs(opts) {
  if (opts.mode === "pull") return opts.scanDir !== null;
  return opts.scanRoot === "workspace" || opts.scanDir !== null;
}

async function recommendMode(root, workspaceName, opts, apiUrl) {
  const files = await scanFiles(root, opts.exts, opts.exclude);

  console.log("# rui-import 状态检测与推荐\n");

  // API_X_TOKEN 检测
  if (!API_X_TOKEN) {
    console.log("⚠️  API_X_TOKEN: 缺失");
    console.log("   → 推荐: 配置 token 后执行 `/rui-import workspace=true` 全量导入\n");
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
  console.log("2. [全量导入] `/rui-import workspace=true` 扫描并上传全部文件");
  console.log("3. [增量同步] `/rui-import workspace=true exclude=...` 跳过指定目录");
  console.log("4. [预览检查] `/rui-import workspace=true mode=list` 仅列出不上传");
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
    console.error(`[rui-import] scan root not found: ${root}`);
    process.exit(0);
  }

  const workspaceName = root.split(sep).pop() || "workspace";

  // 空输入 → 默认 workspace 全量同步；mode=pull 无 dir 时推荐
  if (!hasArgs(opts)) {
    if (opts.mode === "pull") {
      console.error(`[rui-import] scan root: ${root} (pull recommend mode)`);
      await recommendPullMode(apiUrl);
      return;
    }
    opts.scanRoot = "workspace";
  }

  // Pull mode: remote → local download
  if (opts.mode === "pull") {
    if (!API_X_TOKEN) {
      console.error("[rui-import] no API_X_TOKEN — no-token 降级，跳过 pull");
      return;
    }
    console.error(`[rui-import] pull mode: dir=${root}`);
    const result = await pullFromRemote(apiUrl, root, findProjectRoot(process.cwd()), opts.projectPrefix);
    console.error(JSON.stringify(result));
    process.exit(result.failed > 0 ? 1 : 0);
  }

  // Single-file import mode
  if (opts.file) {
    const filePath = resolve(opts.file);
    if (!existsSync(filePath)) {
      console.error(`[rui-import] file not found: ${filePath}`);
      process.exit(1);
    }
    if (!API_X_TOKEN) {
      console.error("[rui-import] no API_X_TOKEN — no-token 降级，跳过上传");
      return;
    }
    console.error(`[rui-import] single-file mode: ${filePath}`);
    console.error(`[rui-import] scan root: ${findProjectRoot(process.cwd())}`);
    console.error(`[rui-import] workspace: ${workspaceName}`);

    let existingPaths;
    try {
      existingPaths = await querySessions(apiUrl);
      console.error(`[rui-import] existing sessions: ${existingPaths.size}`);
    } catch (err) {
      console.error(`[rui-import] failed to query sessions: ${err.message}`);
      existingPaths = new Map();
    }

    try {
      const pr = findProjectRoot(process.cwd());
      const result = await uploadSingleFile(filePath, apiUrl, existingPaths, pr, workspaceName, opts.prefix);
      const remotePath = resolveRemotePath(filePath, pr, workspaceName, opts.prefix);

      console.error(`[rui-import] single-file done — ${result.status}: ${filePath} → ${remotePath}`);
      process.exit(result.status === "failed" ? 1 : 0);
    } catch (err) {
      console.error(`[rui-import] FAILED: ${err.message}`);
      process.exit(1);
    }
  }

  console.error(`[rui-import] scan root: ${root}`);
  console.error(`[rui-import] workspace: ${workspaceName}`);

  const files = await scanFiles(root, opts.exts, opts.exclude);
  console.error(`[rui-import] found ${files.length} files`);

  // List mode
  if (opts.mode === "list") {
    for (const f of files) {
      const remotePath = resolveRemotePath(f, root, workspaceName, opts.prefix);
      console.log(`${f} → ${remotePath}`);
    }
    console.error(`\n[rui-import] ${files.length} files (list mode, no upload)`);
    return;
  }

  // Import mode
  if (!API_X_TOKEN) {
    console.error("[rui-import] no API_X_TOKEN — no-token 降级，跳过上传");
    return;
  }

  console.error("[rui-import] querying existing sessions...");
  let existingPaths;
  try {
    existingPaths = await querySessions(apiUrl);
    console.error(`[rui-import] existing sessions: ${existingPaths.size}`);
  } catch (err) {
    console.error(`[rui-import] failed to query sessions: ${err.message}`);
    existingPaths = new Map();
  }

  console.error(`[rui-import] uploading ${files.length} files (concurrency=${CONCURRENCY})...`);
  const result = await uploadAll(files, apiUrl, existingPaths, root, workspaceName, opts.prefix);

  // Summary
  const { created, overwritten, failed, errors } = result;
  console.error(`[rui-import] done — created: ${created}, overwritten: ${overwritten}, failed: ${failed}`);
  if (errors.length > 0) {
    for (const e of errors) {
      console.error(`[rui-import] FAILED: ${e.file} → ${e.error}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`[rui-import] fatal: ${err.message}`);
  process.exit(0); // 不阻断管线
});
