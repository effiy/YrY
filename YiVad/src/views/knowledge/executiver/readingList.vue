<template>
  <div class="reading-list">
    <ExecutiverQuickNav active="reading-list" />
    <el-breadcrumb separator="/" class="reading-list__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/executiver' }">Executive</el-breadcrumb-item>
      <el-breadcrumb-item>Reading List</el-breadcrumb-item>
    </el-breadcrumb>

    <header class="reading-list__header">
      <div class="reading-list__header-row">
        <h1>Reading List</h1>
        <el-button type="primary" size="small" :icon="Plus" @click="openDialog()">Add Item</el-button>
      </div>
      <p>
        Curated books, articles, and papers to read or already read. Mark progress, capture notes, and keep executive learning
        ahead of industry trends.
      </p>
    </header>

    <div class="reading-list__toolbar">
      <el-input
        v-model="search"
        placeholder="Search title, author, notes..."
        clearable
        :prefix-icon="Search"
        style="width: 240px"
        @keyup.enter="onFilterChange"
        @clear="onFilterChange"
      />
      <el-select v-model="typeFilter" placeholder="All types" clearable style="width: 130px" @change="onFilterChange">
        <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="All statuses" clearable style="width: 140px" @change="onFilterChange">
        <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <el-select v-model="priorityFilter" placeholder="All priorities" clearable style="width: 150px" @change="onFilterChange">
        <el-option v-for="p in priorityOptions" :key="p.value" :label="p.label" :value="p.value" />
      </el-select>
      <span class="reading-list__toolbar-right">
        <span v-if="total" class="reading-list__result-count">{{ total }} items</span>
        <el-button size="small" text :icon="Refresh" @click="loadList">Refresh</el-button>
      </span>
    </div>

    <el-table
      :data="items"
      v-loading="loading"
      stripe
      style="width: 100%"
      row-key="key"
      :empty-text="loading ? '' : 'No reading items yet. Add your first book, article, or paper.'"
    >
      <el-table-column label="Title" min-width="320" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="reading-list__title">
            <a
              v-if="(row as ReadingItem).link"
              :href="(row as ReadingItem).link"
              target="_blank"
              rel="noopener noreferrer"
              class="reading-list__title-link"
              >{{ (row as ReadingItem).title }}</a
            >
            <span v-else class="reading-list__title-text">{{ (row as ReadingItem).title }}</span>
            <div v-if="(row as ReadingItem).notes" class="reading-list__title-notes">
              {{ oneLiner((row as ReadingItem).notes) }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="110" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="typeTagType((row as ReadingItem).type)" effect="plain">{{
            typeLabel((row as ReadingItem).type)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="Author" width="150" show-overflow-tooltip />
      <el-table-column label="Status" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="statusTagType((row as ReadingItem).status)" effect="light">{{
            statusLabel((row as ReadingItem).status)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Priority" width="110" align="center">
        <template #default="{ row }">
          <el-tag
            v-if="(row as ReadingItem).priority"
            size="small"
            :type="priorityTagType((row as ReadingItem).priority)"
            effect="plain"
            >{{ priorityLabel((row as ReadingItem).priority) }}</el-tag
          >
          <span v-else class="reading-list__text-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="Updated" width="120" align="center">
        <template #default="{ row }">
          <span class="reading-list__date">{{ formatRelativeTime((row as ReadingItem).updatedTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="170" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="(row as ReadingItem).status !== 'done'"
            size="small"
            text
            type="success"
            @click="markDone(row as ReadingItem)"
            >Done</el-button
          >
          <el-button size="small" text type="primary" @click="openDialog(row as ReadingItem)">Edit</el-button>
          <el-popconfirm title="Remove this reading item?" @confirm="removeItem(row as ReadingItem)">
            <template #reference>
              <el-button size="small" text type="danger">Del</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="reading-list__pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        background
        @current-change="loadList"
      />
    </div>

    <!-- Add / Edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editing?.key ? 'Edit Reading Item' : 'Add Reading Item'"
      width="560px"
      destroy-on-close
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="Title" required>
          <el-input v-model="form.title" placeholder="e.g. High Output Management" />
        </el-form-item>
        <el-form-item label="Type">
          <el-radio-group v-model="form.type">
            <el-radio-button v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Author">
          <el-input v-model="form.author" placeholder="Optional" />
        </el-form-item>
        <el-form-item label="Link">
          <el-input v-model="form.link" placeholder="https://... (optional)" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Priority">
          <el-select v-model="form.priority" clearable placeholder="None" style="width: 100%">
            <el-option v-for="p in priorityOptions" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="5"
            placeholder="One-sentence core viewpoint, key takeaways, actionable implications..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="save">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="readingList">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Search, Plus, Refresh } from "@element-plus/icons-vue";
import {
  getReadingList,
  createReadingItem,
  updateReadingItem,
  deleteReadingItem,
  type ReadingItem,
  type ReadingItemType,
  type ReadingItemStatus,
  type ReadingItemPriority
} from "@/api/modules/readingListService";
import ExecutiverQuickNav from "@/views/knowledge/components/ExecutiverQuickNav.vue";

// ── Static option maps ──
const typeOptions: Array<{ value: ReadingItemType; label: string }> = [
  { value: "article", label: "📄 Article" },
  { value: "book", label: "📘 Book" },
  { value: "paper", label: "📃 Paper" }
];
const statusOptions: Array<{ value: ReadingItemStatus; label: string }> = [
  { value: "to-read", label: "To read" },
  { value: "reading", label: "Reading" },
  { value: "done", label: "Done" }
];
const priorityOptions: Array<{ value: ReadingItemPriority; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

const TYPE_LABEL: Record<ReadingItemType, string> = { article: "Article", book: "Book", paper: "Paper" };
const STATUS_LABEL: Record<ReadingItemStatus, string> = { "to-read": "To read", reading: "Reading", done: "Done" };
const PRIORITY_LABEL: Record<ReadingItemPriority, string> = { high: "High", medium: "Medium", low: "Low" };

function typeLabel(t: ReadingItemType): string {
  return TYPE_LABEL[t] || t;
}
function statusLabel(s: ReadingItemStatus): string {
  return STATUS_LABEL[s] || s;
}
function priorityLabel(p?: ReadingItemPriority): string {
  return (p && PRIORITY_LABEL[p]) || "";
}

function typeTagType(t: ReadingItemType): "primary" | "warning" | "info" {
  if (t === "book") return "primary";
  if (t === "paper") return "info";
  return "warning";
}
function statusTagType(s: ReadingItemStatus): "success" | "warning" | "info" {
  if (s === "done") return "success";
  if (s === "reading") return "warning";
  return "info";
}
function priorityTagType(p?: ReadingItemPriority): "danger" | "warning" | "info" {
  if (p === "high") return "danger";
  if (p === "medium") return "warning";
  return "info";
}

// ── List state ──
const items = ref<ReadingItem[]>([]);
const loading = ref(false);
const search = ref("");
const typeFilter = ref<ReadingItemType | "">("");
const statusFilter = ref<ReadingItemStatus | "">("");
const priorityFilter = ref<ReadingItemPriority | "">("");
const page = ref(1);
const pageSize = 20;
const total = ref(0);

async function loadList() {
  loading.value = true;
  try {
    const res = await getReadingList({
      search: search.value || undefined,
      type: (typeFilter.value || undefined) as ReadingItemType | undefined,
      status: (statusFilter.value || undefined) as ReadingItemStatus | undefined,
      priority: (priorityFilter.value || undefined) as ReadingItemPriority | undefined,
      pageNum: page.value,
      pageSize
    });
    items.value = res.data?.list ?? [];
    total.value = res.data?.total ?? 0;
  } catch (e) {
    items.value = [];
    total.value = 0;
    ElMessage.error(errorMessage(e) || "Failed to load reading list");
  } finally {
    loading.value = false;
  }
}

let filterTimer: ReturnType<typeof setTimeout> | null = null;
function onFilterChange() {
  if (filterTimer) clearTimeout(filterTimer);
  filterTimer = setTimeout(() => {
    page.value = 1;
    loadList();
  }, 300);
}

// ── Dialog ──
const dialogVisible = ref(false);
const editing = ref<ReadingItem | null>(null);
const saving = ref(false);
const form = reactive<{
  title: string;
  type: ReadingItemType;
  author: string;
  link: string;
  status: ReadingItemStatus;
  priority: ReadingItemPriority | "";
  notes: string;
}>({
  title: "",
  type: "article",
  author: "",
  link: "",
  status: "to-read",
  priority: "",
  notes: ""
});

function openDialog(row?: ReadingItem) {
  editing.value = row || null;
  if (row) {
    form.title = row.title || "";
    form.type = row.type || "article";
    form.author = row.author || "";
    form.link = row.link || "";
    form.status = row.status || "to-read";
    form.priority = row.priority || "";
    form.notes = row.notes || "";
  } else {
    form.title = "";
    form.type = "article";
    form.author = "";
    form.link = "";
    form.status = "to-read";
    form.priority = "";
    form.notes = "";
  }
  dialogVisible.value = true;
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning("Title is required");
    return;
  }
  saving.value = true;
  try {
    const payload = {
      title: form.title.trim(),
      type: form.type,
      author: form.author.trim() || undefined,
      link: form.link.trim() || undefined,
      status: form.status,
      priority: form.priority || undefined,
      notes: form.notes.trim() || undefined
    };
    if (editing.value?.key) {
      await updateReadingItem(editing.value.key, payload);
      ElMessage.success("Item updated");
    } else {
      await createReadingItem(payload);
      ElMessage.success("Item added");
    }
    dialogVisible.value = false;
    await loadList();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to save item");
  } finally {
    saving.value = false;
  }
}

async function markDone(row: ReadingItem) {
  if (!row.key) return;
  try {
    await updateReadingItem(row.key, { status: "done" });
    ElMessage.success("Marked as done");
    await loadList();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to update status");
  }
}

async function removeItem(row: ReadingItem) {
  if (!row.key) return;
  try {
    await deleteReadingItem(row.key);
    ElMessage.success("Item removed");
    await loadList();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to remove item");
  }
}

// ── Helpers ──
function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function oneLiner(notes?: string): string {
  if (!notes) return "";
  const first = notes.split("\n").find(l => l.trim()) ?? "";
  return first.trim();
}

function formatRelativeTime(raw?: string): string {
  if (!raw) return "-";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.round(diff / 86400000)}d ago`;
    return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  } catch {
    return raw.slice(0, 10);
  }
}

onMounted(loadList);
</script>

<style scoped lang="scss">
.reading-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 16px 20px;
  background: var(--el-bg-color-page);
  min-height: 100%;
}

.reading-list__breadcrumb {
  margin-bottom: 4px;
}

.reading-list__header {
  margin-bottom: 12px;
}
.reading-list__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
}
.reading-list__header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.reading-list__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.reading-list__toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.reading-list__result-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.reading-list__title {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.reading-list__title-link {
  color: var(--el-text-color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  line-height: 1.4;
  &:hover {
    color: var(--el-color-primary);
    text-decoration: underline;
  }
}
.reading-list__title-text {
  color: var(--el-text-color-primary);
  font-weight: 500;
  font-size: 13px;
  line-height: 1.4;
}
.reading-list__title-notes {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 480px;
}

.reading-list__date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.reading-list__text-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.reading-list__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
