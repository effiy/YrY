<template>
  <div class="page-list">
    <div class="page-list__head">
      <div class="page-list__head-left">
        <h1 class="page-list__title">Pages</h1>
        <el-tag size="small" type="info" round>{{ countLabel }}</el-tag>
      </div>
      <div class="page-list__head-actions">
        <template v-if="!props.projectKey">
          <el-input
            v-model="searchText"
            class="page-list__search"
            size="small"
            clearable
            placeholder="Search pages…"
            :prefix-icon="Search"
          />
          <el-select v-model="projectFilter" placeholder="Filter by project" clearable class="page-list__project" size="small" @change="loadData">
            <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
        </template>
        <el-button type="primary" :icon="Plus" @click="openCreate">New Page</el-button>
      </div>
    </div>

    <div v-if="!props.projectKey" class="page-list__summary">
      <div class="page-summary__tile">
        <span class="page-summary__value">{{ store.total }}</span>
        <span class="page-summary__label">Pages</span>
      </div>
      <div class="page-summary__tile page-summary__tile--top">
        <span class="page-summary__value">{{ topLevelCount }}</span>
        <span class="page-summary__label">Top-level</span>
      </div>
      <div class="page-summary__tile page-summary__tile--sub">
        <span class="page-summary__value">{{ subPageCount }}</span>
        <span class="page-summary__label">Sub-pages</span>
      </div>
      <div class="page-summary__tile page-summary__tile--content">
        <span class="page-summary__value">{{ contentSize }}</span>
        <span class="page-summary__label">Content</span>
      </div>
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
            <el-tag v-if="childCount(page.key)" size="small" type="info" effect="plain">{{ childCount(page.key) }}</el-tag>
            <span class="page-tree-item__actions">
              <el-button link :icon="Edit" size="small" @click.stop="openEdit(page)" />
              <el-button link :icon="Delete" size="small" @click.stop="handleDelete(page)" />
            </span>
          </div>
          <el-empty v-if="!store.pages.length" description="No pages yet" :image-size="40" />
          <el-empty v-else-if="!pageTree.length" description="No matching pages" :image-size="40" />
        </div>
      </div>
      <div class="page-list__content">
        <template v-if="selectedPage">
          <div class="page-list__content-head">
            <div class="page-list__content-title">
              <h2>{{ selectedPage.title }}</h2>
              <button
                v-if="!props.projectKey && projectFilter"
                type="button"
                class="page-list__project-chip"
                @click="goProject(projectFilter)"
              >
                <el-icon><Folder /></el-icon>
                <span>{{ projectName(projectFilter) }}</span>
              </button>
            </div>
            <div class="page-list__content-actions">
              <span class="page-list__content-meta">{{ contentStats.chars }} chars · {{ contentStats.lines }} lines</span>
              <el-button link size="small" :icon="CopyDocument" @click="copyContent">Copy</el-button>
            </div>
          </div>
          <div class="page-list__content-date">{{ formatDate(selectedPage.updated_at) }}</div>
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
import { useRouter } from "vue-router";
import { Plus, Document, Edit, Delete, Search, Folder, CopyDocument } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { usePageStore } from "@/stores/modules/page";
import { useMarkdown } from "@/hooks/useMarkdown";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import type { Page } from "@/api/modules/pageService";

const props = defineProps<{ projectKey?: string }>();

const router = useRouter();
const store = usePageStore();
const { render: renderMarkdown } = useMarkdown();
const formRef = ref<FormInstance>();
const activeKey = ref("");
const selectedPage = ref<Page | null>(null);

const projectFilter = ref(props.projectKey || "");
const searchText = ref("");
const projects = ref<{ key: string; name: string }[]>([]);

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }]
};

const filteredPages = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  if (!q) return store.pages;
  return store.pages.filter(p => p.title.toLowerCase().includes(q) || (p.content || "").toLowerCase().includes(q));
});

const pageTree = computed(() => {
  return filteredPages.value.map(p => ({ ...p, _depth: p.parent_key ? 1 : 0 }));
});

const childCountByKey = computed(() => {
  const m = new Map<string, number>();
  for (const p of store.pages) {
    if (p.parent_key) m.set(p.parent_key, (m.get(p.parent_key) || 0) + 1);
  }
  return m;
});

function childCount(key: string): number { return childCountByKey.value.get(key) || 0; }

const topLevelCount = computed(() => store.pages.filter(p => !p.parent_key).length);
const subPageCount = computed(() => store.pages.filter(p => p.parent_key).length);
const contentSize = computed(() => {
  const chars = store.pages.reduce((s, p) => s + (p.content?.length || 0), 0);
  return chars >= 1000 ? (chars / 1000).toFixed(1).replace(/\.0$/, "") + "k chars" : chars + " chars";
});
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim();
  return isFiltered ? `${filteredPages.value.length} of ${store.total} pages` : `${store.total} pages`;
});

const renderedContent = computed(() => {
  if (!selectedPage.value?.content) return "";
  return renderMarkdown(selectedPage.value.content);
});

const contentStats = computed(() => {
  const c = selectedPage.value?.content || "";
  return { chars: c.length, lines: c.split("\n").filter(Boolean).length };
});

function projectName(key: string) { return projects.value.find(p => p.key === key)?.name || key; }

async function loadProjects() {
  try {
    const res = await getProjectList({ pageSize: 500 });
    projects.value = ((res.data?.list as Project[]) ?? []).map(p => ({ key: p.key, name: p.name }));
  } catch { /* names fall back to raw keys */ }
}

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

async function loadData() {
  await store.fetchPages({ project_key: projectFilter.value || undefined });
  // Keep selection in sync with a changed project filter.
  if (selectedPage.value && !store.pages.some(p => p.key === selectedPage.value!.key)) {
    activeKey.value = "";
    selectedPage.value = null;
  }
}

function selectPage(key: string) {
  activeKey.value = key;
  selectedPage.value = store.pages.find(p => p.key === key) || null;
}

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { title: "", content: "", project_key: projectFilter.value || props.projectKey || "", parent_key: "", order: store.pages.length };
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
        project_key: dialog.form.project_key || projectFilter.value || props.projectKey || "default",
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

async function copyContent() {
  if (!selectedPage.value?.content) return;
  try {
    await navigator.clipboard.writeText(selectedPage.value.content);
    ElMessage.success("Markdown copied to clipboard");
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

function goProject(key: string) { if (key) router.push(`/project/${key}`); }

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

onMounted(async () => {
  await store.fetchPages({ project_key: props.projectKey || undefined });
  if (!props.projectKey) await loadProjects();
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
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.page-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-list__head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.page-list__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.page-list__search { width: 190px; }
.page-list__project { width: 190px; }
.page-list__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.page-summary__tile {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.page-summary__value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
}
.page-summary__label { font-size: 12px; color: var(--el-text-color-secondary); }
.page-summary__tile--top .page-summary__value { color: var(--el-color-primary); }
.page-summary__tile--sub .page-summary__value { color: var(--el-color-info); }
.page-summary__tile--content .page-summary__value { color: var(--el-color-success); }
.page-list__body {
  display: flex;
  gap: 0;
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  min-height: 0;
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
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.page-list__content-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  h2 { margin: 0; font-size: 18px; }
}
.page-list__project-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border: none;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  .el-icon { font-size: 13px; }
  &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
}
.page-list__content-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.page-list__content-meta {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.page-list__content-date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 20px;
}
:deep(.markdown-body) {
  max-width: 800px;
}
</style>
