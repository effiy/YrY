<template>
  <div class="dt-root">
    <!-- ═══ Summary Bar ═══ -->
    <div class="dt-summary">
      <div class="dt-summary__item">
        <span class="dt-summary__value">{{ flatTestSpecs.length }}</span>
        <span class="dt-summary__label">{{ $t("project.test.summary.title") }}</span>
      </div>
      <div class="dt-summary__item">
        <span class="dt-summary__value" style="color: #67c23a">{{ summary.done }}</span>
        <span class="dt-summary__label">{{ $t("project.test.summary.done") }}</span>
      </div>
      <div class="dt-summary__item">
        <span class="dt-summary__value" style="color: #e6a23c">{{ summary.inProgress }}</span>
        <span class="dt-summary__label">{{ $t("project.test.summary.inProgress") }}</span>
      </div>
      <div class="dt-summary__item">
        <span class="dt-summary__value" style="color: #909399">{{ summary.pending }}</span>
        <span class="dt-summary__label">{{ $t("project.test.summary.pending") }}</span>
      </div>
    </div>

    <!-- ═══ Test Specs Table ═══ -->
    <ProTable
      v-if="flatTestSpecs.length"
      :title="$t('project.test.summary.title')"
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

    <el-empty v-if="!flatTestSpecs.length" :description="$t('project.test.noDocs')" :image-size="60" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import { useProjectDetail, PREVIEW_DLG_KEY } from "@/views/project/types";
import { useTestSpecs, type TestSpec } from "@/views/project/composables/useTestSpecs";
import { useRequirements } from "@/views/project/composables/useRequirements";

const { t } = useI18n();
const ctx = useProjectDetail();
const { project, knowledgeFiles } = ctx;
const previewDlgRef = inject(PREVIEW_DLG_KEY, null);

// ── YiKnowledge data ──
const { items: testItems, deriveFrom: deriveTests } = useTestSpecs();
const { items: prdItems, deriveFrom: derivePrds } = useRequirements();

watch(
  () => knowledgeFiles.value,
  files => {
    const key = project.value?.key;
    if (key && files.length) {
      deriveTests(files, key);
      derivePrds(files, key);
    }
  },
  { immediate: true }
);

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
  { prop: "prdMonth", label: t("project.test.table.month"), width: 80, sortable: true },
  { prop: "title", label: t("project.test.table.testName"), minWidth: 260 },
  { prop: "prdTitle", label: t("project.test.table.sourcePrd"), minWidth: 80 },
  { prop: "status", label: t("project.test.table.status"), width: 120 }
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
    case "已完成":
    case "done":
      return "success";
    case "进行中":
    case "in_progress":
      return "warning";
    case "待开始":
    case "planned":
      return "info";
    default:
      return "info";
  }
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    已完成: "已完成",
    done: "已完成",
    进行中: "进行中",
    in_progress: "进行中",
    待开始: "待开始",
    planned: "待开始"
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
  overflow: hidden;
  background: var(--el-border-color-lighter);
  border-radius: 10px;
}
.dt-summary__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  padding: 12px 10px;
  background: var(--el-bg-color);
}
.dt-summary__value {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 20px;
  font-weight: 800;
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
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.dt-month {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.dt-muted {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
