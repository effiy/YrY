<template>
  <div class="content-box">
    <TreeFilter
      label="name"
      title="Department List (Single Select)"
      :request-api="getDepartmentTree"
      :default-value="treeFilterValue.departmentId"
      @change="changeTreeFilter"
    />
    <TreeFilter
      title="Department List (Multiple Select)"
      multiple
      label="name"
      :request-api="getDepartmentTree"
      :default-value="treeFilterValue1.departmentId"
      @change="changeTreeFilter1"
    />
    <div class="descriptions-box card">
      <span class="text"> Tree Filter 🍓🍇🍈🍉</span>
      <el-descriptions title="Config Options 📚" :column="1" border>
        <el-descriptions-item label="requestApi"> API to fetch category data </el-descriptions-item>
        <el-descriptions-item label="data"> Category data; if provided, API request will not be made </el-descriptions-item>
        <el-descriptions-item label="title"> TreeFilter title </el-descriptions-item>
        <el-descriptions-item label="id"> Selected id field, default "id" </el-descriptions-item>
        <el-descriptions-item label="label"> Display label field, default "label" </el-descriptions-item>
        <el-descriptions-item label="multiple"> Whether multiple select, default false </el-descriptions-item>
        <el-descriptions-item label="defaultValue"> Default selected value </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts" name="treeFilter">
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import { getUserDepartment } from "@/api/modules/user";
import TreeFilter from "@/components/TreeFilter/index.vue";

// TreeFilter expects a flat array, but /users/dict/department returns { list, total }
const getDepartmentTree = async () => {
  const res: any = await getUserDepartment();
  return { ...res, data: res.data?.list ?? res.data };
};

const treeFilterValue = reactive({ departmentId: "1" });
const changeTreeFilter = (val: string) => {
  ElMessage.success(`You selected data with id ${val} 🤔`);
  treeFilterValue.departmentId = val;
};

const treeFilterValue1 = reactive({ departmentId: ["11"] });
const changeTreeFilter1 = (val: string[]) => {
  ElMessage.success(`You selected data with id ${JSON.stringify(val)} 🤔`);
  treeFilterValue1.departmentId = val;
};
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
