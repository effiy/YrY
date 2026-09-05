<template>
  <div class="system-log">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchLogs"
      :tool-button="['refresh', 'setting', 'search']"
      row-key="key"
    >
      <template #tableHeader>
        <el-button :icon="Download" @click="handleExport">导出 Excel</el-button>
      </template>
      <template #action="{ row }">
        <el-tag
          :type="actionTagType(row.action)"
          size="small"
        >
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
          查看变更
        </el-button>
        <span v-else class="system-log__no-changes">-</span>
      </template>
    </ProTable>

    <!-- Changes detail dialog -->
    <el-dialog v-model="changesVisible" title="变更详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item
          v-for="(val, key) in changesData"
          :key="key"
          :label="String(key)"
        >
          {{ JSON.stringify(val) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="changesVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="systemLog">
import { ref } from "vue";
import { Download } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getAuditLogList, AUDIT_ACTIONS, AUDIT_MODULES } from "@/api/modules/auditService";
import type { AuditLogDocument } from "@/api/modules/auditService";

const proTableRef = ref<ProTableInstance>();

// ── Action display helpers ──

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

// ── Table columns ──

const columns: ColumnProps<AuditLogDocument>[] = [
  { type: "index", label: "#", width: 60 },
  { prop: "operatorName", label: "操作人", width: 120, search: { el: "input", key: "operator" } },
  { prop: "action", label: "操作类型", width: 100,
    enum: AUDIT_ACTIONS,
    tag: true,
    search: { el: "select" },
  },
  { prop: "module", label: "模块", width: 120,
    enum: AUDIT_MODULES,
    search: { el: "select" },
  },
  { prop: "targetName", label: "操作对象", minWidth: 140, search: { el: "input", key: "target" } },
  { prop: "detail", label: "详情", minWidth: 200, showOverflowTooltip: true },
  { prop: "changes", label: "变更记录", width: 100 },
  {
    prop: "createdAt",
    label: "操作时间",
    width: 180,
    search: {
      el: "date-picker",
      props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
      key: "timeRange",
    },
  },
];

// ── Data fetching ──

const fetchLogs = async (params: any) => {
  const reqParams: any = {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    operator: params.operator,
    action: params.action,
    module: params.module,
    target: params.target,
  };
  if (params.timeRange?.length === 2) {
    reqParams.startTime = params.timeRange[0];
    reqParams.endTime = params.timeRange[1];
  }
  const { data } = await getAuditLogList(reqParams);
  return data;
};

// ── Export ──

const handleExport = () => {
  ElMessage.info("导出功能需后端配合实现，当前为占位按钮");
};

// ── Changes detail ──

const changesVisible = ref(false);
const changesData = ref<Record<string, any>>({});

const showChanges = (row: AuditLogDocument) => {
  changesData.value = row.changes ?? {};
  changesVisible.value = true;
};
</script>

<style scoped lang="scss">
.system-log {
  padding: 16px;

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
}
</style>