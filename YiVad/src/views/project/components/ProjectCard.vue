<template>
  <article
    class="pc-card"
    :class="{ 'pc-card--archived': project.status === 'archived', 'pc-card--selected': selected }"
    @click="emit('open')"
  >
    <span class="pc-accent" :style="{ background: HEALTH_COLORS[health] }" :title="healthHint" />

    <div class="pc-main">
      <div class="pc-cover" :style="coverStyle">
        <div class="pc-cover-pattern" />
        <el-checkbox
          class="pc-select"
          :class="{ 'is-shown': selected }"
          :model-value="selected"
          size="large"
          @click.stop
          @change="emit('toggle-select')"
        />
        <span v-if="!project.cover_image" class="pc-cover-icon">{{ project.name.charAt(0).toUpperCase() }}</span>
        <span class="pc-cover-id">{{ project.identifier }}</span>
      </div>

      <div class="pc-body">
        <div class="pc-name-row">
          <span class="pc-health-dot" :style="{ background: HEALTH_COLORS[health] }" :title="healthHint" />
          <span class="pc-name" :title="project.name">{{ project.name }}</span>
          <el-button
            link
            size="small"
            :icon="Star"
            :type="starred ? 'warning' : 'info'"
            class="pc-star"
            :class="{ 'is-on': starred }"
            title="Star this project"
            @click.stop="emit('toggle-star')"
          />
          <el-icon class="pc-arrow"><Right /></el-icon>
        </div>

        <div class="pc-meta">
          <code class="pc-id-chip" title="Copy identifier" @click.stop="emit('copy-id')">{{ project.identifier }}</code>
          <el-tag :type="project.status === 'active' ? 'success' : 'info'" size="small">{{ project.status }}</el-tag>
          <span class="pc-date" :title="'Updated ' + formatRelativeTime(project.updated_at)">Updated {{ formatRelativeTime(project.updated_at) }}</span>
        </div>

        <div v-if="risks.length" class="pc-risks">
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
          <span v-if="risks.length > 2" class="pc-risk-more" :title="extraRiskHint">+{{ risks.length - 2 }}</span>
        </div>

        <div v-if="project.description" class="pc-desc" v-html="descHtml" />
        <div v-else class="pc-desc pc-desc--empty">No description</div>

        <div v-if="stats.issues" class="pc-progress">
          <div class="pc-progress-row">
            <span>{{ stats.done }} / {{ stats.issues }} done</span>
            <span>{{ completionPct }}%</span>
          </div>
          <div class="pc-progress-bar">
            <div class="pc-progress-fill" :style="{ width: completionPct + '%', background: progressGradient }" />
          </div>
        </div>

        <div class="pc-stats">
          <button type="button" class="pc-stat" title="Issues" @click.stop="emit('tab', 'issues')">
            <el-icon><Tickets /></el-icon><span>{{ stats.issues }}</span>
          </button>
          <button type="button" class="pc-stat" title="Cycles" @click.stop="emit('tab', 'cycles')">
            <el-icon><Calendar /></el-icon><span>{{ stats.cycles }}</span>
          </button>
          <button type="button" class="pc-stat" title="Releases" @click.stop="emit('tab', 'releases')">
            <el-icon><Promotion /></el-icon><span>{{ stats.releases }}</span>
          </button>
          <button type="button" class="pc-stat" title="Bugs" @click.stop="emit('tab', 'bugs')">
            <el-icon><WarningFilled /></el-icon><span>{{ stats.totalBugs }}</span>
          </button>
          <span v-if="stats.overdue" class="pc-stat-badge pc-stat-badge--danger" title="Overdue issues" @click.stop="emit('tab', 'issues')">
            {{ stats.overdue }} overdue
          </span>
          <span v-if="stats.activeCycles" class="pc-stat-badge pc-stat-badge--warn" title="Active cycles" @click.stop="emit('tab', 'cycles')">
            {{ stats.activeCycles }} active
          </span>
          <span v-if="stats.pendingReleases" class="pc-stat-badge pc-stat-badge--ok" title="Pending releases" @click.stop="emit('tab', 'releases')">
            {{ stats.pendingReleases }} pending
          </span>
        </div>

        <div class="pc-footer">
          <div class="pc-members" title="View members" @click.stop="emit('tab', 'members')">
            <template v-if="project.members?.length">
              <el-avatar v-for="m in visibleMembers" :key="m.user_id" :size="26" :src="m.avatar" :title="m.username">
                {{ m.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span v-if="extraMembers" class="pc-members-more">+{{ extraMembers }}</span>
            </template>
            <span v-else class="pc-members-empty">No members</span>
          </div>
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
import { Calendar, MoreFilled, Promotion, Right, Star, Tickets, WarningFilled } from "@element-plus/icons-vue";
import { formatRelativeTime } from "@/utils/datetime";
import type { Project } from "@/api/modules/projectService";
import { RISK_META, type HealthLevel, type ProjectStats, type RiskKey } from "../composables/useProjectInsights";

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
  (e: "tab", tab: "issues" | "cycles" | "releases" | "members" | "bugs"): void;
}>();

const HEALTH_COLORS: Record<HealthLevel, string> = {
  good: "#67c23a",
  warn: "#e6a23c",
  poor: "#f56c6c"
};

const HEALTH_HINTS: Record<HealthLevel, string> = {
  good: "Healthy — no checks failing",
  warn: "Needs a look",
  poor: "At risk"
};

const healthHint = computed(() =>
  props.risks.length
    ? `${HEALTH_HINTS[props.health]}: ${props.risks.map(r => RISK_META[r].label).join(", ")}`
    : HEALTH_HINTS[props.health]
);

const extraRiskHint = computed(() =>
  props.risks
    .slice(2)
    .map(r => RISK_META[r].label)
    .join(", ")
);

// Deterministic cover gradient so a project keeps the same colour across loads.
const COVER_GRADIENTS: Array<[string, string]> = [
  ["#6c5ce7", "#a29bfe"],
  ["#e17055", "#fab1a0"],
  ["#0984e3", "#74b9ff"],
  ["#00b894", "#55efc4"],
  ["#e84393", "#fd79a8"],
  ["#6c5ce7", "#4834d4"],
  ["#00cec9", "#81ecec"],
  ["#fdcb6e", "#ffeaa7"]
];

const coverStyle = computed(() => {
  if (props.project.cover_image) {
    return { backgroundImage: `url(${props.project.cover_image})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  let h = 0;
  for (let i = 0; i < props.project.key.length; i++) h = (h * 31 + props.project.key.charCodeAt(i)) | 0;
  const [from, to] = COVER_GRADIENTS[Math.abs(h) % COVER_GRADIENTS.length];
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
});

const completionPct = computed(() => (props.stats.issues ? Math.round((props.stats.done / props.stats.issues) * 100) : 0));

const progressGradient = computed(() => {
  const pct = completionPct.value;
  if (pct >= 100) return "linear-gradient(90deg, #52c41a, #73d13d)";
  if (pct >= 60) return "linear-gradient(90deg, #409eff, #69c0ff)";
  if (pct >= 30) return "linear-gradient(90deg, #faad14, #ffc53d)";
  return "linear-gradient(90deg, #ff7875, #ffa39e)";
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
  display: flex;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 8px 30px rgb(0 0 0 / 12%);
    transform: translateY(-3px);
  }
}
.pc-card--selected {
  border-color: var(--el-color-primary);
  box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
}
.pc-card--archived {
  .pc-cover {
    filter: grayscale(0.7) brightness(0.85);
  }
  .pc-name {
    color: var(--el-text-color-secondary);
  }
}

/* Health as a left edge strip — readable at a glance down a whole column. */
.pc-accent {
  flex-shrink: 0;
  width: 4px;
}
.pc-main {
  flex: 1;
  min-width: 0;
}
.pc-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96px;
  overflow: hidden;
}
.pc-cover-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgb(255 255 255 / 8%) 1px, transparent 1px);
  background-size: 16px 16px;
  pointer-events: none;
}
.pc-select {
  position: absolute;
  top: 6px;
  left: 8px;
  opacity: 0;
  transition: opacity 0.15s;
  &.is-shown {
    opacity: 1;
  }
  .pc-card:hover & {
    opacity: 1;
  }
  :deep(.el-checkbox__inner) {
    background: rgb(0 0 0 / 25%);
    border-color: rgb(255 255 255 / 70%);
  }
}
.pc-cover-icon {
  font-size: 42px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 8px rgb(0 0 0 / 20%);
  opacity: 0.9;
}
.pc-cover-id {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: rgb(255 255 255 / 85%);
  letter-spacing: 1px;
}
.pc-body {
  padding: 14px 16px 16px;
}
.pc-name-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}
.pc-health-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.pc-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}
.pc-star {
  flex-shrink: 0;
  opacity: 0.35;
  transition: opacity 0.15s;
  &.is-on,
  &:hover {
    opacity: 1;
  }
}
.pc-arrow {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--el-text-color-placeholder);
  transition:
    color 0.2s,
    transform 0.2s;
  .pc-card:hover & {
    color: var(--el-color-primary);
    transform: translateX(3px);
  }
}
.pc-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.pc-id-chip {
  padding: 1px 6px;
  font-size: 12px;
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
.pc-date {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.pc-risks {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  margin-bottom: 8px;
}
.pc-risk-chip {
  padding: 0 7px;
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
.pc-risk-more {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}
.pc-desc {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--el-text-color-secondary);
  overflow-wrap: break-word;
  &--empty {
    display: block;
    font-style: italic;
    color: var(--el-text-color-placeholder);
  }
  :deep(p) {
    margin: 0 0 8px;
  }
  :deep(p:last-child) {
    margin-bottom: 0;
  }
  :deep(strong) {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  :deep(em) {
    font-style: italic;
  }
  :deep(code) {
    padding: 1px 5px;
    font-family: monospace;
    font-size: 12px;
    color: var(--el-color-danger);
    background: var(--el-fill-color-light);
    border-radius: 3px;
  }
  :deep(a) {
    color: var(--el-color-primary);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  :deep(ul),
  :deep(ol) {
    padding-left: 18px;
    margin: 0 0 8px;
  }
  :deep(li) {
    margin: 2px 0;
  }
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  :deep(blockquote) {
    padding-left: 10px;
    margin: 0 0 8px;
    color: var(--el-text-color-placeholder);
    border-left: 3px solid var(--el-border-color);
  }
  :deep(pre) {
    padding: 8px;
    margin: 0 0 8px;
    overflow: auto;
    font-size: 12px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }
}
.pc-progress {
  margin-bottom: 12px;
}
.pc-progress-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.pc-progress-bar {
  height: 6px;
  overflow: hidden;
  background: var(--el-fill-color);
  border-radius: 3px;
}
.pc-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}
.pc-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  margin-bottom: 12px;
}
.pc-stat {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 3px 8px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 5px;
  transition:
    color 0.15s,
    background 0.15s,
    border-color 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
  .el-icon {
    font-size: 13px;
  }
}
.pc-stat-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 5px;
  transition: filter 0.15s;
  &:hover {
    filter: brightness(0.92);
  }
  &--danger {
    color: #fff;
    background: #f56c6c;
  }
  &--warn {
    color: #fff;
    background: #e6a23c;
  }
  &--ok {
    color: #fff;
    background: #67c23a;
  }
}
.pc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.pc-members {
  display: flex;
  gap: 4px;
  align-items: center;
  cursor: pointer;
  :deep(.el-avatar) {
    font-size: 12px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
    border: 2px solid var(--el-bg-color);
    &:not(:first-child) {
      margin-left: -10px;
    }
  }
}
.pc-members-more {
  margin-left: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.pc-members-empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.pc-more {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
  .pc-card:hover &,
  .pc-card:focus-within & {
    opacity: 1;
  }
}
</style>
