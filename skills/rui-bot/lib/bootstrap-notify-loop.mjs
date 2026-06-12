import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { generateReport, generateManifest, generateIndex } from "./loop-report.mjs";

function readJson(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return null; }
}

function readJsonlLatest(path) {
  if (!existsSync(path)) return null;
  try {
    const lines = readFileSync(path, "utf-8").trim().split("\n").filter(Boolean);
    if (!lines.length) return null;
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    return null;
  }
}

function buildTrendsLoopPayload() {
  const manifest = readJson(join("docs", "趋势报告", "reports.json"));
  const rows = Array.isArray(manifest) ? manifest : [];
  const latestBySource = new Map();
  for (const r of rows) {
    const src = r?.source || "";
    const date = r?.date || "";
    if (!src || !date) continue;
    const prev = latestBySource.get(src);
    if (!prev || String(prev.date) < String(date)) latestBySource.set(src, r);
  }
  const latestAll = latestBySource.get("all") || rows.find((r) => r?.source === "all") || null;
  const unreachable = rows.filter((r) => r?.ok === false);
  const status = unreachable.length > 0 ? "warn" : "pass";
  const summary = latestAll
    ? `最新全量趋势快照 ${latestAll.date} · items=${latestAll.items ?? "—"} · ${unreachable.length ? `${unreachable.length} 个源不可达` : "全部源可达"}`
    : `趋势清单缺失或为空 · ${unreachable.length ? `${unreachable.length} 个源不可达` : "暂无快照"}`;

  const findings = [];
  if (latestAll) {
    findings.push({ level: "info", title: "全量趋势快照", detail: `date=${latestAll.date} · items=${latestAll.items ?? "—"} · trend=${latestAll.trend ?? "—"}` });
  } else {
    findings.push({ level: "warn", title: "未发现全量趋势快照", detail: "docs/趋势报告/reports.json 中未找到 source=all 的记录，建议运行 rui-trends all --html" });
  }
  for (const u of unreachable.slice(0, 3)) {
    findings.push({ level: "fail", title: `${u.source || "unknown"} 不可达`, detail: `date=${u.date || "—"} · file=${u.file || "—"}` });
  }
  if (unreachable.length > 3) {
    findings.push({ level: "warn", title: "更多不可达源", detail: `还有 ${unreachable.length - 3} 个不可达源，详见 docs/趋势报告/reports.json` });
  }

  const details = latestBySource.size
    ? `来源概览:\n${[...latestBySource.entries()].map(([k, v]) => `- ${k}: ${v.date} items=${v.items ?? "—"} ok=${v.ok !== false}`).join("\n")}`
    : `来源概览: 无`;

  return { skill: "rui-trends", status, summary, findings, details };
}

function buildAnalysisLoopPayload() {
  const latest = readJsonlLatest(join(".memory", "arch-trend.jsonl"));
  if (!latest) {
    return {
      skill: "rui-analysis",
      status: "warn",
      summary: "未发现架构趋势记录（.memory/arch-trend.jsonl）",
      findings: [{ level: "warn", title: "缺少 arch-trend 记录", detail: "建议运行架构/质量检查流程生成架构趋势快照" }],
      details: "arch-trend.jsonl: missing",
    };
  }
  const grade = latest.archGrade || "—";
  const score = latest.archComposite ?? "—";
  const failed = Array.isArray(latest.archFailedDims) ? latest.archFailedDims : [];
  const status = grade === "A" || grade === "B" ? "pass" : grade === "C" ? "warn" : "fail";
  const summary = `架构健康 ${score}/${grade} · failedDims=${failed.length} · checks=${latest.passedChecks ?? "—"}/${latest.totalChecks ?? "—"}`;
  const findings = [];
  findings.push({ level: "info", title: "架构健康快照", detail: `timestamp=${latest.timestamp?.slice(0, 19) || "—"} · branch=${latest.gitBranch || "—"}` });
  if (failed.length > 0) {
    findings.push({ level: status === "fail" ? "fail" : "warn", title: "未通过维度", detail: failed.join(", ") });
  } else {
    findings.push({ level: "info", title: "维度全部通过", detail: "archFailedDims 为空" });
  }
  const details = `archScores:\n${Object.entries(latest.archScores || {}).map(([k, v]) => `- ${k}: ${v}`).join("\n")}`;
  return { skill: "rui-analysis", status, summary, findings, details };
}

function buildSelfImproveLoopPayload() {
  const sum = readJson(join("docs", "自我改进", "summary.json"));
  if (!sum) {
    return {
      skill: "self-improve",
      status: "warn",
      summary: "自改进摘要缺失（docs/自我改进/summary.json）",
      findings: [{ level: "warn", title: "缺少 summary.json", detail: "建议运行健康检查或自改进聚合脚本生成摘要" }],
      details: "summary.json: missing",
    };
  }
  const updated = sum.updated || "";
  const latest = sum.latest || {};
  const grade = latest.grade || "—";
  const composite = latest.composite ?? "—";
  const diags = Array.isArray(latest.triggeredDiags) ? latest.triggeredDiags : [];
  const status = grade === "A" || grade === "B" ? "pass" : grade === "C" ? "warn" : "fail";
  const summary = `摘要已更新 ${updated.slice(0, 19).replace("T", " ")} · latest ${composite}/${grade} · 诊断触发 ${diags.length}/8`;
  const findings = [];
  findings.push({ level: "info", title: "摘要元信息", detail: `entries=${sum.totalEntries ?? "—"} · range=${sum.dateRange?.from || "—"}~${sum.dateRange?.to || "—"}` });
  if (diags.length > 0) findings.push({ level: status === "fail" ? "fail" : "warn", title: "最新触发诊断", detail: diags.join(", ") });
  else findings.push({ level: "info", title: "最新诊断", detail: "无触发" });
  const topDaily = Array.isArray(sum.daily) && sum.daily.length ? sum.daily[0] : null;
  if (topDaily && Array.isArray(topDaily.topDiags) && topDaily.topDiags.length) {
    const t = topDaily.topDiags.slice(0, 3).map((d) => `${d.id}(${d.count})`).join(", ");
    findings.push({ level: "info", title: "日级热点诊断", detail: t });
  }
  const details = `latest:\n- branch=${latest.gitBranch || "—"}\n- uncommitted=${latest.gitUncommitted ?? "—"}\n- bootstrapped=${!!latest.bootstrapped}`;
  return { skill: "self-improve", status, summary, findings, details };
}

function ensureBotLoopReport(date) {
  const reportDir = join("docs", "自循环报告");
  const stable = `rui-bot-${date}.html`;
  const stablePath = join(reportDir, stable);
  if (existsSync(stablePath)) return;
  if (!existsSync(reportDir)) return;
  const files = readdirSync(reportDir).filter((f) => f.startsWith(`rui-bot-${date}`) && f.endsWith(".html"));
  if (!files.length) return;
  const src = files.includes(stable) ? stable : files.sort().reverse()[0];
  try {
    writeFileSync(stablePath, readFileSync(join(reportDir, src), "utf-8"), "utf-8");
  } catch {
    return;
  }
}

const payloads = [buildTrendsLoopPayload(), buildAnalysisLoopPayload(), buildSelfImproveLoopPayload()];
for (const p of payloads) {
  const { filePath } = generateReport(p);
  console.log(`[loop-report] bootstrapped: ${p.skill} -> ${filePath}`);
}
ensureBotLoopReport(new Date().toISOString().slice(0, 10));
generateManifest();
generateIndex();
console.log("[loop-report] reports.json + index.html updated");
