<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      @drag-sort="sortTable"
    >
      <!-- Table header buttons -->
      <template #tableHeader="scope">
        <el-button v-auth="'add'" type="primary" :icon="CirclePlus" @click="openDrawer('Add')">Add User</el-button>
        <el-button v-auth="'batchAdd'" type="primary" :icon="Upload" plain @click="batchAdd">Batch Add Users</el-button>
        <el-button v-auth="'export'" type="primary" :icon="Download" plain @click="downloadFile">Export User Data</el-button>
        <el-button type="primary" plain @click="toDetail">To Detail Page</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          Batch Delete Users
        </el-button>
      </template>
      <!-- Expand -->
      <template #expand="scope">
        {{ scope.row }}
      </template>
      <!-- usernameHeader -->
      <template #usernameHeader="scope">
        <el-button type="primary" @click="ElMessage.success('Header rendered via scoped slot')">
          {{ scope.column.label }}
        </el-button>
      </template>
      <!-- createTime -->
      <template #createTime="scope">
        <el-button type="primary" link @click="ElMessage.success('Content rendered via scoped slot')">
          {{ scope.row.createTime }}
        </el-button>
      </template>
      <!-- Table operations -->
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="openDrawer('View', scope.row)">View</el-button>
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('Edit', scope.row)">Edit</el-button>
        <el-button type="primary" link :icon="Refresh" @click="resetPass(scope.row)">Reset Password</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteAccount(scope.row)">Delete</el-button>
      </template>
    </ProTable>
    <UserDrawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { CirclePlus, Delete, Download, EditPen, Refresh, Upload, View } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { User } from "@/api/interface";
import {
  addUser,
  BatchAddUser,
  changeUserStatus,
  deleteUser,
  editUser,
  exportUserInfo,
  getUserGender,
  getUserList,
  getUserStatus,
  resetUserPassWord
} from "@/api/modules/user";
import ImportExcel from "@/components/ImportExcel/index.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps, HeaderRenderScope, ProTableInstance } from "@/components/ProTable/interface";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { useDownload } from "@/hooks/useDownload";
import { useHandleData } from "@/hooks/useHandleData";
import UserDrawer from "@/views/proTable/components/UserDrawer.vue";

const router = useRouter();

// Navigate to detail page
const toDetail = () => {
  router.push(`/proTable/useProTable/detail/${Math.random().toFixed(3)}?params=detail-page`);
};

// ProTable instance
const proTable = ref<ProTableInstance>();

// If the table requires initial request parameters, define them directly for ProTable (they will be automatically included in every subsequent request)
const initParam = reactive({ type: 1 });

// dataCallback processes the returned table data — if your backend doesn't return list && total fields, process them here
// Alternatively, modify the field names in hooks/useTable.ts to match your backend
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  };
};

// To customize request params before the request, define a function like this: params = all current request params (including pagination), return the list API call
// Default: bind :requestApi="getUserList" directly on ProTable
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.createTime) {
    newParams.startTime = newParams.createTime[0];
    newParams.endTime = newParams.createTime[1];
    delete newParams.createTime;
  }
  return getUserList(newParams);
};

// Page button permissions (use hooks or v-auth directive; hooks for conditional content, directive for direct binding)
const { BUTTONS } = useAuthButtons();

// Custom header render (TSX syntax)
const headerRender = (scope: HeaderRenderScope<User.ResUserList>) => {
  return (
    <el-button type="primary" onClick={() => ElMessage.success("Header rendered via TSX")}>
      {scope.column.label}
    </el-button>
  );
};

// Table column configuration
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  { type: "sort", label: "Sort", width: 80 },
  { type: "expand", label: "Expand", width: 85 },
  {
    prop: "username",
    label: "User Name",
    search: { el: "input", tooltip: "Search tooltip" },
    render: scope => {
      return (
        <el-button type="primary" link onClick={() => ElMessage.success("Content rendered via TSX")}>
          {scope.row.username}
        </el-button>
      );
    }
  },
  {
    prop: "gender",
    label: "Gender",
    // Dictionary data (local data)
    // enum: genderType,
    // Dictionary request without params
    enum: getUserGender,
    // Dictionary request with params
    // enum: () => getUserGender({ id: 1 }),
    search: { el: "select", props: { filterable: true } },
    fieldNames: { label: "genderLabel", value: "genderValue" }
  },
  {
    // Multi-level prop
    prop: "user.detail.age",
    label: "Age",
    search: {
      // Custom search content render
      render: ({ searchParam }) => {
        return (
          <div class="flx-center">
            <el-input vModel_trim={searchParam.minAge} placeholder="Min Age" />
            <span class="mr10 ml10">-</span>
            <el-input vModel_trim={searchParam.maxAge} placeholder="Max Age" />
          </div>
        );
      }
    }
  },
  { prop: "idCard", label: "ID Card", search: { el: "input" } },
  { prop: "email", label: "Email" },
  { prop: "address", label: "Address" },
  {
    prop: "status",
    label: "User Status",
    enum: getUserStatus,
    search: { el: "tree-select", props: { filterable: true } },
    fieldNames: { label: "userLabel", value: "userStatus" },
    render: scope => {
      return (
        <>
          {BUTTONS.value.status ? (
            <el-switch
              model-value={scope.row.status}
              active-text={scope.row.status ? "Enabled" : "Disabled"}
              active-value={1}
              inactive-value={0}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status ? "success" : "danger"}>{scope.row.status ? "Enabled" : "Disabled"}</el-tag>
          )}
        </>
      );
    }
  },
  {
    prop: "createTime",
    label: "Create Time",
    headerRender,
    width: 180,
    search: {
      el: "date-picker",
      span: 2,
      props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
      defaultValue: ["2022-11-12 11:35:00", "2022-12-12 11:35:00"]
    }
  },
  { prop: "operation", label: "Operations", fixed: "right", width: 330 }
]);

// Table drag sort
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("List sort order updated successfully");
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
  await useHandleData(resetUserPassWord, { id: params.id }, `Reset password for [${params.username}]`);
  proTable.value?.getTableList();
};

// Toggle user status
const changeStatus = async (row: User.ResUserList) => {
  await useHandleData(changeUserStatus, { id: row.id, status: row.status == 1 ? 0 : 1 }, `Toggle status for [${row.username}]`);
  proTable.value?.getTableList();
};

// Export user list
const downloadFile = async () => {
  ElMessageBox.confirm("Confirm export user data?", "Notice", { type: "warning" }).then(() =>
    useDownload(exportUserInfo, "User List", proTable.value?.searchParam)
  );
};

// Batch add users
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const batchAdd = () => {
  const params = {
    title: "User",
    tempApi: exportUserInfo,
    importApi: BatchAddUser,
    getTableList: proTable.value?.getTableList
  };
  dialogRef.value?.acceptParams(params);
};

// Open drawer (Add, View, Edit)
const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);
const openDrawer = (title: string, row: Partial<User.ResUserList> = {}) => {
  const params = {
    title,
    isView: title === "View",
    row: { ...row },
    api: title === "Add" ? addUser : title === "Edit" ? editUser : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
