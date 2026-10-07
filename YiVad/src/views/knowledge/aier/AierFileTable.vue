<template>
  <div class="aft">
    <div class="aft__toolbar">
      <el-input
        v-model="search"
        class="aft__search"
        placeholder="Search by title, path, or tags..."
        clearable
        :prefix-icon="Search"
        size="default"
      />
      <div class="aft__chips">
        <span class="aft__chip-label">Status:</span>
        <button
          v-for="s in STATUSES"
          :key="s"
          class="aft__chip"
          :class="{ 'is-active': statusFilter === s }"
          @click="statusFilter = statusFilter === s ? '' : s"
        >
          {{ s }}
        </button>
        <span class="aft__chip-sep" />
        <span class="aft__chip-label">Type:</span>
        <button
          v-for="t in types"
          :key="t"
          class="aft__chip"
          :class="{ 'is-active': typeFilter === t }"
          @click="typeFilter = typeFilter === t ? '' : t"
        >
          {{ t }}
        </button>
      </div>
    </div>

    <el-table
      :data="filtered"
      stripe
      row-key="path"
      @row-click="onRowClick"
      :highlight-current-row="true"
    >
      <el-table-column label="Title" min-width="280" sortable prop="name">
        <template #default="{ row }">
          <div class="aft__title-cell">
            <span class="aft__file-icon">{{ fileIcon(row as any) }}</span>
            <div class="aft__title-area">
              <span class="aft__title">{{ row.meta?.title || row.name }}</span>
              <span class="aft__path">{{ row.path }}</span>
            </div>
            <el-icon v-if="isStale(row as any)" class="aft__stale-icon" :size="14"><WarningFilled /></el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Domain" width="120" sortable prop="domain">
        <template #default="{ row }">
          <span class="aft__domain" :style="{ color: domainColor(row as any) }">
            {{ domainIcon(row as any) }} {{ domainLabel(row as any) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="110" sortable prop="type">
        <template #default="{ row }">
          <el-tag v-if="row.meta?.type" :type="typeTagType(row.meta.type)" size="small" effect="plain">
            {{ row.meta.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="110" sortable prop="status">
        <template #default="{ row }">
          <el-tag v-if="row.meta?.status" :type="statusTagType(row.meta.status)" size="small" effect="plain">
            {{ row.meta.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Lifecycle" width="110" sortable prop="lifecycle">
        <template #default="{ row }">
          <el-tag v-if="row.meta?.lifecycle" :type="lifecycleTagType(row.meta.lifecycle)" size="small" effect="plain">
            {{ row.meta.lifecycle }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Review" width="110" sortable prop="reviewCycle">
        <template #default="{ row }">
          <el-tag v-if="row.meta?.review_cycle" :type="reviewCycleTagType(row.meta.review_cycle)" size="small" effect="plain">
            {{ row.meta.review_cycle }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Size" width="80" sortable prop="size">
        <template #default="{ row }">
          <span class="aft__size">{{ formatSize(row.size) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Updated" width="120" sortable prop="updatedAt">
        <template #default="{ row }">
          <span class="aft__date">{{ formatDate(row.updatedAt) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="search && !filtered.length" class="aft__empty">
      No files match "{{ search }}"
    </div>
  </div>
</template>

<script setup lang="ts" name="AierFileTable">
import { ref, computed } from "vue";
import { Search, WarningFilled } from "@element-plus/icons-vue";
import { filesize } from "filesize";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

interface SubdirDef {
  id: string;
  icon: string;
  label: string;
  color: string;
}

const props = defineProps<{
  files: KnowledgeFileEntry[];
  filesByDir: Record<string, KnowledgeFileEntry[]>;
  subdirs: SubdirDef[];
}>();

const emit = defineEmits<{
  (e: "open", file: KnowledgeFileEntry): void;
}>();

const search = ref("");
const statusFilter = ref("");
const typeFilter = ref("");

const STATUSES = ["stable", "active", "evolving", "draft", "deprecated", "archived"];

const types = computed(() => {
  const s = new Set<string>();
  for (const f of props.files) if (f.meta?.type) s.add(f.meta.type);
  return [...s].sort();
});

interface TableRow {
  file: KnowledgeFileEntry;
  path: string;
  name: string;
  type: string;
  status: string;
  lifecycle: string;
  reviewCycle: string;
  size: number;
  updatedAt: number | null;
  domain: string;
}

const allRows = computed<TableRow[]>(() => {
  const rows: TableRow[] = [];
  for (const dir of props.subdirs) {
    for (const f of (props.filesByDir[dir.id] || [])) {
      rows.push({
        file: f,
        path: f.path,
        name: f.name,
        type: f.meta?.type || "",
        status: f.meta?.status || "",
        lifecycle: f.meta?.lifecycle || "",
        reviewCycle: f.meta?.review_cycle || "",
        size: f.size,
        updatedAt: f.updatedAt,
        domain: dir.id
      });
    }
  }
  return rows;
});

const filtered = computed(() => {
  return allRows.value.filter(row => {
    const q = search.value.toLowerCase();
    if (q) {
      const haystack = [
        row.file.meta?.title || "",
        row.file.name,
        row.path,
        ...(row.file.meta?.tags || [])
      ].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (statusFilter.value && row.status !== statusFilter.value) return false;
    if (typeFilter.value && row.type !== typeFilter.value) return false;
    return true;
  });
});

function onRowClick(row: TableRow) {
  emit("open", row.file);
}

const REVIEW_CYCLES: Record<string, number> = { weekly: 7, monthly: 30, quarterly: 90, yearly: 365, annual: 365 };

function isStale(row: TableRow): boolean {
  const cycle = row.reviewCycle;
  const updated = row.updatedAt;
  if (!cycle || !updated) return false;
  const days = (Date.now() - updated * 1000) / (86400 * 1000);
  const threshold = REVIEW_CYCLES[cycle] || 90;
  return days > threshold;
}

function domainIcon(row: TableRow): string {
  return props.subdirs.find(d => d.id === row.domain)?.icon || "📄";
}

function domainLabel(row: TableRow): string {
  return props.subdirs.find(d => d.id === row.domain)?.label || row.domain;
}

function domainColor(row: TableRow): string {
  return props.subdirs.find(d => d.id === row.domain)?.color || "inherit";
}

function fileIcon(f: KnowledgeFileEntry): string {
  const t = f.meta?.type;
  if (t === "summary" || t === "index") return "📖";
  if (t === "template") return "📋";
  if (t === "prompt") return "💬";
  if (t === "reference") return "📚";
  const tags = f.meta?.tags ?? [];
  if (tags.includes("architecture")) return "🏛️";
  if (tags.includes("agent")) return "🤖";
  if (tags.includes("rag")) return "🔍";
  if (tags.includes("safety") || tags.includes("security")) return "🛡️";
  return "📄";
}

function typeTagType(t: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (t === "summary" || t === "index") return "info";
  if (t === "template" || t === "prompt") return "warning";
  if (t === "reference") return "primary";
  return "info";
}

function statusTagType(s: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (s === "stable" || s === "active") return "success";
  if (s === "evolving") return "primary";
  if (s === "draft") return "warning";
  if (s === "deprecated" || s === "archived") return "danger";
  return "info";
}

function lifecycleTagType(l: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (l === "stable") return "success";
  if (l === "active" || l === "evolving") return "primary";
  if (l === "draft" || l === "in-review") return "warning";
  if (l === "deprecated") return "danger";
  return "info";
}

function reviewCycleTagType(r: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (r === "weekly" || r === "monthly") return "warning";
  if (r === "quarterly") return "primary";
  return "info";
}

function formatSize(bytes: number): string {
  return String(filesize(bytes));
}

function formatDate(ts: number | null): string {
  if (!ts) return "--";
  return new Date(ts * 1000).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}
</script>

<style scoped lang="scss">
.aft {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.aft__toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aft__search {
  max-width: 360px;
}

.aft__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.aft__chip-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.aft__chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }
  &.is-active {
    font-weight: 600;
    color: #fff;
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}

.aft__chip-sep {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: var(--el-border-color-lighter);
}

.aft__title-cell {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  cursor: pointer;
}

.aft__file-icon {
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 16px;
}

.aft__title-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.aft__title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--el-text-color-primary);
  overflow-wrap: break-word;
}

.aft__path {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.aft__stale-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--el-color-warning);
}

.aft__domain {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
}

.aft__size {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
}

.aft__date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.aft__empty {
  padding: 32px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

:deep(.el-table__row) {
  cursor: pointer;
}
</style>