#!/usr/bin/env node

/**
 * hook-notify — 交付管线步骤 3: 发送企微通知
 *
 * 从活跃故事构建消息并通过 send-message 发送。
 * 无活跃故事或缺凭据时静默退出，不阻断。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PROJECT_ROOT = process.cwd();

function findActiveStory() {
  const panelDir = path.join(PROJECT_ROOT, 'docs', '故事任务面板');
  if (!fs.existsSync(panelDir)) return null;

  let latest = null;
  let latestTime = 0;

  const projects = fs.readdirSync(panelDir, { withFileTypes: true });
  for (const proj of projects) {
    if (!proj.isDirectory() || proj.name.startsWith('.')) continue;
    const projDir = path.join(panelDir, proj.name);
    let stories;
    try { stories = fs.readdirSync(projDir, { withFileTypes: true }); } catch { continue; }
    for (const story of stories) {
      if (!story.isDirectory() || story.name.startsWith('.')) continue;
      const stateFile = path.join(projDir, story.name, '.memory', 'rui-state.json');
      if (!fs.existsSync(stateFile)) continue;
      try {
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        const ts = state.timestamp ? new Date(state.timestamp).getTime() : 0;
        if (ts > Date.now() - 3600000 && ts > latestTime) {
          latestTime = ts;
          latest = { name: `${proj.name}-${story.name}`, project: proj.name, story: story.name, state };
        }
      } catch { /* skip */ }
    }
  }
  return latest;
}

function buildMessage(info) {
  const { state, project, story } = info;
  const stage = state.current_stage || '未知';
  const lines = [];

  if (state.blocked) {
    lines.push(`🎯 结论: 阻断 ${info.name}`);
    lines.push(`📝 描述: 管线在 ${stage} 阶段被阻断`);
    lines.push(`📌 范围: docs/故事任务面板/${project}/${story}/`);
    lines.push(`❌ 原因: ${state.block_reason || '见 rui-state.json'}`);
    lines.push(`🧭 恢复点: ${stage}`);
  } else {
    lines.push(`🎯 结论: 完成 ${info.name} ${stage} 阶段`);
    lines.push(`📝 描述: 管线执行完毕`);
    lines.push(`📌 范围: docs/故事任务面板/${project}/${story}/`);
    lines.push(`👉 下一步: 继续下一阶段`);
  }

  lines.push(`🌐 影响: docs/故事任务面板/${project}/${story}/`);
  lines.push(`📎 证据: .memory/rui-state.json`);

  return lines.join('\n');
}

function main() {
  if (!process.env.API_X_TOKEN) {
    console.log('hook-notify: API_X_TOKEN not set, skipped');
    process.exit(0);
  }

  const active = findActiveStory();
  if (!active) {
    console.log('hook-notify: no active story, skipped');
    process.exit(0);
  }

  const message = buildMessage(active);
  const tmpFile = path.join(PROJECT_ROOT, '.hook-notify-content.tmp');
  const sendScript = path.join(__dirname, 'send-message.js');

  try {
    fs.writeFileSync(tmpFile, message, 'utf8');
    execFileSync('node', [sendScript, '--agent', 'rui', '--name', active.name, '--content-file', tmpFile], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      timeout: 30000,
    });
  } catch (err) {
    console.error(`hook-notify: ${err.message}`);
    // 通知失败不阻断
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

main();
