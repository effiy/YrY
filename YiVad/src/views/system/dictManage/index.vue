<template>
  <div class="table-box">
    <el-tabs v-model="activeDict" @tab-change="loadItems">
      <el-tab-pane label="User Status" name="status_dict" />
      <el-tab-pane label="Gender" name="gender_dict" />
    </el-tabs>

    <ProTable
      ref="proTable"
      :title="activeDict === 'status_dict' ? 'Status Dictionary' : 'Gender Dictionary'"
      :columns="columns"
      :request-api="getItems"
      :pagination="false"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDialog()">Add Item</el-button>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openDialog(scope.row)">Edit</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Item' : 'Add Item'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="activeDict === 'status_dict' ? 'Label (userLabel)' : 'Label (genderLabel)'" prop="label">
          <el-input v-model="form.label" placeholder="Display label" />
        </el-form-item>
        <el-form-item :label="activeDict === 'status_dict' ? 'Value (userValue)' : 'Value (genderValue)'" prop="value">
          <el-input-number v-model="form.value" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="dictManage">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { ColumnProps } from "@/components/ProTable/interface";
import { Delete, EditPen, CirclePlus } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { getDictItems, createDictItem, updateDictItem, deleteDictItem } from "@/api/modules/system";

const proTable = ref();
const activeDict = ref("status_dict");
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({ label: "", value: 0, key: "" });

const rules: FormRules = {
  label: [{ required: true, message: "Required" }],
  value: [{ required: true, message: "Required" }]
};

const fieldMap: Record<string, { label: string; value: string }> = {
  status_dict: { label: "userLabel", value: "userValue" },
  gender_dict: { label: "genderLabel", value: "genderValue" }
};

const columns: ColumnProps[] = [
  { prop: fieldMap[activeDict.value]?.label || "label", label: "Label", align: "left" },
  { prop: fieldMap[activeDict.value]?.value || "value", label: "Value", width: 120 },
  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
];

const getItems = () => getDictItems(activeDict.value);

const loadItems = () => proTable.value?.getTableList();

const openDialog = (row?: any) => {
  isEdit.value = !!row;
  const f = fieldMap[activeDict.value];
  if (row) {
    form.label = row[f.label];
    form.value = row[f.value];
    form.key = row.key;
  } else {
    formRef.value?.resetFields();
    form.label = "";
    form.value = 0;
    form.key = "";
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  await formRef.value?.validate();
  const f = fieldMap[activeDict.value];
  const data = { [f.label]: form.label, [f.value]: form.value };
  if (isEdit.value) {
    await updateDictItem(activeDict.value, form.key, data);
    ElMessage.success("Item updated");
  } else {
    await createDictItem(activeDict.value, data);
    ElMessage.success("Item created");
  }
  dialogVisible.value = false;
  proTable.value?.getTableList();
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm("Delete this item?", "Warning", { type: "warning" });
  await deleteDictItem(activeDict.value, row.key);
  ElMessage.success("Item deleted");
  proTable.value?.getTableList();
};
</script>
