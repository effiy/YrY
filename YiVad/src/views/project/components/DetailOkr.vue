<template>
  <div class="dokr-root">
    <div v-if="loading" class="dokr-loading">
      <DetailSkeleton />
    </div>

    <template v-else>
      <!-- ═══ Summary bar ═══ -->
      <div v-if="totalGoals" class="dokr-summary">
        <div class="dokr-summary__item">
          <span class="dokr-summary__value">{{ totalGoals }}</span>
          <span class="dokr-summary__label">总目标</span>
        </div>
        <div class="dokr-summary__divider" />
        <div class="dokr-summary__item">
          <span class="dokr-summary__value dokr-summary__value--accent">{{ avgProgress }}%</span>
          <span class="dokr-summary__label">平均进度</span>
        </div>
        <div class="dokr-summary__divider" />
        <div class="dokr-summary__item">
          <span class="dokr-summary__value dokr-summary__value--success">{{ completedCount }}</span>
          <span class="dokr-summary__label">已完成</span>
        </div>
      </div>

      <div v-if="groups.length" class="dokr-groups">
        <section v-for="group in groups" :key="group.role" class="dokr-group">
          <div class="dokr-group__head">
            <span class="dokr-group__dot" :style="{ background: roleColor(group.role) }" />
            <span class="dokr-group__label">{{ roleLabel(group.role) }}</span>
            <span class="dokr-group__count">{{ group.goals.length }}</span>
          </div>

          <div class="dokr-cards">
            <div
              v-for="goal in group.goals"
              :key="goal.id"
              class="dokr-card"
              @click="openGoal(goal.path)"
            >
              <!-- Header: title + progress ring -->
              <div class="dokr-card__top">
                <div class="dokr-card__ring">
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="var(--el-border-color-light)" stroke-width="4" />
                    <circle
                      cx="24" cy="24" r="20" fill="none"
                      :stroke="progressColor(goal.progress)"
                      stroke-width="4"
                      stroke-linecap="round"
                      :stroke-dasharray="2 * Math.PI * 20"
                      :stroke-dashoffset="2 * Math.PI * 20 * (1 - goal.progress / 100)"
                      transform="rotate(-90 24 24)"
                      style="transition: stroke-dashoffset 0.6s ease;"
                    />
                    <text x="24" y="26" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">
                      {{ goal.progress }}%
                    </text>
                  </svg>
                </div>
                <div class="dokr-card__info">
                  <span class="dokr-card__title">{{ goal.title }}</span>
                  <span class="dokr-card__id">{{ goal.id }}</span>
                </div>
              </div>

              <!-- Meta: owner + period -->
              <div class="dokr-card__meta">
                <span v-if="goal.owner" class="dokr-card__owner">
                  <el-icon :size="12"><User /></el-icon>
                  {{ goal.owner }}
                </span>
                <span v-if="goal.period" class="dokr-card__period">{{ goal.period }}</span>
              </div>

              <!-- Key Results -->
              <div v-if="goal.keyResults.length" class="dokr-card__krs">
                <div
                  v-for="(kr, i) in goal.keyResults"
                  :key="i"
                  class="dokr-kr"
                >
                  <span class="dokr-kr__badge" :class="{ 'dokr-kr__badge--done': kr.completion >= 100 }">
                    {{ kr.completion >= 100 ? '✓' : (i + 1) }}
                  </span>
                  <span class="dokr-kr__text">{{ kr.description }}</span>
                  <span class="dokr-kr__pct">{{ kr.completion }}%</span>
                </div>
              </div>

              <!-- Metrics -->
              <div v-if="goal.metrics.length" class="dokr-card__metrics">
                <div
                  v-for="m in goal.metrics"
                  :key="m.id"
                  class="dokr-metric"
                >
                  <code class="dokr-metric__id">{{ m.id }}</code>
                  <span class="dokr-metric__desc">{{ m.description }}</span>
                  <span class="dokr-metric__val">{{ m.current }} / {{ m.target }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <el-empty v-else :description="$t('project.okr.empty')" :image-size="60">
        <template #description>
          <div class="dokr-empty-msg">
            <p>{{ $t('project.okr.empty') }}</p>
            <p class="dokr-empty-hint">在 YiKnowledge 中创建 OKR 目标文件以在此处展示</p>
          </div>
        </template>
      </el-empty>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, inject, watch } from "vue";
import { useI18n } from "vue-i18n";
import { User } from "@element-plus/icons-vue";
import { useProjectDetail, PREVIEW_DLG_KEY } from "@/views/project/types";
import { useProjectOkrs } from "@/views/project/composables/useProjectOkrs";
import DetailSkeleton from "./DetailSkeleton.vue";

const { t } = useI18n();
const ctx = useProjectDetail();
const { project, okrSummary } = ctx;
const previewDlgRef = inject(PREVIEW_DLG_KEY, null);

const { groups, loading, totalGoals, avgProgress, completedCount, fetch } = useProjectOkrs();

// Sync OKR summary back to context so Overview can show consistent counts
watch([totalGoals, avgProgress, completedCount], () => {
  okrSummary.value = { totalGoals: totalGoals.value, avgProgress: avgProgress.value, completedCount: completedCount.value };
});

const ROLE_COLORS: Record<string, string> = {
  project: "#6366f1",
  producter: "#f56c6c",
  engineer: "#409eff",
  leader: "#67c23a",
  curator: "#9b59b6",
  srer: "#e6a23c",
  aier: "#73c0de",
  executiver: "#fc8452",
};

function roleColor(role: string): string {
  return ROLE_COLORS[role] || "#909399";
}

function roleLabel(role: string): string {
  return t(`project.okr.role.${role}`) || role;
}

function progressColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 40) return "#e6a23c";
  return "#909399";
}

function openGoal(path: string) {
  previewDlgRef?.value?.open(path);
}

onMounted(() => {
  const key = project.value?.key;
  if (key) fetch(key);
});
</script>

<style scoped lang="scss">
.dokr-root {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dokr-loading {
  padding: 16px 0;
}

// ── Summary bar ──
.dokr-summary {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px 24px;
}

.dokr-summary__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.dokr-summary__value {
  font-size: 24px;
  font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);

  &--accent { color: var(--el-color-primary); }
  &--success { color: #67c23a; }
}

.dokr-summary__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
}

.dokr-summary__divider {
  width: 1px;
  height: 32px;
  background: var(--el-border-color-lighter);
}

.dokr-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dokr-group__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.dokr-group__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dokr-group__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dokr-group__count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  padding: 1px 8px;
  border-radius: 999px;
}

.dokr-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.dokr-card {
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}

.dokr-card__top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.dokr-card__ring {
  flex-shrink: 0;
  color: var(--el-text-color-primary);
}

.dokr-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dokr-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.dokr-card__id {
  font-size: 10px;
  font-weight: 500;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-placeholder);
}

.dokr-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.dokr-card__owner {
  display: flex;
  align-items: center;
  gap: 3px;
}

.dokr-card__period {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 6px;
  background: var(--el-fill-color-light);
  border-radius: 3px;
}

// ── Key Results ──
.dokr-card__krs {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.dokr-kr {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dokr-kr__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--el-fill-color);
  color: var(--el-text-color-placeholder);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;

  &--done {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }
}

.dokr-kr__text {
  flex: 1;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.dokr-kr__pct {
  font-size: 11px;
  font-weight: 600;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

// ── Metrics ──
.dokr-card__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.dokr-metric {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  font-size: 10px;
}

.dokr-metric__id {
  font-weight: 700;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-color-primary);
  background: none;
  padding: 0;
}

.dokr-metric__desc {
  color: var(--el-text-color-secondary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dokr-metric__val {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

// ── Empty state ──
.dokr-empty-msg {
  text-align: center;
}

.dokr-empty-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>