<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="Menu Management"
      row-key="path"
      :indent="20"
      :columns="columns"
      :request-api="getMenuList"
      :data-callback="dataCallback"
      :pagination="false"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDialog()">Add Menu</el-button>
      </template>
      <template #icon="scope">
        <el-icon :size="18">
          <component :is="scope.row.meta?.icon" v-if="scope.row.meta?.icon" />
          <span v-else>—</span>
        </el-icon>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openDialog(scope.row)">Edit</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Menu' : 'Add Menu'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Menu Name" prop="meta.title">
          <el-input v-model="form.meta.title" placeholder="Display name" />
        </el-form-item>
        <el-form-item label="Route Name" prop="name">
          <el-input v-model="form.name" placeholder="e.g. home" />
        </el-form-item>
        <el-form-item label="Route Path" prop="path">
          <el-input v-model="form.path" placeholder="e.g. /home/index" />
        </el-form-item>
        <el-form-item label="Component" prop="component">
          <el-input v-model="form.component" placeholder="e.g. /home/index" />
        </el-form-item>
        <el-form-item label="Icon">
          <el-input v-model="form.meta.icon" placeholder="Element Plus icon name" />
        </el-form-item>
        <el-form-item label="Sort Order">
          <el-input-number v-model="form.order" :min="0" />
        </el-form-item>
        <el-form-item label="Parent">
          <el-tree-select
            v-model="form.parent"
            :data="parentOptions"
            :props="{ label: 'title', value: 'path', children: 'children' }"
            placeholder="None (top-level)"
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

<script setup lang="ts" name="menuMange">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { ColumnProps } from "@/components/ProTable/interface";
import { Delete, EditPen, CirclePlus } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { getMenuList, createMenu, updateMenu, deleteMenu } from "@/api/modules/system";

const proTable = ref();
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const parentOptions = ref<any[]>([]);

const form = reactive<Record<string, any>>({
  name: "",
  path: "",
  component: "",
  order: 0,
  meta: { title: "", icon: "" },
  parent: undefined
});

const rules: FormRules = {
  "meta.title": [{ required: true, message: "Required" }],
  name: [{ required: true, message: "Required" }],
  path: [{ required: true, message: "Required" }],
  component: [{ required: true, message: "Required" }]
};

const dataCallback = (data: any) => {
  parentOptions.value = Array.isArray(data) ? data : (data.list ?? []);
  return data;
};

const columns: ColumnProps[] = [
  { prop: "meta.title", label: "Menu Name", align: "left", search: { el: "input" } },
  { prop: "meta.icon", label: "Icon" },
  { prop: "name", label: "Route Name", search: { el: "input" } },
  { prop: "path", label: "Route Path", width: 260, search: { el: "input" } },
  { prop: "component", label: "Component Path", width: 260 },
  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
];

const openDialog = (row?: any) => {
  isEdit.value = !!row;
  if (row) {
    Object.assign(form, {
      name: row.name,
      path: row.path,
      component: row.component || "",
      order: row.order ?? 0,
      meta: { title: row.meta?.title || "", icon: row.meta?.icon || "" },
      parent: row.parent ?? undefined,
      key: row.key
    });
  } else {
    formRef.value?.resetFields();
    Object.assign(form, {
      name: "",
      path: "",
      component: "",
      order: 0,
      meta: { title: "", icon: "" },
      parent: undefined,
      key: undefined
    });
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  await formRef.value?.validate();
  if (isEdit.value) {
    await updateMenu(form.key, { ...form });
    ElMessage.success("Menu updated");
  } else {
    await createMenu({ ...form });
    ElMessage.success("Menu created");
  }
  dialogVisible.value = false;
  proTable.value?.getTableList();
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete menu "${row.meta?.title}"?`, "Warning", { type: "warning" });
  await deleteMenu(row.key);
  ElMessage.success("Menu deleted");
  proTable.value?.getTableList();
};
</script>
