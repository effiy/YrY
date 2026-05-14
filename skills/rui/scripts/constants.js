// Semantic constants — single source of truth for all thresholds, weights, and limits.
// Import: const C = require('./constants.js');

// ── Content validation ───────────────────────────────────────────

const MIN_AGENT_CONTENT_LENGTH = 100;
const MIN_PHILOSOPHY_DESC_LENGTH = 2;

// ── Project type detection ───────────────────────────────────────

const MAX_FILE_COUNT_FOR_SCORING = 20;          // Cap per-extension file count to avoid skew
const FRONTEND_EXTENSION_WEIGHTS = {             // Weight per extension type
  '.vue': 3, '.jsx': 2, '.tsx': 2,
  '.svelte': 3, '.scss': 1, '.less': 1,
};
const BACKEND_EXTENSION_WEIGHTS = {
  '.go': 3, '.py': 2, '.java': 2,
  '.rs': 2, '.sql': 1, '.proto': 2,
};
const FRAMEWORK_DEPENDENCY_WEIGHT = 3;           // Weight for framework in package.json
const API_PATTERN_WEIGHT = 2;                    // Weight for API route pattern detection
const API_PATTERN_SCAN_MAX_FILES = 20;           // Max files to scan for API patterns
const API_PATTERN_SCAN_CONTENT_BYTES = 2000;     // First N bytes to read per file

// ── Code analysis ────────────────────────────────────────────────

const LARGE_FILE_LINE_THRESHOLD = 300;            // Files >= this many lines are cohesion risks
const LARGE_FILES_TOP_N = 15;                     // How many large files to report
const GIT_HEATMAP_TOP_N = 20;                     // How many files in git heatmap
const DEPENDENCY_SCAN_MAX_FILES = 50;             // Max files to grep for dependency scanning
const DEPENDENCY_ANALYSIS_MAX_FILES = 30;         // Max files to read for dependency analysis
const DEPENDENCY_HOTSPOTS_TOP_N = 10;             // How many hotspots to report

// ── Diagnosis thresholds ─────────────────────────────────────────

const BLOCKED_RATE_HIGH = 0.20;                   // D1: 阻断率 > 20%
const P0_DENSITY_HIGH_MULTIPLIER = 2;             // D2: P0 密度 > 平均值 2x
const T3_CHANGE_RATIO_HIGH = 0.30;                // D3: T3 变更占比 > 30%
const GATE_B_MAX_ROUNDS = 2;                      // D4: Gate B > 2 轮
const PHASE_DURATION_HIGH_MULTIPLIER = 3;         // D5: 阶段耗时 > 平均值 3x
const CONSECUTIVE_DEGRADING_WINDOWS = 2;          // D6: 连续 N 窗口退化
const PROPOSAL_BACKLOG_RATIO = 2;                 // D7: 开放提案 > 已完成 N 倍
const PROPOSAL_BACKLOG_MIN_TOTAL = 5;             // D7: 且提案总量 > N

// ── Effect evaluation ────────────────────────────────────────────

const EVAL_WINDOW_DAYS = 28;                      // Before/after window for proposal evaluation
const HIGH_CONFIDENCE_MIN_RECORDS = 5;             // ≥ N per period for high confidence
const MEDIUM_CONFIDENCE_MIN_RECORDS = 3;            // ≥ N per period for medium confidence

// ── Health scoring ───────────────────────────────────────────────

const HEALTH_STABILITY_BENCHMARK = 0.70;           // Target 70% T1 ratio for full stability score
const HEALTH_P0_PENALTY_FACTOR = 200;              // Each 1% P0 rate costs N points
const HEALTH_BLOCKED_PENALTY_FACTOR = 200;         // Each 1% blocked rate costs N points
const HEALTH_COHESION_PENALTY_PER_FILE = 15;       // Each large file costs N points
const HEALTH_WEIGHTS = {                           // Dimension weights for composite score
  stability: 0.20,
  quality: 0.25,
  blocked: 0.20,
  closure: 0.20,
  cohesion: 0.15,
};
const HEALTH_DIM_LOW_THRESHOLD = 70;               // Dimension score below this needs attention

// ── Retro & trends ───────────────────────────────────────────────

const DEFAULT_RETRO_WEEKS = 8;                     // Default retro/tend analysis window
const RETRO_WINDOW_SIZE_DAYS = 14;                 // Days per retro sliding window
const CLOSURE_RATE_LOW_THRESHOLD = 0.50;           // Below 50% closure rate needs attention

// ── Recommendation limits ────────────────────────────────────────

const DEFAULT_RECOMMENDATION_LIMIT = 10;           // Default --limit for recommend.js
const MAX_OPEN_P0_RECS = 3;                         // Max P0 proposal items in recommendations
const MAX_OPEN_P1_RECS = 3;                         // Max P1 proposal items in recommendations
const MAX_DEGRADING_SIGNAL_RECS = 2;               // Max degrading signal items
const MAX_LARGE_FILE_RECS = 2;                      // Max large file items in recommendations
const MAX_LOW_HEALTH_DIM_RECS = 2;                  // Max low health dimension items
const PROPOSAL_BACKLOG_MIN_ACTIVE = 3;              // Min active proposals to check for backlog

// ── Document type definitions ──────────────────────────────────────

const DOC_TYPE_STORY = 'story';
const DOC_TYPE_COMPONENT = 'component-doc';
const DOC_TYPE_API = 'api-doc';
const DOC_TYPE_PAGE = 'page-doc';
const DOC_TYPE_DOMAIN = 'domain-doc';

const DOC_DIR_TYPES = {
  '故事任务面板': {
    type: DOC_TYPE_STORY,
    label: '故事任务文档',
    expectedFiles: [],  // story files vary by project type; checked separately
    hasCodePhases: true,
  },
  '组件文档': {
    type: DOC_TYPE_COMPONENT,
    label: '组件参考文档',
    expectedFiles: ['00-索引.md', '01-组件概述.md', '02-状态与依赖.md', '03-样式与交互.md', '04-操作场景.md'],
    hasCodePhases: false,
  },
  '接口文档': {
    type: DOC_TYPE_API,
    label: '接口参考文档',
    expectedFiles: ['00-索引.md', '01-接口概述.md', '02-数据模型.md', '03-中间件与安全.md', '04-操作场景.md'],
    hasCodePhases: false,
  },
  '页面文档': {
    type: DOC_TYPE_PAGE,
    label: '页面参考文档',
    expectedFiles: ['00-索引.md', '01-页面概述.md', '02-组件编排.md', '03-交互流程.md', '04-操作场景.md'],
    hasCodePhases: false,
  },
  '领域模型': {
    type: DOC_TYPE_DOMAIN,
    label: '领域参考文档',
    expectedFiles: ['00-索引.md', '01-领域概述.md', '02-实体模型.md', '03-领域服务.md', '04-操作场景.md'],
    hasCodePhases: false,
  },
};

const VALID_DOC_TYPE_DIRS = Object.keys(DOC_DIR_TYPES);

/**
 * Resolve a name-or-path input to a canonical doc descriptor.
 *
 * Rules:
 *  - If input contains '/': treat as a path under docs/. Strip leading/trailing
 *    slashes, prepend 'docs/' if missing, then split into
 *    docs/{docTypeDir}/{project}/{resourceName}/.
 *  - If input has no '/': parse as {project}-{name} story name shorthand,
 *    map to docs/故事任务面板/{project}/{name}/.
 *
 * @param {string} nameOrPath
 * @param {string} repoRoot  absolute path to repo root (default process.cwd())
 * @returns {{ valid: boolean, reason: string|null, dirType: string, docTypeDir: string,
 *             docPath: string, fullPath: string, project: string, resourceName: string,
 *             storyboard: string|null, hasCodePhases: boolean }}
 */
function resolveDocPath(nameOrPath, repoRoot) {
  const fs = require('fs');
  const path = require('path');
  const root = repoRoot || process.cwd();

  // ── Path format (contains '/') ──
  if (nameOrPath.includes('/')) {
    let rel = nameOrPath.replace(/^\.?\//, '').replace(/\/+$/, '');
    if (!rel.startsWith('docs/')) rel = 'docs/' + rel;
    const segments = rel.split('/');
    // segments: ['docs', docTypeDir, project, resourceName]
    if (segments.length < 4) {
      return { valid: false, reason: `路径深度不足，需要 docs/{文档类}/{project}/{name}（当前: ${rel}）`, dirType: null, docTypeDir: null, docPath: null, fullPath: null, project: null, resourceName: null, storyboard: null, hasCodePhases: false };
    }
    const docTypeDir = segments[1];
    const project = segments[2];
    const resourceName = segments.slice(3).join('/');
    if (!VALID_DOC_TYPE_DIRS.includes(docTypeDir)) {
      return { valid: false, reason: `未知文档类 "${docTypeDir}"，有效值: ${VALID_DOC_TYPE_DIRS.join(', ')}`, dirType: null, docTypeDir: null, docPath: null, fullPath: null, project: null, resourceName: null, storyboard: null, hasCodePhases: false };
    }
    const docPath = `docs/${docTypeDir}/${project}/${resourceName}/`;
    const fullPath = path.join(root, docPath);

    // Verify directory exists
    let exists = false;
    try { exists = fs.statSync(fullPath).isDirectory(); } catch {}
    if (!exists) {
      return { valid: false, reason: `目录不存在: ${docPath}`, dirType: null, docTypeDir: null, docPath, fullPath, project, resourceName, storyboard: null, hasCodePhases: false };
    }

    const dirCfg = DOC_DIR_TYPES[docTypeDir];
    const storyboard = dirCfg.type === DOC_TYPE_STORY
      ? `${docPath}01-故事任务.md`
      : (dirCfg.expectedFiles.length > 0 ? `${docPath}${dirCfg.expectedFiles[0]}` : null);

    return {
      valid: true, reason: null,
      dirType: dirCfg.type,
      docTypeDir,
      docPath, fullPath,
      project, resourceName,
      storyboard,
      hasCodePhases: dirCfg.hasCodePhases,
    };
  }

  // ── Name format (no '/') — story name shorthand ──
  // parse as {project}-{name}
  const parts = nameOrPath.split('-');
  if (parts.length < 2) {
    return { valid: false, reason: `缺少项目前缀（格式: <project>-<name> 或 docs/...路径）`, dirType: null, docTypeDir: null, docPath: null, fullPath: null, project: null, resourceName: null, storyboard: null, hasCodePhases: false };
  }
  let project = null;
  let story = nameOrPath;
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] && /^[a-z]/.test(parts[i])) {
      project = parts.slice(0, i).join('-');
      story = parts.slice(i).join('-');
      break;
    }
  }
  if (!project) {
    return { valid: false, reason: '无法识别项目前缀（故事部分应以小写字母开头）', dirType: null, docTypeDir: null, docPath: null, fullPath: null, project: null, resourceName: null, storyboard: null, hasCodePhases: false };
  }

  const docTypeDir = '故事任务面板';
  const docPath = `docs/${docTypeDir}/${project}/${story}/`;
  const fullPath = path.join(root, docPath);
  const storyboard = `${docPath}01-故事任务.md`;

  return {
    valid: true, reason: null,
    dirType: DOC_TYPE_STORY,
    docTypeDir,
    docPath, fullPath,
    project, resourceName: story,
    storyboard,
    hasCodePhases: true,
  };
}

function expectedFiles(dirType) {
  for (const cfg of Object.values(DOC_DIR_TYPES)) {
    if (cfg.type === dirType) return cfg.expectedFiles;
  }
  return [];
}

// ── Shared utility functions ─────────────────────────────────────

/**
 * Parse a story directory name into project + story parts.
 * Convention: <Project>-<story-slug> where story slug starts with lowercase.
 * @param {string} name - e.g. "YiWeb-user-login"
 * @returns {{ valid: boolean, project: string|null, story: string, reason: string|null }}
 */
function parseStoryDirName(name) {
  const parts = name.split('-');
  if (parts.length < 2) return { valid: false, project: null, story: name, reason: '缺少项目前缀（格式: <project>-<name>）' };
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] && /^[a-z]/.test(parts[i])) {
      return { valid: true, project: parts.slice(0, i).join('-'), story: parts.slice(i).join('-'), reason: null };
    }
  }
  return { valid: false, project: null, story: name, reason: '无法识别项目前缀（故事部分应以小写字母开头）' };
}

/**
 * Shell exec helper — runs a command and returns trimmed stdout, or fallback on error.
 * @param {string} cmd
 * @param {string} [fallback='']
 * @param {string} [cwd]
 * @returns {string}
 */
function sh(cmd, fallback = '', cwd) {
  const { execSync } = require('child_process');
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], cwd: cwd || process.cwd() }).trim();
  } catch { return fallback; }
}

/**
 * Shell exec helper that parses JSON output.
 * @param {string} cmd
 * @param {string} [cwd]
 * @returns {any|null}
 */
function shJson(cmd, cwd) {
  const out = sh(cmd, '', cwd);
  if (!out) return null;
  try { return JSON.parse(out); } catch { return null; }
}

/**
 * Detect project type by scanning file extensions, package.json frameworks,
 * API/server patterns, and meta-project signals. Single source of truth used by
 * both init.js (baseline injection) and recommend.js (recommendations).
 *
 * @param {string} [repoRoot] absolute path to repo root (default process.cwd())
 * @returns {{
 *   type: 'frontend'|'backend'|'fullstack'|'meta'|'unknown',
 *   coderFormula: { text: string, variant: string, focus: string },
 *   frontendScore: number, backendScore: number, indicators: string[]
 * }}
 */
function detectProjectType(repoRoot) {
  const fs = require('fs');
  const path = require('path');
  const root = repoRoot || process.cwd();
  const indicators = [];
  let frontendScore = 0, backendScore = 0;

  // File-extension signals (shell find — fast, ignores node_modules/.git)
  for (const [ext, weight] of Object.entries(FRONTEND_EXTENSION_WEIGHTS)) {
    const count = parseInt(sh(`find . -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l`, '0', root), 10) || 0;
    if (count > 0) {
      frontendScore += weight * Math.min(count, MAX_FILE_COUNT_FOR_SCORING);
      indicators.push(`${count} ${ext} 文件`);
    }
  }
  for (const [ext, weight] of Object.entries(BACKEND_EXTENSION_WEIGHTS)) {
    const count = parseInt(sh(`find . -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l`, '0', root), 10) || 0;
    if (count > 0) {
      backendScore += weight * Math.min(count, MAX_FILE_COUNT_FOR_SCORING);
      indicators.push(`${count} ${ext} 文件`);
    }
  }

  // Framework signals from package.json
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const feFrameworks = ['react', 'vue', 'svelte', 'angular', 'next', 'nuxt', 'vite', 'webpack'];
    const beFrameworks = ['express', 'koa', 'fastify', 'hapi', 'nestjs'];
    for (const fw of feFrameworks) {
      if (deps[fw]) { frontendScore += FRAMEWORK_DEPENDENCY_WEIGHT; indicators.push(`依赖: ${fw}`); }
    }
    for (const fw of beFrameworks) {
      if (deps[fw]) { backendScore += FRAMEWORK_DEPENDENCY_WEIGHT; indicators.push(`依赖: ${fw}`); }
    }
  } catch { /* no package.json */ }

  // API/server pattern signal (scan first N source files)
  const apiFiles = sh(
    `find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/skills/*" -not -path "*/agents/*" -not -path "*/rules/*" | head -${API_PATTERN_SCAN_MAX_FILES}`,
    '', root
  );
  if (apiFiles) {
    for (const line of apiFiles.split('\n').filter(Boolean)) {
      try {
        const content = fs.readFileSync(path.join(root, line), 'utf8').slice(0, API_PATTERN_SCAN_CONTENT_BYTES);
        if (/\b(router\.|app\.(get|post|put|delete|patch)|@app\.route|@router\.|func\s+\w+.*http\.|class\s+\w+Controller|@RestController|@RequestMapping)\b/.test(content)) {
          backendScore += API_PATTERN_WEIGHT;
          indicators.push(`API 模式: ${path.basename(line)}`);
          break;
        }
      } catch { /* skip */ }
    }
  }

  // Meta-project signals (Claude Code plugin layout)
  const isMeta = fs.existsSync(path.join(root, '.claude-plugin', 'plugin.json')) ||
    (fs.existsSync(path.join(root, 'agents')) && fs.existsSync(path.join(root, 'skills')) && !apiFiles);

  let type;
  if (frontendScore > backendScore && frontendScore > 0) type = 'frontend';
  else if (backendScore > frontendScore && backendScore > 0) type = 'backend';
  else if (frontendScore > 0 && backendScore > 0) type = 'fullstack';
  else if (isMeta) type = 'meta';
  else type = 'unknown';

  return { type, coderFormula: getCoderFormula(type), frontendScore, backendScore, indicators };
}

/**
 * Coder formula by project type.
 * @param {'frontend'|'backend'|'fullstack'|'meta'|'unknown'} type
 * @returns {{ text: string, variant: string, focus: string }}
 */
function getCoderFormula(type) {
  const formulas = {
    frontend: { text: '组件树 → Props/Events/Expose → 状态流', variant: '组件化', focus: '组件接口契约与状态管理' },
    backend: { text: '模块 → 接口 → 数据流', variant: '领域模型', focus: '领域模型完整性与API契约' },
    fullstack: { text: '模块 → 接口 → 数据流 + 组件树 → Props/Events → 状态流', variant: '前后端分离', focus: '前后端契约对齐与数据流完整性' },
    meta: { text: '模块 → 接口 → 数据流', variant: '插件/配置', focus: '规则完整性与集成契约' },
    unknown: { text: '模块 → 接口 → 数据流', variant: '通用', focus: '模块划分与接口定义' },
  };
  return formulas[type] || formulas.unknown;
}

/**
 * Human-readable label for a project type.
 * @param {string} type
 * @returns {string}
 */
function labelForType(type) {
  return { frontend: '前端', backend: '后端', fullstack: '全栈', meta: '元项目(插件/配置)', unknown: '未知' }[type] || '未知';
}

/**
 * Discover all doc names across all VALID_DOC_TYPE_DIRS by scanning two levels:
 * docs/<type>/<project>/<resource>. Story dirs return as "<project>-<resource>"
 * (dash-joined shorthand), other types return as "<typeDir>/<project>/<resource>".
 *
 * Async to keep parity with rui-state / delivery-gate callers.
 * @param {string} [repoRoot] defaults to process.cwd()
 * @returns {Promise<string[]>} sorted list of names
 */
async function findAllDocNames(repoRoot) {
  const fsp = require('fs').promises;
  const path = require('path');
  const root = repoRoot || process.cwd();
  const names = [];
  for (const docTypeDir of VALID_DOC_TYPE_DIRS) {
    const typeDir = path.join(root, 'docs', docTypeDir);
    let projectDirs = [];
    try { projectDirs = await fsp.readdir(typeDir, { withFileTypes: true }); } catch { continue; }
    for (const proj of projectDirs) {
      if (!proj.isDirectory() || proj.name.startsWith('.')) continue;
      const projPath = path.join(typeDir, proj.name);
      let resourceDirs = [];
      try { resourceDirs = await fsp.readdir(projPath, { withFileTypes: true }); } catch { continue; }
      for (const resource of resourceDirs) {
        if (!resource.isDirectory() || resource.name.startsWith('.')) continue;
        if (docTypeDir === '故事任务面板') {
          names.push(`${proj.name}-${resource.name}`);
        } else {
          names.push(`${docTypeDir}/${proj.name}/${resource.name}`);
        }
      }
    }
  }
  return names.sort();
}

module.exports = {
  // Shared utilities
  parseStoryDirName,
  sh,
  shJson,
  findAllDocNames,
  detectProjectType,
  getCoderFormula,
  labelForType,

  // Content validation
  MIN_AGENT_CONTENT_LENGTH,
  MIN_PHILOSOPHY_DESC_LENGTH,

  // Project type detection
  MAX_FILE_COUNT_FOR_SCORING,
  FRONTEND_EXTENSION_WEIGHTS,
  BACKEND_EXTENSION_WEIGHTS,
  FRAMEWORK_DEPENDENCY_WEIGHT,
  API_PATTERN_WEIGHT,
  API_PATTERN_SCAN_MAX_FILES,
  API_PATTERN_SCAN_CONTENT_BYTES,

  // Code analysis
  LARGE_FILE_LINE_THRESHOLD,
  LARGE_FILES_TOP_N,
  GIT_HEATMAP_TOP_N,
  DEPENDENCY_SCAN_MAX_FILES,
  DEPENDENCY_ANALYSIS_MAX_FILES,
  DEPENDENCY_HOTSPOTS_TOP_N,

  // Diagnosis thresholds
  BLOCKED_RATE_HIGH,
  P0_DENSITY_HIGH_MULTIPLIER,
  T3_CHANGE_RATIO_HIGH,
  GATE_B_MAX_ROUNDS,
  PHASE_DURATION_HIGH_MULTIPLIER,
  CONSECUTIVE_DEGRADING_WINDOWS,
  PROPOSAL_BACKLOG_RATIO,
  PROPOSAL_BACKLOG_MIN_TOTAL,

  // Effect evaluation
  EVAL_WINDOW_DAYS,
  HIGH_CONFIDENCE_MIN_RECORDS,
  MEDIUM_CONFIDENCE_MIN_RECORDS,

  // Health scoring
  HEALTH_STABILITY_BENCHMARK,
  HEALTH_P0_PENALTY_FACTOR,
  HEALTH_BLOCKED_PENALTY_FACTOR,
  HEALTH_COHESION_PENALTY_PER_FILE,
  HEALTH_WEIGHTS,
  HEALTH_DIM_LOW_THRESHOLD,

  // Retro & trends
  DEFAULT_RETRO_WEEKS,
  RETRO_WINDOW_SIZE_DAYS,
  CLOSURE_RATE_LOW_THRESHOLD,

  // Recommendation limits
  DEFAULT_RECOMMENDATION_LIMIT,
  MAX_OPEN_P0_RECS,
  MAX_OPEN_P1_RECS,
  MAX_DEGRADING_SIGNAL_RECS,
  MAX_LARGE_FILE_RECS,
  MAX_LOW_HEALTH_DIM_RECS,
  PROPOSAL_BACKLOG_MIN_ACTIVE,

  // Document type system
  DOC_TYPE_STORY,
  DOC_TYPE_COMPONENT,
  DOC_TYPE_API,
  DOC_TYPE_PAGE,
  DOC_TYPE_DOMAIN,
  DOC_DIR_TYPES,
  VALID_DOC_TYPE_DIRS,
  resolveDocPath,
  expectedFiles,
};
