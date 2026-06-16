/**
 * evaluate — E1-E4 proposal evaluation engine
 * Extracted from proposals.mjs for single-responsibility.
 */

import { join } from "node:path";

import {
  STORY_PANEL_DIR,
  PROPOSALS_DIR,
  PROPOSALS_FILE,
  EXEC_MEMORY_FILE,
  MEMORY_DIR,
  MIN_EXEC_MEMORIES,
} from "../constants.mjs";
import { bold, dim, green, red, yellow } from "../tty.mjs";
import { readJsonl, findProjectRoot, findStoryDirs, updateJsonlById } from "../fs.mjs";

export function evaluateProposal(proposal, preMetrics, postMetrics) {
  const blockImproved = postMetrics.block_rate < preMetrics.block_rate;
  const blockDegraded = postMetrics.block_rate > preMetrics.block_rate;

  const p0Improved = postMetrics.p0_density < preMetrics.p0_density;
  const p0Degraded = postMetrics.p0_density > preMetrics.p0_density;

  let improvements = 0;
  let degradations = 0;
  if (blockImproved) improvements++;
  if (blockDegraded) degradations++;
  if (p0Improved) improvements++;
  if (p0Degraded) degradations++;

  const result = improvements > degradations ? "improved" :
                 degradations > improvements ? "degraded" : "neutral";

  return {
    proposal_id: proposal.id,
    pre_metrics: preMetrics,
    post_metrics: postMetrics,
    E1_block_rate: blockImproved ? "improved" : blockDegraded ? "degraded" : "unchanged",
    E2_p0_density: p0Improved ? "improved" : p0Degraded ? "degraded" : "unchanged",
    E3_bad_cases: "unknown",
    E4_overall: result,
  };
}

export function computeMetrics(memories) {
  let blockedCount = 0;
  let totalP0 = 0, totalIssues = 0;
  let t3Count = 0;
  const agentCounts = {};

  for (const r of memories) {
    if (r.was_blocked) blockedCount++;
    const qi = r.quality_issues || {};
    totalP0 += (qi.P0 || []).length;
    totalIssues += (qi.P0 || []).length + (qi.P1 || []).length + (qi.P2 || []).length;
    if (r.planned_change_level === "T3" || r.actual_change_level === "T3") t3Count++;
    const agents = r.agents_called || [];
    for (const a of agents) {
      agentCounts[a] = (agentCounts[a] || 0) + 1;
    }
  }

  return {
    count: memories.length,
    block_rate: memories.length > 0 ? blockedCount / memories.length : 0,
    p0_density: totalIssues > 0 ? totalP0 / totalIssues : 0,
    t3_proportion: memories.length > 0 ? t3Count / memories.length : 0,
    agent_participation: agentCounts,
  };
}

export function cmdEvaluate(opts) {
  const projectRoot = findProjectRoot(process.cwd());

  if (!opts.id) {
    console.log("");
    console.log(yellow("[proposals] evaluate 需要 --id=<proposal_id>"));
    console.log("");
    return;
  }

  let targetProposal = null;
  let targetStoryPath = null;
  const storyDirs = findStoryDirs(projectRoot);

  for (const sd of storyDirs) {
    const proposalsPath = join(sd.path, PROPOSALS_DIR, PROPOSALS_FILE);
    const proposals = readJsonl(proposalsPath);
    const found = proposals.find((p) => p.id === opts.id);
    if (found) {
      targetProposal = found;
      targetStoryPath = sd.path;
      break;
    }
  }

  if (!targetProposal) {
    console.log("");
    console.log(yellow(`[proposals] 未找到提案: ${opts.id}`));
    console.log("");
    return;
  }

  const allExec = [];
  for (const sd of storyDirs) {
    const storyExec = readJsonl(join(sd.path, EXEC_MEMORY_FILE));
    allExec.push(...storyExec);
  }
  const rootExec = readJsonl(join(projectRoot, MEMORY_DIR, "execution-memory.jsonl"));
  allExec.push(...rootExec);

  const proposalDate = new Date(targetProposal.date).getTime();

  const preMemories = allExec
    .filter((r) => {
      const ts = r.timestamp ? new Date(r.timestamp).getTime() : 0;
      return ts < proposalDate;
    })
    .slice(-12);

  const postMemories = allExec
    .filter((r) => {
      const ts = r.timestamp ? new Date(r.timestamp).getTime() : 0;
      return ts >= proposalDate;
    })
    .slice(0, 12);

  const preCount = preMemories.length;
  const postCount = postMemories.length;

  console.log("");
  console.log(bold(`E1-E4 评估 · ${targetProposal.id}`));
  console.log("══════════════════════════════");
  console.log(`  提案类型: ${targetProposal.type} | 优先级: ${targetProposal.priority}`);
  console.log(`  前后记忆: pre=${preCount} post=${postCount} (需要各 ≥${MIN_EXEC_MEMORIES})`);
  console.log("");

  if (preCount < MIN_EXEC_MEMORIES || postCount < MIN_EXEC_MEMORIES) {
    console.log(yellow("  ⚠️  数据不足，无法完成硬评估"));
    console.log(yellow("  降级: 仅生成观察记录，提案状态保持 open"));
    console.log("");
    console.log(dim("  提示: 运行更多故事管线积累数据后，重新运行 evaluate"));
    console.log("");

    targetProposal.feedback.push({
      date: new Date().toISOString(),
      type: "observation",
      note: `数据不足 (pre=${preCount}, post=${postCount})，跳过 E1-E4 硬评估`,
    });
    targetProposal.eval_result = "insufficient_data";
    return;
  }

  const preMetrics = computeMetrics(preMemories);
  const postMetrics = computeMetrics(postMemories);

  const e1_improved = postMetrics.block_rate < preMetrics.block_rate;
  const e1_degraded = postMetrics.block_rate > preMetrics.block_rate;

  const e2_improved = postMetrics.p0_density < preMetrics.p0_density;
  const e2_degraded = postMetrics.p0_density > preMetrics.p0_density;

  const preBadCases = new Set();
  for (const r of preMemories) {
    const bc = r.bad_cases || [];
    for (const b of bc) {
      if (b.lesson) preBadCases.add(b.lesson);
    }
  }
  const postBadCases = new Set();
  for (const r of postMemories) {
    const bc = r.bad_cases || [];
    for (const b of bc) {
      if (b.lesson) postBadCases.add(b.lesson);
    }
  }
  const stillPresent = [...preBadCases].filter((bc) => postBadCases.has(bc));
  const resolved = [...preBadCases].filter((bc) => !postBadCases.has(bc));
  const e3_improved = resolved.length > 0;
  const e3_degraded = stillPresent.length > 0;

  let improvements = 0, degradations = 0;
  if (e1_improved) improvements++; else if (e1_degraded) degradations++;
  if (e2_improved) improvements++; else if (e2_degraded) degradations++;
  if (e3_improved) improvements++; else if (e3_degraded) degradations++;

  const overall = improvements > degradations ? "improved" :
                  degradations > improvements ? "degraded" : "neutral";

  console.log(bold("  评估结果"));
  console.log("  ─────────");
  console.log(`  E1 阻断率:   pre=${(preMetrics.block_rate * 100).toFixed(1)}% → post=${(postMetrics.block_rate * 100).toFixed(1)}%  ${e1_improved ? green("↓改善") : e1_degraded ? red("↑退化") : dim("→持平")}`);
  console.log(`  E2 P0 密度:  pre=${(preMetrics.p0_density * 100).toFixed(1)}% → post=${(postMetrics.p0_density * 100).toFixed(1)}%  ${e2_improved ? green("↓改善") : e2_degraded ? red("↑退化") : dim("→持平")}`);
  console.log(`  E3 不良案例: 已解决=${resolved.length} 仍存在=${stillPresent.length}  ${e3_improved && !e3_degraded ? green("✓改善") : e3_degraded ? red("✗退化") : dim("→无数据")}`);
  console.log(`  E4 综合:     ${overall === "improved" ? green("改善 ✅") : overall === "degraded" ? red("退化 ⚠️") : dim("中性")}`);
  console.log("");

  const evalResult = {
    proposal_id: targetProposal.id,
    evaluated_at: new Date().toISOString(),
    pre_memory_count: preCount,
    post_memory_count: postCount,
    E1: e1_improved ? "improved" : e1_degraded ? "degraded" : "unchanged",
    E2: e2_improved ? "improved" : e2_degraded ? "degraded" : "unchanged",
    E3: e3_improved && !e3_degraded ? "improved" : e3_degraded ? "degraded" : "unchanged",
    E4: overall,
    resolved_bad_cases: resolved,
    still_present_bad_cases: stillPresent,
  };

  targetProposal.feedback.push({
    date: new Date().toISOString(),
    type: "evaluation",
    result: evalResult,
  });
  targetProposal.eval_result = overall;

  if (overall === "improved") {
    targetProposal.status = "done";
    console.log(green("  ✅ 提案闭合 — 改善 > 退化"));
  } else if (overall === "degraded") {
    console.log(red("  ⚠️  提案退化 — 建议回退或重新提案"));
  }

  const proposalsPath = join(targetStoryPath, PROPOSALS_DIR, PROPOSALS_FILE);
  if (updateJsonlById(proposalsPath, targetProposal.id, (r) => {
    Object.assign(r, {
      status: targetProposal.status,
      eval_result: targetProposal.eval_result,
      feedback: targetProposal.feedback,
    });
  })) {
    console.log(dim(`  已更新 proposals.jsonl`));
  } else {
    console.log(yellow(`  ⚠️  更新 proposals.jsonl 失败`));
  }

  console.log("");
}
