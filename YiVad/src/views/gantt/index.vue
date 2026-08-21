<template>
  <div class="gantt">
    <div class="gantt__head">
      <div class="gantt__head-left">
        <h1 class="gantt__title">Gantt Chart</h1>
        <el-tag size="small" type="info">{{ totalIssues }} issues</el-tag>
      </div>
      <div class="gantt__head-right">
        <el-select v-model="projectFilter" placeholder="Filter by project" clearable style="width: 180px" @change="loadData">
          <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
        </el-select>
        <el-radio-group v-model="viewMode" size="small" @change="renderGantt">
          <el-radio-button value="week">Week</el-radio-button>
          <el-radio-button value="month">Month</el-radio-button>
          <el-radio-button value="quarter">Quarter</el-radio-button>
        </el-radio-group>
        <el-button :icon="Refresh" @click="loadData">Refresh</el-button>
      </div>
    </div>

    <div v-loading="loading" class="gantt__body">
      <div class="gantt__table">
        <!-- Sidebar -->
        <div class="gantt__sidebar">
          <div class="gantt__sidebar-header">Issue</div>
          <div
            v-for="item in ganttItems"
            :key="item.key"
            class="gantt__sidebar-row"
            @click="goDetail(item.key)"
          >
            <span class="gantt__sidebar-title">{{ item.title }}</span>
            <span class="gantt__sidebar-meta">{{ item.assignee || 'Unassigned' }}</span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="gantt__timeline" ref="timelineRef">
          <div class="gantt__timeline-header">
            <div
              v-for="col in timeColumns"
              :key="col.label"
              class="gantt__timeline-col"
              :class="{ 'gantt__timeline-col--weekend': col.isWeekend, 'gantt__timeline-col--today': col.isToday }"
              :style="{ width: colWidth + 'px' }"
            >
              {{ col.label }}
            </div>
          </div>
          <div
            v-for="item in ganttItems"
            :key="item.key"
            class="gantt__timeline-row"
          >
            <div
              v-for="(col, ci) in timeColumns"
              :key="ci"
              class="gantt__timeline-cell"
              :class="{ 'gantt__timeline-cell--weekend': col.isWeekend, 'gantt__timeline-cell--today': col.isToday }"
              :style="{ width: colWidth + 'px' }"
            />
            <div
              v-if="item._bar"
              class="gantt__bar"
              :style="{
                left: item._bar.left + 'px',
                width: Math.max(item._bar.width, 4) + 'px',
                background: item._bar.color
              }"
              :title="item.title"
              @click="goDetail(item.key)"
            >
              <span class="gantt__bar-label">{{ item.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ganttChart">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Refresh } from "@element-plus/icons-vue";
import { useIssueStore } from "@/stores/modules/issue";
import { useProjectStore } from "@/stores/modules/project";
import type { Issue } from "@/api/modules/issueService";

const router = useRouter();
const issueStore = useIssueStore();
const projectStore = useProjectStore();

const loading = ref(false);
const projectFilter = ref("");
const viewMode = ref<"week" | "month" | "quarter">("month");
const projects = ref<{ key: string; name: string }[]>([]);
const totalIssues = ref(0);
const timelineRef = ref<HTMLElement | null>(null);

interface GanttItem {
  key: string;
  title: string;
  assignee?: string;
  start_date: string;
  due_date: string;
  priority: string;
  _bar?: { left: number; width: number; color: string };
}

const ganttItems = ref<GanttItem[]>([]);

const colWidth = computed(() => {
  return viewMode.value === "week" ? 40 : viewMode.value === "month" ? 80 : 30;
});

const timeColumns = computed(() => {
  const items = ganttItems.value;
  if (!items.length) return [];

  const dates = items
    .flatMap(i => [i.start_date, i.due_date].filter(Boolean))
    .map(d => new Date(d).getTime())
    .filter(n => !isNaN(n));

  if (!dates.length) return [];

  let start = new Date(Math.min(...dates));
  let end = new Date(Math.max(...dates));
  // Pad by one period
  if (viewMode.value === "week") {
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate() - start.getDay());
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate() + (6 - end.getDay()) + 7);
  } else if (viewMode.value === "month") {
    start = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    end = new Date(end.getFullYear(), end.getMonth() + 2, 0);
  } else {
    start = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3 - 3, 1);
    end = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3 + 6, 0);
  }

  const cols: Array<{ label: string; isWeekend: boolean; isToday: boolean; ts: number }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const current = new Date(start);

  while (current <= end) {
    const isToday = current.getTime() === today.getTime();
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (viewMode.value === "week") {
      cols.push({
        label: `${current.getMonth() + 1}/${current.getDate()}`,
        isWeekend,
        isToday,
        ts: current.getTime()
      });
      current.setDate(current.getDate() + 1);
    } else if (viewMode.value === "month") {
      cols.push({
        label: `${current.getMonth() + 1}/${current.getDate()}`,
        isWeekend,
        isToday,
        ts: current.getTime()
      });
      current.setDate(current.getDate() + 1);
    } else {
      const q = Math.floor(current.getMonth() / 3) + 1;
      cols.push({
        label: `${current.getFullYear()} Q${q}`,
        isWeekend: false,
        isToday,
        ts: current.getTime()
      });
      current.setMonth(current.getMonth() + 3);
    }
  }

  return cols;
});

function renderGantt() {
  if (!timeColumns.value.length) return;
  const firstTs = timeColumns.value[0].ts;
  const lastTs = timeColumns.value[timeColumns.value.length - 1].ts;
  const totalRange = lastTs - firstTs || 1;
  const totalWidth = timeColumns.value.length * colWidth.value;

  const priorityColors: Record<string, string> = {
    urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc"
  };

  ganttItems.value = ganttItems.value.map(item => {
    const startTs = new Date(item.start_date).getTime();
    const endTs = new Date(item.due_date).getTime();
    if (isNaN(startTs) || isNaN(endTs)) return item;

    const left = ((startTs - firstTs) / totalRange) * totalWidth;
    const width = ((endTs - startTs) / totalRange) * totalWidth;
    return {
      ...item,
      _bar: {
        left: Math.max(0, left),
        width: Math.max(4, Math.min(width, totalWidth - left)),
        color: priorityColors[item.priority] || "#409eff"
      }
    };
  });
}

async function loadData() {
  loading.value = true;
  try {
    const params: any = { pageSize: 500 };
    if (projectFilter.value) params.project_key = projectFilter.value;

    await issueStore.fetchIssues(params);
    const issues = issueStore.issues
      .filter(i => i.start_date && i.due_date)
      .sort((a, b) => a.start_date!.localeCompare(b.start_date!));

    totalIssues.value = issues.length;
    ganttItems.value = issues.map(i => ({
      key: i.key,
      title: i.title,
      assignee: i.assignee,
      start_date: i.start_date!,
      due_date: i.due_date!,
      priority: i.priority
    }));

    renderGantt();
  } finally {
    loading.value = false;
  }
}

function goDetail(key: string) {
  router.push(`/issue/${key}`);
}

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
  loadData();
});
</script>

<style scoped lang="scss">
.gantt {
  padding: 24px;
  height: calc(100vh - 95px);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
  overflow: hidden;
}
.gantt__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.gantt__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.gantt__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.gantt__head-right {
  display: flex;
  gap: 10px;
  align-items: center;
}
.gantt__body {
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
}
.gantt__table {
  display: flex;
  height: 100%;
  overflow: hidden;
}
.gantt__sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color);
  overflow-y: auto;
  background: var(--el-bg-color);
}
.gantt__sidebar-header {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-lighter);
  height: 36px;
  display: flex;
  align-items: center;
}
.gantt__sidebar-row {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.gantt__sidebar-title {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gantt__sidebar-meta {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.gantt__timeline {
  flex: 1;
  overflow: auto;
  position: relative;
}
.gantt__timeline-header {
  display: flex;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-lighter);
  position: sticky;
  top: 0;
  z-index: 2;
  height: 36px;
}
.gantt__timeline-col {
  padding: 8px 2px;
  font-size: 10px;
  text-align: center;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  overflow: hidden;
  white-space: nowrap;
  border-right: 1px solid var(--el-border-color-lighter);
  &--weekend {
    background: var(--el-fill-color);
  }
  &--today {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }
}
.gantt__timeline-row {
  position: relative;
  display: flex;
  height: 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.gantt__timeline-cell {
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color-lighter);
  &--weekend {
    background: var(--el-fill-color-lighter);
  }
  &--today {
    background: var(--el-color-primary-light-9);
  }
}
.gantt__bar {
  position: absolute;
  top: 8px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 8px;
  z-index: 1;
  opacity: 0.85;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
}
.gantt__bar-label {
  font-size: 11px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>