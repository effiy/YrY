<template>
  <div class="account-manage page">
    <PageHeaderCard
      :icon="UserFilled"
      icon-bg="linear-gradient(135deg, #409eff, #2563eb)"
      :title="$t('system.account.title')"
      :description="$t('system.account.description')"
    />
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchUsers"
      :tool-button="['refresh', 'setting', 'search']"
      row-key="key"
    >
      <template #tableHeader="{ isSelected, selectedListIds }">
        <el-button type="primary" :icon="Plus" @click="openCreate">{{ $t('common.create') }}</el-button>
        <el-button v-if="isSelected" type="danger" :icon="Delete" @click="batchDelete(selectedListIds)">
          {{ $t("common.batchDelete") }}
        </el-button>
        <el-button v-if="isSelected" type="success" plain @click="batchEnable(selectedListIds, 1)">
          Batch Enable
        </el-button>
        <el-button v-if="isSelected" type="warning" plain @click="batchEnable(selectedListIds, 0)">
          Batch Disable
        </el-button>
      </template>
      <template #status="{ row }">
        <el-switch
          :model-value="row.status === 1"
          :active-text="$t('common.enable')"
          :inactive-text="$t('common.disable')"
          @change="toggleStatus(row)"
        />
      </template>
      <template #roles="{ row }">
        <el-tag v-for="role in row.roles ?? []" :key="role" size="small" class="account-manage__role-tag">
          {{ role }}
        </el-tag>
        <span v-if="!row.roles?.length" class="account-manage__no-role">{{ $t("common.unassigned") }}</span>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" size="small" :icon="Edit" @click="openEdit(row)">{{ $t('common.edit') }}</el-button>
        <el-button link type="primary" size="small" @click="openAssignRole(row)">{{ $t("common.assignRole") }}</el-button>
        <el-button link type="warning" size="small" @click="handleResetPassword(row)">Reset Pwd</el-button>
        <el-button link type="danger" size="small" @click="handleDelete(row)">{{ $t("common.delete") }}</el-button>
      </template>
    </ProTable>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Account' : 'Create Account'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" @keyup.enter="submit">
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" placeholder="Username" maxlength="30" :disabled="isEdit" autofocus />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="Password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Password" maxlength="30" show-password />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Email" maxlength="60" />
        </el-form-item>
        <el-form-item label="Roles">
          <el-select v-model="form.roles" multiple placeholder="Select roles" style="width: 100%">
            <el-option v-for="r in availableRoles" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ $t('common.enable') }}</el-radio>
            <el-radio :value="0">{{ $t('common.disable') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- Reset Password Dialog -->
    <el-dialog v-model="pwdDialogVisible" title="Reset Password" width="400px" destroy-on-close>
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="90px">
        <el-form-item label="New Password" prop="password">
          <el-input v-model="pwdForm.password" type="password" placeholder="New password" maxlength="30" show-password autofocus />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="pwdSubmitting" @click="submitPwd">Reset</el-button>
      </template>
    </el-dialog>

    <AssignRoleDialog
      v-model="assignDialogVisible"
      :username="assignTarget?.username ?? ''"
      :user-key="assignTarget?.key ?? ''"
      :current-roles="assignTarget?.roles ?? []"
      @submit="handleAssignRole"
    />
  </div>
</template>

<script setup lang="ts" name="accountManage">
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Delete, Edit, UserFilled } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getUserList, addUser, deleteUser, changeUserStatus, editUser, resetUserPassWord } from "@/api/modules/user";
import { getAllRoles } from "@/api/modules/roleService";
import type { UserDocument } from "@/api/modules/user";
import AssignRoleDialog from "./components/AssignRoleDialog.vue";
import { confirm, confirmAndExecute, deleteConfirm, batchDeleteConfirm } from "@/hooks/useConfirmAction";

const { t } = useI18n();
const proTableRef = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const pwdFormRef = ref<FormInstance>();

const availableRoles = ref<string[]>([]);

// ── Table columns ──
const columns: ColumnProps<UserDocument>[] = [
  { type: "selection", width: 50 },
  { type: "index", label: "#", width: 60 },
  { prop: "username", label: t("common.username"), minWidth: 120, search: { el: "input" } },
  { prop: "email", label: t("common.email"), minWidth: 180 },
  { prop: "roles", label: t("common.role"), minWidth: 200 },
  { prop: "status", label: t("common.status"), width: 100 },
  {
    prop: "createdTime",
    label: t("common.createTime"),
    width: 180,
    search: {
      el: "date-picker",
      props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
      key: "createTime"
    }
  },
  { prop: "operation", label: t("common.operation"), width: 260, fixed: "right" }
];

// ── Data fetching ──
const fetchUsers = async (params: any) => {
  const { data } = await getUserList({
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    username: params.username,
    createTime: params.createTime
  });
  return data;
};

// ── Create/Edit Dialog ──
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const form = reactive({ username: "", password: "", email: "", roles: [] as string[], status: 1 });

const rules: FormRules = {
  username: [{ required: true, message: "Username is required", trigger: "blur" }],
  password: [
    { required: true, message: "Password is required", trigger: "blur" },
    { min: 6, message: "Password must be at least 6 characters", trigger: "blur" }
  ],
  email: [{ type: "email", message: "Invalid email", trigger: "blur" }]
};

function openCreate() {
  isEdit.value = false;
  form.username = "";
  form.password = "";
  form.email = "";
  form.roles = [];
  form.status = 1;
  dialogVisible.value = true;
}

function openEdit(row: UserDocument) {
  isEdit.value = true;
  form.username = row.username || "";
  form.password = "";
  form.email = row.email || "";
  form.roles = row.roles || [];
  form.status = row.status ?? 1;
  dialogVisible.value = true;
}

async function submit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      const editParams: Record<string, any> = { key: form.username, email: form.email, roles: form.roles, status: form.status };
      await editUser(editParams);
      ElMessage.success("Account updated");
    } else {
      await addUser({
        username: form.username,
        password: form.password,
        email: form.email,
        roles: form.roles,
        status: form.status
      });
      ElMessage.success("Account created");
    }
    dialogVisible.value = false;
    proTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Operation failed");
  } finally {
    submitting.value = false;
  }
}

// ── Password Reset ──
const pwdDialogVisible = ref(false);
const pwdSubmitting = ref(false);
const pwdTarget = ref("");
const pwdForm = reactive({ password: "" });
const pwdRules: FormRules = {
  password: [
    { required: true, message: "Password is required", trigger: "blur" },
    { min: 6, message: "Password must be at least 6 characters", trigger: "blur" }
  ]
};

function handleResetPassword(row: UserDocument) {
  pwdTarget.value = row.key;
  pwdForm.password = "";
  pwdDialogVisible.value = true;
}

async function submitPwd() {
  if (!pwdFormRef.value) return;
  const valid = await pwdFormRef.value.validate().catch(() => false);
  if (!valid) return;
  pwdSubmitting.value = true;
  try {
    // Update user with new password
    await editUser({ key: pwdTarget.value, password: pwdForm.password });
    ElMessage.success("Password reset");
    pwdDialogVisible.value = false;
  } catch (e: any) {
    ElMessage.error(e?.message || "Reset failed");
  } finally {
    pwdSubmitting.value = false;
  }
}

// ── Status toggle ──
const toggleStatus = async (row: UserDocument) => {
  const newStatus = row.status === 1 ? 0 : 1;
  const action = newStatus === 1 ? t("common.enable") : t("common.disable");
  const ok = await confirm(
    t("common.statusToggleConfirm", { action, name: row.username }),
    t("common.confirmTitle")
  );
  if (!ok) return;
  const result = await changeUserStatus({ id: row.key, status: newStatus }).then(() => true).catch(() => false);
  if (result) {
    ElMessage.success(newStatus === 1 ? t("common.enabled") : t("common.disabled"));
    proTableRef.value?.getTableList();
  }
};

// ── Batch enable/disable ──
async function batchEnable(ids: string[], status: number) {
  const action = status === 1 ? "enable" : "disable";
  const ok = await confirm(`${action} ${ids.length} user(s)?`, "Batch Operation");
  if (!ok) return;
  for (const key of ids) {
    try { await changeUserStatus({ id: key, status }); } catch { /* continue */ }
  }
  ElMessage.success(`Batch ${action}d ${ids.length} user(s)`);
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
}

// ── Delete ──
const handleDelete = async (row: UserDocument) => {
  const ok = await deleteConfirm(row.username, "user");
  if (!ok) return;
  const success = await confirmAndExecute("", () => deleteUser({ id: [row.key] }), {
    successMessage: t("common.deleteSuccess")
  });
  if (success) proTableRef.value?.getTableList();
};

const batchDelete = async (ids: string[]) => {
  const ok = await batchDeleteConfirm(ids.length, "users");
  if (!ok) return;
  for (const key of ids) {
    await deleteUser({ id: [key] });
  }
  ElMessage.success(t("common.batchDeleteSuccess"));
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};

// ── Role assignment ──
const assignDialogVisible = ref(false);
const assignTarget = ref<UserDocument | null>(null);

const openAssignRole = (row: UserDocument) => {
  assignTarget.value = row;
  assignDialogVisible.value = true;
};

const handleAssignRole = async (roles: string[]) => {
  if (!assignTarget.value) return;
  await editUser({
    key: assignTarget.value.key,
    roles
  });
  ElMessage.success(t("common.roleAssignSuccess"));
  proTableRef.value?.getTableList();
};

onMounted(async () => {
  try {
    const res = await getAllRoles();
    availableRoles.value = ((res.data ?? []) as any[]).map((r: any) => r.code || r.name).filter(Boolean);
  } catch { /* best-effort */ }
});
</script>

<style scoped lang="scss">
.account-manage {
  min-height: 100%;
  &__role-tag {
    margin-right: 4px;
  }
  &__no-role {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>