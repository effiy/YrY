/**
 * RAG analytics composable — computed properties for retrieval-quality
 * analytics: sparklines, correlations, grade breakdowns, file/tag stats,
 * and config-cost comparisons. Shared between the History tab (filtered
 * drill-down) and the Index tab (aggregate overview cards).
 */
import { computed, type Ref, type ComputedRef } from "vue";
import type { RagQueryRecord, RagChatTurnRecord } from "@/api/interface/rag";
import {
  sparklineData,
  pearsonCorr,
  gradeBreakdown,
  tokenBudget,
  metaFreshness,
} from "./ragFormat";

/** Filter configuration for narrowing the analytics window. */
export interface AnalyticsFilter {
  dateRange: Ref<"24h" | "7d" | "30d" | "all">;
  textFilter: Ref<string>;
  scopeFilter: Ref<string>;
  retrievalConfigFilter: Ref<"" | "hybrid" | "rerank" | "citations" | "plain">;
  chatModeFilter: Ref<"" | "condense_plus_context" | "condense_question" | "context" | "simple">;
}

/** Default empty filter (show everything). */
export function defaultFilter(): AnalyticsFilter {
  return {
    dateRange: ref("all" as const),
    textFilter: ref(""),
    scopeFilter: ref(""),
    retrievalConfigFilter: ref("" as const),
    chatModeFilter: ref("" as const),
  };
}

import { ref } from "vue";

export function useRagAnalytics(
  rawHistoryRecords: Ref<RagQueryRecord[]>,
  rawChatTurns: Ref<RagChatTurnRecord[]>,
  filter: AnalyticsFilter,
) {
  // ── Date-range helper ──
  function withinDateRange(ts: string): boolean {
    const range = filter.dateRange.value;
    if (range === "all") return true;
    const t = Date.parse(ts);
    if (Number.isNaN(t)) return true;
    const cutoff = Date.now() - (
      range === "24h" ? 86_400_000 : range === "7d" ? 7 * 86_400_000 : 30 * 86_400_000
    );
    return t >= cutoff;
  }

  // ── Filtered records ──
  const filteredHistoryRecords = computed(() => {
    const q = filter.textFilter.value.trim().toLowerCase();
    const cfg = filter.retrievalConfigFilter.value;
    const sf = filter.scopeFilter.value;
    return rawHistoryRecords.value.filter(r => {
      if (!withinDateRange(r.timestamp)) return false;
      if (sf && (r.scope ?? "") !== sf) return false;
      if (cfg === "hybrid" && !r.config?.hybrid) return false;
      if (cfg === "rerank" && !r.config?.rerank) return false;
      if (cfg === "citations" && !r.config?.citations) return false;
      if (cfg === "plain" && (r.config?.hybrid || r.config?.rerank)) return false;
      if (!q) return true;
      return r.question.toLowerCase().includes(q);
    });
  });

  const filteredChatTurns = computed(() => {
    const q = filter.textFilter.value.trim().toLowerCase();
    const mode = filter.chatModeFilter.value;
    const sf = filter.scopeFilter.value;
    return rawChatTurns.value.filter(t => {
      if (!withinDateRange(t.timestamp)) return false;
      if (sf && (t.scope ?? "") !== sf) return false;
      if (mode && t.chat_mode !== mode) return false;
      if (!q) return true;
      if (t.question.toLowerCase().includes(q)) return true;
      return t.answer.toLowerCase().includes(q);
    });
  });

  // ── Scope options (distinct values across both sources) ──
  const scopeOptions = computed(() => {
    const counts = new Map<string, number>();
    const bump = (s: string) => counts.set(s, (counts.get(s) ?? 0) + 1);
    rawHistoryRecords.value.forEach(r => bump(r.scope ?? ""));
    rawChatTurns.value.forEach(t => bump(t.scope ?? ""));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([scope, count]) => ({ scope, count, label: scope || "(full KB)" }));
  });

  // ── Summary statistics ──
  const meanTopScoreRetrieval = computed(() => meanOf(filteredHistoryRecords.value, r => r.top_score));
  const meanTopScoreChat = computed(() => meanOf(filteredChatTurns.value, t => t.top_score));
  const meanLatencyRetrieval = computed(() => meanOf(filteredHistoryRecords.value, r => r.latency_ms));
  const meanLatencyChat = computed(() => meanOf(filteredChatTurns.value, t => t.latency_ms));
  const meanTokensRetrieval = computed(() => meanOf(filteredHistoryRecords.value, r => tokenBudget(r.sources)));
  const meanTokensChat = computed(() => meanOf(filteredChatTurns.value, t => tokenBudget(t.sources)));
  const meanSourceCountRetrieval = computed(() => meanOf(filteredHistoryRecords.value, r => r.result_count ?? r.sources?.length ?? 0));
  const meanSourceCountChat = computed(() => meanOf(filteredChatTurns.value, t => t.source_count ?? t.sources?.length ?? 0));

  // ── Sparklines ──
  const latencySparkRetrieval = computed(() => {
    const series = [...rawHistoryRecords.value].reverse().map(r => r.latency_ms || 0);
    return series.length ? sparklineData(series) : null;
  });
  const scoreSparkRetrieval = computed(() => {
    const series = [...rawHistoryRecords.value].reverse().map(r => r.top_score || 0);
    if (!series.length) return null;
    const d = sparklineData(series);
    return { ...d, max: Math.round(d.max * 100), mean: Math.round(d.mean * 100) };
  });
  const tokenSparkRetrieval = computed(() => {
    const sums = [...rawHistoryRecords.value].reverse().map(r => tokenBudget(r.sources) ?? 0);
    return sums.length >= 2 && !sums.every(s => s === 0) ? sparklineData(sums) : null;
  });
  const avgScoreSparkRetrieval = computed(() => {
    const vals = [...filteredHistoryRecords.value].reverse().map(r => r.avg_score ?? 0);
    return vals.length >= 2 ? sparklineData(vals) : null;
  });

  const latencySparkChat = computed(() => {
    const series = [...filteredChatTurns.value].reverse().map(t => t.latency_ms || 0);
    return series.length >= 2 ? sparklineData(series) : null;
  });
  const scoreSparkChat = computed(() => {
    const series = [...filteredChatTurns.value].reverse().map(t => t.top_score || 0);
    if (series.length < 2) return null;
    const d = sparklineData(series);
    return { ...d, max: Math.round(d.max * 100), mean: Math.round(d.mean * 100) };
  });
  const tokenSparkChat = computed(() => {
    const sums = [...filteredChatTurns.value].reverse().map(t => tokenBudget(t.sources) ?? 0);
    return sums.length >= 2 && !sums.every(s => s === 0) ? sparklineData(sums) : null;
  });
  const avgScoreSparkChat = computed(() => {
    const vals = [...filteredChatTurns.value].reverse().map(t => t.avg_score ?? 0);
    return vals.length >= 2 ? sparklineData(vals) : null;
  });

  // ── Scatter plots ──
  const scatterRetrieval = computed(() => buildRetrievalScatter(rawHistoryRecords.value));
  const scatterChat = computed(() => buildChatScatter(filteredChatTurns.value));

  // ── Pearson correlations ──
  const tokenLatencyCorrRetrieval = computed(() => corrPairs(filteredHistoryRecords.value, r => [tokenBudget(r.sources), r.latency_ms ?? 0]));
  const scoreLatencyCorrRetrieval = computed(() => corrPairs(filteredHistoryRecords.value, r => [r.top_score ?? 0, r.latency_ms ?? 0]));
  const qlenScoreCorrRetrieval = computed(() => corrPairs(filteredHistoryRecords.value, r => [r.question?.length ?? 0, r.top_score ?? 0]));
  const tokenLatencyCorrChat = computed(() => corrPairs(filteredChatTurns.value, t => [tokenBudget(t.sources), t.latency_ms ?? 0]));
  const scoreLatencyCorrChat = computed(() => corrPairs(filteredChatTurns.value, t => [t.top_score ?? 0, t.latency_ms ?? 0]));
  const qlenScoreCorrChat = computed(() => corrPairs(filteredChatTurns.value, t => [t.question?.length ?? 0, t.top_score ?? 0]));

  // ── Grade breakdowns ──
  const gradeBreakdownRetrieval = computed(() => {
    const scores: number[] = [];
    for (const r of filteredHistoryRecords.value) for (const s of r.sources) scores.push(s.score || 0);
    return gradeBreakdown(scores);
  });
  const gradeBreakdownChat = computed(() => {
    const scores: number[] = [];
    for (const t of filteredChatTurns.value) for (const s of t.sources) scores.push(s.score || 0);
    return gradeBreakdown(scores);
  });

  // ── Top source files ──
  const topSourceFilesRetrieval = computed(() => topFiles(
    filteredHistoryRecords.value.map(r => r.sources), r => r.id,
  ));
  const topSourceFilesChat = computed(() => topFiles(
    filteredChatTurns.value.map(t => t.sources), t => t.id,
  ));

  // ── Top retrieved tags ──
  const topTagsRetrieval = computed(() => topTags(
    filteredHistoryRecords.value.flatMap(r => r.sources),
  ));
  const topTagsChat = computed(() => topTags(
    filteredChatTurns.value.flatMap(t => t.sources),
  ));

  // ── Best/worst questions ──
  const bestWorstQuestionRetrieval = computed(() => {
    const recs = filteredHistoryRecords.value;
    if (recs.length < 2) return null;
    let best: RagQueryRecord | null = null, worst: RagQueryRecord | null = null;
    for (const r of recs) {
      if (!best || r.top_score > best.top_score) best = r;
      if (!worst || r.top_score < worst.top_score) worst = r;
    }
    if (!best || !worst || best.id === worst.id) return null;
    return {
      best: { question: best.question, topScore: Math.round(best.top_score * 100), latency: best.latency_ms },
      worst: { question: worst.question, topScore: Math.round(worst.top_score * 100), latency: worst.latency_ms },
    };
  });
  const bestWorstQuestionChat = computed(() => {
    const turns = filteredChatTurns.value;
    if (turns.length < 2) return null;
    let best: RagChatTurnRecord | null = null, worst: RagChatTurnRecord | null = null;
    for (const t of turns) {
      if (!best || t.top_score > best.top_score) best = t;
      if (!worst || t.top_score < worst.top_score) worst = t;
    }
    if (!best || !worst || best.id === worst.id) return null;
    return {
      best: { question: best.question, topScore: Math.round(best.top_score * 100), latency: best.latency_ms },
      worst: { question: worst.question, topScore: Math.round(worst.top_score * 100), latency: worst.latency_ms },
    };
  });

  // ── Config cost (retrieval) ──
  const configCost = computed(() => {
    const recs = filteredHistoryRecords.value;
    if (recs.length < 2) return null;
    const groups: Record<string, { sum: number; n: number; latencies: number[]; scoreSum: number }> = {};
    for (const r of recs) {
      const h = !!r.config?.hybrid, re = !!r.config?.rerank;
      const key = `${h ? "H" : "-"}${re ? "R" : "-"}`;
      if (!groups[key]) groups[key] = { sum: 0, n: 0, latencies: [], scoreSum: 0 };
      const lat = r.latency_ms || 0;
      groups[key].sum += lat; groups[key].n += 1; groups[key].latencies.push(lat); groups[key].scoreSum += r.top_score || 0;
    }
    const pct = (sorted: number[], p: number) => {
      if (!sorted.length) return null;
      const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
      return sorted[idx];
    };
    const baseline = groups["--"] ? groups["--"].sum / groups["--"].n : null;
    const baselineP50 = groups["--"] ? pct([...groups["--"].latencies].sort((a, b) => a - b), 50) : null;
    const order = ["--", "H-", "-R", "HR"];
    const entries = order.filter(k => groups[k]).map(k => {
      const mean = Math.round(groups[k].sum / groups[k].n);
      const meanScore = groups[k].scoreSum / groups[k].n;
      const sorted = [...groups[k].latencies].sort((a, b) => a - b);
      const p50 = pct(sorted, 50) ?? mean;
      const p90 = pct(sorted, 90) ?? mean;
      const label = k === "--" ? "plain" : k === "H-" ? "hybrid" : k === "-R" ? "rerank" : "hybrid+rerank";
      const delta = baseline != null ? mean - Math.round(baseline) : null;
      const efficiency = mean > 0 ? Math.round((meanScore / mean) * 100000) / 100 : null;
      return { key: k, label, mean, p50, p90, n: groups[k].n, meanScore: Math.round(meanScore * 100), delta, deltaPct: baseline != null ? Math.round(((mean - baseline) / baseline) * 100) : null, p50Delta: baselineP50 != null ? p50 - baselineP50 : null, efficiency, winner: false };
    });
    const maxEff = entries.reduce((m, e) => Math.max(m, e.efficiency ?? 0), 0);
    for (const e of entries) e.winner = e.efficiency != null && e.efficiency === maxEff && entries.length > 1;
    return entries.length >= 2 ? { entries, baseline: baseline != null ? Math.round(baseline) : null, baselineP50 } : null;
  });

  // ── Chat mode cost ──
  const chatModeCost = computed(() => {
    const turns = filteredChatTurns.value;
    if (turns.length < 2) return null;
    const groups: Record<string, { sum: number; n: number; latencies: number[]; scoreSum: number }> = {};
    for (const t of turns) {
      const m = t.chat_mode || "unknown";
      if (!groups[m]) groups[m] = { sum: 0, n: 0, latencies: [], scoreSum: 0 };
      const lat = t.latency_ms || 0;
      groups[m].sum += lat; groups[m].n += 1; groups[m].latencies.push(lat); groups[m].scoreSum += t.top_score || 0;
    }
    const pct = (sorted: number[], p: number) => {
      if (!sorted.length) return null;
      const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
      return sorted[idx];
    };
    const baseline = groups["simple"] ? groups["simple"].sum / groups["simple"].n : null;
    const baselineP50 = groups["simple"] ? pct([...groups["simple"].latencies].sort((a, b) => a - b), 50) : null;
    const entries = Object.entries(groups).map(([mode, g]) => {
      const mean = Math.round(g.sum / g.n);
      const meanScore = g.scoreSum / g.n;
      const sorted = [...g.latencies].sort((a, b) => a - b);
      const p50 = pct(sorted, 50) ?? mean;
      const p90 = pct(sorted, 90) ?? mean;
      const delta = baseline != null ? mean - Math.round(baseline) : null;
      const efficiency = mean > 0 ? Math.round((meanScore / mean) * 100000) / 100 : null;
      return { mode, mean, p50, p90, n: g.n, meanScore: Math.round(meanScore * 100), delta, deltaPct: baseline != null ? Math.round(((mean - baseline) / baseline) * 100) : null, p50Delta: baselineP50 != null ? p50 - baselineP50 : null, efficiency, winner: false };
    }).sort((a, b) => a.mean - b.mean);
    const maxEff = entries.reduce((m, e) => Math.max(m, e.efficiency ?? 0), 0);
    for (const e of entries) e.winner = e.efficiency != null && e.efficiency === maxEff && entries.length > 1;
    return entries.length >= 2 ? { entries, baseline: baseline != null ? Math.round(baseline) : null, baselineP50 } : null;
  });

  // ── Chat mode breakdown ──
  const chatModeBreakdown = computed(() => {
    const turns = filteredChatTurns.value;
    if (!turns.length) return null;
    const counts: Record<string, number> = {};
    for (const t of turns) { const m = t.chat_mode || "unknown"; counts[m] = (counts[m] || 0) + 1; }
    const total = turns.length;
    const palette: Record<string, string> = {
      condense_plus_context: "var(--el-color-primary)",
      condense_question: "var(--el-color-success)",
      context: "var(--el-color-warning)",
      simple: "var(--el-text-color-secondary)",
    };
    return Object.entries(counts).map(([mode, count]) => ({
      mode, count, pct: Math.round((count / total) * 100), color: palette[mode] || "var(--el-color-info)",
    })).sort((a, b) => b.count - a.count);
  });

  // ── Stale rates ──
  const staleRateRetrieval = computed(() => {
    const recs = filteredHistoryRecords.value;
    if (!recs.length) return null;
    const stale = recs.filter(r => r.sources.some(s => metaFreshness(s.metadata)?.stale)).length;
    return { stale, total: recs.length, pct: Math.round((stale / recs.length) * 100) };
  });
  const staleRateChat = computed(() => {
    const turns = filteredChatTurns.value;
    if (!turns.length) return null;
    const stale = turns.filter(t => t.sources.some(s => metaFreshness(s.metadata)?.stale)).length;
    return { stale, total: turns.length, pct: Math.round((stale / turns.length) * 100) };
  });

  // ── Zero-result and slow-query rates ──
  const zeroResultRateRetrieval = computed(() => rateOf(filteredHistoryRecords.value, r => !r.sources || r.sources.length === 0));
  const zeroResultRateChat = computed(() => rateOf(filteredChatTurns.value, t => !t.sources || t.sources.length === 0));
  const slowRateRetrieval = computed(() => rateOf(filteredHistoryRecords.value, r => (r.latency_ms ?? 0) >= 5000));
  const slowRateChat = computed(() => rateOf(filteredChatTurns.value, t => (t.latency_ms ?? 0) >= 5000));

  // ── Distinct questions ──
  const distinctQuestionsRetrieval = computed(() => {
    const recs = filteredHistoryRecords.value;
    if (recs.length < 2) return null;
    const set = new Set(recs.map(r => r.question.trim().toLowerCase()));
    return { distinct: set.size, total: recs.length };
  });
  const distinctQuestionsChat = computed(() => {
    const turns = filteredChatTurns.value;
    if (turns.length < 2) return null;
    const set = new Set(turns.map(t => t.question.trim().toLowerCase()));
    return { distinct: set.size, total: turns.length };
  });

  // ── Scope popularity (aggregate across both sources) ──
  const scopePopularity = computed(() => {
    const counts = new Map<string, { count: number; recLat: number[]; topScore: number[] }>();
    const bump = (scope: string, lat: number, top: number) => {
      const k = scope || "(full KB)";
      if (!counts.has(k)) counts.set(k, { count: 0, recLat: [], topScore: [] });
      const e = counts.get(k)!;
      e.count += 1; e.recLat.push(lat); e.topScore.push(top);
    };
    for (const r of rawHistoryRecords.value) bump(r.scope ?? "", r.latency_ms || 0, r.top_score || 0);
    for (const t of rawChatTurns.value) bump(t.scope ?? "", t.latency_ms || 0, t.top_score || 0);
    if (counts.size < 2) return null;
    const total = Array.from(counts.values()).reduce((a, c) => a + c.count, 0);
    const entries = Array.from(counts.entries()).map(([scope, e]) => ({
      scope, count: e.count, pct: Math.round((e.count / total) * 100),
      meanLat: Math.round(e.recLat.reduce((a, b) => a + b, 0) / e.recLat.length),
      meanTop: Math.round((e.topScore.reduce((a, b) => a + b, 0) / e.topScore.length) * 100),
    })).sort((a, b) => b.count - a.count).slice(0, 6);
    return { entries, total, unique: counts.size };
  });

  // ── Top repeated questions ──
  const topRepeatedQuestions = computed(() => {
    const counts = new Map<string, { count: number; topScore: number[]; lat: number[]; sample: string }>();
    const bump = (q: string, top: number, lat: number) => {
      if (!q) return;
      const k = q.trim().toLowerCase();
      if (!k) return;
      if (!counts.has(k)) counts.set(k, { count: 0, topScore: [], lat: [], sample: q.trim() });
      const e = counts.get(k)!;
      e.count += 1; e.topScore.push(top); e.lat.push(lat);
    };
    for (const r of rawHistoryRecords.value) bump(r.question ?? "", r.top_score || 0, r.latency_ms || 0);
    for (const t of rawChatTurns.value) bump(t.question ?? "", t.top_score || 0, t.latency_ms || 0);
    const entries = Array.from(counts.entries()).filter(([, e]) => e.count >= 2).map(([, e]) => ({
      sample: e.sample.length > 60 ? e.sample.slice(0, 57) + "…" : e.sample,
      count: e.count,
      meanTop: Math.round((e.topScore.reduce((a, b) => a + b, 0) / e.topScore.length) * 100),
      meanLat: Math.round(e.lat.reduce((a, b) => a + b, 0) / e.lat.length),
    })).sort((a, b) => b.count - a.count || b.meanTop - a.meanTop).slice(0, 3);
    return entries.length ? entries : null;
  });

  // ── Top stale files (aggregate across both sources) ──
  const topStaleFiles = computed(() => {
    const counts = new Map<string, { count: number; ageDaysMax: number }>();
    const bump = (sources: Array<{ file_path?: string; metadata?: any }>) => {
      for (const s of sources) {
        if (!s.metadata) continue;
        const f = metaFreshness(s.metadata);
        if (!f || !f.stale) continue;
        const fp = s.file_path || "(unknown)";
        if (!counts.has(fp)) counts.set(fp, { count: 0, ageDaysMax: 0 });
        const e = counts.get(fp)!;
        e.count += 1; e.ageDaysMax = Math.max(e.ageDaysMax, f.ageDays);
      }
    };
    for (const r of rawHistoryRecords.value) bump(r.sources);
    for (const t of rawChatTurns.value) bump(t.sources);
    const entries = Array.from(counts.entries()).map(([path, e]) => {
      const short = path.length > 60 ? "…" + path.slice(path.length - 57) : path;
      return { path, short, count: e.count, ageDays: e.ageDaysMax, ageLabel: e.ageDaysMax >= 365 ? `${Math.round(e.ageDaysMax / 30)}mo` : `${e.ageDaysMax}d` };
    }).sort((a, b) => b.count * b.ageDays - a.count * a.ageDays).slice(0, 5);
    return entries.length ? entries : null;
  });

  // ── Top scoring files ──
  const topScoringFiles = computed(() => {
    const groups = new Map<string, { scores: number[]; count: number }>();
    const bump = (sources: Array<{ file_path?: string; score?: number }>) => {
      for (const s of sources) {
        const fp = s.file_path || "(unknown)";
        if (!groups.has(fp)) groups.set(fp, { scores: [], count: 0 });
        const g = groups.get(fp)!;
        g.scores.push(s.score || 0); g.count += 1;
      }
    };
    for (const r of rawHistoryRecords.value) bump(r.sources);
    for (const t of rawChatTurns.value) bump(t.sources);
    const entries = Array.from(groups.entries()).filter(([, g]) => g.scores.length >= 2).map(([path, g]) => {
      const mean = g.scores.reduce((a, b) => a + b, 0) / g.scores.length;
      const short = path.length > 60 ? "…" + path.slice(path.length - 57) : path;
      return { path, short, meanScore: Math.round(mean * 100), count: g.count, max: Math.round(Math.max(...g.scores) * 100) };
    }).filter(e => e.meanScore > 0).sort((a, b) => b.meanScore - a.meanScore).slice(0, 5);
    return entries.length ? entries : null;
  });

  // ── Coverage gap (files in scope never retrieved) ──
  function computeCoverageGap(scopeFiles: string[]) {
    if (!scopeFiles.length) return null;
    const retrieved = new Set<string>();
    for (const r of rawHistoryRecords.value) for (const s of r.sources) retrieved.add(s.file_path);
    for (const t of rawChatTurns.value) for (const s of t.sources) retrieved.add(s.file_path);
    const gap: Array<{ path: string; name: string }> = [];
    for (const p of scopeFiles) {
      const name = p.split("/").pop() || p;
      let hit = retrieved.has(p);
      if (!hit) for (const rp of retrieved) if (rp.endsWith(name) || rp.endsWith(p)) { hit = true; break; }
      if (!hit) gap.push({ path: p, name });
    }
    if (!gap.length) return null;
    gap.sort((a, b) => a.path.length - b.path.length);
    return { entries: gap.slice(0, 5), total: gap.length, scoped: scopeFiles.length };
  }

  return {
    // Filtered data
    filteredHistoryRecords,
    filteredChatTurns,
    scopeOptions,
    // Summary statistics
    meanTopScoreRetrieval,
    meanTopScoreChat,
    meanLatencyRetrieval,
    meanLatencyChat,
    meanTokensRetrieval,
    meanTokensChat,
    meanSourceCountRetrieval,
    meanSourceCountChat,
    // Sparklines
    latencySparkRetrieval,
    scoreSparkRetrieval,
    tokenSparkRetrieval,
    avgScoreSparkRetrieval,
    latencySparkChat,
    scoreSparkChat,
    tokenSparkChat,
    avgScoreSparkChat,
    // Scatter plots
    scatterRetrieval,
    scatterChat,
    // Correlations
    tokenLatencyCorrRetrieval,
    scoreLatencyCorrRetrieval,
    qlenScoreCorrRetrieval,
    tokenLatencyCorrChat,
    scoreLatencyCorrChat,
    qlenScoreCorrChat,
    // Grade breakdowns
    gradeBreakdownRetrieval,
    gradeBreakdownChat,
    // Top files / tags
    topSourceFilesRetrieval,
    topSourceFilesChat,
    topTagsRetrieval,
    topTagsChat,
    // Best/worst
    bestWorstQuestionRetrieval,
    bestWorstQuestionChat,
    // Config/mode costs
    configCost,
    chatModeCost,
    chatModeBreakdown,
    // Rates
    staleRateRetrieval,
    staleRateChat,
    zeroResultRateRetrieval,
    zeroResultRateChat,
    slowRateRetrieval,
    slowRateChat,
    // Distinct questions
    distinctQuestionsRetrieval,
    distinctQuestionsChat,
    // Aggregate analytics (for Index tab)
    scopePopularity,
    topRepeatedQuestions,
    topStaleFiles,
    topScoringFiles,
    computeCoverageGap,
    // Utility
    withinDateRange,
  };
}

// ── Private helpers ──

function meanOf<T>(items: T[], fn: (item: T) => number | null | undefined): number | null {
  let sum = 0, seen = 0;
  for (const item of items) {
    const v = fn(item);
    if (v != null && v > 0) { sum += v; seen++; }
  }
  return seen ? Math.round(sum / seen) : null;
}

function corrPairs<T>(items: T[], pair: (item: T) => [number | null, number]): ReturnType<typeof pearsonCorr> {
  const xs: number[] = [], ys: number[] = [];
  for (const item of items) {
    const [a, b] = pair(item);
    if (a != null && a > 0 && b > 0) { xs.push(a); ys.push(b); }
  }
  return pearsonCorr(xs, ys);
}

function topFiles(sourcesByRecord: Array<Array<{ file_path?: string; score?: number }>>, idFn: (r: any) => string) {
  const counts: Record<string, { count: number; best: number }> = {};
  let i = 0;
  for (const sources of sourcesByRecord) {
    for (const s of sources) {
      const fp = s.file_path || "(unknown)";
      if (!counts[fp]) counts[fp] = { count: 0, best: 0 };
      counts[fp].count += 1;
      counts[fp].best = Math.max(counts[fp].best, s.score || 0);
    }
    i++;
  }
  const total = Object.values(counts).reduce((a, c) => a + c.count, 0);
  const entries = Object.entries(counts).map(([path, c]) => ({
    path, count: c.count, pct: Math.round((c.count / total) * 100), best: Math.round(c.best * 100),
  })).sort((a, b) => b.count - a.count).slice(0, 5);
  return entries.length ? { entries, totalSources: total } : null;
}

function topTags(sources: Array<{ metadata?: { tags?: string | string[] } }>) {
  const counts: Record<string, number> = {};
  for (const s of sources) {
    const tags = s.metadata?.tags;
    if (!tags) continue;
    const arr = Array.isArray(tags) ? tags : String(tags).split(/[,\s]+/).filter(Boolean);
    for (const t of arr) if (t) counts[t] = (counts[t] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, c) => a + c, 0);
  const entries = Object.entries(counts).map(([tag, count]) => ({ tag, count, pct: Math.round((count / total) * 100) })).sort((a, b) => b.count - a.count).slice(0, 6);
  return entries.length ? { entries, totalHits: total, uniqueTags: Object.keys(counts).length } : null;
}

function rateOf<T>(items: T[], pred: (item: T) => boolean) {
  if (!items.length) return null;
  const count = items.filter(pred).length;
  return { count, total: items.length, pct: Math.round((count / items.length) * 100) };
}

function buildRetrievalScatter(records: RagQueryRecord[]) {
  if (records.length < 2) return null;
  const W = 200, H = 80, pad = 18;
  const pts = records.map(r => ({ lat: r.latency_ms || 0, score: r.top_score || 0, id: r.id, hybrid: r.config?.hybrid, rerank: r.config?.rerank }));
  const latencies = pts.map(p => p.lat), scores = pts.map(p => p.score);
  const maxLat = Math.max(...latencies, 1), minLat = Math.min(...latencies);
  const meanLat = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const maxScoreVal = Math.max(...scores, 0.001);
  const maxScore = Math.round(maxScoreVal * 100);
  const minScore = Math.round(Math.min(...scores) * 100);
  const meanScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  const dots = pts.map(p => ({
    id: p.id, cx: pad + (p.lat / maxLat) * (W - 2 * pad), cy: H - pad - (p.score / maxScoreVal) * (H - 2 * pad), r: 3,
    hybrid: !!p.hybrid, rerank: !!p.rerank, lat: p.lat, score: p.score,
  }));
  return { dots, maxLat, maxScore, minLat, meanLat, minScore, meanScore, W, H, pad, n: pts.length };
}

function buildChatScatter(turns: RagChatTurnRecord[]) {
  if (turns.length < 2) return null;
  const W = 200, H = 80, pad = 18;
  const palette: Record<string, string> = {
    condense_plus_context: "var(--el-color-primary)", condense_question: "var(--el-color-success)",
    context: "var(--el-color-warning)", simple: "var(--el-text-color-secondary)",
  };
  const pts = turns.map(t => ({ lat: t.latency_ms || 0, score: t.top_score || 0, id: t.id, mode: t.chat_mode || "unknown" }));
  const latencies = pts.map(p => p.lat), scores = pts.map(p => p.score);
  const maxLat = Math.max(...latencies, 1), minLat = Math.min(...latencies);
  const meanLat = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const maxScoreVal = Math.max(...scores, 0.001);
  const maxScore = Math.round(maxScoreVal * 100);
  const minScore = Math.round(Math.min(...scores) * 100);
  const meanScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  const dots = pts.map(p => ({
    id: p.id, cx: pad + (p.lat / maxLat) * (W - 2 * pad), cy: H - pad - (p.score / maxScoreVal) * (H - 2 * pad),
    r: 3, mode: p.mode, color: palette[p.mode] || "var(--el-color-info)", lat: p.lat, score: p.score,
  }));
  return { dots, maxLat, maxScore, minLat, meanLat, minScore, meanScore, W, H, pad, n: pts.length };
}