<template>
  <div class="menu-manage page">
    <PageHeaderCard
      :icon="Menu"
      icon-bg="linear-gradient(135deg, #9b59b6, #7c3aed)"
      :title="$t('menu.title')"
      :description="$t('menu.description')"
    />
    <ProTable
      ref="proTable"
      :title="$t('menu.title')"
      row-key="key"
      :pagination="false"
      :tree-props="{ children: 'children' }"
      :default-expand-all="false"
      :indent="20"
      :columns="columns"
      :data="menuData"
      :height="tableHeight"
    >
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" @click="openAdd">{{ $t("menu.addMenu") }}</el-button>
        <el-button :icon="RefreshRight" :loading="resetting" @click="handleResetDefaults">{{ $t("menu.resetDefaults") }}</el-button>
        <el-button v-if="scope.isSelected" type="danger" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
          {{ $t("menu.deleteSelected") }}
        </el-button>
      </template>
      <template #icon="scope">
        <el-icon v-if="scope.row.meta?.icon" :size="18">
          <component :is="scope.row.meta.icon"></component>
        </el-icon>
        <span v-else class="mm-dash">-</span>
      </template>
      <template #redirect="scope">
        <span v-if="scope.row.redirect">{{ scope.row.redirect }}</span>
        <span v-else class="mm-dash">-</span>
      </template>
      <template #order="scope">
        <el-tag v-if="scope.row.order != null" size="small" type="info">{{ scope.row.order }}</el-tag>
        <span v-else class="mm-dash">-</span>
      </template>
      <template #parent="scope">
        <span v-if="scope.row.parent" class="mm-parent-badge">
          <el-icon><component :is="getParentIcon(scope.row.parent)" /></el-icon>
          {{ getParentTitle(scope.row.parent) }}
        </span>
        <el-tag v-else size="small" type="info">{{ $t("menu.topLevel") }}</el-tag>
      </template>
      <template #isHide="scope">
        <el-tag v-if="scope.row.meta?.isHide" size="small" type="danger">{{ $t("menu.hidden") }}</el-tag>
        <el-tag v-else size="small" type="success">{{ $t("menu.visible") }}</el-tag>
      </template>
      <template #operation="scope">
        <el-tooltip :content="$t('common.edit')" placement="top"><el-button type="primary" link :icon="EditPen" @click="openEdit(scope.row)"></el-button></el-tooltip>
        <el-tooltip :content="$t('common.delete')" placement="top"><el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)"></el-button></el-tooltip>
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? $t('menu.addMenu') : $t('menu.editMenu')"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="110px"
        label-suffix=":"
        @keyup.enter="handleSave"
        @keydown.meta.s.prevent="handleSave"
        @keydown.ctrl.s.prevent="handleSave"
      >
        <el-form-item :label="$t('menu.fields.menuName')" prop="title">
          <el-input v-model="form.title" :placeholder="$t('menu.fields.menuNamePlaceholder')" clearable autofocus />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.parentMenu')">
          <el-tree-select
            v-model="form.parent"
            :data="parentMenuOptions"
            :props="{ label: 'title', children: 'children' }"
            node-key="path"
            :placeholder="$t('menu.fields.parentPlaceholder')"
            clearable
            check-strictly
            filterable
            class="mm-parent-select"
          />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.routePath')" prop="path">
          <el-input v-model="form.path" :placeholder="$t('menu.fields.routePathPlaceholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.routeName')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('menu.fields.routeNamePlaceholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.componentPath')" prop="component">
          <el-input v-model="form.component" :placeholder="$t('menu.fields.componentPathPlaceholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.redirect')">
          <el-input v-model="form.redirect" :placeholder="$t('menu.fields.redirectPlaceholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.icon')">
          <SelectIcon v-model:icon-value="form.icon" />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.externalLink')">
          <el-input v-model="form.isLink" :placeholder="$t('menu.fields.externalLinkPlaceholder')" clearable />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.order')">
          <el-input-number v-model="form.order" :min="0" />
        </el-form-item>
        <el-divider />
        <el-form-item :label="$t('menu.fields.hiddenMenu')">
          <el-switch v-model="form.isHide" />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.fullScreen')">
          <el-switch v-model="form.isFull" />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.fixedTab')">
          <el-switch v-model="form.isAffix" />
        </el-form-item>
        <el-form-item :label="$t('menu.fields.pageCache')">
          <el-switch v-model="form.isKeepAlive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer-hint" v-html="$t('menu.dialogFooterSaveHint')"></span>
        <div>
          <el-button @click="dialogVisible = false">{{ $t("menu.cancel") }}</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">{{ $t("menu.save") }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="menuMange">
import { CirclePlus, Delete, EditPen, Menu, RefreshRight } from "@element-plus/icons-vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useAuthStore } from "@/stores/modules/auth";
import { createMenu, updateMenu, deleteMenu, bulkResetMenus } from "@/api/modules/system";
import ProTable from "@/components/ProTable/index.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import SelectIcon from "@/components/SelectIcon/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import authMenuList from "@/assets/json/authMenuList.json";
import { confirm } from "@/hooks/useConfirmAction";

const { t } = useI18n();
const proTable = ref();
const formRef = ref<FormInstance>();
const authStore = useAuthStore();
const dialogVisible = ref(false);
const showShortcuts = ref(false);
const isAdd = ref(false);
const editingKey = ref("");
const saving = ref(false);
const resetting = ref(false);

const tableHeight = ref<number | undefined>(undefined);
const updateTableHeight = () => {
  tableHeight.value = Math.max(200, window.innerHeight - 202);
};
onMounted(() => {
  updateTableHeight();
  window.addEventListener("resize", updateTableHeight);
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateTableHeight);
  window.removeEventListener("keydown", onKeydown);
});

function focusSearch() {
  const form = document.querySelector(".table-box .el-form");
  const input = form?.querySelector("input.el-input__inner") as HTMLInputElement | null;
  input?.focus();
  input?.select?.();
}

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true) return;
  if (e.key === "Escape" && showShortcuts.value) {
    e.preventDefault();
    showShortcuts.value = false;
    return;
  }
  const inOverlay = !!document.querySelector(
    ".el-dialog:not(.is-hidden), .el-drawer:not(.is-hide), .el-select-dropdown:not([style*='display: none'])"
  );
  if (inOverlay) return;
  if (e.key === "?") {
    e.preventDefault();
    showShortcuts.value = true;
    return;
  }
  if (e.key === "/") {
    e.preventDefault();
    focusSearch();
    return;
  }
  if (e.key.toLowerCase() === "n") {
    e.preventDefault();
    openAdd();
  }
}

import { sortMenuTree } from "@/utils";
import { nanoid } from "nanoid";

const menuData = computed(() => sortMenuTree(authStore.authMenuListGet));

const parentMenuOptions = computed(() => {
  const addTitle = (nodes: any[]): any[] =>
    nodes.map(node => ({
      ...node,
      title: node.meta?.title || node.name,
      children: node.children ? addTitle(node.children) : undefined
    }));
  return addTitle(menuData.value);
});

function findMenuByPath(path: string): any {
  return authStore.flatMenuListGet.find((m: any) => m.path === path);
}
function getParentTitle(parentPath: string): string {
  const node = findMenuByPath(parentPath);
  return node?.meta?.title || node?.name || parentPath;
}
function getParentIcon(parentPath: string): string {
  const node = findMenuByPath(parentPath);
  return node?.meta?.icon || "Menu";
}

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
  title: [{ required: true, message: () => t("menu.validation.menuNameRequired"), trigger: "blur" }],
  path: [{ required: true, message: () => t("menu.validation.routePathRequired"), trigger: "blur" }],
  name: [{ required: true, message: () => t("menu.validation.routeNameRequired"), trigger: "blur" }]
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

function openEdit(row: any) {
  if (!row.key) {
    ElMessage.error(t("menu.messages.noKeyForEdit"));
    return;
  }
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
    const key = isAdd.value ? `menu_${nanoid(12)}` : editingKey.value;
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
      ElMessage.success(t("menu.messages.created"));
    } else {
      await updateMenu(key, params);
      ElMessage.success(t("menu.messages.updated"));
    }
    dialogVisible.value = false;
    await authStore.getAuthMenuList();
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : t("menu.messages.saveFailed"));
  } finally {
    saving.value = false;
  }
}

async function handleDelete(row: any) {
  if (!row.key) {
    ElMessage.error(t("menu.messages.deleteFailed"));
    return;
  }
  const childCount = row.children?.length ?? 0;
  const name = row.meta?.title ?? row.name;
  const ok = await confirm(
    t("menu.messages.deleteConfirm", { name }),
    t("menu.confirmDelete"),
    childCount > 0 ? "error" : "warning"
  );
  if (!ok) return;
  try {
    await deleteMenu(row.key);
    // 如果菜单有子项，递归清理（因为当前 RPC deleteDocument 只按 key 删除单条，不会级联）
    async function deleteTree(items: any[]): Promise<void> {
      for (const item of items) {
        if (item.children?.length) await deleteTree(item.children);
        if (item.key) {
          try { await deleteMenu(item.key); } catch { /* continue */ }
        }
      }
    }
    if (row.children?.length) await deleteTree(row.children);
    ElMessage.success(t("menu.messages.deleted"));
    await authStore.getAuthMenuList();
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : t("menu.messages.deleteFailed"));
  }
}

async function handleResetDefaults() {
  const ok = await confirm(
    t("system.dialog.deleteConfirm"),
    t("menu.resetMenusTitle")
  );
  if (!ok) return;
  resetting.value = true;
  try {
    const flat: Record<string, any>[] = [];
    function flatten(items: any[], parent: string | null = null) {
      for (const item of items) {
        const { children, ...rest } = item;
        flat.push({ ...rest, parent });
        if (children?.length) flatten(children, item.path);
      }
    }
    flatten(authMenuList.data);
    await bulkResetMenus(flat);
    ElMessage.success(t("menu.messages.resetSuccess", { count: flat.length }));
    await authStore.getAuthMenuList();
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : t("menu.messages.resetFailed"));
  } finally {
    resetting.value = false;
  }
}

const columns: ColumnProps[] = [
  { type: "selection", width: 50 },
  { prop: "meta.title", label: t("menu.fields.menuName"), align: "left", width: 180, search: { el: "input" } },
  { prop: "meta.icon", label: t("menu.fields.icon"), width: 80 },
  { prop: "name", label: t("menu.fields.routeName"), width: 150, search: { el: "input" } },
  { prop: "path", label: t("menu.fields.routePath"), width: 220, search: { el: "input" } },
  { prop: "component", label: t("menu.fields.componentPath"), width: 220 },
  { prop: "redirect", label: t("menu.fields.redirect"), width: 180 },
  { prop: "order", label: t("menu.fields.order"), width: 70 },
  { prop: "parent", label: t("menu.fields.parentMenu"), width: 180 },
  { prop: "meta.isHide", label: t("menu.visibility"), width: 100 },
  { prop: "operation", label: t("menu.operations"), width: 180, fixed: "right" }
];

async function batchDelete(keys: (string | number)[]) {
  if (!keys.length) return;
  const ok = await confirm(
    t("menu.messages.deleteConfirm", { name: `${keys.length} menu(s)` }),
    t("menu.batchDeleteTitle"),
    "error"
  );
  if (!ok) return;
  // 1) 收集命中的完整节点（含 key 与 children），避免传错主键
  const keySet = new Set(keys.map(String));
  function collectNodes(nodes: any[], out: any[]): void {
    for (const n of nodes) {
      if (n.key && keySet.has(String(n.key))) out.push(n);
      if (n.children?.length) collectNodes(n.children, out);
    }
  }
  const hit: any[] = [];
  collectNodes(menuData.value, hit);

  // 2) 级联收集所有待删 key（子项也一并删除，避免残留孤儿）
  const toDelete = new Set<string>();
  function walk(node: any): void {
    if (node.key) toDelete.add(String(node.key));
    if (node.children?.length) node.children.forEach(walk);
  }
  hit.forEach(walk);

  for (const key of toDelete) {
    try { await deleteMenu(key); } catch { /* continue */ }
  }
  ElMessage.success(t("menu.messages.batchDeletedSuccess", { count: toDelete.size }));
  await authStore.getAuthMenuList();
}
</script>

<style scoped lang="scss">
.menu-manage {
  // padding + background come from global .page class
  min-height: 100%;
}
.mm-form-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}
.mm-form-hint code {
  padding: 1px 4px;
  font-size: 11px;
  background: var(--el-fill-color-light);
  border-radius: 3px;
}
.mm-parent-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
.mm-dash {
  color: var(--el-text-color-placeholder);
}
.mm-parent-select {
  width: 100%;
}
</style>