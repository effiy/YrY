#!/usr/bin/env node

/**
 * self-improve
 *
 * 自我改进引擎：分析 execution memory + 编排日志 + 关键节点，
 * 识别重复失败模式、checklist 缺口、agent 效能问题、规则摩擦点，
 * 输出结构化改进提案 Markdown。
 *
 * 用法：
 *   node scripts/self-improve.js [--since <YYYY-MM-DD>] [--output <path>] [--json]
 *
 * 选项：
 *   --since <date>   分析起始日期（默认本周一）
 *   --output <path>  保存到文件（默认 stdout）
 *   --json           输出 JSON（默认 Markdown）
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { execSync } = require('child_process');
const { getNaturalWeekRange } = require('./natural-week.js');

const SCRIPT_DIR = path.dirname(__filename);
const MEMORY_FILE = path.resolve('docs', '.memory', 'execution-memory.jsonl');

function printHelp() {
  console.log(`用法:
  node scripts/self-improve.js [--since <YYYY-MM-DD>] [--output <path>] [--json]

选项:
  --since <date>   分析起始日期（默认本周一）
  --output <path>  保存到文件（默认 stdout）
  --json           输出 JSON（默认 Markdown）

示例:
  node scripts/self-improve.js
  node scripts/self-improve.js --since 2026-04-27 --output docs/周报/2026-04-27~2026-05-03/self-improve-proposal.md
`);
}

function parseArgs(argv) {
  const out = { since: null, output: null, json: false };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
    else if (a === '--since') out.since = args[++i];
    else if (a === '--output') out.output = args[++i];
    else if (a === '--json') out.json = true;
  }
  return out;
}

function getDefaultSince() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

async function readExecutionMemory(sinceDate) {
  const since = new Date(sinceDate + 'T00:00:00.000Z').getTime();
  try {
    const text = await fsp.readFile(MEMORY_FILE, 'utf8');
    return text.split('\n').filter(l => l.trim()).map(l => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(r => r && new Date(r.timestamp || 0).getTime() >= since);
  } catch {
    return [];
  }
}

async function readWeeklyLogs(weekRange) {
  const logsDir = path.resolve('docs', '周报', weekRange);
  const logsPath = path.join(logsDir, 'logs.md');
  const keysPath = path.join(logsDir, 'key-notes.md');
  const logs = { logs: '', keys: '' };
  try { logs.logs = await fsp.readFile(logsPath, 'utf8'); } catch { /* ignore */ }
  try { logs.keys = await fsp.readFile(keysPath, 'utf8'); } catch { /* ignore */ }
  return logs;
}

function analyzePatterns(records) {
  const patterns = {
    recurringDocTypeIssues: {},
    recurringSectionIssues: {},
    agentBadCaseFreq: {},
    changeLevelAccuracy: { correct: 0, total: 0 },
    highRiskFeatures: [],
    checklistGaps: new Set(),
  };

  records.forEach(r => {
    // 变更级别预判准确度
    if (r.planned_change_level && r.actual_change_level) {
      patterns.changeLevelAccuracy.total++;
      if (r.planned_change_level === r.actual_change_level) patterns.changeLevelAccuracy.correct++;
    }

    // 质量问题模式
    ['P0', 'P1'].forEach(lv => {
      (r.quality_issues?.[lv] || []).forEach(q => {
        const docKey = `${q.doc_type || 'unknown'}::${q.section || 'unknown'}`;
        const secKey = `${q.section || 'unknown'}::${q.issue || 'unknown'}`;
        patterns.recurringDocTypeIssues[docKey] = (patterns.recurringDocTypeIssues[docKey] || 0) + (lv === 'P0' ? 3 : 1);
        patterns.recurringSectionIssues[secKey] = (patterns.recurringSectionIssues[secKey] || 0) + (lv === 'P0' ? 3 : 1);
        patterns.checklistGaps.add(JSON.stringify({ section: q.section, issue: q.issue, doc_type: q.doc_type, level: lv }));
      });
    });

    // Agent bad case 频率
    (r.bad_cases || []).forEach(b => {
      const key = b.agent;
      patterns.agentBadCaseFreq[key] = (patterns.agentBadCaseFreq[key] || 0) + 1;
    });

    // 高风险功能（P0多或阻断）
    const p0Count = r.quality_issues?.P0?.length || 0;
    if (p0Count >= 2 || r.was_blocked) {
      patterns.highRiskFeatures.push({ feature: r.feature, p0: p0Count, blocked: r.was_blocked, reason: r.block_reason });
    }
  });

  return patterns;
}

function generateProposals(patterns, records, sinceDate, weekRange) {
  const proposals = [];

  // 1. Checklist 缺口提案
  const topDocIssues = Object.entries(patterns.recurringDocTypeIssues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topDocIssues.length > 0) {
    topDocIssues.forEach(([key, score]) => {
      const [docType, section] = key.split('::');
      const evidence = records.filter(r =>
        (r.quality_issues?.P0 || []).some(q => (q.doc_type || '').includes(docType) && (q.section || '').includes(section))
      ).map(r => r.feature);
      proposals.push({
        type: 'checklist',
        priority: score >= 6 ? '高' : '中',
        target_file: `skills/generate-document/checklists/${docType.replace(/\.md$/, '')}.md`,
        problem_source: `${docType} 的 ${section} 反复出现质量问题`,
        description: `在 ${section} 章节增加专项 P0 检查项，防止重复出现同类缺陷`,
        reference_standard: '缺陷预防：将高频失败点固化为检查单，是业内质量保障的基础实践',
        validation: `后续 3 次同类功能交付中，该章节 P0 问题降为 0`,
        time_dimension: '下周',
        depth: '质量保障',
        evidence: [...new Set(evidence)].slice(0, 3),
      });
    });
  }

  // 2. Agent 效能提案
  const topBadAgents = Object.entries(patterns.agentBadCaseFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (topBadAgents.length > 0) {
    topBadAgents.forEach(([agent, count]) => {
      const lessons = [...new Set(records.flatMap(r =>
        (r.bad_cases || []).filter(b => b.agent === agent).map(b => b.lesson)
      ))].slice(0, 3);
      proposals.push({
        type: 'agent',
        priority: count >= 3 ? '高' : '中',
        target_file: `agents/${agent}.md`,
        problem_source: `${agent} 产生 ${count} 次 bad case`,
        description: `在 ${agent} 的约束或必答问题中增加对以下问题的专项审查：${lessons.join('；')}`,
        reference_standard: '专家角色持续进化：根据历史错误模式更新审查维度，是高质量 agent 设计的关键',
        validation: `该 agent 后续 5 次调用中 bad case 率下降 50%`,
        time_dimension: '本月',
        depth: '质量保障',
        evidence: lessons,
      });
    });
  }

  // 3. 变更级别预判提案
  if (patterns.changeLevelAccuracy.total >= 3) {
    const rate = patterns.changeLevelAccuracy.correct / patterns.changeLevelAccuracy.total;
    if (rate < 0.7) {
      proposals.push({
        type: 'rule',
        priority: '高',
        target_file: 'skills/generate-document/rules/workflow.md',
        problem_source: `变更级别预判准确率仅 ${(rate * 100).toFixed(0)}%（${patterns.changeLevelAccuracy.correct}/${patterns.changeLevelAccuracy.total}）`,
        description: '强化 Step 0（doc-planner）的变更级别判定依据，增加与历史相似案例的对比维度',
        reference_standard: '基于案例的推理（CBR）：用历史数据辅助分类决策，减少主观判断偏差',
        validation: '预判准确率提升至 80% 以上',
        time_dimension: '本月',
        depth: '流程效率',
        evidence: [`准确率 ${(rate * 100).toFixed(0)}%`],
      });
    }
  }

  // 4. 高风险功能预警提案
  if (patterns.highRiskFeatures.length > 0) {
    const domains = [...new Set(patterns.highRiskFeatures.map(f => f.feature))];
    proposals.push({
      type: 'system',
      priority: '中',
      target_file: 'skills/generate-document/scripts/execution-memory.js',
      problem_source: `${patterns.highRiskFeatures.length} 个功能出现多次 P0 或阻断`,
      description: '为 execution-memory 增加高风险功能自动标记机制，在 doc-planner 查询时优先提示',
      reference_standard: '风险驱动测试：对历史高风险模块增加审查强度，是质量保障的常见做法',
      validation: '高风险功能后续交付的 P0 问题数下降 50%',
      time_dimension: '下周',
      depth: '流程效率',
      evidence: domains.slice(0, 3),
    });
  }

  // 5. 若记录为空，提示初始化
  if (records.length === 0) {
    proposals.push({
      type: 'system',
      priority: '高',
      target_file: 'skills/generate-document/scripts/execution-memory.js',
      problem_source: 'execution memory 为空，无法执行改进分析',
      description: '随着功能文档持续交付，execution memory 将自动积累数据，self-improve 引擎将在有数据后输出有效提案',
      reference_standard: '数据驱动改进：改进引擎依赖真实执行数据，空数据时提示正常',
      validation: '完成 3 次以上功能文档交付后重新运行',
      time_dimension: '下周',
      depth: '流程效率',
      evidence: [],
    });
  }

  // 排序：高优先在前，同优先按类型稳定排序
  const order = { '高': 0, '中': 1, '低': 2 };
  proposals.sort((a, b) => (order[a.priority] || 2) - (order[b.priority] || 2));

  return proposals;
}

function formatMarkdown(proposals, records, sinceDate, weekRange) {
  const lines = [];
  lines.push('# 系统自改进提案');
  lines.push('');
  lines.push(`> **分析周期**: ${sinceDate} 至今`);
  lines.push(`> **数据来源**: execution-memory（${records.length} 条记录）+ 编排日志 + 关键节点`);
  lines.push(`> **生成时间**: ${new Date().toISOString()}`);
  lines.push('');

  if (records.length === 0) {
    lines.push('> 当前 execution memory 无记录。随着功能文档交付积累，本引擎将自动识别改进机会。');
    lines.push('');
  }

  lines.push('## 问题模式摘要');
  lines.push('');

  const docIssues = Object.entries(analyzePatterns(records).recurringDocTypeIssues)
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (docIssues.length > 0) {
    lines.push('### 高频文档质量问题');
    docIssues.forEach(([k, v]) => lines.push(`- ${k}: 加权 ${v} 次`));
    lines.push('');
  }

  const agentBad = Object.entries(analyzePatterns(records).agentBadCaseFreq)
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (agentBad.length > 0) {
    lines.push('### 高频 Agent Bad Case');
    agentBad.forEach(([k, v]) => lines.push(`- ${k}: ${v} 次`));
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## 改进提案总表');
  lines.push('');
  lines.push('| 优先级 | 类型 | 问题来源 | 改进描述 | 目标文件 | 参考标准 | 验证方式 | 时间维度 | 专业深度 |');
  lines.push('|--------|------|----------|----------|----------|----------|----------|----------|----------|');

  proposals.forEach(p => {
    const desc = p.description.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const source = p.problem_source.replace(/\|/g, '\\|');
    const target = p.target_file.replace(/\|/g, '\\|');
    const ref = p.reference_standard.replace(/\|/g, '\\|');
    const val = p.validation.replace(/\|/g, '\\|');
    lines.push(`| ${p.priority} | ${p.type} | ${source} | ${desc} | ${target} | ${ref} | ${val} | ${p.time_dimension} | ${p.depth} |`);
  });

  lines.push('');
  lines.push('## 详细提案');
  lines.push('');

  proposals.forEach((p, i) => {
    lines.push(`### ${i + 1}. [${p.priority}] ${p.type} — ${p.problem_source}`);
    lines.push('');
    lines.push(`- **目标文件**: ${p.target_file}`);
    lines.push(`- **改进描述**: ${p.description}`);
    lines.push(`- **参考标准**: ${p.reference_standard}`);
    lines.push(`- **验证方式**: ${p.validation}`);
    lines.push(`- **时间维度**: ${p.time_dimension}`);
    lines.push(`- **专业深度**: ${p.depth}`);
    if (p.evidence && p.evidence.length > 0) {
      lines.push(`- **证据**: ${p.evidence.join('，')}`);
    }
    lines.push('');
  });

  lines.push('---');
  lines.push('');
  lines.push('## 执行建议');
  lines.push('');
  lines.push('1. 按优先级从高到低审阅提案');
  lines.push('2. 每条提案须人工确认后手动修改目标文件（self-improve 引擎不自动覆盖）');
  lines.push('3. 修改完成后在下轮 generate-document 中观察验证指标变化');
  lines.push('4. 每周运行 `/generate-document weekly` 时本提案将自动更新');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  const opts = parseArgs(process.argv);
  const since = opts.since || getDefaultSince();
  const week = getNaturalWeekRange(new Date());

  const records = await readExecutionMemory(since);
  const logs = await readWeeklyLogs(week.range);

  // 将 logs 中的 bad case 和 lessons 也纳入分析（简单提取）
  const logBadCases = [];
  if (logs.logs) {
    const badMatches = logs.logs.matchAll(/bad case[\s\S]*?后续改进[：:]\s*(.+?)(?=\n|$)/gi);
    for (const m of badMatches) {
      logBadCases.push(m[1].trim());
    }
  }

  const patterns = analyzePatterns(records);
  const proposals = generateProposals(patterns, records, since, week.range);

  if (opts.json) {
    const out = { since, week: week.range, record_count: records.length, log_bad_cases: logBadCases, proposals };
    const text = JSON.stringify(out, null, 2);
    if (opts.output) {
      await fsp.writeFile(opts.output, text, 'utf8');
      console.log(`✓ 已保存到 ${opts.output}`);
    } else {
      console.log(text);
    }
    return;
  }

  const md = formatMarkdown(proposals, records, since, week.range);
  if (opts.output) {
    await fsp.mkdir(path.dirname(opts.output), { recursive: true });
    await fsp.writeFile(opts.output, md, 'utf8');
    console.log(`✓ 已保存到 ${opts.output}`);
  } else {
    console.log(md);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
