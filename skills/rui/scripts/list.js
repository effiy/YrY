#!/usr/bin/env node

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const C = require('./constants.js');

const REPO_ROOT = process.cwd();
const PANEL_DIR = path.join(REPO_ROOT, 'docs', '故事任务面板');

const { parseStoryDirName } = C;

const STORY_FILES = [
  '01-故事任务.md',
  '02-后端技术评审.md',
  '03-前端技术评审.md',
  '04-测试用例评审.md',
  '05-后端实施报告.md',
  '06-前端实施报告.md',
  '07-测试用例报告.md',
  '08-自改进复盘.md',
];

const DOC_FILES = ['01-故事任务.md', '02-后端技术评审.md', '03-前端技术评审.md', '04-测试用例评审.md'];
const REPORT_FILES = ['05-后端实施报告.md', '06-前端实施报告.md', '07-测试用例报告.md'];
const BASELINE_FILES = [...STORY_FILES];

function statusLabel(status) {
  const map = {
    not_started: '未开始',
    docs_in_progress: '文档进行中',
    docs_done: '文档完成',
    code_in_progress: '代码进行中',
    code_done: '代码完成',
    blocked: '阻断',
  };
  return map[status] || status;
}

async function checkStory(dirPath, name) {
  const exists = {};
  for (const f of STORY_FILES) {
    try {
      await fsp.access(path.join(dirPath, f), fs.constants.F_OK);
      exists[f] = true;
    } catch {
      exists[f] = false;
    }
  }

  // Check blocked state
  let blocked = false;
  let blockReason = '';
  try {
    const stateRaw = await fsp.readFile(path.join(dirPath, '.memory', 'rui-state.json'), 'utf8');
    const state = JSON.parse(stateRaw);
    if (state.blocked) {
      blocked = true;
      blockReason = state.block_reason || '';
    }
  } catch {}

  // Determine status
  let status;
  if (blocked) {
    status = 'blocked';
  } else if (!exists['01-故事任务.md']) {
    status = 'not_started';
  } else if (!DOC_FILES.every(f => exists[f])) {
    status = 'docs_in_progress';
  } else if (!REPORT_FILES.every(f => exists[f])) {
    // All docs done, but missing reports → docs done; otherwise code in progress
    const anyReport = REPORT_FILES.some(f => exists[f]);
    status = anyReport ? 'code_in_progress' : 'docs_done';
  } else {
    status = 'code_done';
  }

  // Collect missing files
  const missing = [];
  for (const f of STORY_FILES) {
    if (!exists[f]) missing.push(f);
  }

  const nameInfo = parseStoryDirName(name);

  return { name, status, missing, blockReason, malformed: !nameInfo.valid, malformed_reason: nameInfo.reason, project: nameInfo.project };
}

// Scan two levels: project dirs → story dirs
async function scanStories() {
  const stories = [];
  let projectDirs = [];
  try {
    const entries = await fsp.readdir(PANEL_DIR, { withFileTypes: true });
    projectDirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort();
  } catch {
    return stories; // panel dir doesn't exist
  }

  for (const proj of projectDirs) {
    const projPath = path.join(PANEL_DIR, proj);
    let storyDirs = [];
    try {
      const entries = await fsp.readdir(projPath, { withFileTypes: true });
      storyDirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort();
    } catch {
      continue;
    }

    for (const story of storyDirs) {
      const fullName = `${proj}-${story}`;
      const dirPath = path.join(projPath, story);
      stories.push({ project: proj, story, fullName, dirPath });
    }
  }

  return stories;
}

async function main() {
  const jsonMode = process.argv.includes('--json');

  const storyEntries = await scanStories();

  if (storyEntries.length === 0) {
    if (jsonMode) { console.log('[]'); process.exit(0); }
    const panelExists = await fsp.access(PANEL_DIR).then(() => true).catch(() => false);
    if (!panelExists) {
      console.log('docs/故事任务面板/ 目录不存在。运行 `/rui doc <requirement>` 创建故事。');
    } else {
      console.log('暂无故事任务。运行 `/rui doc <requirement>` 创建故事。');
    }
    process.exit(0);
  }

  const results = [];
  for (const entry of storyEntries) {
    const r = await checkStory(entry.dirPath, entry.fullName);
    r.project = entry.project;
    results.push(r);
  }

  // Enrich with recommended actions
  for (const r of results) {
    if (r.status === 'blocked') {
      r.recommended_action = '恢复阻断后继续';
      r.actionable_command = `/rui code ${r.name}`;
    } else if (r.status === 'not_started') {
      r.recommended_action = '从文档管线开始';
      r.actionable_command = `/rui doc ${r.name}`;
    } else if (r.status === 'docs_in_progress') {
      r.recommended_action = '补全缺失文档';
      r.actionable_command = `/rui doc ${r.name}`;
    } else if (r.status === 'docs_done') {
      r.recommended_action = '进入代码管线';
      r.actionable_command = `/rui code ${r.name}`;
    } else if (r.status === 'code_in_progress') {
      r.recommended_action = '完成实现与验证';
      r.actionable_command = `/rui code ${r.name}`;
    } else {
      r.recommended_action = '已完成';
      r.actionable_command = null;
    }
  }

  if (jsonMode) {
    const active = results.filter(r => r.status !== 'code_done');
    const next = active.length > 0 ? active[0].name : null;
    console.log(JSON.stringify({ stories: results, next }, null, 2));
    process.exit(0);
  }

  const incomplete = results.filter(r => r.status !== 'code_done');

  if (incomplete.length === 0) {
    console.log('所有故事任务已完成。');
    process.exit(0);
  }

  // Output table
  console.log('| 故事 | 项目 | 状态 | 缺失产出 | 推荐行动 |');
  console.log('|------|------|------|---------|---------|');
  for (const r of incomplete) {
    const missing = r.missing.length > 0 ? r.missing.join('、') : '—';
    let status = r.status === 'blocked'
      ? `${statusLabel(r.status)}: ${r.blockReason || '未指定原因'}`
      : statusLabel(r.status);
    const proj = r.project || '—';
    const displayName = r.project ? `${r.project}/${r.name.replace(r.project + '-', '')}` : r.name;
    console.log(`| ${displayName} | ${proj} | ${status} | ${missing} | ${r.recommended_action} |`);
  }

  // Summary
  const counts = {};
  for (const r of incomplete) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }
  const parts = Object.entries(counts).map(([k, v]) => `${statusLabel(k)} ${v} 个`);
  const next = incomplete[0];
  console.log(`\n${incomplete.length} 个未完成故事（${parts.join('，')}）。`);
  if (next) console.log(`推荐下一个: \`${next.actionable_command}\` — ${next.name}`);
}

main().catch(err => { console.error(err); process.exit(1); });
