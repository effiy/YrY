<template>
  <div class="main-box">
    <TreeFilter
      label="name"
      title="Department List (Single Select)"
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
        <!-- Table header buttons -->
        <template #tableHeader>
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('Add')">Add User</el-button>
        </template>
        <!-- Table operations -->
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
import { onMounted, reactive, ref } from "vue";
import { User } from "@/api/interface";
import { genderType } from "@/utils/dict";
import { useHandleData } from "@/hooks/useHandleData";
import { ElMessage, ElNotification } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import TreeFilter from "@/components/TreeFilter/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import UserDrawer from "@/views/proTable/components/UserDrawer.vue";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getUserTreeList, deleteUser, editUser, addUser, getUserStatus, getUserDepartment } from "@/api/modules/user";

onMounted(() => {
  getTreeFilter();
  ElNotification({
    title: "Tip",
    message:
      "This page's ProTable data will not auto-fetch; it will trigger the table request only after the treeFilter data request completes.",
    type: "info",
    duration: 10000
  });
  setTimeout(() => {
    ElNotification({
      title: "Tip",
      message: "This page's ProTable gender search box uses remote data search. See code for details.",
      type: "info",
      duration: 10000
    });
  }, 0);
});

// ProTable instance
const proTable = ref<ProTableInstance>();

// If the table needs initial request params, pass them directly to ProTable (they will be automatically included in every subsequent request; changes to these params will auto-refresh the table data)
const initParam = reactive({ departmentId: "" });

// Get treeFilter data
// When ProTable's requestAuto is false, table data won't auto-fetch. After treeFilter data returns, changing initParam.departmentId will trigger the ProTable data request
const treeFilterData = ref<any>([]);
const getTreeFilter = async () => {
  const { data } = await getUserDepartment();
  treeFilterData.value = data;
  initParam.departmentId = treeFilterData.value[1].id;
};

// Tree filter change
const changeTreeFilter = (val: string) => {
  ElMessage.success("Notice the request parameter changes 🤔");
  proTable.value!.pageable.pageNum = 1;
  initParam.departmentId = val;
};

// Simulate remote loading for gender search box
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

// Table column config
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "index", label: "#", width: 80 },
  { prop: "username", label: "Username" },
  {
    prop: "gender",
    label: "Gender",
    sortable: true,
    isFilterEnum: false,
    enum: filterGenderEnum,
    search: {
      el: "select",
      props: { placeholder: "Search by gender", filterable: true, remote: true, reserveKeyword: true, loading, remoteMethod }
    },
    render: scope => <>{scope.row.gender === 1 ? "Male" : "Female"}</>
  },
  { prop: "idCard", label: "ID Card" },
  { prop: "email", label: "Email" },
  { prop: "address", label: "Address" },
  {
    prop: "status",
    label: "Status",
    sortable: true,
    tag: true,
    enum: getUserStatus,
    search: { el: "tree-select" },
    fieldNames: { label: "userLabel", value: "userStatus" }
  },
  { prop: "createTime", label: "Created At", width: 180 },
  { prop: "operation", label: "Actions", width: 300, fixed: "right" }
]);

// Delete user
const deleteAccount = async (params: User.ResUserList) => {
  await useHandleData(deleteUser, { id: [params.id] }, `Delete user【${params.username}】`);
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
