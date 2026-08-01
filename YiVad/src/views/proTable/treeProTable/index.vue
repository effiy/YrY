<template>
  <div class="main-box">
    <TreeFilter
      label="name"
      title="Department List (single)"
      :data="treeFilterData"
      :default-value="initParam.departmentId"
      @change="changeTreeFilter"
    />
    <div class="table-box">
      <ProTable
        ref="proTable"
        row-key="id"
        :indent="20"
        :columns="columns"
        :request-api="getUserTreeList"
        :request-auto="false"
        :init-param="initParam"
        :search-col="{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }"
      >
        <!-- Table Header Buttons -->
        <template #tableHeader>
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('Add')">Add User</el-button>
        </template>
        <!-- Table Operations -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('View', scope.row)">View</el-button>
          <el-button type="primary" link :icon="EditPen" @click="openDrawer('Edit', scope.row)">Edit</el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteAccount(scope.row)">Delete</el-button>
        </template>
      </ProTable>
      <UserDrawer ref="drawerRef" />
      <ImportExcel ref="dialogRef" />
    </div>
  </div>
</template>

<script setup lang="tsx" name="treeProTable">
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { ElMessage, ElNotification } from "element-plus";
import { onMounted, reactive, ref } from "vue";

import { User } from "@/api/interface";
import { addUser, deleteUser, editUser, getUserDepartment, getUserStatus, getUserTreeList } from "@/api/modules/user";
import ImportExcel from "@/components/ImportExcel/index.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import TreeFilter from "@/components/TreeFilter/index.vue";
import { useHandleData } from "@/hooks/useHandleData";
import { genderType } from "@/utils/dict";
import UserDrawer from "@/views/proTable/components/UserDrawer.vue";

onMounted(() => {
  getTreeFilter();
  ElNotification({
    title: "Tip",
    message: "This page's ProTable data will not auto-request. It waits for the treeFilter data to complete before triggering the table request.",
    type: "info",
    duration: 10000
  });
  setTimeout(() => {
    ElNotification({
      title: "Tip",
      message: "This page's ProTable gender search box is a remote data search. Check the code for details.",
      type: "info",
      duration: 10000
    });
  }, 0);
});

// ProTable instance
const proTable = ref<ProTableInstance>();

// Initial request params defined here are automatically included in every subsequent request. Changing initParam will auto-refresh table data.
const initParam = reactive({ departmentId: "" });

// Get treeFilter data
// When requestAuto is false, table data is not automatically requested. The table will only load after treeFilter data is fetched and initParam.departmentId is updated.
const treeFilterData = ref<any>([]);
const getTreeFilter = async () => {
  const { data } = await getUserDepartment();
  treeFilterData.value = data;
  initParam.departmentId = treeFilterData.value[1].id;
};

// Tree filter change
const changeTreeFilter = (val: string) => {
  ElMessage.success("Check request parameter changes 🤔");
  proTable.value!.pageable.pageNum = 1;
  initParam.departmentId = val;
};

// Simulate remote loading of gender search data
const loading = ref(false);
const filterGenderEnum = ref<typeof genderType>([]);
const remoteMethod = (query: string) => {
  filterGenderEnum.value = [];
  if (!query) return;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    filterGenderEnum.value = genderType.filter(item => item.label.includes(query));
  }, 500);
};

// Table column configuration
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "index", label: "#", width: 80 },
  { prop: "username", label: "User Name" },
  {
    prop: "gender",
    label: "Gender",
    sortable: true,
    isFilterEnum: false,
    enum: filterGenderEnum,
    search: {
      el: "select",
      props: { placeholder: "Enter gender to search", filterable: true, remote: true, reserveKeyword: true, loading, remoteMethod }
    },
    render: scope => <>{scope.row.gender === 1 ? "Male" : "Female"}</>
  },
  { prop: "idCard", label: "ID Card" },
  { prop: "email", label: "Email" },
  { prop: "address", label: "Address" },
  {
    prop: "status",
    label: "User Status",
    sortable: true,
    tag: true,
    enum: getUserStatus,
    search: { el: "tree-select" },
    fieldNames: { label: "userLabel", value: "userStatus" }
  },
  { prop: "createTime", label: "Create Time", width: 180 },
  { prop: "operation", label: "Operations", width: 300, fixed: "right" }
]);

// Delete user
const deleteAccount = async (params: User.ResUserList) => {
  await useHandleData(deleteUser, { id: [params.id] }, `Delete【${params.username]`);
  proTable.value?.getTableList();
};

// Open drawer (Add, View, Edit)
const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);
const openDrawer = (title: string, row: Partial<User.ResUserList> = {}) => {
  const params = {
    title,
    row: { ...row },
    isView: title === "View",
    api: title === "Add" ? addUser : title === "Edit" ? editUser : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
