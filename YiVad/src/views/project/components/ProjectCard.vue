<template>
  <article
    class="pc-card"
    :class="{ 'pc-card--archived': project.status === 'archived', 'pc-card--selected': selected }"
    :style="{ '--status-color': statusColor }"
    @click="emit('open')"
  >
    <span class="pc-accent" />

    <div class="pc-body">
      <div class="pc-header">
        <div class="pc-title-row">
          <span class="pc-name" :title="project.name">{{ project.name }}</span>
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
          <span v-if="risks.length" class="pc-risks">
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

      <div class="pc-metrics">
        <button type="button" class="pc-metric" title="Issues" @click.stop="emit('tab', 'issues')">
          <el-icon><Tickets /></el-icon>
          <span class="pc-metric-val">{{ stats.issues }}</span>
          <span class="pc-metric-lbl">Issues</span>
        </button>
        <button type="button" class="pc-metric" title="Bugs" @click.stop="emit('tab', 'bugs')">
          <el-icon><WarningFilled /></el-icon>
          <span class="pc-metric-val">{{ stats.totalBugs }}</span>
          <span class="pc-metric-lbl">Bugs</span>
        </button>
        <button type="button" class="pc-metric" title="Modules" @click.stop="emit('tab', 'modules')">
          <el-icon><Grid /></el-icon>
          <span class="pc-metric-val">{{ stats.totalModules }}</span>
          <span class="pc-metric-lbl">Modules</span>
        </button>
      </div>

      <div class="pc-bottom">
        <div class="pc-progress-ring">
          <el-progress type="circle" :percentage="completionPct" :width="48" :stroke-width="5" :color="progressColor" />
        </div>

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
          <span class="pc-date" :title="'Updated ' + formatRelativeTime(project.updated_at)">{{ formatRelativeTime(project.updated_at) }}</span>
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
import { Grid, MoreFilled, Star, Tickets, WarningFilled } from "@element-plus/icons-vue";
import { formatRelativeTime } from "@/utils/datetime";
import type { Project } from "@/api/modules/projectService";
import { RISK_META, type HealthLevel, type ProjectStats, type RiskKey } from "../types";
import { STATUS_COLORS } from "../constants";

const props = defineProps<{
  project: Project;
  stats: ProjectStats;
  risks: RiskKey[];
  health: HealthLevel;
  descHtml: string;
  starred: boolean;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: "open"): void;
  (e: "edit"): void;
  (e: "archive"): void;
  (e: "restore"): void;
  (e: "toggle-star"): void;
  (e: "toggle-select"): void;
  (e: "copy-id"): void;
  (e: "filter-risk", risk: RiskKey): void;
  (e: "tab", tab: "issues" | "members" | "bugs" | "modules"): void;
}>();

const statusColor = computed(() => STATUS_COLORS[props.project.status as keyof typeof STATUS_COLORS] || "#909399");

const completionPct = computed(() => (props.stats.issues ? Math.round((props.stats.done / props.stats.issues) * 100) : 0));

const progressColor = computed(() => {
  const pct = completionPct.value;
  if (pct >= 100) return "#67c23a";
  if (pct >= 60) return "#409eff";
  if (pct >= 30) return "#e6a23c";
  return "#f56c6c";
});

function handleCommand(cmd: string) {
  switch (cmd) {
    case "open": emit("open"); break;
    case "edit": emit("edit"); break;
    case "archive": emit("archive"); break;
    case "restore": emit("restore"); break;
  }
}

const visibleMembers = computed(() => (props.project.members || []).slice(0, 5));
const extraMembers = computed(() => Math.max(0, (props.project.members?.length || 0) - 5));
</script>

<style scoped lang="scss">
.pc-card {
  --status-color: #909399;
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

    .pc-accent { width: 8px; }
    .pc-name { color: var(--el-color-primary); }
  }
}

.pc-card--selected {
  border-color: var(--el-color-primary);
  box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
}

.pc-card--archived {
  .pc-name { color: var(--el-text-color-secondary); }
}

/* Status color strip — widens on hover */
.pc-accent {
  flex-shrink: 0;
  width: 4px;
  background: var(--status-color);
  transition: width 0.2s ease;
}

.pc-body {
  flex: 1;
  min-width: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pc-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pc-title-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.pc-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  font-weight: 600;
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
  &:hover { opacity: 1; }

  &:active {
    transform: scale(0.85);
  }
}

.pc-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.pc-id-chip {
  padding: 1px 6px;
  font-size: 11px;
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

  &:hover { filter: brightness(0.92); }
}

/* Key metrics row */
.pc-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.pc-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

  .el-icon {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.pc-metric-val {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
  line-height: 1.1;
}

.pc-metric-lbl {
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Bottom row: progress ring + footer */
.pc-bottom {
  display: flex;
  gap: 14px;
  align-items: center;
}

.pc-progress-ring {
  flex-shrink: 0;
}

.pc-footer {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

    &:not(:first-child) { margin-left: -8px; }
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
  .pc-card:focus-within & { opacity: 1; }
}
</style>