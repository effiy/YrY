<template>
  <div class="main-box">
    <TreeFilter
      title="Department List (Multiple Select)"
      multiple
      label="name"
      :request-api="getDepartmentTree"
      :default-value="treeFilterValues.departmentId"
      @change="changeTreeFilter"
    />
    <div class="table-box">
      <div class="card mb10 pt0 pb0">
        <SelectFilter :data="selectFilterData" :default-values="selectFilterValues" @change="changeSelectFilter" />
      </div>
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getUserList"
        :init-param="Object.assign(treeFilterValues, selectFilterValues)"
      >
        <!-- Table header buttons -->
        <template #tableHeader>
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('Add')">Add User</el-button>
          <el-button type="primary" :icon="Upload" plain @click="batchAdd">Batch Add Users</el-button>
          <el-button type="primary" :icon="Download" plain @click="downloadFile">Export User Data</el-button>
          <el-button type="primary" :icon="Pointer" plain @click="setCurrent">Select Row 4</el-button>
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
<script setup lang="ts" name="useSelectFilter">
import { ref, reactive, onMounted, watch } from "vue";
import { User } from "@/api/interface";
import { ElMessage, ElMessageBox } from "element-plus";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import { genderType, userStatus } from "@/utils/dict";
import ProTable from "@/components/ProTable/index.vue";
import TreeFilter from "@/components/TreeFilter/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import UserDrawer from "@/views/proTable/components/UserDrawer.vue";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Pointer, Download, Upload, View, Refresh } from "@element-plus/icons-vue";
import {
  getUserList,
  deleteUser,
  editUser,
  addUser,
  resetUserPassWord,
  exportUserInfo,
  BatchAddUser,
  getUserDepartment,
  getUserRole
} from "@/api/modules/user";

// TreeFilter expects a flat array, but /users/dict/department returns { list, total }
const getDepartmentTree = async () => {
  const res: any = await getUserDepartment();
  return { ...res, data: res.data?.list ?? res.data };
};

// ProTable instance
const proTable = ref<ProTableInstance>();

// Table column config
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "radio", label: "Select", width: 80 },
  { type: "index", label: "#", width: 80 },
  { prop: "username", label: "Username", width: 120 },
  { prop: "gender", label: "Gender", width: 120, sortable: true, enum: genderType },
  { prop: "idCard", label: "ID Card" },
  { prop: "email", label: "Email" },
  { prop: "address", label: "Address" },
  { prop: "status", label: "Status", width: 120, sortable: true, tag: true, enum: userStatus },
  { prop: "createTime", label: "Created At", width: 180, sortable: true },
  { prop: "operation", label: "Actions", width: 330, fixed: "right" }
]);

// selectFilter data (user roles from backend)
const selectFilterData = reactive([
  {
    title: "User Status (Single)",
    key: "userStatus",
    options: [
      { label: "All", value: "" },
      { label: "Active", value: "1", icon: "User" },
      { label: "Pending Training", value: "2", icon: "Bell" },
      { label: "Pending Onboarding", value: "3", icon: "Clock" },
      { label: "Resigned", value: "4", icon: "CircleClose" },
      { label: "Retired", value: "5", icon: "CircleCheck" }
    ]
  },
  {
    title: "User Role (Multiple)",
    key: "userRole",
    multiple: true,
    options: []
  }
]);

// Get user role dict (map { id, name } → { label, value })
onMounted(() => getUserRoleDict());
const getUserRoleDict = async () => {
  const { data } = await getUserRole();
  const mapOptions = (nodes: any[]): any[] =>
    nodes.map(n => ({
      label: n.name,
      value: n.id,
      ...(n.children?.length ? { children: mapOptions(n.children) } : {})
    }));
  selectFilterData[1].options = mapOptions(data as any);
};

// Default selectFilter params
const selectFilterValues = ref({ userStatus: "2", userRole: ["1", "3"] });
const changeSelectFilter = (value: typeof selectFilterValues.value) => {
  ElMessage.success("Notice the request parameter changes 🤔");
  proTable.value!.pageable.pageNum = 1;
  selectFilterValues.value = value;
};

// Default treeFilter params
const treeFilterValues = reactive({ departmentId: ["11"] });
const changeTreeFilter = (val: string[]) => {
  ElMessage.success("Notice the request parameter changes 🤔");
  proTable.value!.pageable.pageNum = 1;
  treeFilterValues.departmentId = val;
};

// Select row
const setCurrent = () => {
  proTable.value!.radio = proTable.value?.tableData[3].id;
  proTable.value?.element?.setCurrentRow(proTable.value?.tableData[3]);
};

watch(
  () => proTable.value?.radio,
  () => proTable.value?.radio && ElMessage.success(`Selected data with id【${proTable.value?.radio}】`)
);

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
