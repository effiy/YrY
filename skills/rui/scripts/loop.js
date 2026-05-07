#!/usr/bin/env node

/**
 * self-improve-loop — multi-round improvement orchestrator
 *
 * Usage:
 *   node scripts/loop.js run --storyboard <path>     Append to a storyboard file
 *   node scripts/loop.js run --all                   Append to all storyboards
 *   node scripts/loop.js status [--json]
 *   node scripts/loop.js report [--json]             Output report to stdout only
 *
 * Output is appended to docs/storyboards/<name>.md after the existing content.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SELF_IMPROVE = path.join(REPO_ROOT, '.claude/skills/rui/scripts/self-improve.js');
const EXEC_MEMORY = path.join(REPO_ROOT, '.claude/skills/rui/scripts/execution-memory.js');
const STORYBOARDS_DIR = path.join(REPO_ROOT, 'docs', 'storyboards');
const STATE_FILE = path.join(REPO_ROOT, '.claude', '.loop-state.json');

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], cwd: REPO_ROOT }).trim();
  } catch { return ''; }
}

function shJson(cmd) {
  const out = sh(cmd);
  if (!out) return null;
  try { return JSON.parse(out); } catch { return null; }
}

// ── Data collection ──

function collect() {
  const health = shJson(`node "${SELF_IMPROVE}" health --json`);
  const trends = shJson(`node "${EXEC_MEMORY}" trends --weeks 8 --json`);
  const proposals = shJson(`node "${SELF_IMPROVE}" proposals --json`) || [];
  const retro = shJson(`node "${SELF_IMPROVE}" retro --weeks 8 --json`);
  const snapshot = shJson(`node "${SELF_IMPROVE}" snapshot --json`);

  const openProposals = proposals.filter(p => p.status === 'open');
  const openP0 = openProposals.filter(p => p.priority === 'P0');
  const openP1 = openProposals.filter(p => p.priority === 'P1');
  const degradingSignals = trends?.degradingSignals || [];
  const largeFiles = snapshot?.cohesionRisks || [];
  const hotspots = snapshot?.dependencies?.hotspots || [];
  const evalResults = proposals.filter(p => p.eval_result && p.eval_result !== 'pending');
  const improved = evalResults.filter(e => e.eval_result === 'improved').length;
  const degraded = evalResults.filter(e => e.eval_result === 'degraded').length;

  return {
    health,
    openP0,
    openP1,
    degradingSignals,
    largeFiles,
    hotspots,
    improved,
    degraded,
    totalOpen: openProposals.length,
    totalProposals: proposals.length,
    closureRate: retro?.proposals?.closureRate,
    attentionItems: retro?.attention_items || [],
  };
}

// ── Report generator (compact, for appending to storyboards) ──

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function generate(data) {
  const lines = [];
  lines.push('---');
  lines.push('');
  lines.push('## 自我改进循环');
  lines.push('');
  lines.push(`> 运行时间: ${now()} · 健康评分: **${data.health?.composite ?? 'N/A'}/100** · 开放提案: ${data.totalOpen}`);
  lines.push('');

  // ── 改进清单 ──
  lines.push('### 改进清单');
  lines.push('');

  let itemNum = 0;
  const items = [];

  for (const p of data.openP0) {
    items.push({ priority: 'P0', type: p.type || '未分类', item: p.title, evidence: p.evidence || p.problem_source || '—' });
  }
  for (const s of data.degradingSignals) {
    items.push({ priority: 'P1', type: '退化信号', item: `${s.dimension} rate rising`, evidence: s.window });
  }
  for (const p of data.openP1.slice(0, 3)) {
    items.push({ priority: 'P1', type: p.type || '未分类', item: p.title, evidence: p.evidence || p.problem_source || '—' });
  }
  for (const f of data.largeFiles.slice(0, 3)) {
    items.push({ priority: 'P2', type: '大文件', item: `\`${f.file}\` (${f.lines} lines)`, evidence: 'snapshot' });
  }

  if (items.length === 0) {
    lines.push('> 无待改进项');
    lines.push('');
  } else {
    lines.push('| # | Priority | Type | Item | Evidence |');
    lines.push('|---|----------|------|------|----------|');
    for (const item of items) {
      itemNum++;
      lines.push(`| ${itemNum} | ${item.priority} | ${item.type} | ${item.item} | ${item.evidence} |`);
    }
    lines.push('');
  }

  // ── 系统架构演进任务 ──
  lines.push('### 系统架构演进任务');
  lines.push('');

  const tasks = [];
  let taskNum = 0;

  // Near-term: P0 proposals + degrading signals
  for (const p of data.openP0) {
    tasks.push({ horizon: '近期', task: p.title, rationale: p.evidence || 'P0 开放提案', status: 'pending' });
  }
  for (const s of data.degradingSignals) {
    tasks.push({ horizon: '近期', task: `修复 ${s.dimension} 退化趋势`, rationale: `连续窗口上升 (${s.window})`, status: 'pending' });
  }

  // Mid-term: large file splits, degraded proposals
  if (data.largeFiles.length > 0) {
    tasks.push({ horizon: '中期', task: `拆分 ${data.largeFiles.length} 个大文件 (>300行)`, rationale: '降低耦合度，提升内聚性', status: 'pending' });
  }
  if (data.degraded > 0) {
    tasks.push({ horizon: '中期', task: `处理 ${data.degraded} 个退化提案`, rationale: '已评估为 degraded', status: 'pending' });
  }
  if (data.hotspots.length > 0) {
    const top = data.hotspots[0];
    tasks.push({ horizon: '中期', task: `解耦依赖热点: ${top.target}`, rationale: `Fan-in: ${top.fanIn}`, status: 'pending' });
  }

  // Long-term
  if (data.closureRate !== undefined && data.closureRate < 0.5) {
    tasks.push({ horizon: '远期', task: `提升提案闭合率 (当前 ${(data.closureRate * 100).toFixed(0)}%)`, rationale: '改进引擎效果跟踪', status: 'pending' });
  }
  if (data.health?.composite !== null && data.health?.composite < 70) {
    const dims = Object.entries(data.health?.dimensions || {}).filter(([, v]) => v !== null && v < 70).map(([k]) => k);
    if (dims.length > 0) {
      tasks.push({ horizon: '远期', task: `提升健康维度: ${dims.join(', ')}`, rationale: `当前综合评分 ${data.health.composite}/100`, status: 'pending' });
    }
  }

  // Already resolved (from eval)
  const resolvedCount = data.improved || 0;
  if (resolvedCount > 0) {
    tasks.push({ horizon: '已完成', task: `${resolvedCount} 个提案验证改善`, rationale: 'eval_result=improved', status: 'done' });
  }

  if (tasks.length === 0) {
    lines.push('> 无演进任务');
    lines.push('');
  } else {
    lines.push('| # | Horizon | Task | Rationale | Status |');
    lines.push('|---|---------|------|-----------|--------|');
    for (const t of tasks) {
      taskNum++;
      const status = t.status === 'done' ? 'done' : 'pending';
      lines.push(`| ${taskNum} | ${t.horizon} | ${t.task} | ${t.rationale} | ${status} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── Storyboard operations ──

const SECTION_MARKER = '## 自我改进循环';

function stripExistingLoopSection(content) {
  const idx = content.indexOf(`\n${SECTION_MARKER}`);
  if (idx === -1) return content;
  return content.slice(0, idx).trimEnd();
}

async function appendToStoryboard(filePath, data) {
  let content;
  try {
    content = await fsp.readFile(filePath, 'utf8');
  } catch {
    console.error(`  skip: cannot read ${filePath}`);
    return false;
  }

  content = stripExistingLoopSection(content);
  const report = generate(data);
  await fsp.writeFile(filePath, content.trimEnd() + '\n\n' + report + '\n', 'utf8');
  return true;
}

async function findStoryboards() {
  try {
    const entries = await fsp.readdir(STORYBOARDS_DIR, { withFileTypes: true });
    return entries
      .filter(e => e.isFile() && e.name.endsWith('.md'))
      .map(e => path.join(STORYBOARDS_DIR, e.name));
  } catch {
    return [];
  }
}

// ── State ──

async function loadState() {
  try {
    return JSON.parse(await fsp.readFile(STATE_FILE, 'utf8'));
  } catch { return { runs: [] }; }
}

async function saveState(state) {
  await fsp.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

// ── Commands ──

async function cmdRun(opts) {
  const data = collect();
  const report = generate(data);
  const state = await loadState();

  let files = [];
  if (opts.storyboard) {
    files = [opts.storyboard];
  } else if (opts.all) {
    files = await findStoryboards();
  }

  let appended = 0;
  if (files.length > 0) {
    for (const f of files) {
      const ok = await appendToStoryboard(f, data);
      if (ok) appended++;
    }
  }

  // Update state
  state.lastRun = now();
  state.health = data.health?.composite;
  state.openProposals = data.totalOpen;
  state.runs.push({ timestamp: now(), health: data.health?.composite, open: data.totalOpen, appended });
  if (state.runs.length > 20) state.runs = state.runs.slice(-20);
  await saveState(state);

  if (opts.json) {
    console.log(JSON.stringify({
      health: data.health?.composite,
      openProposals: data.totalOpen,
      improvements: data.openP0.length + data.openP1.length,
      degraded: data.degraded,
      appended,
      files: files.map(f => path.relative(REPO_ROOT, f)),
    }, null, 2));
  } else {
    console.log(`Self-improve loop done.`);
    console.log(`  Health: ${data.health?.composite}/100 | Open: ${data.totalOpen} | Improved: ${data.improved} | Degraded: ${data.degraded}`);
    if (files.length > 0) console.log(`  Appended to ${appended} storyboard(s)`);
    else console.log(`  Report (stdout only):\n${report}`);
  }
}

async function cmdReport(opts) {
  const data = collect();
  const report = generate(data);
  if (opts.json) {
    console.log(JSON.stringify({ report }, null, 2));
  } else {
    console.log(report);
  }
}

async function cmdStatus(opts) {
  const state = await loadState();
  if (opts.json) {
    console.log(JSON.stringify(state, null, 2));
  } else {
    console.log(`# Self-Improve Loop Status`);
    console.log(`- Last run: ${state.lastRun || 'never'}`);
    console.log(`- Total runs: ${state.runs.length}`);
    if (state.lastRun) {
      console.log(`- Health: ${state.health ?? 'N/A'}/100`);
      console.log(`- Open proposals: ${state.openProposals ?? 'N/A'}`);
    }
  }
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const opts = { storyboard: null, all: false, json: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--storyboard') opts.storyboard = path.resolve(args[++i]);
    else if (args[i] === '--all') opts.all = true;
    else if (args[i] === '--json') opts.json = true;
    else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`Usage:
  node scripts/loop.js run --storyboard <path>    Append to a specific storyboard
  node scripts/loop.js run --all                  Append to all storyboards
  node scripts/loop.js report [--json]            Output report to stdout
  node scripts/loop.js status [--json]            Show run history`);
      process.exit(0);
    }
  }

  if (cmd === 'run') await cmdRun(opts);
  else if (cmd === 'report') await cmdReport(opts);
  else if (cmd === 'status') await cmdStatus(opts);
  else {
    console.error(`Usage: node scripts/loop.js <run|report|status> [--storyboard <path>|--all] [--json]`);
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
