<template>
  <div class="dd-root">
    <!-- ═══ Summary Bar ═══ -->
    <div class="dd-summary">
      <div class="dd-summary__item">
        <span class="dd-summary__value">{{ flatDevModules.length }}</span>
        <span class="dd-summary__label">{{ $t("project.overview.modules.summary.title") }}</span>
      </div>
      <div class="dd-summary__item">
        <span class="dd-summary__value" style="color: #67c23a">{{ summary.done }}</span>
        <span class="dd-summary__label">{{ $t("project.overview.modules.summary.done") }}</span>
      </div>
      <div class="dd-summary__item">
        <span class="dd-summary__value" style="color: #e6a23c">{{ summary.inProgress }}</span>
        <span class="dd-summary__label">{{ $t("project.overview.modules.summary.inProgress") }}</span>
      </div>
      <div class="dd-summary__item">
        <span class="dd-summary__value" style="color: #909399">{{ summary.pending }}</span>
        <span class="dd-summary__label">{{ $t("project.overview.modules.summary.pending") }}</span>
      </div>
    </div>

    <!-- ═══ Dev Tasks Table ═══ -->
    <ProTable
      v-if="flatDevModules.length"
      :title="$t('project.overview.modules.summary.title')"
      :columns="devColumns"
      :data="flatDevModules"
      :pagination="false"
      row-key="prd_task_id"
    >
      <template #prdMonth="scope">
        <span class="dd-month">{{ formatMonth(scope.row.prd_month) }}</span>
      </template>
      <template #prdTitle="scope">
        <el-button v-if="scope.row.prdPath" link size="small" type="primary" @click="openYkFile(scope.row.prdPath)">
          🔗 链接
        </el-button>
        <span v-else class="dd-muted">{{ scope.row.source_prd || "-" }}</span>
      </template>
      <template #title="scope">
        <el-button v-if="scope.row.path" link size="small" type="primary" @click="openYkFile(scope.row.path)">
          {{ fileName(scope.row.path) }}
        </el-button>
        <span v-else class="dd-muted">-</span>
      </template>
      <template #status="scope">
        <el-tag :type="statusTagType(scope.row.status)" size="small" effect="plain">
          {{ statusLabel(scope.row.status) }}
        </el-tag>
      </template>
    </ProTable>

    <el-empty v-if="!flatDevModules.length" :description="$t('project.overview.modules.empty')" :image-size="60" />

    <!-- ═══ Create Dialog ═══ -->
    <el-dialog v-model="dialog.visible" :title="$t('project.overview.modules.createTitle')" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('project.dialog.name')" prop="name">
          <el-input v-model="dialog.form.name" :placeholder="$t('project.overview.modules.namePlaceholder')" maxlength="100" />
        </el-form-item>
        <el-form-item :label="$t('project.dialog.description')">
          <el-input
            v-model="dialog.form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('project.overview.modules.descPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('project.overview.todo.noAssignee')">
          <el-input v-model="dialog.form.lead" :placeholder="$t('project.overview.modules.leadPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t("project.dialog.cancel") }}</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">{{ $t("project.dialog.save") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, inject, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import { useProjectDetail, PREVIEW_DLG_KEY } from "@/views/project/types";
import { createModule } from "@/api/modules/moduleService";
import { useYiKnowledgeModules, type YiKnowledgeModule } from "@/views/project/composables/useYiKnowledgeModules";
import { useRequirements } from "@/views/project/composables/useRequirements";

const { t } = useI18n();
const ctx = useProjectDetail();
const { project, knowledgeFiles, refreshData } = ctx;
const previewDlgRef = inject(PREVIEW_DLG_KEY, null);

// ── YiKnowledge data ──
const { items: ykModules, deriveFrom: deriveModules } = useYiKnowledgeModules();
const { items: prdItems, deriveFrom: derivePrds } = useRequirements();

watch(
  () => knowledgeFiles.value,
  files => {
    const key = project.value?.key;
    if (key && files.length) {
      deriveModules(files, key);
      derivePrds(files, key);
    }
  },
  { immediate: true }
);

// ── Flat dev module rows (linked to PRD) ──
interface DevModuleRow extends YiKnowledgeModule {
  prdId: string;
  prdTitle: string;
  prdPath: string;
}

const flatDevModules = computed<DevModuleRow[]>(() => {
  const rows: DevModuleRow[] = [];

  for (const m of ykModules.value) {
    const sourcePrd = m.source_prd;
    const prd = sourcePrd ? prdItems.value.find(p => p.path.endsWith(sourcePrd)) : undefined;

    rows.push({
      ...m,
      prdId: prd?.prd_task_id || "",
      prdTitle: prd?.title || sourcePrd || "",
      prdPath: prd?.path || ""
    });
  }

  // Sort by month desc, then seq
  return rows.sort((a, b) => {
    const monthCmp = (b.prd_month || "").localeCompare(a.prd_month || "");
    if (monthCmp !== 0) return monthCmp;
    const na = parseInt(a.seq, 10);
    const nb = parseInt(b.seq, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.seq.localeCompare(b.seq);
  });
});

// ── Summary ──
const summary = computed(() => {
  const items = flatDevModules.value;
  const done = items.filter(i => i.status === "已完成" || i.status === "done").length;
  const inProgress = items.filter(i => i.status === "进行中" || i.status === "in_progress").length;
  const pending = items.length - done - inProgress;
  return { done, inProgress, pending };
});

// ── ProTable columns ──
const devColumns = computed<ColumnProps[]>(() => [
  { prop: "prdMonth", label: t("project.overview.modules.table.month"), width: 80, sortable: true },
  { prop: "title", label: t("project.overview.modules.table.taskName"), minWidth: 280 },
  { prop: "prdTitle", label: t("project.overview.modules.table.sourcePrd"), minWidth: 60 },
  { prop: "status", label: t("project.overview.modules.table.status"), width: 120 }
]);

// ── Helpers ──
function formatMonth(m: string): string {
  if (!m || m.length !== 6) return m || "-";
  return `${m.slice(0, 4)}-${m.slice(4, 6)}`;
}

function fileName(path: string): string {
  if (!path) return "-";
  const name = path.split("/").pop() || "";
  return name.replace(/\.md$/, "");
}

function statusTagType(s: string) {
  switch (s) {
    case "已完成":
    case "done":
    case "已实现":
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
    planned: "待开始",
    已实现: "已实现"
  };
  return map[s] || s;
}

function openYkFile(path: string) {
  previewDlgRef?.value?.open(path);
}

// ── Create Dialog ──
const formRef = ref<FormInstance>();
const dialog = reactive({
  visible: false,
  submitting: false,
  form: { name: "", description: "", lead: "" }
});

const rules: FormRules = {
  name: [{ required: true, message: t("project.dialog.nameRequired"), trigger: "blur" }]
};

function openCreate() {
  dialog.form = { name: "", description: "", lead: "" };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    const key = `MOD-${Date.now().toString(36).toUpperCase()}`;
    await createModule({
      key,
      project_key: project.value?.key || "",
      name: dialog.form.name,
      description: dialog.form.description,
      status: "planned",
      lead: dialog.form.lead,
      issue_keys: []
    });
    dialog.visible = false;
    ElMessage.success(t("project.overview.modules.createSuccess"));
    await refreshData();
  } finally {
    dialog.submitting = false;
  }
}
</script>

<style scoped lang="scss">
.dd-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── Summary bar ──
.dd-summary {
  display: flex;
  gap: 1px;
  overflow: hidden;
  background: var(--el-border-color-lighter);
  border-radius: 10px;
}
.dd-summary__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  padding: 12px 10px;
  background: var(--el-bg-color);
}
.dd-summary__value {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);
}
.dd-summary__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

// ── Table cells ──
.dd-seq {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.dd-month {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.dd-task-id {
  padding: 1px 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 3px;
}
.dd-muted {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
