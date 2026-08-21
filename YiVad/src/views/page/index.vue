<template>
  <div class="page-list">
    <div class="page-list__head">
      <div class="page-list__head-left">
        <h1 class="page-list__title">Pages</h1>
        <el-tag size="small" type="info">{{ store.total }} pages</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">New Page</el-button>
    </div>

    <div v-loading="store.loading" class="page-list__body">
      <div class="page-list__sidebar">
        <div class="page-list__tree">
          <div
            v-for="page in pageTree"
            :key="page.key"
            class="page-tree-item"
            :class="{ 'page-tree-item--active': activeKey === page.key }"
            :style="{ paddingLeft: (page._depth || 0) * 20 + 12 + 'px' }"
            @click="selectPage(page.key)"
          >
            <el-icon><Document /></el-icon>
            <span class="page-tree-item__title">{{ page.title }}</span>
            <span class="page-tree-item__actions">
              <el-button link :icon="Edit" size="small" @click.stop="openEdit(page)" />
              <el-button link :icon="Delete" size="small" @click.stop="handleDelete(page)" />
            </span>
          </div>
          <el-empty v-if="!store.pages.length" description="No pages yet" :image-size="40" />
        </div>
      </div>
      <div class="page-list__content">
        <template v-if="selectedPage">
          <div class="page-list__content-head">
            <h2>{{ selectedPage.title }}</h2>
            <span class="page-list__content-date">{{ formatDate(selectedPage.updated_at) }}</span>
          </div>
          <div class="markdown-body" v-html="renderedContent" />
        </template>
        <el-empty v-else description="Select a page from the sidebar" :image-size="60" />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? 'Edit Page' : 'New Page'"
      width="720px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="dialog.form.title" placeholder="Page title" maxlength="200" />
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <el-input v-model="dialog.form.content" type="textarea" :rows="12" placeholder="Markdown content" />
        </el-form-item>
        <el-form-item v-if="!props.projectKey" label="Project">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="pageList">
import { computed, onMounted, reactive, ref } from "vue";
import { Plus, Document, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { usePageStore } from "@/stores/modules/page";
import { useMarkdown } from "@/hooks/useMarkdown";
import type { Page } from "@/api/modules/pageService";

const props = defineProps<{ projectKey?: string }>();

const store = usePageStore();
const { render: renderMarkdown } = useMarkdown();
const formRef = ref<FormInstance>();
const activeKey = ref("");
const selectedPage = ref<Page | null>(null);

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }]
};

const pageTree = computed(() => {
  return store.pages.map(p => ({ ...p, _depth: p.parent_key ? 1 : 0 }));
});

const renderedContent = computed(() => {
  if (!selectedPage.value?.content) return "";
  return renderMarkdown(selectedPage.value.content);
});

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    title: "",
    content: "",
    project_key: props.projectKey || "",
    parent_key: "",
    order: 0
  }
});

function selectPage(key: string) {
  activeKey.value = key;
  selectedPage.value = store.pages.find(p => p.key === key) || null;
}

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { title: "", content: "", project_key: props.projectKey || "", parent_key: "", order: store.pages.length };
  dialog.visible = true;
}

function openEdit(page: Page) {
  dialog.isEdit = true;
  dialog.editKey = page.key;
  dialog.form = {
    title: page.title,
    content: page.content,
    project_key: page.project_key,
    parent_key: page.parent_key,
    order: page.order
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editPage(dialog.editKey, {
        title: dialog.form.title,
        content: dialog.form.content
      });
      ElMessage.success("Page updated");
      if (selectedPage.value?.key === dialog.editKey) {
        selectPage(dialog.editKey);
      }
    } else {
      const key = `PAGE-${Date.now().toString(36).toUpperCase()}`;
      await store.addPage({
        key,
        project_key: dialog.form.project_key || props.projectKey || "default",
        title: dialog.form.title,
        content: dialog.form.content,
        parent_key: dialog.form.parent_key,
        order: dialog.form.order
      });
      ElMessage.success("Page created");
    }
    dialog.visible = false;
  } finally {
    dialog.submitting = false;
  }
}

async function handleDelete(page: Page) {
  try {
    await ElMessageBox.confirm(`Delete page "${page.title}"?`, "Delete Page", {
      confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error"
    });
    await store.removePage(page.key, page.project_key);
    if (activeKey.value === page.key) {
      activeKey.value = "";
      selectedPage.value = null;
    }
    ElMessage.success("Page deleted");
  } catch { /* cancelled */ }
}

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

onMounted(() => {
  store.fetchPages({ project_key: props.projectKey });
});
</script>

<style scoped lang="scss">
.page-list {
  padding: 24px;
  height: calc(100vh - 95px);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
  overflow: hidden;
}
.page-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.page-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-list__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.page-list__body {
  display: flex;
  gap: 0;
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
}
.page-list__sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  overflow-y: auto;
}
.page-list__tree {
  padding: 8px 0;
}
.page-tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.1s;
  &:hover {
    background: var(--el-fill-color-light);
  }
  &--active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 500;
  }
}
.page-tree-item__title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.page-tree-item__actions {
  opacity: 0;
  transition: opacity 0.15s;
  .page-tree-item:hover & {
    opacity: 1;
  }
}
.page-list__content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: var(--el-bg-color);
}
.page-list__content-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  h2 { margin: 0; font-size: 18px; }
}
.page-list__content-date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
:deep(.markdown-body) {
  max-width: 800px;
}
</style>