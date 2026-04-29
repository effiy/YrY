#!/usr/bin/env node

/**
 * 将 generate-document / implement-code 编排过程中与 .claude 内 skill、agent、MCP 等的交互
 * 以 Markdown 格式追加写入仓库根目录 `docs/logs/<YYYY-MM-DD>_<skill>.md`。
 * 每条记录包含「操作场景」与「对话与交互摘要」；可选 --case / --tags / --lesson
 * 标注 good case / bad case，供 docs/logs/CASE-STANDARD.md 与后续改进 skills、rules、agents。
 * 用法见各技能 SKILL.md「编排会话日志」。
 */

const fsp = require('fs').promises;
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

const CASE_VALUES = new Set(['good', 'bad', 'neutral']);

function usage() {
  console.error(`用法:
  node .claude/scripts/log-orchestration.js --skill <generate-document|implement-code> \\
    --kind <skill|agent|mcp|memory|shared|other> [--name <标识>] \\
    [--scenario "<操作场景>"] \\
    [--case <good|bad|neutral>] \\
    [--tags "<tag1,tag2>"] \\
    [--lesson "<后续改进要点一句>"] \\
    [--text "<摘要；单行>"]

  未提供 --text 时从 stdin 读取正文（保留换行，用作对话与交互摘要）。
  good/bad 标准见 docs/logs/CASE-STANDARD.md。

  日志目录：<仓库根>/docs/logs/
  文件名：<YYYY-MM-DD>_<skill>.md

示例:
  node .claude/scripts/log-orchestration.js --skill generate-document --kind agent --name spec-retriever \\
    --scenario "用户发起 /generate-document Foo；本步检索适用规范" \\
    --case good --tags "evidence-ok,stage-contract-met" \\
    --text "返回适用规范列表：rules/需求文档.md ..."
`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = {
    skill: null,
    kind: null,
    name: '',
    text: null,
    scenario: null,
    case: null,
    tags: null,
    lesson: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill') out.skill = argv[++i];
    else if (a === '--kind') out.kind = argv[++i];
    else if (a === '--name') out.name = argv[++i] || '';
    else if (a === '--text') out.text = argv[++i] || '';
    else if (a === '--scenario') out.scenario = argv[++i] || '';
    else if (a === '--case') out.case = argv[++i] || '';
    else if (a === '--tags') out.tags = argv[++i] || '';
    else if (a === '--lesson') out.lesson = argv[++i] || '';
    else usage();
  }
  return out;
}

/** stdin：保留换行，避免对话摘录被压成一行 */
function normalizeMultiline(s) {
  return String(s ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** --text：单行摘要 */
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

/**
 * 摘要改为引用块，避免正文中的 # 破坏 Markdown 结构；仍保持可读。
 */
function formatSummaryBody(body) {
  return body.split('\n').map((line) => `> ${line}`).join('\n');
}

function parseTags(raw) {
  if (raw == null || String(raw).trim() === '') return [];
  return String(raw)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function normalizeCaseArg(raw) {
  if (raw == null || String(raw).trim() === '') return null;
  const c = String(raw).trim().toLowerCase();
  if (!CASE_VALUES.has(c)) {
    console.error(`log-orchestration: --case 须为 good | bad | neutral，收到：${raw}`);
    process.exit(1);
  }
  return c;
}

/**
 * @param {'good'|'bad'|'neutral'|null} caseNorm
 * @param {string[]} tagsArr
 * @param {string|null|undefined} lessonRaw
 */
function formatEvaluationBlock(caseNorm, tagsArr, lessonRaw) {
  const lesson = lessonRaw != null ? String(lessonRaw).trim() : '';
  if (!caseNorm && tagsArr.length === 0 && !lesson) return '';

  const lines = ['', '**评测标注**'];
  const grade = caseNorm || 'neutral';
  lines.push(`- **分级**：${grade}`);
  if (tagsArr.length) {
    lines.push(`- **标签**：${tagsArr.map((t) => `\`${t}\``).join(' · ')}`);
  }
  if (lesson) {
    lines.push(`- **后续改进**：${lesson}`);
  }

  return `${lines.join('\n')}\n`;
}

function headingCaseBadge(caseNorm) {
  if (caseNorm === 'good') return ' · **good case**';
  if (caseNorm === 'bad') return ' · **bad case**';
  return '';
}

async function ensureMarkdownPreamble(logFile, skill, day) {
  let needHeader = true;
  try {
    const st = await fsp.stat(logFile);
    needHeader = st.size === 0;
  } catch {
    needHeader = true;
  }
  if (!needHeader) return;

  const evalFile =
    skill === 'implement-code'
      ? 'implement-code.md'
      : 'generate-document.md';

  const preamble = `---
skill: ${skill}
log_type: orchestration
date: ${day}
---

# 编排会话日志 · \`${skill}\` · ${day}

本文件由 \`node .claude/scripts/log-orchestration.js\` 追加写入，用于记录**本会话中如何编排使用** \`.claude\` 内 skill / agent / MCP / memory / shared。

每条记录含 **操作场景**（贴近 [\`eval/skills/${evalFile}\`](../../eval/skills/${evalFile}) 中的用户故事式用法）与 **对话与交互摘要**（可核对摘要、派发要点、采纳结论）。

**评测**：对照 [\`eval/skills/${evalFile}\`](../../eval/skills/${evalFile}) 的阶段契约；**good / bad case 判定**见 [\`CASE-STANDARD.md\`](./CASE-STANDARD.md)。可对关键步骤追加 \`--case good|bad\`、\`--tags\`、\`--lesson\` 以便后续改进编排。

---

`;

  await fsp.writeFile(logFile, preamble, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.skill || !SKILL_VALUES.has(args.skill)) usage();
  if (!args.kind || !KIND_VALUES.has(args.kind)) usage();

  let body = args.text;
  if (body == null || body === '') {
    body = await readStdin();
    body = normalizeMultiline(body);
  } else {
    body = normalizeOneLine(body);
  }

  if (!body) {
    console.error('log-orchestration: 正文为空（提供 --text 或 stdin）');
    process.exit(1);
  }

  // 脚本位于 .claude/scripts/，项目根为上一级目录
  const repoRoot = path.resolve(__dirname, '../..');
  const logsDir = path.join(repoRoot, 'docs', 'logs');
  await fsp.mkdir(logsDir, { recursive: true });

  const day = new Date().toISOString().slice(0, 10);
  const safeSkill = args.skill.replace(/[^\w-]/g, '_');
  const logFile = path.join(logsDir, `${day}_${safeSkill}.md`);

  await ensureMarkdownPreamble(logFile, args.skill, day);

  const caseNorm = normalizeCaseArg(args.case);
  const tagsArr = parseTags(args.tags);
  const lessonRaw = args.lesson;

  if (caseNorm === 'bad' && (!lessonRaw || !String(lessonRaw).trim())) {
    console.warn(
      'log-orchestration: bad case 建议配合 --lesson 写明后续改进要点（见 docs/logs/CASE-STANDARD.md）'
    );
  }

  const iso = new Date().toISOString();
  const category = args.name ? `${args.kind}/${args.name}` : args.kind;
  const scenario =
    args.scenario != null && String(args.scenario).trim() !== ''
      ? String(args.scenario).trim()
      : '（未标注操作场景；请在下轮调用时传入 `--scenario`，对照 eval 用户故事描述用法）';

  const evalBlock = formatEvaluationBlock(caseNorm, tagsArr, lessonRaw);
  const badge = headingCaseBadge(caseNorm);

  const block = `### \`${iso}\` · \`${category}\`${badge}

**操作场景**：${scenario}

**对话与交互摘要**

${formatSummaryBody(body)}
${evalBlock}
---

`;

  await fsp.appendFile(logFile, block, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
