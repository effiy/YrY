#!/usr/bin/env node

// node scripts/recommend.js [--json] [--limit N]
// Unified recommendation engine: story status + health + proposals + git + sync

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { execSync } = require('child_process');

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
      return { valid: true, project: parts.slice(0, i).join('-'), reason: null };
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

// ── Recommendation generation ─────────────────────────────────

function generate(stories, git, sync, data) {
  const recs = [];

  // P0 — malformed story directory names (missing project prefix)
  for (const s of stories.filter(s => s.malformed)) {
    recs.push({
      priority: 'P0', category: 'naming',
      action: `重命名故事目录: ${s.name}`,
      rationale: s.malformed_reason || '目录名缺少项目前缀',
      actionable_command: `mv docs/故事任务面板/${s.name} docs/故事任务面板/<project>-${s.name}`,
      story_name: s.name,
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
    });
  }

  // P0 — open P0 proposals
  const openP0 = (data.proposals || []).filter(p => p.status === 'open' && p.priority === 'P0');
  for (const p of openP0.slice(0, 3)) {
    recs.push({
      priority: 'P0', category: 'proposal',
      action: p.title,
      rationale: p.evidence || p.problem_source || 'P0 改进提案',
      actionable_command: p.actionable_command || '/rui',
      story_name: p.story_name || null,
    });
  }

  // P0 — degrading trends
  const degradingSignals = data.trends?.degradingSignals || [];
  for (const s of degradingSignals.slice(0, 2)) {
    recs.push({
      priority: 'P0', category: 'health',
      action: `修复 ${s.dimension} 退化趋势`,
      rationale: `连续窗口上升 (${s.window})`,
      actionable_command: '/rui',
    });
  }

  // P0 — uncommitted changes on a story branch
  if (git.hasUncommitted && !git.isMain) {
    recs.push({
      priority: 'P0', category: 'git',
      action: '提交或暂存未完成的变更',
      rationale: `分支 ${git.branch} 上有未提交的修改`,
      actionable_command: 'git status',
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
    });
  }

  // P1 — sync needed
  if (sync.hasToken && sync.panelFileCount > 0 && !sync.reachable) {
    recs.push({
      priority: 'P1', category: 'sync',
      action: '远端 API 不可达',
      rationale: `${sync.panelFileCount} 个故事面板文件 + ${sync.claudeFileCount} 个 .claude 文件待同步`,
      actionable_command: '/import-docs --workspace',
    });
  }

  // P1 — no API token
  if (!sync.hasToken && (sync.panelFileCount > 0 || sync.claudeFileCount > 0)) {
    recs.push({
      priority: 'P1', category: 'sync',
      action: '配置 API_X_TOKEN 环境变量',
      rationale: `${sync.panelFileCount + sync.claudeFileCount} 个文件待同步`,
      actionable_command: 'export API_X_TOKEN=<token>',
    });
  }

  // P2 — open P1 proposals
  const openP1 = (data.proposals || []).filter(p => p.status === 'open' && p.priority === 'P1');
  for (const p of openP1.slice(0, 3)) {
    recs.push({
      priority: 'P2', category: 'proposal',
      action: p.title,
      rationale: p.evidence || p.problem_source || 'P1 改进提案',
      actionable_command: p.actionable_command || '/rui',
      story_name: p.story_name || null,
    });
  }

  // P2 — large files
  const largeFiles = data.snapshot?.cohesionRisks || [];
  for (const f of largeFiles.slice(0, 2)) {
    recs.push({
      priority: 'P2', category: 'improvement',
      action: `拆分大文件: ${f.file}`,
      rationale: `${f.lines} 行，降低耦合度`,
      actionable_command: `/rui code ${path.basename(f.file, path.extname(f.file))}`,
    });
  }

  // P2 — new stories from git changes
  if (git.recentBranches.length > 0 && stories.length === 0) {
    recs.push({
      priority: 'P2', category: 'init',
      action: '创建首个故事任务',
      rationale: '项目无故事面板记录，建议从近期变更反向生成',
      actionable_command: '/rui doc --from-code',
    });
  }

  // P3 — health dimensions < 70
  const dims = Object.entries(data.health?.dimensions || {})
    .filter(([, v]) => v !== null && v < 70)
    .map(([k, v]) => ({ dim: k, score: v }));
  for (const d of dims.slice(0, 2)) {
    recs.push({
      priority: 'P3', category: 'health',
      action: `提升 ${d.dim} 健康度 (当前 ${d.score})`,
      rationale: '项目健康维度低于 70',
      actionable_command: '/rui',
    });
  }

  // P3 — low proposal closure
  const proposals = data.proposals || [];
  const openCount = proposals.filter(p => p.status === 'open').length;
  const doneCount = proposals.filter(p => p.status === 'done').length;
  const totalActive = openCount + doneCount;
  if (totalActive > 3 && openCount > doneCount * 2) {
    recs.push({
      priority: 'P3', category: 'improvement',
      action: `处理积压提案 (${openCount} 开放, ${doneCount} 完成)`,
      rationale: '提案积压超过 2:1',
      actionable_command: '/rui',
    });
  }

  // P3 — on main with changes
  if (git.isMain && git.hasUncommitted) {
    recs.push({
      priority: 'P3', category: 'git',
      action: '切换到功能分支工作',
      rationale: '当前在 main 分支且有未提交修改',
      actionable_command: 'git checkout -b feat/<project>-<name>',
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

function printHuman(recs, stories, git, sync, data, limit) {
  // Header
  const healthScore = data.health?.composite;
  const storySummary = stories.length > 0
    ? stories.map(s => `${s.name}(${STATUS_LABEL[s.status]})`).join(' ')
    : '无故事';

  const malformedStories = stories.filter(s => s.malformed);

  console.log('# 推荐任务\n');
  console.log(`> 健康: ${healthScore ?? 'N/A'}/100 · 故事: ${storySummary} · 分支: ${git.branch}${git.hasUncommitted ? ' (有未提交修改)' : ''}`);
  if (malformedStories.length > 0) console.log(`> ⚠️ ${malformedStories.length} 个故事目录缺少项目前缀（${malformedStories.map(s => s.name).join(', ')}）`);
  if (sync.hasToken) console.log(`> 同步: ${sync.panelFileCount} 面板 + ${sync.claudeFileCount} .claude 文件 · API ${sync.reachable ? '可达' : '不可达'}`);
  console.log();

  // Recommendations table
  const limited = recs.slice(0, limit);
  if (limited.length === 0) {
    console.log('> 无推荐任务。项目状态良好。');
    return;
  }

  console.log(`| # | 优先级 | 类别 | 行动 | 理由 | 命令 |`);
  console.log(`|---|--------|------|------|------|------|`);
  limited.forEach((r, i) => {
    const cmd = r.actionable_command ? `\`${r.actionable_command}\`` : '—';
    console.log(`| ${i + 1} | ${r.priority} | ${r.category} | ${r.action} | ${r.rationale} | ${cmd} |`);
  });
  console.log();

  // Summary stats
  const byPriority = {};
  for (const r of limited) {
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
  }
  const parts = Object.entries(byPriority)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([p, c]) => `${p}: ${c}`);
  console.log(`${limited.length} 条推荐 (${parts.join(', ')})。`);
}

function printJson(recs, stories, git, sync, data, limit) {
  const output = {
    timestamp: new Date().toISOString(),
    context: {
      health: data.health?.composite ?? null,
      story_count: stories.length,
      stories: stories.map(s => ({ name: s.name, status: s.status, missing: s.missing, malformed: s.malformed || false, project: s.project || null })),
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
  const limit = limitIdx !== -1 ? Math.max(1, parseInt(args[limitIdx + 1], 10) || 10) : 10;

  // Collect
  const stories = await scanStories();
  const git = gitState();
  const sync = syncStatus();
  const data = healthSnapshot();

  // Generate & validate
  let recs = generate(stories, git, sync, data);
  recs = validate(recs);

  // Sort: P0 → P1 → P2 → P3, then by category priority (naming > story > health > proposal > git > sync > improvement > init)
  const catOrder = { naming: 0, story: 1, health: 2, proposal: 3, git: 4, sync: 5, improvement: 6, init: 7 };
  const priOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  recs.sort((a, b) =>
    priOrder[a.priority] - priOrder[b.priority] ||
    (catOrder[a.category] ?? 9) - (catOrder[b.category] ?? 9)
  );

  if (jsonMode) {
    printJson(recs, stories, git, sync, data, limit);
  } else {
    printHuman(recs, stories, git, sync, data, limit);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
