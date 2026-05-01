#!/usr/bin/env node

/**
 * validate-agent-contracts
 *
 * 目标：轻量级契约校验，验证 skill 文件引用的 agent 名字是否：
 *   1. 在 agents/ 目录存在对应的 .md 文件
 *   2. 在 shared/agent-skill-boundaries.md 中被列出
 *
 * 用法：
 *   node scripts/validate-agent-contracts.js [--fix] [--strict]
 *
 * 选项：
 *   --fix     仅输出建议修复的 agent 名映射表
 *   --strict  将 boundaries 缺失也视为错误（默认仅警告）
 *
 * 退出码：
 *   0 无问题
 *   1 发现 orphaned agent 引用
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const AGENTS_DIR = path.join(PROJECT_ROOT, 'agents');
const SHARED_DIR = path.join(PROJECT_ROOT, 'shared');
const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');

const BOUNDARIES_FILE = path.join(SHARED_DIR, 'agent-skill-boundaries.md');

// 已知不是 agent 的 skill/system 标识符（避免误报）
const KNOWN_NON_AGENTS = new Set([
  'generate-document', 'implement-code', 'import-docs', 'wework-bot',
  'code-review', 'e2e-testing', 'find-agents', 'find-skills',
  'search-first', 'verification-loop', 'weekly', 'init', 'from-weekly',
  'weekly-analyzer', 'doc-generate-reporter', 'code-impl-reporter',
  'message-pusher', 'mcp-fallback-contract', 'impact-analysis-contract',
  'agent-output-contract', 'document-contracts', 'evidence-and-uncertainty',
  'path-conventions', 'component-contract', 'behavioral-guidelines',
  'mermaid-expert', 'spec-retriever', 'agent-skill-boundaries',
  'orchestration-logging', 'orchestration', 'agent-contract',
  'workflow', 'process-summary', 'artifact-contracts', 'verification-gate',
  'code-implementation', 'implement-code-testing', 'e2e-testing-md',
  'test-page', 'natural-week',
  // 常见编程关键字/变量名
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false',
  'null', 'undefined', 'typeof', 'instanceof', 'import', 'export', 'default',
  'from', 'as', 'class', 'extends', 'super', 'static', 'get', 'set',
  'is', 'has', 'can', 'should', 'will', 'do', 'did', 'are', 'was', 'were',
  'not', 'and', 'or', 'but', 'with', 'without', 'into', 'onto', 'upon',
  // 常见技术术语
  'node', 'npm', 'npx', 'git', 'bash', 'python', 'uv', 'pip', 'pip3',
  'docker', 'kubectl', 'helm', 'terraform', 'ansible',
  'main', 'master', 'develop', 'staging', 'production', 'prod',
  'docs', 'skills', 'agents', 'shared', 'commands', 'eval', 'scripts',
  'src', 'dist', 'build', 'public', 'assets', 'config',
  // HTML/CSS/测试属性
  'data-testid', 'aria-label', 'aria-hidden', 'role', 'class', 'id',
  'type', 'name', 'value', 'placeholder', 'disabled', 'readonly',
  'style', 'href', 'src', 'alt', 'title', 'target', 'rel',
  'ref', 'reactive', 'computed', 'watch', 'emits', 'props', 'slots',
  'window', 'document', 'console', 'localstorage', 'sessionstorage',
  // 常见操作动词
  'load', 'save', 'create', 'update', 'delete', 'handle', 'toggle',
  'reset', 'submit', 'fetch', 'send', 'receive', 'parse', 'stringify',
  'format', 'validate', 'sanitize', 'encode', 'decode', 'encrypt', 'decrypt',
  'compress', 'decompress', 'upload', 'download', 'render', 'mount',
  // CLI/配置术语
  'command', 'option', 'flag', 'arg', 'args', 'env', 'ext', 'exts',
  'prefix', 'suffix', 'path', 'dir', 'file', 'filename', 'content',
  'list', 'item', 'items', 'entry', 'entries', 'key', 'keys', 'value', 'values',
  'session', 'sessions', 'token', 'tokens', 'header', 'headers',
  'body', 'query', 'params', 'param', 'route', 'router', 'middleware',
  // 状态/结果词
  'success', 'error', 'failed', 'pending', 'overwritten', 'created',
  'updated', 'deleted', 'skipped', 'ignored', 'included', 'excluded',
  // 其他常见误报
  'stage', 'gate', 'notify', 'memory', 'skill', 'agent', 'mcp', 'other',
  'kind', 'case', 'good', 'bad', 'neutral', 'lesson', 'text',
  'scenario', 'operation', 'operations', 'tags', 'description',
  'triggers', 'tools', 'user', 'story', 'model', 'api', 'url', 'uri',
  'json', 'yaml', 'yml', 'xml', 'csv', 'html', 'css', 'js', 'ts', 'md',
  'playwright', 'filesystem', 'browser', 'server', 'client',
  // CSS / testid 类名（常见误报）
  'toolbar-container', 'toolbar-download-btn', 'toolbar-filename-input',
  'toolbar-result', 'toolbar-error-msg', 'testid',
]);

function parseArgs(argv) {
  const out = { fix: false, strict: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      console.log(`用法:
  node scripts/validate-agent-contracts.js [--fix] [--strict]

选项:
  --fix     仅输出建议修复的 agent 名映射表
  --strict  将 boundaries 缺失也视为错误（默认仅警告）

示例:
  node scripts/validate-agent-contracts.js
  node scripts/validate-agent-contracts.js --strict
`);
      process.exit(0);
    } else if (a === '--fix') out.fix = true;
    else if (a === '--strict') out.strict = true;
  }
  return out;
}

function listAgentFiles() {
  if (!fs.existsSync(AGENTS_DIR)) return new Set();
  return new Set(
    fs.readdirSync(AGENTS_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  );
}

function extractAgentsFromBoundaries() {
  const agents = new Set();
  if (!fs.existsSync(BOUNDARIES_FILE)) return agents;

  const text = fs.readFileSync(BOUNDARIES_FILE, 'utf8');
  // 匹配表格中的 `agent-name` 和 YAML frontmatter 中的 name
  const tableMatches = text.match(/`([a-z][a-z0-9-]*)`/g) || [];
  tableMatches.forEach((m) => {
    const name = m.slice(1, -1);
    if (!KNOWN_NON_AGENTS.has(name)) agents.add(name);
  });

  return agents;
}

function extractAgentRefsFromFile(filePath) {
  const refs = [];
  if (!fs.existsSync(filePath)) return refs;

  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n');

  // 匹配 Markdown 中的 agent 引用：
  // 1. 反引号包裹：`agent-name`
  // 2. 表格中的 agent 名
  // 3. 技能契约中的 agent 引用
  const agentPattern = /`([a-z][a-z0-9-]*)`/g;

  lines.forEach((line, idx) => {
    let m;
    while ((m = agentPattern.exec(line)) !== null) {
      const name = m[1];
      if (KNOWN_NON_AGENTS.has(name)) continue;
      // 过滤掉一些常见的非 agent 引用（如文件路径、命令名）
      if (name.match(/^(node|npm|npx|git|bash|python|uv|pip)$/)) continue;
      if (name.match(/^(docs|skills|agents|shared|commands|eval)$/)) continue;
      refs.push({ name, line: idx + 1, text: line.trim() });
    }
  });

  return refs;
}

function findSkillFiles() {
  const files = [];
  if (!fs.existsSync(SKILLS_DIR)) return files;

  const skillDirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(SKILLS_DIR, e.name));

  for (const dir of skillDirs) {
    const skillMd = path.join(dir, 'SKILL.md');
    if (fs.existsSync(skillMd)) files.push(skillMd);

    const rulesDir = path.join(dir, 'rules');
    if (fs.existsSync(rulesDir)) {
      fs.readdirSync(rulesDir)
        .filter((f) => f.endsWith('.md'))
        .forEach((f) => files.push(path.join(rulesDir, f)));
    }
  }

  return files;
}

function main() {
  const args = parseArgs(process.argv);

  const agentFiles = listAgentFiles();
  const boundariesAgents = extractAgentsFromBoundaries();
  const skillFiles = findSkillFiles();

  if (args.fix) {
    // 输出建议的 agent 名映射表
    console.log('# 建议的 Agent 名映射修复\n');
    console.log('| 文件中出现的名字 | 建议改为 | 原因 |');
    console.log('|---|---|---|');

    const knownMappings = {
      'spec-retriever': 'docs-retriever / codes-retriever',
      'impact-analyst': 'doc-impact-analyzer / code-impact-analyzer',
      'architect': 'doc-architect / codes-builder',
      'planner': 'doc-architect / codes-builder',
      'quality-tracker': 'doc-quality-tracker',
      'knowledge-curator': 'docs-builder',
      'impl-reporter': 'code-impl-reporter',
      'generate-reporter': 'doc-generate-reporter',
    };

    for (const [oldName, newName] of Object.entries(knownMappings)) {
      console.log(`| \`${oldName}\` | \`${newName}\` | 与实际 agent 文件名不一致 |`);
    }
    return;
  }

  const issues = [];
  const warnings = [];

  // 1. 检查 boundaries 中列出的 agent 是否有对应文件
  for (const name of boundariesAgents) {
    if (!agentFiles.has(name)) {
      issues.push({
        type: 'boundaries-orphan',
        message: `agent-skill-boundaries.md 引用 \`${name}\`，但 agents/${name}.md 不存在`,
        file: 'shared/agent-skill-boundaries.md',
      });
    }
  }

  // 2. 检查 skill 文件中引用的 agent
  for (const skillFile of skillFiles) {
    const refs = extractAgentRefsFromFile(skillFile);
    const seen = new Set();

    for (const ref of refs) {
      if (seen.has(ref.name)) continue;
      seen.add(ref.name);

      const relPath = path.relative(PROJECT_ROOT, skillFile);

      // 检查是否有对应文件
      if (!agentFiles.has(ref.name)) {
        // 可能是已知的旧名字
        if (['spec-retriever', 'impact-analyst', 'architect', 'planner', 'quality-tracker', 'knowledge-curator'].includes(ref.name)) {
          issues.push({
            type: 'orphan-legacy',
            message: `\`${ref.name}\` 是旧名字，与实际 agent 文件不一致`,
            file: relPath,
            line: ref.line,
          });
        } else {
          issues.push({
            type: 'orphan-unknown',
            message: `引用 \`${ref.name}\`，但 agents/${ref.name}.md 不存在`,
            file: relPath,
            line: ref.line,
          });
        }
      }

      // 检查是否在 boundaries 中
      if (!boundariesAgents.has(ref.name) && agentFiles.has(ref.name)) {
        warnings.push({
          type: 'boundaries-missing',
          message: `引用 \`${ref.name}\`，但在 agent-skill-boundaries.md 中未列出`,
          file: relPath,
          line: ref.line,
        });
      }
    }
  }

  // 3. 输出结果
  console.log('# Agent 契约校验报告\n');
  console.log(`扫描文件: ${skillFiles.length} 个 skill/rule 文件`);
  console.log(`agents/ 目录: ${agentFiles.size} 个 agent 文件`);
  console.log(`boundaries 登记: ${boundariesAgents.size} 个 agent`);
  console.log('');

  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ 所有 agent 引用一致，无问题。\n');
    process.exit(0);
  }

  if (issues.length > 0) {
    console.log(`## ❌ 错误 (${issues.length})\n`);
    for (const issue of issues) {
      const loc = issue.line ? `${issue.file}:${issue.line}` : issue.file;
      console.log(`- [${issue.type}] ${loc} — ${issue.message}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`## ⚠️ 警告 (${warnings.length})\n`);
    for (const warn of warnings) {
      console.log(`- [${warn.type}] ${warn.file}:${warn.line} — ${warn.message}`);
    }
    console.log('');
  }

  if (issues.some((i) => i.type === 'orphan-legacy')) {
    console.log('💡 提示：使用 `--fix` 查看建议的 agent 名映射修复表。\n');
  }

  if (args.strict && warnings.length > 0) {
    process.exit(1);
  }

  if (issues.length > 0) {
    process.exit(1);
  }
}

main();
