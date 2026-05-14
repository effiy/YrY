#!/usr/bin/env node

// node scripts/recommend.js [--json] [--limit N] [--explain]
//
// Chained recommendation pipeline. Six layers; each consumes the previous
// layer's context and emits scored candidates with a visible reasoning chain.
//
//   L0 ContextBuild   project profile + stories + git + sync + health + modules
//   L1 Gates          blockers, malformed names, branch hazards (must fix)
//   L2 StoryFlow      per-story SDLC progression (PM→Tester→Coder→Security→Reporter)
//   L3 Coverage       undocumented source modules + doc gaps (breadth)
//   L4 HealthSignals  proposals + degrading trends + cohesion + low-health dims
//   L5 Hygiene        sync + branch hygiene + advisory
//
// Score = priority_weight × (1 + urgency + impact + project_fit) − cost_penalty.
// Hierarchical suppression collapses role-level signals into the owning story
// task so 5 noisy items become 1 rich one.

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const C = require('./constants.js');

const REPO_ROOT = process.cwd();
const PANEL_DIR = path.join(REPO_ROOT, 'docs', '故事任务面板');

const { resolveStoryPath, sh, shJson, detectProjectType } = C;

// ── File catalogues ───────────────────────────────────────────

const STORY_FILES = [
  '01-故事任务.md', '02-后端技术评审.md', '03-前端技术评审.md',
  '04-测试用例评审.md', '05-后端实施报告.md', '06-前端实施报告.md',
  '07-测试用例报告.md', '08-自改进复盘.md',
];
const DOC_FILES   = STORY_FILES.slice(0, 4);
const REPORT_FILES = STORY_FILES.slice(4, 7);

// Priority weights drive coarse ordering; finer factors break ties.
const PRIORITY_WEIGHT = { P0: 1000, P1: 100, P2: 10, P3: 1 };
const STATUS_LABEL = {
  blocked: '阻断', docs_in_progress: '文档中', docs_done: '文档完成',
  code_in_progress: '代码中', code_done: '完成', not_started: '未开始',
};

// Status urgency contributes to scoring: stories closer to "stuck" rank higher.
const STATUS_URGENCY = {
  blocked: 0.9, not_started: 0.1, docs_in_progress: 0.6,
  docs_done: 0.7, code_in_progress: 0.8, code_done: 0.0,
};

// ════════════════════════════════════════════════════════════════
// L0 — Context build
// ════════════════════════════════════════════════════════════════

async function scanStories() {
  const stories = [];
  let projectDirs = [];
  try {
    projectDirs = (await fsp.readdir(PANEL_DIR, { withFileTypes: true }))
      .filter(e => e.isDirectory() && !e.name.startsWith('.'));
  } catch { return stories; }

  for (const proj of projectDirs) {
    const projPath = path.join(PANEL_DIR, proj.name);
    let storyDirs = [];
    try {
      storyDirs = (await fsp.readdir(projPath, { withFileTypes: true }))
        .filter(e => e.isDirectory() && !e.name.startsWith('.'));
    } catch { continue; }

    for (const story of storyDirs) {
      const fullName = `${proj.name}-${story.name}`;
      const dirPath = path.join(projPath, story.name);
      const exists = {};
      for (const f of STORY_FILES) {
        try { await fsp.access(path.join(dirPath, f), fs.constants.F_OK); exists[f] = true; }
        catch { exists[f] = false; }
      }

      let blocked = false, blockReason = '', currentStage = null;
      try {
        const state = JSON.parse(await fsp.readFile(path.join(dirPath, '.memory', 'rui-state.json'), 'utf8'));
        if (state.blocked) { blocked = true; blockReason = state.block_reason || ''; }
        currentStage = state.current_stage || null;
      } catch {}

      let status;
      if (blocked) status = 'blocked';
      else if (!exists['01-故事任务.md']) status = 'not_started';
      else if (!DOC_FILES.every(f => exists[f])) status = 'docs_in_progress';
      else if (!REPORT_FILES.every(f => exists[f]))
        status = REPORT_FILES.some(f => exists[f]) ? 'code_in_progress' : 'docs_done';
      else status = 'code_done';

      stories.push({
        name: fullName, project: proj.name, story: story.name, dir: dirPath,
        status, blockReason, currentStage, exists,
        missing: STORY_FILES.filter(f => !exists[f]),
        malformed: false, malformed_reason: null,
      });
    }
  }

  stories.sort((a, b) => a.name.localeCompare(b.name));
  return stories;
}

function gitState() {
  const branch = sh('git branch --show-current');
  const isMain = branch === 'main' || branch === 'master';
  const hasUncommitted = sh('git status --porcelain') !== '';
  const unpushedCommits = sh('git log @{u}..HEAD --oneline 2>/dev/null');
  const unpushedCount = unpushedCommits ? unpushedCommits.split('\n').filter(Boolean).length : 0;
  const recentBranches = sh('git branch --sort=-committerdate | head -10', '')
    .split('\n').map(b => b.replace(/^\*?\s+/, '').trim()).filter(Boolean);
  return { branch, isMain, hasUncommitted, unpushedCount, recentBranches };
}

function syncStatus() {
  const hasToken = !!process.env.API_X_TOKEN;
  const apiUrl = 'https://api.effiy.cn';
  let reachable = null;
  if (hasToken) {
    const out = sh(`curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${apiUrl}/"`);
    reachable = ['200', '301', '302'].includes(out);
  }
  const countFiles = (dir, pattern) => {
    try {
      if (!fs.existsSync(dir)) return 0;
      const cmd = pattern
        ? `find "${dir}" -name "${pattern}" -type f | wc -l`
        : `find "${dir}" -type f | wc -l`;
      return parseInt(sh(cmd, '0').trim(), 10) || 0;
    } catch { return 0; }
  };
  return {
    hasToken, reachable,
    panelFileCount: countFiles(path.join(REPO_ROOT, 'docs', '故事任务面板'), '*.md'),
    claudeFileCount: countFiles(path.join(REPO_ROOT, '.claude'), null),
  };
}

function healthSnapshot() {
  const selfImprove = path.join(__dirname, 'self-improve.js');
  const execMemory = path.join(__dirname, 'execution-memory.js');
  return {
    health: shJson(`node "${selfImprove}" health --json`),
    trends: shJson(`node "${execMemory}" trends --weeks 8 --json`),
    proposals: shJson(`node "${selfImprove}" proposals --json`) || [],
    snapshot: shJson(`node "${selfImprove}" snapshot --json`),
  };
}

// ── Per-story formula analysis (with project-fit awareness) ───

function analyzeStoryFormulas(storyDir, projectType) {
  const out = { pm: null, tester: null, coder: null, security: null, reporter: null };
  const pt = projectType.type;

  const readIf = (rel) => {
    const p = path.join(storyDir, rel);
    try { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; } catch { return null; }
  };

  // PM: scope + boundaries
  const story = readIf('01-故事任务.md');
  if (!story) {
    out.pm = { ok: false, gaps: ['故事任务文档(01-故事任务.md)不存在'], severity: 'P0' };
    out.tester = { ok: false, gaps: ['故事文档不存在'], severity: 'P0' };
  } else {
    const has = (re) => re.test(story);
    const checks = {
      role:     has(/\|\s*作为\s*\|[^|]*\S[^|]*\|/),
      action:   has(/\|\s*我想要\s*\|[^|]*\S[^|]*\|/),
      value:    has(/\|\s*以便\s*\|[^|]*\S[^|]*\|/),
      boundary: has(/\|\s*范围边界\s*\|[^|]*\S[^|]*\|/),
      excluded: /范围外/.test(story) && has(/\|\s*范围外\s*\|[^|]*\S[^|]*\|/),
      priority: has(/\|\s*优先级\s*\|[^|]*(P0|P1|P2)[^|]*\|/),
    };
    const pmGaps = [];
    if (!checks.role)     pmGaps.push('缺少"作为"角色定义');
    if (!checks.action)   pmGaps.push('缺少"我想要"动作描述');
    if (!checks.value)    pmGaps.push('缺少"以便"价值说明');
    if (!checks.boundary) pmGaps.push('缺少范围边界（包含/不包含）');
    if (!checks.excluded) pmGaps.push('缺少"范围外"明确排除项');
    if (!checks.priority) pmGaps.push('缺少优先级标注');
    out.pm = {
      ok: pmGaps.length === 0,
      gaps: pmGaps,
      hasScopeBoundary: checks.role && checks.action && checks.value && checks.boundary,
      hasExclusions: checks.excluded,
      severity: pmGaps.length === 0 ? null : 'P0',
    };

    // Tester: AC in Given/When/Then form
    const hasAC = /AC\d+/.test(story);
    const hasGWT = /\|\s*AC\d+\s*\|[^|]*Given[^|]*\|[^|]*When[^|]*\|[^|]*Then[^|]*\|/i.test(story);
    const hasGates = /Gate\s*A/.test(story) && /Gate\s*B/.test(story);
    const tGaps = [];
    if (!hasAC)    tGaps.push('缺少验收标准(AC)');
    if (!hasGWT)   tGaps.push('AC未使用Given/When/Then格式');
    if (!hasGates) tGaps.push('未标注Gate A/Gate B门禁');
    out.tester = {
      ok: tGaps.length === 0,
      gaps: tGaps,
      hasVerifiableAC: hasGWT,
      severity: tGaps.length === 0 ? null : 'P0',
    };
  }

  // Coder: project-aware (only check BE for backend/fullstack/meta, only check FE for frontend/fullstack)
  const beReview = readIf('02-后端技术评审.md');
  const feReview = readIf('03-前端技术评审.md');
  const coderChecks = {};

  if (['backend', 'fullstack', 'meta'].includes(pt) && beReview) {
    const hasAPI    = /\|\s*\{接口名\}\s*\|/.test(beReview) || /`\/api\/[^`]*`/.test(beReview);
    const hasModel  = /数据模型/.test(beReview) && /\|\s*`[^`]+`\s*\|[^|]*\|[^|]*\|[^|]*(高|中|低)[^|]*\|[^|]*(高|中|低)/.test(beReview);
    const hasDomain = /领域/.test(beReview) || /服务架构/.test(beReview);
    const hasChan   = /通信通道/.test(beReview);
    coderChecks.be = { hasAPI, hasModel, hasDomain, hasChan, present: true };
  } else if (['backend', 'fullstack', 'meta'].includes(pt)) {
    coderChecks.be = { present: false };
  }

  if (['frontend', 'fullstack'].includes(pt) && feReview) {
    const hasInterface = /\|\s*`[^`]+`\s*\|[^|]*`[^`]*:[^`]*`\s*\|[^|]*`[^`]*\([^)]*\)`\s*\|[^|]*`[^`]*\([^)]*\)`\s*\|/.test(feReview);
    const hasState     = /状态流/.test(feReview) || /数据流\s*\|/.test(feReview);
    const hasIsolation = /样式隔离/.test(feReview) || /Scoped/.test(feReview) || /Shadow DOM/.test(feReview) || /CSS Modules/i.test(feReview);
    coderChecks.fe = { hasInterface, hasState, hasIsolation, present: true };
  } else if (['frontend', 'fullstack'].includes(pt)) {
    coderChecks.fe = { present: false };
  }
  out.coder = coderChecks;

  // Security: 威胁→信任边界→缓解 across BE+FE
  const sec = (beReview || '') + (feReview || '');
  const hasThreat = /威胁/.test(sec) && /\|\s*\d+\s*\|[^|]*\S[^|]*\|/m.test(sec);
  const hasTrust  = /信任边界/.test(sec);
  const hasMit    = /缓解/.test(sec) && /\|\s*[^\n|]*\|\s*(P0|P1|P2)\s*\|/m.test(sec);
  const sGaps = [];
  if (sec) {
    if (!hasThreat) sGaps.push('缺少威胁识别');
    if (!hasTrust)  sGaps.push('缺少信任边界标注');
    if (!hasMit)    sGaps.push('缺少缓解措施');
  }
  out.security = {
    ok: sec ? sGaps.length === 0 : true,
    gaps: sGaps,
    needsReview: !!sec,
    severity: sGaps.length === 0 ? null : 'P1',
  };

  // Reporter: 事实→偏差→影响 in any present report
  let hasReport = false, reporterOk = true;
  for (const rf of REPORT_FILES) {
    const c = readIf(rf);
    if (c) {
      hasReport = true;
      if (!(/事实/.test(c) && /偏差/.test(c) && /影响/.test(c))) reporterOk = false;
    }
  }
  out.reporter = {
    ok: !hasReport || reporterOk,
    gaps: hasReport && !reporterOk ? ['报告未遵循事实→偏差→影响公式'] : [],
    hasReports: hasReport,
    severity: !hasReport || reporterOk ? null : 'P2',
  };

  return out;
}

// ── Source-module discovery (for L3 coverage) ─────────────────

function discoverSourceModules(projectType) {
  const modules = [];
  const pt = projectType.type;

  if (pt === 'frontend' || pt === 'fullstack') {
    for (const ext of ['.vue', '.jsx', '.tsx']) {
      const files = sh(`find . -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null`, '');
      if (!files) continue;
      const dirs = new Map();
      for (const f of files.split('\n').filter(Boolean)) {
        const dir = path.dirname(f).replace(/^\.\//, '');
        if (dir !== '.') dirs.set(dir, (dirs.get(dir) || 0) + 1);
      }
      for (const [d, count] of dirs) {
        const name = d.replace(/\//g, '-').replace(/^src-|^components-|^pages-/, '');
        const existing = modules.find(m => m.name === name);
        if (existing) existing.fileCount += count;
        else modules.push({ name, path: d, type: 'frontend-component', fileCount: count });
      }
    }
  }

  if (pt === 'backend' || pt === 'fullstack') {
    const beFiles = sh(`find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/skills/*" -not -path "*/agents/*" -not -path "*/rules/*" 2>/dev/null`, '');
    if (beFiles) {
      const dirs = new Set();
      for (const f of beFiles.split('\n').filter(Boolean)) {
        try {
          const content = fs.readFileSync(path.join(REPO_ROOT, f), 'utf8').slice(0, 2000);
          if (/\b(router\.|app\.(get|post|put|delete|patch)|@app\.route|@router\.|func\s+\w+.*http\.|class\s+\w+Controller|@RestController|@RequestMapping)\b/.test(content)) {
            const dir = path.dirname(f).replace(/^\.\//, '');
            if (dir !== '.') dirs.add(dir);
          }
        } catch {}
      }
      for (const d of dirs) modules.push({ name: d.replace(/\//g, '-'), path: d, type: 'backend-module', fileCount: 1 });
    }
  }

  if (pt === 'meta' || (pt === 'unknown' && modules.length === 0)) {
    try {
      const skillDirs = fs.readdirSync(path.join(REPO_ROOT, 'skills'), { withFileTypes: true })
        .filter(e => e.isDirectory() && !e.name.startsWith('.'));
      for (const s of skillDirs) modules.push({ name: s.name, path: `skills/${s.name}`, type: 'skill', fileCount: 1 });
    } catch {}
    if (fs.existsSync(path.join(REPO_ROOT, 'agents'))) {
      const c = fs.readdirSync(path.join(REPO_ROOT, 'agents'), { withFileTypes: true })
        .filter(e => e.isFile() && e.name.endsWith('.md')).length;
      modules.push({ name: 'agents', path: 'agents/', type: 'agent-group', fileCount: c });
    }
    if (fs.existsSync(path.join(REPO_ROOT, 'rules'))) {
      const c = fs.readdirSync(path.join(REPO_ROOT, 'rules'), { withFileTypes: true })
        .filter(e => e.isFile() && e.name.endsWith('.md')).length;
      modules.push({ name: 'rules', path: 'rules/', type: 'rule-group', fileCount: c });
    }
  }

  return modules;
}

function findUndocumentedModules(modules, stories) {
  const covered = new Set();
  for (const s of stories) {
    if (s.malformed) continue;
    covered.add(s.story);
    covered.add(s.project);
    covered.add(s.name);
  }
  return modules.filter(m => {
    for (const c of covered) {
      if (m.name === c || c.includes(m.name) || m.name.includes(c)) return false;
    }
    return true;
  });
}

function projectName() {
  const url = sh('git remote get-url origin 2>/dev/null', '');
  if (url) {
    const m = url.match(/[\/:]([^\/]+?)(?:\.git)?$/);
    if (m) return m[1];
  }
  return path.basename(REPO_ROOT);
}

// ── Build full context (single source for all layers) ─────────

async function buildContext() {
  const projectType = detectProjectType(REPO_ROOT);
  const stories = await scanStories();
  for (const s of stories) {
    if (!s.malformed) s.formulas = analyzeStoryFormulas(s.dir, projectType);
  }
  return {
    projectType,
    projectName: projectName(),
    stories,
    git: gitState(),
    sync: syncStatus(),
    data: healthSnapshot(),
    modules: discoverSourceModules(projectType),
  };
}

// ════════════════════════════════════════════════════════════════
// Candidate factory + scoring
// ════════════════════════════════════════════════════════════════

function makeCandidate({
  layer, priority, category, action, rationale, command, story_name = null,
  formula = null, factors = {}, reasoning = [], sub_signals = [], dedup_key = null,
}) {
  return {
    priority, category, action, rationale,
    actionable_command: command,
    story_name,
    formula,
    layer,
    factors,
    reasoning_chain: reasoning,
    sub_signals,
    dedup_key: dedup_key || `${layer}|${category}|${story_name || ''}|${action}`,
  };
}

// Multi-factor score: weighted priority, then bonuses for urgency/impact/fit, minus cost.
function scoreCandidate(cand, ctx) {
  const base = PRIORITY_WEIGHT[cand.priority] || 1;
  const urgency = clamp01(cand.factors.urgency ?? 0);
  const impact  = clamp01(cand.factors.impact  ?? 0);
  const fit     = clamp01(cand.factors.fit     ?? 0.5);
  const cost    = clamp01(cand.factors.cost    ?? 0.3);

  // Bonus multiplier in [1.0, 2.0]; cost penalty up to 30% of base.
  const score = base * (1 + urgency * 0.5 + impact * 0.3 + (fit - 0.5) * 0.4) - base * 0.3 * cost;
  cand.score = Math.round(score * 100) / 100;
  return cand;
}

const clamp01 = (n) => Math.max(0, Math.min(1, n));

// ════════════════════════════════════════════════════════════════
// L1 — Gates (blockers, malformed, branch hazards)
// ════════════════════════════════════════════════════════════════

function L1_gates(ctx) {
  const out = [];
  const { stories, git, data } = ctx;

  // Malformed directory names — structural blocker
  for (const s of stories.filter(s => s.malformed)) {
    out.push(makeCandidate({
      layer: 'L1.gates', priority: 'P0', category: 'naming',
      action: `迁移故事目录到项目子目录: ${s.name}`,
      rationale: s.malformed_reason || '目录缺少项目前缀',
      command: `mkdir -p docs/故事任务面板/<project> && mv docs/故事任务面板/${s.name} docs/故事任务面板/<project>/<story>`,
      story_name: s.name,
      formula: { role: 'PM', rule: '项目子目录约定: {project}/{name}', check: 'naming' },
      factors: { urgency: 0.8, impact: 0.7, fit: 1.0, cost: 0.2 },
      reasoning: ['L0: 检测到故事目录命名异常', 'L1.gates: 后续工具链依赖目录结构 → P0 阻断'],
    }));
  }

  // Blocked stories — recover first, before anything else on that story
  for (const s of stories.filter(s => s.status === 'blocked')) {
    out.push(makeCandidate({
      layer: 'L1.gates', priority: 'P0', category: 'story-blocked',
      action: `恢复阻断: ${s.name}${s.currentStage ? ` (从 ${s.currentStage})` : ''}`,
      rationale: s.blockReason || '阻塞原因未记录',
      command: `/rui code ${s.name}`,
      story_name: s.name,
      formula: { role: 'PM', rule: '阻断优先处理', check: 'blocked' },
      factors: { urgency: 1.0, impact: 0.9, fit: 1.0, cost: 0.4 },
      reasoning: [`L0: rui-state.json 标记 blocked=true`, `L1.gates: 阻断阻止管线推进 → P0`],
    }));
  }

  // Open P0 proposals from self-improve
  const openP0 = (data.proposals || []).filter(p => p.status === 'open' && p.priority === 'P0');
  for (const p of openP0.slice(0, C.MAX_OPEN_P0_RECS)) {
    out.push(makeCandidate({
      layer: 'L1.gates', priority: 'P0', category: 'proposal',
      action: p.title,
      rationale: p.evidence || p.problem_source || 'P0 改进提案',
      command: p.actionable_command || '/rui',
      story_name: p.story_name || null,
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'proposal-p0' },
      factors: { urgency: 0.85, impact: 0.7, fit: 0.7, cost: 0.3 },
      reasoning: [`L0: 读取 proposals.jsonl`, `L1.gates: P0 提案视为质量阻断`],
    }));
  }

  // Degrading trends — early warning of systemic regression
  const degrading = data.trends?.degradingSignals || [];
  for (const s of degrading.slice(0, C.MAX_DEGRADING_SIGNAL_RECS)) {
    out.push(makeCandidate({
      layer: 'L1.gates', priority: 'P0', category: 'health-degrading',
      action: `修复 ${s.dimension} 退化趋势`,
      rationale: `连续窗口上升 (${s.window})`,
      command: '/rui',
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'degrading' },
      factors: { urgency: 0.9, impact: 0.8, fit: 0.6, cost: 0.5 },
      reasoning: [`L0: trends 检测到 ${s.dimension} 上升`, `L1.gates: 系统性退化优先`],
    }));
  }

  // Uncommitted changes on a story branch (audit trail risk)
  if (git.hasUncommitted && !git.isMain) {
    out.push(makeCandidate({
      layer: 'L1.gates', priority: 'P0', category: 'git',
      action: '提交或暂存未完成的变更',
      rationale: `分支 ${git.branch} 上有未提交的修改`,
      command: 'git status',
      formula: { role: 'Reporter', rule: '事实→偏差→影响: 未提交=不可追溯', check: 'uncommitted' },
      factors: { urgency: 0.7, impact: 0.5, fit: 0.8, cost: 0.1 },
      reasoning: [`L0: git status 非空且分支非 main`, `L1.gates: 未提交变更影响可追溯性`],
    }));
  }

  return out;
}

// ════════════════════════════════════════════════════════════════
// L2 — Story flow (per-story SDLC progression)
// ════════════════════════════════════════════════════════════════
//
// For every active story we walk its SDLC in order and stop at the first
// missing step. The story-level recommendation is the headline; subordinate
// formula gaps become sub_signals attached to it (preventing flat noise).

function L2_storyFlow(ctx) {
  const out = [];
  const { stories, projectType } = ctx;

  for (const s of stories) {
    if (s.malformed || s.status === 'blocked' || s.status === 'code_done') continue;

    const f = s.formulas;
    if (!f) continue;

    const subSignals = [];
    let headlineEmitted = false;

    // Stage 1: PM scope (gate for everything else on this story)
    if (f.pm && !f.pm.ok) {
      const pmGap = !f.pm.hasScopeBoundary ? 'pm-scope' : (!f.pm.hasExclusions ? 'pm-exclusions' : 'pm-priority');
      const action = !f.pm.hasScopeBoundary
        ? `[PM] 定义产品边界: ${s.name}`
        : (!f.pm.hasExclusions
          ? `[PM] 明确不做什么: ${s.name}`
          : `[PM] 完整化故事字段: ${s.name}`);
      out.push(makeCandidate({
        layer: 'L2.story', priority: 'P0', category: pmGap,
        action,
        rationale: `PM公式 (作为/我想要/以便): ${f.pm.gaps.join('; ')}`,
        command: `/rui doc ${s.name}`,
        story_name: s.name,
        formula: { role: 'PM', rule: '作为[角色]我想要[动作]以便[价值] + 范围边界', check: pmGap },
        factors: {
          urgency: STATUS_URGENCY[s.status] ?? 0.5,
          impact: 0.9,  // gates all downstream work
          fit: 1.0,
          cost: 0.4,
        },
        reasoning: [
          `L0: 故事 ${s.name} 状态=${s.status}`,
          `L2.story: PM 范围未定义 → 阻断后续 SDLC 阶段`,
        ],
        dedup_key: `story:${s.name}`,
      }));
      headlineEmitted = true;
      continue;  // PM gate not passed → skip rest of stages for this story
    }

    // Stage 2: Tester AC (gates implementation)
    if (f.tester && !f.tester.ok && !f.tester.hasVerifiableAC) {
      out.push(makeCandidate({
        layer: 'L2.story', priority: 'P0', category: 'tester-ac',
        action: `[Tester] 验收标准需 Given/When/Then: ${s.name}`,
        rationale: `Tester公式: ${f.tester.gaps.join('; ')}`,
        command: `/rui doc ${s.name}`,
        story_name: s.name,
        formula: { role: 'Tester', rule: 'Given[前置]When[操作]Then[预期]', check: 'ac-format' },
        factors: { urgency: STATUS_URGENCY[s.status], impact: 0.85, fit: 1.0, cost: 0.3 },
        reasoning: [
          `L0: 故事 ${s.name} 状态=${s.status}`,
          `L2.story: PM 已通过`,
          `L2.story: AC 缺少 G/W/T 形式 → 实施无法验证`,
        ],
        dedup_key: `story:${s.name}`,
      }));
      headlineEmitted = true;
      continue;
    }

    // Stage 3: status-driven headline (docs / code)
    if (s.status === 'docs_in_progress') {
      // collect downstream formula sub-signals as context
      collectFormulaGaps(f, projectType, subSignals, true);
      out.push(makeCandidate({
        layer: 'L2.story', priority: 'P1', category: 'story',
        action: `完成文档: ${s.name}`,
        rationale: `缺失: ${s.missing.slice(0, 3).join('、')}`,
        command: `/rui doc ${s.name}`,
        story_name: s.name,
        formula: { role: 'PM', rule: '故事=场景+边界', check: 'docs-incomplete' },
        factors: {
          urgency: STATUS_URGENCY[s.status],
          impact: 0.7 + (subSignals.length * 0.05),
          fit: 1.0, cost: 0.5,
        },
        reasoning: [
          `L0: 故事 ${s.name} 缺 ${s.missing.length} 份文档`,
          `L2.story: PM/Tester 已通过 → 进入文档生成`,
          subSignals.length ? `L2.story: 同时存在 ${subSignals.length} 处角色公式缺口（已合并为子信号）` : null,
        ].filter(Boolean),
        sub_signals: subSignals,
        dedup_key: `story:${s.name}`,
      }));
      headlineEmitted = true;
    }
    else if (s.status === 'docs_done') {
      // Pre-code: surface security / coder gaps if present, else just "start coding"
      collectFormulaGaps(f, projectType, subSignals, false);
      const sevP1 = subSignals.filter(x => x.severity === 'P1').length;
      out.push(makeCandidate({
        layer: 'L2.story', priority: 'P1', category: 'story',
        action: `开始编码: ${s.name}`,
        rationale: sevP1 > 0
          ? `文档已完成；${sevP1} 处架构/安全提示需在编码前确认`
          : '文档已完成，缺少实施与测试报告',
        command: `/rui code ${s.name}`,
        story_name: s.name,
        formula: { role: 'Coder', rule: projectType.coderFormula.text, check: 'code-ready' },
        factors: {
          urgency: STATUS_URGENCY[s.status],
          impact: 0.85,
          fit: 1.0, cost: 0.6,
        },
        reasoning: [
          `L0: 文档基线齐全`,
          `L2.story: 项目类型=${projectType.type} → 应用 ${projectType.coderFormula.variant} Coder 公式`,
          sevP1 ? `L2.story: 编码前 ${sevP1} 项 P1 待解决（见 sub_signals）` : null,
        ].filter(Boolean),
        sub_signals: subSignals,
        dedup_key: `story:${s.name}`,
      }));
      headlineEmitted = true;
    }
    else if (s.status === 'code_in_progress') {
      // surface reporter gaps as sub-signals
      if (f.reporter && !f.reporter.ok) {
        subSignals.push({
          role: 'Reporter', severity: 'P2',
          summary: f.reporter.gaps.join('; '),
          check: 'report-format',
        });
      }
      out.push(makeCandidate({
        layer: 'L2.story', priority: 'P1', category: 'story',
        action: `完成实现: ${s.name}`,
        rationale: `缺失报告: ${s.missing.slice(0, 3).join('、')}`,
        command: `/rui code ${s.name}`,
        story_name: s.name,
        formula: { role: 'Reporter', rule: '事实→偏差→影响', check: 'report-missing' },
        factors: {
          urgency: STATUS_URGENCY[s.status],
          impact: 0.8,
          fit: 1.0, cost: 0.5,
        },
        reasoning: [
          `L0: 已有 ${REPORT_FILES.filter(f => s.exists[f]).length} 份报告，缺 ${s.missing.length} 份`,
          `L2.story: 编码已开始 → 应进入 Gate B 验证`,
        ],
        sub_signals: subSignals,
        dedup_key: `story:${s.name}`,
      }));
      headlineEmitted = true;
    }

    // Stage 4: not_started → kick off doc
    if (s.status === 'not_started' && !headlineEmitted) {
      out.push(makeCandidate({
        layer: 'L2.story', priority: 'P1', category: 'story',
        action: `启动文档: ${s.name}`,
        rationale: '故事目录已创建但 01-故事任务.md 尚未生成',
        command: `/rui doc ${s.name}`,
        story_name: s.name,
        formula: { role: 'PM', rule: '故事=场景+边界', check: 'kickoff' },
        factors: { urgency: 0.4, impact: 0.6, fit: 1.0, cost: 0.4 },
        reasoning: [`L0: 故事目录存在但无 01 文档`, `L2.story: 进入自适应规划`],
        dedup_key: `story:${s.name}`,
      }));
    }
  }

  return out;
}

// Helper: harvest project-fit-aware Coder/Security/Reporter gaps as sub-signals.
// `whileDocs`: true → include all roles; false (post-doc) → skip Coder structural items.
function collectFormulaGaps(f, projectType, sub, whileDocs) {
  const pt = projectType.type;
  if (whileDocs && f.coder) {
    if (f.coder.fe?.present) {
      const fe = f.coder.fe;
      if (!fe.hasInterface) sub.push({ role: 'Coder', severity: 'P1', summary: '前端组件缺少 Props/Events/Expose 契约', check: 'component-interface' });
      if (fe.hasInterface && !fe.hasState) sub.push({ role: 'Coder', severity: 'P2', summary: '前端缺少状态流定义', check: 'state-flow' });
      if (!fe.hasIsolation) sub.push({ role: 'Coder', severity: 'P2', summary: '前端缺少样式隔离策略', check: 'style-isolation' });
    }
    if (f.coder.be?.present) {
      const be = f.coder.be;
      if (!be.hasDomain) sub.push({ role: 'Coder', severity: 'P1', summary: '后端缺少领域/服务架构', check: 'domain-model' });
      if (be.hasDomain && !be.hasAPI) sub.push({ role: 'Coder', severity: 'P1', summary: '后端缺少 API 契约', check: 'api-contract' });
      if (!be.hasModel) sub.push({ role: 'Coder', severity: 'P2', summary: '后端缺少数据模型与迁移策略', check: 'data-model' });
      if (!be.hasChan)  sub.push({ role: 'Coder', severity: 'P2', summary: '后端缺少通信通道设计', check: 'channel-design' });
    }
    if (['frontend', 'fullstack'].includes(pt) && f.coder.fe && !f.coder.fe.present) {
      sub.push({ role: 'Coder', severity: 'P1', summary: '前端技术评审 (03) 缺失', check: 'fe-review-missing' });
    }
    if (['backend', 'fullstack', 'meta'].includes(pt) && f.coder.be && !f.coder.be.present) {
      sub.push({ role: 'Coder', severity: 'P1', summary: '后端技术评审 (02) 缺失', check: 'be-review-missing' });
    }
  }
  if (f.security && f.security.needsReview && !f.security.ok) {
    sub.push({ role: 'Security', severity: 'P1', summary: f.security.gaps.join('; '), check: 'threat-model' });
  }
}

// ════════════════════════════════════════════════════════════════
// L3 — Coverage (undocumented modules + cross-story doc gaps)
// ════════════════════════════════════════════════════════════════

function L3_coverage(ctx) {
  const out = [];
  const { modules, stories, projectName } = ctx;

  // Undocumented source modules → recommend new story creation
  const undocumented = findUndocumentedModules(modules, stories);
  for (const m of undocumented.slice(0, 5)) {
    const storyName = `${projectName}-${m.name}`;
    const typeLabel = {
      skill: 'Skill 模块', 'agent-group': 'Agent 模块', 'rule-group': '规则模块',
      'frontend-component': '前端组件', 'backend-module': '后端模块',
    }[m.type] || '源码模块';
    out.push(makeCandidate({
      layer: 'L3.coverage', priority: 'P1', category: 'new-story',
      action: `[PM] 为${typeLabel}创建故事: ${m.name}`,
      rationale: `${m.path} 缺少故事文档覆盖（${m.fileCount} 个文件未纳入故事面板）`,
      command: `/rui doc --from-code ${storyName}`,
      story_name: storyName,
      formula: { role: 'PM', rule: '作为[角色]我想要[动作]以便[价值]', check: 'new-story-dir' },
      factors: {
        urgency: 0.3,                                  // breadth, not urgency
        impact: clamp01(0.4 + m.fileCount * 0.05),     // more files → more impact
        fit: 0.9,
        cost: 0.6,
      },
      reasoning: [
        `L0: 发现源码模块 ${m.path} (${m.fileCount} 文件)`,
        `L3.coverage: 未匹配任何已存在故事目录`,
      ],
    }));
  }

  // Doc gaps in existing stories (only fire when NOT already headlined by L2)
  for (const s of stories) {
    if (s.malformed || s.status === 'blocked' || s.status === 'code_done') continue;
    const critical = s.missing.filter(f => DOC_FILES.includes(f));
    const reportMiss = s.missing.filter(f => REPORT_FILES.includes(f));
    const retroMiss = s.missing.includes('08-自改进复盘.md');

    // Critical doc gaps are already covered by L2 docs_in_progress headline.
    // Only emit standalone for retro/report gaps when story is otherwise complete.
    if (critical.length === 0 && reportMiss.length > 0 && s.status === 'code_in_progress') {
      // L2 already emits a code-in-progress headline; skip
      continue;
    }
    if (critical.length === 0 && reportMiss.length === 0 && retroMiss) {
      out.push(makeCandidate({
        layer: 'L3.coverage', priority: 'P2', category: 'doc-gap',
        action: `[Self-Improve] 补充 ${s.name} 复盘文档`,
        rationale: '自改进复盘(08-自改进复盘.md)缺失，知识无法沉淀',
        command: `/rui code ${s.name}`,
        story_name: s.name,
        formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'doc-gap-retro' },
        factors: { urgency: 0.2, impact: 0.5, fit: 0.8, cost: 0.3 },
        reasoning: [
          `L0: 故事 ${s.name} 仅缺 08-自改进复盘.md`,
          `L3.coverage: 知识沉淀缺口`,
        ],
        dedup_key: `story:${s.name}`,
      }));
    }
  }

  // Bootstrap: empty repo with git history
  if (stories.length === 0 && ctx.git.recentBranches.length > 0) {
    out.push(makeCandidate({
      layer: 'L3.coverage', priority: 'P2', category: 'init',
      action: '创建首个故事任务',
      rationale: '项目无故事面板记录，建议从近期变更反向生成',
      command: '/rui doc --from-code',
      formula: { role: 'PM', rule: '作为[角色]我想要[动作]以便[价值]', check: 'init-story' },
      factors: { urgency: 0.5, impact: 0.7, fit: 0.9, cost: 0.6 },
      reasoning: [`L0: 故事面板空但 git 有 ${ctx.git.recentBranches.length} 个最近分支`, `L3.coverage: 反推首个故事`],
    }));
  }

  return out;
}

// ════════════════════════════════════════════════════════════════
// L4 — Health signals (P1 proposals, cohesion, low dims)
// ════════════════════════════════════════════════════════════════

function L4_healthSignals(ctx) {
  const out = [];
  const { data, projectType } = ctx;

  // Open P1 proposals (P0s already in L1)
  const openP1 = (data.proposals || []).filter(p => p.status === 'open' && p.priority === 'P1');
  for (const p of openP1.slice(0, C.MAX_OPEN_P1_RECS)) {
    out.push(makeCandidate({
      layer: 'L4.health', priority: 'P2', category: 'proposal',
      action: p.title,
      rationale: p.evidence || p.problem_source || 'P1 改进提案',
      command: p.actionable_command || '/rui',
      story_name: p.story_name || null,
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'proposal-p1' },
      factors: { urgency: 0.5, impact: 0.5, fit: 0.7, cost: 0.4 },
      reasoning: [`L0: 读取 proposals.jsonl`, `L4.health: P1 提案非阻断但应排程`],
    }));
  }

  // Large files (cohesion risk) — only if not part of an active story
  const large = data.snapshot?.cohesionRisks || [];
  for (const f of large.slice(0, C.MAX_LARGE_FILE_RECS)) {
    out.push(makeCandidate({
      layer: 'L4.health', priority: 'P2', category: 'improvement',
      action: `拆分大文件: ${f.file}`,
      rationale: `${f.lines} 行，降低耦合度`,
      command: `/rui code ${path.basename(f.file, path.extname(f.file))}`,
      formula: { role: 'Coder', rule: projectType.coderFormula.text, check: 'cohesion' },
      factors: {
        urgency: 0.2,
        impact: clamp01(f.lines / 1500),    // bigger file = more impact
        fit: 0.6, cost: 0.7,
      },
      reasoning: [
        `L0: snapshot cohesionRisks 包含 ${f.file} (${f.lines} 行)`,
        `L4.health: 阈值 ${C.LARGE_FILE_LINE_THRESHOLD} 行触发拆分建议`,
      ],
    }));
  }

  // Low health dimensions
  const dims = Object.entries(data.health?.dimensions || {})
    .filter(([, v]) => v !== null && v < C.HEALTH_DIM_LOW_THRESHOLD)
    .map(([k, v]) => ({ dim: k, score: v }));
  for (const d of dims.slice(0, C.MAX_LOW_HEALTH_DIM_RECS)) {
    out.push(makeCandidate({
      layer: 'L4.health', priority: 'P3', category: 'health',
      action: `提升 ${d.dim} 健康度 (当前 ${d.score})`,
      rationale: `项目健康维度低于 ${C.HEALTH_DIM_LOW_THRESHOLD}`,
      command: '/rui',
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'health-dim' },
      factors: { urgency: 0.3, impact: clamp01((C.HEALTH_DIM_LOW_THRESHOLD - d.score) / 70), fit: 0.6, cost: 0.5 },
      reasoning: [`L0: health.dimensions.${d.dim}=${d.score}`, `L4.health: 低于 ${C.HEALTH_DIM_LOW_THRESHOLD} 阈值`],
    }));
  }

  // Proposal backlog
  const proposals = data.proposals || [];
  const openCount = proposals.filter(p => p.status === 'open').length;
  const doneCount = proposals.filter(p => p.status === 'done').length;
  const totalActive = openCount + doneCount;
  if (totalActive > C.PROPOSAL_BACKLOG_MIN_ACTIVE && openCount > doneCount * C.PROPOSAL_BACKLOG_RATIO) {
    out.push(makeCandidate({
      layer: 'L4.health', priority: 'P3', category: 'improvement',
      action: `处理积压提案 (${openCount} 开放, ${doneCount} 完成)`,
      rationale: `提案积压超过 ${C.PROPOSAL_BACKLOG_RATIO}:1`,
      command: '/rui',
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'backlog' },
      factors: { urgency: 0.3, impact: 0.4, fit: 0.5, cost: 0.6 },
      reasoning: [`L0: open=${openCount} done=${doneCount}`, `L4.health: 积压比 ${(openCount / Math.max(1, doneCount)).toFixed(1)}`],
    }));
  }

  return out;
}

// ════════════════════════════════════════════════════════════════
// L5 — Hygiene (sync, branch hygiene)
// ════════════════════════════════════════════════════════════════

function L5_hygiene(ctx) {
  const out = [];
  const { sync, git } = ctx;

  if (sync.hasToken && sync.panelFileCount > 0 && !sync.reachable) {
    out.push(makeCandidate({
      layer: 'L5.hygiene', priority: 'P1', category: 'sync',
      action: '远端 API 不可达',
      rationale: `${sync.panelFileCount} 个故事面板文件 + ${sync.claudeFileCount} 个 .claude 文件待同步`,
      command: '/import-docs --workspace',
      formula: { role: 'Reporter', rule: '知识沉淀: 文档同步', check: 'sync' },
      factors: { urgency: 0.5, impact: 0.5, fit: 0.7, cost: 0.2 },
      reasoning: [`L0: API 健康检查失败`, `L5.hygiene: 文档无法外部访问`],
    }));
  }

  if (!sync.hasToken && (sync.panelFileCount > 0 || sync.claudeFileCount > 0)) {
    out.push(makeCandidate({
      layer: 'L5.hygiene', priority: 'P1', category: 'sync',
      action: '配置 API_X_TOKEN 环境变量',
      rationale: `${sync.panelFileCount + sync.claudeFileCount} 个文件待同步`,
      command: 'export API_X_TOKEN=<token>',
      formula: { role: 'Reporter', rule: '知识沉淀: 配置同步凭证', check: 'token' },
      factors: { urgency: 0.4, impact: 0.5, fit: 0.7, cost: 0.1 },
      reasoning: [`L0: 未检测到 API_X_TOKEN`, `L5.hygiene: 同步降级 (no-token)`],
    }));
  }

  if (git.isMain && git.hasUncommitted) {
    out.push(makeCandidate({
      layer: 'L5.hygiene', priority: 'P3', category: 'git',
      action: '切换到功能分支工作',
      rationale: '当前在 main 分支且有未提交修改',
      command: 'git checkout -b feat/<project>-<name>',
      formula: { role: 'Coder', rule: '分支隔离: feat/<project>-<name>', check: 'branch' },
      factors: { urgency: 0.3, impact: 0.4, fit: 0.7, cost: 0.1 },
      reasoning: [`L0: branch=${git.branch} uncommitted=true`, `L5.hygiene: 违反分支隔离规则`],
    }));
  }

  return out;
}

// ════════════════════════════════════════════════════════════════
// Suppression — collapse implied / duplicate items
// ════════════════════════════════════════════════════════════════

function suppress(candidates) {
  // 1. Hierarchical: if a story-level item exists, lower-priority items with the
  //    same story_name and dedup_key=story:<name> are absorbed into it.
  const byStoryHeadline = new Map();
  for (const c of candidates) {
    if (c.dedup_key && c.dedup_key.startsWith('story:')) {
      const existing = byStoryHeadline.get(c.dedup_key);
      if (!existing || (PRIORITY_WEIGHT[c.priority] > PRIORITY_WEIGHT[existing.priority])) {
        byStoryHeadline.set(c.dedup_key, c);
      }
    }
  }

  const seen = new Set();
  const out = [];
  for (const c of candidates) {
    if (c.dedup_key && c.dedup_key.startsWith('story:')) {
      const head = byStoryHeadline.get(c.dedup_key);
      if (head !== c) continue;  // suppressed by headline
    }
    const key = `${c.priority}|${c.category}|${c.action}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

// ════════════════════════════════════════════════════════════════
// Output
// ════════════════════════════════════════════════════════════════

function printHuman(recs, ctx, limit, explain) {
  const { stories, git, sync, data, projectType, projectName } = ctx;
  const healthScore = data.health?.composite;
  const storySummary = stories.length > 0
    ? stories.map(s => `${s.name}(${STATUS_LABEL[s.status]})`).join(' ')
    : '无故事';
  const ptLabel = C.labelForType(projectType.type);

  console.log('# 推荐任务\n');
  console.log(`> 项目: **${projectName}** · 类型: **${ptLabel}** · Coder公式: \`${projectType.coderFormula.text}\``);
  console.log(`> 健康: ${healthScore ?? 'N/A'}/100 · 故事: ${storySummary} · 分支: ${git.branch}${git.hasUncommitted ? ' (有未提交修改)' : ''}`);
  if (sync.hasToken) console.log(`> 同步: ${sync.panelFileCount} 面板 + ${sync.claudeFileCount} .claude 文件 · API ${sync.reachable ? '可达' : '不可达'}`);
  console.log();

  const limited = recs.slice(0, limit);
  if (limited.length === 0) {
    console.log('> 无推荐任务。项目状态良好。');
    return;
  }

  // Headline table (priority + score visible so users see why ordering changed)
  console.log(`| # | 优先级 | 评分 | 层 | 角色 | 行动 | 命令 |`);
  console.log(`|---|--------|------|----|------|------|------|`);
  limited.forEach((r, i) => {
    const cmd = r.actionable_command ? `\`${r.actionable_command}\`` : '—';
    const role = r.formula?.role || '—';
    console.log(`| ${i + 1} | ${r.priority} | ${r.score} | ${r.layer} | ${role} | ${r.action} | ${cmd} |`);
  });
  console.log();

  // Per-item detail blocks (rationale + reasoning chain + sub-signals)
  for (let i = 0; i < limited.length; i++) {
    const r = limited[i];
    console.log(`### ${i + 1}. ${r.action}`);
    console.log(`- 理由: ${r.rationale}`);
    if (explain) {
      console.log(`- 推理链:`);
      r.reasoning_chain.forEach(line => console.log(`  - ${line}`));
      const f = r.factors;
      console.log(`- 评分因子: 紧迫=${f.urgency?.toFixed?.(2) ?? f.urgency} · 影响=${f.impact?.toFixed?.(2) ?? f.impact} · 项目契合=${f.fit?.toFixed?.(2) ?? f.fit} · 成本=${f.cost?.toFixed?.(2) ?? f.cost}`);
    }
    if (r.sub_signals && r.sub_signals.length > 0) {
      console.log(`- 子信号 (${r.sub_signals.length}):`);
      r.sub_signals.forEach(ss => console.log(`  - [${ss.severity}] ${ss.role}: ${ss.summary}`));
    }
    console.log();
  }

  // Footer summary
  const byPriority = {};
  const byLayer = {};
  for (const r of limited) {
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    byLayer[r.layer] = (byLayer[r.layer] || 0) + 1;
  }
  const pParts = Object.entries(byPriority).sort(([a], [b]) => a.localeCompare(b)).map(([p, c]) => `${p}: ${c}`);
  const lParts = Object.entries(byLayer).sort(([a], [b]) => a.localeCompare(b)).map(([l, c]) => `${l}×${c}`);
  console.log(`${limited.length}/${recs.length} 条推荐 (${pParts.join(', ')}) · 分层: ${lParts.join(' ')}。`);
}

function printJson(recs, ctx, limit) {
  const { stories, git, sync, data, projectType, projectName } = ctx;
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    project_name: projectName,
    project_type: projectType,
    pipeline: ['L1.gates', 'L2.story', 'L3.coverage', 'L4.health', 'L5.hygiene'],
    context: {
      health: data.health?.composite ?? null,
      health_dimensions: data.health?.dimensions || null,
      story_count: stories.length,
      stories: stories.map(s => ({
        name: s.name, status: s.status, missing: s.missing,
        malformed: s.malformed || false, project: s.project || null,
        formulas: s.formulas || null,
      })),
      branch: git.branch,
      is_main: git.isMain,
      has_uncommitted: git.hasUncommitted,
      sync: {
        has_token: sync.hasToken, api_reachable: sync.reachable,
        panel_files: sync.panelFileCount, claude_files: sync.claudeFileCount,
      },
      open_proposals: (data.proposals || []).filter(p => p.status === 'open').length,
      degrading_signals: (data.trends?.degradingSignals || []).length,
    },
    total_candidates: recs.length,
    returned: Math.min(recs.length, limit),
    recommendations: recs.slice(0, limit),
  }, null, 2));
}

// ════════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const explain = args.includes('--explain');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1
    ? Math.max(1, parseInt(args[limitIdx + 1], 10) || C.DEFAULT_RECOMMENDATION_LIMIT)
    : C.DEFAULT_RECOMMENDATION_LIMIT;

  // L0: build immutable context
  const ctx = await buildContext();

  // L1 → L5: chain layers; each is a pure function of ctx (and earlier outputs
  // could be threaded in if needed). Currently each layer reads ctx independently
  // and produces candidates; suppression collapses cross-layer overlaps.
  const candidates = [
    ...L1_gates(ctx),
    ...L2_storyFlow(ctx),
    ...L3_coverage(ctx),
    ...L4_healthSignals(ctx),
    ...L5_hygiene(ctx),
  ];

  // Score every candidate, then suppress hierarchically/duplicates.
  for (const c of candidates) scoreCandidate(c, ctx);
  const ranked = suppress(candidates).sort((a, b) => b.score - a.score);

  if (jsonMode) printJson(ranked, ctx, limit);
  else printHuman(ranked, ctx, limit, explain);
}

main().catch(err => { console.error(err); process.exit(1); });
