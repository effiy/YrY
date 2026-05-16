#!/usr/bin/env node

/**
 * send-message — 企业微信机器人消息发送
 *
 * 职责: 路由机器人、解析 webhook、POST 通知网关。
 * 正文由调用方生成，本脚本不生成内容。
 *
 * 用法:
 *   node send-message.js --agent rui --name <story> --content "消息"
 *   node send-message.js --agent rui --name <story> --content-file <path>
 *   node send-message.js --no-send --agent rui --name <story> --content "仅写日志"
 */

'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const DEFAULT_API_URL = 'https://api.effiy.cn/wework/send-message';

// ── 参数解析 ───────────────────────────────────────────────────

const options = {
  agent: null,
  robot: null,
  content: null,
  contentFile: null,
  name: null,
  project: null,
  noSend: false,
  apiUrl: process.env.WEWORK_BOT_API_URL || null,
};

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--agent') options.agent = args[++i];
  else if (a === '--robot' || a === '-r') options.robot = args[++i];
  else if (a === '--content' || a === '-c') options.content = args[++i];
  else if (a === '--content-file' || a === '-f') options.contentFile = args[++i];
  else if (a === '--name' || a === '-n') options.name = args[++i];
  else if (a === '--project' || a === '-p') options.project = args[++i];
  else if (a === '--api-url' || a === '-a') options.apiUrl = args[++i];
  else if (a === '--no-send') options.noSend = true;
}

// ── 配置加载 ───────────────────────────────────────────────────

function loadConfig() {
  const paths = [
    path.join(PROJECT_ROOT, '.claude', 'skills', 'wework-bot', 'config.json'),
    path.join(PROJECT_ROOT, 'skills', 'wework-bot', 'config.json'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { /* next */ }
    }
  }
  console.error('Error: wework-bot config.json not found');
  process.exit(1);
}

// ── 故事路径解析 ───────────────────────────────────────────────

function parseStoryName(name) {
  if (!name) return null;
  const idx = name.indexOf('-');
  if (idx < 1) return { project: name, story: name };
  return { project: name.slice(0, idx), story: name.slice(idx + 1) };
}

function appendLog(name, content) {
  const info = parseStoryName(name);
  if (!info) return;
  const dir = path.join(PROJECT_ROOT, 'docs', '故事任务面板', info.project, info.story);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, '00-消息通知列表.md');
  const now = new Date();
  const ts = `【${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}】`;
  fs.appendFileSync(file, `\n${ts}\n\n${content}\n`, 'utf-8');
}

// ── HTTP 发送 ──────────────────────────────────────────────────

function post(url, token, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': token,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

// ── 主流程 ─────────────────────────────────────────────────────

async function main() {
  // 读取正文
  if (options.contentFile) {
    const p = path.isAbsolute(options.contentFile) ? options.contentFile : path.resolve(PROJECT_ROOT, options.contentFile);
    options.content = fs.readFileSync(p, 'utf-8');
  }

  if (!options.content || !options.content.trim()) {
    console.error('Error: --content or --content-file required');
    process.exit(1);
  }

  // 添加项目名首行
  const projectName = options.project
    || (options.name ? parseStoryName(options.name).project : null)
    || path.basename(PROJECT_ROOT);
  options.content = `【${projectName}】\n${options.content.trim()}`;

  // 追加日志
  if (options.name) appendLog(options.name, options.content);

  // --no-send 模式
  if (options.noSend) {
    console.log('--no-send: logged, not sent');
    process.exit(0);
  }

  // 解析 webhook
  const token = (process.env.API_X_TOKEN || '').trim();
  if (!token) { console.error('Error: API_X_TOKEN not set'); process.exit(1); }

  const config = loadConfig();
  const robotName = options.robot
    || (options.agent && config.agents ? config.agents[options.agent] : null)
    || config.default_robot;

  if (!robotName || !config.robots?.[robotName]) {
    console.error(`Error: robot "${robotName}" not found in config`);
    process.exit(1);
  }

  const robot = config.robots[robotName];
  const webhookUrl = (robot.webhook_url_env ? process.env[robot.webhook_url_env] : null)
    || robot.webhook_url
    || config.webhook_url;

  if (!webhookUrl) {
    console.error('Error: webhook_url not configured');
    process.exit(1);
  }

  const apiUrl = options.apiUrl || config.api_url || DEFAULT_API_URL;

  // 发送
  try {
    const result = await post(apiUrl, token, { webhook_url: webhookUrl, content: options.content });
    console.log(`Sent: HTTP ${result.status}`);
    if (result.status < 200 || result.status >= 300) process.exit(1);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
