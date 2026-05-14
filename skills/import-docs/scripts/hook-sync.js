#!/usr/bin/env node

/**
 * import-docs Stop hook 适配器
 *
 * 运行 import-docs --workspace，成功后自动标记 docs_synced，
 * 并将同步摘要写入 .delivery-sync-summary.tmp 供 wework-bot 读取。
 * 降级：API_X_TOKEN 缺失时仍标记（no-token 降级），不阻断。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const SUMMARY_FILE = path.join(PROJECT_ROOT, '.delivery-sync-summary.tmp');

function findActiveStory() {
  const panelDir = path.join(PROJECT_ROOT, 'docs', '故事任务面板');
  if (!fs.existsSync(panelDir)) return null;

  let latest = null;
  let latestTime = 0;

  try {
    const projects = fs.readdirSync(panelDir, { withFileTypes: true });
    for (const proj of projects) {
      if (!proj.isDirectory() || proj.name.startsWith('.')) continue;
      const projDir = path.join(panelDir, proj.name);
      const stories = fs.readdirSync(projDir, { withFileTypes: true });
      for (const story of stories) {
        if (!story.isDirectory() || story.name.startsWith('.')) continue;
        const stateFile = path.join(projDir, story.name, '.memory', 'rui-state.json');
        if (!fs.existsSync(stateFile)) continue;
        try {
          const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
          const ts = state.timestamp ? new Date(state.timestamp).getTime() : 0;
          const oneHourAgo = Date.now() - 3600000;
          if (ts > oneHourAgo && ts > latestTime) {
            const dp = state.delivery_pipeline || {};
            if (!dp.docs_synced) {
              latestTime = ts;
              latest = { name: `${proj.name}-${story.name}` };
            }
          }
        } catch { /* skip */ }
      }
    }
  } catch { /* skip */ }

  return latest;
}

function parseStats(stdout) {
  const m = stdout.match(/Done:\s*(\d+)\s*created,\s*(\d+)\s*overwritten,\s*(\d+)\s*failed/);
  if (!m) return null;
  return { created: parseInt(m[1], 10), overwritten: parseInt(m[2], 10), failed: parseInt(m[3], 10) };
}

function writeSummary(story, result, stats) {
  const summary = {
    story,
    syncedAt: new Date().toISOString(),
    result,
    stats: stats || { created: 0, overwritten: 0, failed: 0 },
  };
  fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2), 'utf8');
}

function clearSummary() {
  try { fs.unlinkSync(SUMMARY_FILE); } catch { /* ignore */ }
}

function main() {
  const active = findActiveStory();
  if (!active) {
    // 无需同步的活跃故事，仍执行全量同步但不标记
    try {
      execSync('node skills/import-docs/scripts/import-docs.js --workspace', { cwd: PROJECT_ROOT, stdio: 'inherit', timeout: 60000 });
    } catch { /* 静默 */ }
    process.exit(0);
  }

  const hasToken = !!process.env.API_X_TOKEN;
  let syncOutput = '';
  let syncOk = false;

  if (hasToken) {
    try {
      syncOutput = execSync('node skills/import-docs/scripts/import-docs.js --workspace', { cwd: PROJECT_ROOT, stdio: 'pipe', encoding: 'utf8', timeout: 60000 });
      console.log(syncOutput);
      syncOk = true;
    } catch (err) {
      console.error(`import-docs hook: 同步失败 — ${err.message}`);
      syncOutput = err.stdout || '';
      // 网络失败不阻断，仍标记（下次覆盖重试）
    }
  }

  const stats = parseStats(syncOutput);
  writeSummary(active.name, syncOk ? 'success' : 'failed', stats);

  // 标记 docs_synced（no-token 降级也标记）
  try {
    const gateScript = path.join(PROJECT_ROOT, 'skills', 'rui', 'scripts', 'delivery-gate.js');
    execSync(`node "${gateScript}" mark --name "${active.name}" --step docs_synced`, { cwd: PROJECT_ROOT, stdio: 'pipe', timeout: 5000 });
  } catch (err) {
    console.error(`import-docs hook: 标记失败 — ${err.message}`);
  }

  process.exit(0);
}

main();
