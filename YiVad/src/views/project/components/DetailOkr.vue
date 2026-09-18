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
          <span class="dokr-summary__label">{{ $t("project.okr.summary.totalGoals") }}</span>
        </div>
        <div class="dokr-summary__divider" />
        <div class="dokr-summary__item">
          <span class="dokr-summary__value dokr-summary__value--accent">{{ avgProgress }}%</span>
          <span class="dokr-summary__label">{{ $t("project.okr.summary.avgProgress") }}</span>
        </div>
        <div class="dokr-summary__divider" />
        <div class="dokr-summary__item">
          <span class="dokr-summary__value dokr-summary__value--success">{{ completedCount }}</span>
          <span class="dokr-summary__label">{{ $t("project.okr.summary.completed") }}</span>
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
            <div v-for="goal in group.goals" :key="goal.id" class="dokr-card" @click="openGoal(goal.path)">
              <!-- Header: title + progress ring -->
              <div class="dokr-card__top">
                <div class="dokr-card__ring">
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="var(--el-border-color-light)" stroke-width="4" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      :stroke="progressColor(goal.progress)"
                      stroke-width="4"
                      stroke-linecap="round"
                      :stroke-dasharray="2 * Math.PI * 20"
                      :stroke-dashoffset="2 * Math.PI * 20 * (1 - goal.progress / 100)"
                      transform="rotate(-90 24 24)"
                      style="transition: stroke-dashoffset 0.6s ease"
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
                <div v-for="(kr, i) in goal.keyResults" :key="i" class="dokr-kr">
                  <span class="dokr-kr__badge" :class="{ 'dokr-kr__badge--done': kr.completion >= 100 }">
                    {{ kr.completion >= 100 ? "✓" : i + 1 }}
                  </span>
                  <span class="dokr-kr__text">{{ kr.description }}</span>
                  <span class="dokr-kr__pct">{{ kr.completion }}%</span>
                </div>
              </div>

              <!-- Metrics -->
              <div v-if="goal.metrics.length" class="dokr-card__metrics">
                <div v-for="m in goal.metrics" :key="m.id" class="dokr-metric">
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
            <p>{{ $t("project.okr.empty") }}</p>
            <p class="dokr-empty-hint">{{ $t("project.okr.emptyHint") }}</p>
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
  executiver: "#fc8452"
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
  gap: 0;
  align-items: center;
  padding: 16px 24px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.dokr-summary__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}
.dokr-summary__value {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 24px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);
  &--accent {
    color: var(--el-color-primary);
  }
  &--success {
    color: #67c23a;
  }
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
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.dokr-group__dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dokr-group__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.dokr-group__count {
  padding: 1px 8px;
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border-radius: 999px;
}
.dokr-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}
.dokr-card {
  padding: 16px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}
.dokr-card__top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 10px;
}
.dokr-card__ring {
  flex-shrink: 0;
  color: var(--el-text-color-primary);
}
.dokr-card__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.dokr-card__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}
.dokr-card__id {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
}
.dokr-card__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 8px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  border-top: 1px solid var(--el-border-color-lighter);
}
.dokr-card__owner {
  display: flex;
  gap: 3px;
  align-items: center;
}
.dokr-card__period {
  padding: 1px 6px;
  margin-left: auto;
  font-size: 10px;
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
  gap: 8px;
  align-items: center;
}
.dokr-kr__badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  border-radius: 50%;
  &--done {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }
}
.dokr-kr__text {
  flex: 1;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}
.dokr-kr__pct {
  flex-shrink: 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
}

// ── Metrics ──
.dokr-card__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.dokr-metric {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 2px 8px;
  font-size: 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}
.dokr-metric__id {
  padding: 0;
  font-family: "SF Mono", Menlo, monospace;
  font-weight: 700;
  color: var(--el-color-primary);
  background: none;
}
.dokr-metric__desc {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-secondary);
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
