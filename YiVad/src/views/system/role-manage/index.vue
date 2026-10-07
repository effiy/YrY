<template>
  <div class="role-manage page">
    <PageHeaderCard
      :icon="Lock"
      icon-bg="linear-gradient(135deg, #e6a23c, #ca8a04)"
      :title="$t('system.role.title')"
      :description="$t('system.role.pageDescription')"
    />
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchRoles"
      :tool-button="['refresh', 'setting', 'search']"
      row-key="key"
    >
      <template #tableHeader="{ isSelected, selectedListIds }">
        <el-button type="primary" :icon="Plus" @click="openCreate">{{ $t("system.role.addRole") }}</el-button>
        <el-button v-if="isSelected" type="danger" :icon="Delete" @click="batchDelete(selectedListIds)">
          {{ $t("common.batchDelete") }}
        </el-button>
      </template>
      <template #userCount="{ row }">
        <el-tag size="small" type="info">{{ row.userCount ?? 0 }}</el-tag>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" size="small" @click="openEdit(row)">{{ $t("common.edit") }}</el-button>
        <el-button link type="success" size="small" @click="copyRole(row)">Copy</el-button>
        <el-button link type="danger" size="small" @click="handleDelete(row)">{{ $t("common.delete") }}</el-button>
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('system.role.editRole') : t('system.role.addRole')"
      width="700px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" @keyup.enter="submitForm">
        <el-form-item :label="t('system.role.roleName')" prop="name">
          <el-input v-model="form.name" :placeholder="t('system.dialog.namePlaceholder')" maxlength="30" autofocus />
        </el-form-item>
        <el-form-item :label="t('system.role.roleCode')" prop="code">
          <el-input v-model="form.code" :placeholder="t('system.role.roleCodePlaceholder')" :disabled="isEdit" maxlength="30" />
        </el-form-item>
        <el-form-item :label="t('system.role.description')" prop="description">
          <el-input v-model="form.description" type="textarea" :placeholder="t('system.role.descriptionPlaceholder')" maxlength="200" />
        </el-form-item>
        <el-form-item :label="t('system.role.permissions')" prop="permissions">
          <PermissionMatrix v-model="form.permissions" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ $t("common.confirm") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="roleManage">
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Delete, Lock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getRoleList, createRole, updateRole, deleteRole, getRoleUserCount } from "@/api/modules/roleService";
import type { RoleDocument } from "@/api/modules/roleService";
import PermissionMatrix from "./components/PermissionMatrix.vue";
import { confirm } from "@/hooks/useConfirmAction";

const proTableRef = ref<ProTableInstance>();
const { t } = useI18n();

const columns: ColumnProps<RoleDocument>[] = [
  { type: "selection", width: 50 },
  { type: "index", label: "#", width: 60 },
  { prop: "name", label: t("system.role.roleName"), minWidth: 140, search: { el: "input" } },
  { prop: "code", label: t("system.role.roleCode"), width: 140 },
  { prop: "description", label: t("system.role.description"), minWidth: 200, showOverflowTooltip: true },
  { prop: "userCount", label: t("system.role.memberCount"), width: 100 },
  { prop: "createdAt", label: t("common.createTime"), width: 180 },
  { prop: "operation", label: t("common.operation"), width: 160, fixed: "right" }
];

const fetchRoles = async (params: any) => {
  const { data } = await getRoleList({
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    name: params.name
  });
  return data;
};

const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingKey = ref("");

const form = reactive({
  name: "",
  code: "",
  description: "",
  permissions: [] as string[]
});

const rules: FormRules = {
  name: [{ required: true, message: () => t("system.role.roleNameRequired"), trigger: "blur" }],
  code: [
    { required: true, message: () => t("system.role.roleCodeRequired"), trigger: "blur" },
    { pattern: /^[a-z][a-z0-9_]*$/, message: () => t("system.role.roleCodePattern"), trigger: "blur" }
  ]
};

const resetForm = () => {
  form.name = "";
  form.code = "";
  form.description = "";
  form.permissions = [];
  editingKey.value = "";
  formRef.value?.resetFields();
};

const openCreate = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row: RoleDocument) => {
  isEdit.value = true;
  editingKey.value = row.key;
  form.name = row.name;
  form.code = row.code;
  form.description = row.description ?? "";
  form.permissions = row.permissions ?? [];
  dialogVisible.value = true;
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateRole({
        key: editingKey.value,
        name: form.name,
        description: form.description,
        permissions: form.permissions
      });
      ElMessage.success(t("system.dialog.updateSuccess"));
    } else {
      await createRole({
        name: form.name,
        code: form.code,
        description: form.description,
        permissions: form.permissions
      });
      ElMessage.success(t("system.dialog.createSuccess"));
    }
    dialogVisible.value = false;
    proTableRef.value?.getTableList();
  } catch {
    ElMessage.error(t("system.dialog.operationFailed"));
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (row: RoleDocument) => {
  const userCount = await getRoleUserCount(row.code);
  if (userCount > 0) {
    ElMessage.warning(t("system.role.cannotDeleteWithUsers", { name: row.name, count: userCount }));
    return;
  }
  const ok = await confirm(
    t("system.role.deleteConfirm", { name: row.name }),
    t("system.role.deleteTitle")
  );
  if (!ok) return;
  await deleteRole(row.key);
  ElMessage.success(t("system.dialog.deleteSuccess"));
  proTableRef.value?.getTableList();
};

const batchDelete = async (ids: string[]) => {
  const ok = await confirm(
    t("system.role.batchDeleteConfirm", { count: ids.length }),
    t("system.role.deleteTitle")
  );
  if (!ok) return;
  for (const key of ids) {
    await deleteRole(key);
  }
  ElMessage.success(t("system.dialog.deleteSuccess"));
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};

async function copyRole(row: RoleDocument) {
  try {
    await createRole({
      name: `${row.name} (Copy)`,
      code: `${row.code}_copy`,
      description: row.description,
      permissions: row.permissions ?? []
    });
    ElMessage.success("Role copied");
    proTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Copy failed");
  }
}
</script>

<style scoped lang="scss">
.role-manage {
  // padding + background come from global .page class
  min-height: 100%;
}
</style>
