#!/usr/bin/env node

/**
 * wework-bot Stop hook 适配器
 * 
 * 从 stdin 读取 Claude Code Stop hook 事件数据，
 * 从 rui-state.json 获取当前故事信息，自动构建通知消息并发送。
 * 
 * 设计：作为 Claude Code Stop hook 运行，无需手动传参。
 * 降级：无活跃故事或缺凭据时静默退出（exit 0），不阻断。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();

// ── 查找活跃故事 ──────────────────────────────────────────────
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
          // 只关注 1 小时内有活动的故事
          const oneHourAgo = Date.now() - 3600000;
          if (ts > oneHourAgo && ts > latestTime) {
            const dp = state.delivery_pipeline || {};
            // 只选未发送通知的故事
            if (!dp.notification_sent) {
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

// ── 构建通知消息 ──────────────────────────────────────────────
function buildMessage(info) {
  const { state, project, story } = info;
  const stage = state.current_stage || '未知';
  const blocked = state.blocked;

  if (blocked) {
    return [
      `🎯 结论: 阻断 ${info.name}`,
      `📝 描述: 管线在 ${stage} 阶段被阻断`,
      `📌 范围: docs/故事任务面板/${project}/${story}/`,
      `❌ 原因: ${state.block_reason || '见 rui-state.json'}`,
      `🧭 恢复点: ${stage}`,
      `🌐 影响: 需人工介入`,
      `📎 证据: .memory/rui-state.json`,
      `⏱️ 会话: ${stage}`,
    ].join('\n');
  }

  return [
    `🎯 结论: 完成 ${info.name} ${stage} 阶段`,
    `📝 描述: 管线执行完毕`,
    `📌 范围: docs/故事任务面板/${project}/${story}/`,
    `👉 下一步: 见 delivery-gate 状态`,
    `🌐 影响: docs/故事任务面板/${project}/${story}/`,
    `📎 证据: .memory/rui-state.json`,
    `⏱️ 会话: ${stage}`,
  ].join('\n');
}

// ── 主流程 ────────────────────────────────────────────────────
function main() {
  const active = findActiveStory();
  if (!active) {
    // 无活跃故事，静默退出
    process.exit(0);
  }

  // 检查凭据
  if (!process.env.API_X_TOKEN || !process.env.WEWORK_BOT_WEBHOOK_URL) {
    // 降级：缺凭据不阻断
    process.exit(0);
  }

  const message = buildMessage(active);
  const sendScript = path.join(__dirname, 'send-message.js');

  // 写临时文件避免 shell 转义问题
  const tmpFile = path.join(PROJECT_ROOT, '.delivery-notify-content.tmp');
  try {
    fs.writeFileSync(tmpFile, message, 'utf8');
    execSync(
      `node "${sendScript}" --agent rui --name "${active.name}" --content-file "${tmpFile}"`,
      { cwd: PROJECT_ROOT, stdio: 'inherit', timeout: 30000 }
    );
    // 标记步骤完成
    const gateScript = path.join(PROJECT_ROOT, 'skills', 'rui', 'scripts', 'delivery-gate.js');
    execSync(`node "${gateScript}" mark --name "${active.name}" --step notification_sent`, { cwd: PROJECT_ROOT, stdio: 'pipe', timeout: 5000 });
  } catch (err) {
    // 通知失败不阻断会话
    console.error(`wework-bot hook: 发送失败 — ${err.message}`);
    process.exit(0);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

main();
