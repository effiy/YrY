<template>
  <div class="main-box">
    <TreeFilter
      label="name"
      title="Department List (Single Select)"
      :request-api="getDepartmentTree"
      :default-value="initParam.departmentId"
      @change="changeTreeFilter"
    />
    <div class="table-box">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="getUserList"
        :init-param="initParam"
        :search-col="{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }"
      >
        <!-- Table header buttons -->
        <template #tableHeader>
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('Add')">Add User</el-button>
          <el-button type="primary" :icon="Upload" plain @click="batchAdd">Batch Add Users</el-button>
          <el-button type="primary" :icon="Download" plain @click="downloadFile">Export User Data</el-button>
          <el-button type="primary" plain @click="toDetail">To Same-Level Detail Page</el-button>
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
  </div>
</template>
<script setup lang="ts" name="useTreeFilter">
import { ref, reactive } from "vue";
import { User } from "@/api/interface";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import ProTable from "@/components/ProTable/index.vue";
import TreeFilter from "@/components/TreeFilter/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import UserDrawer from "@/views/proTable/components/UserDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Download, Upload, View, Refresh } from "@element-plus/icons-vue";
import {
  getUserList,
  deleteUser,
  editUser,
  addUser,
  resetUserPassWord,
  exportUserInfo,
  BatchAddUser,
  getUserStatus,
  getUserGender,
  getUserDepartment
} from "@/api/modules/user";

// TreeFilter expects a flat array, but /users/dict/department returns { list, total }
const getDepartmentTree = async () => {
  const res: any = await getUserDepartment();
  return { ...res, data: res.data?.list ?? res.data };
};

const router = useRouter();

// Navigate to detail page
const toDetail = () => {
  router.push(`/proTable/useTreeFilter/detail/123456?params=detail-page`);
};

// ProTable instance
const proTable = ref<ProTableInstance>();

// If the table needs initial request params, pass them directly to ProTable (they will be automatically included in every subsequent request; changes to these params will auto-refresh the table data)
const initParam = reactive({ departmentId: "1" });

// Tree filter change
const changeTreeFilter = (val: string) => {
  ElMessage.success("Notice the request parameter changes 🤔");
  proTable.value!.pageable.pageNum = 1;
  initParam.departmentId = val;
};

// Table column config
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "index", label: "#", width: 80 },
  { prop: "username", label: "Username", width: 120, search: { el: "input" } },
  {
    prop: "gender",
    label: "Gender",
    width: 120,
    sortable: true,
    enum: getUserGender,
    search: { el: "select" },
    fieldNames: { label: "genderLabel", value: "genderValue" }
  },
  { prop: "idCard", label: "ID Card" },
  { prop: "email", label: "Email" },
  { prop: "address", label: "Address" },
  {
    prop: "status",
    label: "Status",
    width: 120,
    sortable: true,
    tag: true,
    enum: getUserStatus,
    search: { el: "select" },
    fieldNames: { label: "userLabel", value: "userValue" }
  },
  { prop: "createTime", label: "Created At", width: 180 },
  { prop: "operation", label: "Actions", width: 330, fixed: "right" }
]);

// Delete user
const deleteAccount = async (params: User.ResUserList) => {
  await useHandleData(deleteUser, { id: [params.id] }, `Delete user【${params.username}】`);
  proTable.value?.getTableList();
};

// Reset user password
const resetPass = async (params: User.ResUserList) => {
  await useHandleData(resetUserPassWord, { id: params.id }, `Reset password for【${params.username}】`);
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
