#!/usr/bin/env node
// recommend — scan source repo, collect objective metrics for doc recommendation
// Invoked by: PM agent in /rui doc --from-code explore mode
// Usage: node skills/rui/recommend.mjs --root <path> [--type auto|frontend|backend|fullstack] [--format json|jsonl]

import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve, dirname, basename, sep } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

// --- config ----------------------------------------------------------------
const FRONTEND_EXTS = new Set([".vue", ".jsx", ".tsx", ".svelte"]);
const BACKEND_SRC_EXTS = new Set([".ts", ".js", ".mjs", ".py", ".go", ".rs", ".java", ".rb", ".php"]);
const DEFAULT_EXCLUDES = new Set([
  ".git", "node_modules", "dist", "build", ".claude", "vendor",
  "__pycache__", ".next", ".nuxt", "target", "coverage", ".turbo"
]);
const DOC_BASE = "docs/故事任务面板";
const CHURN_DAYS = 90;

// --- args (mirrors sync.mjs pattern) ---------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
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

function showHelp() {
  const { bold, underline, dim } = (() => {
    const e = { bold: (s) => `\x1b[1m${s}\x1b[22m`, underline: (s) => `\x1b[4m${s}\x1b[24m`, dim: (s) => `\x1b[2m${s}\x1b[22m` };
    if (!process.stdout.isTTY) return { bold: (s) => s, underline: (s) => s, dim: (s) => s };
    return e;
  })();

  const INDENT = "  ";

  function hdr(text) {
    return `\n${bold(underline(text))}\n`;
  }

  function item(cmd, desc) {
    const left = `${INDENT}${cmd}`;
    const pad = Math.max(2, 28 - left.length);
    return `${left}${" ".repeat(pad)}${desc}`;
  }

  function section(title, entries) {
    return hdr(title) + entries.map(([c, d]) => item(c, d)).join("\n");
  }

  const help = `
${bold("# recommend — 源码分析器，收集客观指标用于文档推荐")}

${dim("扫描源码 → 提取签名 → 依赖分析 → git 指标 → 文档覆盖度 → 外部参考")}

${section("参数", [
  ["--root=<path>", "项目根目录 (必填)"],
  ["--type=auto|frontend|backend|fullstack", "项目类型 (默认: auto)"],
  ["--format=json|jsonl", "输出格式 (默认: json)"],
])}

${section("示例", [
  ["# 自动检测项目类型", ""],
  ["--root=/path/to/project", "扫描源码 → 输出 JSON 推荐列表"],
  ["", ""],
  ["# 指定项目类型", ""],
  ["--root=. --type=frontend", "限定前端文件扫描"],
  ["--root=. --type=backend", "限定后端文件扫描"],
  ["", ""],
  ["# JSONL 输出", ""],
  ["--root=. --format=jsonl", "每行一个 story candidate"],
])}

${section("输出", [
  ["storyName / command", "故事名 + 推荐命令"],
  ["sourceFiles / coverage", "源码文件 + 文档覆盖度"],
  ["metrics", "行数 · 签名 · 依赖数"],
  ["git", "最后修改 · 作者数 · 近期变更"],
  ["security", "用户输入 · 认证 · API 调用信号"],
  ["externalRefs", "匹配的生态系统参考资源"],
])}

${dim("被调用: skills/rui/SKILL.md §doc-from-code | 输出: PM agent 评分排序")}
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
  const storyFile = join(expectedDir, `${project}-01-故事任务.md`);
  const taskExists = existsSync(storyFile);

  let existingFiles = [];
  if (dirExists) {
    try {
      existingFiles = readdirSync(expectedDir).filter(f => f.endsWith(".md"));
    } catch { existingFiles = []; }
  }

  let status = "no_docs";
  if (taskExists && existingFiles.length >= 4) status = "complete";
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
    ).trim().split("\n").filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).length, 10) || 0;

    const recentChurn = parseInt(execSync(
      `git log --since="${CHURN_DAYS} days ago" --oneline -- "${rel}" | wc -l`,
      { cwd: root, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], shell: true }
    ).trim(), 10) || 0;

    return { lastModified: lastModified || null, authorCount, recentChurn };
  } catch {
    return { lastModified: null, authorCount: 0, recentChurn: 0 };
  }
}

// --- external refs: map module characteristics to ecosystem references -------
const EXTERNAL_REFS = {
  methodology: [
    { name: "superpowers", url: "https://github.com/obra/superpowers",
      desc: "AI agent 软件开发方法论：spec-driven、验证门禁、行为纪律", tags: ["spec", "gate", "discipline", "security"] },
    { name: "get-shit-done", url: "https://github.com/gsd-build/get-shit-done/tree/main",
      desc: "轻量级元提示与上下文工程，专注上下文退化问题", tags: ["context", "spec", "architecture"] },
    { name: "mattpocock-skills", url: "https://github.com/mattpocock/skills",
      desc: "真实工程场景 Agent skills，非 vibe coding", tags: ["component", "engineering", "frontend"] },
  ],
  memory: [
    { name: "claude-mem", url: "https://github.com/thedotmack/claude-mem",
      desc: "跨会话持久化记忆引擎，AI 压缩 + 相似检索", tags: ["memory", "state", "context"] },
    { name: "everything-claude-code", url: "https://github.com/affaan-m/everything-claude-code",
      desc: "Agent harness 性能优化全集：skills、记忆、安全", tags: ["memory", "perf", "security", "organization"] },
  ],
  ux: [
    { name: "ui-ux-pro-max", url: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill",
      desc: "跨平台专业 UI/UX 设计，161 推理规则 67 UI 风格", tags: ["ui", "design", "component", "frontend"] },
  ],
};

function externalRefs(story) {
  const refs = [];
  const tags = new Set();

  // Frontend / UI modules
  if (story.type === "frontend" || story.type === "fullstack") {
    tags.add("frontend"); tags.add("component"); tags.add("ui");
  }
  // Backend / API modules
  if (story.type === "backend" || story.type === "fullstack") {
    tags.add("spec"); tags.add("architecture");
  }
  // Security signals
  if (story.security.hasAuth) { tags.add("security"); tags.add("gate"); tags.add("discipline"); }
  if (story.security.hasUserInput) { tags.add("security"); }
  // Hub modules (architecture importance)
  if (story.metrics.importedByCount >= 3) { tags.add("architecture"); tags.add("context"); }
  // Large modules
  if (story.metrics.lines > 200) { tags.add("engineering"); }
  // State-related (heuristic: files named store/state/model)
  const statePattern = /\b(store|state|model|context|memory|reducer|atom)\b/i;
  if (story.sourceFiles.some(f => statePattern.test(f))) {
    tags.add("state"); tags.add("memory");
  }

  for (const [category, entries] of Object.entries(EXTERNAL_REFS)) {
    for (const entry of entries) {
      const matchCount = entry.tags.filter(t => tags.has(t)).length;
      if (matchCount >= 2) {
        refs.push({ category, name: entry.name, url: entry.url, desc: entry.desc, relevance: "high" });
      } else if (matchCount === 1) {
        refs.push({ category, name: entry.name, url: entry.url, desc: entry.desc, relevance: "normal" });
      }
    }
  }

  // Deduplicate, prefer high relevance
  const seen = new Map();
  for (const r of refs) {
    const existing = seen.get(r.name);
    if (!existing || (r.relevance === "high" && existing.relevance !== "high")) {
      seen.set(r.name, r);
    }
  }

  return [...seen.values()];
}

// --- security: keyword-based signal detection ------------------------------
function securitySignals(content, fileType) {
  const hasUserInput = /v-model|form|input|req\.body|req\.query|req\.params|request\.form|request\.json|read_from_stdin|scanf|gets/i.test(content);
  const hasAuth = /auth|token|jwt|session|login|logout|password|credential|oauth|passport|authenticate|guard|middleware.*auth/i.test(content);
  const hasApiCall = /fetch\s*\(|axios|\.get\s*\(|\.post\s*\(|\.put\s*\(|\.patch\s*\(|\.delete\s*\(|request\s*\(|http\./i.test(content);
  return { hasUserInput, hasAuth, hasApiCall };
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
    const sec = securitySignals(content, type);
    const relFile = relative(root, file);

    results.push({
      file: relFile,
      name,
      type,
      metrics: { lines, signatures, importedByCount: importedByList.length, importedBy: importedByList.slice(0, 10) },
      git,
      doc,
      security: sec,
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

  // Expected docs based on project type
  const expectedDocs = projectType === "frontend" ? ["01", "03", "04"] :
    projectType === "backend" ? ["01", "02", "04"] :
    ["01", "02", "03", "04"];

  // Coverage description
  const primarySig = allSignatures.length > 0 ? allSignatures.slice(0, 3).join("; ") : "";
  const fileCount = group.length > 1 ? ` +${group.length - 1} 关联` : "";
  const coverageDesc = primarySig
    ? `${primary.file}${fileCount} — ${primarySig}`
    : `${primary.file}${fileCount}`;

  // Security: OR across group
  const security = {
    hasUserInput: group.some(f => f.security.hasUserInput),
    hasAuth: group.some(f => f.security.hasAuth),
    hasApiCall: group.some(f => f.security.hasApiCall),
  };

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

  // Assemble story object first for external refs
  const story = { type: projectType === "fullstack" ? primary.type : projectType, security, metrics: { lines: totalLines, importedByCount: allImportedBy.length }, sourceFiles: group.map(f => f.file) };
  const refs = externalRefs(story);

  return {
    externalRefs: refs,
    storyName,
    command: `/rui doc --from-code ${project}-${storyName}`,
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
      signatures: allSignatures.slice(0, 10),
      importedByCount: allImportedBy.length,
      importedBy: allImportedBy.slice(0, 10),
    },
    git,
    doc: {
      status: doc.status,
      exists: doc.exists,
      existingFiles: doc.existingFiles,
    },
    security,
  };
}

// --- format output ---------------------------------------------------------
function formatOutput(results, format) {
  if (format === "jsonl") {
    for (const r of results) {
      process.stdout.write(JSON.stringify(r) + "\n");
    }
  } else {
    process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  }
}

// --- summary stats ---------------------------------------------------------
function printSummary(stories) {
  const totalFiles = stories.reduce((s, st) => s + st.metrics.fileCount, 0);
  const noDocs = stories.filter(s => s.doc.status === "no_docs").length;
  const rate = stories.length > 0 ? Math.round(noDocs / stories.length * 100) : 0;
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
