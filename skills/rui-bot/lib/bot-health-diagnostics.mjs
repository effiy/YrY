/**
 * bot-health-diagnostics — Health data collection, bootstrap diagnostics, diagnostic engine.
 * Extracted from send.mjs for module decomposition.
 */

import { join } from "node:path";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";

import {
  DIAGNOSTIC_LABELS, DIAGNOSTIC_BASELINES, DIAGNOSTIC_MIN_CONFIDENCE,
  T3_PROPORTION_THRESHOLD,
} from "../../../lib/constants.mjs";
import { runDiagnostics } from "../../../lib/engine/diagnostics.mjs";

function collectHealthData(projectRoot) {
  const execPath = join(projectRoot, ".memory", "execution-memory.jsonl");
  const auditPath = join(projectRoot, ".memory", "tool-audit.jsonl");
  const deliveryPath = join(projectRoot, ".memory", "delivery-tracking.jsonl");
  const statusPath = join(projectRoot, ".memory", "status-history.jsonl");
  const proposalsPath = join(projectRoot, ".improvement", "proposals.jsonl");

  const readJsonl = (p) => {
    if (!existsSync(p)) return [];
    return readFileSync(p, "utf-8").trim().split("\n").filter(Boolean).map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  };

  return {
    allExec: readJsonl(execPath),
    toolAudit: readJsonl(auditPath),
    deliveryTrack: readJsonl(deliveryPath),
    statusHistory: readJsonl(statusPath),
    proposals: readJsonl(proposalsPath),
  };
}

/**
 * Scan scene directories for D6 documentation staleness issues.
 */
export function computeDocIssuesForHealth(projectRoot) {
  const storyDir = join(projectRoot, "docs", "故事任务面板");
  const issues = [];
  if (!existsSync(storyDir)) return { docIssues: [], retroMissing: false, noProposals: false };

  try {
    const stories = readdirSync(storyDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    for (const story of stories) {
      const storyPath = join(storyDir, story.name);
      const entries = readdirSync(storyPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || !entry.name.startsWith("场景")) continue;
        const sceneDir = join(storyPath, entry.name);
        let mdFiles;
        try { mdFiles = readdirSync(sceneDir); } catch { continue; }
        for (const mf of mdFiles.filter((f) => f.endsWith(".md") || f.endsWith(".html"))) {
          const docPath = join(sceneDir, mf);
          try {
            const content = readFileSync(docPath, "utf-8");
            if (!/§4\s*自改进|自改进复盘/i.test(content) && content.length > 500) {
              issues.push(`${story.name}/${entry.name}/${mf}: 缺少 §4 自改进章节`);
            }
          } catch { /* skip */ }
        }
      }
    }
  } catch { /* skip */ }

  const retroPath = join(projectRoot, "docs", "故事任务面板", "yry-arch", "YrY-自改进复盘.md");
  const retroMissing = !existsSync(retroPath);

  const proposalsPath = join(projectRoot, ".improvement", "proposals.jsonl");
  const noProposals = !existsSync(proposalsPath);

  return { docIssues: issues, retroMissing, noProposals };
}

/**
 * Bootstrap D0-D8 diagnostics from git history and project data when no
 * execution memory exists. Derives approximate signals for each dimension.
 */
export function getBootstrapDiagnostics(projectRoot) {
  const diagnostics = [];
  let gitActivity = 0;      // commit count in last 30 days
  let largeCommits = 0;     // commits with >15 files (T3 proxy)
  let revertCommits = 0;    // revert/rollback commits (block/recovery proxy)
  let staleDocCount = 0;    // scenes without recent HTML updates
  let highChurnFiles = 0;   // files modified in >5 commits (D2 quality proxy)
  let pkgChanges = 0;       // package.json changes (D5 dependency proxy)
  let lockfileChanges = 0;  // lockfile changes (D5 dependency proxy)

  // Track per-file churn for D2
  const fileChurn = new Map();

  // ── Derive signals from git log ──────────────────────
  try {
    const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    // Full log for commit counting and churn tracking
    const log = execSync(
      `git log --since="${since}" --format="%H %s" --shortstat 2>/dev/null || true`,
      { cwd: projectRoot, encoding: "utf-8", timeout: 5000 }
    );
    const lines = log.split("\n").filter(Boolean);
    for (const line of lines) {
      if (/^[a-f0-9]{40} /.test(line)) {
        gitActivity++;
        if (/ revert|rollback|undo/i.test(line)) revertCommits++;
        // Track package.json changes
        if (/package\.json/i.test(line)) pkgChanges++;
        if (/package-lock|yarn\.lock|pnpm-lock/i.test(line)) lockfileChanges++;
      }
      const m = line.match(/(\d+) files? changed/);
      if (m && parseInt(m[1], 10) > 15) largeCommits++;
    }

    // Per-file churn for D2 quality proxy
    // Only track source files (.mjs/.js), excluding help files (docs, not code)
    try {
      const nameLog = execSync(
        `git log --since="${since}" --name-only --format="" 2>/dev/null || true`,
        { cwd: projectRoot, encoding: "utf-8", timeout: 5000 }
      );
      for (const f of nameLog.split("\n")) {
        const path = f.trim();
        if (!path) continue;
        // Only source code churn; help.mjs is documentation, not quality-relevant
        if (/\.(mjs|js)$/i.test(path) && !/help\.mjs$/.test(path)) {
          fileChurn.set(path, (fileChurn.get(path) || 0) + 1);
        }
      }
      for (const [, count] of fileChurn) {
        if (count > 5) highChurnFiles++;
      }
    } catch { /* skip */ }
  } catch { /* git unavailable */ }

  // ── Scan scene documentation freshness ──────────────
  try {
    const storyDir = join(projectRoot, "docs", "故事任务面板");
    if (existsSync(storyDir)) {
      const stories = readdirSync(storyDir, { withFileTypes: true }).filter((d) => d.isDirectory());
      for (const story of stories) {
        const scenes = readdirSync(join(storyDir, story.name), { withFileTypes: true })
          .filter((d) => d.isDirectory() && d.name.startsWith("场景"));
        for (const scene of scenes) {
          const htmlFiles = readdirSync(join(storyDir, story.name, scene.name))
            .filter((f) => f.endsWith(".html"));
          if (htmlFiles.length === 0) {
            staleDocCount++;
          } else {
            // Check if any HTML file is older than 7 days
            let hasRecent = false;
            for (const hf of htmlFiles) {
              try {
                const s = statSync(join(storyDir, story.name, scene.name, hf));
                if ((Date.now() - s.mtimeMs) / 86400000 < 7) { hasRecent = true; break; }
              } catch { /* skip */ }
            }
            if (!hasRecent) staleDocCount++;
          }
        }
      }
    }
  } catch { /* skip */ }

  // ── Check proposal closure rate ─────────────────────
  const proposalsPath = join(projectRoot, ".improvement", "proposals.jsonl");
  let proposalClosureRate = 1;
  if (existsSync(proposalsPath)) {
    try {
      const lines = readFileSync(proposalsPath, "utf-8").trim().split("\n").filter(Boolean);
      if (lines.length > 0) {
        let closed = 0;
        for (const line of lines) {
          try {
            const p = JSON.parse(line);
            if (p.status === "done" || p.status === "superseded") closed++;
          } catch { /* skip */ }
        }
        proposalClosureRate = closed / lines.length;
      }
    } catch { /* skip */ }
  }

  // ── Build approximate diagnostics ───────────────────
  const triggered = [];

  // D1: Efficiency — use revert rate as block proxy
  if (gitActivity >= 5 && revertCommits > 0) {
    const revertRate = revertCommits / gitActivity;
    if (revertRate > 0.2) {
      triggered.push({
        id: "D1", label: DIAGNOSTIC_LABELS.D1, triggered: true,
        confidence: revertCommits,
        evidence: `${revertCommits}/${gitActivity} 回退提交 (${(revertRate * 100).toFixed(0)}%) — 近似阻断率`,
        baseline: DIAGNOSTIC_BASELINES.D1,
        suggestion: "回退提交占比偏高，加强影响分析阶段预处理，提前识别阻断风险",
      });
    }
  }

  // D3: Complexity — use large commit ratio as T3 proxy
  if (gitActivity >= 3 && largeCommits > 0) {
    const t3Ratio = largeCommits / gitActivity;
    if (t3Ratio > T3_PROPORTION_THRESHOLD) {
      triggered.push({
        id: "D3", label: DIAGNOSTIC_LABELS.D3, triggered: true,
        confidence: largeCommits,
        evidence: `${largeCommits}/${gitActivity} 大提交 (${(t3Ratio * 100).toFixed(0)}%) > ${(T3_PROPORTION_THRESHOLD * 100).toFixed(0)}% — 近似 T3 占比`,
        baseline: DIAGNOSTIC_BASELINES.D3,
        suggestion: "大提交占比偏高，建议加强需求拆分，将大任务拆分为多个小故事",
      });
    }
  }

  // D6: Documentation staleness
  if (staleDocCount > 0) {
    triggered.push({
      id: "D6", label: DIAGNOSTIC_LABELS.D6, triggered: true,
      confidence: staleDocCount,
      evidence: `${staleDocCount} 个场景文档超过 7 天未更新`,
      baseline: DIAGNOSTIC_BASELINES.D6,
      suggestion: "补齐场景文档的 §4 自改进章节，保持文档与代码同步",
    });
  }

  // D7: Configuration drift — proposal closure
  if (proposalClosureRate < 0.5) {
    triggered.push({
      id: "D7", label: DIAGNOSTIC_LABELS.D7, triggered: true,
      confidence: Math.round((1 - proposalClosureRate) * 10),
      evidence: `提案闭合率 ${(proposalClosureRate * 100).toFixed(0)}% < 50%`,
      baseline: DIAGNOSTIC_BASELINES.D7,
      suggestion: "审查提案的可执行性，确保改进项能够落地",
    });
  }

  // D0: Baseline deviation — uncommitted divergence from main
  let uncommittedCount = 0;
  try {
    const status = execSync("git status --porcelain 2>/dev/null || true", {
      cwd: projectRoot, encoding: "utf-8", timeout: 3000,
    });
    uncommittedCount = status.trim().split("\n").filter(Boolean).length;
  } catch { /* skip */ }
  if (uncommittedCount > 50) {
    triggered.push({
      id: "D0", label: DIAGNOSTIC_LABELS.D0, triggered: true,
      confidence: Math.min(uncommittedCount / 10, 10),
      evidence: `${uncommittedCount} 个未提交文件 — 基线可能漂移`,
      baseline: DIAGNOSTIC_BASELINES.D0,
      suggestion: "大量未提交文件增加基线偏离风险，建议分批提交并推送",
    });
  }

  // D2: Quality degradation — high churn source files (>5 changes/month)
  // Excludes help.mjs (documentation). Threshold at ~8% of source files.
  if (gitActivity >= 3 && highChurnFiles > 15) {
    triggered.push({
      id: "D2", label: DIAGNOSTIC_LABELS.D2, triggered: true,
      confidence: highChurnFiles,
      evidence: `${highChurnFiles} 个源码文件月修改 >5 次 — 质量热点`,
      baseline: DIAGNOSTIC_BASELINES.D2,
      suggestion: "高频修改源码文件占比偏高，建议增加单元测试覆盖和代码审查",
    });
  }

  // D4: Process degradation — frequent reverts
  if (gitActivity >= 5 && revertCommits >= 2) {
    triggered.push({
      id: "D4", label: DIAGNOSTIC_LABELS.D4, triggered: true,
      confidence: revertCommits,
      evidence: `${revertCommits} 次回退操作 — 流程可能需要优化`,
      baseline: DIAGNOSTIC_BASELINES.D4,
      suggestion: "多次回退表明 Gate A/B 验证可能不足，建议加强测试先行和影响分析",
    });
  }

  // D5: Dependency degradation — package.json changes without lockfile
  if (gitActivity >= 3 && pkgChanges > lockfileChanges && pkgChanges > 0) {
    triggered.push({
      id: "D5", label: DIAGNOSTIC_LABELS.D5, triggered: true,
      confidence: pkgChanges - lockfileChanges,
      evidence: `${pkgChanges} 次依赖变更, 仅 ${lockfileChanges} 次 lockfile 更新`,
      baseline: DIAGNOSTIC_BASELINES.D5,
      suggestion: "依赖变更未同步更新 lockfile，可能导致环境不一致",
    });
  }

  // Build the full diagnostic list (passed + triggered)
  const allDiags = Object.entries(DIAGNOSTIC_LABELS).map(([id, label]) => {
    const t = triggered.find((d) => d.id === id);
    return t || { id, label, triggered: false, confidence: 0, evidence: "无数据", baseline: DIAGNOSTIC_BASELINES[id] || "", suggestion: "" };
  });

  if (triggered.length === 0) {
    return {
      score: 100, summary: `Git 引导: ${gitActivity} 次提交, 无异常信号`,
      skip: false, diagnostics: allDiags, triggered: [], execCount: 0, bootstrapped: true,
    };
  }

  const score = Math.max(0, 100 - triggered.length * 15);
  const labels = triggered.map((d) => `${d.id} ${d.label}`).join(", ");
  return {
    score,
    summary: `Git 引导: ${gitActivity} 次提交 — 触发: ${labels}`,
    skip: false, diagnostics: allDiags, triggered, execCount: 0, bootstrapped: true,
  };
}

/**
 * Run the full D0-D8 diagnostic engine and return a summary for the health check.
 */
export function getDiagnosticResult(projectRoot) {
  const data = collectHealthData(projectRoot);
  const execCount = data.allExec.length;

  if (execCount === 0) {
    // Bootstrap diagnostics from git history + project data
    return getBootstrapDiagnostics(projectRoot);
  }

  try {
    const { docIssues, retroMissing, noProposals } = computeDocIssuesForHealth(projectRoot);
    data.retroMissing = retroMissing;
    data.noProposals = noProposals;

    const diagnostics = runDiagnostics(data, docIssues);
    const triggered = diagnostics.filter((d) => d.triggered);

    if (triggered.length === 0) {
      return {
        score: 100, summary: `${execCount} 条记录 — D0-D8 无异常`,
        skip: false, diagnostics, triggered: [], execCount,
      };
    }

    const score = Math.max(0, 100 - triggered.length * 15);
    const labels = triggered.map((d) => `${d.id} ${d.label}`).join(", ");
    return {
      score, summary: `${execCount} 条记录 — 触发: ${labels}`,
      skip: false, diagnostics, triggered, execCount,
    };
  } catch (err) {
    return { score: 50, summary: `诊断引擎异常: ${err.message}`, skip: true, diagnostics: [], execCount };
  }
}
