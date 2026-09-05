<template>
  <div>
    <div class="dr-stats">
      <div class="dr-stats__pill dr-stats__pill--info">
        <span class="dr-stats__val">{{ reqStats.total }}</span>
        <span class="dr-stats__lbl">{{ $t("project.requirements.stats.total") }}</span>
      </div>
      <div class="dr-stats__pill">
        <span class="dr-stats__val">{{ reqStats.todo }}</span>
        <span class="dr-stats__lbl">{{ $t("project.requirements.stats.todo") }}</span>
      </div>
      <div class="dr-stats__pill dr-stats__pill--primary">
        <span class="dr-stats__val">{{ reqStats.inProgress }}</span>
        <span class="dr-stats__lbl">{{ $t("project.requirements.stats.inProgress") }}</span>
      </div>
      <div class="dr-stats__pill dr-stats__pill--success">
        <span class="dr-stats__val">{{ reqStats.done }}</span>
        <span class="dr-stats__lbl">{{ $t("project.requirements.stats.done") }}</span>
      </div>
    </div>

    <div class="dr-progress">
      <div class="dr-progress__bar">
        <div class="dr-progress__fill dr-progress__fill--done" :style="{ width: reqStats.pct + '%' }" />
      </div>
      <span class="dr-progress__label">{{ reqStats.done }}/{{ reqStats.total }} {{ $t("project.requirements.stats.completed") }}</span>
    </div>

    <div class="dr-toolbar">
      <div class="dr-toolbar__filters">
        <el-button
          v-for="s in statusOptions"
          :key="s.value"
          size="small"
          :type="reqStatusFilter === s.value ? 'primary' : ''"
          :plain="reqStatusFilter !== s.value"
          round
          @click="reqStatusFilter = s.value"
        >{{ s.label }} <span v-if="s.value && statusCounts[s.value]" class="dr-toolbar__count">{{ statusCounts[s.value] }}</span></el-button>
      </div>
      <div class="dr-toolbar__right">
        <el-input
          v-model="reqSearch"
          :placeholder="$t('project.requirements.searchPlaceholder')"
          size="small"
          clearable
          :prefix-icon="Search"
          style="width: 220px"
        />
      </div>
    </div>

    <div v-if="filteredItems.length" class="dr-table-wrap">
      <el-table :data="filteredItems" stripe size="small" style="width: 100%">
        <el-table-column :label="$t('project.requirements.table.prd')" width="90">
          <template #default="{ row }">
            <span v-if="row.prd_task_id">{{ row.prd_task_id }}</span>
            <span v-else class="dr-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.requirements.table.title')" min-width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="openPreview(row as RequireItem)">{{ row.title }}</el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.requirements.table.priority')" width="100">
          <template #default="{ row }">
            <span class="dr-priority">
              <span class="dr-priority__dot" :class="`dr-priority__dot--${row.priority}`" />
              {{ row.priority }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.requirements.table.assignee')" width="110">
          <template #default="{ row }">
            <span v-if="row.assignee">{{ row.assignee }}</span>
            <span v-else class="dr-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.requirements.table.status')" width="110">
          <template #default="{ row }">
            <span class="dr-status" :class="`dr-status--${row.status}`">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.requirements.table.estimate')" width="70" align="center">
          <template #default="{ row }">
            <span v-if="row.estimate_frontend" class="dr-est">{{ row.estimate_frontend }}d</span>
            <span v-else class="dr-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.requirements.table.month')" width="100">
          <template #default="{ row }">
            <span v-if="row.prd_month">{{ formatPrdMonth(row.prd_month) }}</span>
            <span v-else class="dr-muted">—</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-empty v-else :description="$t('project.requirements.empty')" :image-size="60" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import type { Project } from "@/api/modules/projectService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import type { RequireItem } from "@/views/project/types";

const props = defineProps<{
  project: Project;
  knowledgeFiles: KnowledgeFileEntry[];
  previewDlgRef: any;
}>();

const reqStatusFilter = ref("");
const reqSearch = ref("");

const statusOptions = [
  { label: "全部", value: "" },
  { label: "待开始", value: "待开始" },
  { label: "进行中", value: "进行中" },
  { label: "已完成", value: "已完成" },
  { label: "待排期", value: "待排期" },
  { label: "已取消", value: "已取消" }
];

const requireItems = computed<RequireItem[]>(() => {
  const key = props.project?.key || "";
  const prefix = `projects/${key}/requires/`;
  return props.knowledgeFiles
    .filter(f => f.path.startsWith(prefix) && f.path.endsWith(".md") && f.name !== "需求文档.md")
    .map(f => {
      const parts = f.path.split("/");
      const month = parts.length >= 4 ? parts[parts.length - 2] : "";
      return {
        title: (f.meta?.title as string) || f.name.replace(/\.md$/, ""),
        path: f.path,
        status: (f.meta?.status as string) || "unknown",
        priority: (f.meta?.priority as string) || "none",
        assignee: (f.meta?.owner as string) || (f.meta?.assignee as string) || "",
        estimate_frontend: (f.meta?.estimate_frontend as number) || 0,
        prd_task_id: (f.meta?.prd_task_id as string) || "",
        prd_month: month
      };
    })
    .sort((a, b) => String(a.prd_task_id || "").localeCompare(String(b.prd_task_id || "")));
});

const statusCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const item of requireItems.value) {
    counts[item.status] = (counts[item.status] || 0) + 1;
  }
  return counts;
});

const filteredItems = computed(() => {
  let items = requireItems.value;
  if (reqStatusFilter.value) {
    items = items.filter(i => i.status === reqStatusFilter.value);
  }
  const search = reqSearch.value.trim().toLowerCase();
  if (search) {
    items = items.filter(i =>
      i.title.toLowerCase().includes(search) ||
      (i.assignee || "").toLowerCase().includes(search) ||
      (i.prd_task_id || "").toLowerCase().includes(search)
    );
  }
  return items;
});

const reqStats = computed(() => {
  const items = requireItems.value;
  const done = items.filter(i => i.status === "已完成").length;
  const inProgress = items.filter(i => i.status === "进行中").length;
  const todo = items.filter(i => i.status === "待开始").length;
  const total = items.length;
  return { total, done, inProgress, todo, pct: total ? Math.round((done / total) * 100) : 0 };
});

function formatPrdMonth(m: string): string {
  if (m.length === 6) return `${m.slice(0, 4)}-${m.slice(4)}`;
  return m;
}

function openPreview(row: RequireItem) {
  props.previewDlgRef?.open(row.path);
}
</script>

<style scoped lang="scss">
.dr-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.dr-stats__pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
  padding: 10px 16px;
  border-radius: 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  &--info { border-color: var(--el-color-info-light-5); background: var(--el-color-info-light-9); }
  &--primary { border-color: var(--el-color-primary-light-5); background: var(--el-color-primary-light-9); }
  &--success { border-color: var(--el-color-success-light-5); background: var(--el-color-success-light-9); }
}
.dr-stats__val {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}
.dr-stats__lbl {
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
}
.dr-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.dr-progress__bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--el-fill-color);
  overflow: hidden;
}
.dr-progress__fill {
  height: 100%;
  transition: width 0.3s;
  &--done { background: var(--el-color-success); }
}
.dr-progress__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.dr-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.dr-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dr-toolbar__filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.dr-toolbar__count {
  margin-left: 2px;
  font-size: 11px;
  opacity: 0.7;
}
.dr-table-wrap {
  :deep(.el-table__row) { cursor: pointer; }
}
.dr-priority {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  text-transform: capitalize;
}
.dr-priority__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  &--urgent, &--高 { background: #f56c6c; }
  &--high, &--中 { background: #e6a23c; }
  &--medium, &--低 { background: #409eff; }
  &--low { background: #67c23a; }
  &--none { background: #c0c4cc; }
}
.dr-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  &--todo, &--待开始 { background: var(--el-color-info-light-9); color: var(--el-color-info); }
  &--in_progress, &--进行中 { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
  &--done, &--已完成 { background: var(--el-color-success-light-9); color: var(--el-color-success); }
  &--backlog, &--待排期 { background: var(--el-fill-color); color: var(--el-text-color-secondary); }
  &--cancelled, &--已取消 { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
  &--unknown { background: var(--el-fill-color); color: var(--el-text-color-placeholder); }
}
.dr-est {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.dr-muted {
  color: var(--el-text-color-placeholder);
}
</style>