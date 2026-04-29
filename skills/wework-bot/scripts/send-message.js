#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const SCRIPT_DIR = path.dirname(__filename);
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../..');
const DEFAULT_CONFIG_BASE = path.join(REPO_ROOT, 'skills/wework-bot/config.json');
/** 未传 --duration 且正文无该行时，仍输出本行，便于与会话记录核对，禁止留空。 */
const DEFAULT_SESSION_DURATION = '未在本地记录，请自行核对会话耗时';
/** 未传 --token-usage 且正文无该行时仍输出本行；请以 `--token-usage` 或 AGENT_SESSION_TOKEN_USAGE 传入可核对用量。 */
const DEFAULT_TOKEN_USAGE = '未在本地记录，请自行核对会话用量（`--token-usage` / AGENT_SESSION_TOKEN_USAGE）';
/** 未提供 AI 调用链时，仍输出本行，禁止留空或编造。 */
const DEFAULT_CALL_CHAIN = '未提供，请从会话记录补齐 AI 调用链';
/** 未提供功能描述时，仍输出本行，禁止留空或编造。 */
const DEFAULT_FEATURE_DESCRIPTION = '未提供，请补齐功能描述';
/** 未提供开始时间时，仍输出本行，禁止留空或编造。 */
const DEFAULT_STARTED_AT = '未在本地记录，请自行核对开始时间';
const DEFAULT_API_URL = 'https://api.effiy.cn/wework/send-message';

/** X-Token 仅从系统环境变量 `API_X_TOKEN` 读取，不接受配置文件或其它来源。 */
function readApiXTokenFromEnv() {
  const v = process.env.API_X_TOKEN;
  if (v == null || v === '') return null;
  const t = String(v).trim();
  return t || null;
}

const options = {
  token: readApiXTokenFromEnv(),
  apiUrl: process.env.WEWORK_BOT_API_URL || null,
  config: process.env.WEWORK_BOT_CONFIG || null,
  agent: null,
  robot: null,
  // webhook 优先来自 config.json（见 applyRobotConfig）；此处保留 env 兜底能力，但不抢占配置优先级
  webhookUrl: null,
  webhookKey: null,
  content: null,
  description: null,
  contentFile: null,
  flow: null,
  feature: null,
  projectName: process.env.PROJECT_NAME || null,
  featureDescription: process.env.FEATURE_DESCRIPTION || null,
  stage: null,
  status: null,
  impact: null,
  evidence: null,
  nextStep: null,
  conclusion: null,
  duration: null,
  startedAt: null,
  endedAt: null,
  aiCalls: null,
  callChain: null,
  testPaths: null,
  testStats: null,
  retries: null,
  artifacts: null,
  metrics: null,
  branch: process.env.GIT_BRANCH || null,
  commit: process.env.GIT_COMMIT || null,
  recover: null,
  reason: null,
  gateName: null,
  gateResult: null,
  syncResult: null,
  docType: null,
  p0Pass: null,
  p0Total: null,
  reportPath: null,
  diagramSummary: null,
  mcpBreakdown: null,
  backlog: null,
  statusRewrite: null,
  tokenUsage: process.env.AGENT_SESSION_TOKEN_USAGE || null,
  improvementHints: process.env.AGENT_SESSION_IMPROVEMENT_HINTS || null,
  model: process.env.AGENT_MODEL || process.env.CURSOR_AGENT_MODEL || 'Claude Sonnet 4.6',
  tools: process.env.AGENT_TOOLS || 'Cursor Agent / Playwright-MCP / Shell / wework-bot',
  updatedAt: process.env.WEWORK_MESSAGE_UPDATED_AT || null,
  noAutoGit: process.env.WEWORK_BOT_NO_AUTO_GIT === '1',
  dryRun: false
};

// 全局配置对象
let globalConfig = null;

/** 缓存 contextLines，避免 ensureElevatorFormat / ensureContext 重复构建 */
let cachedContextLines = null;

function readValue(index, flag) {
  const value = args[index + 1];
  if (value === undefined || value === null) {
    console.error(`Error: ${flag} requires a value`);
    process.exit(1);
  }
  if (value.startsWith('-') && value.length > 1 && Number.isNaN(Number(value))) {
    console.error(`Error: ${flag} requires a value`);
    process.exit(1);
  }
  return value;
}

function blockSecretCliFlag(flag) {
  console.error(`Error: ${flag} 已禁用。出于安全原因，禁止通过命令行传入 webhook key/url；请使用 config.json（优先）或 WEWORK_WEBHOOK_URL / WEWORK_WEBHOOK_KEY*（兜底）。`);
  process.exit(1);
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--token' || arg === '-t') {
    blockSecretCliFlag(arg);
  } else if (arg === '--api-url' || arg === '-a') {
    options.apiUrl = readValue(i, arg);
    i++;
  } else if (arg === '--config') {
    options.config = readValue(i, arg);
    i++;
  } else if (arg === '--agent') {
    options.agent = readValue(i, arg);
    i++;
  } else if (arg === '--robot' || arg === '-r') {
    options.robot = readValue(i, arg);
    i++;
  } else if (arg === '--webhook-url' || arg === '-w') {
    blockSecretCliFlag(arg);
  } else if (arg === '--webhook-key' || arg === '-k') {
    blockSecretCliFlag(arg);
  } else if (arg === '--content' || arg === '-c') {
    options.content = readValue(i, arg);
    i++;
  } else if (arg === '--description' || arg === '-d') {
    options.description = readValue(i, arg);
    i++;
  } else if (arg === '--content-file' || arg === '-f') {
    options.contentFile = readValue(i, arg);
    i++;
  } else if (arg === '--flow') {
    options.flow = readValue(i, arg);
    i++;
  } else if (arg === '--feature') {
    options.feature = readValue(i, arg);
    i++;
  } else if (arg === '--project-name') {
    options.projectName = readValue(i, arg);
    i++;
  } else if (arg === '--feature-description') {
    options.featureDescription = readValue(i, arg);
    i++;
  } else if (arg === '--project-description') {
    console.warn('Warning: --project-description 已弃用，请改用 --feature-description（功能描述）。');
    options.featureDescription = readValue(i, arg);
    i++;
  } else if (arg === '--stage') {
    options.stage = readValue(i, arg);
    i++;
  } else if (arg === '--status') {
    options.status = readValue(i, arg);
    i++;
  } else if (arg === '--impact') {
    options.impact = readValue(i, arg);
    i++;
  } else if (arg === '--evidence') {
    options.evidence = readValue(i, arg);
    i++;
  } else if (arg === '--next-step') {
    options.nextStep = readValue(i, arg);
    i++;
  } else if (arg === '--conclusion') {
    options.conclusion = readValue(i, arg);
    i++;
  } else if (arg === '--duration') {
    options.duration = readValue(i, arg);
    i++;
  } else if (arg === '--started-at') {
    options.startedAt = readValue(i, arg);
    i++;
  } else if (arg === '--ended-at') {
    options.endedAt = readValue(i, arg);
    i++;
  } else if (arg === '--ai-calls') {
    options.aiCalls = readValue(i, arg);
    i++;
  } else if (arg === '--call-chain') {
    options.callChain = readValue(i, arg);
    i++;
  } else if (arg === '--test-paths') {
    options.testPaths = readValue(i, arg);
    i++;
  } else if (arg === '--test-stats') {
    options.testStats = readValue(i, arg);
    i++;
  } else if (arg === '--retries') {
    options.retries = readValue(i, arg);
    i++;
  } else if (arg === '--artifacts') {
    options.artifacts = readValue(i, arg);
    i++;
  } else if (arg === '--metrics') {
    options.metrics = readValue(i, arg);
    i++;
  } else if (arg === '--branch') {
    options.branch = readValue(i, arg);
    i++;
  } else if (arg === '--commit') {
    options.commit = readValue(i, arg);
    i++;
  } else if (arg === '--recover') {
    options.recover = readValue(i, arg);
    i++;
  } else if (arg === '--reason') {
    options.reason = readValue(i, arg);
    i++;
  } else if (arg === '--gate-name') {
    options.gateName = readValue(i, arg);
    i++;
  } else if (arg === '--gate-result') {
    options.gateResult = readValue(i, arg);
    i++;
  } else if (arg === '--sync-result') {
    options.syncResult = readValue(i, arg);
    i++;
  } else if (arg === '--doc-type') {
    options.docType = readValue(i, arg);
    i++;
  } else if (arg === '--p0-pass') {
    options.p0Pass = readValue(i, arg);
    i++;
  } else if (arg === '--p0-total') {
    options.p0Total = readValue(i, arg);
    i++;
  } else if (arg === '--report-path') {
    options.reportPath = readValue(i, arg);
    i++;
  } else if (arg === '--diagram-summary') {
    options.diagramSummary = readValue(i, arg);
    i++;
  } else if (arg === '--mcp-breakdown') {
    options.mcpBreakdown = readValue(i, arg);
    i++;
  } else if (arg === '--backlog') {
    options.backlog = readValue(i, arg);
    i++;
  } else if (arg === '--status-rewrite') {
    options.statusRewrite = readValue(i, arg);
    i++;
  } else if (arg === '--token-usage') {
    options.tokenUsage = readValue(i, arg);
    i++;
  } else if (arg === '--improvement-hints') {
    options.improvementHints = readValue(i, arg);
    i++;
  } else if (arg === '--model') {
    options.model = readValue(i, arg);
    i++;
  } else if (arg === '--tools') {
    options.tools = readValue(i, arg);
    i++;
  } else if (arg === '--updated-at') {
    options.updatedAt = readValue(i, arg);
    i++;
  } else if (arg === '--no-auto-git') {
    options.noAutoGit = true;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
WeWork Bot - Send rich monitoring or alert messages

Usage: node .claude/skills/wework-bot/scripts/send-message.js [options]

Routing & Auth:
  --token, -t          [disabled] use API_X_TOKEN environment variable only
  --api-url, -a        API endpoint (default from WEWORK_BOT_API_URL or config)
  --config             Robot routing config JSON (default from WEWORK_BOT_CONFIG; if not set, reads config.json only)
  --agent              Agent name; resolves robot from config agents map
  --robot, -r          [deprecated] Robot name; resolves webhook from config robots map (prefer --agent)
  --webhook-url, -w    [disabled] configure webhook in config.json (fallback WEWORK_WEBHOOK_URL)
  --webhook-key, -k    [disabled] configure webhook key in config.json (fallback WEWORK_WEBHOOK_KEY / WEWORK_WEBHOOK_KEY_*)

Content:
  --content, -c        Message body (one-line conclusion or full multi-line elevator block)
  --description, -d    Required short description, max 100 characters
  --content-file, -f   Read message body from file
  --conclusion         Force the 🎯 结论 line value (overrides any heuristic from --content)

Context:
  --flow               Flow name, e.g. implement-code or generate-document
  --feature            Feature name or document path
  --project-name       Project name (default from config/env, fallback to repo folder name)
  --feature-description Feature short description (missing → injected placeholder line)
  --stage              Current stage name
  --status             Current status, e.g. started / passed / blocked / failed
  --impact             User-visible impact or delivery scope
  --evidence           Evidence path, command, MCP sequence, or result summary
  --next-step          Required next action (default: view docs/logs when needed)

Rich metrics:
  --duration           Elapsed this session, e.g. "12m 34s" or "01:23:45" (omitted + missing in body → default "未在本地记录…" line is injected)
  --started-at         Run started at, format YYYY-MM-DD HH:mm:ss
  --ended-at           Run ended at, format YYYY-MM-DD HH:mm:ss (omitted → auto current local time)
  --ai-calls           AI call summary, e.g. "skills 7 / agents 4 / mcp 23 / tools 86"
  --call-chain         Compact AI call chain, e.g. "find-skills→find-agents→...→wework-bot"
  --test-paths         Test path gate result, e.g. "tests/ 内 12 spec / 5 page / 3 fixture，无逸出"
  --test-stats         Test execution stats, e.g. "spec 12 / case 47 / 通过 47 / 失败 0"
  --retries            Self-repair retries, e.g. "阶段2: 1 轮 / 阶段6: 0 轮"
  --artifacts          Artifact summary, e.g. "代码 8 / 测试 12 / 文档 6"
  --metrics            Other metrics, e.g. "lint 0 / 影响链命中 23"
  --branch             Git branch name (auto-detected when omitted)
  --commit             Git short commit SHA (auto-detected when omitted)
  --no-auto-git        Disable auto detection of branch/commit (offline / sandbox safe)

Block / Gate specific:
  --recover            Recovery point, written to 🧭 恢复点
  --reason             Failure reason, written to ❌ 原因
  --gate-name          Gate name, written to 🔍 门禁
  --gate-result        Gate result, written to 📊 结果
  --sync-result        Doc sync result, written to ☁️ 文档同步
  --doc-type           Document type (generate-document only), written to 📋 类型
  --p0-pass            P0 pass count, written to 🔍 P0 自检 / 🧪 P0 检查项
  --p0-total           P0 total count, paired with --p0-pass
  --report-path        Report or summary path, written to 📂 报告
  --diagram-summary    Mermaid diagrams in 06_实施总结: e.g. "§1 流程图 28 节点 / §2 时序图 12 参与者"
  --mcp-breakdown      Playwright-MCP tool counts: e.g. "nav 12 / snap 24 / click 8 / eval 9"
  --backlog            P1/P2 or follow-ups: e.g. "P1 2 项 / P2 5 项（见 §9）"
  --status-rewrite     Doc status writeback: e.g. "01-07 已更新，05 已最终回写"

Metadata:
  --model              Model name appended to message metadata (default from AGENT_MODEL or "Claude Sonnet 4.6")
  --tools              Tool summary appended to message metadata (default from AGENT_TOOLS or "Cursor Agent / Playwright-MCP / Shell / wework-bot")
  --updated-at         Last update time, precise to seconds (default local current time)
  --token-usage        This session's token/usage, e.g. "输入 12k / 输出 3.2k / 合计 15.2k（来源：账单导出）" (or AGENT_SESSION_TOKEN_USAGE; omitted + missing in body → default line)
  --improvement-hints  Factual session improvement tips, semicolon-separated, ≤280 chars recommended (or AGENT_SESSION_IMPROVEMENT_HINTS)
  --dry-run            Print sanitized request summary without sending
  --help, -h           Show this help message
`);
    process.exit(0);
  }
}

function resolveUserPath(inputPath) {
  if (!inputPath) return inputPath;
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`Error: failed to read config ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function readJsonIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Error: failed to read config ${filePath}: ${error.message}`);
    process.exit(1);
  }
  return null;
}

function envValue(name) {
  return name ? process.env[name] : null;
}

function applyRobotConfig() {
  let config = null;

  if (options.config) {
    config = readJson(resolveUserPath(options.config));
  } else {
    const baseConfig = readJsonIfExists(DEFAULT_CONFIG_BASE);
    config = baseConfig;
  }

  if (!config) {
    return;
  }

  globalConfig = config;

  // 从配置补齐项目元信息（若未显式传入）
  if (!options.projectName && config.project_name) {
    options.projectName = config.project_name;
  }
  if (!options.featureDescription && config.feature_description) {
    options.featureDescription = config.feature_description;
  }

  // 从全局配置获取 API URL（如果还没有设置）
  if (!options.apiUrl && config.api_url) {
    options.apiUrl = config.api_url;
  }

  if (options.robot) {
    console.warn('Warning: --robot is deprecated; prefer --agent for automatic routing.');
  }

  const robotName = options.robot || (options.agent && config.agents ? config.agents[options.agent] : null) || config.default_robot;

  if (!robotName) {
    console.error('Error: --agent did not resolve to a robot, and no default_robot is configured');
    process.exit(1);
  }

  const robot = config.robots && config.robots[robotName];
  if (!robot) {
    console.error(`Error: robot "${robotName}" is not defined in config`);
    process.exit(1);
  }

  options.robot = robotName;
  // webhook：优先 config.json（*_env 映射到具体 env），其次明文 webhook_url/webhook_key；最后才兜底全局环境变量
  const resolvedWebhookUrl =
    envValue(robot.webhook_url_env) ||
    robot.webhook_url ||
    envValue(config.webhook_url_env) ||
    config.webhook_url;
  const resolvedWebhookKey =
    envValue(robot.webhook_key_env) ||
    robot.webhook_key ||
    envValue(config.webhook_key_env) ||
    config.webhook_key;

  options.webhookUrl = resolvedWebhookUrl || process.env.WEWORK_WEBHOOK_URL || null;
  options.webhookKey = resolvedWebhookKey || process.env.WEWORK_WEBHOOK_KEY || null;

  if (robot.api_url && !options.apiUrl) {
    options.apiUrl = robot.api_url;
  }
}

applyRobotConfig();

// X-Token 始终仅来自系统环境变量（config.json 不得承载 API_X_TOKEN）
options.token = readApiXTokenFromEnv();

// 设置默认值（如果还是没有配置）
if (!options.apiUrl) {
  options.apiUrl = DEFAULT_API_URL;
}

function safeExec(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000, encoding: 'utf-8' }).trim();
  } catch (error) {
    return null;
  }
}

function autoDetectGit() {
  if (options.noAutoGit) {
    return;
  }
  if (!options.branch) {
    options.branch = safeExec('git rev-parse --abbrev-ref HEAD') || null;
  }
  if (!options.commit) {
    options.commit = safeExec('git rev-parse --short HEAD') || null;
  }
}

autoDetectGit();

if (!options.token) {
  console.error('Error: missing API_X_TOKEN environment variable');
  process.exit(1);
}

/**
 * 将误打成字面量 "\\n" / "\\t" 的转义序列还原为真实换行与制表符（常见于从 JSON 再拷贝一层时）。
 * 不修改已是真实换行的正文。
 */
function normalizeMessageText(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
}

if (options.contentFile) {
  try {
    options.content = fs.readFileSync(resolveUserPath(options.contentFile), 'utf-8');
  } catch (error) {
    console.error(`Error: failed to read --content-file: ${error.message}`);
    process.exit(1);
  }
}

if (options.content) {
  options.content = normalizeMessageText(options.content);
}

if (!options.content) {
  console.error('Error: --content is required or set --content-file');
  process.exit(1);
}

function charLength(value) {
  return Array.from(value || '').length;
}

function extractDescription(content) {
  const descriptionLine = content
    .split(/\r?\n/)
    .find((line) => /^\s*(?:📝\s*)?描述[:：]/.test(line));

  if (!descriptionLine) {
    return null;
  }

  return descriptionLine.replace(/^\s*(?:📝\s*)?描述[:：]\s*/, '').trim();
}

function hasMultilineFormat(content) {
  return content.includes('\n');
}

function hasLinePrefix(content, prefixes) {
  return content.split(/\r?\n/).some((line) => {
    const trimmed = line.trim();
    return prefixes.some((prefix) => trimmed.startsWith(prefix));
  });
}

function buildLine(emoji, label, value) {
  if (!value) return null;
  return `${emoji} ${label}：${value}`;
}

function resolvedProjectName() {
  return options.projectName || (globalConfig && globalConfig.project_name) || path.basename(process.cwd());
}

function resolvedFeatureForProjectLine() {
  return options.feature || options.flow || options.agent || '未指定';
}

function getContextLines() {
  if (cachedContextLines) return cachedContextLines;
  cachedContextLines = buildContextLines();
  return cachedContextLines;
}

function buildContextLines() {
  const lines = [];
  const projectFeatureLine = buildLine('🏷️', '项目名-功能', `${resolvedProjectName()}-${resolvedFeatureForProjectLine()}`);
  const featureDescriptionLine = buildLine(
    '🧾',
    '功能描述',
    options.featureDescription || (globalConfig && globalConfig.feature_description) || DEFAULT_FEATURE_DESCRIPTION
  );
  const flowLine = buildLine('🛠️', '流程', options.flow);
  const featureLine = buildLine('📌', '功能', options.feature);
  const stageLine = buildLine('📍', '阶段', options.stage);
  const statusLine = buildLine('📊', '状态', options.status);
  const docTypeLine = buildLine('📋', '类型', options.docType);
  const p0Line = (options.p0Pass != null && options.p0Total != null)
    ? `🧪 P0 检查项：通过 ${options.p0Pass} / 共 ${options.p0Total}`
    : null;
  const gateNameLine = buildLine('🔍', '门禁', options.gateName);
  const gateResultLine = buildLine('📊', '结果', options.gateResult);
  const reasonLine = buildLine('❌', '原因', options.reason);
  const impactLine = buildLine('🌐', '影响', options.impact);
  const evidenceLine = buildLine('📎', '证据', options.evidence);
  const reportLine = buildLine('📂', '报告', options.reportPath);
  const diagramLine = buildLine('📐', '实施总结图表', options.diagramSummary);
  const mcpDetailLine = buildLine('🧩', 'MCP 明细', options.mcpBreakdown);
  const backlogLine = buildLine('🧾', '待办与风险', options.backlog);
  const statusRewriteLine = buildLine('🗂️', '状态回写', options.statusRewrite);
  const callChainLine = buildLine('🔗', '调用链', options.callChain || DEFAULT_CALL_CHAIN);
  const aiCallsLine = buildLine('🤝', 'AI 调用', options.aiCalls);
  const testPathsLine = buildLine('📁', '测试路径', options.testPaths);
  const testStatsLine = buildLine('🧫', '测试统计', options.testStats);
  const retriesLine = buildLine('🔁', '修复轮次', options.retries);
  const metricsLine = buildLine('📈', '指标', options.metrics);
  const artifactsLine = buildLine('📦', '产物', options.artifacts);
  const syncLine = buildLine('☁️', '文档同步', options.syncResult);
  const branchLine = buildLine('🌿', '分支', options.branch);
  const commitLine = buildLine('🔖', '提交', options.commit);
  const durationLine = buildLine('⏱️', '用时', options.duration || DEFAULT_SESSION_DURATION);
  const tokenUsageLine = buildLine('🪙', '会话用量', options.tokenUsage || DEFAULT_TOKEN_USAGE);
  const startedLine = buildLine('🟢', '开始时间', options.startedAt || DEFAULT_STARTED_AT);
  const endedLine = buildLine('🔴', '结束时间', options.endedAt || formatLocalTimestamp(new Date()));
  const improvementLine = buildLine('💡', '改进建议', options.improvementHints);
  const recoverLine = buildLine('🧭', '恢复点', options.recover);

  return [
    projectFeatureLine,
    featureDescriptionLine,
    flowLine,
    featureLine,
    stageLine,
    statusLine,
    docTypeLine,
    p0Line,
    gateNameLine,
    gateResultLine,
    reasonLine,
    impactLine,
    evidenceLine,
    reportLine,
    diagramLine,
    mcpDetailLine,
    backlogLine,
    statusRewriteLine,
    callChainLine,
    aiCallsLine,
    testPathsLine,
    testStatsLine,
    retriesLine,
    metricsLine,
    artifactsLine,
    syncLine,
    branchLine,
    commitLine,
    durationLine,
    tokenUsageLine,
    startedLine,
    endedLine,
    improvementLine,
    recoverLine
  ].filter(Boolean);
}

function ensureContext(content) {
  const lines = getContextLines().filter((line) => {
    const colonIndex = line.indexOf('：');
    if (colonIndex === -1) return true;
    const label = line.slice(0, colonIndex + 1);
    return !hasLinePrefix(content, [label]);
  });

  if (!lines.length) {
    return content.trim();
  }

  const existingLines = content.trim().split(/\r?\n/);
  const nextStepIndex = existingLines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith('👉 下一步：') || trimmed.startsWith('下一步：');
  });

  if (nextStepIndex === -1) {
    return `${content.trim()}\n${lines.join('\n')}`;
  }

  existingLines.splice(nextStepIndex, 0, ...lines);
  return existingLines.join('\n');
}

function ensureNextStep(content) {
  if (hasLinePrefix(content, ['👉 下一步：', '下一步：'])) {
    return content.trim();
  }

  const nextStep = options.nextStep || '请按结论处理，必要时查看对应文档或日志。';
  return `${content.trim()}\n👉 下一步：${nextStep}`;
}

function ensureConclusion(content) {
  if (!options.conclusion) return content;
  if (hasLinePrefix(content, ['🎯 结论：', '结论：'])) {
    return content;
  }
  const lines = content.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => /^[━─]{3,}/.test(line.trim()));
  const insertion = `🎯 结论：${options.conclusion}`;
  if (headerIndex >= 0) {
    lines.splice(headerIndex + 1, 0, insertion);
    return lines.join('\n');
  }
  return `${insertion}\n${content}`;
}

function ensureElevatorFormat(content, description) {
  const trimmedContent = content.trim();

  if (extractDescription(trimmedContent)) {
    return ensureNextStep(ensureContext(ensureConclusion(trimmedContent)));
  }

  if (hasMultilineFormat(trimmedContent)) {
    return ensureNextStep(ensureContext(ensureConclusion(`${trimmedContent}\n📝 描述：${description}`)));
  }

  const conclusion = options.conclusion || trimmedContent;
  return [
    '📣 消息推送',
    '━━━━━━━━━━━━━━━━━',
    `🎯 结论：${conclusion}`,
    `📝 描述：${description}`,
    ...getContextLines(),
    `👉 下一步：${options.nextStep || '请按结论处理，必要时查看对应文档或日志。'}`
  ].join('\n');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatLocalTimestamp(date) {
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    ' ',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
    ':',
    pad(date.getSeconds())
  ].join('');
}

function readSessionTimeIfExists() {
  const cwdPath = path.join(process.cwd(), '.claude', 'session-time.json');
  const repoPath = path.join(REPO_ROOT, '.claude', 'session-time.json');
  const filePath = fs.existsSync(cwdPath) ? cwdPath : repoPath;
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const startedAt = raw.startedAt || raw.started_at || raw.start || raw.started || null;
    const endedAt = raw.endedAt || raw.ended_at || raw.end || raw.ended || null;
    return { startedAt, endedAt };
  } catch (error) {
    return null;
  }
}

function hasMetadataLine(content, label) {
  return content.split(/\r?\n/).some((line) => line.trim().startsWith(label));
}

function ensureMetadata(content) {
  const lines = [];
  if (!hasMetadataLine(content, '🤖 模型：')) {
    lines.push(`🤖 模型：${options.model}`);
  }
  if (!hasMetadataLine(content, '🧰 工具：')) {
    lines.push(`🧰 工具：${options.tools}`);
  }
  if (!hasMetadataLine(content, '🕒 最后更新：')) {
    lines.push(`🕒 最后更新：${options.updatedAt || formatLocalTimestamp(new Date())}`);
  }

  return lines.length ? `${content.trim()}\n${lines.join('\n')}` : content.trim();
}

if (options.description) {
  const description = options.description.trim();
  if (!description) {
    console.error('Error: --description cannot be empty');
    process.exit(1);
  }
}

const description = options.description ? options.description.trim() : extractDescription(options.content);

if (!description) {
  console.error('Error: message content must include a description line: "📝 描述：<100字以内描述>" or pass --description');
  process.exit(1);
}

if (charLength(description) > 100) {
  console.error(`Error: message description must be 100 characters or fewer (current: ${charLength(description)})`);
  process.exit(1);
}

if (options.improvementHints && charLength(options.improvementHints) > 500) {
  console.error(`Error: --improvement-hints should be 500 characters or fewer (current: ${charLength(options.improvementHints)})`);
  process.exit(1);
}

// 尽量补齐会话起止时间：优先 CLI，其次读取 .claude/session-time.json，最后兜底（开始时间用可核对缺省句，结束时间用当前时刻）
if (!options.startedAt || !options.endedAt) {
  const sessionTime = readSessionTimeIfExists();
  if (sessionTime) {
    if (!options.startedAt && sessionTime.startedAt) options.startedAt = sessionTime.startedAt;
    if (!options.endedAt && sessionTime.endedAt) options.endedAt = sessionTime.endedAt;
  }
}
if (!options.endedAt) {
  options.endedAt = formatLocalTimestamp(new Date());
}

cachedContextLines = null;
options.content = ensureMetadata(ensureElevatorFormat(options.content, description));

if (!options.webhookUrl && options.webhookKey) {
  options.webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${options.webhookKey}`;
}

if (!options.webhookUrl) {
  console.error('Error: missing webhook configuration (config.json webhook mapping/webhook fields, or fallback WEWORK_WEBHOOK_URL / WEWORK_WEBHOOK_KEY)');
  process.exit(1);
}

try {
  new URL(options.webhookUrl);
} catch (error) {
  console.error(`Error: invalid webhook_url after resolution: ${options.webhookUrl}`);
  process.exit(1);
}

function mask(value) {
  if (!value) return '';
  if (value.length <= 8) return '***';
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

function request(apiUrl, token, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(apiUrl);
    const postData = JSON.stringify(data);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en,zh-CN;q=0.9,zh;q=0.8',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        Origin: 'https://effiy.cn',
        Pragma: 'no-cache',
        Referer: 'https://effiy.cn/',
        'User-Agent': 'claude-wework-bot/1.0',
        'X-Token': token,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch (error) {
          // Keep raw text if the service does not return JSON.
        }
        resolve({ statusCode: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

(async function main() {
  const payload = {
    webhook_url: options.webhookUrl,
    content: options.content
  };

  if (options.dryRun) {
    console.log('=== WeWork Bot Dry Run ===');
    console.log('API:', options.apiUrl);
    if (options.agent) {
      console.log('Agent:', options.agent);
    }
    if (options.robot) {
      console.log('Robot:', options.robot);
    }
    console.log('Token:', mask(options.token));
    console.log('Webhook:', mask(options.webhookUrl));
    console.log('Description length:', charLength(description));
    console.log('Content length:', options.content.length);
    console.log('Flow:', options.flow || '(not set)');
    console.log('Feature:', options.feature || '(not set)');
    console.log('Stage:', options.stage || '(not set)');
    console.log('Status:', options.status || '(not set)');
    console.log('Impact:', options.impact || '(not set)');
    console.log('Evidence:', options.evidence || '(not set)');
    console.log('Conclusion:', options.conclusion || '(not set)');
    console.log('Duration:', options.duration || '(not set)');
    console.log('Started at:', options.startedAt || '(not set)');
    console.log('Ended at:', options.endedAt || '(not set)');
    console.log('AI calls:', options.aiCalls || '(not set)');
    console.log('Call chain:', options.callChain || '(not set)');
    console.log('Test paths:', options.testPaths || '(not set)');
    console.log('Test stats:', options.testStats || '(not set)');
    console.log('Retries:', options.retries || '(not set)');
    console.log('Artifacts:', options.artifacts || '(not set)');
    console.log('Metrics:', options.metrics || '(not set)');
    console.log('Branch:', options.branch || '(not detected)');
    console.log('Commit:', options.commit || '(not detected)');
    console.log('Sync result:', options.syncResult || '(not set)');
    console.log('Recover:', options.recover || '(not set)');
    console.log('Reason:', options.reason || '(not set)');
    console.log('Gate name:', options.gateName || '(not set)');
    console.log('Gate result:', options.gateResult || '(not set)');
    console.log('Doc type:', options.docType || '(not set)');
    console.log('P0:', (options.p0Pass != null && options.p0Total != null) ? `${options.p0Pass}/${options.p0Total}` : '(not set)');
    console.log('Report path:', options.reportPath || '(not set)');
    console.log('Next step:', options.nextStep || '(default)');
    console.log('Model:', options.model);
    console.log('Tools:', options.tools);
    console.log('Updated at:', options.updatedAt || '(auto current local time)');
    console.log('Token usage:', options.tokenUsage || '(not set)');
    console.log('Improvement hints:', options.improvementHints || '(not set)');
    console.log('Content preview:');
    console.log(options.content);
    return;
  }

  try {
    const result = await request(options.apiUrl, options.token, payload);
    console.log('=== WeWork Bot Result ===');
    console.log('Status:', result.statusCode);
    console.log('Response:', typeof result.body === 'string' ? result.body : JSON.stringify(result.body));

    if (result.statusCode < 200 || result.statusCode >= 300) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
