#!/usr/bin/env node

/**
 * wework-bot Stop hook 适配器 — 步骤 1: 追加日志（--no-send）
 *
 * 从 rui-state.json 获取当前故事信息，构建通知消息并追加到
 * 00-消息通知列表.md，但不发送 HTTP。
 *
 * 降级：无活跃故事时静默退出（exit 0），不阻断。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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
            if (!dp.log_appended) {
              latestTime = ts;
              latest = {
                name: `${proj.name}-${story.name}`,
                project: proj.name,
                story: story.name,
                state,
              };
            }
          }
        } catch { /* skip */ }
      }
    }
  } catch { /* skip */ }

  return latest;
}

function computeSessionDuration(state) {
  const history = state.change_history || [];
  if (history.length < 2) return null;
  const start = new Date(history[0].timestamp);
  const end = new Date(history[history.length - 1].timestamp);
  const minutes = Math.round((end - start) / 60000 * 10) / 10;
  return minutes;
}

function computeProgress(state) {
  const pp = state.pipeline_progress || {};
  const phases = Object.values(pp);
  if (phases.length === 0) return null;
  const completed = phases.filter(s => s === 'completed').length;
  const blocked = phases.filter(s => s === 'blocked').length;
  return { total: phases.length, completed, blocked, current: state.current_stage };
}

function readSyncSummary() {
  try {
    if (!fs.existsSync(SUMMARY_FILE)) return null;
    const raw = fs.readFileSync(SUMMARY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch { return null; }
}

function buildMessage(info) {
  const { state, project, story } = info;
  const stage = state.current_stage || '未知';
  const blocked = state.blocked;
  const duration = computeSessionDuration(state);
  const progress = computeProgress(state);
  const syncSummary = readSyncSummary();

  const lines = [];

  if (blocked) {
    lines.push(`🎯 结论: 阻断 ${info.name}`);
    lines.push(`📝 描述: 管线在 ${stage} 阶段被阻断`);
    lines.push(`📌 范围: docs/故事任务面板/${project}/${story}/`);
    lines.push(`❌ 原因: ${state.block_reason || '见 rui-state.json'}`);
    lines.push(`🧭 恢复点: ${stage}`);
    lines.push(`🌐 影响: 需人工介入`);
  } else {
    lines.push(`🎯 结论: 完成 ${info.name} ${stage} 阶段`);
    lines.push(`📝 描述: 管线执行完毕`);
    lines.push(`📌 范围: docs/故事任务面板/${project}/${story}/`);
    lines.push(`👉 下一步: 见 delivery-gate 状态`);
    lines.push(`🌐 影响: docs/故事任务面板/${project}/${story}/`);
  }

  if (progress) {
    const pct = Math.round((progress.completed / progress.total) * 100);
    lines.push(`📊 进度: ${progress.completed}/${progress.total} (${pct}%) · 当前: ${progress.current}`);
  }
  if (duration != null) {
    lines.push(`⏱️ 会话: ${duration}min`);
  }
  lines.push(`📎 证据: .memory/rui-state.json`);

  const details = [];
  if (syncSummary) {
    const { result, stats } = syncSummary;
    const emoji = result === 'success' ? '✅' : '⚠️';
    details.push(`${emoji} 文档同步: ${result} · ${stats.created} 新建 / ${stats.overwritten} 覆盖 / ${stats.failed} 失败`);
  }

  if (details.length > 0) {
    return lines.join('\n') + '\n\n———\n\n' + details.join('\n');
  }
  return lines.join('\n');
}

function main() {
  const active = findActiveStory();
  if (!active) {
    process.exit(0);
  }

  const message = buildMessage(active);
  const sendScript = path.join(__dirname, 'send-message.js');

  // 写临时文件避免 shell 转义问题
  const tmpFile = path.join(PROJECT_ROOT, '.delivery-notify-content.tmp');
  try {
    fs.writeFileSync(tmpFile, message, 'utf8');
    execFileSync(
      'node', [sendScript, '--no-send', '--agent', 'rui', '--name', active.name, '--content-file', tmpFile],
      { cwd: PROJECT_ROOT, stdio: 'inherit', timeout: 15000 }
    );
    // 标记步骤完成
    const gateScript = path.join(PROJECT_ROOT, 'skills', 'rui', 'scripts', 'delivery-gate.js');
    execFileSync('node', [gateScript, 'mark', '--name', active.name, '--step', 'log_appended'], { cwd: PROJECT_ROOT, stdio: 'pipe', timeout: 5000 });
  } catch (err) {
    console.error(`wework-bot hook-log: 追加失败 — ${err.message}`);
    process.exit(0);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

main();
