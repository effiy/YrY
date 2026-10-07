<template>
  <div class="exec-dashboard" v-loading="loading">
    <!-- ═══ Header: RoleNav + QuickNav ═══ -->
    <div class="exec-dashboard__header">
      <RoleNav :active="'executive'" show-quick-nav quick-role="executive" quick-active="okr" />
    </div>

    <template v-if="error">
      <div class="exec-dashboard__empty">
        <span class="exec-dashboard__empty-icon">⚠️</span>
        <p class="exec-dashboard__empty-title">Failed to load dashboard</p>
        <p class="exec-dashboard__empty-hint">{{ error }}</p>
        <el-button type="primary" size="small" @click="fetchAll" style="margin-top: 12px">Retry</el-button>
      </div>
    </template>

    <template v-else>
      <!-- ═══ Stat Cards Row ═══ -->
      <div class="exec-dashboard__stat-row">
        <div class="exec-dashboard__stat-card exec-dashboard__stat-card--knowledge" @click="$router.push('/knowledge/executive')">
          <span class="exec-dashboard__stat-icon">📁</span>
          <div class="exec-dashboard__stat-info">
            <span class="exec-dashboard__stat-value">{{ animatedKnowledge }}</span>
            <span class="exec-dashboard__stat-label">Knowledge Files</span>
            <span class="exec-dashboard__stat-sub">{{ subdirSummary }}</span>
          </div>
        </div>

        <div class="exec-dashboard__stat-card exec-dashboard__stat-card--okr" @click="$router.push('/knowledge/executive/okr')">
          <span class="exec-dashboard__stat-icon">🎯</span>
          <div class="exec-dashboard__stat-info">
            <span class="exec-dashboard__stat-value">{{ animatedOkrGoals }}</span>
            <span class="exec-dashboard__stat-label">OKR Goals</span>
            <span class="exec-dashboard__stat-sub">{{ okrAvgProgress }}% avg progress</span>
          </div>
        </div>

        <div class="exec-dashboard__stat-card exec-dashboard__stat-card--rss" @click="$router.push('/knowledge/executive/rssManager')">
          <span class="exec-dashboard__stat-icon">📡</span>
          <div class="exec-dashboard__stat-info">
            <span class="exec-dashboard__stat-value">{{ animatedRssArticles }}</span>
            <span class="exec-dashboard__stat-label">RSS Articles</span>
            <span class="exec-dashboard__stat-sub">{{ rssFeedCount }} feeds · {{ rssTodayCount }} today</span>
          </div>
        </div>

        <div class="exec-dashboard__stat-card exec-dashboard__stat-card--reading" @click="$router.push('/knowledge/executive/readingList')">
          <span class="exec-dashboard__stat-icon">📚</span>
          <div class="exec-dashboard__stat-info">
            <span class="exec-dashboard__stat-value">{{ animatedReading }}</span>
            <span class="exec-dashboard__stat-label">Reading List</span>
            <span class="exec-dashboard__stat-sub">{{ readingInProgress }} reading · {{ readingDone }} done</span>
          </div>
        </div>
      </div>

      <!-- ═══ Main Grid ═══ -->
      <div class="exec-dashboard__grid">
        <!-- OKR Progress -->
        <div class="exec-dashboard__section">
          <div class="exec-dashboard__section-head">
            <span class="exec-dashboard__section-icon">🎯</span>
            <h2 class="exec-dashboard__section-title">OKR Progress</h2>
            <span class="exec-dashboard__section-count">{{ okrGoals.length }} goals</span>
            <a class="exec-dashboard__section-action" @click="$router.push('/knowledge/executive/okr')">View All →</a>
          </div>
          <div class="exec-dashboard__section-body">
            <div v-if="okrGoals.length" class="exec-dashboard__okr-list">
              <div
                v-for="goal in okrGoals.slice(0, 6)"
                :key="goal.id"
                class="exec-dashboard__okr-item"
                @click="goOkrGoal(goal)"
              >
                <div class="exec-dashboard__okr-top">
                  <span class="exec-dashboard__okr-title">{{ goal.title }}</span>
                  <span class="exec-dashboard__okr-pct">{{ goal.progress }}%</span>
                </div>
                <el-progress :percentage="goal.progress" :status="goal.progress >= 100 ? 'success' : undefined" :stroke-width="6" />
              </div>
            </div>
            <div v-else class="exec-dashboard__empty">
              <span class="exec-dashboard__empty-icon">🎯</span>
              <p class="exec-dashboard__empty-title">No OKR goals yet</p>
              <p class="exec-dashboard__empty-hint">Goals appear when OKR files are created in the knowledge base.</p>
            </div>
          </div>
        </div>

        <!-- Recent RSS Activity -->
        <div class="exec-dashboard__section">
          <div class="exec-dashboard__section-head">
            <span class="exec-dashboard__section-icon">📡</span>
            <h2 class="exec-dashboard__section-title">Recent RSS Activity</h2>
            <span class="exec-dashboard__section-count">{{ rssArticleCount }} total</span>
            <a class="exec-dashboard__section-action" @click="$router.push('/knowledge/executive/rssManager')">View All →</a>
          </div>
          <div class="exec-dashboard__section-body">
            <div v-if="rssRecentArticles.length" class="exec-dashboard__rss-list">
              <div
                v-for="(article, i) in rssRecentArticles"
                :key="i"
                class="exec-dashboard__rss-item"
                @click="goRssManager"
              >
                <span class="exec-dashboard__rss-source">{{ article.source.slice(0, 4) }}</span>
                <div class="exec-dashboard__rss-content">
                  <span class="exec-dashboard__rss-title">{{ article.title }}</span>
                  <div class="exec-dashboard__rss-meta">
                    <span class="exec-dashboard__rss-date">{{ fmt(article.published) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="exec-dashboard__empty">
              <span class="exec-dashboard__empty-icon">📡</span>
              <p class="exec-dashboard__empty-title">No RSS articles</p>
              <p class="exec-dashboard__empty-hint">Add RSS feeds to start aggregating articles.</p>
            </div>
          </div>
        </div>

        <!-- Knowledge by Category -->
        <div class="exec-dashboard__section">
          <div class="exec-dashboard__section-head">
            <span class="exec-dashboard__section-icon">📊</span>
            <h2 class="exec-dashboard__section-title">Knowledge by Domain</h2>
            <span class="exec-dashboard__section-count">{{ knowledgeFileCount }} files</span>
          </div>
          <div class="exec-dashboard__section-body">
            <div class="exec-dashboard__cat-list">
              <div v-for="cat in categoryCounts" :key="cat.id" class="exec-dashboard__cat-item">
                <span class="exec-dashboard__cat-icon" :style="{ background: catColor(cat.id) + '20' }">{{ cat.icon }}</span>
                <div class="exec-dashboard__cat-info">
                  <span class="exec-dashboard__cat-label">{{ cat.label }}</span>
                  <div class="exec-dashboard__cat-bar">
                    <div
                      class="exec-dashboard__cat-bar-fill"
                      :style="{ width: catBarPct(cat.count) + '%', background: catColor(cat.id) }"
                    />
                  </div>
                </div>
                <span class="exec-dashboard__cat-count">{{ cat.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Process Records -->
        <div class="exec-dashboard__section">
          <div class="exec-dashboard__section-head">
            <span class="exec-dashboard__section-icon">🔁</span>
            <h2 class="exec-dashboard__section-title">Process Records</h2>
            <span class="exec-dashboard__section-count">{{ processTotalLoops }} loops</span>
            <a class="exec-dashboard__section-action" @click="$router.push('/knowledge/executive/processRecord')">View All →</a>
          </div>
          <div class="exec-dashboard__section-body">
            <div v-if="processRecords.length" class="exec-dashboard__proc-list">
              <div
                v-for="rec in processRecords"
                :key="rec.loopId"
                class="exec-dashboard__proc-item"
                @click="goProcess(rec)"
              >
                <div class="exec-dashboard__proc-top">
                  <span class="exec-dashboard__proc-loop">{{ rec.title }}</span>
                  <span v-if="rec.goalId" class="exec-dashboard__proc-goal">{{ rec.goalId }}</span>
                </div>
                <div class="exec-dashboard__proc-meta">
                  <el-progress
                    :percentage="rec.stages ? Math.round((rec.doneStages / 8) * 100) : 0"
                    :status="rec.doneStages >= 8 ? 'success' : undefined"
                    :stroke-width="5"
                    style="flex: 1"
                  />
                  <span class="exec-dashboard__proc-stages">{{ rec.doneStages }}/8 stages</span>
                  <span class="exec-dashboard__proc-date">{{ fmt(rec.updated) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="exec-dashboard__empty">
              <span class="exec-dashboard__empty-icon">🔁</span>
              <p class="exec-dashboard__empty-title">No process records</p>
              <p class="exec-dashboard__empty-hint">Loop records are created when AI completes lifecycle stages.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="ExecutiveDashboard">
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useCountUp } from "@/hooks/useCountUp";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import { useExecutiveDashboard } from "./composables/useExecutiveDashboard";

const router = useRouter();

const {
  loading,
  error,
  knowledgeFileCount,
  categoryCounts,
  okrGoals,
  okrGoalCount,
  okrAvgProgress,
  rssArticleCount,
  rssTodayCount,
  rssFeedCount,
  rssRecentArticles,
  readingTotal,
  readingInProgress,
  readingDone,
  processRecords,
  processTotalLoops,
  fetchAll
} = useExecutiveDashboard();

const animatedKnowledge = useCountUp(() => knowledgeFileCount.value);
const animatedOkrGoals = useCountUp(() => okrGoalCount.value);
const animatedRssArticles = useCountUp(() => rssArticleCount.value);
const animatedReading = useCountUp(() => readingTotal.value);

const subdirSummary = computed(() => {
  const parts = categoryCounts.value.filter(c => c.count > 0).map(c => `${c.label} ${c.count}`);
  return parts.length ? parts.slice(0, 2).join(" · ") : "No files";
});

const CAT_COLORS: Record<string, string> = {
  strategy: "#ef4444",
  industry: "#1677ff",
  roadmap: "#10b981",
  "reading-list": "#7c3aed"
};

function catColor(id: string): string {
  return CAT_COLORS[id] ?? "#909399";
}

function catBarPct(count: number): number {
  const max = Math.max(...categoryCounts.value.map(c => c.count), 1);
  return Math.round((count / max) * 100);
}

function fmt(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.round(diff / 86400000)}d ago`;
    return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  } catch {
    return raw.slice(0, 10);
  }
}

function goOkrGoal(goal: { role: string; id: string }) {
  if (goal.role && goal.id) {
    router.push(`/knowledge/executive/okr?role=${goal.role}&goal=${goal.id}`);
  } else {
    router.push("/knowledge/executive/okr");
  }
}

function goRssManager() {
  router.push("/knowledge/executive/rssManager");
}

function goProcess(rec: { loopId: string }) {
  router.push(`/knowledge/executive/processRecord?loop=${rec.loopId}`);
}

onMounted(fetchAll);
</script>

<style scoped lang="scss">
@use "./styles/executiveDashboard.scss";
</style>