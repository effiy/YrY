#!/usr/bin/env node

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const REPO_ROOT = process.cwd();
const PANEL_DIR = path.join(REPO_ROOT, 'docs', '故事任务面板');

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

// Validate story directory name: must have project prefix (<project>-<story-slug>).
// Returns { valid, project, story } — project is the prefix, story is the slug.
function parseStoryDirName(name) {
  const parts = name.split('-');
  if (parts.length < 2) return { valid: false, project: null, story: name, reason: '缺少项目前缀（格式: <project>-<name>）' };
  // Find the transition: first part starting with lowercase = story slug start
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] && /^[a-z]/.test(parts[i])) {
      return {
        valid: true,
        project: parts.slice(0, i).join('-'),
        story: parts.slice(i).join('-'),
        reason: null,
      };
    }
  }
  return { valid: false, project: null, story: name, reason: '无法识别项目前缀（故事部分应以小写字母开头）' };
}

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

async function main() {
  const jsonMode = process.argv.includes('--json');

  let dirs = [];
  try {
    const entries = await fsp.readdir(PANEL_DIR, { withFileTypes: true });
    dirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort();
  } catch {
    if (jsonMode) { console.log('[]'); process.exit(0); }
    console.log('docs/故事任务面板/ 目录不存在。运行 `/rui doc <requirement>` 创建故事。');
    process.exit(0);
  }

  if (dirs.length === 0) {
    if (jsonMode) { console.log('[]'); process.exit(0); }
    console.log('暂无故事任务。运行 `/rui doc <requirement>` 创建故事。');
    process.exit(0);
  }

  const results = [];
  for (const dir of dirs) {
    const r = await checkStory(path.join(PANEL_DIR, dir), dir);
    results.push(r);
  }

  // Enrich with recommended actions
  for (const r of results) {
    if (r.malformed) {
      r.recommended_action = '重命名为 <project>-<name> 格式';
      r.actionable_command = `mv docs/故事任务面板/${r.name} docs/故事任务面板/<project>-${r.name}`;
    } else if (r.status === 'blocked') {
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

  // Warn about malformed directory names
  const malformed = results.filter(r => r.malformed);
  if (malformed.length > 0 && !jsonMode) {
    console.log('⚠️ 以下故事目录缺少项目前缀，不符合 <project>-<name> 规范：');
    for (const m of malformed) {
      console.log(`  - ${m.name} — ${m.malformed_reason}`);
    }
    console.log();
  }

  if (jsonMode) {
    const active = results.filter(r => r.status !== 'code_done');
    const next = active.length > 0 ? active[0].name : null;
    console.log(JSON.stringify({ stories: results, malformed: malformed.map(m => m.name), next }, null, 2));
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
    if (r.malformed) status = `⚠️ 命名不合规 | ${status}`;
    const proj = r.project || '—';
    console.log(`| ${r.name} | ${proj} | ${status} | ${missing} | ${r.recommended_action} |`);
  }

  // Summary
  const counts = {};
  for (const r of incomplete) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }
  if (malformed.length > 0) counts['malformed'] = malformed.length;
  const parts = Object.entries(counts).map(([k, v]) => `${k === 'malformed' ? '命名不合规' : statusLabel(k)} ${v} 个`);
  const next = incomplete.find(r => !r.malformed) || incomplete[0];
  console.log(`\n${incomplete.length} 个未完成故事（${parts.join('，')}）。`);
  if (next) console.log(`推荐下一个: \`${next.actionable_command}\` — ${next.name}`);
}

main().catch(err => { console.error(err); process.exit(1); });
