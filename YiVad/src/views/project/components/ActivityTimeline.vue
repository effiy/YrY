<template>
  <div class="do-card do-row__left da-card">
    <!-- Header row: title + sparkline + refresh -->
    <div class="da-head">
      <div class="da-head__left">
        <h3 class="da-title">{{ $t("project.overview.activity.title") }}</h3>
        <span v-if="lastUpdated" class="da-fresh" :class="{ 'is-live': liveAge < 60 }">
          <span class="da-fresh__dot" />
          {{ $t("project.overview.activity.updatedAgo", { time: updatedAgo }) }}
        </span>
      </div>
      <div class="da-head__right">
        <!-- 7-day mini sparkline -->
        <div v-if="activitySparkline.length" class="da-spark" :title="$t('project.overview.activity.sparklineTitle')">
          <span
            v-for="(d, i) in activitySparkline"
            :key="i"
            class="da-spark__bar"
            :class="[`da-spark__bar--l${d.level}`, { 'is-today': i === 6 }]"
            :style="{ height: d.level ? `${Math.max(4, d.level * 33)}%` : '2px' }"
          />
        </div>
        <el-button size="small" text :icon="Refresh" :loading="loading" class="da-refresh" @click="$emit('refresh')" />
      </div>
    </div>

    <!-- Segmented filter -->
    <div class="da-seg">
      <button
        v-for="f in activityFilters"
        :key="f.key"
        class="da-seg__btn"
        :class="{ 'is-active': activityTypeFilter === f.key || (activityTypeFilter === 'all' && f.key === 'all') }"
        @click="setFilter(f.key)"
      >
        <span v-if="f.key !== 'all'" class="da-seg__dot" :style="{ background: f.color }" />
        {{ f.label }}
        <span class="da-seg__n">{{ f.count }}</span>
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading && !filteredActivity.length" class="da-skel">
      <div v-for="g in 2" :key="g" class="da-skel__group">
        <span class="da-skel__head" />
        <div v-for="n in (g === 1 ? 3 : 2)" :key="n" class="da-skel__row" :style="{ animationDelay: `${((g - 1) * 3 + n) * 0.08}s` }">
          <span class="da-skel__accent" />
          <span class="da-skel__body">
            <span class="da-skel__line" />
            <span class="da-skel__line is-short" />
          </span>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredActivity.length" class="da-empty">
      <div class="da-empty__icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <p class="da-empty__text">{{ activityEmptyText }}</p>
    </div>

    <!-- Timeline Feed -->
    <div v-else class="da-feed">
      <template v-for="(group, gIdx) in activityGroups" :key="group.label">
        <div class="da-group">
          <div class="da-group__head">
            <span class="da-group__label">{{ group.label }}</span>
            <span class="da-group__n">{{ group.items.length }}</span>
          </div>

          <div
            v-for="(item, i) in group.items"
            :key="item.id"
            class="da-item"
            :class="{
              'is-fresh': isActivityFresh(item),
              [`da-item--${item.type}`]: true
            }"
            :style="{ animationDelay: `${i * 0.04}s` }"
            tabindex="0"
            role="listitem"
            @click="$emit('item-click', item)"
            @keydown.enter.prevent="$emit('item-click', item)"
          >
            <div class="da-item__accent" :style="{ background: activityColor(item.type) }" />

            <div class="da-item__body">
              <div class="da-item__main">
                <span class="da-item__action">{{ item.action }}</span>
                <span class="da-item__target">{{ item.target }}</span>
              </div>

              <div class="da-item__meta">
                <span v-if="item.badge" class="da-item__badge" :style="{ background: item.badgeColor || '#909399' }">
                  {{ item.badge }}
                </span>
                <span v-if="item.subtitle" class="da-item__sub">{{ item.subtitle }}</span>
                <span v-if="item.assignee" class="da-item__who">{{ item.assignee }}</span>
              </div>
            </div>

            <el-tooltip :content="activityTooltip(item)" :show-after="600" placement="left">
              <time class="da-item__time" :class="{ 'is-fresh': isActivityFresh(item) }">{{ item.timeAgo }}</time>
            </el-tooltip>
          </div>
        </div>
      </template>

      <div v-if="filteredActivity.length > visibleActivity.length" class="da-foot">
        {{ $t("project.overview.activity.showingCount", { visible: visibleActivity.length, total: filteredActivity.length }) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { useActivityTimeline } from "@/views/project/composables/useActivityTimeline";
import type { ActivityItem } from "@/views/project/types";
import type { Issue } from "@/api/modules/issueService";
import type { BugDocument } from "@/api/modules/bug";
import type { Module } from "@/api/modules/moduleService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

const props = defineProps<{
  allIssues: Issue[];
  allBugs: BugDocument[];
  allModules: Module[];
  knowledgeFiles: KnowledgeFileEntry[];
  projectKey: string;
  filterDateStr: string;
  now: number;
  loading: boolean;
  lastUpdated: number;
  updatedAgo: string;
}>();

defineEmits<{
  refresh: [];
  "item-click": [item: ActivityItem];
}>();

const {
  activityTypeFilter,
  filteredActivity,
  visibleActivity,
  activityFilters,
  activityEmptyText,
  activityGroups,
  activitySparkline,
  setFilter,
  isActivityFresh,
  activityTooltip,
  activityColor
} = useActivityTimeline({
  allIssues: computed(() => props.allIssues),
  allBugs: computed(() => props.allBugs),
  allModules: computed(() => props.allModules),
  knowledgeFiles: computed(() => props.knowledgeFiles),
  projectKey: computed(() => props.projectKey),
  filterDateStr: computed(() => props.filterDateStr),
  now: computed(() => props.now)
});

const liveAge = computed(() => props.lastUpdated ? Math.floor((props.now - props.lastUpdated) / 1000) : Infinity);
</script>

<style scoped lang="scss">
// ── Card ──
.da-card {
  padding: 18px 20px 20px;
}

// ── Header ──
.da-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.da-head__left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.da-title {
  margin: 0;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: var(--el-text-color-primary);
}
.da-head__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

// Freshness indicator
.da-fresh {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  &.is-live .da-fresh__dot {
    background: #22c55e;
    animation: da-pulse 2s ease-in-out infinite;
  }
}
.da-fresh__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-text-color-placeholder);
  transition: background 0.3s;
}
@keyframes da-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
}

// 7-day sparkline
.da-spark {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 18px;
}
.da-spark__bar {
  width: 3px;
  min-height: 2px;
  border-radius: 1.5px;
  transition: height 0.3s ease;
  &--l0 { background: var(--el-fill-color-dark); }
  &--l1 { background: #a5d6a7; }
  &--l2 { background: #66bb6a; }
  &--l3 { background: #2e7d32; }
  &.is-today { box-shadow: 0 0 0 1px var(--el-color-primary); background: #1b5e20; }
}

.da-refresh {
  color: var(--el-text-color-placeholder);
}

// ── Segmented control ──
.da-seg {
  display: inline-flex;
  gap: 0;
  padding: 3px;
  margin-bottom: 16px;
  background: var(--el-fill-color);
  border-radius: 8px;
}
.da-seg__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 6px;
  transition: all 0.15s ease;
  white-space: nowrap;
  &:hover { color: var(--el-text-color-primary); }
  &.is-active {
    color: var(--el-text-color-primary);
    background: var(--el-bg-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  }
}
.da-seg__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.da-seg__n {
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
  min-width: 14px;
  text-align: center;
  .is-active & { color: var(--el-text-color-secondary); }
}

// ── Skeleton ──
.da-skel { display: flex; flex-direction: column; }
.da-skel__group { display: flex; flex-direction: column; & + & { margin-top: 16px; } }
.da-skel__head {
  width: 56px; height: 10px; margin-bottom: 10px; border-radius: 5px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: da-shimmer 1.4s ease-in-out infinite;
}
.da-skel__row {
  display: flex; gap: 10px; align-items: stretch; padding: 8px 0;
}
.da-skel__accent {
  width: 2px; border-radius: 1px; flex-shrink: 0;
  background: linear-gradient(180deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 100% 200%;
  animation: da-shimmer 1.4s ease-in-out infinite;
}
.da-skel__body { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.da-skel__line {
  height: 10px; border-radius: 5px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: da-shimmer 1.4s ease-in-out infinite;
  &.is-short { width: 45%; }
}
@keyframes da-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// ── Empty ──
.da-empty { padding: 32px 16px; text-align: center; }
.da-empty__icon { display: inline-flex; margin-bottom: 10px; color: var(--el-text-color-placeholder); opacity: 0.5; }
.da-empty__text { margin: 0; font-size: 13px; color: var(--el-text-color-placeholder); }

// ── Feed ──
.da-feed {
  display: flex; flex-direction: column;
  animation: da-feed-in 0.3s ease-out;
}
@keyframes da-feed-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

// ── Group ──
.da-group { display: flex; flex-direction: column; }
.da-group__head {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 0 6px;
  &:first-child { padding-top: 0; }
}
.da-group__label {
  font-size: 11px; font-weight: 600;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.02em;
}
.da-group__n {
  font-size: 10px; font-weight: 600; font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
  &::before { content: "· "; }
}

// ── Timeline item ──
.da-item {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 0 0 0 0;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s ease, box-shadow 0.15s ease;
  animation: da-item-in 0.35s ease-out both;
  outline: none;

  & + & { margin-top: 1px; }

  &:hover {
    background: var(--el-fill-color-lighter);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    .da-item__accent { opacity: 1; transform: scaleY(1.05); }
    .da-item__target { color: var(--el-color-primary); }
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--el-color-primary);
  }

  &.is-fresh .da-item__accent {
    animation: da-accent-glow 2s ease-in-out infinite;
  }
}
@keyframes da-item-in {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes da-accent-glow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; box-shadow: 0 0 6px currentColor; }
}

.da-item__accent {
  flex-shrink: 0;
  width: 2px;
  margin: 6px 0;
  border-radius: 1px;
  opacity: 0.45;
  transition: opacity 0.2s, transform 0.2s;
}

.da-item__body {
  flex: 1;
  min-width: 0;
  padding: 7px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.da-item__main {
  display: flex;
  gap: 5px;
  align-items: baseline;
  min-width: 0;
}

.da-item__action {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.da-item__target {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  transition: color 0.15s;
}

.da-item__time {
  flex-shrink: 0;
  padding: 7px 0;
  font-family: "SF Mono", "JetBrains Mono", Menlo, monospace;
  font-size: 10.5px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  &.is-fresh { color: #22c55e; font-weight: 600; }
}

.da-item__meta {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.da-item__badge {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 1px 5px;
  font-size: 9.5px;
  font-weight: 650;
  line-height: 1.7;
  color: #fff;
  border-radius: 3px;
  letter-spacing: 0.01em;
}

.da-item__sub {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.da-item__who {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  &::before { content: "@"; opacity: 0.5; margin-right: 1px; }
}

// ── Footer ──
.da-foot {
  padding: 10px 0 0;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-align: center;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>