#!/usr/bin/env node

/**
 * rui-state — 断点续传状态管理
 *
 * Usage:
 *   node scripts/rui-state.js save --command <cmd> --name <name> --stage <stage> [--blocked] [--reason <text>]
 *   node scripts/rui-state.js load [--json]
 *   node scripts/rui-state.js clear
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
      console.log(`\n→ Run \`/rui continue\` to resume from ${state.current_stage}`);
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

async function main() {
  const opts = parseArgs(process.argv);
  switch (opts.action) {
    case 'save': await cmdSave(opts); break;
    case 'load': await cmdLoad(opts); break;
    case 'clear': await cmdClear(); break;
    default:
      console.error(`Unknown action: ${opts.action}`);
      process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });