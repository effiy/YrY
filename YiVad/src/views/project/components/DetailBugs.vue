<template>
  <div class="db-root">
    <!-- ═══ Summary Bar ═══ -->
    <div class="db-summary">
      <div class="db-summary__item">
        <span class="db-summary__value">{{ items.length }}</span>
        <span class="db-summary__label">{{ $t("project.bugs.stats.total") }}</span>
      </div>
      <div class="db-summary__item">
        <span class="db-summary__value" style="color: #f56c6c">{{ summary.open }}</span>
        <span class="db-summary__label">{{ $t("project.bugs.stats.open") }}</span>
      </div>
      <div class="db-summary__item">
        <span class="db-summary__value" style="color: #67c23a">{{ summary.resolved }}</span>
        <span class="db-summary__label">{{ $t("project.bugs.stats.resolved") }}</span>
      </div>
      <div class="db-summary__item">
        <span class="db-summary__value" style="color: #909399">{{ summary.closed }}</span>
        <span class="db-summary__label">{{ $t("project.bugs.stats.closed") }}</span>
      </div>
    </div>

    <!-- ═══ Bugs Table ═══ -->
    <ProTable
      v-if="items.length"
      title="缺陷"
      :columns="bugColumns"
      :data="items"
      :pagination="false"
      row-key="path"
    >
      <template #prdMonth="scope">
        <span class="db-month">{{ scope.row.prdMonth || '-' }}</span>
      </template>
      <template #title="scope">
        <el-button v-if="scope.row.path" link size="small" type="primary" @click="openYkFile(scope.row.path)">
          {{ fileName(scope.row.path) }}
        </el-button>
        <span v-else class="db-muted">-</span>
      </template>
      <template #status="scope">
        <el-tag :type="statusTagType(scope.row.status)" size="small" effect="plain">
          {{ scope.row.status }}
        </el-tag>
      </template>
      <template #category="scope">
        <span class="db-category">{{ scope.row.category }}</span>
      </template>
      <template #module="scope">
        <code class="db-module">{{ scope.row.module || '-' }}</code>
      </template>
      <template #updated="scope">
        <span class="db-date">{{ scope.row.updated || '-' }}</span>
      </template>
    </ProTable>

    <el-empty v-if="!items.length" :description="$t('project.bugs.empty')" :image-size="60" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, watch } from "vue";
import { ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import { useProjectDetail, PREVIEW_DLG_KEY } from "@/views/project/types";
import { useBugs } from "@/views/project/composables/useBugs";

const ctx = useProjectDetail();
const { project, knowledgeFiles } = ctx;
const previewDlgRef = inject(PREVIEW_DLG_KEY, null);

const { items, deriveFrom } = useBugs();

watch(() => knowledgeFiles.value, (files) => {
  const key = project.value?.key;
  if (key && files.length) {
    deriveFrom(files, key);
  }
}, { immediate: true });

// ── Summary ──
const summary = computed(() => {
  const list = items.value;
  const open = list.filter(i =>
    i.status === "open" || i.status === "analyzing" || i.status === "in_progress"
  ).length;
  const resolved = list.filter(i => i.status === "resolved" || i.status === "verified").length;
  const closed = list.filter(i => i.status === "closed").length;
  return { open, resolved, closed };
});

// ── ProTable columns ──
const bugColumns = computed<ColumnProps[]>(() => [
  { prop: "prdMonth", label: "月份", width: 80, sortable: true },
  { prop: "title", label: "标题", minWidth: 280 },
  { prop: "category", label: "分类", width: 90 },
  { prop: "module", label: "模块", minWidth: 160 },
  { prop: "updated", label: "更新", width: 100, sortable: true },
  { prop: "status", label: "状态", width: 120 },
]);

// ── Helpers ──
function fileName(p: string): string {
  if (!p) return "-";
  const name = p.split("/").pop() || "";
  return name.replace(/\.md$/, "");
}


function statusTagType(s: string) {
  switch (s) {
    case "open": case "analyzing": return "danger";
    case "in_progress": return "warning";
    case "resolved": case "verified": return "success";
    case "closed": return "info";
    default: return "info";
  }
}

function openYkFile(path: string) {
  previewDlgRef?.value?.open(path);
}
</script>

<style scoped lang="scss">
.db-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── Summary bar ──
.db-summary {
  display: flex;
  gap: 1px;
  background: var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}

.db-summary__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 10px;
  background: var(--el-bg-color);
}

.db-summary__value {
  font-size: 20px;
  font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);
}

.db-summary__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}


.db-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.db-category {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.db-module {
  font-size: 11px;
  padding: 1px 5px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 3px;
  color: var(--el-text-color-secondary);
}

.db-date {
  font-size: 12px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
}

.db-month {
  font-size: 12px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
}
</style>