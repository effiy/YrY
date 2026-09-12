<template>
  <div class="role-list-view">
    <div v-for="row in files" :key="row.file.path" class="role-list-view__row" @click="$emit('open', row.file)">
      <el-button class="role-list-view__delete" text type="danger" size="small" :icon="Delete" @click.stop="$emit('delete', row.file)" />
      <span class="role-list-view__icon">{{ fileIcon(row.file) }}</span>
      <div class="role-list-view__main">
        <span class="role-list-view__title">{{ row.title }}</span>
        <span class="role-list-view__path">{{ filePathHint(row.file) }}</span>
      </div>
      <span class="role-list-view__domain" :style="{ color: row.domainColor }">
        <span>{{ row.domainIcon }}</span>
        <span>{{ row.domain }}</span>
      </span>
      <div class="role-list-view__tags">
        <el-tag v-if="row.file.meta?.type" :type="typeTagType(row.file.meta.type)" size="small">{{ row.file.meta.type }}</el-tag>
        <el-tag v-if="row.file.meta?.status" :type="statusTagType(row.file.meta.status)" size="small">{{ row.file.meta.status }}</el-tag>
        <el-tag v-if="row.file.meta?.lifecycle" :type="lifecycleTagType(row.file.meta.lifecycle)" size="small">{{ row.file.meta.lifecycle }}</el-tag>
      </div>
      <span class="role-list-view__size">{{ formatSize(row.file.size) }}</span>
    </div>
    <div v-if="totalCount && !files.length" class="role-list-view__empty">
      <span>No files match the current filters.</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="RoleListView">
import { Delete } from "@element-plus/icons-vue";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

interface FileRow {
  file: KnowledgeFileEntry;
  title: string;
  domain: string;
  domainIcon: string;
  domainColor: string;
}

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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped lang="scss">
.role-list-view { display: flex; flex-direction: column; gap: 6px; }
.role-list-view__row {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px; cursor: pointer; transition: box-shadow 0.2s; position: relative;
  &:hover { box-shadow: 0 2px 8px rgb(0 0 0 / 6%); }
}
.role-list-view__delete {
  position: absolute; top: 6px; right: 6px; opacity: 0; transition: opacity 0.2s;
  .role-list-view__row:hover & { opacity: 1; }
}
.role-list-view__icon { font-size: 18px; flex-shrink: 0; }
.role-list-view__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.role-list-view__title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); line-height: 1.3; word-break: break-word; }
.role-list-view__path { font-size: 11px; font-family: monospace; color: var(--el-text-color-placeholder); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.role-list-view__domain { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.role-list-view__tags { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.role-list-view__size { font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); flex-shrink: 0; }
.role-list-view__empty { padding: 24px; text-align: center; font-size: 13px; color: var(--el-text-color-secondary); }
</style>