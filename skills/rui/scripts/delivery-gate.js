#!/usr/bin/env node

// delivery-gate.js — enforce rui delivery pipeline completion
// Commands: check | mark | status | check-all
// Storage: reads/writes rui-state.json per-story delivery_pipeline field

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const REPO_ROOT = process.cwd();
const STORIES_DIR = path.join(REPO_ROOT, 'docs', '故事任务面板');

const DELIVERY_STEPS = ['log_appended', 'docs_synced', 'notification_sent'];
const STEP_LABELS = {
  log_appended: 'wework-bot --no-send 追加日志',
  docs_synced: 'import-docs --workspace 同步文档',
  notification_sent: 'wework-bot 发送通知',
};

function storyMemoryDir(name) { return path.join(STORIES_DIR, name, '.memory'); }
function storyStateFile(name) { return path.join(storyMemoryDir(name), 'rui-state.json'); }

function parseArgs(argv) {
  const out = { command: null, name: null, step: null, json: false, recentHours: 1 };
  const args = argv.slice(2);
  out.command = args[0];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--name') out.name = args[++i];
    else if (a === '--step') out.step = args[++i];
    else if (a === '--recent-hours') out.recentHours = parseFloat(args[++i]) || 1;
    else if (a === '--json') out.json = true;
  }
  return out;
}

async function readState(name) {
  const file = storyStateFile(name);
  try {
    const raw = await fsp.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch { return null; }
}

async function writeState(name, state) {
  const dir = storyMemoryDir(name);
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(storyStateFile(name), JSON.stringify(state, null, 2), 'utf8');
}

function initDeliveryPipeline() {
  return { log_appended: false, docs_synced: false, notification_sent: false, last_step_at: null, last_step: null };
}

function deliveryComplete(dp) {
  return dp && dp.log_appended && dp.docs_synced && dp.notification_sent;
}

function missingSteps(dp) {
  if (!dp) return DELIVERY_STEPS;
  return DELIVERY_STEPS.filter(s => !dp[s]);
}

async function findStories() {
  try {
    const entries = await fsp.readdir(STORIES_DIR, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name)
      .sort();
  } catch { return []; }
}

// ── check ──
async function cmdCheck(opts) {
  if (!opts.name) {
    console.error('check requires --name');
    process.exit(1);
  }
  const state = await readState(opts.name);
  if (!state) {
    const result = { story: opts.name, has_state: false, delivery_complete: false, missing: DELIVERY_STEPS };
    console.log(JSON.stringify(result));
    return;
  }
  const dp = state.delivery_pipeline || initDeliveryPipeline();
  const result = {
    story: opts.name,
    has_state: true,
    current_stage: state.current_stage,
    blocked: state.blocked || false,
    delivery_complete: deliveryComplete(dp),
    delivery_pipeline: dp,
    missing: missingSteps(dp),
  };
  console.log(JSON.stringify(result, null, opts.json ? 0 : 2));
}

// ── mark ──
async function cmdMark(opts) {
  if (!opts.name || !opts.step) {
    console.error('mark requires --name and --step');
    process.exit(1);
  }
  if (!DELIVERY_STEPS.includes(opts.step)) {
    console.error(`Invalid step: ${opts.step}. Valid: ${DELIVERY_STEPS.join(', ')}`);
    process.exit(1);
  }
  const state = await readState(opts.name);
  if (!state) {
    console.error(`No rui-state.json found for story: ${opts.name}`);
    process.exit(1);
  }
  if (!state.delivery_pipeline) state.delivery_pipeline = initDeliveryPipeline();
  state.delivery_pipeline[opts.step] = true;
  state.delivery_pipeline.last_step = opts.step;
  state.delivery_pipeline.last_step_at = new Date().toISOString();
  await writeState(opts.name, state);
  const complete = deliveryComplete(state.delivery_pipeline);
  console.log(JSON.stringify({
    story: opts.name,
    step: opts.step,
    step_label: STEP_LABELS[opts.step],
    delivery_complete: complete,
    remaining: missingSteps(state.delivery_pipeline),
  }));
}

// ── status ──
async function cmdStatus(opts) {
  const stories = await findStories();
  if (stories.length === 0) {
    const result = { stories: 0, incomplete: [], summary: 'no stories found' };
    console.log(opts.json ? JSON.stringify(result) : result.summary);
    return;
  }

  const incomplete = [];
  for (const name of stories) {
    const state = await readState(name);
    if (!state) continue;
    const dp = state.delivery_pipeline || initDeliveryPipeline();
    if (!deliveryComplete(dp)) {
      incomplete.push({
        story: name,
        current_stage: state.current_stage,
        blocked: state.blocked || false,
        missing: missingSteps(dp),
        last_step: dp.last_step,
        last_step_at: dp.last_step_at,
      });
    }
  }

  const result = {
    stories: stories.length,
    checked: stories.length,
    incomplete_count: incomplete.length,
    incomplete,
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (incomplete.length === 0) {
    console.log(`✓ All ${stories.length} stories have complete delivery pipelines.`);
    return;
  }

  console.log(`⚠ ${incomplete.length}/${stories.length} stories have incomplete delivery pipelines:\n`);
  for (const item of incomplete) {
    const missingLabels = item.missing.map(s => STEP_LABELS[s]).join(', ');
    const flag = item.blocked ? '❌ BLOCKED' : '⚠ INCOMPLETE';
    console.log(`  ${flag} ${item.story} @ ${item.current_stage || '?'}`);
    console.log(`    Missing: ${missingLabels}`);
    if (item.last_step) console.log(`    Last step: ${STEP_LABELS[item.last_step]} @ ${item.last_step_at}`);
  }
}

// ── check-all (for hook consumption) ──
async function cmdCheckAll(opts) {
  const stories = await findStories();
  const now = new Date();
  const recentThreshold = new Date(now.getTime() - opts.recentHours * 3600 * 1000);

  let recentIncomplete = [];
  let anyRecentActivity = false;

  for (const name of stories) {
    const state = await readState(name);
    if (!state) continue;
    const dp = state.delivery_pipeline || initDeliveryPipeline();
    const stateTime = state.timestamp ? new Date(state.timestamp) : null;
    const isRecent = stateTime && stateTime >= recentThreshold;

    if (isRecent) anyRecentActivity = true;

    if (!deliveryComplete(dp) && isRecent) {
      recentIncomplete.push({
        story: name,
        stage: state.current_stage,
        blocked: state.blocked || false,
        missing: missingSteps(dp),
      });
    }
  }

  // Only block if there's recent activity with incomplete pipeline
  const shouldBlock = recentIncomplete.length > 0;

  const output = {
    decision: shouldBlock ? 'block' : 'approve',
    recent_activity: anyRecentActivity,
    incomplete_count: recentIncomplete.length,
    incomplete: recentIncomplete,
  };

  if (shouldBlock) {
    const lines = recentIncomplete.map(i => {
      const missingLabels = i.missing.map(s => STEP_LABELS[s]).join(' → ');
      return `${i.story}: ${missingLabels}`;
    });
    output.reason = `交付管线未完成 — ${lines.join('; ')}`;
    output.systemMessage = [
      '🚨 交付管线未完成，请先执行以下步骤再结束会话：',
      ...recentIncomplete.map(i => {
        const parts = [`故事: ${i.story}`];
        if (i.missing.includes('log_appended')) parts.push('  Skill(wework-bot, --no-send --name ' + i.story + ')');
        if (i.missing.includes('docs_synced')) parts.push('  Skill(import-docs, --workspace)');
        if (i.missing.includes('notification_sent')) parts.push('  Skill(wework-bot, --name ' + i.story + ')');
        return parts.join('\n');
      }),
    ].join('\n\n');
  }

  console.log(JSON.stringify(output));
}

async function main() {
  const opts = parseArgs(process.argv);
  switch (opts.command) {
    case 'check': await cmdCheck(opts); break;
    case 'mark': await cmdMark(opts); break;
    case 'status': await cmdStatus(opts); break;
    case 'check-all': await cmdCheckAll(opts); break;
    default:
      // No args: show status
      opts.json = opts.json || false;
      await cmdStatus(opts);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
