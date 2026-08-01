<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="Menu List"
      row-key="path"
      :pagination="false"
      :tree-props="{ children: 'children' }"
      default-expand-all
      :indent="20"
      :columns="columns"
      :data="menuData"
    >
      <!-- Table header buttons -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openAdd">Add Menu</el-button>
      </template>
      <!-- Menu icon -->
      <template #icon="scope">
        <el-icon :size="18">
          <component :is="scope.row.meta.icon"></component>
        </el-icon>
      </template>
      <!-- Redirect -->
      <template #redirect="scope">
        <span v-if="scope.row.redirect">{{ scope.row.redirect }}</span>
        <span v-else style="color: #c0c4cc">-</span>
      </template>
      <!-- Order -->
      <template #order="scope">
        <el-tag size="small" type="info">{{ scope.row.order }}</el-tag>
      </template>
      <!-- Parent Menu -->
      <template #parent="scope">
        <span v-if="scope.row.parent">{{ scope.row.parent }}</span>
        <el-tag v-else size="small" type="">Top Level</el-tag>
      </template>
      <!-- Visibility -->
      <template #isHide="scope">
        <el-tag v-if="scope.row.meta?.isHide" size="small" type="danger">Hidden</el-tag>
        <el-tag v-else size="small" type="success">Visible</el-tag>
      </template>
      <!-- Operations -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openEdit(scope.row)">Edit</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>

    <!-- Edit / Add Menu dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? 'Add Menu' : 'Edit Menu'"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" label-suffix=":">
        <el-form-item label="Menu Name" prop="title">
          <el-input v-model="form.title" placeholder="Menu display name" clearable />
        </el-form-item>
        <el-form-item label="Parent Menu">
          <el-tree-select
            v-model="form.parent"
            :data="parentMenuOptions"
            :props="{ label: 'title', value: 'path', children: 'children' }"
            placeholder="Leave empty for top-level menu"
            clearable
            check-strictly
            filterable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Route Path" prop="path">
          <el-input v-model="form.path" placeholder="/example/path" clearable />
        </el-form-item>
        <el-form-item label="Route Name" prop="name">
          <el-input v-model="form.name" placeholder="routeName" clearable />
        </el-form-item>
        <el-form-item label="Component Path" prop="component">
          <el-input v-model="form.component" placeholder="/example/index" clearable />
        </el-form-item>
        <el-form-item label="Redirect">
          <el-input v-model="form.redirect" placeholder="redirect path" clearable />
        </el-form-item>
        <el-form-item label="Icon">
          <el-input v-model="form.icon" placeholder="HomeFilled" clearable />
        </el-form-item>
        <el-form-item label="External Link">
          <el-input v-model="form.isLink" placeholder="https://..." clearable />
        </el-form-item>
        <el-form-item label="Order">
          <el-input-number v-model="form.order" :min="0" />
        </el-form-item>
        <el-divider />
        <el-form-item label="Hidden Menu">
          <el-switch v-model="form.isHide" />
        </el-form-item>
        <el-form-item label="Full Screen">
          <el-switch v-model="form.isFull" />
        </el-form-item>
        <el-form-item label="Fixed Tab">
          <el-switch v-model="form.isAffix" />
        </el-form-item>
        <el-form-item label="Page Cache">
          <el-switch v-model="form.isKeepAlive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="menuMange">
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";

import { useAuthStore } from "@/stores/modules/auth";
import { createMenu, updateMenu, deleteMenu } from "@/api/modules/system";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";

const proTable = ref();
const formRef = ref<FormInstance>();
const authStore = useAuthStore();
const dialogVisible = ref(false);
const isAdd = ref(false);
const editingKey = ref("");
const saving = ref(false);

import { sortMenuTree } from "@/utils";

// Same tree data as the sidebar — el-table renders the hierarchy via tree-props.
// Using authMenuListGet (raw, all items) so hidden menus are still manageable.
const menuData = computed(() => sortMenuTree(authStore.authMenuListGet));

// Tree-select options for parent menu picker — show full menu tree
const parentMenuOptions = computed(() => {
  const addTitle = (nodes: any[]): any[] =>
    nodes.map(node => ({
      ...node,
      title: node.meta?.title || node.name,
      children: node.children ? addTitle(node.children) : undefined
    }));
  return addTitle(menuData.value);
});

// ── Form ──
interface MenuForm {
  title: string;
  path: string;
  name: string;
  component: string;
  redirect: string;
  icon: string;
  isLink: string;
  parent: string;
  order: number;
  isHide: boolean;
  isFull: boolean;
  isAffix: boolean;
  isKeepAlive: boolean;
}

const defaultForm = (): MenuForm => ({
  title: "",
  path: "",
  name: "",
  component: "",
  redirect: "",
  icon: "",
  isLink: "",
  parent: "",
  order: 0,
  isHide: false,
  isFull: false,
  isAffix: false,
  isKeepAlive: true
});

const form = reactive<MenuForm>(defaultForm());

const rules: FormRules = {
  title: [{ required: true, message: "Please enter menu name", trigger: "blur" }],
  path: [{ required: true, message: "Please enter route path", trigger: "blur" }],
  name: [{ required: true, message: "Please enter route name", trigger: "blur" }]
};

function populateForm(row: any) {
  form.title = row.meta?.title ?? "";
  form.path = row.path ?? "";
  form.name = row.name ?? "";
  form.component = row.component ?? "";
  form.redirect = row.redirect ?? "";
  form.icon = row.meta?.icon ?? "";
  form.isLink = row.meta?.isLink ?? "";
  form.parent = row.parent ?? "";
  form.order = row.order ?? 0;
  form.isHide = row.meta?.isHide ?? false;
  form.isFull = row.meta?.isFull ?? false;
  form.isAffix = row.meta?.isAffix ?? false;
  form.isKeepAlive = row.meta?.isKeepAlive ?? true;
}

// ── Edit / Add ──
function openEdit(row: any) {
  isAdd.value = false;
  editingKey.value = row.key ?? "";
  populateForm(row);
  dialogVisible.value = true;
}

function openAdd() {
  isAdd.value = true;
  editingKey.value = "";
  Object.assign(form, defaultForm());
  dialogVisible.value = true;
}

async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  saving.value = true;
  try {
    const key = isAdd.value
      ? `menu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      : editingKey.value;
    const params: Record<string, any> = {
      key,
      path: form.path,
      name: form.name,
      component: form.component,
      redirect: form.redirect,
      parent: form.parent || null,
      order: form.order,
      meta: {
        title: form.title,
        icon: form.icon,
        isLink: form.isLink,
        isHide: form.isHide,
        isFull: form.isFull,
        isAffix: form.isAffix,
        isKeepAlive: form.isKeepAlive
      }
    };
    if (isAdd.value) {
      await createMenu(params);
      ElMessage.success("Menu created");
    } else {
      await updateMenu(key, params);
      ElMessage.success("Menu updated");
    }
    dialogVisible.value = false;
    // Refresh the auth store so the sidebar picks up changes
    await authStore.getAuthMenuList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to save");
  } finally {
    saving.value = false;
  }
}

// ── Delete ──
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete menu "${row.meta?.title ?? row.name}"? Changes take effect after page refresh.`,
      "Confirm Delete",
      { confirmButtonText: "Confirm", cancelButtonText: "Cancel", type: "warning" }
    );
  } catch {
    return;
  }
  try {
    await deleteMenu(row.key);
    ElMessage.success("Menu deleted");
    await authStore.getAuthMenuList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to delete");
  }
}

// Table column configuration
const columns: ColumnProps[] = [
  { prop: "meta.title", label: "Menu Name", align: "left", width: 180, search: { el: "input" } },
  { prop: "meta.icon", label: "Icon", width: 80 },
  { prop: "name", label: "Route Name", width: 150, search: { el: "input" } },
  { prop: "path", label: "Route Path", width: 220, search: { el: "input" } },
  { prop: "component", label: "Component Path", width: 220 },
  { prop: "redirect", label: "Redirect", width: 180 },
  { prop: "order", label: "Order", width: 70 },
  { prop: "parent", label: "Parent Menu", width: 180 },
  { prop: "meta.isHide", label: "Visibility", width: 80 },
  { prop: "operation", label: "Operations", width: 180, fixed: "right" }
];
</script>
