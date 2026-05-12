#!/usr/bin/env node

// node scripts/rui-state.js <save|load|clear|next-step> [...]
// Storage: docs/故事任务面板/<name>/.memory/ (per-story)

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const STORIES_DIR = path.join(REPO_ROOT, 'docs', '故事任务面板');

function storyMemoryDir(name) { return path.join(STORIES_DIR, name, '.memory'); }
function storyStateFile(name) { return path.join(storyMemoryDir(name), 'rui-state.json'); }

const ALL_PHASES = ['自适应规划', '影响分析', '架构设计', '文档生成', '预检', '测试先行', '实现', '验证', '自改进'];
const UPDATE_PHASES = ['存在性检查', '版本/结构检测', '结构补齐', '上下文解析', '变更分级', '增量更新', '预检', '测试先行', '实现', '验证', '自改进'];

function parseArgs(argv) {
  const out = { command: null, name: null, stage: null, blocked: false, reason: '', json: false, prevStage: null, trigger: null };
  const args = argv.slice(2);
  out.action = args[0];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--command') out.command = args[++i];
    else if (a === '--name') out.name = args[++i];
    else if (a === '--stage') out.stage = args[++i];
    else if (a === '--blocked') out.blocked = true;
    else if (a === '--reason') out.reason = args[++i];
    else if (a === '--prev-stage') out.prevStage = args[++i];
    else if (a === '--trigger') out.trigger = args[++i];
    else if (a === '--json') out.json = true;
  }
  return out;
}

async function readExistingState(name) {
  if (!name) return null;
  const file = storyStateFile(name);
  try {
    const raw = await fsp.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch { return null; }
}

function getPhasesForCommand(command) {
  if (command === 'update') return UPDATE_PHASES;
  return ALL_PHASES;
}

function initPipelineProgress(currentStage, command) {
  const phases = getPhasesForCommand(command);
  const progress = {};
  let found = false;
  for (const phase of phases) {
    if (phase === currentStage) { progress[phase] = 'in_progress'; found = true; }
    else if (!found) progress[phase] = 'completed';
    else progress[phase] = 'not_started';
  }
  return progress;
}

async function cmdSave(opts) {
  if (!opts.command || !opts.name || !opts.stage) {
    console.error('save requires --command, --name, and --stage');
    process.exit(1);
  }

  const existing = await readExistingState(opts.name);
  const now = new Date().toISOString();

  let pipelineProgress;
  if (existing && existing.pipeline_progress) {
    pipelineProgress = existing.pipeline_progress;
    if (opts.blocked) {
      pipelineProgress[opts.stage] = 'blocked';
    } else {
      pipelineProgress[opts.stage] = 'in_progress';
      // Mark previous phases as completed
      let found = false;
      for (const phase of ALL_PHASES) {
        if (phase === opts.stage) { found = true; continue; }
        if (!found) pipelineProgress[phase] = 'completed';
      }
    }
  } else {
    pipelineProgress = initPipelineProgress(opts.stage, opts.command);
    if (opts.blocked) pipelineProgress[opts.stage] = 'blocked';
  }

  // Build change_history
  const changeHistory = (existing && existing.change_history) ? existing.change_history : [];
  if (opts.prevStage || changeHistory.length === 0) {
    changeHistory.push({
      timestamp: now,
      from_stage: opts.prevStage || null,
      to_stage: opts.stage,
      trigger: opts.trigger || opts.command,
    });
  }

  const state = {
    session_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    command: opts.command,
    name: opts.name,
    story_name: opts.name,
    current_stage: opts.stage,
    blocked: opts.blocked,
    block_reason: opts.blocked ? (opts.reason || 'Not specified') : null,
    timestamp: now,
    storyboard: `docs/故事任务面板/${opts.name}/01-故事任务.md`,
    pipeline_progress: pipelineProgress,
    change_history: changeHistory,
    related_proposals: (existing && existing.related_proposals) ? existing.related_proposals : [],
  };

  const json = JSON.stringify(state, null, 2);

  const sDir = storyMemoryDir(opts.name);
  await fsp.mkdir(sDir, { recursive: true });
  await fsp.writeFile(storyStateFile(opts.name), json, 'utf8');

  console.log(`State saved: ${opts.command} ${opts.name} @ ${opts.stage}${opts.blocked ? ' (BLOCKED: ' + (opts.reason || 'Not specified') + ')' : ''}`);
}

async function cmdLoad(opts) {
  if (!opts.name) {
    console.error('load requires --name');
    process.exit(1);
  }
  const file = storyStateFile(opts.name);
  try {
    const raw = await fsp.readFile(file, 'utf8');
    const state = JSON.parse(raw);

    if (opts.json) {
      console.log(JSON.stringify(state, null, 2));
      return;
    }

    const statusBadge = state.blocked ? 'BLOCKED' : 'IN PROGRESS';
    console.log(`# rui State: ${statusBadge} · ${opts.name}`);
    console.log(`- Command: ${state.command}`);
    console.log(`- Name: ${state.name}`);
    console.log(`- Stage: ${state.current_stage}`);
    console.log(`- Timestamp: ${state.timestamp}`);
    if (state.pipeline_progress) {
      const phases = Object.entries(state.pipeline_progress)
        .map(([p, s]) => `${p}: ${s}`).join(', ');
      console.log(`- Pipeline: ${phases}`);
    }
    if (state.blocked) {
      console.log(`- Block Reason: ${state.block_reason}`);
      console.log(`\n→ Re-run the same /rui command to resume from ${state.current_stage}`);
    }
  } catch {
    if (opts.json) {
      console.log('null');
    } else {
      console.log(`> No active rui session found for ${opts.name}.`);
    }
  }
}

async function cmdClear(opts) {
  if (!opts.name) {
    console.error('clear requires --name');
    process.exit(1);
  }
  const file = storyStateFile(opts.name);
  try { await fsp.unlink(file); console.log('State cleared.'); } catch {
    console.log('> No state file to clear.');
  }
}

async function cmdNextStep() {
  const storyboards = await findStoryboards();

  if (storyboards.length === 0) {
    console.log('运行 `/rui init` 初始化项目，或 `/rui doc <requirement>` 开始第一个故事。');
    return;
  }

  // Scan per-story states for blocked/in-progress/completed
  const storyDetails = [];
  let blockedStory = null;
  for (const n of storyboards) {
    const ps = await readExistingState(n);
    if (ps && ps.pipeline_progress) {
      const inProgress = Object.entries(ps.pipeline_progress).find(([, s]) => s === 'in_progress');
      const blocked = Object.entries(ps.pipeline_progress).find(([, s]) => s === 'blocked');
      if (blocked) {
        storyDetails.push(`${n}(阻断@${blocked[0]})`);
        if (!blockedStory) blockedStory = ps;
      } else if (inProgress) {
        storyDetails.push(`${n}(${inProgress[0]})`);
      } else {
        storyDetails.push(`${n}(文档完成)`);
      }
    } else {
      storyDetails.push(n);
    }
  }

  if (blockedStory) {
    const stageInfo = blockedStory.current_stage ? ` (从 ${blockedStory.current_stage} 恢复)` : '';
    console.log(`重新运行 \`/rui ${blockedStory.command} ${blockedStory.name}\`${stageInfo}。阻断原因: ${blockedStory.block_reason || '未指定'}`);
    console.log(`所有故事: ${storyDetails.join(', ')}`);
    return;
  }

  console.log(`运行 \`/rui <name>\` 开始端到端流程。已有故事板: ${storyDetails.join(', ')}`);
}

async function findStoryboards() {
  const dir = path.join(REPO_ROOT, 'docs', '故事任务面板');
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name)
      .sort();
  } catch {
    return [];
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  switch (opts.action) {
    case 'save': await cmdSave(opts); break;
    case 'load': await cmdLoad(opts); break;
    case 'clear': await cmdClear(opts); break;
    case 'next-step': await cmdNextStep(); break;
    default:
      console.error(`Unknown action: ${opts.action}`);
      process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });