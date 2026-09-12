<template>
  <div class="account-manage">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchUsers"
      :tool-button="['refresh', 'setting', 'search']"
      row-key="key"
    >
      <template #tableHeader="{ isSelected, selectedListIds }">
        <el-button v-if="isSelected" type="danger" :icon="Delete" @click="batchDelete(selectedListIds)">
          {{ $t('common.batchDelete') }}
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
        <el-tag v-for="role in (row.roles ?? [])" :key="role" size="small" class="account-manage__role-tag">
          {{ role }}
        </el-tag>
        <span v-if="!(row.roles?.length)" class="account-manage__no-role">{{ $t('common.unassigned') }}</span>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" size="small" @click="openAssignRole(row)">{{ $t('common.assignRole') }}</el-button>
        <el-button link type="danger" size="small" @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
      </template>
    </ProTable>

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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getUserList, deleteUser, changeUserStatus, editUser } from "@/api/modules/user";
import type { UserDocument } from "@/api/modules/user";
import AssignRoleDialog from "./components/AssignRoleDialog.vue";

const { t } = useI18n();
const proTableRef = ref<ProTableInstance>();

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
      key: "createTime",
    },
  },
  { prop: "operation", label: t("common.operation"), width: 180, fixed: "right" },
];

// ── Data fetching ──

const fetchUsers = async (params: any) => {
  const { data } = await getUserList({
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    username: params.username,
    createTime: params.createTime,
  });
  return data;
};

// ── Status toggle ──

const toggleStatus = async (row: UserDocument) => {
  const newStatus = row.status === 1 ? 0 : 1;
  try {
    await changeUserStatus({ id: row.key, status: newStatus });
    ElMessage.success(newStatus === 1 ? t("common.enabled") : t("common.disabled"));
    proTableRef.value?.getTableList();
  } catch {
    ElMessage.error(t("common.operationFailed"));
  }
};

// ── Delete ──

const handleDelete = async (row: UserDocument) => {
  try {
    await ElMessageBox.confirm(
      t("common.deleteConfirm", { name: row.username }),
      t("common.deleteTitle"),
      { type: "warning" }
    );
    await deleteUser({ id: [row.key] });
    ElMessage.success(t("common.deleteSuccess"));
    proTableRef.value?.getTableList();
  } catch {
    // cancelled
  }
};

const batchDelete = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(
      t("common.batchDeleteConfirm", { count: ids.length }),
      t("common.batchDeleteTitle"),
      { type: "warning" }
    );
    for (const key of ids) {
      await deleteUser({ id: [key] });
    }
    ElMessage.success(t("common.batchDeleteSuccess"));
    proTableRef.value?.clearSelection();
    proTableRef.value?.getTableList();
  } catch {
    // cancelled
  }
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
    roles,
  });
  ElMessage.success(t("common.roleAssignSuccess"));
  proTableRef.value?.getTableList();
};
</script>

<style scoped lang="scss">
.account-manage {
  padding: 16px;

  &__role-tag {
    margin-right: 4px;
  }

  &__no-role {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}
</style>