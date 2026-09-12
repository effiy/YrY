import { ref, computed, type Ref } from "vue";
import { getRssList, type RssItemDocument } from "@/api/modules/rssService";
import type { ECOption } from "@/components/ECharts/config";

const CHART_COLORS = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"];
const VOLUME_DAYS = 14;

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useRssBriefing(
  briefingItems: Ref<RssItemDocument[]>,
  selectedRoles: Ref<string[]>,
  t: (key: string, opts?: Record<string, unknown>) => string,
  localeTag: Ref<string>,
  subCategory: (path: string) => string,
  roleColor: (path: string) => string,
) {
  const briefingLoading = ref(false);
  const briefingDate = ref(new Date());
  const briefingSearch = ref("");
  const briefingCategoryFilter = ref("");

  function coverageColor(pct: number): string {
    if (pct >= 80) return "#67c23a";
    if (pct >= 50) return "#e6a23c";
    return "#f56c6c";
  }

  // ── Category distribution donut ──
  const briefingCategoryOption = computed<ECOption>(() => {
    const counts = new Map<string, number>();
    const uncategorized = t("rss.manager.categories.uncategorized");
    for (const item of briefingItems.value) {
      const key = item.category_path || uncategorized;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const data = [...counts.entries()]
      .map(([key, value]) => ({ name: subCategory(key) || key, value, itemStyle: { color: roleColor(key) } }))
      .sort((a, b) => b.value - a.value);
    return {
      tooltip: { trigger: "item", formatter: (p: any) => `${p.name}: ${p.value} (${p.percent}%)` },
      legend: { orient: "vertical", left: 0, top: "center", itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 }, type: "scroll" },
      series: [{
        type: "pie", radius: ["45%", "70%"], center: ["58%", "50%"],
        label: { show: true, fontSize: 10, formatter: (p: any) => `${p.name}\n${p.percent}%` },
        emphasis: { label: { fontSize: 14, fontWeight: "bold" } },
        data
      }]
    };
  });

  // ── Top sources bar ──
  const briefingSourceOption = computed<ECOption>(() => {
    const counts = new Map<string, number>();
    const unknownSource = t("rss.manager.categories.unknownSource");
    for (const item of briefingItems.value) {
      const label = item.source_name || unknownSource;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).reverse();
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
      xAxis: { type: "value", axisLabel: { fontSize: 9 } },
      yAxis: { type: "category", data: top.map(d => d[0]), axisLabel: { fontSize: 10 } },
      series: [{ type: "bar", barWidth: "60%", data: top.map((d, i) => ({ value: d[1], itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length], borderRadius: [0, 4, 4, 0] } })) }]
    };
  });

  // ── Volume trend ──
  const dailyVolume = ref<{ date: string; count: number }[]>([]);
  const volumeLoading = ref(false);

  async function loadDailyVolume() {
    volumeLoading.value = true;
    const roles = selectedRoles.value.length ? selectedRoles.value : [];
    const days: { date: string; start: number; end: number }[] = [];
    for (let i = VOLUME_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
      days.push({ date: fmtDate(d), start, end });
    }
    try {
      const results = await Promise.allSettled(days.map(async day => {
        const base = { pageNum: 1, pageSize: 1, publishedStart: day.start, publishedEnd: day.end };
        if (!roles.length) return (await getRssList(base)).data?.total ?? 0;
        if (roles.length === 1) return (await getRssList({ ...base, categoryPrefix: roles[0] })).data?.total ?? 0;
        const per = await Promise.allSettled(roles.map(rid => getRssList({ ...base, categoryPrefix: rid })));
        return per.reduce((sum, r) => sum + (r.status === "fulfilled" ? r.value.data?.total ?? 0 : 0), 0);
      }));
      dailyVolume.value = days.map((day, i) => ({
        date: day.date,
        count: results[i].status === "fulfilled" ? results[i].value : 0
      }));
    } catch {
      dailyVolume.value = days.map(d => ({ date: d.date, count: 0 }));
    } finally {
      volumeLoading.value = false;
    }
  }

  const briefingVolumeOption = computed<ECOption>(() => ({
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", top: "8%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: dailyVolume.value.map(d => d.date.slice(5)), axisLabel: { fontSize: 9 } },
    yAxis: { type: "value", axisLabel: { fontSize: 9 }, minInterval: 1 },
    series: [{ type: "bar", barWidth: "60%", itemStyle: { color: "#5470c6", borderRadius: [4, 4, 0, 0] }, data: dailyVolume.value.map(d => d.count) }]
  }));

  const todayDelta = computed(() => {
    const v = dailyVolume.value;
    if (v.length < 2) return 0;
    return v[v.length - 1].count - v[v.length - 2].count;
  });

  // ── Content completeness ──
  const briefingCoverage = computed(() => {
    const total = briefingItems.value.length;
    if (!total) return null;
    let withSummary = 0, withAuthor = 0, categorized = 0;
    for (const i of briefingItems.value) {
      if (i.summary) withSummary++;
      if (i.author) withAuthor++;
      if (i.category_path) categorized++;
    }
    const pct = (n: number) => Math.round((n / total) * 100);
    return [
      { key: "summary", label: t("rss.manager.briefing.coverage.withSummary"), count: withSummary, pct: pct(withSummary) },
      { key: "author", label: t("rss.manager.briefing.coverage.withAuthor"), count: withAuthor, pct: pct(withAuthor) },
      { key: "category", label: t("rss.manager.briefing.coverage.categorized"), count: categorized, pct: pct(categorized) }
    ];
  });

  function clearBriefingFilters() {
    briefingSearch.value = "";
    briefingCategoryFilter.value = "";
  }

  async function loadBriefing() {
    briefingLoading.value = true;
    try {
      const d = briefingDate.value;
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
      const baseParams = {
        pageNum: 1, pageSize: 200,
        publishedStart: startOfDay, publishedEnd: endOfDay,
        orderBy: "published_parsed" as string, orderType: "desc" as const
      };
      const roles = selectedRoles.value.length ? selectedRoles.value : [];
      if (!roles.length) {
        const res = await getRssList(baseParams);
        briefingItems.value = res.data?.list ?? [];
      } else if (roles.length === 1) {
        const res = await getRssList({ ...baseParams, categoryPrefix: roles[0] });
        briefingItems.value = res.data?.list ?? [];
      } else {
        const results = await Promise.allSettled(roles.map(rid => getRssList({ ...baseParams, categoryPrefix: rid })));
        const seen = new Set<string>();
        const allItems: RssItemDocument[] = [];
        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          for (const item of (r.value.data?.list ?? [])) {
            const k = item.key || item.link;
            if (k && !seen.has(k)) { seen.add(k); allItems.push(item); }
          }
        }
        allItems.sort((a, b) => (Number(b.published_parsed) || 0) - (Number(a.published_parsed) || 0));
        briefingItems.value = allItems;
      }
    } catch {
      briefingItems.value = [];
    } finally {
      briefingLoading.value = false;
    }
  }

  return {
    briefingLoading, briefingDate, briefingSearch, briefingCategoryFilter,
    coverageColor,
    briefingCategoryOption, briefingSourceOption,
    dailyVolume, volumeLoading, loadDailyVolume,
    briefingVolumeOption, todayDelta,
    briefingCoverage,
    clearBriefingFilters, loadBriefing,
  };
}