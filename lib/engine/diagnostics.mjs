/**
 * diagnostics.mjs — D0-D7 diagnostic engine (pure logic, no FS/I/O)
 *
 * Extracted from skills/rui/proposals.mjs for reuse by self-improve agent.
 * Each diagnostic is a pure function: data in, results out.
 *
 * D0: Baseline deviation    D1: Efficiency degradation
 * D2: Quality degradation   D3: Complexity growth
 * D4: Process degradation   D5: Dependency degradation
 * D6: Documentation staleness (needs pre-computed docIssues)
 * D7: Configuration drift   D8: Architecture degradation (needs pre-computed archIssues)
 */

import {
  DIAGNOSTIC_LABELS,
  DIAGNOSTIC_BASELINES,
  DIAGNOSTIC_MIN_CONFIDENCE,
  BLOCK_RATE_THRESHOLD,
  T3_PROPORTION_THRESHOLD,
  TOOL_ERROR_RATE_THRESHOLD,
  GATE_B_MAX_ROUNDS,
  MIN_EXEC_MEMORIES,
} from "../constants.mjs";

export function runDiagnostics(data, docIssues = [], archIssues = null) {
  const diagnostics = [];
  const execCount = data.allExec.length;

  // D0: Baseline deviation — execution conflicts with baseline
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D0) {
    let conflicts = 0;
    for (const r of data.allExec) {
      if (r.was_blocked && !r.block_reason) conflicts++;
      if (r.stage && r.stage === "unknown") conflicts++;
    }
    if (conflicts > 0) {
      diagnostics.push({
        id: "D0", label: DIAGNOSTIC_LABELS.D0, triggered: true,
        confidence: conflicts,
        evidence: `${conflicts} 条执行记录与基线冲突`,
        baseline: DIAGNOSTIC_BASELINES.D0,
        suggestion: "核查执行记录中的阻断标记和阶段字段，确保与 CLAUDE.md / agents/ 基线一致",
      });
    }
  }

  // D1: Efficiency degradation — block_rate > threshold
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D1) {
    let blockedCount = 0;
    for (const r of data.allExec) { if (r.was_blocked) blockedCount++; }
    const blockRate = execCount > 0 ? blockedCount / execCount : 0;
    if (blockRate > BLOCK_RATE_THRESHOLD) {
      diagnostics.push({
        id: "D1", label: DIAGNOSTIC_LABELS.D1, triggered: true,
        confidence: Math.round(blockRate * 100),
        evidence: `阻断率 ${(blockRate * 100).toFixed(1)}% > 阈值 ${BLOCK_RATE_THRESHOLD * 100}%`,
        baseline: DIAGNOSTIC_BASELINES.D1,
        suggestion: "阻断率偏高，建议加强影响分析阶段的预处理，提前识别阻断风险",
      });
    }
  }

  // D2: Quality degradation — P0 density > 50%
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D2) {
    let totalP0 = 0, totalIssues = 0;
    for (const r of data.allExec) {
      const qi = r.quality_issues || {};
      totalP0 += (qi.P0 || []).length;
      totalIssues += (qi.P0 || []).length + (qi.P1 || []).length + (qi.P2 || []).length;
    }
    if (totalP0 > 0 && totalIssues > 0) {
      const p0Density = totalP0 / totalIssues;
      if (p0Density > 0.5) {
        diagnostics.push({
          id: "D2", label: DIAGNOSTIC_LABELS.D2, triggered: true,
          confidence: totalP0,
          evidence: `P0 密度 ${(p0Density * 100).toFixed(1)}% (${totalP0}/${totalIssues})`,
          baseline: DIAGNOSTIC_BASELINES.D2,
          suggestion: "P0 密度偏高，建议在 coder 自审查阶段加强代码审查清单",
        });
      }
    }
  }

  // D3: Complexity growth — T3 proportion > threshold
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D3) {
    let t3Count = 0;
    for (const r of data.allExec) {
      if (r.planned_change_level === "T3" || r.actual_change_level === "T3") t3Count++;
    }
    const t3Proportion = execCount > 0 ? t3Count / execCount : 0;
    if (t3Proportion > T3_PROPORTION_THRESHOLD) {
      diagnostics.push({
        id: "D3", label: DIAGNOSTIC_LABELS.D3, triggered: true,
        confidence: Math.round(t3Proportion * 100),
        evidence: `T3 占比 ${(t3Proportion * 100).toFixed(1)}% > 阈值 ${T3_PROPORTION_THRESHOLD * 100}%`,
        baseline: DIAGNOSTIC_BASELINES.D3,
        suggestion: "T3 大变更占比偏高，建议加强需求拆分，将大任务拆分为多个 T1/T2 故事",
      });
    }
  }

  // D4: Process degradation — Gate B > max rounds
  runD4Diagnostic(data, diagnostics);
  // D5: Dependency degradation — tool error rate
  runD5Diagnostic(data, diagnostics);
  // D6: Documentation staleness
  runD6Diagnostic(data, docIssues, diagnostics);
  // D7: Configuration drift — proposal closure rate
  runD7Diagnostic(data, diagnostics);
  // D8: Architecture degradation — kernel size, paradigm, coupling, SRP
  runD8Diagnostic(data, archIssues, diagnostics);

  return diagnostics;
}

function runD4Diagnostic(data, diagnostics) {
  if (data.statusHistory && data.statusHistory.length >= DIAGNOSTIC_MIN_CONFIDENCE.D4) {
    const forwardOrder = ["任务", "设计", "实施", "测试", "报告", "改进"];
    let gateBRounds = 0;
    for (const entry of data.statusHistory) {
      const fromIdx = forwardOrder.indexOf(entry.from_status);
      const toIdx = forwardOrder.indexOf(entry.to_status);
      if (fromIdx >= forwardOrder.indexOf("测试") && toIdx < fromIdx) gateBRounds++;
    }
    const deliveryFailures = data.deliveryTrack.filter((r) => r.status === "failure").length;
    if (gateBRounds > GATE_B_MAX_ROUNDS) {
      diagnostics.push({
        id: "D4", label: DIAGNOSTIC_LABELS.D4, triggered: true,
        confidence: gateBRounds,
        evidence: `Gate B ${gateBRounds} 轮回溯 > ${GATE_B_MAX_ROUNDS} 轮阈值${deliveryFailures > 0 ? `（交付失败 ${deliveryFailures} 次）` : ""}`,
        baseline: DIAGNOSTIC_BASELINES.D4,
        suggestion: `Gate B 回溯 ${gateBRounds} 轮，测试先行不足。建议在 Gate A 加强测试用例设计`,
      });
    } else if (deliveryFailures >= DIAGNOSTIC_MIN_CONFIDENCE.D4 && gateBRounds === 0) {
      diagnostics.push({
        id: "D4", label: DIAGNOSTIC_LABELS.D4, triggered: true,
        confidence: deliveryFailures,
        evidence: `${deliveryFailures} 次交付失败（无状态历史数据，使用交付追踪代理）`,
        baseline: DIAGNOSTIC_BASELINES.D4,
        suggestion: "交付失败率偏高，检查 Gate A/B 验证步骤，确保测试先行",
      });
    }
  } else {
    const deliveryFailures = data.deliveryTrack.filter((r) => r.status === "failure").length;
    if (deliveryFailures >= DIAGNOSTIC_MIN_CONFIDENCE.D4) {
      diagnostics.push({
        id: "D4", label: DIAGNOSTIC_LABELS.D4, triggered: true,
        confidence: deliveryFailures,
        evidence: `${deliveryFailures} 次交付失败（状态历史数据不足，使用交付追踪代理）`,
        baseline: DIAGNOSTIC_BASELINES.D4,
        suggestion: "交付失败率偏高，检查 Gate A/B 验证步骤，确保测试先行",
      });
    }
  }
}

function runD5Diagnostic(data, diagnostics) {
  if (data.toolAudit.length >= DIAGNOSTIC_MIN_CONFIDENCE.D5) {
    const toolErrors = data.toolAudit.filter((r) => r.result === "failure").length;
    const errorRate = data.toolAudit.length > 0 ? toolErrors / data.toolAudit.length : 0;
    if (errorRate > TOOL_ERROR_RATE_THRESHOLD) {
      diagnostics.push({
        id: "D5", label: DIAGNOSTIC_LABELS.D5, triggered: true,
        confidence: toolErrors,
        evidence: `工具调用失败率 ${(errorRate * 100).toFixed(1)}% (${toolErrors}/${data.toolAudit.length})`,
        baseline: DIAGNOSTIC_BASELINES.D5,
        suggestion: "工具调用失败率偏高，检查 agent 协作中的工具路由和错误处理",
      });
    }
  }
}

function runD6Diagnostic(data, docIssues, diagnostics) {
  const execCount = data.allExec.length;
  if (execCount < DIAGNOSTIC_MIN_CONFIDENCE.D6) return;

  // docIssues is pre-computed by caller (requires FS access)
  const retroMissing = data.retroMissing || false;
  const noProposals = data.noProposals || false;

  if (docIssues.length > 0 || retroMissing || (noProposals && execCount >= MIN_EXEC_MEMORIES)) {
    const evidenceParts = [];
    if (docIssues.length > 0) evidenceParts.push(`${docIssues.length} 个场景文档缺自改进章节`);
    if (retroMissing) evidenceParts.push("自改进复盘文档缺失");
    if (noProposals && execCount >= MIN_EXEC_MEMORIES) evidenceParts.push("无提案记录");
    const confidence = docIssues.length + (retroMissing ? 1 : 0) + (noProposals ? 1 : 0);
    diagnostics.push({
      id: "D6", label: DIAGNOSTIC_LABELS.D6, triggered: true,
      confidence,
      evidence: evidenceParts.join("；"),
      baseline: DIAGNOSTIC_BASELINES.D6,
      suggestion: docIssues.length > 0
        ? `补齐 ${docIssues.length} 个场景的 §4 自改进章节，确保文档与代码同步`
        : "补齐自改进复盘文档和提案记录，确保每个故事走完管线后产出复盘",
    });
  }
}

function runD7Diagnostic(data, diagnostics) {
  if (data.proposals.length < DIAGNOSTIC_MIN_CONFIDENCE.D7) return;
  let closed = 0;
  for (const p of data.proposals) {
    if (p.status === "done" || p.status === "superseded") closed++;
  }
  const closureRate = data.proposals.length > 0 ? closed / data.proposals.length : 1;
  if (closureRate < 0.5) {
    diagnostics.push({
      id: "D7", label: DIAGNOSTIC_LABELS.D7, triggered: true,
      confidence: data.proposals.length - closed,
      evidence: `提案闭合率 ${(closureRate * 100).toFixed(1)}% < 50% (${closed}/${data.proposals.length})`,
      baseline: DIAGNOSTIC_BASELINES.D7,
      suggestion: "提案闭合率偏低，审查提案的可执行性，确保改进项能够落地",
    });
  }
}

function runD8Diagnostic(data, archIssues, diagnostics) {
  // D8: Architecture degradation — requires pre-computed arch check results
  // archIssues: { pass, dimensions, summary } from lib/arch-check.mjs runArchCheck()
  if (!archIssues || !archIssues.summary) return;

  const execCount = data.allExec.length;
  if (execCount < DIAGNOSTIC_MIN_CONFIDENCE.D8) return;

  const { summary } = archIssues;
  if (summary.overallPass) return; // No architecture issues

  const failedDims = summary.failedDimensions || [];
  const grade = summary.grade || "C";

  if (failedDims.length > 0) {
    diagnostics.push({
      id: "D8", label: DIAGNOSTIC_LABELS.D8, triggered: true,
      confidence: summary.failedChecks || failedDims.length,
      evidence: `架构合规 ${grade}级 | ${summary.passedChecks}/${summary.totalChecks} 通过 | 失败维度: ${failedDims.join(", ")}`,
      baseline: DIAGNOSTIC_BASELINES.D8,
      suggestion: failedDims.includes("范式合规")
        ? "存在 class/export default 违规，重构为纯函数 + 具名导出"
        : failedDims.includes("SRP 合规")
          ? "部分 Skill description 含并列连词，拆分多职责模块"
          : failedDims.includes("配置完整性")
            ? "部分 SKILL.md/agent .md 的 frontmatter 缺必填字段，补全配置"
            : `架构退化: ${failedDims.join(", ")}。审查 rules/architecture-principles.md 基线`,
    });
  }
}
