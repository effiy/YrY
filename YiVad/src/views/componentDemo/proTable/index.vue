<template>
  <div class="card content-box">
    <span class="text">ProTable Demo</span>
    <el-alert
      title="ProTable is the canonical table pattern in YiVad. It integrates search, pagination, selection, sorting, and column settings. All new table pages must use ProTable — never raw el-table."
      type="warning"
      :closable="false"
    />

    <ProTable
      ref="proRef"
      :columns="columns"
      :request-api="mockApi"
      :pagination="true"
      :search-col="{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }"
      :data-callback="dataCallback"
    >
      <template #tableHeader="{ selectedListIds }">
        <el-button type="primary" :icon="Plus" @click="onAdd">Add</el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="selectedListIds.length === 0"
          @click="onBatchDelete(selectedListIds)"
        >
          Batch Delete
        </el-button>
      </template>
      <template #status="scope">
        <el-tag :type="statusTag(scope.row.status)">{{ scope.row.status }}</el-tag>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="Edit" @click="onEdit(scope.row)">Edit</el-button>
        <el-button type="danger" link :icon="Delete" @click="onDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>

    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="columns">ColumnProps[] — table column definitions</el-descriptions-item>
      <el-descriptions-item label="requestApi">(params) => Promise — API to fetch table data</el-descriptions-item>
      <el-descriptions-item label="requestAuto">boolean — auto-fetch on mount, default true</el-descriptions-item>
      <el-descriptions-item label="requestImmediately">boolean — fetch immediately, default true</el-descriptions-item>
      <el-descriptions-item label="searchCol">number | Record — responsive search columns</el-descriptions-item>
      <el-descriptions-item label="pagination">boolean — show pagination, default true</el-descriptions-item>
      <el-descriptions-item label="border">boolean — table border, default true</el-descriptions-item>
      <el-descriptions-item label="toolButton">boolean — show toolbar buttons, default true</el-descriptions-item>
      <el-descriptions-item label="rowKey">string — unique row key, default "id"</el-descriptions-item>
      <el-descriptions-item label="dataCallback">(data) => data — transform response data</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="ColumnProps" :column="1" border class="mt30">
      <el-descriptions-item label="prop">string — field key (required)</el-descriptions-item>
      <el-descriptions-item label="label">string — column header label</el-descriptions-item>
      <el-descriptions-item label="width">string | number — column width</el-descriptions-item>
      <el-descriptions-item label="isShow">boolean — show/hide column, default true</el-descriptions-item>
      <el-descriptions-item label="sortable">boolean — enable sorting</el-descriptions-item>
      <el-descriptions-item label="search">SearchConfig — search form config</el-descriptions-item>
      <el-descriptions-item label="enum">EnumConfig — dropdown/enum filter</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="Slots" :column="1" border class="mt30">
      <el-descriptions-item label="tableHeader">Header action buttons (left side)</el-descriptions-item>
      <el-descriptions-item label="toolButton">Extra toolbar buttons</el-descriptions-item>
      <el-descriptions-item label="status">Custom status column (default renders el-tag)</el-descriptions-item>
      <el-descriptions-item label="operation">Row action buttons</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoProTable">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Delete, Edit } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const proRef = ref();

const statusTag = (status: string): "success" | "warning" | "info" | "danger" | "primary" => {
  const map: Record<string, "success" | "warning" | "info" | "danger" | "primary"> = { active: "success", inactive: "info", pending: "warning" };
  return map[status] ?? "info";
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
];

const roleOptions = [
  { label: "Admin", value: "Admin" },
  { label: "Editor", value: "Editor" },
  { label: "Viewer", value: "Viewer" },
];

const columns: ColumnProps[] = [
  { type: "selection", width: 50 },
  { prop: "name", label: "Name", width: 140, search: { el: "input", order: 1 } },
  { prop: "email", label: "Email", minWidth: 200 },
  {
    prop: "role", label: "Role", width: 120,
    search: { el: "select", order: 2, props: { options: roleOptions } },
  },
  {
    prop: "status", label: "Status", width: 100,
    search: { el: "select", order: 3, props: { options: statusOptions } },
  },
  { prop: "createdAt", label: "Created", width: 160 },
  { prop: "operation", label: "Actions", width: 160, fixed: "right" },
];

// Generate 35 mock users
const allUsers: UserRow[] = Array.from({ length: 35 }, (_, i) => {
  const roles = ["Admin", "Editor", "Viewer"];
  const statuses = ["active", "inactive", "pending"];
  const d = new Date(2026, 0, 1 + i * 3);
  return {
    id: i + 1,
    name: `User ${String(i + 1).padStart(2, "0")}`,
    email: `user${i + 1}@example.com`,
    role: roles[i % 3],
    status: statuses[i % 3],
    createdAt: d.toISOString().slice(0, 10),
  };
});

const mockApi = async (params: { pageNum: number; pageSize: number; name?: string; role?: string; status?: string }) => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 300));
  let filtered = [...allUsers];
  if (params.name) filtered = filtered.filter(u => u.name.includes(params.name!));
  if (params.role) filtered = filtered.filter(u => u.role === params.role);
  if (params.status) filtered = filtered.filter(u => u.status === params.status);
  const start = (params.pageNum - 1) * params.pageSize;
  return { list: filtered.slice(start, start + params.pageSize), total: filtered.length };
};

const dataCallback = (data: any) => data;

const onAdd = () => ElMessage.success("Add clicked — wire to your API");
const onEdit = (row: UserRow) => ElMessage.info(`Edit: ${row.name}`);
const onDelete = (row: UserRow) => {
  ElMessageBox.confirm(`Delete ${row.name}?`, "Confirm", { type: "warning" })
    .then(() => ElMessage.success(`Deleted ${row.name}`))
    .catch(() => {});
};
const onBatchDelete = (ids: string[]) => ElMessage.warning(`Batch delete IDs: ${ids.join(", ")}`);
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>