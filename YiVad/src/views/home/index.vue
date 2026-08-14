<template>
  <div class="harness-overview" v-loading="loading">
    <!-- ═══ Header ═══ -->
    <div class="ho__header">
      <div class="ho__header-title">
        <h1 class="ho__title">{{ t("home.title") }}</h1>
        <span class="ho__subtitle">{{ t("home.subtitle") }}</span>
      </div>
      <div class="ho__header-actions">
        <span class="ho__updated" v-if="lastUpdated">{{ t("home.updated", { time: lastUpdated }) }}</span>
        <span class="ho__clock">{{ clock }}</span>
        <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">
          {{ t("home.refresh") }}
        </el-button>
        <el-button size="small" type="primary" :icon="ChatDotRound" @click="router.push('/aiChat')">
          {{ t("home.aiChat") }}
        </el-button>
        <el-button size="small" :icon="Aim" @click="router.push('/executiver/okr')">
          {{ t("home.okr") }}
        </el-button>
      </div>
    </div>

    <!-- ═══ Project landscape ═══ -->
    <section class="ho__section">
      <div class="ho__section-head">
        <h2 class="ho__section-title">{{ t("home.projects.title") }}</h2>
        <span class="ho__section-desc">{{ t("home.projects.subtitle") }}</span>
      </div>
      <div class="ho__projects">
        <div
          v-for="p in projects"
          :key="p.key"
          class="ho__project"
          :class="{ 'ho__project--link': p.to }"
          @click="onProjectClick(p.to)"
        >
          <span class="ho__project-icon">{{ p.icon }}</span>
          <div class="ho__project-body">
            <div class="ho__project-name">
              {{ t(`home.projects.${p.key}.name`) }}
              <span v-if="!p.to" class="ho__project-current">{{ t("home.status.ready") }}</span>
            </div>
            <div class="ho__project-role">{{ t(`home.projects.${p.key}.role`) }}</div>
          </div>
          <span class="ho__dot" :class="`is-${p.status}`" :title="dotTitle(p.status)"></span>
        </div>
      </div>
    </section>

    <!-- ═══ Harness capability seams ═══ -->
    <section class="ho__section">
      <div class="ho__section-head">
        <h2 class="ho__section-title">{{ t("home.seams.title") }}</h2>
        <span class="ho__section-desc">{{ t("home.seams.subtitle") }}</span>
      </div>
      <div class="ho__seams">
        <div v-for="s in seams" :key="s.key" class="ho__seam">
          <div class="ho__seam-head">
            <span class="ho__seam-icon">{{ s.icon }}</span>
            <span class="ho__seam-name">{{ t(`home.seams.${s.key}.name`) }}</span>
            <span class="ho__dot" :class="`is-${s.status}`"></span>
          </div>
          <div class="ho__seam-mapping">{{ t(`home.seams.${s.key}.mapping`) }}</div>
          <div class="ho__seam-foot">
            <span class="ho__seam-value">{{ s.value }}</span>
            <span class="ho__seam-status" :class="`is-${s.status}`">{{ s.statusText }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ AI Agent activity ═══ -->
    <section class="ho__section">
      <div class="ho__section-head">
        <h2 class="ho__section-title">{{ t("home.ai.title") }}</h2>
      </div>
      <div class="ho__kpis">
        <div class="ho__kpi">
          <div class="ho__kpi-value">{{ formatNumber(aiStats?.total_sessions) }}</div>
          <div class="ho__kpi-label">{{ t("home.ai.totalSessions") }}</div>
        </div>
        <div class="ho__kpi">
          <div class="ho__kpi-value">{{ formatNumber(aiStats?.messages_today) }}</div>
          <div class="ho__kpi-label">{{ t("home.ai.messagesToday") }}</div>
        </div>
        <div class="ho__kpi">
          <div class="ho__kpi-value">{{ formatNumber(aiStats?.active_sessions_today) }}</div>
          <div class="ho__kpi-label">{{ t("home.ai.activeToday") }}</div>
        </div>
        <div class="ho__kpi">
          <div class="ho__kpi-value">{{ aiStats?.avg_messages_per_session ?? "—" }}</div>
          <div class="ho__kpi-label">{{ t("home.ai.avgPerSession") }}</div>
        </div>
      </div>
      <div class="ho__charts">
        <div class="ho__panel">
          <div class="ho__panel-title">{{ t("home.ai.dailyTrend") }}</div>
          <div class="ho__chart-body" v-if="dailyOption"><ECharts :option="dailyOption" /></div>
          <el-empty v-else :description="t('home.status.noData')" :image-size="60" />
        </div>
        <div class="ho__panel">
          <div class="ho__panel-title">{{ t("home.ai.modelUsage") }}</div>
          <div class="ho__chart-body" v-if="modelUsageOption"><ECharts :option="modelUsageOption" /></div>
          <el-empty v-else :description="t('home.status.noData')" :image-size="60" />
        </div>
      </div>
    </section>

    <!-- ═══ Service performance + RAG + Infra ═══ -->
    <section class="ho__section">
      <div class="ho__grid">
        <div class="ho__panel">
          <div class="ho__panel-title">{{ t("home.services.title") }}</div>
          <div class="ho__services-kpis">
            <div class="ho__kpi">
              <div class="ho__kpi-value">{{ formatNumber(serviceStats?.total_calls) }}</div>
              <div class="ho__kpi-label">{{ t("home.services.totalCalls") }}</div>
            </div>
            <div class="ho__kpi">
              <div class="ho__kpi-value">{{ serviceStats ? Math.round(serviceStats.success_rate) : "—" }}%</div>
              <div class="ho__kpi-label">{{ t("home.services.successRate") }}</div>
            </div>
            <div class="ho__kpi">
              <div class="ho__kpi-value">{{ serviceStats?.avg_duration_ms ?? "—" }}<span class="ho__kpi-unit">ms</span></div>
              <div class="ho__kpi-label">{{ t("home.services.avgLatency") }}</div>
            </div>
          </div>
          <div class="ho__chart-body" v-if="serviceOption"><ECharts :option="serviceOption" /></div>
          <el-empty v-else :description="t('home.status.noData')" :image-size="60" />
        </div>

        <div class="ho__panel">
          <div class="ho__panel-title">{{ t("home.rag.title") }}</div>
          <div class="ho__rag">
            <div class="ho__rag-row">
              <span class="ho__rag-label">{{ t("home.rag.docs") }}</span>
              <span class="ho__rag-value">{{ formatNumber(ragStats?.num_docs) }}</span>
            </div>
            <div class="ho__rag-row">
              <span class="ho__rag-label">{{ t("home.rag.llmModel") }}</span>
              <span class="ho__rag-value">{{ ragStats?.config?.llm_model ?? "—" }}</span>
            </div>
            <div class="ho__rag-row">
              <span class="ho__rag-label">{{ t("home.rag.embedModel") }}</span>
              <span class="ho__rag-value">{{ ragStats?.config?.embed_model ?? "—" }}</span>
            </div>
            <div class="ho__rag-row">
              <span class="ho__rag-label">{{ t("home.rag.lastBuilt") }}</span>
              <span class="ho__rag-value">{{ ragStats?.last_built_at ? formatDate(ragStats.last_built_at) : "—" }}</span>
            </div>
          </div>
          <div class="ho__infra">
            <div class="ho__panel-title">{{ t("home.infra.title") }}</div>
            <div class="ho__infra-row">
              <span class="ho__infra-label">{{ t("home.infra.memory") }}</span>
              <el-progress :percentage="perf?.memory?.percent ?? 0" :stroke-width="8" class="ho__infra-bar" />
            </div>
            <div class="ho__infra-row">
              <span class="ho__infra-label">{{ t("home.infra.disk") }}</span>
              <el-progress :percentage="perf?.disk?.percent ?? 0" :stroke-width="8" class="ho__infra-bar" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Quick links ═══ -->
    <section class="ho__section">
      <div class="ho__section-head">
        <h2 class="ho__section-title">{{ t("home.quickLinks.title") }}</h2>
      </div>
      <div class="ho__quick-links">
        <el-button v-for="l in quickLinks" :key="l.to" size="small" @click="router.push(l.to)">
          {{ l.label }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="home">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Refresh, ChatDotRound, Aim } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import {
  getDashboardHealth,
  getAiStats,
  getServiceStats,
  getRagStats,
  getPerformance
} from "@/api/modules/dashboard";
import type {
  DashboardHealthData,
  AiStatsData,
  ServiceStatsData,
  RagStatsData,
  PerformanceData
} from "@/api/interface/yiweb";

const { t } = useI18n();
const router = useRouter();

// ═══════════════════════════════════════════════
// Live data
// ═══════════════════════════════════════════════
const health = ref<DashboardHealthData | null>(null);
const aiStats = ref<AiStatsData | null>(null);
const serviceStats = ref<ServiceStatsData | null>(null);
const ragStats = ref<RagStatsData | null>(null);
const perf = ref<PerformanceData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");

type Status = "ok" | "warn" | "off";
const dotTitle = (s: Status) => t(`home.status.${s === "ok" ? "online" : s === "warn" ? "disconnected" : "offline"}`);

function onProjectClick(to: string | null) {
  if (to) router.push(to);
}

async function fetchData() {
  loading.value = true;
  const results = await Promise.allSettled([
    getDashboardHealth(),
    getAiStats(),
    getServiceStats(),
    getRagStats(),
    getPerformance()
  ]);
  const [h, a, s, r, p] = results;
  health.value = h.status === "fulfilled" ? (h.value.data as DashboardHealthData) : health.value;
  aiStats.value = a.status === "fulfilled" ? (a.value.data as AiStatsData) : aiStats.value;
  serviceStats.value = s.status === "fulfilled" ? (s.value.data as ServiceStatsData) : serviceStats.value;
  ragStats.value = r.status === "fulfilled" ? (r.value.data as RagStatsData) : ragStats.value;
  perf.value = p.status === "fulfilled" ? (p.value.data as PerformanceData) : perf.value;
  lastUpdated.value = dayjs().format("HH:mm:ss");
  loading.value = false;
}

// ═══════════════════════════════════════════════
// Clock
// ═══════════════════════════════════════════════
const now = ref(Date.now());
const clock = computed(() => dayjs(now.value).format("YYYY-MM-DD HH:mm:ss"));

// ═══════════════════════════════════════════════
// Projects
// ═══════════════════════════════════════════════
const projects = computed(() => {
  const h = health.value;
  const ollamaOk = !!h?.ollama?.connected;
  const serverOk = !!h?.server?.running;
  const mongoOk = !!h?.mongodb?.connected;
  return [
    { key: "yiAi", icon: "🤖", to: "/aiChat", status: (ollamaOk ? "ok" : h ? "warn" : "off") as Status },
    { key: "yiVad", icon: "🖥️", to: null, status: (serverOk ? "ok" : h ? "warn" : "off") as Status },
    { key: "yiPet", icon: "🧩", to: null, status: "off" as Status },
    { key: "yiKnowledge", icon: "📚", to: "/pipeline", status: (mongoOk ? "ok" : h ? "warn" : "off") as Status }
  ];
});

// ═══════════════════════════════════════════════
// Harness capability seams (deepseek-harness → YiAi)
// ═══════════════════════════════════════════════
interface Seam {
  key: string;
  icon: string;
  value: string;
  status: Status;
  statusText: string;
}

const seams = computed<Seam[]>(() => {
  const h = health.value;
  const ollamaOk = !!h?.ollama?.connected;
  const mongoOk = !!h?.mongodb?.connected;
  const guardOn = !!h?.observer?.guard_enabled;
  const observerOn = h
    ? [h.observer.throttle_enabled, h.observer.sampler_enabled, h.observer.sandbox_enabled].filter(Boolean).length
    : 0;
  return [
    {
      key: "modelAdapter",
      icon: "🧠",
      value: h ? `${h.ollama.model_count}` : "—",
      status: ollamaOk ? "ok" : h ? "warn" : "off",
      statusText: ollamaOk ? t("home.status.connected") : h ? t("home.status.disconnected") : t("home.status.offline")
    },
    {
      key: "toolRegistry",
      icon: "🔧",
      value: "db_* × 5",
      status: "ok",
      statusText: t("home.status.ready")
    },
    {
      key: "confirmationGate",
      icon: "🛡️",
      value: guardOn ? "guard" : "—",
      status: guardOn ? "ok" : h ? "warn" : "off",
      statusText: guardOn ? t("home.status.enabled") : h ? t("home.status.disabled") : t("home.status.offline")
    },
    {
      key: "sessionLog",
      icon: "📜",
      value: h ? String(h.collections.sessions) : "—",
      status: mongoOk ? "ok" : h ? "warn" : "off",
      statusText: mongoOk ? t("home.status.ready") : h ? t("home.status.disconnected") : t("home.status.offline")
    },
    {
      key: "turnBudget",
      icon: "🎯",
      value: "max_turns",
      status: "ok",
      statusText: t("home.status.ready")
    },
    {
      key: "eventSurface",
      icon: "📡",
      value: `${observerOn}/3`,
      status: observerOn > 0 ? "ok" : h ? "warn" : "off",
      statusText: observerOn > 0 ? t("home.status.enabled") : h ? t("home.status.disabled") : t("home.status.offline")
    }
  ];
});

// ═══════════════════════════════════════════════
// Chart options
// ═══════════════════════════════════════════════
const PALETTE = ["#009688", "#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#9a60b4", "#3ba272", "#fc8452"];

const dailyOption = computed<ECOption | null>(() => {
  const daily = aiStats.value?.daily;
  if (!daily || !daily.length) return null;
  const sessionsLabel = t("home.health.sessions");
  return {
    tooltip: { trigger: "axis" },
    legend: { top: 0, data: [t("home.ai.messagesToday"), sessionsLabel] },
    grid: { left: 44, right: 16, top: 40, bottom: 28 },
    xAxis: { type: "category", data: daily.map(d => d.date.slice(5)) },
    yAxis: { type: "value", splitLine: { lineStyle: { opacity: 0.15 } } },
    series: [
      {
        name: sessionsLabel,
        type: "bar",
        barMaxWidth: 18,
        itemStyle: { color: "#5470c6", borderRadius: [3, 3, 0, 0] },
        data: daily.map(d => d.sessions)
      },
      {
        name: t("home.ai.messagesToday"),
        type: "line",
        smooth: true,
        itemStyle: { color: "#009688" },
        lineStyle: { color: "#009688", width: 2.5 },
        data: daily.map(d => d.messages)
      }
    ]
  };
});

const modelUsageOption = computed<ECOption | null>(() => {
  const usage = aiStats.value?.model_usage;
  if (!usage || !usage.length) return null;
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, type: "scroll" },
    series: [
      {
        type: "pie",
        radius: ["42%", "66%"],
        center: ["50%", "46%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: "transparent", borderWidth: 2 },
        label: { show: false },
        data: usage.map((u, i) => ({
          name: u.model,
          value: u.count,
          itemStyle: { color: PALETTE[i % PALETTE.length] }
        }))
      }
    ]
  };
});

const serviceOption = computed<ECOption | null>(() => {
  const byService = serviceStats.value?.by_service;
  if (!byService || !byService.length) return null;
  const grouped = new Map<string, { success: number; failed: number }>();
  for (const s of byService) {
    const g = grouped.get(s.service) ?? { success: 0, failed: 0 };
    g.success += s.success;
    g.failed += s.failed;
    grouped.set(s.service, g);
  }
  const entries = [...grouped.entries()].slice(0, 10);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { top: 0 },
    grid: { left: 90, right: 20, top: 32, bottom: 24 },
    xAxis: { type: "value", splitLine: { lineStyle: { opacity: 0.15 } } },
    yAxis: { type: "category", data: entries.map(([name]) => name) },
    series: [
      {
        name: "success",
        type: "bar",
        stack: "total",
        barMaxWidth: 16,
        itemStyle: { color: "#91cc75" },
        data: entries.map(([, v]) => v.success)
      },
      {
        name: "failed",
        type: "bar",
        stack: "total",
        barMaxWidth: 16,
        itemStyle: { color: "#ee6666" },
        data: entries.map(([, v]) => v.failed)
      }
    ]
  };
});

// ═══════════════════════════════════════════════
// Quick links
// ═══════════════════════════════════════════════
const quickLinks = computed(() => [
  { to: "/aiChat", label: t("home.quickLinks.aiChat") },
  { to: "/pipeline", label: t("home.quickLinks.pipeline") },
  { to: "/skills", label: t("home.quickLinks.skills") },
  { to: "/rag", label: t("home.quickLinks.rag") },
  { to: "/executiver/rss", label: t("home.quickLinks.rss") },
  { to: "/executiver/okr", label: t("home.quickLinks.okr") }
]);

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════
function formatNumber(v?: number): string {
  return v == null ? "—" : v.toLocaleString();
}

function formatDate(v: string): string {
  const d = dayjs(v);
  return d.isValid() ? d.format("YYYY-MM-DD HH:mm") : v;
}

// ═══════════════════════════════════════════════
// Lifecycle
// ═══════════════════════════════════════════════
let clockTimer: ReturnType<typeof setInterval> | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  fetchData();
  clockTimer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
  refreshTimer = setInterval(fetchData, 30_000);
});

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
.harness-overview {
  box-sizing: border-box;
  min-height: 100%;
  padding: 20px 24px 32px;
  background: var(--el-bg-color-page);
}

// ── Header ─────────────────────────────────────
.ho__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 22px;
}
.ho__header-title { display: flex; flex-direction: column; gap: 2px; }
.ho__title { margin: 0; font-size: 22px; font-weight: 700; }
.ho__subtitle { font-size: 12px; color: var(--el-text-color-secondary); }
.ho__header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ho__updated { font-size: 12px; color: var(--el-text-color-placeholder); }
.ho__clock { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); font-family: monospace; }

// ── Section ────────────────────────────────────
.ho__section { margin-bottom: 22px; }
.ho__section-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
.ho__section-title { margin: 0; font-size: 16px; font-weight: 700; }
.ho__section-desc { font-size: 12px; color: var(--el-text-color-placeholder); }

// ── Status dot ─────────────────────────────────
.ho__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  &.is-ok { background: var(--el-color-success); box-shadow: 0 0 0 3px var(--el-color-success-light-8); }
  &.is-warn { background: var(--el-color-warning); box-shadow: 0 0 0 3px var(--el-color-warning-light-8); }
  &.is-off { background: var(--el-color-info); opacity: 0.5; }
}

// ── Projects ───────────────────────────────────
.ho__projects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.ho__project {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
  &.ho__project--link { cursor: pointer; }
  &.ho__project--link:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
}
.ho__project-icon { font-size: 26px; flex-shrink: 0; }
.ho__project-body { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.ho__project-name { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.ho__project-current {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 6px;
  border-radius: 4px;
}
.ho__project-role {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

// ── Seams ──────────────────────────────────────
.ho__seams {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.ho__seam {
  padding: 14px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid var(--el-color-primary);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ho__seam-head { display: flex; align-items: center; gap: 8px; }
.ho__seam-icon { font-size: 18px; }
.ho__seam-name { font-size: 13px; font-weight: 700; flex: 1; }
.ho__seam-mapping {
  font-size: 11px;
  font-family: monospace;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ho__seam-foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.ho__seam-value { font-size: 18px; font-weight: 700; color: var(--el-text-color-primary); }
.ho__seam-status {
  font-size: 11px;
  font-weight: 600;
  &.is-ok { color: var(--el-color-success); }
  &.is-warn { color: var(--el-color-warning); }
  &.is-off { color: var(--el-color-info); }
}

// ── KPI + panels ───────────────────────────────
.ho__kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.ho__kpi {
  padding: 14px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.ho__kpi-value { font-size: 22px; font-weight: 700; line-height: 1.2; }
.ho__kpi-unit { font-size: 12px; font-weight: 500; color: var(--el-text-color-secondary); margin-left: 2px; }
.ho__kpi-label { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 3px; }

.ho__charts {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 14px;
}
.ho__grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 14px;
}
.ho__panel {
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.ho__panel-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; }
.ho__chart-body { height: 280px; }

.ho__services-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

// ── RAG + Infra ────────────────────────────────
.ho__rag { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
.ho__rag-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; }
.ho__rag-label { color: var(--el-text-color-secondary); }
.ho__rag-value { font-weight: 600; color: var(--el-text-color-primary); text-align: right; }

.ho__infra { border-top: 1px solid var(--el-border-color-lighter); padding-top: 14px; }
.ho__infra-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.ho__infra-label { font-size: 12px; color: var(--el-text-color-secondary); width: 56px; flex-shrink: 0; }
.ho__infra-bar { flex: 1; }

// ── Quick links ────────────────────────────────
.ho__quick-links { display: flex; flex-wrap: wrap; gap: 8px; }

// ── Responsive ─────────────────────────────────
@media (width <= 1100px) {
  .ho__charts,
  .ho__grid { grid-template-columns: 1fr; }
}
</style>
