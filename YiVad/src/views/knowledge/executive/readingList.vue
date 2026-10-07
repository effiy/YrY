<template>
  <div class="reading-list">
    <!-- ═══ Sticky Header Bar ═══ -->
    <div class="reading-list__sticky-bar">
      <div class="reading-list__sticky-top">
        <div class="reading-list__sticky-left">
          <span class="reading-list__sticky-icon">{{ stickyIcon }}</span>
          <div class="reading-list__sticky-info">
            <h1 class="reading-list__sticky-name">{{ stickyTitle }}</h1>
            <p class="reading-list__sticky-desc">
              Curated books, articles, and papers. Mark progress, capture notes, and keep learning ahead of industry trends.
            </p>
          </div>
        </div>
        <div class="reading-list__sticky-right">
          <div class="reading-list__stat-pill" :class="{ 'is-loading': summaryLoading }">
            <span class="reading-list__stat-pill-value">{{ summary.total }}</span>
            <span class="reading-list__stat-pill-label">Items</span>
          </div>
          <div class="reading-list__stat-pill" :class="{ 'is-loading': summaryLoading }">
            <span class="reading-list__stat-pill-value">{{ summary.reading }}</span>
            <span class="reading-list__stat-pill-label">Reading</span>
          </div>
          <div class="reading-list__stat-pill reading-list__stat-pill--accent" :class="{ 'is-loading': summaryLoading }">
            <span class="reading-list__stat-pill-value">{{ summary.done }}</span>
            <span class="reading-list__stat-pill-label">Done</span>
          </div>
        </div>
      </div>
    </div>

    <div class="reading-list__body">
      <nav class="reading-list__sidebar">
        <button
          class="reading-list__sidebar-item"
          :class="{ 'is-active': activeTab === 'all' }"
          @click="
            activeTab = 'all';
            onTabChange('all');
          "
        >
          <span class="reading-list__sidebar-icon">📖</span>
          <span class="reading-list__sidebar-label">阅读列表</span>
          <span class="reading-list__sidebar-badge" :data-count="summary.total">{{ summary.total }}</span>
        </button>
        <button
          class="reading-list__sidebar-item"
          :class="{ 'is-active': activeTab === 'reading' }"
          @click="
            activeTab = 'reading';
            onTabChange('reading');
          "
        >
          <span class="reading-list__sidebar-icon">📅</span>
          <span class="reading-list__sidebar-label">阅读中</span>
          <span class="reading-list__sidebar-badge" :data-count="summary.reading">{{ summary.reading }}</span>
        </button>
        <button
          class="reading-list__sidebar-item"
          :class="{ 'is-active': activeTab === 'done' }"
          @click="
            activeTab = 'done';
            onTabChange('done');
          "
        >
          <span class="reading-list__sidebar-icon">✅</span>
          <span class="reading-list__sidebar-label">已读完</span>
          <span class="reading-list__sidebar-badge" :data-count="summary.done">{{ summary.done }}</span>
        </button>
      </nav>

      <div class="reading-list__content">
        <div class="reading-list__section">
          <div class="reading-list__section-head">
            <h2 class="reading-list__section-title">{{ sectionTitle }}</h2>
            <span class="reading-list__result-count">{{ displayCount }} of {{ sectionTotal }} items</span>
            <span class="reading-list__toolbar-right">
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button value="card">Card</el-radio-button>
                <el-radio-button value="list">List</el-radio-button>
                <el-radio-button value="table">Table</el-radio-button>
              </el-radio-group>
              <el-button size="small" text :icon="Refresh" @click="handleRefresh">Refresh</el-button>
              <el-button type="primary" :icon="Plus" @click="openDialog()">Add Item</el-button>
            </span>
          </div>

          <div class="reading-list__section-body">
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
              <el-select
                v-if="activeTab === 'all'"
                v-model="statusFilter"
                placeholder="All statuses"
                clearable
                style="width: 140px"
                @change="onFilterChange"
              >
                <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
              <el-select
                v-model="priorityFilter"
                placeholder="All priorities"
                clearable
                style="width: 150px"
                @change="onFilterChange"
              >
                <el-option v-for="p in priorityOptions" :key="p.value" :label="p.label" :value="p.value" />
              </el-select>
            </div>

            <!-- ═══ Table View ═══ -->
            <ProTable
              v-if="viewMode === 'table'"
              ref="proTable"
              :columns="columns"
              :request-api="getTableList"
              :init-param="initParam"
              :data-callback="dataCallback"
              :tool-button="false"
              row-key="key"
            >
              <template #title="{ row }">
                <div class="reading-list__title">
                  <a
                    v-if="row.link"
                    :href="row.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="reading-list__title-link"
                    >{{ row.title }}</a
                  >
                  <span v-else class="reading-list__title-text">{{ row.title }}</span>
                  <div v-if="row.notes" class="reading-list__title-notes">
                    {{ oneLiner(row.notes) }}
                  </div>
                </div>
              </template>

              <template #updatedTime="{ row }">
                <span class="reading-list__date">{{ formatRelativeTime(row.updatedTime) }}</span>
              </template>

              <template #operation="{ row }">
                <el-button v-if="row.status !== 'done'" size="small" text type="success" @click="markDone(row)">Done</el-button>
                <el-button size="small" text type="primary" @click="openDialog(row)">Edit</el-button>
                <el-popconfirm title="Remove this reading item?" @confirm="removeItem(row)">
                  <template #reference>
                    <el-button size="small" text type="danger">Del</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </ProTable>

            <!-- ═══ Card View ═══ -->
            <div v-else-if="viewMode === 'card'" v-loading="flatLoading" class="reading-list__grid">
              <div v-if="!flatLoading && !flatData.length" class="reading-list__empty">
                <span class="reading-list__empty-icon">📚</span>
                <p class="reading-list__empty-title">No reading items</p>
                <p class="reading-list__empty-hint">Add your first book, article, or paper to get started.</p>
                <el-button type="primary" :icon="Plus" @click="openDialog()">Add Item</el-button>
              </div>
              <el-card v-for="item in flatData" :key="item.key" class="reading-list__card" shadow="hover">
                <div class="reading-list__card-top">
                  <el-tag :type="typeTagType(item.type)" size="small">{{ typeLabel(item.type) }}</el-tag>
                  <el-tag :type="statusTagType(item.status)" size="small">{{ statusLabel(item.status) }}</el-tag>
                  <el-tag v-if="item.priority" :type="priorityTagType(item.priority)" size="small">{{ item.priority }}</el-tag>
                </div>
                <p class="reading-list__card-title">
                  <a
                    v-if="item.link"
                    :href="item.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="reading-list__card-link"
                    >{{ item.title }}</a
                  >
                  <span v-else>{{ item.title }}</span>
                </p>
                <div v-if="item.author" class="reading-list__card-author">{{ item.author }}</div>
                <p v-if="item.notes" class="reading-list__card-notes">{{ oneLiner(item.notes) }}</p>
                <div class="reading-list__card-actions">
                  <span class="reading-list__card-date">{{ formatRelativeTime(item.updatedTime) }}</span>
                  <el-button v-if="item.status !== 'done'" size="small" text type="success" @click="markDone(item)"
                    >Done</el-button
                  >
                  <el-button size="small" text type="primary" @click="openDialog(item)">Edit</el-button>
                  <el-popconfirm title="Remove this reading item?" @confirm="removeItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger">Del</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </el-card>
            </div>

            <!-- ═══ List View ═══ -->
            <div v-else v-loading="flatLoading" class="reading-list__list">
              <div v-if="!flatLoading && !flatData.length" class="reading-list__empty">
                <span class="reading-list__empty-icon">📚</span>
                <p class="reading-list__empty-title">No reading items</p>
                <p class="reading-list__empty-hint">Add your first book, article, or paper to get started.</p>
                <el-button type="primary" :icon="Plus" @click="openDialog()">Add Item</el-button>
              </div>
              <div v-for="item in flatData" :key="item.key" class="reading-list__list-row">
                <span class="reading-list__list-type">{{ typeIcon(item.type) }}</span>
                <span class="reading-list__list-title">
                  <a
                    v-if="item.link"
                    :href="item.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="reading-list__list-link"
                    >{{ item.title }}</a
                  >
                  <span v-else>{{ item.title }}</span>
                  <span v-if="item.author" class="reading-list__list-author"> — {{ item.author }}</span>
                </span>
                <el-tag :type="statusTagType(item.status)" size="small">{{ statusLabel(item.status) }}</el-tag>
                <el-tag v-if="item.priority" :type="priorityTagType(item.priority)" size="small">{{ item.priority }}</el-tag>
                <span class="reading-list__list-date">{{ formatRelativeTime(item.updatedTime) }}</span>
                <div class="reading-list__list-actions">
                  <el-button v-if="item.status !== 'done'" size="small" text type="success" @click="markDone(item)"
                    >Done</el-button
                  >
                  <el-button size="small" text type="primary" @click="openDialog(item)">Edit</el-button>
                  <el-popconfirm title="Remove this reading item?" @confirm="removeItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger">Del</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { Search, Plus, Refresh } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { formatRelativeTime as formatRelTime } from "@/utils/datetime";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import {
  getReadingList,
  getReadingListCounts,
  createReadingItem,
  updateReadingItem,
  deleteReadingItem,
  type ReadingItem,
  type ReadingItemType,
  type ReadingItemStatus,
  type ReadingItemPriority
} from "@/api/modules/readingListService";

const proTable = ref<ProTableInstance>();

// ── Sticky bar ──
const stickyIcon = "📚";
const stickyTitle = "Reading List";

// ── View mode ──
const viewMode = ref<"card" | "list" | "table">("table");

// ── Option maps ──
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

function typeLabel(t: ReadingItemType) {
  return typeOptions.find(o => o.value === t)?.label || t;
}
function typeIcon(t: ReadingItemType) {
  return t === "book" ? "📘" : t === "paper" ? "📃" : "📄";
}
function statusLabel(s: ReadingItemStatus) {
  return statusOptions.find(o => o.value === s)?.label || s;
}
function typeTagType(t: ReadingItemType) {
  return t === "article" ? "warning" : t === "book" ? "primary" : "info";
}
function statusTagType(s: ReadingItemStatus) {
  return s === "done" ? "success" : s === "reading" ? "warning" : "info";
}
function priorityTagType(p: ReadingItemPriority) {
  return p === "high" ? "danger" : p === "medium" ? "warning" : "info";
}

// ── Sticky bar summary ──
const summary = reactive({ total: 0, reading: 0, done: 0 });
const summaryLoading = ref(false);

async function loadSummary() {
  summaryLoading.value = true;
  try {
    const counts = await getReadingListCounts("");
    summary.total = counts.total;
    summary.reading = counts.reading;
    summary.done = counts.done;
  } catch {
    summary.total = 0;
    summary.reading = 0;
    summary.done = 0;
  } finally {
    summaryLoading.value = false;
  }
}

// ── ProTable columns ──
const columns: ColumnProps<ReadingItem>[] = [
  { prop: "title", label: "Title", minWidth: 320, showOverflowTooltip: true },
  {
    prop: "type",
    label: "Type",
    width: 110,
    tag: true,
    enum: [
      { value: "article", label: "Article", tagType: "warning" },
      { value: "book", label: "Book", tagType: "primary" },
      { value: "paper", label: "Paper", tagType: "info" }
    ]
  },
  { prop: "author", label: "Author", width: 150, showOverflowTooltip: true },
  {
    prop: "status",
    label: "Status",
    width: 120,
    tag: true,
    enum: [
      { value: "to-read", label: "To read", tagType: "info" },
      { value: "reading", label: "Reading", tagType: "warning" },
      { value: "done", label: "Done", tagType: "success" }
    ]
  },
  {
    prop: "priority",
    label: "Priority",
    width: 110,
    tag: true,
    enum: [
      { value: "high", label: "High", tagType: "danger" },
      { value: "medium", label: "Medium", tagType: "warning" },
      { value: "low", label: "Low", tagType: "info" }
    ]
  },
  { prop: "updatedTime", label: "Updated", width: 120 },
  { prop: "operation", label: "Actions", width: 170, fixed: "right" }
];

// ── ProTable API binding ──
const initParam = computed(() => ({}));

const dataCallback = (data: any) => ({
  list: data.list ?? [],
  total: data.total ?? 0
});

function buildFilter() {
  const filter: Record<string, any> = {};
  if (search.value) {
    const rx = { $regex: search.value, $options: "i" };
    filter.$or = [{ title: rx }, { author: rx }, { notes: rx }];
  }
  if (typeFilter.value) filter.type = typeFilter.value;
  if (statusFilter.value) filter.status = statusFilter.value;
  if (priorityFilter.value) filter.priority = priorityFilter.value;
  return filter;
}

async function getTableList(params: any) {
  const filter = buildFilter();
  const res = await getReadingList({
    search: search.value || undefined,
    type: (typeFilter.value || undefined) as ReadingItemType | undefined,
    status: (statusFilter.value || undefined) as ReadingItemStatus | undefined,
    priority: (priorityFilter.value || undefined) as ReadingItemPriority | undefined,
    pageNum: params.pageNum,
    pageSize: params.pageSize
  });
  return res;
}

// ── Flat data (card/list views) ──
const flatData = ref<ReadingItem[]>([]);
const flatLoading = ref(false);

async function loadFlatData() {
  flatLoading.value = true;
  try {
    const res = await getReadingList({
      search: search.value || undefined,
      type: (typeFilter.value || undefined) as ReadingItemType | undefined,
      status: (statusFilter.value || undefined) as ReadingItemStatus | undefined,
      priority: (priorityFilter.value || undefined) as ReadingItemPriority | undefined,
      pageNum: 1,
      pageSize: 500,
      orderBy: "updatedTime",
      orderType: "desc"
    });
    flatData.value = (res.data as any)?.list ?? [];
  } catch {
    flatData.value = [];
  } finally {
    flatLoading.value = false;
  }
}

// ── Filter state ──
const activeTab = ref<"all" | "reading" | "done">("all");
const search = ref("");
const typeFilter = ref<ReadingItemType | "">("");
const statusFilter = ref<ReadingItemStatus | "">("");
const priorityFilter = ref<ReadingItemPriority | "">("");

const sectionTitle = computed(() => {
  switch (activeTab.value) {
    case "reading":
      return "📅 阅读中";
    case "done":
      return "✅ 已读完";
    default:
      return "📖 阅读列表";
  }
});

const sectionTotal = computed(() => {
  switch (activeTab.value) {
    case "reading":
      return summary.reading;
    case "done":
      return summary.done;
    default:
      return summary.total;
  }
});

const displayCount = computed(() => {
  if (viewMode.value === "table") return proTable.value?.pageable?.total ?? 0;
  return flatData.value.length;
});

function onTabChange(tab: string) {
  search.value = "";
  typeFilter.value = "";
  priorityFilter.value = "";
  if (tab === "reading") {
    statusFilter.value = "reading";
  } else if (tab === "done") {
    statusFilter.value = "done";
  } else {
    statusFilter.value = "";
  }
  refreshCurrentView();
}

const total = computed(() => proTable.value?.pageable?.total ?? 0);

let filterTimer: ReturnType<typeof setTimeout> | null = null;
function onFilterChange() {
  if (filterTimer) clearTimeout(filterTimer);
  filterTimer = setTimeout(() => refreshCurrentView(), 300);
}

function refreshCurrentView() {
  if (viewMode.value === "table") {
    proTable.value?.getTableList();
  } else {
    loadFlatData();
  }
}

function handleRefresh() {
  refreshCurrentView();
  loadSummary();
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
    refreshCurrentView();
    loadSummary();
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
    refreshCurrentView();
    loadSummary();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to update status");
  }
}

async function removeItem(row: ReadingItem) {
  if (!row.key) return;
  try {
    await deleteReadingItem(row.key);
    ElMessage.success("Item removed");
    refreshCurrentView();
    loadSummary();
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

const relativeTimeCache = new Map<string, string>();

function formatRelativeTime(raw?: string): string {
  if (!raw) return "-";
  const cached = relativeTimeCache.get(raw);
  if (cached) return cached;
  const result = formatRelTime(raw);
  relativeTimeCache.set(raw, result);
  return result;
}

watch(
  () => viewMode.value,
  mode => {
    if (mode === "table") {
      proTable.value?.getTableList();
    } else {
      loadFlatData();
    }
  }
);

onMounted(() => {
  if (proTable.value) {
    proTable.value.pageable.pageSize = 20;
  }
  loadSummary();
});
</script>


<style scoped lang="scss">
@use "./styles/readingList.scss";
</style>
