<template>
  <div
    class="pr-row"
    :class="{ 'pr-row--archived': project.status === 'archived', 'pr-row--selected': selected }"
    :style="{ '--health-color': HEALTH_COLORS[health] }"
    @click="emit('open')"
  >
    <el-checkbox class="pr-select" :model-value="selected" @click.stop @change="emit('toggle-select')" />

    <span class="pr-health" :title="healthHint" />

    <div class="pr-ident">
      <span class="pr-name" :title="project.name">{{ project.name }}</span>
      <code class="pr-id" title="Copy identifier" @click.stop="emit('copy-id')">{{ project.identifier }}</code>
    </div>

    <el-tag :type="project.status === 'active' ? 'success' : 'info'" size="small" class="pr-status">
      {{ project.status }}
    </el-tag>

    <div class="pr-risks">
      <span
        v-for="r in risks.slice(0, 2)"
        :key="r"
        class="pr-risk-chip"
        :style="{ color: RISK_META[r].color, borderColor: RISK_META[r].color, background: RISK_META[r].color + '14' }"
        :title="RISK_META[r].hint"
        @click.stop="emit('filter-risk', r)"
      >
        {{ RISK_META[r].label }}
      </span>
      <span v-if="risks.length > 2" class="pr-risk-more">+{{ risks.length - 2 }}</span>
    </div>

    <div class="pr-progress" :title="`${stats.done} of ${stats.issues} issues done`">
      <el-progress :percentage="completionPct" :stroke-width="5" :show-text="false" :color="progressColor" />
      <span class="pr-progress-text">{{ completionPct }}%</span>
    </div>

    <div class="pr-counts">
      <button type="button" class="pr-count" title="Issues" @click.stop="emit('tab', 'issues')">
        <el-icon><Tickets /></el-icon>{{ stats.issues }}
      </button>
            <button type="button" class="pr-count" title="Bugs" @click.stop="emit('tab', 'bugs')">
        <el-icon><WarningFilled /></el-icon>{{ stats.totalBugs }}
      </button>
    </div>

    <div class="pr-members" title="Members" @click.stop="emit('tab', 'members')">
      <el-avatar v-for="m in visibleMembers" :key="m.user_id" :size="20" :src="m.avatar" :title="m.username">
        {{ m.username.charAt(0).toUpperCase() }}
      </el-avatar>
      <span v-if="extraMembers" class="pr-members-more">+{{ extraMembers }}</span>
    </div>

    <span class="pr-date">{{ formatRelativeTime(project.updated_at) }}</span>

    <div class="pr-actions">
      <el-button
        link
        size="small"
        :icon="Star"
        :type="starred ? 'warning' : 'info'"
        title="Star"
        @click.stop="emit('toggle-star')"
      />
      <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd)">
        <el-button link size="small" :icon="MoreFilled" @click.stop />
        <template #dropdown>
          <el-dropdown-menu>
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
</template>

<script setup lang="ts" name="ProjectRow">
import { computed } from "vue";
import { Calendar, MoreFilled, Star, Tickets, WarningFilled } from "@element-plus/icons-vue";
import { formatRelativeTime } from "@/utils/datetime";
import type { Project } from "@/api/modules/projectService";
import { RISK_META, type HealthLevel, type ProjectStats, type RiskKey } from "../types";
import { HEALTH_COLORS } from "../constants";

const props = defineProps<{
  project: Project;
  stats: ProjectStats;
  risks: RiskKey[];
  health: HealthLevel;
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

const healthHint = computed(() =>
  props.risks.length ? props.risks.map(r => RISK_META[r].label).join(", ") : "Healthy — no checks failing"
);

const completionPct = computed(() => (props.stats.issues ? Math.round((props.stats.done / props.stats.issues) * 100) : 0));

const progressColor = computed(() => {
  const pct = completionPct.value;
  if (pct >= 100) return "#67c23a";
  if (pct >= 50) return "#409eff";
  return "#e6a23c";
});

const visibleMembers = computed(() => (props.project.members || []).slice(0, 3));
const extraMembers = computed(() => Math.max(0, (props.project.members?.length || 0) - 3));

function handleCommand(cmd: string) {
  switch (cmd) {
    case "edit": emit("edit"); break;
    case "archive": emit("archive"); break;
    case "restore": emit("restore"); break;
  }
}
</script>

<style scoped lang="scss">
.pr-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 9px 14px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 9px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}
.pr-row--selected {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}
.pr-row--archived .pr-name {
  color: var(--el-text-color-secondary);
}
.pr-select {
  flex-shrink: 0;
  height: auto;
}
.pr-health {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background: var(--health-color);
  border-radius: 50%;
}
.pr-ident {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 1px;
  width: 190px;
  min-width: 0;
}
.pr-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.pr-id {
  align-self: flex-start;
  padding: 0 4px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 3px;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.pr-status {
  flex-shrink: 0;
}
.pr-risks {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  align-items: center;
  width: 200px;
  overflow: hidden;
}
.pr-risk-chip {
  padding: 0 6px;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
  border: 1px solid;
  border-radius: 8px;
}
.pr-risk-more {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}
.pr-progress {
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: center;
  min-width: 90px;
}
.pr-progress-text {
  flex-shrink: 0;
  width: 30px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}
.pr-counts {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
}
.pr-count {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 2px 7px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  .el-icon {
    font-size: 12px;
  }
}
.pr-members {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  width: 74px;
  :deep(.el-avatar) {
    font-size: 10px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
    border: 2px solid var(--el-bg-color);
    &:not(:first-child) {
      margin-left: -8px;
    }
  }
}
.pr-members-more {
  margin-left: 3px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
.pr-date {
  flex-shrink: 0;
  width: 92px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  text-align: right;
}

/* Hover-reveal action cluster, sized so the row never reflows on hover. */
.pr-actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  align-items: center;
  justify-content: flex-end;
  width: 56px;
  opacity: 0;
  transition: opacity 0.2s;
  .pr-row:hover &,
  .pr-row:focus-within & {
    opacity: 1;
  }
}
</style>
