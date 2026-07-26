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
        <el-button type="primary" plain @click="toDetail">To Detail Sub-page</el-button>
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
        <el-button type="primary" @click="ElMessage.success('I am the header rendered via scoped slot')">
          {{ scope.column.label }}
        </el-button>
      </template>
      <!-- createTime -->
      <template #createTime="scope">
        <el-button type="primary" link @click="ElMessage.success('I am the content rendered via scoped slot')">
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
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { User } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import UserDrawer from "@/views/proTable/components/UserDrawer.vue";
import { ProTableInstance, ColumnProps, HeaderRenderScope } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Download, Upload, View, Refresh } from "@element-plus/icons-vue";
import {
  getUserList,
  deleteUser,
  editUser,
  addUser,
  changeUserStatus,
  resetUserPassWord,
  exportUserInfo,
  BatchAddUser,
  getUserStatus,
  getUserGender
} from "@/api/modules/user";

const router = useRouter();

// Navigate to detail page
const toDetail = () => {
  router.push(`/proTable/useProTable/detail/${Math.random().toFixed(3)}?params=detail-page`);
};

// ProTable instance
const proTable = ref<ProTableInstance>();

// If the table needs initial request params, pass them directly to ProTable (they will be automatically included in every subsequent request; changes to these params will auto-refresh the table data)
const initParam = reactive({ type: 1 });

// dataCallback processes the returned table data. If your backend doesn't return list && total fields, you can transform them here.
// Alternatively, modify the field names in hooks/useTable.ts to match your backend.
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  };
};

// If you want to modify request params before the request, define a custom function: params contains all current request params (including pagination), and return the list API call.
// By default, just bind :requestApi="getUserList" on the ProTable component
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startTime = newParams.createTime[0]);
  newParams.createTime && (newParams.endTime = newParams.createTime[1]);
  delete newParams.createTime;
  return getUserList(newParams);
};

// Page button permissions (can use both hooks and v-auth directive; directive is better for binding directly to buttons, hooks are better for showing different content based on permissions)
const { BUTTONS } = useAuthButtons();

// Custom render header (using tsx syntax)
const headerRender = (scope: HeaderRenderScope<User.ResUserList>) => {
  return (
    <el-button type="primary" onClick={() => ElMessage.success("I am the header rendered via tsx syntax")}>
      {scope.column.label}
    </el-button>
  );
};

// Table column config
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  { type: "sort", label: "Sort", width: 80 },
  { type: "expand", label: "Expand", width: 85 },
  {
    prop: "username",
    label: "Username",
    search: { el: "input", tooltip: "I'm a search tooltip" },
    render: scope => {
      return (
        <el-button type="primary" link onClick={() => ElMessage.success("I am the content rendered via tsx syntax")}>
          {scope.row.username}
        </el-button>
      );
    }
  },
  {
    prop: "gender",
    label: "Gender",
    // Enum data (local data)
    // enum: genderType,
    // Enum request without params
    enum: getUserGender,
    // Enum request with params
    // enum: () => getUserGender({ id: 1 }),
    search: { el: "select", props: { filterable: true } },
    fieldNames: { label: "genderLabel", value: "genderValue" }
  },
  {
    // Multi-level prop
    prop: "user.detail.age",
    label: "Age",
    search: {
      // Custom search render
      render: ({ searchParam }) => {
        return (
          <div class="flx-center">
            <el-input vModel_trim={searchParam.minAge} placeholder="Min age" />
            <span class="mr10 ml10">-</span>
            <el-input vModel_trim={searchParam.maxAge} placeholder="Max age" />
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
    label: "Status",
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
    label: "Created At",
    headerRender,
    width: 180,
    search: {
      el: "date-picker",
      span: 2,
      props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
      defaultValue: ["2022-11-12 11:35:00", "2022-12-12 11:35:00"]
    }
  },
  { prop: "operation", label: "Actions", fixed: "right", width: 330 }
]);

// Table drag sort
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("List sort order updated successfully");
};

// Delete user
const deleteAccount = async (params: User.ResUserList) => {
  await useHandleData(deleteUser, { id: [params.id] }, `Delete user【${params.username}】`);
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
  await useHandleData(resetUserPassWord, { id: params.id }, `Reset password for【${params.username}】`);
  proTable.value?.getTableList();
};

// Toggle user status
const changeStatus = async (row: User.ResUserList) => {
  await useHandleData(changeUserStatus, { id: row.id, status: row.status == 1 ? 0 : 1 }, `Toggle status for【${row.username}】`);
  proTable.value?.getTableList();
};

// Export user list
const downloadFile = async () => {
  ElMessageBox.confirm("Confirm export user data?", "Tip", { type: "warning" }).then(() =>
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
