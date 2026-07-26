<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="Department Management"
      row-key="id"
      :columns="columns"
      :request-api="getDepartmentList"
      :data-callback="dataCallback"
      :pagination="false"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDialog()">Add Department</el-button>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openDialog(scope.row)">Edit</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Department' : 'Add Department'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Department ID" prop="id">
          <el-input v-model="form.id" placeholder="e.g. 1, 1-1" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="Department name" />
        </el-form-item>
        <el-form-item label="Parent">
          <el-tree-select
            v-model="form.parent"
            :data="parentOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="None (root)"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="departmentManage">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { ColumnProps } from "@/components/ProTable/interface";
import { Delete, EditPen, CirclePlus } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { getDepartmentList, createDepartment, updateDepartment, deleteDepartment } from "@/api/modules/system";

const proTable = ref();
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const parentOptions = ref<any[]>([]);

const form = reactive({ id: "", name: "", parent: undefined as string | undefined });

const rules: FormRules = {
  id: [{ required: true, message: "Required" }],
  name: [{ required: true, message: "Required" }]
};

const dataCallback = (data: any) => {
  parentOptions.value = Array.isArray(data) ? data : (data.list ?? []);
  return data;
};

const columns: ColumnProps[] = [
  { prop: "id", label: "Department ID", width: 120, search: { el: "input" } },
  { prop: "name", label: "Name", align: "left", search: { el: "input" } },
  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
];

const openDialog = (row?: any) => {
  isEdit.value = !!row;
  if (row) {
    form.id = row.id;
    form.name = row.name;
    form.parent = row.parent;
    form.key = row.key;
  } else {
    formRef.value?.resetFields();
    form.id = "";
    form.name = "";
    form.parent = undefined;
    form.key = undefined;
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  await formRef.value?.validate();
  if (isEdit.value) {
    await updateDepartment(form.key, { id: form.id, name: form.name, parent: form.parent });
    ElMessage.success("Department updated");
  } else {
    await createDepartment({ id: form.id, name: form.name, parent: form.parent });
    ElMessage.success("Department created");
  }
  dialogVisible.value = false;
  proTable.value?.getTableList();
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete department "${row.name}"?`, "Warning", { type: "warning" });
  await deleteDepartment(row.key);
  ElMessage.success("Department deleted");
  proTable.value?.getTableList();
};
</script>
