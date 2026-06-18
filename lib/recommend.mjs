#!/usr/bin/env node
// recommend — scan source repo, collect objective metrics for doc recommendation
// Invoked by: PM agent in /rui doc --from-code explore mode
// Usage: node lib/recommend.mjs --root <path> [--type auto|frontend|backend|fullstack] [--format json|jsonl]

import { join, relative, resolve, dirname, basename } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

import { STORY_PANEL_DIR } from "./constants.mjs";
const DOC_BASE = STORY_PANEL_DIR;
const CHURN_DAYS = 90;
const DOC_COMPLETE_MIN_FILES = 4;
const SIGNATURE_PREVIEW_LIMIT = 10;
const COVERAGE_SIG_PREVIEW_COUNT = 3;
const JSON_INDENT = 2;

import { parseArgs } from "./recommend-cli.mjs";
import { detectType, scanFiles } from "./recommend-detect.mjs";

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
function toKebab(s) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[_]/g, "-")
    .toLowerCase();
}

function deriveName(file, project) {
  const kebab = toKebab(basename(file).replace(/\.[^.]+$/, ""));
  const parentDir = basename(dirname(file));
  if (parentDir && parentDir !== "." && parentDir !== "src" && parentDir !== project) {
    return toKebab(parentDir) + "-" + kebab;
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

// --- line count ------------------------------------------------------------
function countLines(content) {
  if (!content) return 0;
  return content.split("\n").length;
}

// --- security signals -------------------------------------------------------
function securitySignals(content, _type) {
  if (!content) return { hasUserInput: false, hasAuth: false, hasApiCall: false };
  const patterns = {
    hasUserInput: /readline|prompt|stdin|input|form|req\.body|req\.query|req\.params|process\.argv|process\.env|userInput/i,
    hasAuth: /auth|token|session|login|password|credential|oauth|jwt|api.*key|bearer/i,
    hasApiCall: /fetch|axios|http\.request|http\.get|https\.request|curl|api\.|\.post\(|\.get\(|\.put\(|\.delete\(/i,
  };
  return {
    hasUserInput: patterns.hasUserInput.test(content),
    hasAuth: patterns.hasAuth.test(content),
    hasApiCall: patterns.hasApiCall.test(content),
  };
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
      metrics: { lines, signatures, importedByCount: importedByList.length, importedBy: importedByList.slice(0, SIGNATURE_PREVIEW_LIMIT) },
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

  // Expected docs — unified 10-document baseline, type determines chapter cropping
  const expectedDocs = ["故事任务", "使用场景", "技术评审", "测试设计", "安全审计", "实施报告", "测试报告", "自改进复盘"];

  // Coverage description
  const primarySig = allSignatures.length > 0 ? allSignatures.slice(0, COVERAGE_SIG_PREVIEW_COUNT).join("; ") : "";
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

  return {
    storyName,
    command: `/rui doc --from-code ${storyName}`,
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
    process.stdout.write(JSON.stringify(results, null, JSON_INDENT) + "\n");
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
    process.exit(1);
  }

  const root = resolve(args.root);
  if (!existsSync(root)) {
    console.error(`[recommend] root not found: ${root}`);
    process.exit(1);
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
  process.exit(1);
});
