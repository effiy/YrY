<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="菜单列表"
      row-key="path"
      :pagination="false"
      :tree-props="{ children: 'children' }"
      default-expand-all
      :indent="20"
      :columns="columns"
      :data="menuData"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openAdd">新增菜单</el-button>
      </template>
      <!-- 菜单图标 -->
      <template #icon="scope">
        <el-icon :size="18">
          <component :is="scope.row.meta.icon"></component>
        </el-icon>
      </template>
      <!-- 菜单操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openEdit(scope.row)">编辑</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </ProTable>

    <!-- 编辑 / 新增菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? '新增菜单' : '编辑菜单'"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" label-suffix=":">
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="form.title" placeholder="菜单显示名称" clearable />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="/example/path" clearable />
        </el-form-item>
        <el-form-item label="路由 name" prop="name">
          <el-input v-model="form.name" placeholder="routeName" clearable />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="/example/index" clearable />
        </el-form-item>
        <el-form-item label="重定向">
          <el-input v-model="form.redirect" placeholder="redirect path" clearable />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="HomeFilled" clearable />
        </el-form-item>
        <el-form-item label="外部链接">
          <el-input v-model="form.isLink" placeholder="https://..." clearable />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.order" :min="0" />
        </el-form-item>
        <el-divider />
        <el-form-item label="隐藏菜单">
          <el-switch v-model="form.isHide" />
        </el-form-item>
        <el-form-item label="全屏页面">
          <el-switch v-model="form.isFull" />
        </el-form-item>
        <el-form-item label="固定标签页">
          <el-switch v-model="form.isAffix" />
        </el-form-item>
        <el-form-item label="页面缓存">
          <el-switch v-model="form.isKeepAlive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
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

// Same tree data as the sidebar — el-table renders the hierarchy via tree-props.
// Using authMenuListGet (raw, all items) so hidden menus are still manageable.
const menuData = computed(() => authStore.authMenuListGet);

// ── Form ──
interface MenuForm {
  title: string;
  path: string;
  name: string;
  component: string;
  redirect: string;
  icon: string;
  isLink: string;
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
  order: 0,
  isHide: false,
  isFull: false,
  isAffix: false,
  isKeepAlive: true
});

const form = reactive<MenuForm>(defaultForm());

const rules: FormRules = {
  title: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  path: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
  name: [{ required: true, message: "请输入路由 name", trigger: "blur" }]
};

function populateForm(row: any) {
  form.title = row.meta?.title ?? "";
  form.path = row.path ?? "";
  form.name = row.name ?? "";
  form.component = row.component ?? "";
  form.redirect = row.redirect ?? "";
  form.icon = row.meta?.icon ?? "";
  form.isLink = row.meta?.isLink ?? "";
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
      // New menus default to top-level (no parent)
      params.parent = null;
      params.createdAt = Date.now();
      await createMenu(params);
      ElMessage.success("菜单已创建");
    } else {
      await updateMenu(key, params);
      ElMessage.success("菜单已更新");
    }
    dialogVisible.value = false;
    // Refresh the auth store so the sidebar picks up changes
    await authStore.getAuthMenuList();
  } catch (e: any) {
    ElMessage.error(e?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}

// ── Delete ──
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(
      `确定删除菜单「${row.meta?.title ?? row.name}」吗？删除后需刷新页面生效。`,
      "删除确认",
      { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    return;
  }
  try {
    await deleteMenu(row.key);
    ElMessage.success("菜单已删除");
    await authStore.getAuthMenuList();
  } catch (e: any) {
    ElMessage.error(e?.message || "删除失败");
  }
}

// 表格配置项
const columns: ColumnProps[] = [
  { prop: "meta.title", label: "菜单名称", align: "left", search: { el: "input" } },
  { prop: "meta.icon", label: "菜单图标" },
  { prop: "name", label: "菜单 name", search: { el: "input" } },
  { prop: "path", label: "菜单路径", width: 300, search: { el: "input" } },
  { prop: "component", label: "组件路径", width: 300 },
  { prop: "operation", label: "操作", width: 250, fixed: "right" }
];
</script>
