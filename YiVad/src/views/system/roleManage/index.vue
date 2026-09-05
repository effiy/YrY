<template>
  <div class="role-manage">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchRoles"
      :tool-button="['refresh', 'setting', 'search']"
      row-key="key"
    >
      <template #tableHeader="{ isSelected, selectedListIds }">
        <el-button type="primary" :icon="Plus" @click="openCreate">新建角色</el-button>
        <el-button v-if="isSelected" type="danger" :icon="Delete" @click="batchDelete(selectedListIds)">
          批量删除
        </el-button>
      </template>
      <template #userCount="{ row }">
        <el-tag size="small" type="info">{{ row.userCount ?? 0 }}</el-tag>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
        <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
      </template>
    </ProTable>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新建角色'"
      width="700px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="角色标识" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色标识（英文）" :disabled="isEdit" maxlength="30" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入角色描述" maxlength="200" />
        </el-form-item>
        <el-form-item label="权限配置" prop="permissions">
          <PermissionMatrix v-model="form.permissions" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="roleManage">
import { ref, reactive } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getRoleList, createRole, updateRole, deleteRole, getRoleUserCount } from "@/api/modules/roleService";
import type { RoleDocument } from "@/api/modules/roleService";
import PermissionMatrix from "./components/PermissionMatrix.vue";

const proTableRef = ref<ProTableInstance>();

// ── Table columns ──

const columns: ColumnProps<RoleDocument>[] = [
  { type: "selection", width: 50 },
  { type: "index", label: "#", width: 60 },
  { prop: "name", label: "角色名称", minWidth: 140, search: { el: "input" } },
  { prop: "code", label: "角色标识", width: 140 },
  { prop: "description", label: "描述", minWidth: 200, showOverflowTooltip: true },
  { prop: "userCount", label: "关联用户", width: 100 },
  { prop: "createdAt", label: "创建时间", width: 180 },
  { prop: "operation", label: "操作", width: 160, fixed: "right" },
];

// ── Data fetching ──

const fetchRoles = async (params: any) => {
  const { data } = await getRoleList({
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    name: params.name,
  });
  return data;
};

// ── Dialog state ──

const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingKey = ref("");

const form = reactive({
  name: "",
  code: "",
  description: "",
  permissions: [] as string[],
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [
    { required: true, message: "请输入角色标识", trigger: "blur" },
    { pattern: /^[a-z][a-z0-9_]*$/, message: "角色标识需为小写字母、数字、下划线，以字母开头", trigger: "blur" },
  ],
};

const resetForm = () => {
  form.name = "";
  form.code = "";
  form.description = "";
  form.permissions = [];
  editingKey.value = "";
  formRef.value?.resetFields();
};

// ── CRUD operations ──

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
        permissions: form.permissions,
      });
      ElMessage.success("角色更新成功");
    } else {
      await createRole({
        name: form.name,
        code: form.code,
        description: form.description,
        permissions: form.permissions,
      });
      ElMessage.success("角色创建成功");
    }
    dialogVisible.value = false;
    proTableRef.value?.getTableList();
  } catch {
    ElMessage.error("操作失败");
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (row: RoleDocument) => {
  const userCount = await getRoleUserCount(row.code);
  if (userCount > 0) {
    ElMessage.warning(`角色「${row.name}」下还有 ${userCount} 个关联用户，无法删除`);
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, "删除确认", { type: "warning" });
    await deleteRole(row.key);
    ElMessage.success("删除成功");
    proTableRef.value?.getTableList();
  } catch {
    // cancelled
  }
};

const batchDelete = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${ids.length} 个角色吗？`, "批量删除", { type: "warning" });
    for (const key of ids) {
      await deleteRole(key);
    }
    ElMessage.success("批量删除成功");
    proTableRef.value?.clearSelection();
    proTableRef.value?.getTableList();
  } catch {
    // cancelled
  }
};
</script>

<style scoped lang="scss">
.role-manage {
  padding: 16px;
}
</style>