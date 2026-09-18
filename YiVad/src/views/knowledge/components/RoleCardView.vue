<template>
  <section
    v-for="dir in subdirs"
    :key="dir.id"
    class="role-card-view__section"
    :ref="
      el => {
        if (el) sectionRefs[dir.id] = el as HTMLElement;
      }
    "
  >
    <h2 class="role-card-view__section-title" :style="{ borderLeftColor: dir.color }" @click="$emit('toggleSection', dir.id)">
      <span class="role-card-view__section-arrow" :class="{ collapsed: collapsedSections.has(dir.id) }">▸</span>
      {{ dir.icon }} {{ dir.label }}
    </h2>
    <p class="role-card-view__section-desc">{{ dir.desc }}</p>
    <template v-if="!collapsedSections.has(dir.id)">
      <div class="role-card-view__grid">
        <el-card
          v-for="file in filesByDir[dir.id]"
          :key="file.path"
          class="role-card-view__card"
          shadow="hover"
          @click="$emit('open', file)"
        >
          <el-button
            class="role-card-view__card-delete"
            text
            type="danger"
            size="small"
            :icon="Delete"
            @click.stop="$emit('delete', file)"
          />
          <div class="role-card-view__card-head">
            <span class="role-card-view__card-icon">{{ fileIcon(file) }}</span>
            <div class="role-card-view__card-title-area">
              <h3 class="role-card-view__card-name">{{ file.meta?.title || file.name }}</h3>
              <span class="role-card-view__card-path">{{ filePathHint(file) }}</span>
            </div>
          </div>
          <p v-if="file.meta?.benefit" class="role-card-view__card-benefit">💡 {{ file.meta.benefit }}</p>
          <p class="role-card-view__card-desc">{{ cardDescription(file) }}</p>
          <div class="role-card-view__card-meta">
            <el-tag v-if="file.meta?.type" :type="typeTagType(file.meta.type)" size="small">{{ file.meta.type }}</el-tag>
            <el-tag v-if="file.meta?.status" :type="statusTagType(file.meta.status)" size="small">{{ file.meta.status }}</el-tag>
            <el-tag v-if="file.meta?.lifecycle" :type="lifecycleTagType(file.meta.lifecycle)" size="small">{{
              file.meta.lifecycle
            }}</el-tag>
            <el-tag v-if="file.meta?.review_cycle" :type="reviewCycleTagType(file.meta.review_cycle)" size="small">{{
              file.meta.review_cycle
            }}</el-tag>
            <span class="role-card-view__card-size">{{ formatSize(file.size) }}</span>
          </div>
        </el-card>
      </div>
      <div v-if="!filesByDir[dir.id]?.length" class="role-card-view__empty-dir"><span>No files found in this area.</span></div>
    </template>
  </section>
</template>

<script setup lang="ts" name="RoleCardView">
import { ref } from "vue";
import { Delete } from "@element-plus/icons-vue";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

interface Subdir {
  id: string;
  icon: string;
  label: string;
  color: string;
  desc: string;
}

const props = defineProps<{
  subdirs: Subdir[];
  filesByDir: Record<string, KnowledgeFileEntry[]>;
  collapsedSections: Set<string>;
  category: string;
  structuralTags: string[];
}>();

defineEmits<{
  (e: "open", file: KnowledgeFileEntry): void;
  (e: "delete", file: KnowledgeFileEntry): void;
  (e: "toggleSection", id: string): void;
}>();

const sectionRefs: Record<string, HTMLElement> = {};

const STRUCTURAL_TAGS = new Set([
  "leaf",
  "index",
  "moc",
  "summary",
  "template",
  props.category,
  ...props.subdirs.map(d => d.id),
  ...props.structuralTags
]);

function filePathHint(file: KnowledgeFileEntry): string {
  return file.path.replace(new RegExp(`^${props.category}/`), "");
}

function cardDescription(file: KnowledgeFileEntry): string {
  const tags = (file.meta?.tags ?? []).filter(t => !STRUCTURAL_TAGS.has(t));
  return tags.slice(0, 4).join(", ");
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
.role-card-view__section {
  margin-bottom: 20px;
}
.role-card-view__section-title {
  display: flex;
  gap: 4px;
  align-items: center;
  padding-left: 10px;
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  border-left: 3px solid var(--el-color-primary);
  &:hover {
    opacity: 0.8;
  }
}
.role-card-view__section-arrow {
  display: inline-block;
  font-size: 12px;
  transition: transform 0.2s;
  &.collapsed {
    transform: rotate(0deg);
  }
  &:not(.collapsed) {
    transform: rotate(90deg);
  }
}
.role-card-view__section-desc {
  padding-left: 13px;
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.role-card-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;
}
.role-card-view__card {
  position: relative;
  cursor: pointer;
  border-radius: 10px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
  :deep(.el-card__body) {
    padding: 14px;
  }
}
.role-card-view__card-delete {
  position: absolute;
  top: 6px;
  right: 6px;
  opacity: 0;
  transition: opacity 0.2s;
  .role-card-view__card:hover & {
    opacity: 1;
  }
}
.role-card-view__card-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 6px;
}
.role-card-view__card-icon {
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 20px;
}
.role-card-view__card-title-area {
  min-width: 0;
}
.role-card-view__card-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: break-word;
}
.role-card-view__card-path {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}
.role-card-view__card-benefit {
  display: -webkit-box;
  margin: 0 0 4px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-color-warning);
  -webkit-box-orient: vertical;
}
.role-card-view__card-desc {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}
.role-card-view__card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.role-card-view__card-size {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
}
.role-card-view__empty-dir {
  padding: 24px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
