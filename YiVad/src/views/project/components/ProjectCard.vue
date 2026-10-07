<template>
  <article
    class="pc-card"
    :class="{
      'pc-card--archived': project.status === 'archived',
      'pc-card--selected': selected,
      'pc-card--poor': health === 'poor',
      'pc-card--warn': health === 'warn',
      'pc-card--deleting': deleting
    }"
    :style="{ '--status-color': statusColor, '--health-color': healthColor }"
    @click="deleting ? undefined : emit('open')"
  >
    <span class="pc-accent" />

    <div class="pc-delete-overlay" v-if="deleting">
      <el-icon class="pc-delete-spin"><Loading /></el-icon>
      <span>Deleting…</span>
    </div>

    <div class="pc-body">
      <div class="pc-header">
        <div class="pc-title-row">
          <span class="pc-health-dot" :class="`pc-health-dot--${health}`" :title="healthLabel" />
          <span class="pc-name" :title="project.name">{{ project.name }}</span>
          <el-button
            link
            size="small"
            :icon="Delete"
            type="danger"
            class="pc-delete-btn"
            title="Delete project"
            @click.stop="emit('delete')"
          />
          <el-button
            link
            size="small"
            :icon="Star"
            :type="starred ? 'warning' : 'info'"
            class="pc-star"
            :class="{ 'is-on': starred }"
            @click.stop="emit('toggle-star')"
          />
        </div>
        <div class="pc-meta">
          <code class="pc-id-chip" title="Copy identifier" @click.stop="emit('copy-id')">{{ project.identifier }}</code>
          <el-tag :type="project.status === 'active' ? 'success' : 'info'" size="small">{{ project.status }}</el-tag>
          <span v-if="stats.overdue" class="pc-overdue-badge" title="Overdue issues">
            <el-icon><Clock /></el-icon>
            {{ stats.overdue }} overdue
          </span>
          <span class="pc-risks">
            <span
              v-for="r in risks.slice(0, 2)"
              :key="r"
              class="pc-risk-chip"
              :style="{ color: RISK_META[r].color, borderColor: RISK_META[r].color, background: RISK_META[r].color + '14' }"
              :title="RISK_META[r].hint"
              @click.stop="emit('filter-risk', r)"
            >
              {{ RISK_META[r].label }}
            </span>
          </span>
        </div>
      </div>

      <div class="pc-metrics" :class="{ 'pc-metrics--four': knowledgeCount != null }">
        <button type="button" class="pc-metric" title="Issues" @click.stop="emit('tab', 'issues')">
          <span class="pc-metric-val">{{ stats.issues }}</span>
          <span class="pc-metric-lbl">Issues</span>
        </button>
        <button type="button" class="pc-metric" title="Bugs" @click.stop="emit('tab', 'bugs')">
          <span class="pc-metric-val">{{ stats.totalBugs }}</span>
          <span class="pc-metric-lbl">Bugs</span>
        </button>
        <button type="button" class="pc-metric" title="Modules" @click.stop="emit('tab', 'modules')">
          <span class="pc-metric-val">{{ stats.totalModules }}</span>
          <span class="pc-metric-lbl">Modules</span>
        </button>
        <div v-if="knowledgeCount != null" class="pc-metric" title="YiKnowledge files">
          <span class="pc-metric-val">{{ knowledgeCount }}</span>
          <span class="pc-metric-lbl">Docs</span>
        </div>
      </div>

      <div class="pc-bottom">
        <svg class="pc-ring" viewBox="0 0 56 56" :title="`${completionPct}% complete`">
          <circle class="pc-ring-bg" cx="28" cy="28" r="24" />
          <circle
            class="pc-ring-fg"
            cx="28" cy="28" r="24"
            :stroke="progressColor"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
          <text class="pc-ring-text" x="28" y="28" text-anchor="middle" dy="0.35em">{{ completionPct }}%</text>
        </svg>

        <div class="pc-footer">
          <div class="pc-members" title="View members" @click.stop="emit('tab', 'members')">
            <template v-if="project.members?.length">
              <el-avatar v-for="m in visibleMembers" :key="m.user_id" :size="24" :src="m.avatar" :title="m.username">
                {{ m.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span v-if="extraMembers" class="pc-members-more">+{{ extraMembers }}</span>
            </template>
            <span v-else class="pc-members-empty">No members</span>
          </div>
          <span class="pc-date" :title="'Updated ' + formatRelativeTime(project.updated_at)">{{
            formatRelativeTime(project.updated_at)
          }}</span>
          <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd)">
            <el-button link size="small" :icon="MoreFilled" class="pc-more" @click.stop />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="open">Open</el-dropdown-item>
                <el-dropdown-item command="edit">Edit</el-dropdown-item>
                <el-dropdown-item v-if="project.status === 'active'" command="archive" divided>
                  <span style="color: var(--el-color-warning)">Archive</span>
                </el-dropdown-item>
                <el-dropdown-item v-else command="restore">
                  <span style="color: var(--el-color-success)">Restore</span>
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <span style="color: var(--el-color-danger)">Delete</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts" name="ProjectCard">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Clock, Delete, Loading, MoreFilled, Star } from "@element-plus/icons-vue";
import { formatRelativeTime } from "@/utils/datetime";
import type { Project } from "@/api/modules/projectService";
import { RISK_META, type HealthLevel, type ProjectStats, type RiskKey } from "../types";
import { HEALTH_COLORS, STATUS_COLORS } from "../constants";

const props = defineProps<{
  project: Project;
  stats: ProjectStats;
  risks: RiskKey[];
  health: HealthLevel;
  descHtml: string;
  starred: boolean;
  selected: boolean;
  /** Total knowledge files in YiKnowledge/projects/{project.key}/ (all categories). */
  knowledgeCount?: number;
  /** Whether this card is being deleted (shows overlay + animation). */
  deleting?: boolean;
}>();

const emit = defineEmits<{
  open: [];
  edit: [];
  archive: [];
  restore: [];
  delete: [];
  'toggle-star': [];
  'toggle-select': [];
  'copy-id': [];
  'filter-risk': [risk: RiskKey];
  tab: [tab: 'issues' | 'members' | 'bugs' | 'modules'];
}>();

const { t } = useI18n();

const statusColor = computed(() => STATUS_COLORS[props.project.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.archived);
const healthColor = computed(() => HEALTH_COLORS[props.health] || "#909399");

const healthLabel = computed(() => {
  const labels: Record<HealthLevel, string> = {
    good: t("project.risks.health.good"),
    warn: t("project.risks.health.warn"),
    poor: t("project.risks.health.poor")
  };
  return labels[props.health];
});

const completionPct = computed(() => (props.stats.issues ? Math.round((props.stats.done / props.stats.issues) * 100) : 0));

const progressColor = computed(() => {
  const pct = completionPct.value;
  if (pct >= 100) return "#67c23a";
  if (pct >= 60) return "#409eff";
  if (pct >= 30) return "#e6a23c";
  return "#f56c6c";
});

// SVG ring constants
const R = 24;
const circumference = 2 * Math.PI * R;
const dashOffset = computed(() => circumference * (1 - completionPct.value / 100));

function handleCommand(cmd: string) {
  switch (cmd) {
    case "open":
      emit("open");
      break;
    case "edit":
      emit("edit");
      break;
    case "archive":
      emit("archive");
      break;
    case "restore":
      emit("restore");
      break;
    case "delete":
      emit("delete");
      break;
  }
}

const visibleMembers = computed(() => (props.project.members || []).slice(0, 5));
const extraMembers = computed(() => Math.max(0, (props.project.members?.length || 0) - 5));
</script>

<style scoped lang="scss">
.pc-card {
  --status-color: #909399;
  --health-color: #909399;

  display: flex;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 8px 30px rgb(0 0 0 / 12%);
    transform: translateY(-3px);
    .pc-accent {
      width: 8px;
    }
    .pc-name {
      color: var(--el-color-primary);
    }
  }
}
.pc-card--selected {
  border-color: var(--el-color-primary);
  box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
}
.pc-card--poor {
  border-left-color: #f56c6c;
}
.pc-card--warn {
  border-left-color: #e6a23c;
}
.pc-card--archived {
  opacity: 0.82;
  .pc-name {
    color: var(--el-text-color-secondary);
  }
}

/* Deletion state */
.pc-card--deleting {
  pointer-events: none;
  opacity: 0.45;
  transform: scale(0.95);
  filter: grayscale(0.3);
  transition:
    opacity 0.35s ease,
    transform 0.35s ease,
    filter 0.35s ease;
}
.pc-delete-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-danger);
  background: rgb(255 255 255 / 72%);
  border-radius: 12px;
}
.pc-delete-spin {
  font-size: 24px;
  animation: pc-delete-spin 1s linear infinite;
}
@keyframes pc-delete-spin {
  to { transform: rotate(360deg); }
}

/* Status color strip — widens on hover */
.pc-accent {
  flex-shrink: 0;
  width: 4px;
  background: var(--status-color);
  transition: width 0.2s ease;
}
.pc-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 14px 16px 16px;
}
.pc-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pc-title-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.pc-health-dot {
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  &--good {
    background: #67c23a;
    box-shadow: 0 0 5px rgb(103 194 58 / 40%);
  }
  &--warn {
    background: #e6a23c;
    box-shadow: 0 0 5px rgb(230 162 60 / 40%);
  }
  &--poor {
    background: #f56c6c;
    box-shadow: 0 0 5px rgb(245 108 108 / 40%);
    animation: pc-health-pulse 2s ease-in-out infinite;
  }
}
@keyframes pc-health-pulse {
  0%, 100% { box-shadow: 0 0 4px rgb(245 108 108 / 40%); }
  50% { box-shadow: 0 0 10px rgb(245 108 108 / 70%); }
}
.pc-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  font-weight: 650;
  white-space: nowrap;
  transition: color 0.2s ease;
}
.pc-star {
  flex-shrink: 0;
  opacity: 0.35;
  transition:
    opacity 0.15s,
    transform 0.2s ease;
  &.is-on,
  &:hover {
    opacity: 1;
  }
  &:active {
    transform: scale(0.85);
  }
}
.pc-delete-btn {
  flex-shrink: 0;
  opacity: 0;
  transition:
    opacity 0.2s,
    transform 0.2s ease;
  .pc-card:hover &,
  .pc-card:focus-within & {
    opacity: 0.55;
  }
  &:hover {
    opacity: 1 !important;
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.9);
  }
}
.pc-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}
.pc-id-chip {
  padding: 1px 6px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border-radius: 3px;
  transition:
    color 0.15s,
    background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.pc-overdue-badge {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 4px;
  .el-icon {
    font-size: 11px;
  }
}
.pc-risks {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-left: auto;
}
.pc-risk-chip {
  padding: 0 6px;
  font-size: 10px;
  font-weight: 600;
  line-height: 17px;
  cursor: pointer;
  border: 1px solid;
  border-radius: 9px;
  transition: filter 0.15s;
  &:hover {
    filter: brightness(0.92);
  }
}

/* Key metrics row */
.pc-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  &--four {
    grid-template-columns: repeat(4, 1fr);
  }
}
.pc-metric {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
  padding: 8px 4px;
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition:
    background 0.15s,
    border-color 0.15s,
    transform 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    transform: translateY(-1px);
  }
  &:active {
    transform: scale(0.97);
  }
}
.pc-metric-val {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: var(--el-text-color-primary);
}
.pc-metric-lbl {
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* SVG progress ring */
.pc-ring {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
}
.pc-ring-bg {
  fill: none;
  stroke: var(--el-fill-color);
  stroke-width: 5;
}
.pc-ring-fg {
  fill: none;
  stroke-width: 5;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.6s ease;
}
.pc-ring-text {
  font-size: 12px;
  font-weight: 700;
  fill: var(--el-text-color-primary);
}

/* Bottom row: ring + footer */
.pc-bottom {
  display: flex;
  gap: 12px;
  align-items: center;
}
.pc-footer {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.pc-members {
  display: flex;
  gap: 4px;
  align-items: center;
  cursor: pointer;
  :deep(.el-avatar) {
    font-size: 11px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
    border: 2px solid var(--el-bg-color);
    &:not(:first-child) {
      margin-left: -8px;
    }
  }
}
.pc-members-more {
  margin-left: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.pc-members-empty {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.pc-date {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.pc-more {
  flex-shrink: 0;
  align-self: flex-end;
  margin-top: -20px;
  opacity: 0;
  transition: opacity 0.2s;
  .pc-card:hover &,
  .pc-card:focus-within & {
    opacity: 1;
  }
}
</style>
