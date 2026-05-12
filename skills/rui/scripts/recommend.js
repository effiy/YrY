#!/usr/bin/env node

// node scripts/recommend.js [--json] [--limit N]
// Unified recommendation engine: story status + health + proposals + git + sync

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { execSync } = require('child_process');
const C = require('./constants.js');

const REPO_ROOT = process.cwd();
const PANEL_DIR = path.join(REPO_ROOT, 'docs', '故事任务面板');

const STORY_FILES = [
  '01-故事任务.md', '02-后端技术评审.md', '03-前端技术评审.md',
  '04-测试用例评审.md', '05-后端实施报告.md', '06-前端实施报告.md',
  '07-测试用例报告.md', '08-自改进复盘.md',
];
const DOC_FILES = ['01-故事任务.md', '02-后端技术评审.md', '03-前端技术评审.md', '04-测试用例评审.md'];
const REPORT_FILES = ['05-后端实施报告.md', '06-前端实施报告.md', '07-测试用例报告.md'];

function parseStoryDirName(name) {
  const parts = name.split('-');
  if (parts.length < 2) return { valid: false, project: null, reason: '缺少项目前缀（格式: <project>-<name>）' };
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] && /^[a-z]/.test(parts[i])) {
      return { valid: true, project: parts.slice(0, i).join('-'), story: parts.slice(i).join('-'), reason: null };
    }
  }
  return { valid: false, project: null, reason: '无法识别项目前缀（故事部分应以小写字母开头）' };
}

function sh(cmd, fallback = '') {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], cwd: REPO_ROOT }).trim();
  } catch { return fallback; }
}

function shJson(cmd) {
  const out = sh(cmd);
  if (!out) return null;
  try { return JSON.parse(out); } catch { return null; }
}

// ── Project type detection ─────────────────────────────────────

function detectProjectType() {
  const indicators = [];
  let frontendScore = 0, backendScore = 0;

  // Frontend signals
  const frontendPatterns = Object.entries(C.FRONTEND_EXTENSION_WEIGHTS).map(([ext, weight]) => ({ ext, weight }));
  for (const { ext, weight } of frontendPatterns) {
    const count = parseInt(sh(`find . -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l`, '0'), 10) || 0;
    if (count > 0) { frontendScore += weight * Math.min(count, C.MAX_FILE_COUNT_FOR_SCORING); indicators.push(`${count} ${ext} 文件`); }
  }

  // Check package.json for frontend frameworks
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const feFrameworks = ['react', 'vue', 'svelte', 'angular', 'next', 'nuxt', 'vite', 'webpack'];
    const beFrameworks = ['express', 'koa', 'fastify', 'hapi', 'nestjs', 'next'];
    for (const fw of feFrameworks) {
      if (deps[fw]) { frontendScore += C.FRAMEWORK_DEPENDENCY_WEIGHT; indicators.push(`依赖: ${fw}`); }
    }
    for (const fw of beFrameworks) {
      if (deps[fw]) { backendScore += C.FRAMEWORK_DEPENDENCY_WEIGHT; indicators.push(`依赖: ${fw}`); }
    }
  } catch {}

  // Backend signals
  const backendPatterns = Object.entries(C.BACKEND_EXTENSION_WEIGHTS).map(([ext, weight]) => ({ ext, weight }));
  for (const { ext, weight } of backendPatterns) {
    const count = parseInt(sh(`find . -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l`, '0'), 10) || 0;
    if (count > 0) { backendScore += weight * Math.min(count, C.MAX_FILE_COUNT_FOR_SCORING); indicators.push(`${count} ${ext} 文件`); }
  }

  // Check for API/server patterns
  const apiFiles = sh(`find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/skills/*" -not -path "*/agents/*" -not -path "*/rules/*" | head -${C.API_PATTERN_SCAN_MAX_FILES}`, '');
  if (apiFiles) {
    for (const line of apiFiles.split('\n').filter(Boolean)) {
      try {
        const content = fs.readFileSync(path.join(REPO_ROOT, line), 'utf8').slice(0, C.API_PATTERN_SCAN_CONTENT_BYTES);
        if (/\b(router\.|app\.(get|post|put|delete|patch)|@app\.route|@router\.|func\s+\w+.*http\.|class\s+\w+Controller|@RestController|@RequestMapping)\b/.test(content)) {
          backendScore += C.API_PATTERN_WEIGHT; indicators.push(`API 模式: ${path.basename(line)}`); break;
        }
      } catch {}
    }
  }

  // Meta-project signals (Claude Code plugin)
  const isMeta = fs.existsSync(path.join(REPO_ROOT, '.claude-plugin', 'plugin.json')) ||
    (fs.existsSync(path.join(REPO_ROOT, 'agents')) && fs.existsSync(path.join(REPO_ROOT, 'skills')) && !apiFiles);

  let type, coderFormula;
  if (frontendScore > backendScore && frontendScore > 0) {
    type = 'frontend';
    coderFormula = { text: '组件树 → Props/Events/Expose → 状态流', variant: '组件化', focus: '组件接口契约与状态管理' };
  } else if (backendScore > frontendScore && backendScore > 0) {
    type = 'backend';
    coderFormula = { text: '模块 → 接口 → 数据流', variant: '领域模型', focus: '领域模型完整性与API契约' };
  } else if (frontendScore > 0 && backendScore > 0) {
    type = 'fullstack';
    coderFormula = { text: '模块 → 接口 → 数据流 + 组件树 → Props/Events → 状态流', variant: '前后端分离', focus: '前后端契约对齐与数据流完整性' };
  } else if (isMeta) {
    type = 'meta';
    coderFormula = { text: '模块 → 接口 → 数据流', variant: '插件/配置', focus: '规则完整性与集成契约' };
  } else {
    type = 'unknown';
    coderFormula = { text: '模块 → 接口 → 数据流', variant: '通用', focus: '模块划分与接口定义' };
  }

  return { type, coderFormula, frontendScore, backendScore, indicators };
}

// ── Role formula analysis ──────────────────────────────────────

function analyzeStoryFormulas(storyDir) {
  const results = { pm: null, tester: null, coder: null, security: null, reporter: null };

  // PM formula: 作为 [角色] 我想要 [动作] 以便 [价值] + scope boundaries
  try {
    const storyFile = path.join(storyDir, '01-故事任务.md');
    if (fs.existsSync(storyFile)) {
      const content = fs.readFileSync(storyFile, 'utf8');
      const hasRole = /\|\s*作为\s*\|[^|]*[^\s|][^|]*\|/.test(content);
      const hasAction = /\|\s*我想要\s*\|[^|]*[^\s|][^|]*\|/.test(content);
      const hasValue = /\|\s*以便\s*\|[^|]*[^\s|][^|]*\|/.test(content);
      const hasScopeOut = /范围外/.test(content) && /\|\s*范围外\s*\|[^|]*[^\s|][^|]*\|/.test(content);
      const hasPriority = /\|\s*优先级\s*\|[^|]*(P0|P1|P2)[^|]*\|/.test(content);
      const hasScopeBoundary = /\|\s*范围边界\s*\|[^|]*[^\s|][^|]*\|/.test(content);

      const gaps = [];
      if (!hasRole) gaps.push('缺少"作为"角色定义');
      if (!hasAction) gaps.push('缺少"我想要"动作描述');
      if (!hasValue) gaps.push('缺少"以便"价值说明');
      if (!hasScopeBoundary) gaps.push('缺少范围边界（包含/不包含）');
      if (!hasScopeOut) gaps.push('缺少"范围外"明确排除项');
      if (!hasPriority) gaps.push('缺少优先级标注');

      results.pm = {
        ok: gaps.length === 0,
        gaps,
        hasScopeBoundary: hasRole && hasAction && hasValue && hasScopeBoundary,
        hasExclusions: hasScopeOut,
        detail: gaps.length === 0 ? 'PM公式完整，产品边界清晰' : gaps.join('; '),
      };
    } else {
      results.pm = { ok: false, gaps: ['故事任务文档(01-故事任务.md)不存在'], detail: '缺少故事定义' };
    }
  } catch (e) {
    results.pm = { ok: false, gaps: [e.message], detail: '读取故事文档失败' };
  }

  // Tester formula: Given [前置] When [操作] Then [预期]
  try {
    const storyFile = path.join(storyDir, '01-故事任务.md');
    if (fs.existsSync(storyFile)) {
      const content = fs.readFileSync(storyFile, 'utf8');
      const acSection = content.match(/###\s*§5\s+Acceptance Criteria[\s\S]*?(?=---|\n##|$)/i);
      const hasGivenWhenThen = /\|\s*AC\d+\s*\|[^|]*Given[^|]*\|[^|]*When[^|]*\|[^|]*Then[^|]*\|/i.test(content);
      const hasAC = /AC\d+/.test(content);
      const hasGateAB = /Gate\s*A/.test(content) && /Gate\s*B/.test(content);

      const gaps = [];
      if (!hasAC) gaps.push('缺少验收标准(AC)');
      if (!hasGivenWhenThen) gaps.push('AC未使用Given/When/Then格式');
      if (!hasGateAB) gaps.push('未标注Gate A/Gate B门禁');

      results.tester = {
        ok: gaps.length === 0,
        gaps,
        hasVerifiableAC: hasGivenWhenThen,
        detail: gaps.length === 0 ? 'Tester公式完整，AC可独立验证' : gaps.join('; '),
      };
    } else {
      results.tester = { ok: false, gaps: ['故事文档不存在'], detail: '无法分析AC' };
    }
  } catch (e) {
    results.tester = { ok: false, gaps: [e.message], detail: 'AC分析失败' };
  }

  // Security formula: 威胁 → 信任边界 → 缓解
  try {
    const beReview = path.join(storyDir, '02-后端技术评审.md');
    const feReview = path.join(storyDir, '03-前端技术评审.md');
    let secContent = '';
    if (fs.existsSync(beReview)) secContent += fs.readFileSync(beReview, 'utf8');
    if (fs.existsSync(feReview)) secContent += fs.readFileSync(feReview, 'utf8');

    const hasThreat = /威胁/.test(secContent) && /\|\s*\d+\s*\|[^|]*[^\s|][^|]*\|/m.test(secContent);
    const hasTrustBoundary = /信任边界/.test(secContent);
    const hasMitigation = /缓解/.test(secContent) && /\|\s*[^\n|]*\|\s*(P0|P1|P2)\s*\|/m.test(secContent);

    const gaps = [];
    if (!hasThreat) gaps.push('缺少威胁识别');
    if (!hasTrustBoundary) gaps.push('缺少信任边界标注');
    if (!hasMitigation) gaps.push('缺少缓解措施');

    results.security = {
      ok: gaps.length === 0,
      gaps,
      detail: gaps.length === 0 ? 'Security公式完整，威胁有明确对策' : gaps.join('; '),
    };
  } catch (e) {
    results.security = { ok: false, gaps: [e.message], detail: '安全分析失败' };
  }

  // Reporter formula: 事实 → 偏差 → 影响 (checked in reports)
  try {
    const reportFiles = ['05-后端实施报告.md', '06-前端实施报告.md', '07-测试用例报告.md'];
    let hasReport = false, hasFactDeviation = false;

    for (const rf of reportFiles) {
      const rp = path.join(storyDir, rf);
      if (fs.existsSync(rp)) {
        hasReport = true;
        const content = fs.readFileSync(rp, 'utf8');
        if (/事实/.test(content) && /偏差/.test(content) && /影响/.test(content)) {
          hasFactDeviation = true;
          break;
        }
      }
    }

    if (!hasReport) {
      results.reporter = { ok: true, gaps: [], detail: '报告尚未生成，待实施后检验' };
    } else if (!hasFactDeviation) {
      results.reporter = { ok: false, gaps: ['实施报告未遵循事实→偏差→影响公式'], detail: '报告缺少公式结构' };
    } else {
      results.reporter = { ok: true, gaps: [], detail: 'Reporter公式完整' };
    }
  } catch (e) {
    results.reporter = { ok: false, gaps: [e.message], detail: '报告分析失败' };
  }

  return results;
}

// ── Story status ──────────────────────────────────────────────

async function scanStories() {
  const stories = [];
  let entries = [];
  try {
    entries = await fsp.readdir(PANEL_DIR, { withFileTypes: true });
    entries = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
  } catch { return stories; }

  for (const entry of entries) {
    const dirPath = path.join(PANEL_DIR, entry.name);
    const exists = {};
    for (const f of STORY_FILES) {
      try { await fsp.access(path.join(dirPath, f), fs.constants.F_OK); exists[f] = true; }
      catch { exists[f] = false; }
    }

    let blocked = false, blockReason = '';
    try {
      const stateRaw = await fsp.readFile(path.join(dirPath, '.memory', 'rui-state.json'), 'utf8');
      const state = JSON.parse(stateRaw);
      if (state.blocked) { blocked = true; blockReason = state.block_reason || ''; }
    } catch {}

    let status;
    if (blocked) status = 'blocked';
    else if (!exists['01-故事任务.md']) status = 'not_started';
    else if (!DOC_FILES.every(f => exists[f])) status = 'docs_in_progress';
    else if (!REPORT_FILES.every(f => exists[f]))
      status = REPORT_FILES.some(f => exists[f]) ? 'code_in_progress' : 'docs_done';
    else status = 'code_done';

    const missing = STORY_FILES.filter(f => !exists[f]);

    const nameInfo = parseStoryDirName(entry.name);
    stories.push({ name: entry.name, status, missing, blockReason, exists, malformed: !nameInfo.valid, malformed_reason: nameInfo.reason, project: nameInfo.project });
  }

  stories.sort((a, b) => a.name.localeCompare(b.name));
  return stories;
}

// ── Git state ─────────────────────────────────────────────────

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

// ── Import-docs sync status ───────────────────────────────────

function syncStatus() {
  const hasToken = !!process.env.API_X_TOKEN;
  const apiUrl = 'https://api.effiy.cn';
  let reachable = null;
  if (hasToken) {
    try {
      const out = sh(`curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${apiUrl}/"`);
      reachable = out === '200' || out === '301' || out === '302';
    } catch { reachable = false; }
  }

  let panelFileCount = 0, claudeFileCount = 0, totalMdCount = 0;
  try {
    const panelDir = path.join(REPO_ROOT, 'docs', '故事任务面板');
    if (fs.existsSync(panelDir)) {
      panelFileCount = sh(`find "${panelDir}" -name "*.md" -type f | wc -l`, '0').trim();
      panelFileCount = parseInt(panelFileCount, 10) || 0;
    }
  } catch {}
  try {
    const claudeDir = path.join(REPO_ROOT, '.claude');
    if (fs.existsSync(claudeDir)) {
      claudeFileCount = sh(`find "${claudeDir}" -type f | wc -l`, '0').trim();
      claudeFileCount = parseInt(claudeFileCount, 10) || 0;
    }
  } catch {}
  try {
    totalMdCount = parseInt(sh('find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | wc -l', '0').trim(), 10) || 0;
  } catch {}

  return { hasToken, reachable, panelFileCount, claudeFileCount, totalMdCount };
}

// ── Health ────────────────────────────────────────────────────

function healthSnapshot() {
  const selfImprove = path.join(__dirname, 'self-improve.js');
  const execMemory = path.join(__dirname, 'execution-memory.js');
  const health = shJson(`node "${selfImprove}" health --json`);
  const trends = shJson(`node "${execMemory}" trends --weeks 8 --json`);
  const proposals = shJson(`node "${selfImprove}" proposals --json`) || [];
  const snapshot = shJson(`node "${selfImprove}" snapshot --json`);

  return { health, trends, proposals, snapshot };
}

// ── Source module discovery ──────────────────────────────────

function discoverSourceModules(projectType) {
  const modules = [];
  const pt = projectType.type;

  if (pt === 'frontend' || pt === 'fullstack') {
    // Discover frontend component directories
    const feExts = ['.vue', '.jsx', '.tsx'];
    for (const ext of feExts) {
      const files = sh(`find . -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null`, '');
      if (!files) continue;
      const dirs = new Set();
      for (const f of files.split('\n').filter(Boolean)) {
        const dir = path.dirname(f).replace(/^\.\//, '');
        if (dir !== '.') dirs.add(dir);
      }
      for (const d of dirs) {
        const name = d.replace(/\//g, '-').replace(/^src-|^components-|^pages-/, '');
        const existing = modules.find(m => m.name === name);
        if (existing) { existing.fileCount++; continue; }
        modules.push({ name, path: d, type: 'frontend-component', fileCount: 1 });
      }
    }
  }

  if (pt === 'backend' || pt === 'fullstack') {
    // Discover backend API modules
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
      for (const d of dirs) {
        const name = d.replace(/\//g, '-');
        modules.push({ name, path: d, type: 'backend-module', fileCount: 1 });
      }
    }
  }

  if (pt === 'meta' || (pt === 'unknown' && modules.length === 0)) {
    // Discover skills, agents, rules as modules
    try {
      const skillDirs = fs.readdirSync(path.join(REPO_ROOT, 'skills'), { withFileTypes: true })
        .filter(e => e.isDirectory() && !e.name.startsWith('.'))
        .map(e => e.name);
      for (const s of skillDirs) {
        modules.push({ name: s, path: `skills/${s}`, type: 'skill', fileCount: 1 });
      }
    } catch {}
    if (fs.existsSync(path.join(REPO_ROOT, 'agents'))) {
      try {
        const agentFiles = fs.readdirSync(path.join(REPO_ROOT, 'agents'), { withFileTypes: true })
          .filter(e => e.isFile() && e.name.endsWith('.md'))
          .map(e => e.name.replace(/\.md$/, ''));
        modules.push({ name: 'agents', path: 'agents/', type: 'agent-group', fileCount: agentFiles.length });
      } catch {}
    }
    if (fs.existsSync(path.join(REPO_ROOT, 'rules'))) {
      try {
        const ruleFiles = fs.readdirSync(path.join(REPO_ROOT, 'rules'), { withFileTypes: true })
          .filter(e => e.isFile() && e.name.endsWith('.md'))
          .map(e => e.name.replace(/\.md$/, ''));
        modules.push({ name: 'rules', path: 'rules/', type: 'rule-group', fileCount: ruleFiles.length });
      } catch {}
    }
  }

  return modules;
}

function findUndocumentedModules(modules, stories) {
  // Build set of covered names from existing stories (use story slug part)
  const covered = new Set();
  for (const s of stories) {
    if (s.malformed) continue;
    const info = parseStoryDirName(s.name);
    if (info.valid) {
      covered.add(info.story);
      covered.add(info.project);  // project name also covered
    }
    // Also check if any module name is substring of story name
    covered.add(s.name);
  }

  const undocumented = [];
  for (const m of modules) {
    // Check if module is covered by any existing story
    let isCovered = false;
    for (const c of covered) {
      if (m.name === c || c.includes(m.name) || m.name.includes(c)) {
        isCovered = true;
        break;
      }
    }
    if (!isCovered) {
      undocumented.push(m);
    }
  }
  return undocumented;
}

function analyzeDocumentGaps(stories) {
  const gaps = [];
  for (const s of stories) {
    if (s.malformed || s.status === 'code_done') continue;
    if (s.missing && s.missing.length > 0) {
      const criticalMissing = s.missing.filter(f =>
        f === '01-故事任务.md' || f === '02-后端技术评审.md' || f === '03-前端技术评审.md' || f === '04-测试用例评审.md'
      );
      const reportMissing = s.missing.filter(f =>
        f === '05-后端实施报告.md' || f === '06-前端实施报告.md' || f === '07-测试用例报告.md'
      );
      const retroMissing = s.missing.includes('08-自改进复盘.md');

      if (criticalMissing.length > 0 || reportMissing.length > 0 || retroMissing) {
        gaps.push({
          story: s.name,
          status: s.status,
          criticalMissing,
          reportMissing,
          retroMissing,
          totalMissing: s.missing.length,
        });
      }
    }
  }
  return gaps;
}

// ── Recommendation generation ─────────────────────────────────

function generate(stories, git, sync, data, projectType) {
  const recs = [];
  const pt = projectType;

  // ── P0: PM 公式 — 产品视角：做什么、不做什么 ──
  // PM formula drives priority: scope definition comes first, before all other analysis
  for (const s of stories.filter(s => !s.malformed && s.status !== 'blocked' && s.status !== 'code_done')) {
    const formulas = s._formulas;
    if (!formulas || !formulas.pm) continue;

    if (!formulas.pm.hasScopeBoundary) {
      recs.push({
        priority: 'P0', category: 'pm-scope',
        action: `[PM] 定义产品边界: ${s.name}`,
        rationale: `PM公式 (作为/我想要/以便): ${formulas.pm.detail}`,
        actionable_command: `/rui doc ${s.name}`,
        story_name: s.name,
        formula: { role: 'PM', rule: '作为[角色]我想要[动作]以便[价值] + 范围边界', check: 'scope-boundary' },
      });
    }

    if (formulas.pm.hasScopeBoundary && !formulas.pm.hasExclusions) {
      recs.push({
        priority: 'P0', category: 'pm-exclusions',
        action: `[PM] 明确不做什么: ${s.name}`,
        rationale: '产品边界已定义但缺少"范围外"排除项 — 范围蔓延风险',
        actionable_command: `/rui doc ${s.name}`,
        story_name: s.name,
        formula: { role: 'PM', rule: '作为[角色]我想要[动作]以便[价值] + 范围外', check: 'exclusions' },
      });
    }
  }

  // P0 — malformed story directory names
  for (const s of stories.filter(s => s.malformed)) {
    recs.push({
      priority: 'P0', category: 'naming',
      action: `重命名故事目录: ${s.name}`,
      rationale: s.malformed_reason || '目录名缺少项目前缀',
      actionable_command: `mv docs/故事任务面板/${s.name} docs/故事任务面板/<project>-${s.name}`,
      story_name: s.name,
      formula: { role: 'PM', rule: '项目前缀约定: <project>-<name>', check: 'naming' },
    });
  }

  // P0 — blocked stories
  for (const s of stories.filter(s => s.status === 'blocked')) {
    recs.push({
      priority: 'P0', category: 'story',
      action: `恢复阻断: ${s.name}`,
      rationale: s.blockReason || '阻塞原因未记录',
      actionable_command: `/rui code ${s.name}`,
      story_name: s.name,
      formula: { role: 'PM', rule: '阻断优先处理', check: 'blocked' },
    });
  }

  // P0 — open P0 proposals
  const openP0 = (data.proposals || []).filter(p => p.status === 'open' && p.priority === 'P0');
  for (const p of openP0.slice(0, C.MAX_OPEN_P0_RECS)) {
    recs.push({
      priority: 'P0', category: 'proposal',
      action: p.title,
      rationale: p.evidence || p.problem_source || 'P0 改进提案',
      actionable_command: p.actionable_command || '/rui',
      story_name: p.story_name || null,
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'proposal' },
    });
  }

  // P0 — degrading trends
  const degradingSignals = data.trends?.degradingSignals || [];
  for (const s of degradingSignals.slice(0, C.MAX_DEGRADING_SIGNAL_RECS)) {
    recs.push({
      priority: 'P0', category: 'health',
      action: `修复 ${s.dimension} 退化趋势`,
      rationale: `连续窗口上升 (${s.window})`,
      actionable_command: '/rui',
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'degrading' },
    });
  }

  // P0 — uncommitted changes on a story branch
  if (git.hasUncommitted && !git.isMain) {
    recs.push({
      priority: 'P0', category: 'git',
      action: '提交或暂存未完成的变更',
      rationale: `分支 ${git.branch} 上有未提交的修改`,
      actionable_command: 'git status',
      formula: { role: 'Reporter', rule: '事实→偏差→影响: 未提交=不可追溯', check: 'uncommitted' },
    });
  }

  // ── P0: Tester 公式 — AC 可独立验证 ──
  for (const s of stories.filter(s => !s.malformed && s.status !== 'blocked' && s.status !== 'code_done')) {
    const formulas = s._formulas;
    if (!formulas || !formulas.tester || formulas.tester.ok) continue;

    if (!formulas.tester.hasVerifiableAC) {
      recs.push({
        priority: 'P0', category: 'tester-ac',
        action: `[Tester] 验收标准需 Given/When/Then: ${s.name}`,
        rationale: `Tester公式: ${formulas.tester.detail}`,
        actionable_command: `/rui doc ${s.name}`,
        story_name: s.name,
        formula: { role: 'Tester', rule: 'Given[前置]When[操作]Then[预期]', check: 'ac-format' },
      });
    }
  }

  // ── P1: Coder 公式 — 项目类型感知的设计检查 ──
  for (const s of stories.filter(s => s.status === 'docs_in_progress' || s.status === 'docs_done' || s.status === 'code_in_progress')) {
    const storyDir = path.join(PANEL_DIR, s.name);
    const feReview = path.join(storyDir, '03-前端技术评审.md');
    const beReview = path.join(storyDir, '02-后端技术评审.md');

    if (pt.type === 'frontend' || pt.type === 'fullstack') {
      if (fs.existsSync(feReview)) {
        try {
          const feContent = fs.readFileSync(feReview, 'utf8');
          const hasComponentInterface = /\|\s*`[^`]+`\s*\|[^|]*`[^`]*:[^`]*`\s*\|[^|]*`[^`]*\([^)]*\)`\s*\|[^|]*`[^`]*\([^)]*\)`\s*\|/.test(feContent);
          const hasStateFlow = /状态流/.test(feContent) || /数据流\s*\|/.test(feContent);
          const hasStyleIsolation = /样式隔离/.test(feContent) || /Scoped/.test(feContent) || /Shadow DOM/.test(feContent);

          if (!hasComponentInterface) {
            recs.push({
              priority: 'P1', category: 'coder-fe',
              action: `[Coder] 定义组件接口 (Props→Events→Expose): ${s.name}`,
              rationale: `前端项目需${pt.coderFormula.variant}设计 — 缺少组件契约定义`,
              actionable_command: `/rui doc ${s.name}`,
              story_name: s.name,
              formula: { role: 'Coder', rule: pt.coderFormula.text, check: 'component-interface' },
            });
          }
          if (!hasStateFlow && hasComponentInterface) {
            recs.push({
              priority: 'P2', category: 'coder-fe',
              action: `[Coder] 追踪状态流向: ${s.name}`,
              rationale: `前端${pt.coderFormula.variant} — 状态流未定义，组件间数据传递不可验证`,
              actionable_command: `/rui doc ${s.name}`,
              story_name: s.name,
              formula: { role: 'Coder', rule: '组件树→Props/Events→状态流', check: 'state-flow' },
            });
          }
          if (!hasStyleIsolation) {
            recs.push({
              priority: 'P2', category: 'coder-fe',
              action: `[Coder] 定义样式隔离策略: ${s.name}`,
              rationale: '前端组件化 — 未定义样式隔离方案，存在全局污染风险',
              actionable_command: `/rui doc ${s.name}`,
              story_name: s.name,
              formula: { role: 'Coder', rule: '样式隔离：Scoped/Shadow DOM/CSS Modules', check: 'style-isolation' },
            });
          }
        } catch {}
      }
    }

    if (pt.type === 'backend' || pt.type === 'fullstack') {
      if (fs.existsSync(beReview)) {
        try {
          const beContent = fs.readFileSync(beReview, 'utf8');
          const hasAPIContract = /\|\s*\{接口名\}\s*\|/.test(beContent) && /`\/api\/[^`]*`/.test(beContent);
          const hasDataModel = /数据模型/.test(beContent) && /\|\s*`[^`]+`\s*\|[^|]*\|[^|]*\|[^|]*(高|中|低)[^|]*\|[^|]*(高|中|低)/.test(beContent);
          const hasDomainModel = /领域/.test(beContent) || /服务架构/.test(beContent);
          const hasChannelDesign = /通信通道/.test(beContent);

          if (!hasDomainModel) {
            recs.push({
              priority: 'P1', category: 'coder-be',
              action: `[Coder] 定义领域模型: ${s.name}`,
              rationale: `后端项目需${pt.coderFormula.variant}设计 — 缺少服务架构与领域划分`,
              actionable_command: `/rui doc ${s.name}`,
              story_name: s.name,
              formula: { role: 'Coder', rule: pt.coderFormula.text, check: 'domain-model' },
            });
          }
          if (!hasAPIContract && hasDomainModel) {
            recs.push({
              priority: 'P1', category: 'coder-be',
              action: `[Coder] 定义API契约 (输入→处理→输出): ${s.name}`,
              rationale: '后端领域模型 — 缺少API接口契约，模块边界不明确',
              actionable_command: `/rui doc ${s.name}`,
              story_name: s.name,
              formula: { role: 'Coder', rule: '模块→接口→数据流: 输入→处理→输出', check: 'api-contract' },
            });
          }
          if (!hasDataModel) {
            recs.push({
              priority: 'P2', category: 'coder-be',
              action: `[Coder] 定义数据模型与迁移策略: ${s.name}`,
              rationale: '后端项目 — 缺少存储结构与数据迁移方案',
              actionable_command: `/rui doc ${s.name}`,
              story_name: s.name,
              formula: { role: 'Coder', rule: '数据模型: 存储结构→迁移策略→向后兼容', check: 'data-model' },
            });
          }
          if (!hasChannelDesign) {
            recs.push({
              priority: 'P2', category: 'coder-be',
              action: `[Coder] 设计通信通道: ${s.name}`,
              rationale: '后端项目 — 服务间通信通道未定义',
              actionable_command: `/rui doc ${s.name}`,
              story_name: s.name,
              formula: { role: 'Coder', rule: '通信通道: 协议→序列化→超时→重试', check: 'channel-design' },
            });
          }
        } catch {}
      }
    }
  }

  // ── P1: Security 公式 ──
  for (const s of stories.filter(s => s.status === 'docs_in_progress' || s.status === 'docs_done' || s.status === 'code_in_progress')) {
    const formulas = s._formulas;
    if (!formulas || !formulas.security || formulas.security.ok) continue;

    recs.push({
      priority: 'P1', category: 'security',
      action: `[Security] 识别威胁与缓解措施: ${s.name}`,
      rationale: `Security公式 (威胁→信任边界→缓解): ${formulas.security.detail}`,
      actionable_command: `/rui doc ${s.name}`,
      story_name: s.name,
      formula: { role: 'Security', rule: '威胁→信任边界→缓解', check: 'threat-model' },
    });
  }

  // P1 — docs done, ready for code
  for (const s of stories.filter(s => s.status === 'docs_done')) {
    recs.push({
      priority: 'P1', category: 'story',
      action: `开始编码: ${s.name}`,
      rationale: '文档已完成，缺少实施与测试报告',
      actionable_command: `/rui code ${s.name}`,
      story_name: s.name,
      formula: { role: 'Coder', rule: pt.coderFormula.text, check: 'code-ready' },
    });
  }

  // P1 — docs in progress
  for (const s of stories.filter(s => s.status === 'docs_in_progress')) {
    recs.push({
      priority: 'P1', category: 'story',
      action: `完成文档: ${s.name}`,
      rationale: `缺失: ${s.missing.slice(0, 3).join('、')}`,
      actionable_command: `/rui doc ${s.name}`,
      story_name: s.name,
      formula: { role: 'PM', rule: '故事=场景+边界', check: 'docs-incomplete' },
    });
  }

  // P1 — code in progress
  for (const s of stories.filter(s => s.status === 'code_in_progress')) {
    recs.push({
      priority: 'P1', category: 'story',
      action: `完成实现: ${s.name}`,
      rationale: `缺失报告: ${s.missing.slice(0, 3).join('、')}`,
      actionable_command: `/rui code ${s.name}`,
      story_name: s.name,
      formula: { role: 'Reporter', rule: '事实→偏差→影响', check: 'report-missing' },
    });
  }

  // P1 — sync needed
  if (sync.hasToken && sync.panelFileCount > 0 && !sync.reachable) {
    recs.push({
      priority: 'P1', category: 'sync',
      action: '远端 API 不可达',
      rationale: `${sync.panelFileCount} 个故事面板文件 + ${sync.claudeFileCount} 个 .claude 文件待同步`,
      actionable_command: '/import-docs --workspace',
      formula: { role: 'Reporter', rule: '知识沉淀: 文档同步', check: 'sync' },
    });
  }

  // P1 — no API token
  if (!sync.hasToken && (sync.panelFileCount > 0 || sync.claudeFileCount > 0)) {
    recs.push({
      priority: 'P1', category: 'sync',
      action: '配置 API_X_TOKEN 环境变量',
      rationale: `${sync.panelFileCount + sync.claudeFileCount} 个文件待同步`,
      actionable_command: 'export API_X_TOKEN=<token>',
      formula: { role: 'Reporter', rule: '知识沉淀: 配置同步凭证', check: 'token' },
    });
  }

  // ── P1: undocumented source modules → new story directories ──
  const modules = discoverSourceModules(projectType);
  const undocumented = findUndocumentedModules(modules, stories);
  for (const m of undocumented.slice(0, 5)) {
    const projectName = sh('git remote get-url origin 2>/dev/null | sed "s/.*\\/\\([^/]*\\)\\.git/\\1/" | head -1', '') || path.basename(REPO_ROOT);
    const storyName = `${projectName}-${m.name}`;
    const typeLabel = { 'skill': 'Skill 模块', 'agent-group': 'Agent 模块', 'rule-group': '规则模块', 'frontend-component': '前端组件', 'backend-module': '后端模块' }[m.type] || '源码模块';
    recs.push({
      priority: 'P1', category: 'new-story',
      action: `[PM] 为${typeLabel}创建故事: ${m.name}`,
      rationale: `${m.path} 缺少故事文档覆盖（${m.fileCount} 个文件未纳入故事面板）`,
      actionable_command: `/rui doc --from-code ${storyName}`,
      story_name: storyName,
      formula: { role: 'PM', rule: '作为[角色]我想要[动作]以便[价值]', check: 'new-story-dir' },
    });
  }

  // ── P2: document gaps in existing stories ──
  const docGaps = analyzeDocumentGaps(stories);
  for (const dg of docGaps.slice(0, 5)) {
    if (dg.criticalMissing.length > 0) {
      recs.push({
        priority: 'P1', category: 'doc-gap',
        action: `[Reporter] 补全 ${dg.story} 关键文档: ${dg.criticalMissing.join(', ')}`,
        rationale: `缺少 ${dg.criticalMissing.length} 份关键文档，基线不完整`,
        actionable_command: `/rui doc ${dg.story}`,
        story_name: dg.story,
        formula: { role: 'Reporter', rule: '事实→偏差→影响', check: 'doc-gap-critical' },
      });
    }
    if (dg.reportMissing.length > 0 && dg.criticalMissing.length === 0) {
      recs.push({
        priority: 'P2', category: 'doc-gap',
        action: `[Report] 补全 ${dg.story} 实施报告: ${dg.reportMissing.join(', ')}`,
        rationale: `已通过文档基线，缺少 ${dg.reportMissing.length} 份实施报告`,
        actionable_command: `/rui code --from-doc ${dg.story}`,
        story_name: dg.story,
        formula: { role: 'Reporter', rule: '事实→偏差→影响', check: 'doc-gap-report' },
      });
    }
    if (dg.retroMissing && dg.criticalMissing.length === 0 && dg.reportMissing.length === 0) {
      recs.push({
        priority: 'P2', category: 'doc-gap',
        action: `[Self-Improve] 补充 ${dg.story} 复盘文档`,
        rationale: '自改进复盘(08-自改进复盘.md)缺失，知识无法沉淀',
        actionable_command: `/rui code ${dg.story}`,
        story_name: dg.story,
        formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'doc-gap-retro' },
      });
    }
  }

  // ── P2: Reporter 公式 ──
  for (const s of stories.filter(s => s.status === 'code_in_progress')) {
    const formulas = s._formulas;
    if (!formulas || !formulas.reporter || formulas.reporter.ok) continue;

    recs.push({
      priority: 'P2', category: 'reporter',
      action: `[Reporter] 报告需遵循事实→偏差→影响: ${s.name}`,
      rationale: formulas.reporter.detail,
      actionable_command: `/rui code ${s.name}`,
      story_name: s.name,
      formula: { role: 'Reporter', rule: '事实→偏差→影响', check: 'report-format' },
    });
  }

  // P2 — open P1 proposals
  const openP1 = (data.proposals || []).filter(p => p.status === 'open' && p.priority === 'P1');
  for (const p of openP1.slice(0, C.MAX_OPEN_P1_RECS)) {
    recs.push({
      priority: 'P2', category: 'proposal',
      action: p.title,
      rationale: p.evidence || p.problem_source || 'P1 改进提案',
      actionable_command: p.actionable_command || '/rui',
      story_name: p.story_name || null,
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'proposal' },
    });
  }

  // P2 — large files
  const largeFiles = data.snapshot?.cohesionRisks || [];
  for (const f of largeFiles.slice(0, C.MAX_LARGE_FILE_RECS)) {
    recs.push({
      priority: 'P2', category: 'improvement',
      action: `拆分大文件: ${f.file}`,
      rationale: `${f.lines} 行，降低耦合度`,
      actionable_command: `/rui code ${path.basename(f.file, path.extname(f.file))}`,
      formula: { role: 'Coder', rule: pt.coderFormula.text, check: 'cohesion' },
    });
  }

  // P2 — new stories from git changes
  if (git.recentBranches.length > 0 && stories.length === 0) {
    recs.push({
      priority: 'P2', category: 'init',
      action: '创建首个故事任务',
      rationale: '项目无故事面板记录，建议从近期变更反向生成',
      actionable_command: '/rui doc --from-code',
      formula: { role: 'PM', rule: '作为[角色]我想要[动作]以便[价值]', check: 'init-story' },
    });
  }

  // P3 — health dimensions < 70
  const dims = Object.entries(data.health?.dimensions || {})
    .filter(([, v]) => v !== null && v < C.HEALTH_DIM_LOW_THRESHOLD)
    .map(([k, v]) => ({ dim: k, score: v }));
  for (const d of dims.slice(0, C.MAX_LOW_HEALTH_DIM_RECS)) {
    recs.push({
      priority: 'P3', category: 'health',
      action: `提升 ${d.dim} 健康度 (当前 ${d.score})`,
      rationale: `项目健康维度低于 ${C.HEALTH_DIM_LOW_THRESHOLD}`,
      actionable_command: '/rui',
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'health-dim' },
    });
  }

  // P3 — low proposal closure
  const proposals = data.proposals || [];
  const openCount = proposals.filter(p => p.status === 'open').length;
  const doneCount = proposals.filter(p => p.status === 'done').length;
  const totalActive = openCount + doneCount;
  if (totalActive > C.PROPOSAL_BACKLOG_MIN_ACTIVE && openCount > doneCount * C.PROPOSAL_BACKLOG_RATIO) {
    recs.push({
      priority: 'P3', category: 'improvement',
      action: `处理积压提案 (${openCount} 开放, ${doneCount} 完成)`,
      rationale: `提案积压超过 ${C.PROPOSAL_BACKLOG_RATIO}:1`,
      actionable_command: '/rui',
      formula: { role: 'Self-Improve', rule: '观察→诊断→改进', check: 'backlog' },
    });
  }

  // P3 — on main with changes
  if (git.isMain && git.hasUncommitted) {
    recs.push({
      priority: 'P3', category: 'git',
      action: '切换到功能分支工作',
      rationale: '当前在 main 分支且有未提交修改',
      actionable_command: 'git checkout -b feat/<project>-<name>',
      formula: { role: 'Coder', rule: '分支隔离: feat/<project>-<name>', check: 'branch' },
    });
  }

  return recs;
}

// ── Validation ────────────────────────────────────────────────

function validate(recs) {
  const seen = new Set();
  return recs.filter(r => {
    const key = `${r.priority}|${r.category}|${r.action}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Output ────────────────────────────────────────────────────

const STATUS_LABEL = {
  blocked: '阻断', docs_in_progress: '文档中', docs_done: '文档完成',
  code_in_progress: '代码中', code_done: '完成', not_started: '未开始',
};

function printHuman(recs, stories, git, sync, data, projectType, limit) {
  // Header
  const healthScore = data.health?.composite;
  const storySummary = stories.length > 0
    ? stories.map(s => `${s.name}(${STATUS_LABEL[s.status]})`).join(' ')
    : '无故事';

  const malformedStories = stories.filter(s => s.malformed);

  const ptLabel = { frontend: '前端', backend: '后端', fullstack: '全栈', meta: '元项目(插件)', unknown: '未知' }[projectType.type] || '未知';
  const ptFormula = projectType.coderFormula;

  console.log('# 推荐任务\n');
  console.log(`> 项目类型: **${ptLabel}** · Coder公式: \`${ptFormula.text}\` · 关注: ${ptFormula.focus}`);
  console.log(`> 健康: ${healthScore ?? 'N/A'}/100 · 故事: ${storySummary} · 分支: ${git.branch}${git.hasUncommitted ? ' (有未提交修改)' : ''}`);
  if (malformedStories.length > 0) console.log(`> ⚠️ ${malformedStories.length} 个故事目录缺少项目前缀（${malformedStories.map(s => s.name).join(', ')}）`);
  if (sync.hasToken) console.log(`> 同步: ${sync.panelFileCount} 面板 + ${sync.claudeFileCount} .claude 文件 · API ${sync.reachable ? '可达' : '不可达'}`);

  // Show formula gaps per story
  for (const s of stories) {
    if (s._formulas) {
      const gaps = [];
      for (const [role, result] of Object.entries(s._formulas)) {
        if (result && !result.ok) gaps.push(`${role}: ${result.gaps.join(', ')}`);
      }
      if (gaps.length > 0) console.log(`> 📋 ${s.name} 公式缺口: ${gaps.join(' | ')}`);
    }
  }
  console.log();

  // Recommendations table
  const limited = recs.slice(0, limit);
  if (limited.length === 0) {
    console.log('> 无推荐任务。项目状态良好。');
    return;
  }

  console.log(`| # | 优先级 | 公式(角色) | 类别 | 行动 | 理由 | 命令 |`);
  console.log(`|---|--------|-----------|------|------|------|------|`);
  limited.forEach((r, i) => {
    const cmd = r.actionable_command ? `\`${r.actionable_command}\`` : '—';
    const formulaLabel = r.formula ? `${r.formula.role}` : '—';
    console.log(`| ${i + 1} | ${r.priority} | ${formulaLabel} | ${r.category} | ${r.action} | ${r.rationale} | ${cmd} |`);
  });
  console.log();

  // Summary stats
  const byPriority = {};
  const byFormula = {};
  for (const r of limited) {
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    if (r.formula) byFormula[r.formula.role] = (byFormula[r.formula.role] || 0) + 1;
  }
  const parts = Object.entries(byPriority)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([p, c]) => `${p}: ${c}`);
  const formulaParts = Object.entries(byFormula)
    .sort(([, a], [, b]) => b - a)
    .map(([r, c]) => `${r}×${c}`);
  console.log(`${limited.length} 条推荐 (${parts.join(', ')}) · 角色分布: ${formulaParts.join(' ')}。`);
}

function printJson(recs, stories, git, sync, data, projectType, limit) {
  const output = {
    timestamp: new Date().toISOString(),
    project_type: projectType,
    context: {
      health: data.health?.composite ?? null,
      story_count: stories.length,
      stories: stories.map(s => ({
        name: s.name, status: s.status, missing: s.missing,
        malformed: s.malformed || false, project: s.project || null,
        formulas: s._formulas || null,
      })),
      branch: git.branch,
      is_main: git.isMain,
      has_uncommitted: git.hasUncommitted,
      sync: {
        has_token: sync.hasToken,
        api_reachable: sync.reachable,
        panel_files: sync.panelFileCount,
        claude_files: sync.claudeFileCount,
      },
      open_proposals: (data.proposals || []).filter(p => p.status === 'open').length,
      degrading_signals: (data.trends?.degradingSignals || []).length,
      formula_summary: stories.reduce((acc, s) => {
        if (s._formulas) {
          for (const [role, result] of Object.entries(s._formulas)) {
            if (result && !result.ok) {
              if (!acc[role]) acc[role] = [];
              acc[role].push({ story: s.name, gaps: result.gaps });
            }
          }
        }
        return acc;
      }, {}),
    },
    recommendations: recs.slice(0, limit),
  };
  console.log(JSON.stringify(output, null, 2));
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? Math.max(1, parseInt(args[limitIdx + 1], 10) || C.DEFAULT_RECOMMENDATION_LIMIT) : C.DEFAULT_RECOMMENDATION_LIMIT;

  // Collect
  const projectType = detectProjectType();
  const stories = await scanStories();
  const git = gitState();
  const sync = syncStatus();
  const data = healthSnapshot();

  // Analyze each story through role formulas
  for (const s of stories) {
    if (!s.malformed) {
      const storyDir = path.join(PANEL_DIR, s.name);
      s._formulas = analyzeStoryFormulas(storyDir);
    }
  }

  // Generate & validate
  let recs = generate(stories, git, sync, data, projectType);
  recs = validate(recs);

  // Sort: P0 → P1 → P2 → P3, then by category priority
  // PM scope first, then naming, then Tester AC, then story status, then Coder design, etc.
  const catOrder = {
    'pm-scope': 0, 'pm-exclusions': 1, naming: 2, 'tester-ac': 3,
    story: 4, security: 5, 'coder-fe': 6, 'coder-be': 6,
    'new-story': 7, 'doc-gap': 8, health: 9, proposal: 10, git: 11, sync: 12,
    reporter: 13, improvement: 14, init: 15,
  };
  const priOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  recs.sort((a, b) =>
    priOrder[a.priority] - priOrder[b.priority] ||
    (catOrder[a.category] ?? 9) - (catOrder[b.category] ?? 9)
  );

  if (jsonMode) {
    printJson(recs, stories, git, sync, data, projectType, limit);
  } else {
    printHuman(recs, stories, git, sync, data, projectType, limit);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
