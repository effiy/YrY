<template>
  <div class="dict-page page">
    <PageHeaderCard
      :icon="Notebook"
      icon-bg="linear-gradient(135deg, #67c23a, #059669)"
      :title="$t('system.dict.title')"
      :description="$t('system.dict.description')"
    />

    <div class="dict-page__body">
      <!-- Left: Dict Type List -->
      <div class="dict-page__sidebar">
        <div class="dict-page__sidebar-head">
          <span class="dict-page__sidebar-title">Dict Types</span>
          <el-button :icon="Plus" size="small" type="primary" @click="openTypeCreate">Add</el-button>
        </div>
        <el-input
          v-model="typeSearch"
          size="small"
          placeholder="Search types..."
          clearable
          :prefix-icon="Search"
          class="dict-page__sidebar-search"
        />
        <div class="dict-page__sidebar-list">
          <div
            v-for="dt in filteredTypes"
            :key="dt.key"
            class="dict-page__type-item"
            :class="{ 'dict-page__type-item--active': selectedType?.key === dt.key }"
            @click="selectType(dt)"
          >
            <div class="dict-page__type-item-main">
              <span class="dict-page__type-item-name">{{ dt.name }}</span>
              <code class="dict-page__type-item-code">{{ dt.code }}</code>
            </div>
            <el-dropdown trigger="click" @command="(cmd: string) => handleTypeCommand(cmd, dt)">
              <el-button link size="small" :icon="MoreFilled" @click.stop />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit"><el-icon><Edit /></el-icon> Edit</el-dropdown-item>
                  <el-dropdown-item command="delete" divided><el-icon><Delete /></el-icon> Delete</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-empty v-if="!filteredTypes.length" description="No dict types" :image-size="48" />
        </div>
      </div>

      <!-- Right: Dict Items -->
      <div class="dict-page__main">
        <template v-if="selectedType">
          <ProTable
            ref="itemTableRef"
            :title="selectedType.name"
            row-key="key"
            :columns="itemColumns"
            :request-api="fetchItems"
            :tool-button="['refresh', 'search']"
          >
            <template #tableHeader>
              <el-button type="primary" :icon="Plus" @click="openItemCreate">Add Item</el-button>
            </template>
            <template #status="{ row }">
              <el-switch
                :model-value="row.status === 'active'"
                size="small"
                @change="toggleItemStatus(row)"
              />
            </template>
            <template #operation="{ row }">
              <el-button link type="primary" size="small" :icon="Edit" @click="openItemEdit(row)">Edit</el-button>
              <el-button link type="danger" size="small" :icon="Delete" @click="handleItemDelete(row)">Delete</el-button>
            </template>
          </ProTable>
        </template>
        <el-empty v-else description="Select a dict type" :image-size="60" />
      </div>
    </div>

    <!-- Dict Type Dialog -->
    <el-dialog
      v-model="typeDialog.visible"
      :title="typeDialog.isEdit ? 'Edit Dict Type' : 'Create Dict Type'"
      width="480px"
      destroy-on-close
    >
      <el-form ref="typeFormRef" :model="typeDialog.form" :rules="typeRules" label-width="90px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="typeDialog.form.name" placeholder="e.g. Gender" maxlength="30" autofocus />
        </el-form-item>
        <el-form-item label="Code" prop="code">
          <el-input v-model="typeDialog.form.code" placeholder="e.g. gender" maxlength="30" :disabled="typeDialog.isEdit" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="typeDialog.form.description" type="textarea" :rows="2" placeholder="Description" maxlength="200" />
        </el-form-item>
        <el-form-item label="Sort">
          <el-input-number v-model="typeDialog.form.sort_order" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="typeDialog.submitting" @click="submitType">Save</el-button>
      </template>
    </el-dialog>

    <!-- Dict Item Dialog -->
    <el-dialog
      v-model="itemDialog.visible"
      :title="itemDialog.isEdit ? 'Edit Item' : 'Add Item'"
      width="480px"
      destroy-on-close
    >
      <el-form ref="itemFormRef" :model="itemDialog.form" :rules="itemRules" label-width="90px">
        <el-form-item label="Label" prop="label">
          <el-input v-model="itemDialog.form.label" placeholder="Display label" maxlength="60" autofocus />
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input v-model="itemDialog.form.value" placeholder="Stored value" maxlength="60" />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="itemDialog.form.status">
            <el-radio value="active">Enable</el-radio>
            <el-radio value="inactive">Disable</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Sort">
          <el-input-number v-model="itemDialog.form.sort_order" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="itemDialog.form.description" type="textarea" :rows="2" placeholder="Description" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="itemDialog.submitting" @click="submitItem">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="dictManage">
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Delete, Edit, Search, MoreFilled, Notebook } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { nanoid } from "nanoid";
import ProTable from "@/components/ProTable/index.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import {
  getDictTypeList, createDictType, updateDictType, deleteDictType,
  getDictItemList, createDictItem, updateDictItem, deleteDictItem
} from "@/api/modules/dictService";
import type { DictType, DictItem } from "@/api/modules/dictService";
import { confirm } from "@/hooks/useConfirmAction";

const { t } = useI18n();
const itemTableRef = ref<ProTableInstance>();
const typeFormRef = ref<FormInstance>();
const itemFormRef = ref<FormInstance>();

// ── Dict Types ──
const allTypes = ref<DictType[]>([]);
const typeSearch = ref("");
const selectedType = ref<DictType | null>(null);

const filteredTypes = computed(() => {
  const q = typeSearch.value.toLowerCase();
  return q ? allTypes.value.filter(t => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)) : allTypes.value;
});

const typeDialog = reactive({
  visible: false, isEdit: false, submitting: false,
  form: { name: "", code: "", description: "", sort_order: 0, status: "active" as "active" | "inactive" },
  editKey: ""
});

const typeRules: FormRules = {
  name: [{ required: true, message: "Name is required", trigger: "blur" }],
  code: [{ required: true, message: "Code is required", trigger: "blur" }]
};

// ── Dict Items ──
const itemDialog = reactive({
  visible: false, isEdit: false, submitting: false,
  form: { label: "", value: "", sort_order: 0, status: "active" as "active" | "inactive", description: "" },
  editKey: ""
});

const itemRules: FormRules = {
  label: [{ required: true, message: "Label is required", trigger: "blur" }],
  value: [{ required: true, message: "Value is required", trigger: "blur" }]
};

const itemColumns: ColumnProps<DictItem>[] = [
  { type: "index", label: "#", width: 60 },
  { prop: "label", label: "Label", minWidth: 140, search: { el: "input" } },
  { prop: "value", label: "Value", minWidth: 120 },
  { prop: "sort_order", label: "Sort", width: 80 },
  { prop: "status", label: "Status", width: 80 },
  { prop: "description", label: "Description", minWidth: 160 },
  { prop: "operation", label: "Actions", width: 140, fixed: "right" }
];

// ── Load ──
async function loadTypes() {
  try {
    const res = await getDictTypeList({ pageSize: 500 });
    allTypes.value = (res.data?.list ?? []) as DictType[];
  } catch { /* ignore */ }
}

function selectType(t: DictType) {
  selectedType.value = t;
  setTimeout(() => itemTableRef.value?.getTableList(), 50);
}

async function fetchItems(params: any) {
  if (!selectedType.value) return { data: { list: [], total: 0, pageNum: 1, pageSize: 20 } };
  return await getDictItemList({
    type_key: selectedType.value.key,
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 20,
    search: params.label
  }) as any;
}

// ── Type CRUD ──
function openTypeCreate() {
  typeDialog.isEdit = false;
  typeDialog.editKey = "";
  typeDialog.form = { name: "", code: "", description: "", sort_order: 0, status: "active" };
  typeDialog.visible = true;
}

function handleTypeCommand(cmd: string, t: DictType) {
  if (cmd === "edit") {
    typeDialog.isEdit = true;
    typeDialog.editKey = t.key;
    typeDialog.form = { name: t.name, code: t.code, description: t.description || "", sort_order: t.sort_order ?? 0, status: t.status };
    typeDialog.visible = true;
  } else if (cmd === "delete") {
    handleTypeDelete(t);
  }
}

async function submitType() {
  if (!typeFormRef.value) return;
  const valid = await typeFormRef.value.validate().catch(() => false);
  if (!valid) return;
  typeDialog.submitting = true;
  try {
    if (typeDialog.isEdit) {
      await updateDictType(typeDialog.editKey, typeDialog.form);
      ElMessage.success("Dict type updated");
    } else {
      const key = `dt_${nanoid(10)}`;
      await createDictType({ ...typeDialog.form, key });
      ElMessage.success("Dict type created");
    }
    typeDialog.visible = false;
    await loadTypes();
  } catch (e: any) {
    ElMessage.error(e?.message || "Operation failed");
  } finally {
    typeDialog.submitting = false;
  }
}

async function handleTypeDelete(t: DictType) {
  const ok = await confirm(`Delete dict type "${t.name}"? All its items will also be removed.`, "Delete Type");
  if (!ok) return;
  try {
    await deleteDictType(t.key);
    if (selectedType.value?.key === t.key) selectedType.value = null;
    ElMessage.success("Dict type deleted");
    await loadTypes();
  } catch (e: any) {
    ElMessage.error(e?.message || "Delete failed");
  }
}

// ── Item CRUD ──
function openItemCreate() {
  itemDialog.isEdit = false;
  itemDialog.editKey = "";
  itemDialog.form = { label: "", value: "", sort_order: 0, status: "active", description: "" };
  itemDialog.visible = true;
}

function openItemEdit(row: DictItem) {
  itemDialog.isEdit = true;
  itemDialog.editKey = row.key;
  itemDialog.form = { label: row.label, value: row.value, sort_order: row.sort_order ?? 0, status: row.status, description: row.description || "" };
  itemDialog.visible = true;
}

async function submitItem() {
  if (!itemFormRef.value) return;
  const valid = await itemFormRef.value.validate().catch(() => false);
  if (!valid) return;
  itemDialog.submitting = true;
  try {
    if (itemDialog.isEdit) {
      await updateDictItem(itemDialog.editKey, itemDialog.form);
      ElMessage.success("Item updated");
    } else {
      const key = `di_${nanoid(10)}`;
      await createDictItem({ ...itemDialog.form, key, type_key: selectedType.value!.key });
      ElMessage.success("Item created");
    }
    itemDialog.visible = false;
    itemTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Operation failed");
  } finally {
    itemDialog.submitting = false;
  }
}

async function toggleItemStatus(row: DictItem) {
  try {
    await updateDictItem(row.key, { status: row.status === "active" ? "inactive" : "active" });
    itemTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Toggle failed");
  }
}

async function handleItemDelete(row: DictItem) {
  const ok = await confirm(`Delete item "${row.label}"?`, "Delete Item");
  if (!ok) return;
  try {
    await deleteDictItem(row.key);
    ElMessage.success("Item deleted");
    itemTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Delete failed");
  }
}

onMounted(() => loadTypes());
</script>

<style scoped lang="scss">
.dict-page { min-height: 100%; }

.dict-page__body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.dict-page__sidebar {
  flex-shrink: 0;
  width: 240px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.dict-page__sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.dict-page__sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.dict-page__sidebar-search {
  padding: 8px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-input__wrapper) { border-radius: 6px; }
}
.dict-page__sidebar-list {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
}
.dict-page__type-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;
  &:hover { background: var(--el-fill-color-lighter); }
  &--active {
    background: var(--el-color-primary-light-9);
    border-left-color: var(--el-color-primary);
  }
}
.dict-page__type-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.dict-page__type-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.dict-page__type-item-code {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.dict-page__main {
  flex: 1;
  min-width: 0;
}
</style>