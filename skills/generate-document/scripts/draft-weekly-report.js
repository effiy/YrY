#!/usr/bin/env node

/**
 * draft-weekly-report
 *
 * 目标：整合 collect-weekly-kpi.js 输出与 weekly-analyzer 分析框架，
 * 生成半自动化周报草稿 markdown，减少手动整理工作量。
 *
 * 用法：
 *   node scripts/draft-weekly-report.js [--week <YYYY-MM-DD>] [--output <path>]
 *
 * 选项：
 *   --week <date>   指定日期，自动归到其所在自然周（默认今天）
 *   --output <path> 保存到文件（默认 stdout）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getNaturalWeekRange } = require('./natural-week.js');

const SCRIPT_DIR = path.dirname(__filename);

function parseArgs(argv) {
  const out = { week: null, output: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      console.log(`用法:
  node scripts/draft-weekly-report.js [--week <YYYY-MM-DD>] [--output <path>]

选项:
  --week <date>   指定日期，自动归到其所在自然周（默认今天）
  --output <path> 保存到文件（默认 stdout）

示例:
  node scripts/draft-weekly-report.js
  node scripts/draft-weekly-report.js --week 2026-04-29 --output docs/周报/2026-04-27~2026-05-03/周报.md
`);
      process.exit(0);
    } else if (a === '--week') out.week = argv[++i];
    else if (a === '--output') out.output = argv[++i];
  }
  return out;
}

function safeExec(cmd, defaultVal = '') {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return defaultVal;
  }
}

function runCollectKPI(week) {
  const script = path.join(SCRIPT_DIR, 'collect-weekly-kpi.js');
  const weekArg = week ? `--week ${week}` : '';
  try {
    const out = execSync(`node "${script}" ${weekArg} --json`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return JSON.parse(out);
  } catch (err) {
    console.error(`警告: collect-weekly-kpi.js 执行失败: ${err.message}`);
    return null;
  }
}

function runCollectLogs(week) {
  const script = path.join(SCRIPT_DIR, 'collect-weekly-logs.js');
  const weekArg = week ? `--week ${week}` : '';
  try {
    const out = execSync(`node "${script}" ${weekArg}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function runSelfImprove(weekRange) {
  const script = path.join(SCRIPT_DIR, 'self-improve.js');
  const since = weekRange.start;
  try {
    const out = execSync(`node "${script}" --since ${since} --json`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    const data = JSON.parse(out);
    if (!data.proposals || data.proposals.length === 0) {
      return '\n---\n\n## 系统自改进提案\n\n> 当前 execution memory 无记录，待积累数据后自动生成改进提案。';
    }
    const lines = [];
    lines.push('---');
    lines.push('');
    lines.push('## 系统自改进提案');
    lines.push('');
    lines.push(`> **数据来源**: execution-memory（${data.record_count} 条记录）+ 编排日志 + 关键节点`);
    lines.push(`> **分析周期**: ${data.since} 至今`);
    lines.push('');
    lines.push('| 优先级 | 类型 | 问题来源 | 改进描述 | 目标文件 | 验证方式 | 时间维度 | 专业深度 |');
    lines.push('|--------|------|----------|----------|----------|----------|----------|----------|');
    data.proposals.forEach((p) => {
      const desc = p.description.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const source = p.problem_source.replace(/\|/g, '\\|');
      const target = p.target_file.replace(/\|/g, '\\|');
      const val = p.validation.replace(/\|/g, '\\|');
      lines.push(`| ${p.priority} | ${p.type} | ${source} | ${desc} | ${target} | ${val} | ${p.time_dimension} | ${p.depth} |`);
    });
    lines.push('');
    lines.push('> **执行建议**：按优先级从高到低审阅提案，人工确认后手动修改目标文件，下轮 delivery 中观察验证指标变化。');
    return lines.join('\n');
  } catch {
    return '\n---\n\n## 系统自改进提案\n\n> self-improve 引擎运行失败，待排查后手动触发。';
  }
}

function analyzeGitCommits(weekRange) {
  const since = `${weekRange.start}T00:00:00`;
  const until = `${weekRange.end}T23:59:59`;

  // 按类型分类提交
  const featCommits = safeExec(
    `git log --since="${since}" --until="${until}" --oneline --grep="^feat" | head -20`,
    ''
  );
  const fixCommits = safeExec(
    `git log --since="${since}" --until="${until}" --oneline --grep="^fix" | head -10`,
    ''
  );
  const refactorCommits = safeExec(
    `git log --since="${since}" --until="${until}" --oneline --grep="^refactor" | head -10`,
    ''
  );

  // 变更最多的文件
  const topFiles = safeExec(
    `git log --since="${since}" --until="${until}" --name-only --pretty=format: | grep -v '^$' | sort | uniq -c | sort -rn | head -10`,
    ''
  );

  return {
    featList: featCommits.split('\n').filter(Boolean),
    fixList: fixCommits.split('\n').filter(Boolean),
    refactorList: refactorCommits.split('\n').filter(Boolean),
    topFiles: topFiles.split('\n').filter(Boolean),
  };
}

function generateHighlights(gitAnalysis, kpiData) {
  const highlights = [];

  // 从 feat commits 提取亮点
  gitAnalysis.featList.slice(0, 3).forEach((line) => {
    const msg = line.replace(/^\S+\s+/, '');
    if (msg) highlights.push(`新增功能/能力：${msg}`);
  });

  // 从 refactor commits 提取亮点
  gitAnalysis.refactorList.slice(0, 2).forEach((line) => {
    const msg = line.replace(/^\S+\s+/, '');
    if (msg) highlights.push(`架构/规则优化：${msg}`);
  });

  // 从 Git 统计提取亮点
  if (kpiData?.git) {
    const g = kpiData.git;
    if (g.commitCount > 20) {
      highlights.push(`高频迭代：本周 ${g.commitCount} 次提交，${g.filesChanged} 个文件变更`);
    }
    if (g.authors.length > 1) {
      highlights.push(`多人协作：${g.authors.length} 位贡献者参与开发`);
    }
  }

  return highlights.length > 0 ? highlights : ['本周工作主要集中在规则优化和文档迭代'];
}

function generateProblems(gitAnalysis, kpiData) {
  const problems = [];

  // 从 fix commits 提取问题
  gitAnalysis.fixList.slice(0, 3).forEach((line) => {
    const msg = line.replace(/^\S+\s+/, '');
    if (msg) problems.push(`修复问题：${msg}`);
  });

  // 从 KPI 数据提取问题
  if (kpiData?.features) {
    const weakFeatures = kpiData.features.filter((f) => {
      return (f.deliveryRate !== null && f.deliveryRate < 80) ||
             (f.p0Rate !== null && f.p0Rate < 90) ||
             (f.fixRounds !== null && f.fixRounds > 2);
    });
    weakFeatures.forEach((f) => {
      problems.push(`功能「${f.featureName}」KPI 薄弱：交付${f.deliveryRate ?? '—'}%/P0${f.p0Rate ?? '—'}%/轮次${f.fixRounds ?? '—'}`);
    });
  }

  // 如果无功能目录
  if (kpiData?.features?.length === 0) {
    problems.push('本周无功能级交付，工作集中在协作层规则迭代，KPI 无法按功能维度统计');
  }

  return problems.length > 0 ? problems : ['本周未发现明显问题'];
}

function generatePlanning(kpiData, gitAnalysis) {
  const plans = [];

  // 基于薄弱 KPI 生成规划
  if (kpiData?.features) {
    const weakest = kpiData.features
      .filter((f) => f.deliveryRate !== null || f.p0Rate !== null)
      .sort((a, b) => {
        const scoreA = (a.deliveryRate || 100) + (a.p0Rate || 100) - (a.fixRounds || 0) * 10;
        const scoreB = (b.deliveryRate || 100) + (b.p0Rate || 100) - (b.fixRounds || 0) * 10;
        return scoreA - scoreB;
      })[0];

    if (weakest) {
      plans.push({
        type: '项目',
        source: `薄弱KPI：${weakest.featureName}`,
        desc: `提升「${weakest.featureName}」交付质量，目标交付率≥80%、P0通过率≥90%`,
        standard: '用户故事驱动开发，从需求到验收的闭环验证',
        verify: `交付率≥80%且P0通过率≥90%，证据路径：${weakest.evidencePaths.join(', ')}`,
        time: '下周',
        depth: '质量保障',
      });
    }
  }

  // 基于 commit 分布生成规划
  if (gitAnalysis.featList.length === 0 && gitAnalysis.refactorList.length > 10) {
    plans.push({
      type: '系统',
      source: '工作节奏失衡',
      desc: '将大粒度任务拆分为每日可完成的子任务，建立稳定迭代节奏',
      standard: '每日站会节奏，小批量频繁提交',
      verify: '本周内每日至少1个有意义提交，提交时间分布均匀',
      time: '本周',
      depth: '团队协作',
    });
  }

  // 基于无功能目录生成规划
  if (!kpiData?.features || kpiData.features.length === 0) {
    plans.push({
      type: '系统',
      source: '无功能级交付',
      desc: '为 generate-document / implement-code 各选一个最小功能场景，产出完整文档集作为试点',
      standard: '用户故事驱动开发，验证规则有效性',
      verify: '产出至少1个完整功能目录（01-07），并完成代码实施',
      time: '下周',
      depth: '流程效率',
    });
  }

  return plans;
}

function generateReport(weekRange, kpiData, logsData, gitAnalysis) {
  const lines = [];
  const today = new Date().toISOString().split('T')[0];

  lines.push(`# 周报 ${weekRange.range}`);
  lines.push('');
  lines.push(`> **版本**: v1.0  `);
  lines.push(`> **维护者**: Claude  `);
  lines.push(`> **覆盖周期**: ${weekRange.start}（周一）~ ${weekRange.end}（周日）  `);
  lines.push(`> **生成时间**: ${today}`);
  lines.push('');

  // 关联功能目录
  lines.push('## 关联功能目录');
  lines.push('');
  if (kpiData?.features && kpiData.features.length > 0) {
    kpiData.features.forEach((f) => {
      lines.push(`- \`docs/${f.featureName}/\``);
    });
  } else {
    lines.push('> 本周无活跃功能目录（`docs/` 下无功能文档集）');
  }
  lines.push('');

  // KPI 量化总表
  lines.push('## KPI 量化总表');
  lines.push('');
  if (kpiData?.features && kpiData.features.length > 0) {
    lines.push(`| 功能目录 | 交付完成率 | P0通过率 | 防幻觉率 | 修复轮次 | 规则覆盖率 | 维度综合 |`);
    lines.push(`|---------|-----------|---------|---------|---------|-----------|---------|`);
    for (const f of kpiData.features) {
      const dr = f.deliveryRate !== null ? `${f.deliveryRate}%` : '—';
      const p0 = f.p0Rate !== null ? `${f.p0Rate}%` : '—';
      const ah = f.antiHallucinationRate !== null ? `${f.antiHallucinationRate}%` : '—';
      const fr = f.fixRounds !== null ? `${f.fixRounds}` : '—';
      const rc = f.ruleCoverage !== null ? `${f.ruleCoverage}%` : '—';
      let overall = '—';
      if (f.deliveryRate !== null || f.p0Rate !== null) {
        const scores = [
          f.deliveryRate !== null ? (f.deliveryRate >= 80 ? 1 : f.deliveryRate >= 50 ? 0.5 : 0) : null,
          f.p0Rate !== null ? (f.p0Rate >= 90 ? 1 : f.p0Rate >= 70 ? 0.5 : 0) : null,
          f.fixRounds !== null ? (f.fixRounds <= 2 ? 1 : f.fixRounds === 3 ? 0.5 : 0) : null,
        ].filter((v) => v !== null);
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
        overall = avg >= 0.8 ? '✅' : avg >= 0.5 ? '🟡' : '❌';
      }
      lines.push(`| ${f.featureName} | ${dr} | ${p0} | ${ah} | ${fr} | ${rc} | ${overall} |`);
    }
    lines.push('');
    lines.push('**判定说明**：交付≥80%✅ | P0≥90%✅ | 轮次≤2✅');
  } else {
    lines.push('> 本周无功能级交付，不适用标准功能维度 KPI。');
  }
  lines.push('');

  // Git 统计
  if (kpiData?.git) {
    const g = kpiData.git;
    lines.push('### Git 统计');
    lines.push('');
    lines.push(`| 指标 | 数值 |`);
    lines.push(`|------|------|`);
    lines.push(`| 提交数 | ${g.commitCount} |`);
    lines.push(`| 变更文件数 | ${g.filesChanged} |`);
    lines.push(`| 新增行数 | ${g.insertions} |`);
    lines.push(`| 删除行数 | ${g.deletions} |`);
    lines.push('');
    if (g.authors.length > 0) {
      lines.push('**提交者分布**: ' + g.authors.map((a) => `${a.name}(${a.commits})`).join(', '));
      lines.push('');
    }
  }

  // 本周复盘
  lines.push('## 本周复盘');
  lines.push('');

  const highlights = generateHighlights(gitAnalysis, kpiData);
  lines.push('### 进展亮点');
  lines.push('');
  highlights.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
  lines.push('');

  const problems = generateProblems(gitAnalysis, kpiData);
  lines.push('### 问题根因');
  lines.push('');
  lines.push('| 现象 | 推断 | 证据路径 |');
  lines.push('|------|------|---------|');
  problems.forEach((p) => {
    lines.push(`| ${p} | 待补充 | git log / collect-weekly-kpi.js 输出 |`);
  });
  if (problems.length === 0 || problems[0] === '本周未发现明显问题') {
    lines.push('| 本周无显著问题 | — | — |');
  }
  lines.push('');

  // KPI→复盘→规划链路
  lines.push('## KPI→复盘→规划链路全景图');
  lines.push('');
  lines.push('```mermaid');
  lines.push('flowchart LR');
  lines.push('    A["KPI分析"] --> B["复盘根因"] --> C["后期规划"]');
  lines.push('```');
  lines.push('');

  // 后期规划与改进
  lines.push('## 后期规划与改进');
  lines.push('');
  lines.push('**原则**：以需求为导向，参考业内标准但不套用复杂方法论。');
  lines.push('');

  const plans = generatePlanning(kpiData, gitAnalysis);
  if (plans.length > 0) {
    lines.push('### 改进优先级总表');
    lines.push('');
    lines.push(`| 类型 | 问题来源 | 改进描述 | 参考标准 | 验证方式 | 时间维度 | 专业深度 |`);
    lines.push(`|------|---------|---------|---------|---------|---------|---------|`);
    plans.forEach((p) => {
      lines.push(`| ${p.type} | ${p.source} | ${p.desc} | ${p.standard} | ${p.verify} | ${p.time} | ${p.depth} |`);
    });
    lines.push('');
  } else {
    lines.push('> 本周数据不足以生成具体改进项，待补充。');
    lines.push('');
  }

  // 工作流程标准化审视（占位）
  lines.push('### 工作流程标准化审视');
  lines.push('');
  lines.push('1. **重复劳动识别**：待补充');
  lines.push('2. **决策标准缺失**：待补充');
  lines.push('3. **信息孤岛**：待补充');
  lines.push('4. **反馈闭环**：待补充');
  lines.push('');

  // 系统架构演进思考（占位）
  lines.push('### 系统架构演进思考');
  lines.push('');
  lines.push('> 仅当本周有架构相关交付时填写。');
  lines.push('');

  // AI 链路质量统计表（占位）
  lines.push('## AI 链路质量统计表');
  lines.push('');
  lines.push(`| 维度 | 数值 | 备注 |`);
  lines.push(`|------|------|------|`);
  lines.push(`| Agent 调用次数 | 待补充 | |`);
  lines.push(`| 文档生成轮次 | 待补充 | |`);
  lines.push(`| P0 问题数 | 待补充 | |`);
  lines.push(`| 修复轮次 | 待补充 | |`);
  lines.push('');

  // 防幻觉声明
  lines.push('> **防幻觉声明**：KPI 数值来自 `collect-weekly-kpi.js` 自动提取；Git 统计数据来自 `git log`；复盘亮点和问题基于 commit 分类自动推断；规划建议基于薄弱 KPI 自动生成。手动补充部分已标注"待补充"。');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);

  let baseDate = new Date();
  if (args.week) {
    const d = new Date(args.week);
    if (isNaN(d.getTime())) {
      console.error(`错误: 无效日期 "${args.week}"`);
      process.exit(2);
    }
    baseDate = d;
  }

  const weekRange = getNaturalWeekRange(baseDate);

  // 1. 收集 KPI 数据
  const kpiData = runCollectKPI(args.week);

  // 2. 收集日志数据（可选）
  const logsData = runCollectLogs(args.week);

  // 3. 分析 Git commits
  const gitAnalysis = analyzeGitCommits(weekRange);

  // 4. 生成周报草稿
  let report = generateReport(weekRange, kpiData, logsData, gitAnalysis);

  // 5. 触发自我改进引擎并追加到周报
  const selfImproveOutput = runSelfImprove(weekRange);
  if (selfImproveOutput) {
    report += '\n\n' + selfImproveOutput;
  }

  if (args.output) {
    const dir = path.dirname(args.output);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(args.output, report, 'utf8');
    console.error(`周报草稿已保存至: ${args.output}`);
  } else {
    console.log(report);
  }
}

main();
