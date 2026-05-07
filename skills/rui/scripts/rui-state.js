#!/usr/bin/env node

/**
 * rui-state — 断点续传状态管理
 *
 * Usage:
 *   node scripts/rui-state.js save --command <cmd> --name <name> --stage <stage> [--blocked] [--reason <text>]
 *   node scripts/rui-state.js load [--json]
 *   node scripts/rui-state.js clear
 *   node scripts/rui-state.js next-step
 *
 * Storage: docs/.memory/rui-state.json
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const MEMORY_DIR = path.join(REPO_ROOT, 'docs', '.memory');
const STATE_FILE = path.join(MEMORY_DIR, 'rui-state.json');

function parseArgs(argv) {
  const out = { command: null, name: null, stage: null, blocked: false, reason: '', json: false };
  const args = argv.slice(2);
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`Usage:
  node scripts/rui-state.js save --command <cmd> --name <name> --stage <stage> [--blocked] [--reason <text>]
  node scripts/rui-state.js load [--json]
  node scripts/rui-state.js clear
  node scripts/rui-state.js next-step
  node scripts/rui-state.js find-pending [--json]
`);
    process.exit(0);
  }
  out.action = args[0];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--command') out.command = args[++i];
    else if (a === '--name') out.name = args[++i];
    else if (a === '--stage') out.stage = args[++i];
    else if (a === '--blocked') out.blocked = true;
    else if (a === '--reason') out.reason = args[++i];
    else if (a === '--json') out.json = true;
  }
  return out;
}

async function ensureDir() {
  await fsp.mkdir(MEMORY_DIR, { recursive: true });
}

async function cmdSave(opts) {
  if (!opts.command || !opts.name || !opts.stage) {
    console.error('save requires --command, --name, and --stage');
    process.exit(1);
  }

  const state = {
    session_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    command: opts.command,
    name: opts.name,
    current_stage: opts.stage,
    blocked: opts.blocked,
    block_reason: opts.blocked ? (opts.reason || 'Not specified') : null,
    timestamp: new Date().toISOString(),
    storyboard: `docs/storyboards/${opts.name}.md`,
  };

  await ensureDir();
  await fsp.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  console.log(`State saved: ${opts.command} ${opts.name} @ ${opts.stage}${opts.blocked ? ' (BLOCKED: ' + (opts.reason || 'Not specified') + ')' : ''}`);
}

async function cmdLoad(opts) {
  try {
    const raw = await fsp.readFile(STATE_FILE, 'utf8');
    const state = JSON.parse(raw);

    if (opts.json) {
      console.log(JSON.stringify(state, null, 2));
      return;
    }

    const statusBadge = state.blocked ? 'BLOCKED' : 'IN PROGRESS';
    console.log(`# rui State: ${statusBadge}`);
    console.log(`- Command: ${state.command}`);
    console.log(`- Name: ${state.name}`);
    console.log(`- Stage: ${state.current_stage}`);
    console.log(`- Timestamp: ${state.timestamp}`);
    if (state.blocked) {
      console.log(`- Block Reason: ${state.block_reason}`);
      console.log(`\n→ Re-run the same /rui command to resume from ${state.current_stage}`);
    }
  } catch {
    if (opts.json) {
      console.log('null');
    } else {
      console.log('> No active rui session found.');
    }
  }
}

async function cmdClear() {
  try {
    await fsp.unlink(STATE_FILE);
    console.log('State cleared.');
  } catch {
    console.log('> No state file to clear.');
  }
}

async function cmdNextStep() {
  const state = await readState();
  const storyboards = await findStoryboards();

  // Blocked → resume
  if (state && state.blocked) {
    const stageInfo = state.current_stage ? ` (从 ${state.current_stage} 恢复)` : '';
    console.log(`重新运行 \`/rui ${state.command} ${state.name}\`${stageInfo}。阻断原因: ${state.block_reason || '未指定'}`);
    return;
  }

  // No state at all
  if (!state) {
    if (storyboards.length > 0) {
      const names = storyboards.map(s => path.basename(s, '.md'));
      console.log(`运行 \`/rui <name>\` 开始端到端流程。已有故事板: ${names.join(', ')}`);
    } else {
      console.log('运行 `/rui init` 初始化项目，或 `/rui <name>` 开始第一个端到端流程。');
    }
    return;
  }

  // Not blocked, normal completion
  const { command, name } = state;

  if (command === 'init') {
    // After init completes: suggest next story to doc/code
    if (storyboards.length > 0) {
      const names = storyboards.map(s => path.basename(s, '.md'));
      console.log(`运行 \`/rui doc ${names[0].replace('.md', '')}\` 开始编写文档。已有故事板: ${names.join(', ')}`);
    } else {
      console.log('运行 `/rui <name>` 开始第一个端到端流程。');
    }
  } else if (command === 'doc') {
    console.log(`运行 \`/rui code ${name}\` 开始编码实现。`);
  } else if (command === 'code') {
    // After code completes: check if more stories need code
    const remaining = storyboards
      .map(s => path.basename(s, '.md'))
      .filter(n => n !== name);

    if (remaining.length > 0) {
      console.log(`运行 \`/rui code ${remaining[0]}\` 继续下一个故事。剩余故事: ${remaining.join(', ')}`);
    } else {
      console.log('所有故事已处理完毕。运行 `/rui init` 进行健康检查，或创建新故事。');
    }
  } else {
    // Full pipeline (端到端)
    if (storyboards.length > 0) {
      const names = storyboards.map(s => path.basename(s, '.md'));
      const remaining = names.filter(n => n !== name);
      if (remaining.length > 0) {
        console.log(`运行 \`/rui ${remaining[0]}\` 继续下一个故事。剩余故事: ${remaining.join(', ')}`);
      } else {
        console.log('所有故事已处理完毕。');
      }
    } else {
      console.log('运行 `/rui <name>` 开始下一个端到端流程。');
    }
  }
}

async function readState() {
  try {
    const raw = await fsp.readFile(STATE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function findStoryboards() {
  const dir = path.join(REPO_ROOT, 'docs', 'storyboards');
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isFile() && e.name.endsWith('.md'))
      .map(e => e.name)
      .sort();
  } catch {
    return [];
  }
}

async function cmdFindPending(opts) {
  const state = await readState();
  const storyboards = await findStoryboards();

  // 1. Blocked session → resume
  if (state && state.blocked) {
    const out = {
      action: 'resume',
      command: state.command,
      name: state.name,
      stage: state.current_stage,
      reason: state.block_reason || '未指定',
      storyboard: state.storyboard,
    };
    if (opts.json) console.log(JSON.stringify(out));
    else console.log(`${out.action} ${out.name} (${out.stage}) — 阻断: ${out.reason}`);
    return;
  }

  // 2. In-progress session → resume from last stage
  if (state && !state.blocked) {
    const out = {
      action: 'resume',
      command: state.command,
      name: state.name,
      stage: state.current_stage,
      reason: '会话进行中',
      storyboard: state.storyboard,
    };
    if (opts.json) console.log(JSON.stringify(out));
    else console.log(`${out.action} ${out.name} (${out.stage})`);
    return;
  }

  // 3. No session — scan storyboards for pending tasks
  const pendingStories = [];
  const STORYBOARDS_DIR = path.join(REPO_ROOT, 'docs', 'storyboards');

  for (const sb of storyboards) {
    const filePath = path.join(STORYBOARDS_DIR, sb);
    try {
      const content = await fsp.readFile(filePath, 'utf8');
      const name = sb.replace('.md', '');

      // Check for §L pending tasks (status = pending in tables)
      const hasSelfImproveSection = content.includes('## 自我改进循环');
      const hasPendingTasks = hasSelfImproveSection &&
        /\|\s*\d+\s*\|[^|]*\|[^|]*\|[^|]*\|\s*pending\s*\|/im.test(content);

      // Check for §4 Tasks (story has tasks but may be unexecuted)
      const hasTaskSection = /###\s+§4\s+Tasks/.test(content);

      // Check for §6 improvement items (non-empty table rows)
      const hasImprovements = /###\s+\.claude\s+改进清单/.test(content) &&
        /\|\s*\d+\s*\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/m.test(content);

      // Check for §7 architecture tasks
      const hasArchTasks = /###\s+系统架构演进任务/.test(content) &&
        /\|\s*\d+\s*\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/m.test(content);

      // Check git: has this story been branched for code?
      const hasCodeBranch = sh(`git branch --list "feat/${name}"`) !== '';

      // Story has doc (storyboard exists) but no code branch → needs code
      if (!hasCodeBranch && hasTaskSection) {
        pendingStories.push({ name, action: 'code', trigger: 'storyboard_done_no_code', priority: 1 });
        continue;
      }

      // Story has pending §L tasks → needs attention
      if (hasPendingTasks) {
        pendingStories.push({ name, action: 'code', trigger: 'pending_self_improve', priority: 2 });
        continue;
      }

      // Story has pending improvements or arch tasks
      if (hasImprovements || hasArchTasks) {
        pendingStories.push({ name, action: 'code', trigger: 'pending_improvements', priority: 3 });
      }
    } catch { /* skip unreadable */ }
  }

  // 4. No pending stories
  if (pendingStories.length === 0) {
    if (storyboards.length > 0) {
      const names = storyboards.map(s => path.basename(s, '.md'));
      const out = { action: 'none', reason: '所有故事已处理完毕', storyboards: names };
      if (opts.json) console.log(JSON.stringify(out));
      else console.log('none — 所有故事已处理完毕');
    } else {
      const out = { action: 'none', reason: '无故事板，运行 /rui init 初始化' };
      if (opts.json) console.log(JSON.stringify(out));
      else console.log('none — 无故事板');
    }
    return;
  }

  // 5. Return highest-priority pending story
  pendingStories.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  const next = pendingStories[0];
  const out = {
    action: next.action,
    name: next.name,
    trigger: next.trigger,
    storyboard: `docs/storyboards/${next.name}.md`,
    remaining: pendingStories.slice(1).map(s => s.name),
  };
  if (opts.json) console.log(JSON.stringify(out));
  else console.log(`${out.action} ${out.name} (${out.trigger}) — 剩余: ${out.remaining.length}`);
}

function sh(cmd) {
  try {
    return require('child_process').execSync(cmd, { encoding: 'utf8', cwd: REPO_ROOT }).trim();
  } catch { return ''; }
}

async function main() {
  const opts = parseArgs(process.argv);
  switch (opts.action) {
    case 'save': await cmdSave(opts); break;
    case 'load': await cmdLoad(opts); break;
    case 'clear': await cmdClear(); break;
    case 'next-step': await cmdNextStep(); break;
    case 'find-pending': await cmdFindPending(opts); break;
    default:
      console.error(`Unknown action: ${opts.action}`);
      process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });