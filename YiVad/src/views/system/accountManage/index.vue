<template>
  <div class="table-box">
    <ProTable ref="proTable" title="Account Management" :columns="columns" :request-api="getTableList">
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDialog()">Add Account</el-button>
        <el-button type="primary" :icon="Download" plain @click="downloadFile">Export</el-button>
      </template>
      <template #status="scope">
        <el-switch
          :model-value="scope.row.status === 1"
          active-text="Active"
          inactive-text="Disabled"
          @click="toggleStatus(scope.row)"
        />
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openDialog(scope.row)">Edit</el-button>
        <el-button type="primary" link :icon="Refresh" @click="resetPass(scope.row)">Reset</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Account' : 'Add Account'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" placeholder="Username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="Password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Password" show-password />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email" placeholder="Email" />
        </el-form-item>
        <el-form-item label="Gender">
          <el-select v-model="form.gender" style="width: 100%">
            <el-option label="Male" :value="1" />
            <el-option label="Female" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="Active" :value="1" />
            <el-option label="Disabled" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="accountManage">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { ColumnProps } from "@/components/ProTable/interface";
import { Delete, EditPen, CirclePlus, Download, Refresh } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import {
  getUserList,
  addUser,
  editUser,
  deleteUser,
  changeUserStatus,
  resetUserPassWord,
  exportUserInfo
} from "@/api/modules/user";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";

const proTable = ref();
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({ username: "", password: "", email: "", gender: 1, status: 1, key: "" });

const rules: FormRules = {
  username: [{ required: true, message: "Required" }],
  password: isEdit.value ? [] : [{ required: true, message: "Required", min: 6, max: 32 }]
};

const getTableList = (params: any) => getUserList(params);

const columns: ColumnProps[] = [
  { type: "index", label: "#", width: 60 },
  { prop: "username", label: "Username", search: { el: "input" } },
  { prop: "email", label: "Email" },
  {
    prop: "gender",
    label: "Gender",
    width: 100,
    render: (s: any) => (s.row.gender === 1 ? "Male" : s.row.gender === 2 ? "Female" : "—")
  },
  { prop: "status", label: "Status", width: 140 },
  { prop: "createdTime", label: "Created", width: 180 },
  { prop: "operation", label: "Actions", width: 240, fixed: "right" }
];

const openDialog = (row?: any) => {
  isEdit.value = !!row;
  if (row) {
    form.username = row.username;
    form.email = row.email || "";
    form.gender = row.gender ?? 1;
    form.status = row.status ?? 1;
    form.key = row.key;
  } else {
    formRef.value?.resetFields();
    form.username = "";
    form.password = "";
    form.email = "";
    form.gender = 1;
    form.status = 1;
    form.key = "";
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  await formRef.value?.validate();
  if (isEdit.value) {
    await editUser({ key: form.key, username: form.username, email: form.email, gender: form.gender, status: form.status });
    ElMessage.success("Account updated");
  } else {
    await addUser({
      username: form.username,
      password: form.password,
      email: form.email,
      gender: form.gender,
      status: form.status
    });
    ElMessage.success("Account created");
  }
  dialogVisible.value = false;
  proTable.value?.getTableList();
};

const toggleStatus = async (row: any) => {
  await useHandleData(changeUserStatus, { id: row.id, status: row.status === 1 ? 0 : 1 }, `Toggle status for [${row.username}]`);
  proTable.value?.getTableList();
};

const resetPass = async (row: any) => {
  await useHandleData(resetUserPassWord, { id: row.id }, `Reset password for [${row.username}]`);
};

const handleDelete = async (row: any) => {
  await useHandleData(deleteUser, { id: [row.id] }, `Delete account [${row.username}]`);
  proTable.value?.getTableList();
};

const downloadFile = () => {
  ElMessageBox.confirm("Export all accounts?", "Tip", { type: "warning" }).then(() =>
    useDownload(exportUserInfo, "Accounts", proTable.value?.searchParam)
  );
};
</script>
