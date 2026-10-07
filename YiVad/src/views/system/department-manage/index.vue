<template>
  <div class="dept-page page">
    <PageHeaderCard
      :icon="OfficeBuilding"
      icon-bg="linear-gradient(135deg, #409eff, #6366f1)"
      :title="$t('system.department.title')"
      :description="$t('system.department.description')"
    />
    <ProTable
      ref="proTableRef"
      title="Departments"
      row-key="key"
      :pagination="false"
      :tree-props="{ children: 'children' }"
      :default-expand-all="true"
      :indent="24"
      :columns="columns"
      :data="treeData"
      :height="tableHeight"
    >
      <template #tableHeader="{ isSelected, selectedListIds }">
        <el-button type="primary" :icon="Plus" @click="openCreate">{{ $t('common.create') }}</el-button>
        <el-button v-if="isSelected" type="danger" :icon="Delete" @click="batchDelete(selectedListIds)">
          {{ $t('common.batchDelete') }}
        </el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
          {{ row.status === 'active' ? $t('common.enable') : $t('common.disable') }}
        </el-tag>
      </template>
      <template #member_count="{ row }">
        <el-tag size="small" type="info">{{ row.member_count ?? 0 }}</el-tag>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" size="small" :icon="Edit" @click="openEdit(row)">{{ $t('common.edit') }}</el-button>
        <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('common.edit') : $t('common.create')"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @keyup.enter="submit">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="Department name" maxlength="60" autofocus />
        </el-form-item>
        <el-form-item label="Parent">
          <el-tree-select
            v-model="form.parent_key"
            :data="parentOptions"
            :props="{ label: 'name', children: 'children' }"
            node-key="key"
            placeholder="None (top-level)"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Leader">
          <el-input v-model="form.leader" placeholder="Department leader" maxlength="30" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Description" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">{{ $t('common.enable') }}</el-radio>
            <el-radio value="inactive">{{ $t('common.disable') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Sort Order">
          <el-input-number v-model="form.sort_order" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="departmentManage">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Delete, Edit, OfficeBuilding } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { nanoid } from "nanoid";
import ProTable from "@/components/ProTable/index.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getDepartmentList, createDepartment, updateDepartment, deleteDepartment } from "@/api/modules/departmentService";
import type { Department } from "@/api/modules/departmentService";
import { confirm } from "@/hooks/useConfirmAction";

const { t } = useI18n();
const proTableRef = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const isEdit = ref(false);
const editingKey = ref("");
const submitting = ref(false);
const allDepartments = ref<Department[]>([]);

const tableHeight = ref<number | undefined>(undefined);
function updateTableHeight() {
  tableHeight.value = Math.max(200, window.innerHeight - 220);
}
onMounted(() => { updateTableHeight(); window.addEventListener("resize", updateTableHeight); loadData(); });
onBeforeUnmount(() => { window.removeEventListener("resize", updateTableHeight); });

function buildTree(list: Department[]): Department[] {
  const map = new Map<string, Department & { children?: Department[] }>();
  const roots: (Department & { children?: Department[] })[] = [];
  for (const d of list) map.set(d.key, { ...d, children: [] });
  for (const d of map.values()) {
    if (d.parent_key && map.has(d.parent_key)) {
      map.get(d.parent_key)!.children!.push(d);
    } else {
      roots.push(d);
    }
  }
  return roots;
}

const treeData = computed(() => buildTree(allDepartments.value));

const parentOptions = computed(() => {
  const exclude = (list: any[]): any[] =>
    list.filter(d => d.key !== editingKey.value).map(d => ({ ...d, children: d.children ? exclude(d.children) : [] }));
  return exclude(treeData.value);
});

function emptyForm() {
  return {
    name: "",
    parent_key: "",
    leader: "",
    description: "",
    status: "active" as "active" | "inactive",
    sort_order: 0
  };
}

const form = reactive(emptyForm());

const rules: FormRules = {
  name: [{ required: true, message: "Department name is required", trigger: "blur" }]
};

async function loadData() {
  try {
    const res = await getDepartmentList({ pageSize: 500 });
    allDepartments.value = (res.data?.list ?? []) as Department[];
  } catch { /* handled by ProTable */ }
}

function openCreate() {
  isEdit.value = false;
  editingKey.value = "";
  Object.assign(form, emptyForm());
  dialogVisible.value = true;
}

function openEdit(row: Department) {
  isEdit.value = true;
  editingKey.value = row.key;
  form.name = row.name;
  form.parent_key = row.parent_key || "";
  form.leader = row.leader || "";
  form.description = row.description || "";
  form.status = row.status;
  form.sort_order = row.sort_order ?? 0;
  dialogVisible.value = true;
}

async function submit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateDepartment(editingKey.value, { ...form, parent_key: form.parent_key || "" });
      ElMessage.success("Department updated");
    } else {
      const key = `dept_${nanoid(10)}`;
      await createDepartment({ ...form, key, parent_key: form.parent_key || "", member_count: 0 });
      ElMessage.success("Department created");
    }
    dialogVisible.value = false;
    await loadData();
  } catch (e: any) {
    ElMessage.error(e?.message || "Operation failed");
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: Department) {
  const children = allDepartments.value.filter(d => d.parent_key === row.key);
  const msg = children.length
    ? `"${row.name}" has ${children.length} sub-department(s). Deleting it will orphan them. Continue?`
    : `Delete "${row.name}"?`;
  const ok = await confirm(msg, "Delete Department");
  if (!ok) return;
  try {
    await deleteDepartment(row.key);
    ElMessage.success("Department deleted");
    await loadData();
  } catch (e: any) {
    ElMessage.error(e?.message || "Delete failed");
  }
}

async function batchDelete(ids: (string | number)[]) {
  if (!ids.length) return;
  const ok = await confirm(`Delete ${ids.length} department(s)?`, "Batch Delete");
  if (!ok) return;
  for (const id of ids) {
    try { await deleteDepartment(String(id)); } catch { /* continue */ }
  }
  ElMessage.success(`Deleted ${ids.length} department(s)`);
  await loadData();
}

const columns: ColumnProps<Department>[] = [
  { type: "selection", width: 50 },
  { prop: "name", label: "Name", minWidth: 180 },
  { prop: "leader", label: "Leader", width: 120 },
  { prop: "member_count", label: "Members", width: 90 },
  { prop: "status", label: "Status", width: 90 },
  { prop: "sort_order", label: "Sort", width: 70 },
  { prop: "description", label: "Description", minWidth: 200 },
  { prop: "operation", label: "Actions", width: 160, fixed: "right" }
];
</script>

<style scoped lang="scss">
.dept-page {
  min-height: 100%;
}
</style>