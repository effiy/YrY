<template>
  <div class="dt-root">
    <!-- ═══ Summary Bar ═══ -->
    <div class="dt-summary">
      <div class="dt-summary__item">
        <span class="dt-summary__value">{{ flatTestSpecs.length }}</span>
        <span class="dt-summary__label">测试规格</span>
      </div>
      <div class="dt-summary__item">
        <span class="dt-summary__value" style="color: #67c23a">{{ summary.done }}</span>
        <span class="dt-summary__label">已完成</span>
      </div>
      <div class="dt-summary__item">
        <span class="dt-summary__value" style="color: #e6a23c">{{ summary.inProgress }}</span>
        <span class="dt-summary__label">进行中</span>
      </div>
      <div class="dt-summary__item">
        <span class="dt-summary__value" style="color: #909399">{{ summary.pending }}</span>
        <span class="dt-summary__label">待开始</span>
      </div>
    </div>

    <!-- ═══ Test Specs Table ═══ -->
    <ProTable
      v-if="flatTestSpecs.length"
      title="测试规格"
      :columns="testColumns"
      :data="flatTestSpecs"
      :pagination="false"
      row-key="prd_task_id"
    >
      <template #prdMonth="scope">
        <span class="dt-month">{{ formatMonth(scope.row.prd_month) }}</span>
      </template>
      <template #title="scope">
        <el-button v-if="scope.row.path" link size="small" type="primary" @click="openYkFile(scope.row.path)">
          {{ fileName(scope.row.path) }}
        </el-button>
        <span v-else class="dt-muted">-</span>
      </template>
      <template #status="scope">
        <el-tag :type="statusTagType(scope.row.status)" size="small" effect="plain">
          {{ statusLabel(scope.row.status) }}
        </el-tag>
      </template>
      <template #prdTitle="scope">
        <el-button v-if="scope.row.prdPath" link size="small" type="primary" @click="openYkFile(scope.row.prdPath)">
          🔗 链接
        </el-button>
        <span v-else class="dt-muted">-</span>
      </template>
    </ProTable>

    <el-empty v-if="!flatTestSpecs.length" description="暂无测试规格" :image-size="60" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, watch } from "vue";
import { ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import { useProjectDetail, PREVIEW_DLG_KEY } from "@/views/project/types";
import { useTestSpecs, type TestSpec } from "@/views/project/composables/useTestSpecs";
import { useRequirements } from "@/views/project/composables/useRequirements";

const ctx = useProjectDetail();
const { project, knowledgeFiles } = ctx;
const previewDlgRef = inject(PREVIEW_DLG_KEY, null);

// ── YiKnowledge data ──
const { items: testItems, deriveFrom: deriveTests } = useTestSpecs();
const { items: prdItems, deriveFrom: derivePrds } = useRequirements();

watch(() => knowledgeFiles.value, (files) => {
  const key = project.value?.key;
  if (key && files.length) {
    deriveTests(files, key);
    derivePrds(files, key);
  }
}, { immediate: true });

// ── Flat rows (linked to PRD) ──
interface TestSpecRow extends TestSpec {
  prdTitle: string;
  prdPath: string;
}

const flatTestSpecs = computed<TestSpecRow[]>(() => {
  return testItems.value.map(t => {
    const sourcePrd = t.source_prds[0] || "";
    const withMd = sourcePrd.endsWith(".md") ? sourcePrd : sourcePrd + ".md";
    const prd = prdItems.value.find(p => p.path.endsWith(withMd));
    return { ...t, prdTitle: prd?.title || sourcePrd || "", prdPath: prd?.path || "" };
  });
});

// ── Summary ──
const summary = computed(() => {
  const items = flatTestSpecs.value;
  const done = items.filter(i => i.status === "已完成" || i.status === "done").length;
  const inProgress = items.filter(i => i.status === "进行中" || i.status === "in_progress").length;
  const pending = items.length - done - inProgress;
  return { done, inProgress, pending };
});

// ── ProTable columns ──
const testColumns = computed<ColumnProps[]>(() => [
  { prop: "prdMonth", label: "月份", width: 80, sortable: true },
  { prop: "title", label: "测试名称", minWidth: 260 },
  { prop: "prdTitle", label: "来源 PRD", minWidth: 80 },
  { prop: "status", label: "状态", width: 120 },
]);

// ── Helpers ──
function formatMonth(m: string): string {
  if (!m || m.length !== 6) return m || "-";
  return `${m.slice(0, 4)}-${m.slice(4, 6)}`;
}

function fileName(p: string): string {
  if (!p) return "-";
  const name = p.split("/").pop() || "";
  return name.replace(/\.md$/, "");
}

function statusTagType(s: string) {
  switch (s) {
    case "已完成": case "done": return "success";
    case "进行中": case "in_progress": return "warning";
    case "待开始": case "planned": return "info";
    default: return "info";
  }
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    "已完成": "已完成", "done": "已完成",
    "进行中": "进行中", "in_progress": "进行中",
    "待开始": "待开始", "planned": "待开始",
  };
  return map[s] || s;
}

function openYkFile(path: string) {
  previewDlgRef?.value?.open(path);
}
</script>

<style scoped lang="scss">
.dt-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dt-summary {
  display: flex;
  gap: 1px;
  background: var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}

.dt-summary__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 10px;
  background: var(--el-bg-color);
}

.dt-summary__value {
  font-size: 20px;
  font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);
}

.dt-summary__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.dt-seq {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  font-family: "SF Mono", Menlo, monospace;
}

.dt-month {
  font-size: 12px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
}

.dt-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>