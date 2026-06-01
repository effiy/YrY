#!/usr/bin/env node
// recommend — scan source repo, collect objective metrics for doc recommendation
// Invoked by: PM agent in /rui <需求> from-code reversal mode
// Usage: node skills/rui/recommend.mjs --root <path> [--type auto|frontend|backend|fullstack] [--format json|jsonl]

import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve, dirname, basename, sep } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { homedir } from "node:os";

// --- config ----------------------------------------------------------------
const FRONTEND_EXTS = new Set([".vue", ".jsx", ".tsx", ".svelte"]);
const BACKEND_SRC_EXTS = new Set([".ts", ".js", ".mjs", ".py", ".go", ".rs", ".java", ".rb", ".php"]);
const DEFAULT_EXCLUDES = new Set([
  ".git", "node_modules", "dist", "build", ".claude", "vendor",
  "__pycache__", ".next", ".nuxt", "target", "coverage", ".turbo"
]);
const DOC_BASE = "docs/故事任务面板";
const CHURN_DAYS = 90;
const DOC_COMPLETE_MIN_FILES = 4;
const SIGNATURE_PREVIEW_LIMIT = 10;
const COVERAGE_SIG_PREVIEW_COUNT = 3;
const PERCENT_MULTIPLIER = 100;
const NODE_ARGV_OFFSET = 2;
const DECIMAL_RADIX = 10;
const JSON_INDENT = 2;

// --- args (mirrors sync.mjs pattern) ---------------------------------------
function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  const opts = { type: "auto", format: "json" };
  let root = null;

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      showHelp();
    }
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(0, eq);
    const val = arg.slice(eq + 1);
    switch (key) {
      case "--root": root = val; break;
      case "--type": opts.type = val; break;
      case "--format": opts.format = val; break;
    }
  }

  return { root, ...opts };
}

const SKILL_NAME = "rui";

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
  if (existsSync(helpPath)) {
    try {
      execSync(`node "${helpPath}"`, { stdio: "inherit" });
      process.exit(0);
    } catch {
      // fall through to inline help
    }
  }
  // Inline help — recommend-specific, more detailed than rui/help.mjs
  const ANSI_BOLD = 1;
  const ANSI_DIM = 2;
  const ANSI_UNDERLINE = 4;
  const ANSI_GREEN = 32;
  const ANSI_YELLOW = 33;

  const { bold, underline, dim, yellow, green } = (() => {
    const make = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
    const e = { bold: make(ANSI_BOLD), underline: make(ANSI_UNDERLINE), dim: make(ANSI_DIM), yellow: make(ANSI_YELLOW), green: make(ANSI_GREEN) };
    if (!process.stdout.isTTY) { for (const k of Object.keys(e)) e[k] = (s) => s; }
    return e;
  })();

  const INDENT = "  ";
  const LEFT_COLUMN_WIDTH = 32;
  const COLUMN_MIN_PADDING = 2;
  function hdr(t) { return `\n${bold(underline(t))}\n`; }
  function item(c, d, clr) {
    const l = `${INDENT}${c}`;
    const p = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - l.length);
    return `${clr ? clr(l) : l}${" ".repeat(p)}${d}`;
  }
  function sec(t, es) { return hdr(t) + es.map(([c, d, clr]) => item(c, d, clr)).join("\n"); }
  function line(t) { return `${INDENT}${t}`; }

  const help = `
${bold("# recommend — 源码分析器")}

${dim("扫描源码 → 提取签名 → 依赖分析 → git 指标 → 文档覆盖度")}
${dim("由 PM agent 在 /rui <需求> 从源码反推模式中调用")}

${hdr("参数")}
${item("--root=<path>", "项目根目录 (必填)", yellow)}
${item("--type=auto|frontend|backend|fullstack|meta", "项目类型 (默认: auto)", yellow)}
${item("--format=json|jsonl", "输出格式 (默认: json)", yellow)}

${hdr("项目类型检测逻辑")}
${item("auto", "读取 package.json → 按依赖推断 frontend/backend/fullstack/meta", dim)}
${item("frontend", "仅扫描 .vue .jsx .tsx .svelte 文件")}
${item("backend", "仅扫描 .ts .js .mjs .py .go .rs .java .rb .php 文件")}
${item("fullstack", "扫描全部前后端源文件")}

${hdr("逐文件收集指标")}
${item("metrics", "行数 · 签名提取 (Props/Events/Routes) · 被依赖数")}
${item("git", "最后修改时间 · 作者数 · 90天变更次数 (git log)")}
${item("doc", "检查 docs/故事任务面板/<name>/ 下的文档覆盖度")}
${item("signatures", "提取: Props/Events/Routes/API 端点签名")}

${hdr("输出结构")}
${line(dim("每个 story candidate 包含:"))}
${item("storyName / command", "故事名 (kebab) + 推荐 /rui <需求> 命令", green)}
${item("sourceFiles", "源文件列表 + 关联文件 (双向 import 关系)")}
${item("coverage", "文档覆盖描述 + 期望的场景文档清单")}
${item("metrics", "总行数 · 文件数 · 签名 Top 10 · 被依赖数")}
${item("git", "最后修改 · 作者数 · 90天变更次数")}
${item("doc", "覆盖率状态: no_docs / partial / complete")}

${hdr("示例")}
${item("# 自动检测类型，扫描当前项目", "", bold)}
${item("--root=.", "输出 JSON 推荐列表到 stdout", green)}
${item("", "")}
${item("# 限定前端文件", "", bold)}
${item("--root=. --type=frontend", "仅扫描 .vue/.jsx/.tsx/.svelte", green)}
${item("", "")}
${item("# JSONL 格式 (逐行)", "", bold)}
${item("--root=/path/to/project --format=jsonl", "每行一个 story candidate JSON", green)}
${item("", "")}
${item("# 指定项目类型 + JSONL", "", bold)}
${item("--root=. --type=backend --format=jsonl", "后端文件 + 逐行输出", green)}

${hdr("管线集成")}
${line(dim("调用方: PM agent (skills/rui/SKILL.md §doc-from-code)"))}
${line(dim("流程: recommend 输出 JSON → PM 5 层评分 (L0–L4) → 排序 → 推荐列表"))}
${line(dim("评分维度: L0 时间紧急度 · L1 依赖拓扑 · L2 风险信号 · L3 覆盖缺口 · L4 质量信号"))}

${hdr("相关资源")}
${item("SKILL.md", "skills/rui/SKILL.md — rui 完整规约", dim)}
${item("help.mjs", "skills/rui/help.mjs — rui 编排器完整帮助", dim)}
`;

  console.log(help);
  process.exit(0);
}

// --- detect project type ---------------------------------------------------
function detectType(root) {
  const pj = join(root, "package.json");
  if (!existsSync(pj)) return "unknown";

  let pkg;
  try { pkg = JSON.parse(readFileSync(pj, "utf-8")); } catch { return "unknown"; }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const keys = Object.keys(deps);

  const hasFrontend = keys.some(k => /react|vue|svelte|next|nuxt|angular|solid/.test(k));
  const hasBackend = keys.some(k => /express|koa|fastify|nest|hono|elysia|hapi/.test(k));

  if (existsSync(join(root, ".claude-plugin", "plugin.json")) && !hasFrontend && !hasBackend)
    return "meta";
  if (hasFrontend && hasBackend) return "fullstack";
  if (hasFrontend) return "frontend";
  if (hasBackend) return "backend";

  // Check directory structure
  if (existsSync(join(root, "src", "routes")) || existsSync(join(root, "src", "controllers")) ||
      existsSync(join(root, "api"))) return "backend";
  if (existsSync(join(root, "src", "components")) || existsSync(join(root, "pages"))) return "frontend";

  return "unknown";
}

// --- scan: enumerate source files by type ----------------------------------
function extsForType(type) {
  if (type === "frontend") return FRONTEND_EXTS;
  if (type === "backend") return BACKEND_SRC_EXTS;
  return new Set([...FRONTEND_EXTS, ...BACKEND_SRC_EXTS]);
}

function fileType(file, projectType) {
  const ext = file.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (projectType === "frontend" || projectType === "fullstack") {
    if (FRONTEND_EXTS.has("." + ext)) return "frontend";
  }
  if (projectType === "backend" || projectType === "fullstack") {
    if (BACKEND_SRC_EXTS.has("." + ext)) return "backend";
  }
  // For "auto"/"unknown", classify by extension
  if (FRONTEND_EXTS.has("." + ext)) return "frontend";
  if (BACKEND_SRC_EXTS.has("." + ext)) return "backend";
  return null;
}

async function scanFiles(root, projectType, userExcludes = []) {
  const result = [];
  const excludes = new Set([...DEFAULT_EXCLUDES, ...userExcludes]);
  const exts = extsForType(projectType);

  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (excludes.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { await walk(full); continue; }
      if (!entry.isFile()) continue;
      const ext = entry.name.split(".").pop()?.toLowerCase();
      if (ext && exts.has("." + ext)) {
        const ft = fileType(entry.name, projectType);
        if (ft) result.push({ path: full, type: ft });
      }
    }
  }

  await walk(root);
  return result;
}

// --- extract: regex-based signature extraction -----------------------------
function extractVueSignatures(content) {
  const sigs = [];
  // Props via defineProps
  const propsMatch = content.match(/defineProps\s*\(\s*\{([^}]*)\}/s) ||
                     content.match(/defineProps\s*<\{([^}]*)\}>/s) ||
                     content.match(/defineProps\s*\(\s*\[([^\]]*)\]/s);
  if (propsMatch) {
    const raw = propsMatch[1];
    const names = [...raw.matchAll(/['"]?(\w+)['"]?\s*[:=]/g)].map(m => m[1]);
    if (names.length === 0) {
      const arrNames = [...raw.matchAll(/['"](\w+)['"]/g)].map(m => m[1]);
      if (arrNames.length) sigs.push("Props: " + arrNames.join(", "));
    } else {
      sigs.push("Props: " + names.join(", "));
    }
  }
  // Events via defineEmits
  const emitsMatch = content.match(/defineEmits\s*\(\s*\[([^\]]*)\]/s) ||
                     content.match(/defineEmits\s*<\{([^}]*)\}>/s);
  if (emitsMatch) {
    const names = [...emitsMatch[1].matchAll(/['"](\S+?)['"]/g)].map(m => m[1]);
    if (names.length) sigs.push("Events: " + names.join(", "));
  }
  // Expose
  const exposeMatch = content.match(/defineExpose\s*\(\s*\{([^}]*)\}/s);
  if (exposeMatch) {
    const names = [...exposeMatch[1].matchAll(/['"]?(\w+)['"]?\s*[,:]/g)].map(m => m[1]);
    if (names.length) sigs.push("Expose: " + names.join(", "));
  }
  // Script setup emits
  const emitCalls = [...content.matchAll(/\bemit\s*\(\s*['"](\S+?)['"]/g)].map(m => m[1]);
  if (emitCalls.length && !sigs.some(s => s.startsWith("Events:"))) {
    sigs.push("Events(emit): " + [...new Set(emitCalls)].join(", "));
  }
  return sigs;
}

function extractReactSignatures(content) {
  const sigs = [];
  // Props interface/type
  const propsMatch = content.match(/(?:interface|type)\s+(\w*Props\w*)\s*[={]/);
  if (propsMatch) sigs.push("Props: " + propsMatch[1]);
  // FC<Props> or ({ prop1, prop2 })
  const fcMatch = content.match(/(?:FC|React\.FC)\s*<(\w+)>/);
  if (fcMatch) sigs.push("Component: " + fcMatch[1]);
  // Event handlers (onXxx callbacks in props)
  const handlerNames = [...content.matchAll(/on([A-Z]\w+)\??\s*:/g)].map(m => "on" + m[1]);
  if (handlerNames.length) sigs.push("Events: " + handlerNames.join(", "));
  // export default function/const
  const exportMatch = content.match(/export\s+(?:default\s+)?(?:function|const)\s+(\w+)/);
  if (exportMatch && !sigs.some(s => s.startsWith("Component:"))) {
    sigs.push("Export: " + exportMatch[1]);
  }
  return sigs;
}

function extractSvelteSignatures(content) {
  const sigs = [];
  const exportMatch = content.match(/<script[^>]*>\s*export\s+let\s+(\w+)/g);
  if (exportMatch) {
    const names = exportMatch.map(m => m.match(/export\s+let\s+(\w+)/)[1]);
    sigs.push("Props: " + names.join(", "));
  }
  const dispatchMatch = [...content.matchAll(/dispatch\s*\(\s*['"](\S+?)['"]/g)].map(m => m[1]);
  if (dispatchMatch.length) sigs.push("Events: " + [...new Set(dispatchMatch)].join(", "));
  return sigs;
}

function extractRouteSignatures(content) {
  const sigs = [];
  // Express/Fastify/Koa style
  const routePatterns = [
    /\.(get|post|put|patch|delete|options|head)\s*\(\s*['"]([^'"]+)['"]/g,
    /router\.(get|post|put|patch|delete|options|head)\s*\(\s*['"]([^'"]+)['"]/g,
    /app\.(get|post|put|patch|delete|options|head)\s*\(\s*['"]([^'"]+)['"]/g,
  ];
  for (const pat of routePatterns) {
    const matches = [...content.matchAll(pat)];
    for (const m of matches) {
      sigs.push(m[1].toUpperCase() + " " + m[2]);
    }
  }
  // Decorator style (Nest, TypeORM, etc.)
  const decoratorMatches = [...content.matchAll(/@(?:Get|Post|Put|Patch|Delete|Options|Head)\s*\(\s*['"]([^'"]+)['"]/g)];
  for (const m of decoratorMatches) {
    const method = m[0].match(/@(\w+)/)[1];
    sigs.push(method.toUpperCase() + " " + m[1]);
  }
  // Python Flask/FastAPI
  const pyMatches = [...content.matchAll(/@(?:app|router|bp)\.(?:route|get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g)];
  for (const m of pyMatches) {
    sigs.push(m[1]);
  }
  // Go handlers
  const goMatches = [...content.matchAll(/\.HandleFunc\s*\(\s*['"](\/[^'"]+)['"]/g)];
  for (const m of goMatches) {
    sigs.push("Handle " + m[1]);
  }
  return sigs;
}

function extractSignatures(filePath, fileType) {
  let content;
  try { content = readFileSync(filePath, "utf-8"); } catch { return []; }
  if (!content) return [];

  const ext = filePath.split(".").pop()?.toLowerCase();
  try {
    if (fileType === "frontend") {
      if (ext === "vue") return extractVueSignatures(content);
      if (ext === "jsx" || ext === "tsx") return extractReactSignatures(content);
      if (ext === "svelte") return extractSvelteSignatures(content);
    }
    if (fileType === "backend") {
      return extractRouteSignatures(content);
    }
  } catch { return []; }
  return [];
}

// --- dependency: simple static import analysis -----------------------------
function buildDependencyGraph(files) {
  const deps = new Map();  // file -> [files it imports from]
  const importedBy = new Map(); // file -> [files that import it]

  for (const { path: file, type } of files) {
    deps.set(file, []);
    if (!importedBy.has(file)) importedBy.set(file, []);
  }

  for (const { path: file, type } of files) {
    let content;
    try { content = readFileSync(file, "utf-8"); } catch { continue; }
    if (!content) continue;

    // Match imports: from '...', from "...", require('...')
    const importPatterns = [
      /from\s+['"](\.[^'"]+)['"]/g,
      /require\s*\(\s*['"](\.[^'"]+)['"]/g,
      /import\s+['"](\.[^'"]+)['"]/g,
    ];

    for (const pat of importPatterns) {
      const matches = [...content.matchAll(pat)];
      for (const m of matches) {
        const importPath = m[1];
        // Resolve relative import to a known file
        const base = dirname(file);
        const candidates = [
          join(base, importPath),
          join(base, importPath + ".ts"),
          join(base, importPath + ".tsx"),
          join(base, importPath + ".js"),
          join(base, importPath + ".jsx"),
          join(base, importPath + ".vue"),
          join(base, importPath + ".svelte"),
          join(base, importPath, "index.ts"),
          join(base, importPath, "index.js"),
        ];
        for (const c of candidates) {
          if (importedBy.has(c)) {
            deps.get(file).push(c);
            importedBy.get(c).push(file);
            break;
          }
        }
      }
    }
  }

  return { deps, importedBy };
}

// --- doc: check documentation existence ------------------------------------
function deriveName(file, project) {
  const basename_no_ext = basename(file).replace(/\.[^.]+$/, "");
  // PascalCase/camelCase -> kebab-case
  const kebab = basename_no_ext
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[_]/g, "-")
    .toLowerCase();
  // Include parent dir for disambiguation (e.g., skills/rui/help.mjs -> rui-help)
  const parentDir = basename(dirname(file));
  if (parentDir && parentDir !== "." && parentDir !== "src" && parentDir !== project) {
    // Only prefix when parent is meaningful (not top-level src/ or project root)
    const parentKebab = parentDir
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[_]/g, "-")
      .toLowerCase();
    return parentKebab + "-" + kebab;
  }
  return kebab;
}

function docStatus(root, project, name) {
  const expectedDir = join(root, DOC_BASE, name);
  const dirExists = existsSync(expectedDir);
  const storyFile = join(expectedDir, '故事任务.md');
  const taskExists = existsSync(storyFile);

  let existingFiles = [];
  if (dirExists) {
    try {
      existingFiles = readdirSync(expectedDir).filter(f => f.endsWith(".md"));
    } catch { existingFiles = []; }
  }

  let status = "no_docs";
  if (taskExists && existingFiles.length >= DOC_COMPLETE_MIN_FILES) status = "complete";
  else if (taskExists && existingFiles.length >= 1) status = "partial";
  else if (dirExists && existingFiles.length > 0) status = "partial";

  return {
    expectedDir: relative(root, expectedDir),
    exists: taskExists,
    existingFiles,
    status,
  };
}

// --- git: query git log for time/author data -------------------------------
function gitMetrics(root, file) {
  try {
    const rel = relative(root, file);
    const lastModified = execSync(
      `git log -1 --format=%aI -- "${rel}"`,
      { cwd: root, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();

    const authorCount = parseInt(execSync(
      `git log --format=%an -- "${rel}"`,
      { cwd: root, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim().split("\n").filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).length, DECIMAL_RADIX) || 0;

    const recentChurn = parseInt(execSync(
      `git log --since="${CHURN_DAYS} days ago" --oneline -- "${rel}" | wc -l`,
      { cwd: root, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], shell: true }
    ).trim(), DECIMAL_RADIX) || 0;

    return { lastModified: lastModified || null, authorCount, recentChurn };
  } catch {
    return { lastModified: null, authorCount: 0, recentChurn: 0 };
  }
}

// --- line count ------------------------------------------------------------
function countLines(content) {
  if (!content) return 0;
  return content.split("\n").length;
}


// --- collect: assemble per-file metrics ------------------------------------
async function collect(root, files, project, projectType) {
  const { importedBy } = buildDependencyGraph(files);
  const results = [];

  for (const { path: file, type } of files) {
    let content;
    try { content = readFileSync(file, "utf-8"); } catch { content = ""; }

    const name = deriveName(file, project);
    const signatures = extractSignatures(file, type);
    const importedByList = (importedBy.get(file) || []).map(f => relative(root, f));
    const git = gitMetrics(root, file);
    const doc = docStatus(root, project, name + "-doc");
    const lines = countLines(content);
    const relFile = relative(root, file);

    results.push({
      file: relFile,
      name,
      type,
      metrics: { lines, signatures, importedByCount: importedByList.length, importedBy: importedByList.slice(0, SIGNATURE_PREVIEW_LIMIT) },
      git,
      doc,
    });
  }

  return results;
}

// --- group: merge related files into story candidates -----------------------
function groupIntoStories(fileResults, project, projectType) {
  const stories = [];
  const used = new Set();

  for (const f of fileResults) {
    if (used.has(f.file)) continue;

    // Collect related files: same dir + have import relationship
    const dir = dirname(f.file);
    const related = [f];
    used.add(f.file);

    if (f.metrics.importedByCount > 0) {
      for (const importer of f.metrics.importedBy) {
        if (used.has(importer)) continue;
        // Same directory → likely part of same feature
        if (dirname(importer) === dir) {
          const match = fileResults.find(r => r.file === importer);
          if (match) {
            // Check bidirectional relationship
            const importerImportsThis = match.metrics.importedBy.some(
              ib => fileResults.find(r => r.file === ib)?.file === f.file
            ) || match.metrics.importedBy.includes(f.file);
            // Also check: does the importer import anything that imports f?
            const hasSharedConsumer = match.metrics.importedBy.some(
              ib => f.metrics.importedBy.includes(ib)
            );
            if (importerImportsThis || hasSharedConsumer) {
              related.push(match);
              used.add(importer);
            }
          }
        }
      }
    }

    stories.push(buildStoryCandidate(related, project, projectType));
  }

  return stories;
}

function buildStoryCandidate(group, project, projectType) {
  const primary = group.reduce((a, b) =>
    a.metrics.importedByCount >= b.metrics.importedByCount ? a : b
  );

  // Story name: primary file's kebab name + "-doc"
  const storyName = primary.name + "-doc";
  const allSignatures = [...new Set(group.flatMap(f => f.metrics.signatures))];
  const allImportedBy = [...new Set(group.flatMap(f => f.metrics.importedBy))];
  const totalLines = group.reduce((s, f) => s + f.metrics.lines, 0);

  // Expected docs — scene-document baseline
  const expectedDocs = ["故事任务", "knowledge-graph"];

  // Coverage description
  const primarySig = allSignatures.length > 0 ? allSignatures.slice(0, COVERAGE_SIG_PREVIEW_COUNT).join("; ") : "";
  const fileCount = group.length > 1 ? ` +${group.length - 1} 关联` : "";
  const coverageDesc = primarySig
    ? `${primary.file}${fileCount} — ${primarySig}`
    : `${primary.file}${fileCount}`;

  // Git: most recent lastModified, sum churn
  const sortedByDate = group.filter(f => f.git.lastModified).sort((a, b) =>
    b.git.lastModified.localeCompare(a.git.lastModified)
  );
  const git = {
    lastModified: sortedByDate[0]?.git.lastModified || null,
    authorCount: Math.max(...group.map(f => f.git.authorCount)),
    recentChurn: group.reduce((s, f) => s + f.git.recentChurn, 0),
  };

  // Doc: use primary file's doc status
  const doc = primary.doc;

  return {
    storyName,
    command: `/rui ${storyName}`,
    storyType: "doc-from-code",
    project,
    type: projectType === "fullstack" ? primary.type : projectType,
    sourceFiles: group.map(f => f.file),
    primaryFile: primary.file,
    coverage: {
      description: coverageDesc,
      expectedDocs,
      expectedDir: doc.expectedDir,
    },
    metrics: {
      lines: totalLines,
      fileCount: group.length,
      signatures: allSignatures.slice(0, SIGNATURE_PREVIEW_LIMIT),
      importedByCount: allImportedBy.length,
      importedBy: allImportedBy.slice(0, SIGNATURE_PREVIEW_LIMIT),
    },
    git,
    doc: {
      status: doc.status,
      exists: doc.exists,
      existingFiles: doc.existingFiles,
    },
  };
}

// --- format output ---------------------------------------------------------
function formatOutput(results, format) {
  if (format === "jsonl") {
    for (const r of results) {
      process.stdout.write(JSON.stringify(r) + "\n");
    }
  } else {
    process.stdout.write(JSON.stringify(results, null, JSON_INDENT) + "\n");
  }
}

// --- summary stats ---------------------------------------------------------
function printSummary(stories) {
  const totalFiles = stories.reduce((s, st) => s + st.metrics.fileCount, 0);
  const noDocs = stories.filter(s => s.doc.status === "no_docs").length;
  const rate = stories.length > 0 ? Math.round(noDocs / stories.length * PERCENT_MULTIPLIER) : 0;
  console.error(`[recommend] ${stories.length} story candidates, ${totalFiles} source files, no-docs rate ${rate}%`);
}

// --- main ------------------------------------------------------------------
async function main() {
  const args = parseArgs();

  if (!args.root) {
    console.error("[recommend] --root is required. Use --help for usage.");
    process.exit(0);
  }

  const root = resolve(args.root);
  if (!existsSync(root)) {
    console.error(`[recommend] root not found: ${root}`);
    process.exit(0);
  }

  const project = basename(root);
  const projectType = args.type === "auto" ? detectType(root) : args.type;

  console.error(`[recommend] root: ${root}`);
  console.error(`[recommend] project: ${project}`);
  console.error(`[recommend] type: ${projectType}`);

  const files = await scanFiles(root, projectType);
  console.error(`[recommend] found ${files.length} source files`);

  const fileResults = await collect(root, files, project, projectType);
  const stories = groupIntoStories(fileResults, project, projectType);
  printSummary(stories);
  formatOutput(stories, args.format);
}

main().catch(err => {
  console.error(`[recommend] error: ${err.message}`);
  process.exit(0);
});
