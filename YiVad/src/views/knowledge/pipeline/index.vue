<template>
  <div class="pipeline page">
    <!-- Header -->
    <header class="pipeline__header">
      <div class="pipeline__header-row">
        <div>
          <h1 class="pipeline__title">{{ $t("knowledge.pipeline.title") }}</h1>
          <p class="pipeline__subtitle">{{ $t("knowledge.pipeline.subtitle") }}</p>
        </div>
        <div class="pipeline__header-actions">
          <span v-if="lastScanText" class="pipeline__refresh-hint" :class="{ 'is-stale': isScanStale }">
            <el-icon :size="14"><Timer /></el-icon>
            {{ lastScanText }}
          </span>
          <span v-if="lastRefreshText" class="pipeline__refresh-hint" :class="{ 'is-refreshing': refreshing }">
            {{ lastRefreshText }}
          </span>
          <el-button :loading="refreshing" text size="small" @click="refreshData">
            <el-icon :size="16"><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
    </header>

    <!-- Loading skeleton -->
    <template v-if="!statsReady && loading">
      <div class="pipeline__skeleton-stats">
        <el-skeleton v-for="i in 4" :key="i" animated style="width:100%">
          <template #template>
            <div class="pipeline__skeleton-stat">
              <el-skeleton-item variant="circle" style="width:40px;height:40px" />
              <div class="pipeline__skeleton-stat-text">
                <el-skeleton-item variant="text" style="width:60px;height:20px" />
                <el-skeleton-item variant="text" style="width:90px;height:14px" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <div class="pipeline__skeleton-cards">
        <el-skeleton v-for="i in 7" :key="'sk'+i" animated>
          <template #template>
            <el-skeleton-item variant="rect" style="width:100%;height:200px;border-radius:8px" />
          </template>
        </el-skeleton>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <!-- Stats overview -->
      <div class="pipeline__overview">
        <div class="pipeline__stat-card" v-for="stat in overviewStats" :key="stat.key">
          <div class="pipeline__stat-icon" :style="{ background: stat.gradient }">
            <el-icon :size="18"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="pipeline__stat-body">
            <span class="pipeline__stat-value">{{ stat.value }}</span>
            <span class="pipeline__stat-label">{{ stat.label }}</span>
          </div>
          <span v-if="stat.sub" class="pipeline__stat-sub" :class="stat.subClass">{{ stat.sub }}</span>
        </div>
      </div>

      <!-- Cross-cutting layers -->
      <section class="pipeline__section">
        <h2 class="pipeline__section-title">
          <span class="pipeline__section-icon">▦</span>
          {{ t("knowledge.pipeline.section.layers") }}
        </h2>
        <div class="pipeline__layers">
          <div
            v-for="layer in enrichedLayers"
            :key="layer.id"
            class="pipeline__layer-card"
            :style="{ borderTopColor: layerColors[layer.id] }"
            @click="goToStage(layer.id)"
          >
            <div class="pipeline__card-top">
              <div class="pipeline__card-icon" :style="{ background: layerColors[layer.id] }">
                {{ layer.icon }}
              </div>
              <div class="pipeline__card-head">
                <h3 class="pipeline__card-name">{{ layer.label }}</h3>
                <span class="pipeline__card-role" @click.stop="previewRole(layer.role)">{{ layer.role }}</span>
              </div>
            </div>
            <p class="pipeline__card-desc">{{ layer.description }}</p>
            <div class="pipeline__card-flow">
              <template v-if="layer.outputItems.length">
                <span
                  v-for="item in layer.outputItems.slice(0, 3)"
                  :key="item.id"
                  class="pipeline__chip pipeline__chip--output"
                  @click.stop="previewRole(layer.role)"
                >{{ item.label }}</span>
                <span v-if="layer.outputItems.length > 3" class="pipeline__chip-more">+{{ layer.outputItems.length - 3 }}</span>
              </template>
            </div>
            <div class="pipeline__card-meta">
              <span class="pipeline__meta-item" :class="healthClass(stageStats(layer.category).health)">
                <span class="pipeline__meta-dot"></span>
                {{ stageStats(layer.category).count }} {{ t("knowledge.pipeline.filesLabel") }}
              </span>
              <span v-if="stageStats(layer.category).stale > 0" class="pipeline__meta-item is-stale">
                {{ stageStats(layer.category).stale }} {{ t("knowledge.pipeline.staleLabel") }}
              </span>
              <span class="pipeline__meta-item is-time">{{ stageStats(layer.category).lastUpdated || "--" }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Pipeline stages -->
      <section class="pipeline__section">
        <h2 class="pipeline__section-title">
          <span class="pipeline__section-icon">→</span>
          {{ t("knowledge.pipeline.section.stages") }}
        </h2>
        <div class="pipeline__stages">
          <div
            v-for="(stage, i) in enrichedStages"
            :key="stage.id"
            class="pipeline__stage-wrap"
          >
            <!-- Connector arrow -->
            <div v-if="i > 0" class="pipeline__stage-arrow">
              <svg width="28" height="24" viewBox="0 0 28 24">
                <defs>
                  <linearGradient :id="'arrow-grad-' + i" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" :stop-color="stageColors[enrichedStages[i-1].id]" />
                    <stop offset="100%" :stop-color="stageColors[stage.id]" />
                  </linearGradient>
                </defs>
                <path
d="M2 12 L18 12 M14 7 L20 12 L14 17"
                  fill="none"
                  :stroke="'url(#arrow-grad-' + i + ')'"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>

            <div
              class="pipeline__stage-card"
              :style="{ borderTopColor: stageColors[stage.id] }"
              @click="goToStage(stage.id)"
            >
              <div class="pipeline__card-top">
                <div class="pipeline__card-num" :style="{ background: stageColors[stage.id] }">
                  {{ i + 1 }}
                </div>
                <div class="pipeline__card-head">
                  <h3 class="pipeline__card-name">{{ stage.name }}</h3>
                  <span class="pipeline__card-role" @click.stop="previewRole(stage.role)">{{ stage.role }}</span>
                </div>
                <div class="pipeline__card-health">
                  <el-tooltip :content="stageHealthTooltip(stageStats(stage.category))" placement="top">
                    <div class="pipeline__health-ring" :class="healthClass(stageStats(stage.category).health)">
                      <svg width="36" height="36" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--el-border-color-lighter)" stroke-width="3" />
                        <circle
                          cx="18" cy="18" r="14"
                          fill="none"
                          :stroke="healthColor(stageStats(stage.category).health)"
                          stroke-width="3"
                          stroke-linecap="round"
                          :stroke-dasharray="88"
                          :stroke-dashoffset="88 - (88 * healthPct(stageStats(stage.category).health)) / 100"
                          transform="rotate(-90 18 18)"
                          style="transition: stroke-dashoffset 0.6s ease"
                        />
                      </svg>
                      <span class="pipeline__health-val">{{ healthPct(stageStats(stage.category).health) }}%</span>
                    </div>
                  </el-tooltip>
                </div>
              </div>

              <p class="pipeline__card-desc">{{ stage.description }}</p>

              <div class="pipeline__card-flow">
                <template v-if="stage.inputItems.length">
                  <span
                    v-for="item in stage.inputItems.slice(0, 2)"
                    :key="item.id"
                    class="pipeline__chip pipeline__chip--input"
                    @click.stop="previewRole(stage.role)"
                  >{{ item.label }}</span>
                  <svg class="pipeline__chip-arrow" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M3 8 L11 8 M8 4 L12 8 L8 12" fill="none" stroke="var(--el-text-color-placeholder)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </template>
                <span
                  v-for="item in stage.outputItems.slice(0, 3)"
                  :key="item.id"
                  class="pipeline__chip pipeline__chip--output"
                  @click.stop="previewRole(stage.role)"
                >{{ item.label }}</span>
                <span v-if="stage.outputItems.length > 3" class="pipeline__chip-more">+{{ stage.outputItems.length - 3 }}</span>
              </div>

              <div class="pipeline__card-topics">
                <span
                  v-for="topic in stage.topics.slice(0, 4)"
                  :key="topic.file"
                  class="pipeline__topic"
                  @click.stop="goToStage(stage.id)"
                >{{ topic.label }}</span>
                <span v-if="stage.topics.length > 4" class="pipeline__chip-more">+{{ stage.topics.length - 4 }}</span>
              </div>

              <div class="pipeline__card-meta">
                <span class="pipeline__meta-item" :class="healthClass(stageStats(stage.category).health)">
                  <span class="pipeline__meta-dot"></span>
                  {{ stageStats(stage.category).count }} {{ t("knowledge.pipeline.filesLabel") }}
                </span>
                <span v-if="stageStats(stage.category).stale > 0" class="pipeline__meta-item is-stale">
                  {{ stageStats(stage.category).stale }} {{ t("knowledge.pipeline.staleLabel") }}
                </span>
                <span v-if="stageStats(stage.category).tacit > 0" class="pipeline__meta-item is-tacit">
                  {{ stageStats(stage.category).tacit }} {{ t("knowledge.pipeline.tacitLabel") }}
                </span>
                <span class="pipeline__meta-item is-time">{{ stageStats(stage.category).lastUpdated || "--" }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Decision tree -->
      <section class="pipeline__section">
        <h2 class="pipeline__section-title">
          <span class="pipeline__section-icon">?</span>
          {{ t("knowledge.pipeline.decision.title") }}
        </h2>
        <p class="pipeline__section-sub">{{ t("knowledge.pipeline.decision.subtitle") }}</p>
        <div class="pipeline__decision-grid">
          <div
            v-for="(rule, i) in decisionRules"
            :key="i"
            class="pipeline__decision-item"
            @click="goToDecisionRole(i)"
          >
            <span class="pipeline__decision-num" :style="{ background: decisionColors[i] }">{{ i + 1 }}</span>
            <span class="pipeline__decision-q">{{ rule.question }}</span>
            <svg class="pipeline__decision-arrow" width="20" height="20" viewBox="0 0 20 20">
              <line x1="2" y1="10" x2="14" y2="10" :stroke="decisionColors[i]" stroke-width="1.5" />
              <polyline points="10,5 16,10 10,15" fill="none" :stroke="decisionColors[i]" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="pipeline__decision-role">{{ rule.role }}</span>
          </div>
        </div>
      </section>

      <!-- Data distribution -->
      <section v-if="knowledgeData?.size_distribution?.length || knowledgeData?.age_distribution?.length" class="pipeline__section">
        <h2 class="pipeline__section-title">
          <span class="pipeline__section-icon">|</span>
          {{ t("knowledge.pipeline.distribution.title") }}
        </h2>
        <div class="pipeline__dist-grid">
          <div v-if="knowledgeData?.size_distribution?.length" class="pipeline__dist-panel">
            <h4 class="pipeline__dist-heading">{{ t("knowledge.pipeline.distribution.size") }}</h4>
            <div class="pipeline__dist-bars">
              <div
                v-for="item in knowledgeData.size_distribution"
                :key="item.label"
                class="pipeline__dist-row"
              >
                <span class="pipeline__dist-label">{{ item.label }}</span>
                <div class="pipeline__dist-track">
                  <div
                    class="pipeline__dist-fill"
                    :style="{ width: sizeDistPct(item.count) + '%' }"
                  ></div>
                </div>
                <span class="pipeline__dist-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
          <div v-if="knowledgeData?.age_distribution?.length" class="pipeline__dist-panel">
            <h4 class="pipeline__dist-heading">{{ t("knowledge.pipeline.distribution.age") }}</h4>
            <div class="pipeline__dist-bars">
              <div
                v-for="item in knowledgeData.age_distribution"
                :key="item.label"
                class="pipeline__dist-row"
              >
                <span class="pipeline__dist-label">{{ item.label }}</span>
                <div class="pipeline__dist-track">
                  <div
                    class="pipeline__dist-fill pipeline__dist-fill--age"
                    :style="{ width: ageDistPct(item.count) + '%' }"
                  ></div>
                </div>
                <span class="pipeline__dist-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="pipelineHub">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Timer, Refresh, Document, CircleCheck, WarningFilled } from "@element-plus/icons-vue";
import { stages, crossCuttingLayers } from "./constants";
import type { Stage, CrossCuttingLayer, DecisionRule } from "./constants";
import { getKnowledgeStats } from "@/api/modules/dashboard";
import type { KnowledgeStatsData } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

const { t, te } = useI18n();
const router = useRouter();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const AUTO_REFRESH_MS = 60_000;

// ── State ──
const knowledgeData = ref<KnowledgeStatsData | null>(null);
const loading = ref(true);
const statsReady = ref(false);
const refreshing = ref(false);
const lastRefresh = ref<number>(0);
const refreshTimer = ref<ReturnType<typeof setInterval> | null>(null);

// ── Colors ──
const layerColors: Record<string, string> = {
  business: "#6366f1",
  ai: "#22c55e",
  governance: "#f59e0b"
};

const stageColors: Record<string, string> = {
  requirements: "#409eff",
  decisions: "#7c3aed",
  "design-build": "#10b981",
  "quality-release": "#f59e0b"
};

const decisionColors = ["#6366f1", "#409eff", "#7c3aed", "#10b981", "#f59e0b", "#22c55e", "#ec4899"];

// ── Data fetching ──
async function fetchData() {
  try {
    refreshing.value = true;
    const res = await getKnowledgeStats();
    knowledgeData.value = res.data;
    lastRefresh.value = Date.now();
    statsReady.value = true;
  } catch {
    // Keep stale data if available
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function refreshData() {
  fetchData();
}

// ── Per-category stats derived from knowledgeData (single pass) ──
interface CategoryStats {
  count: number;
  stale: number;
  tacit: number;
  health: "good" | "warn" | "poor";
  lastUpdated: string;
  lastUpdatedAgo: number;
}

function reviewCycleDays(cycle: string): number {
  const map: Record<string, number> = {
    weekly: 7, monthly: 30, quarterly: 90,
    "half-yearly": 180, "semi-annual": 180, yearly: 365
  };
  return map[cycle] ?? 0;
}

function computeAllCategoryStats(): Record<string, CategoryStats> {
  const acc: Record<string, { count: number; stale: number; tacit: number; mostRecent: number }> = {};
  const now = Date.now();
  for (const f of knowledgeData.value?.files ?? []) {
    const cat = f.category || "__unknown__";
    if (!acc[cat]) acc[cat] = { count: 0, stale: 0, tacit: 0, mostRecent: 0 };
    const s = acc[cat];
    s.count++;
    if (f.tacit) s.tacit++;
    if (f.updated) {
      const t = new Date(f.updated).getTime();
      if (t > s.mostRecent) s.mostRecent = t;
      const cycleDays = reviewCycleDays(f.review_cycle);
      if (cycleDays > 0 && (now - t) / 86400000 > cycleDays) s.stale++;
    }
  }
  const out: Record<string, CategoryStats> = {};
  for (const [cat, s] of Object.entries(acc)) {
    const staleRatio = s.count ? s.stale / s.count : 0;
    const daysSince = s.mostRecent ? (now - s.mostRecent) / 86400000 : Infinity;
    let health: CategoryStats["health"] = "good";
    if (s.count === 0) health = "poor";
    else if (staleRatio > 0.4) health = "poor";
    else if (staleRatio > 0.2 || daysSince > 90) health = "warn";
    out[cat] = {
      count: s.count, stale: s.stale, tacit: s.tacit, health,
      lastUpdated: s.mostRecent ? formatRelativeTime(s.mostRecent) : "--",
      lastUpdatedAgo: daysSince
    };
  }
  return out;
}

const stageStatsCache = reactive<Record<string, CategoryStats>>({});
function stageStats(category: string): CategoryStats {
  if (!stageStatsCache[category]) {
    Object.assign(stageStatsCache, computeAllCategoryStats());
  }
  return stageStatsCache[category] ?? { count: 0, stale: 0, tacit: 0, health: "poor", lastUpdated: "--", lastUpdatedAgo: Infinity };
}

// ── Health indicators ──
function healthClass(health: string): string {
  return `is-${health}`;
}

function healthColor(health: string): string {
  return { good: "#22c55e", warn: "#f59e0b", poor: "#ef4444" }[health] ?? "#c0c4cc";
}

function healthPct(health: string): number {
  return { good: 100, warn: 65, poor: 25 }[health] ?? 0;
}

function stageHealthTooltip(s: CategoryStats): string {
  const files = t("knowledge.pipeline.filesLabel");
  const staleLabel = t("knowledge.pipeline.staleLabel");
  const tacitLabel = t("knowledge.pipeline.tacitLabel");
  return `${s.count} ${files}, ${s.stale} ${staleLabel}, ${s.tacit} ${tacitLabel} · ${s.lastUpdated}`;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("knowledge.pipeline.time.justNow");
  if (mins < 60) return t("knowledge.pipeline.time.minAgo", { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("knowledge.pipeline.time.hourAgo", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("knowledge.pipeline.time.dayAgo", { n: days });
  return t("knowledge.pipeline.time.longAgo");
}

// ── Last refresh text ──
const lastRefreshText = computed(() => {
  if (!lastRefresh.value) return "";
  const diff = Date.now() - lastRefresh.value;
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return t("knowledge.pipeline.time.justNow");
  if (secs < 60) return t("knowledge.pipeline.time.secAgo", { n: secs });
  const mins = Math.floor(secs / 60);
  return t("knowledge.pipeline.time.minAgo", { n: mins });
});

// ── Last scan time (from watcher, not UI refresh) ──
const SCAN_STALE_MS = 5 * 60 * 1000;

const lastScanText = computed(() => {
  const ts = knowledgeData.value?.last_scan_time;
  if (!ts) return "";
  const ago = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(ago / 60000);
  if (mins < 1) return t("knowledge.pipeline.time.justNow");
  if (mins < 60) return t("knowledge.pipeline.time.minAgo", { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("knowledge.pipeline.time.hourAgo", { n: hours });
  return t("knowledge.pipeline.time.dayAgo", { n: Math.floor(hours / 24) });
});

const isScanStale = computed(() => {
  const ts = knowledgeData.value?.last_scan_time;
  if (!ts) return false;
  return Date.now() - new Date(ts).getTime() > SCAN_STALE_MS;
});

// ── Overview stats ──
const overviewStats = computed(() => {
  const d = knowledgeData.value;
  if (!d) return [];
  const totalFiles = d.total ?? 0;
  const dataQuality = d.data_quality;
  const completePct = dataQuality?.total
    ? Math.round((dataQuality.complete / dataQuality.total) * 100)
    : 0;
  const staleCount = d.health?.stale_count ?? 0;
  const reviewCov = d.health?.review_coverage_pct ?? 0;
  const eligible = d.health?.eligible_count ?? 0;
  const orphanCount = d.health?.orphan_count ?? 0;
  const unmaintainedCount = d.health?.unmaintained_count ?? 0;
  const lastScan = d.last_scan_time || "";

  return [
    {
      key: "files",
      icon: Document,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      value: totalFiles,
      label: t("knowledge.pipeline.overview.files"),
      sub: `${d.categories?.length ?? 0} ${t("knowledge.pipeline.overview.roles")}`,
      subClass: ""
    },
    {
      key: "quality",
      icon: CircleCheck,
      gradient: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
      value: `${completePct}%`,
      label: t("knowledge.pipeline.overview.quality"),
      sub: dataQuality ? `${dataQuality.complete}/${dataQuality.total} ${t("knowledge.pipeline.overview.complete")}` : "",
      subClass: completePct >= 80 ? "is-good" : completePct >= 50 ? "is-warn" : "is-poor"
    },
    {
      key: "stale",
      icon: WarningFilled,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      value: staleCount,
      label: t("knowledge.pipeline.overview.stale"),
      sub: staleCount > 0
        ? `${t("knowledge.pipeline.overview.needsReview")}${orphanCount > 0 ? ` · ${orphanCount} ${t("knowledge.pipeline.overview.orphan")}` : ""}`
        : t("knowledge.pipeline.overview.allFresh"),
      subClass: staleCount > 10 ? "is-poor" : staleCount > 0 ? "is-warn" : "is-good"
    },
    {
      key: "review",
      icon: CircleCheck,
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      value: `${reviewCov}%`,
      label: t("knowledge.pipeline.overview.reviewCoverage"),
      sub: `${eligible} ${t("knowledge.pipeline.overview.files")}${unmaintainedCount > 0 ? ` · ${unmaintainedCount} ${t("knowledge.pipeline.overview.unmaintained")}` : ""}`,
      subClass: reviewCov >= 80 ? "is-good" : reviewCov >= 50 ? "is-warn" : "is-poor"
    },
    {
      key: "scan",
      icon: Timer,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      value: lastScan ? formatRelativeTime(new Date(lastScan).getTime()) : "--",
      label: t("knowledge.pipeline.overview.lastScan"),
      sub: lastScan ? new Date(lastScan).toLocaleTimeString() : "",
      subClass: isScanStale.value ? "is-warn" : "is-good"
    }
  ];
});

// ── Distribution helpers ──
function maxDistCount(items: { count: number }[]): number {
  return Math.max(1, ...items.map(i => i.count));
}

function sizeDistPct(count: number): number {
  const max = maxDistCount(knowledgeData.value?.size_distribution ?? []);
  return max ? Math.round((count / max) * 100) : 0;
}

function ageDistPct(count: number): number {
  const max = maxDistCount(knowledgeData.value?.age_distribution ?? []);
  return max ? Math.round((count / max) * 100) : 0;
}

// ── I18n helper ──
function tl(key: string, fallback: string): string {
  return te(key) ? t(key) : fallback;
}

// ── Enriched stages/layers with i18n ──
const enrichedStages = computed<Stage[]>(() =>
  stages.map(s => {
    const prefix = `knowledge.pipeline.stagesDetail.${s.id}`;
    return { ...s, name: tl(`${prefix}.name`, s.name), role: tl(`${prefix}.role`, s.role), description: tl(`${prefix}.description`, s.description), boundary: tl(`${prefix}.boundary`, s.boundary) };
  })
);

const enrichedLayers = computed<CrossCuttingLayer[]>(() => {
  const idToDetail: Record<string, string> = { business: "businessDetail", ai: "aiDetail", governance: "governanceDetail" };
  return crossCuttingLayers.map(l => {
    const prefix = `knowledge.pipeline.stagesDetail.${idToDetail[l.id] ?? l.id}`;
    return { ...l, label: tl(`${prefix}.label`, l.label), role: tl(`${prefix}.role`, l.role), desc: tl(`${prefix}.desc`, l.desc), description: tl(`${prefix}.description`, l.description), boundary: tl(`${prefix}.boundary`, l.boundary) };
  });
});

// ── Decision tree ──
const DECISION_RULE_KEYS = ["business", "product", "leader", "engineer", "sre", "ai", "curator"] as const;
const DECISION_ROLE_KEYS = ["executive", "product", "leader", "engineer", "sre", "aier", "curator"] as const;
const DECISION_ROUTES = ["/executive", "/product", "/leader", "/engineer", "/sre", "/aier", "/curator"];
const FALLBACK_QUESTIONS = [
  "Business strategy, market, competitors?",
  "Product requirements, user stories, priorities?",
  "Technical decisions, architecture choices, ADRs?",
  "Implementation patterns, dev tools, code?",
  "Release procedures, monitoring, incident response?",
  "AI/ML-specific theory and practice?",
  "The KB's own structure and rules?"
];
const FALLBACK_ROLES = ["executive/", "product/", "leader/", "engineer/", "sre/", "aier/", "curator/"];

const decisionRules = computed<DecisionRule[]>(() => {
  const out: DecisionRule[] = [];
  for (let i = 0; i < 7; i++) {
    out.push({
      question: tl(`knowledge.pipeline.decision.rules.${DECISION_RULE_KEYS[i]}`, FALLBACK_QUESTIONS[i]),
      role: tl(`knowledge.pipeline.decision.roles.${DECISION_ROLE_KEYS[i]}`, FALLBACK_ROLES[i])
    });
  }
  return out;
});

function goToDecisionRole(i: number) {
  if (i < DECISION_ROUTES.length) router.push({ path: DECISION_ROUTES[i] });
}

// ── Navigation ──
const stageIdToRoute: Record<string, string> = {
  requirements: "/product",
  decisions: "/leader",
  "design-build": "/engineer",
  "quality-release": "/sre",
  business: "/executive",
  ai: "/aier",
  governance: "/curator"
};

function goToStage(stageId: string) {
  const route = stageIdToRoute[stageId];
  if (route) router.push({ path: route });
}

function resolveRolePath(role: string): string {
  const first = role.split(/[+\s]+/)[0].replace(/\/$/, "");
  const base = first.split("/")[0];
  return `${base}/README.md`;
}

function previewRole(role: string) {
  previewDlg.value?.open(resolveRolePath(role));
}

// ── Refresh cache when data changes ──
function invalidateCache() {
  for (const k of Object.keys(stageStatsCache)) {
    delete stageStatsCache[k];
  }
}

// ── Lifecycle ──
onMounted(async () => {
  await fetchData();
  refreshTimer.value = setInterval(async () => {
    invalidateCache();
    await fetchData();
  }, AUTO_REFRESH_MS);
});

onBeforeUnmount(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
});
</script>

<style scoped lang="scss">
// ── Variables ──
$card-radius: 10px;
$gap-sm: 10px;
$gap-md: 14px;
$gap-lg: 18px;

.pipeline {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: $gap-lg;
  padding: 20px 24px 32px;
  background: var(--el-bg-color-page);
  min-height: 100%;
}

// ── Header ──
.pipeline__header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.pipeline__title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--el-text-color-primary);
}
.pipeline__subtitle {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  max-width: 640px;
}
.pipeline__header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.pipeline__refresh-hint {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  transition: color 0.2s;
  &.is-refreshing {
    color: var(--el-color-primary);
  }
  &.is-stale {
    color: #f59e0b;
  }
}

// ── Skeleton ──
.pipeline__skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: $gap-md;
}
.pipeline__skeleton-stat {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: $card-radius;
}
.pipeline__skeleton-stat-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.pipeline__skeleton-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $gap-md;
}

// ── Overview stats ──
.pipeline__overview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: $gap-md;
}
.pipeline__stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: var(--el-bg-color);
  border-radius: $card-radius;
  border: 1px solid var(--el-border-color-lighter);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}
.pipeline__stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #fff;
  flex-shrink: 0;
}
.pipeline__stat-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.pipeline__stat-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pipeline__stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
.pipeline__stat-sub {
  font-size: 11px;
  white-space: nowrap;
  color: var(--el-text-color-placeholder);
  &.is-good { color: #22c55e; }
  &.is-warn { color: #f59e0b; }
  &.is-poor { color: #ef4444; }
}

// ── Section ──
.pipeline__section {
  display: flex;
  flex-direction: column;
  gap: $gap-sm;
}
.pipeline__section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.pipeline__section-icon {
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 700;
}
.pipeline__section-sub {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

// ── Layer cards ──
.pipeline__layers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: $gap-md;
}

// ── Stage flow ──
.pipeline__stages {
  display: flex;
  gap: 2px;
  align-items: stretch;
  overflow-x: auto;
  padding: 4px 0;
}
.pipeline__stage-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1 1 0;
}
.pipeline__stage-arrow {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 1px;
}

// ── Cards (shared) ──
.pipeline__layer-card,
.pipeline__stage-card {
  width: 100%;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-top: 3px solid;
  border-radius: $card-radius;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.pipeline__card-top {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}
.pipeline__card-icon,
.pipeline__card-num {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  border-radius: 50%;
}
.pipeline__card-head {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  flex: 1;
}
.pipeline__card-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.pipeline__card-role {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  text-decoration: underline dashed transparent;
  transition: text-decoration-color 0.15s;
  &:hover {
    text-decoration-color: currentColor;
  }
}
.pipeline__card-desc {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--el-text-color-regular);
}

// ── Health ring ──
.pipeline__card-health {
  position: relative;
  flex-shrink: 0;
}
.pipeline__health-ring {
  position: relative;
  width: 36px;
  height: 36px;
  svg { display: block; }
}
.pipeline__health-val {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

// ── Flow chips ──
.pipeline__card-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  margin-bottom: 8px;
}
.pipeline__chip {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid;
  transition: all 0.15s ease;
  &:hover { transform: translateY(-1px); }
  &--input {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
  }
  &--output {
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color-lighter);
  }
}
.pipeline__chip-arrow {
  flex-shrink: 0;
  margin: 0 1px;
}
.pipeline__chip-more {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

// ── Topics ──
.pipeline__card-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}
.pipeline__topic {
  padding: 2px 6px;
  font-size: 11px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: var(--el-fill-color-light);
  }
}

// ── Card meta ──
.pipeline__card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.pipeline__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  &.is-good {
    background: #f0fdf4;
    color: #15803d;
  }
  &.is-warn {
    background: #fefce8;
    color: #a16207;
  }
  &.is-poor {
    background: #fef2f2;
    color: #dc2626;
  }
  &.is-stale {
    background: #fef2f2;
    color: #dc2626;
  }
  &.is-tacit {
    background: #fdf4ff;
    color: #a21caf;
  }
  &.is-time {
    background: transparent;
    color: var(--el-text-color-placeholder);
    padding-left: 0;
  }
}
.pipeline__meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

// ── Decision tree ──
.pipeline__decision-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 6px;
}
.pipeline__decision-item {
  display: grid;
  grid-template-columns: 28px 1fr 28px max-content;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
    transform: translateX(2px);
  }
}
.pipeline__decision-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  width: 22px;
  height: 22px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  border-radius: 50%;
}
.pipeline__decision-q {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}
.pipeline__decision-arrow {
  justify-self: center;
}
.pipeline__decision-role {
  padding: 2px 8px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 11px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 4px;
  text-align: center;
}

// ── Data distribution ──
.pipeline__dist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $gap-md;
}
.pipeline__dist-panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: $card-radius;
  padding: 16px 18px;
}
.pipeline__dist-heading {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.pipeline__dist-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pipeline__dist-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pipeline__dist-label {
  width: 64px;
  font-size: 11px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  color: var(--el-text-color-secondary);
  text-align: right;
  flex-shrink: 0;
}
.pipeline__dist-track {
  flex: 1;
  height: 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 7px;
  overflow: hidden;
}
.pipeline__dist-fill {
  height: 100%;
  border-radius: 7px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  min-width: 2px;
  transition: width 0.5s ease;
  &--age {
    background: linear-gradient(90deg, #22c55e 0%, #10b981 100%);
  }
}
.pipeline__dist-count {
  width: 32px;
  font-size: 11px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  color: var(--el-text-color-secondary);
  text-align: left;
  flex-shrink: 0;
}

// ── Responsive ──
@media (max-width: 768px) {
  .pipeline__overview {
    grid-template-columns: repeat(2, 1fr);
  }
  .pipeline__layers {
    grid-template-columns: 1fr;
  }
  .pipeline__stages {
    flex-direction: column;
  }
  .pipeline__stage-arrow {
    transform: rotate(90deg);
    padding: 4px 0;
  }
  .pipeline__decision-grid {
    grid-template-columns: 1fr;
  }
}
</style>