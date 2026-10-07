/**
 * Knowledge base statistics composable — data quality, stale risk, coverage,
 * tag/role analysis, category comparison, and all derived metrics.
 */
import { computed, type Ref, type ComputedRef } from "vue";
import type { KnowledgeStatsData, KnowledgeFileSummary, KnowledgeModuleStats } from "@/api/interface/yiAi";
import {
  isMarkdownFile,
  isExcludedFromQuality,
  aggregateMissingStats,
  isMissingField,
  isUnknownField,
  isStaleFile,
  normalizeMetaValue,
  countByField,
  daysUntilDue,
  moduleHealthScore,
  topPairs,
  percentDelta,
  deltaPoints
} from "../utils";

interface StaleRiskBucket {
  label: string;
  severity: "red" | "orange" | "yellow" | "blue";
  files: KnowledgeFileSummary[];
  count: number;
}

export function useKnowledgeStats(
  knowledgeData: Ref<KnowledgeStatsData | null>,
  previousSnapshot: Ref<KnowledgeStatsData | null>,
  activeFilter: Ref<Record<string, string>>,
  filteredFiles: ComputedRef<KnowledgeFileSummary[]>
) {
  // ── Overview Metrics ──
  const topCategory = computed(() => {
    const cats = knowledgeData.value?.categories ?? [];
    if (!cats.length) return "-";
    return cats.reduce((a, b) => (a.count > b.count ? a : b)).name;
  });

  const tacitPct = computed(() => {
    const total = knowledgeData.value?.total ?? 1;
    return (((knowledgeData.value?.health.tacit_count ?? 0) / total) * 100).toFixed(1);
  });

  const topRole = computed(() => {
    const roles = knowledgeData.value?.roles ?? [];
    if (!roles.length) return "-";
    return roles.reduce((a, b) => (a.count > b.count ? a : b)).name;
  });

  const totalModules = computed(() => {
    const modules = knowledgeData.value?.modules ?? [];
    return modules.length;
  });

  // ── Time-based Metrics ──
  const weekFiles = computed(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try {
        return new Date(f.updated) >= weekAgo;
      } catch {
        return false;
      }
    });
  });

  const recentWeekCount = computed(() => weekFiles.value.length);

  const recentWeekPct = computed(() => {
    const total = knowledgeData.value?.total ?? 1;
    return ((recentWeekCount.value / total) * 100).toFixed(1);
  });

  const stalePct = computed(() => {
    const total = knowledgeData.value?.total ?? 1;
    return (((knowledgeData.value?.health.stale_count ?? 0) / total) * 100).toFixed(1);
  });

  // ── Today / Month Files ──
  const todayFiles = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try {
        return new Date(f.updated) >= today;
      } catch {
        return false;
      }
    });
  });

  const monthFiles = computed(() => {
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try {
        return new Date(f.updated) >= monthAgo;
      } catch {
        return false;
      }
    });
  });

  const staleFiles = computed(() => {
    return (knowledgeData.value?.files ?? [])
      .filter(f => isStaleFile(f))
      .sort((a, b) => a.updated.localeCompare(b.updated));
  });

  // ── Data Quality (client-side, markdown only, excludes skills) ──
  const clientMissingStats = computed(() => {
    const files = (knowledgeData.value?.files ?? []).filter(
      f => isMarkdownFile(f.path) && !isExcludedFromQuality(f)
    );
    return aggregateMissingStats(files);
  });

  const qualityEligibleTotal = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    return files.filter(f => isMarkdownFile(f.path) && !isExcludedFromQuality(f)).length || 1;
  });

  /** Weighted quality score: status(25) + type(25) + lifecycle(25) + review_cycle(15) + roles(5) + tags(5). */
  const dataQualityScore = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    const weights = { status: 25, type: 25, lifecycle: 25, review_cycle: 15, roles: 5, tags: 5 };
    const fields: Array<{ key: string; weight: number }> = [
      { key: "no_status", weight: weights.status },
      { key: "no_type", weight: weights.type },
      { key: "no_lifecycle", weight: weights.lifecycle },
      { key: "no_review_cycle", weight: weights.review_cycle },
      { key: "no_roles", weight: weights.roles },
      { key: "no_tags", weight: weights.tags }
    ];
    let score = 0;
    for (const f of fields) {
      const missing = (s as any)[f.key] ?? 0;
      score += ((total - missing) / total) * f.weight;
    }
    return Math.round(score);
  });

  const missingMetadataCount = computed(() => {
    const s = clientMissingStats.value;
    return s.no_status + s.no_type + s.no_lifecycle + s.no_review_cycle + s.no_roles + s.no_tags;
  });

  const totalMissingCount = computed(() => {
    const s = clientMissingStats.value;
    return s.no_status + s.no_type + s.no_lifecycle + s.no_review_cycle + s.no_roles + s.no_tags + s.no_benefit;
  });

  const totalUnknownCount = computed(() => {
    const s = clientMissingStats.value;
    return s.unknown_status + s.unknown_type + s.unknown_lifecycle;
  });

  const hasMissingItems = computed(() => totalMissingCount.value > 0);
  const hasUnknownItems = computed(() => totalUnknownCount.value > 0);

  // ── Individual Field Completeness ──
  const statusCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_status) / total) * 100);
  });

  const typeCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_type) / total) * 100);
  });

  const lifecycleCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_lifecycle) / total) * 100);
  });

  const reviewCycleCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_review_cycle) / total) * 100);
  });

  const rolesCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_roles) / total) * 100);
  });

  const tagsCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_tags) / total) * 100);
  });

  /** Review coverage using client-side stats (markdown only, excluding skills). */
  const clientReviewCoveragePct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_review_cycle) / total) * 100);
  });

  // ── Needs Attention Files ──
  const needsAttentionFiles = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    return files.filter(
      f =>
        isMarkdownFile(f.path) &&
        !isExcludedFromQuality(f) &&
        (isMissingField(f.status) ||
          isUnknownField(f.status) ||
          isMissingField(f.type) ||
          isUnknownField(f.type) ||
          isMissingField(f.lifecycle) ||
          isUnknownField(f.lifecycle) ||
          isMissingField(f.review_cycle) ||
          isMissingField(f.roles) ||
          isMissingField(f.tags) ||
          isMissingField(f.benefit) ||
          isStaleFile(f))
    );
  });

  const unknownStatusFiles = computed(() => {
    return (knowledgeData.value?.files ?? []).filter(
      f => isUnknownField(f.status) || isMissingField(f.status)
    );
  });

  const attentionPct = computed(() => {
    const total = knowledgeData.value?.total ?? 1;
    return Math.round((needsAttentionFiles.value.length / total) * 100);
  });

  // ── Per-Category Data Quality ──
  const qualityByCategory = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const cats = knowledgeData.value?.categories ?? [];
    const mdFiles = files.filter(f => isMarkdownFile(f.path) && !isExcludedFromQuality(f));
    return cats
      .map(cat => {
        const catFiles = mdFiles.filter(f => f.category === cat.name);
        const total = catFiles.length || 1;
        const missing = (field: string) => catFiles.filter(f => isMissingField((f as any)[field])).length;
        const fields = ["status", "type", "lifecycle", "review_cycle", "roles", "tags"] as const;
        let weightedScore = 0;
        const weights: Record<string, number> = {
          status: 25,
          type: 25,
          lifecycle: 25,
          review_cycle: 15,
          roles: 5,
          tags: 5
        };
        for (const f of fields) {
          const m = missing(f);
          const fieldPct = (total - m) / total;
          weightedScore += fieldPct * weights[f];
        }
        const totalMissing = fields.reduce((s, f) => s + missing(f), 0);
        return {
          name: cat.name,
          total: catFiles.length,
          score: Math.round(weightedScore),
          totalMissing,
          missingStatus: missing("status"),
          missingType: missing("type"),
          missingLifecycle: missing("lifecycle"),
          missingReviewCycle: missing("review_cycle"),
          missingRoles: missing("roles"),
          missingTags: missing("tags")
        };
      })
      .sort((a, b) => a.score - b.score);
  });

  const worstCategories = computed(() =>
    qualityByCategory.value.filter(c => c.score < 80).slice(0, 5)
  );

  // ── Stale Risk Buckets ──
  const staleRiskBuckets = computed((): StaleRiskBucket[] => {
    const allFiles = knowledgeData.value?.files ?? [];
    const withRisk: { file: KnowledgeFileSummary; daysUntilDue: number }[] = [];
    for (const f of allFiles) {
      const d = daysUntilDue(f);
      if (d !== null) withRisk.push({ file: f, daysUntilDue: d });
    }
    withRisk.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    const buckets: StaleRiskBucket[] = [
      {
        label: "Overdue",
        severity: "red" as const,
        files: withRisk.filter(r => r.daysUntilDue <= 0).map(r => r.file),
        count: 0
      },
      {
        label: "Due within 7 days",
        severity: "orange" as const,
        files: withRisk.filter(r => r.daysUntilDue > 0 && r.daysUntilDue <= 7).map(r => r.file),
        count: 0
      },
      {
        label: "Due within 30 days",
        severity: "yellow" as const,
        files: withRisk.filter(r => r.daysUntilDue > 7 && r.daysUntilDue <= 30).map(r => r.file),
        count: 0
      },
      {
        label: "Due within 90 days",
        severity: "blue" as const,
        files: withRisk.filter(r => r.daysUntilDue > 30 && r.daysUntilDue <= 90).map(r => r.file),
        count: 0
      }
    ];
    return buckets.map(b => ({ ...b, count: b.files.length }));
  });

  // ── Coverage Gaps ──
  const coverageGapData = computed(() => {
    const mods = knowledgeData.value?.modules ?? [];
    const files = knowledgeData.value?.files ?? [];
    return mods
      .filter(m => m.name !== "__root__")
      .map(m => {
        const modFiles = files.filter(f => f.category === m.category && f.module === m.name);
        const noStatus = modFiles.filter(f => !f.status).length;
        const noType = modFiles.filter(f => !f.type || f.type === "unknown").length;
        const noLifecycle = modFiles.filter(f => !f.lifecycle || f.lifecycle === "unknown").length;
        const noReview = modFiles.filter(f => !f.review_cycle).length;
        const noRoles = modFiles.filter(f => !f.roles?.length).length;
        const noTags = modFiles.filter(f => !f.tags?.length).length;
        const totalGaps = noStatus + noType + noLifecycle + noReview + noRoles + noTags;
        return {
          module: `${m.category}/${m.name}`,
          category: m.category,
          name: m.name,
          fileCount: m.count,
          noStatus,
          noType,
          noLifecycle,
          noReview,
          noRoles,
          noTags,
          totalGaps
        };
      })
      .sort((a, b) => b.totalGaps - a.totalGaps);
  });

  // ── Category Comparison ──
  const categoryComparisonData = computed(() => {
    const cats = knowledgeData.value?.categories ?? [];
    const modules = knowledgeData.value?.modules ?? [];
    const files = knowledgeData.value?.files ?? [];
    return cats
      .map(cat => {
        const catModules = modules.filter(m => m.category === cat.name);
        const catFiles = files.filter(f => f.category === cat.name);
        const totalFiles = catFiles.length;
        const staleCount = catModules.reduce((s, m) => s + m.stale_count, 0);
        const tacitCount = catModules.reduce((s, m) => s + m.tacit_count, 0);
        const avgCoverage =
          totalFiles > 0
            ? Math.round(catModules.reduce((s, m) => s + m.review_coverage_pct * m.count, 0) / totalFiles)
            : 0;
        const completeFiles = catFiles.filter(
          f =>
            f.status &&
            f.type &&
            f.type !== "unknown" &&
            f.lifecycle &&
            f.lifecycle !== "unknown" &&
            f.review_cycle
        ).length;
        const qualityPct = totalFiles ? Math.round((completeFiles / totalFiles) * 100) : 0;
        const statusCounts = new Map<string, number>();
        catFiles.forEach(f => statusCounts.set(f.status, (statusCounts.get(f.status) || 0) + 1));
        const topStatus = [...statusCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 1)[0];
        const topTypeEntries = countByField(catFiles, "type").slice(0, 1);
        return {
          name: cat.name,
          files: totalFiles,
          modules: catModules.length,
          coverage: avgCoverage,
          stale: staleCount,
          tacit: tacitCount,
          quality: qualityPct,
          topStatus: topStatus?.[0] || "-",
          topType: topTypeEntries[0]?.name || "-"
        };
      })
      .sort((a, b) => b.files - a.files);
  });

  // ── Cross-Dimensional Heatmap ──
  const crossStatusLifecycle = computed(() => {
    const files = activeFilter.value.category
      ? (knowledgeData.value?.files ?? []).filter(f => f.category === activeFilter.value.category)
      : (knowledgeData.value?.files ?? []);
    const map = new Map<string, number>();
    for (const f of files) {
      const key = `${f.status || "unknown"}|${f.lifecycle || "unknown"}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([key, count]) => {
      const [status, lifecycle] = key.split("|");
      return { status, lifecycle, count };
    });
  });

  // ── Tag Analysis ──
  const tagCounts = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const m = new Map<string, number>();
    for (const f of files) {
      for (const t of f.tags || []) m.set(t, (m.get(t) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  const tagPairs = computed(() => {
    const files = activeFilter.value.category
      ? (knowledgeData.value?.files ?? []).filter(f => f.category === activeFilter.value.category)
      : (knowledgeData.value?.files ?? []);
    return topPairs(files, "tags", 10);
  });

  // ── Role Analysis ──
  const roleCounts = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const m = new Map<string, number>();
    for (const f of files) {
      for (const r of f.roles || []) m.set(r, (m.get(r) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  const rolePairs = computed(() => {
    const files = activeFilter.value.category
      ? (knowledgeData.value?.files ?? []).filter(f => f.category === activeFilter.value.category)
      : (knowledgeData.value?.files ?? []);
    return topPairs(files, "roles", 10);
  });

  // ── Review Compliance ──
  const reviewComplianceData = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const m = new Map<string, { total: number; overdue: number }>();
    for (const f of files) {
      const rc = f.review_cycle;
      if (!rc) continue;
      if (!m.has(rc)) m.set(rc, { total: 0, overdue: 0 });
      const entry = m.get(rc)!;
      entry.total++;
      if (isStaleFile(f)) entry.overdue++;
    }
    return Array.from(m.entries())
      .map(({ 0: cycle, 1: { total, overdue } }) => ({
        cycle,
        total,
        overdue,
        onTrack: total - overdue,
        compliance: total > 0 ? Math.round(((total - overdue) / total) * 100) : 100
      }))
      .sort((a, b) => a.compliance - b.compliance);
  });

  // ── Trend Deltas (current vs. previous snapshot, for stat card indicators) ──
  const trendDeltas = computed(() => {
    const curr = knowledgeData.value;
    const prev = previousSnapshot.value;
    if (!curr || !prev) return null;
    return {
      total: percentDelta(curr.total, prev.total),
      stale: percentDelta(curr.health.stale_count, prev.health.stale_count),
      tacit: percentDelta(curr.health.tacit_count, prev.health.tacit_count),
      coverage: deltaPoints(curr.health.review_coverage_pct, prev.health.review_coverage_pct),
      quality: deltaPoints(dataQualityScore.value,
        Math.round(prev.files.filter(f =>
          isMarkdownFile(f.path) && !isExcludedFromQuality(f)
        ).length > 0
          ? ((prev.files.filter(f => isMarkdownFile(f.path) && !isExcludedFromQuality(f) && f.review_cycle).length /
              prev.files.filter(f => isMarkdownFile(f.path) && !isExcludedFromQuality(f)).length) * 100)
          : 0)),
      categories: deltaPoints(curr.categories.length, prev.categories.length),
      modules: deltaPoints((curr.modules ?? []).length, (prev.modules ?? []).length),
      recentWeek: percentDelta(
        recentWeekCount.value,
        prev.files.filter(f => {
          if (!f.updated) return false;
          try { return new Date(f.updated) >= new Date(Date.now() - 7 * 86400000); } catch { return false; }
        }).length
      ),
    };
  });

  // ── Stat Deltas (baseline vs filtered) ──
  const statDeltas = computed(() => {
    const hasActiveFilter = Object.keys(activeFilter.value).length > 0;
    if (!hasActiveFilter) return null;
    const allFiles = knowledgeData.value?.files ?? [];
    const filtered = filteredFiles.value;
    const allModules = new Set(allFiles.map(f => `${f.category}/${f.module}`)).size;
    const filtModules = new Set(filtered.map(f => `${f.category}/${f.module}`)).size;
    const allCats = new Set(allFiles.map(f => f.category)).size;
    const filtCats = new Set(filtered.map(f => f.category)).size;
    const allStale = allFiles.filter(f => isStaleFile(f)).length;
    const filtStale = filtered.filter(f => isStaleFile(f)).length;
    const allCov =
      allFiles.length > 0
        ? Math.round((allFiles.filter(f => f.review_cycle).length / allFiles.length) * 100)
        : 0;
    const filtCov =
      filtered.length > 0
        ? Math.round((filtered.filter(f => f.review_cycle).length / filtered.length) * 100)
        : 0;
    return {
      total: { baseline: allFiles.length, filtered: filtered.length },
      modules: { baseline: allModules, filtered: filtModules },
      categories: { baseline: allCats, filtered: filtCats },
      stale: { baseline: allStale, filtered: filtStale },
      coverage: { baseline: allCov, filtered: filtCov }
    };
  });

  // ── Drill Summary ──
  const drillSummary = computed(() => {
    const files = filteredFiles.value;
    if (!files.length) return null;
    const modules = new Map<string, number>();
    const statuses = new Map<string, number>();
    const types = new Map<string, number>();
    const lifecycles = new Map<string, number>();
    for (const f of files) {
      const mod = f.module === "__root__" ? "root" : f.module || "root";
      modules.set(mod, (modules.get(mod) || 0) + 1);
      statuses.set(normalizeMetaValue(f.status), (statuses.get(normalizeMetaValue(f.status)) || 0) + 1);
      types.set(normalizeMetaValue(f.type), (types.get(normalizeMetaValue(f.type)) || 0) + 1);
      lifecycles.set(normalizeMetaValue(f.lifecycle), (lifecycles.get(normalizeMetaValue(f.lifecycle)) || 0) + 1);
    }
    const top = (m: Map<string, number>, n: number) =>
      Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n);
    return {
      total: files.length,
      topModules: top(modules, 5),
      topStatuses: top(statuses, 4),
      topTypes: top(types, 4),
      topLifecycles: top(lifecycles, 4)
    };
  });

  return {
    // Overview
    topCategory,
    tacitPct,
    topRole,
    totalModules,
    recentWeekCount,
    recentWeekPct,
    stalePct,
    clientReviewCoveragePct,
    // Data quality
    dataQualityScore,
    missingMetadataCount,
    qualityEligibleTotal,
    clientMissingStats,
    totalMissingCount,
    totalUnknownCount,
    hasMissingItems,
    hasUnknownItems,
    // Field completeness
    statusCompletenessPct,
    typeCompletenessPct,
    lifecycleCompletenessPct,
    reviewCycleCompletenessPct,
    rolesCompletenessPct,
    tagsCompletenessPct,
    // Quality by category
    qualityByCategory,
    worstCategories,
    // Needs attention
    needsAttentionFiles,
    unknownStatusFiles,
    attentionPct,
    // Stale risk
    staleRiskBuckets,
    staleFiles,
    todayFiles,
    monthFiles,
    // Coverage & comparison
    coverageGapData,
    categoryComparisonData,
    crossStatusLifecycle,
    // Tags & roles
    tagCounts,
    tagPairs,
    roleCounts,
    rolePairs,
    // Review compliance
    reviewComplianceData,
    // Stat deltas
    statDeltas,
    trendDeltas,
    // Drill summary
    drillSummary
  };
}