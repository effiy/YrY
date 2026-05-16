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
      console.log(`Usage: node recommend.mjs [options]

Options:
  --root=<path>          Project root directory to scan (required)
  --type=auto|frontend|backend|fullstack
                         Project type (default: auto)
  --format=json|jsonl    Output format (default: json)
`);
      process.exit(0);
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
  const expectedDir = join(root, DOC_BASE, project, name);
  const dirExists = existsSync(expectedDir);
  const storyFile = join(expectedDir, "01-故事任务.md");
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
    const doc = docStatus(root, project, name);
    const lines = countLines(content);
    const sec = securitySignals(content, type);

    results.push({
      file: relative(root, file),
      project,
      name,
      type,
      metrics: {
        lines,
        signatures,
        importedByCount: importedByList.length,
        importedBy: importedByList.slice(0, 10), // top 10 for readability
      },
      git,
      doc,
      security: sec,
    });
  }

  return results;
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

  const results = await collect(root, files, project, projectType);
  formatOutput(results, args.format);
}

main().catch(err => {
  console.error(`[recommend] error: ${err.message}`);
  process.exit(0);
});
