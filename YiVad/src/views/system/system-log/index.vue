<template>
  <div class="system-log page">
    <PageHeaderCard
      :icon="DocumentChecked"
      icon-bg="linear-gradient(135deg, #909399, #4b5563)"
      :title="$t('system.log.title')"
      :description="$t('system.log.description')"
    />

    <!-- Quick Time Filters -->
    <div class="system-log__quick-filters">
      <button
        v-for="qf in quickFilters"
        :key="qf.key"
        type="button"
        class="system-log__quick-chip"
        :class="{ 'system-log__quick-chip--active': activeQuickFilter === qf.key }"
        @click="applyQuickFilter(qf.key)"
      >
        {{ qf.label }}
      </button>
    </div>

    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchLogs"
      :tool-button="['refresh', 'setting', 'search']"
      row-key="key"
    >
      <template #tableHeader="{ isSelected, selectedListIds }">
        <el-button :icon="Download" @click="handleExport">{{ $t("common.export.title") }}</el-button>
        <el-button v-if="isSelected" type="danger" :icon="Delete" @click="batchDelete(selectedListIds)">
          Batch Delete
        </el-button>
      </template>
      <template #action="{ row }">
        <el-tag :type="actionTagType(row.action)" size="small">
          {{ actionLabel(row.action) }}
        </el-tag>
      </template>
      <template #detail="{ row }">
        <el-tooltip :content="row.detail" placement="top" :show-after="500">
          <span class="system-log__detail">{{ row.detail }}</span>
        </el-tooltip>
      </template>
      <template #changes="{ row }">
        <el-button
          v-if="row.changes && Object.keys(row.changes).length"
          link
          type="primary"
          size="small"
          @click="showChanges(row)"
        >
          {{ $t("common.view") }}
        </el-button>
        <span v-else class="system-log__no-changes">-</span>
      </template>
    </ProTable>

    <el-dialog v-model="changesVisible" :title="$t('system.log.detail')" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item v-for="(val, key) in changesData" :key="key" :label="String(key)">
          {{ JSON.stringify(val) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="changesVisible = false">{{ $t("common.cancel") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="systemLog">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Download, Delete, DocumentChecked } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getAuditLogList, AUDIT_ACTIONS, AUDIT_MODULES, deleteAuditLog } from "@/api/modules/auditService";
import type { AuditLogDocument } from "@/api/modules/auditService";
import { confirm } from "@/hooks/useConfirmAction";
import { formatAbsolute as formatDateTime } from "@/utils/datetime";

const { t } = useI18n();
const proTableRef = ref<ProTableInstance>();
const activeQuickFilter = ref("all");

const quickFilters = [
  { key: "all", label: "All" },
  { key: "24h", label: "Last 24h" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" }
];

let currentTimeFilter: { startTime?: string; endTime?: string } = {};

function applyQuickFilter(key: string) {
  activeQuickFilter.value = key;
  const now = new Date();
  switch (key) {
    case "24h":
      currentTimeFilter = { startTime: new Date(now.getTime() - 86400000).toISOString() };
      break;
    case "7d":
      currentTimeFilter = { startTime: new Date(now.getTime() - 7 * 86400000).toISOString() };
      break;
    case "30d":
      currentTimeFilter = { startTime: new Date(now.getTime() - 30 * 86400000).toISOString() };
      break;
    default:
      currentTimeFilter = {};
      break;
  }
  proTableRef.value?.getTableList();
}

const actionMap = new Map(AUDIT_ACTIONS.map(a => [a.value, a.label]));
const actionLabel = (action: string) => actionMap.get(action) ?? action;

const actionTagType = (action: string) => {
  switch (action) {
    case "create": return "success";
    case "update": return "primary";
    case "delete": return "danger";
    case "login": return "info";
    case "logout": return "info";
    case "export": return "warning";
    case "assign_role": return "primary";
    default: return "info";
  }
};

const columns: ColumnProps<AuditLogDocument>[] = [
  { type: "selection", width: 50 },
  { type: "index", label: "#", width: 60 },
  { prop: "operatorName", label: t("system.log.user"), width: 120, search: { el: "input", key: "operator" } },
  { prop: "action", label: t("system.log.action"), width: 100, enum: AUDIT_ACTIONS, tag: true, search: { el: "select" } },
  { prop: "module", label: t("system.log.module"), width: 120, enum: AUDIT_MODULES, search: { el: "select" } },
  { prop: "targetName", label: t("system.log.target"), minWidth: 140, search: { el: "input", key: "target" } },
  { prop: "detail", label: t("system.log.detail"), minWidth: 200, showOverflowTooltip: true },
  { prop: "changes", label: t("system.log.changes"), width: 100 },
  {
    prop: "createdAt",
    label: t("system.log.timestamp"),
    width: 180,
    search: {
      el: "date-picker",
      props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
      key: "timeRange"
    }
  }
];

// Track all fetched logs for export
const allLogs = ref<AuditLogDocument[]>([]);

const fetchLogs = async (params: any) => {
  const reqParams: any = {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    operator: params.operator,
    action: params.action,
    module: params.module,
    target: params.target
  };
  if (params.timeRange?.length === 2) {
    reqParams.startTime = params.timeRange[0];
    reqParams.endTime = params.timeRange[1];
  } else if (currentTimeFilter.startTime) {
    reqParams.startTime = currentTimeFilter.startTime;
  }

  // Also fetch all matching logs (up to 1000) for export
  try {
    const allRes = await getAuditLogList({ ...reqParams, pageNum: 1, pageSize: 1000 });
    allLogs.value = (allRes.data?.list ?? []) as AuditLogDocument[];
  } catch { /* ignore */ }

  const { data } = await getAuditLogList(reqParams);
  return data;
};

const handleExport = () => {
  if (!allLogs.value.length) {
    ElMessage.info("No logs to export");
    return;
  }
  const headers = ["Time", "User", "Action", "Module", "Target", "Detail"];
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = allLogs.value.map(l => [
    l.createdAt || "",
    l.operatorName || "",
    actionLabel(l.action),
    l.module || "",
    l.targetName || "",
    (l.detail || "").replace(/\n/g, " ")
  ].map(escape).join(","));
  const csv = ["\uFEFF" + headers.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(`Exported ${rows.length} logs`);
};

async function batchDelete(ids: (string | number)[]) {
  if (!ids.length) return;
  const ok = await confirm(`Delete ${ids.length} log(s)? This cannot be undone.`, "Batch Delete Logs");
  if (!ok) return;
  let count = 0;
  for (const id of ids) {
    try { await deleteAuditLog(String(id)); count++; } catch { /* continue */ }
  }
  ElMessage.success(`Deleted ${count} log(s)`);
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
}

const changesVisible = ref(false);
const changesData = ref<Record<string, any>>({});

const showChanges = (row: AuditLogDocument) => {
  changesData.value = row.changes ?? {};
  changesVisible.value = true;
};
</script>

<style scoped lang="scss">
.system-log {
  min-height: 100%;
  &__detail {
    display: inline-block;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__no-changes {
    color: var(--el-text-color-secondary);
  }
  &__quick-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  &__quick-chip {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 999px;
    transition: all 0.15s;
    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);
    }
    &--active {
      color: #fff;
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      &:hover { color: #fff; background: var(--el-color-primary-light-3); }
    }
  }
}
</style>