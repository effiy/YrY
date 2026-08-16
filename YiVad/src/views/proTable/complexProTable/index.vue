<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="User List"
      highlight-current-row
      :columns="columns"
      :request-api="getUserList"
      :row-class-name="tableRowClassName"
      :span-method="objectSpanMethod"
      :show-summary="true"
      :summary-method="getSummaries"
      @row-click="rowClick"
    >
      <!-- Table Header Buttons -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" @click="proTable?.element?.toggleAllSelection">Select All / Deselect All</el-button>
        <el-button type="primary" :icon="Pointer" plain @click="setCurrent">Select Row 5</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          Batch Delete Users
        </el-button>
      </template>
      <!-- Expand -->
      <template #expand="scope">
        {{ scope.row }}
      </template>
      <!-- Table Operations -->
      <template #operation="scope">
        <el-button type="primary" link :icon="Refresh" @click="resetPass(scope.row)">Reset Password</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteAccount(scope.row)">Delete</el-button>
      </template>
      <template #append>
        <span style="color: var(--el-color-primary)">I am content appended at the end of the table. If the table has a summary row, this content will appear above it.</span>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="tsx" name="complexProTable">
import { CirclePlus, Delete, Pointer, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { TableColumnCtx } from "element-plus/es/components/table/src/table-column/defaults";
import { reactive, ref } from "vue";

import { User } from "@/api/interface";
import { deleteUser, getUserGender, getUserList, getUserStatus, resetUserPassWord } from "@/api/modules/user";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps, HeaderRenderScope, ProTableInstance } from "@/components/ProTable/interface";
import { useHandleData } from "@/hooks/useHandleData";

// ProTable instance
const proTable = ref<ProTableInstance>();

// Custom header render (using TSX syntax)
const headerRender = (scope: HeaderRenderScope<User.ResUserList>) => {
  return (
    <el-button type="primary" onClick={() => ElMessage.success("I am a header rendered via TSX syntax")}>
      {scope.column.label}
    </el-button>
  );
};

// Table column config
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "selection", width: 80 },
  { type: "index", label: "#", width: 80 },
  { type: "expand", label: "Expand", width: 100 },
  {
    prop: "base",
    label: "Basic Info",
    headerRender,
    _children: [
      { prop: "username", label: "User Name", width: 110 },
      { prop: "user.detail.age", label: "Age", width: 100 },
      {
        prop: "gender",
        label: "Gender",
        width: 100,
        enum: getUserGender,
        fieldNames: { label: "genderLabel", value: "genderValue" }
      },
      {
        prop: "details",
        label: "Details",
        _children: [
          { prop: "idCard", label: "ID Card" },
          { prop: "email", label: "Email" },
          { prop: "address", label: "Address" }
        ]
      }
    ]
  },
  {
    prop: "status",
    label: "User Status",
    tag: true,
    enum: getUserStatus,
    fieldNames: { label: "userLabel", value: "userStatus" }
  },
  { prop: "createTime", label: "Create Time", width: 200 },
  { prop: "operation", label: "Operations", fixed: "right", width: 230 }
]);

// Select row
const setCurrent = () => {
  proTable.value?.element?.setCurrentRow(proTable.value?.tableData[4]);
  proTable.value?.element?.toggleRowSelection(proTable.value?.tableData[4], true);
};

// Table summary row (calculated based on conditions)
interface SummaryMethodProps<T extends Record<PropertyKey, any> = User.ResUserList> {
  columns: TableColumnCtx<T>[];
  data: T[];
}
const getSummaries = (param: SummaryMethodProps) => {
  const { columns } = param;
  const sums: string[] = [];
  columns.forEach((column, index) => {
    if (index === 0) return (sums[index] = "Total");
    else sums[index] = "N/A";
  });
  return sums;
};

// Column merging
interface SpanMethodProps {
  row: User.ResUserList;
  column: TableColumnCtx<User.ResUserList>;
  rowIndex: number;
  columnIndex: number;
}
const objectSpanMethod = ({ rowIndex, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 3) {
    if (rowIndex % 2 === 0) return { rowspan: 2, colspan: 1 };
    else return { rowspan: 0, colspan: 0 };
  }
};

// Set row class style
const tableRowClassName = ({ rowIndex }: { row: User.ResUserList; rowIndex: number }) => {
  if (rowIndex === 2) return "warning-row";
  if (rowIndex === 6) return "success-row";
  return "";
};

// Row click
const rowClick = (row: User.ResUserList, column: TableColumnCtx<User.ResUserList>) => {
  if (column.property == "radio" || column.property == "operation") return;
  ElMessage.success("Current row was clicked!");
};

// Delete user
const deleteAccount = async (params: User.ResUserList) => {
  await useHandleData(deleteUser, { id: [params.id] }, `Delete user [${params.username}]`);
  proTable.value?.getTableList();
};

// Batch delete users
const batchDelete = async (id: string[]) => {
  await useHandleData(deleteUser, { id }, "Delete selected users");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// Reset user password
const resetPass = async (params: User.ResUserList) => {
  await useHandleData(resetUserPassWord, { id: params.id }, `Reset password for user [${params.username}]`);
  proTable.value?.getTableList();
};
</script>

<style lang="scss">
.el-table .warning-row,
.el-table .warning-row .el-table-fixed-column--right,
.el-table .warning-row .el-table-fixed-column--left {
  background-color: var(--el-color-warning-light-9);
}
.el-table .success-row,
.el-table .success-row .el-table-fixed-column--right,
.el-table .success-row .el-table-fixed-column--left {
  background-color: var(--el-color-success-light-9);
}
</style>
