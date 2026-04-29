#!/usr/bin/env node

/**
 * 将 generate-document / implement-code 编排过程中与 .claude 内 skill、agent、MCP 等的交互
 * 追加写入仓库根目录下的 docs/logs（每技能每日一个 .log）。
 * 用法见各技能 SKILL.md「编排会话日志」。
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const SKILL_VALUES = new Set(['generate-document', 'implement-code']);
const KIND_VALUES = new Set([
  'skill',
  'agent',
  'mcp',
  'memory',
  'shared',
  'other',
]);

function usage() {
  console.error(`用法:
  node .claude/scripts/log-orchestration.js --skill <generate-document|implement-code> \\
    --kind <skill|agent|mcp|memory|shared|other> [--name <标识>] [--text <单行摘要>]

  未提供 --text 时从 stdin 读取正文（将换行折叠为空格）。
  日志目录：<仓库根>/docs/logs/

示例:
  node .claude/scripts/log-orchestration.js --skill generate-document --kind agent --name spec-retriever --text "返回适用规范列表：rules/需求文档.md ..."
`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = { skill: null, kind: null, name: '', text: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill') out.skill = argv[++i];
    else if (a === '--kind') out.kind = argv[++i];
    else if (a === '--name') out.name = argv[++i] || '';
    else if (a === '--text') out.text = argv[++i] || '';
    else usage();
  }
  return out;
}

function normalizeOneLine(s) {
  return String(s ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.skill || !SKILL_VALUES.has(args.skill)) usage();
  if (!args.kind || !KIND_VALUES.has(args.kind)) usage();

  let body = args.text;
  if (body == null || body === '') {
    body = await readStdin();
  }
  body = normalizeOneLine(body);
  if (!body) {
    console.error('log-orchestration: 正文为空（提供 --text 或 stdin）');
    process.exit(1);
  }

  // .claude/scripts -> .. .. = 仓库根
  const repoRoot = path.resolve(__dirname, '..', '..');
  const logsDir = path.join(repoRoot, 'docs', 'logs');
  await fsp.mkdir(logsDir, { recursive: true });

  const day = new Date().toISOString().slice(0, 10);
  const logFile = path.join(logsDir, `${day}_${args.skill.replace(/[^\w-]/g, '_')}.log`);

  const iso = new Date().toISOString();
  const category = args.name ? `${args.kind}/${args.name}` : args.kind;
  // 格式：<ISO时间>-<skill|agent|mcp/…>：<被调用要点或摘要>
  const line = `${iso}-${category}：${body}\n`;

  await fsp.appendFile(logFile, line, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
