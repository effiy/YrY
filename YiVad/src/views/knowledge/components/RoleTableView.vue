<template>
  <div class="role-table-view">
    <el-table :data="files" stripe border style="width: 100%" row-key="path">
      <el-table-column min-width="280" prop="title">
        <template #header>
          <div class="role-table-view__th">
            <span>Title</span>
            <el-input v-model="filters.title" size="small" placeholder="Search title..." clearable />
          </div>
        </template>
        <template #default="{ row }">
          <div class="role-table-view__item" @click="$emit('open', row.file)">
            <span class="role-table-view__icon">{{ fileIcon(row.file) }}</span>
            <div class="role-table-view__title-area">
              <span class="role-table-view__title">{{ row.title }}</span>
              <span class="role-table-view__path">{{ filePathHint(row.file) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="150" prop="domain">
        <template #header>
          <div class="role-table-view__th">
            <span>Domain</span>
            <el-input v-model="filters.domainText" size="small" placeholder="Search domain..." clearable />
          </div>
        </template>
        <template #default="{ row }">
          <span class="role-table-view__domain" :style="{ color: row.domainColor }">
            <span>{{ row.domainIcon }}</span>
            <span>{{ row.domain }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column width="130">
        <template #header>
          <div class="role-table-view__th">
            <span>Type</span>
            <el-input v-model="filters.type" size="small" placeholder="Search type..." clearable />
          </div>
        </template>
        <template #default="{ row }">
          <el-tag v-if="row.file.meta?.type" :type="typeTagType(row.file.meta.type)" size="small">{{ row.file.meta.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="130">
        <template #header>
          <div class="role-table-view__th">
            <span>Status</span>
            <el-input v-model="filters.status" size="small" placeholder="Search status..." clearable />
          </div>
        </template>
        <template #default="{ row }">
          <el-tag v-if="row.file.meta?.status" :type="statusTagType(row.file.meta.status)" size="small">{{ row.file.meta.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="140">
        <template #header>
          <div class="role-table-view__th">
            <span>Lifecycle</span>
            <el-input v-model="filters.lifecycle" size="small" placeholder="Search lifecycle..." clearable />
          </div>
        </template>
        <template #default="{ row }">
          <el-tag v-if="row.file.meta?.lifecycle" :type="lifecycleTagType(row.file.meta.lifecycle)" size="small">{{ row.file.meta.lifecycle }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="140">
        <template #header>
          <div class="role-table-view__th">
            <span>Review</span>
            <el-input v-model="filters.review" size="small" placeholder="Search review..." clearable />
          </div>
        </template>
        <template #default="{ row }">
          <el-tag v-if="row.file.meta?.review_cycle" :type="reviewCycleTagType(row.file.meta.review_cycle)" size="small">{{ row.file.meta.review_cycle }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Size" width="90" sortable prop="size">
        <template #default="{ row }">
          <span class="role-table-view__size">{{ formatSize(row.size) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="80" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text type="danger" @click="$emit('delete', row.file)">Del</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="totalCount && !files.length" class="role-table-view__empty">
      <span>No files match the current filters.</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="RoleTableView">
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

interface FileRow {
  file: KnowledgeFileEntry;
  title: string;
  domain: string;
  domainIcon: string;
  domainColor: string;
  size: number;
}

interface TableFilters {
  title: string;
  domain: string[];
  domainText: string;
  type: string;
  status: string;
  lifecycle: string;
  review: string;
}

const filters = defineModel<TableFilters>('filters', { required: true });

defineProps<{
  files: FileRow[];
  totalCount: number;
  category: string;
}>();

defineEmits<{
  (e: "open", file: KnowledgeFileEntry): void;
  (e: "delete", file: KnowledgeFileEntry): void;
}>();

function filePathHint(file: KnowledgeFileEntry): string {
  return file.path;
}

function fileIcon(file: KnowledgeFileEntry): string {
  const t = file.meta?.type;
  if (t === "summary" || t === "index") return "📖";
  if (t === "template") return "📋";
  const tags = file.meta?.tags ?? [];
  if (tags.includes("journeys")) return "🚶";
  if (tags.includes("book")) return "📘";
  if (tags.includes("framework") || tags.includes("strategy")) return "📊";
  return "📄";
}

function typeTagType(t: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (t === "summary" || t === "index") return "info";
  if (t === "template") return "warning";
  if (t === "framework") return "primary";
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
  if (r === "monthly") return "warning";
  if (r === "quarterly") return "primary";
  if (r === "half-yearly" || r === "yearly") return "info";
  return "info";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped lang="scss">
.role-table-view__th { display: flex; flex-direction: column; gap: 6px; padding: 2px 0; }
.role-table-view__item { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; }
.role-table-view__icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.role-table-view__title-area { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.role-table-view__title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); line-height: 1.3; word-break: break-word; }
.role-table-view__path { font-size: 11px; font-family: monospace; color: var(--el-text-color-placeholder); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.role-table-view__domain { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; }
.role-table-view__size { font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); }
.role-table-view__empty { padding: 24px; text-align: center; font-size: 13px; color: var(--el-text-color-secondary); }
</style>