<template>
  <div class="sre-knowledge">
    <div class="sre-knowledge__header">
      <h2 class="sre-knowledge__heading">{{ $t("knowledge.sre.knowledgeBase") }}</h2>
      <span class="sre-knowledge__count">{{ totalFiles }} {{ $t("knowledge.pipeline.files", { n: totalFiles }) }}</span>
    </div>

    <section
      v-for="dir in SRE_SUBDIRS"
      :key="dir.id"
      class="sre-knowledge__section"
    >
      <button
        class="sre-knowledge__section-header"
        :style="{ borderLeftColor: dir.color }"
        @click="toggleSection(dir.id)"
      >
        <span class="sre-knowledge__section-arrow" :class="{ collapsed: collapsed.has(dir.id) }">▸</span>
        <span class="sre-knowledge__section-icon">{{ dir.icon }}</span>
        <span class="sre-knowledge__section-label">{{ dir.label }}</span>
        <span class="sre-knowledge__section-badge" :style="{ background: dir.color }">{{ fileCounts[dir.id] || 0 }}</span>
      </button>

      <p class="sre-knowledge__section-desc" :style="{ borderLeftColor: dir.color }">{{ dir.desc }}</p>

      <div v-if="!collapsed.has(dir.id)" class="sre-knowledge__grid">
        <el-card
          v-for="file in filesByDir(dir.id)"
          :key="file.path"
          class="sre-knowledge__card"
          shadow="hover"
          @click="$emit('open', file)"
        >
          <div class="sre-knowledge__card-head">
            <span class="sre-knowledge__card-icon">{{ fileIcon(file) }}</span>
            <div class="sre-knowledge__card-title-area">
              <h3 class="sre-knowledge__card-name">{{ file.meta?.title || file.name }}</h3>
              <span class="sre-knowledge__card-path">{{ filePathHint(file) }}</span>
            </div>
          </div>
          <p v-if="file.meta?.benefit" class="sre-knowledge__card-benefit">{{ file.meta.benefit }}</p>
          <p class="sre-knowledge__card-desc">{{ cardTags(file) }}</p>
          <div class="sre-knowledge__card-meta">
            <el-tag v-if="file.meta?.type" :type="tagType(file.meta.type)" size="small">{{ file.meta.type }}</el-tag>
            <el-tag v-if="file.meta?.status" :type="statusType(file.meta.status)" size="small">{{ file.meta.status }}</el-tag>
            <el-tag v-if="file.meta?.lifecycle" :type="lifecycleType(file.meta.lifecycle)" size="small">{{ file.meta.lifecycle }}</el-tag>
            <span class="sre-knowledge__card-size">{{ formatSize(file.size) }}</span>
          </div>
        </el-card>
      </div>

      <div v-else-if="!filesByDir(dir.id).length" class="sre-knowledge__empty">
        {{ $t("knowledge.common.noData") }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="SreKnowledgeSection">
import { ref, computed } from "vue";
import { filesize } from "filesize";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import { SRE_SUBDIRS } from "../composables/useSreDashboard";

const props = defineProps<{
  files: KnowledgeFileEntry[];
}>();

defineEmits<{
  (e: "open", file: KnowledgeFileEntry): void;
}>();

const collapsed = ref(new Set(SRE_SUBDIRS.slice(1).map(d => d.id)));

function toggleSection(id: string) {
  const next = new Set(collapsed.value);
  if (next.has(id)) next.delete(id); else next.add(id);
  collapsed.value = next;
}

const fileCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const d of SRE_SUBDIRS) counts[d.id] = 0;
  for (const f of props.files) {
    const dn = f.path.replace(/^sre\//, "").split("/")[0];
    if (counts[dn] !== undefined) counts[dn]++;
  }
  return counts;
});

const totalFiles = computed(() => props.files.length);

function filesByDir(dirId: string): any[] {
  return props.files.filter(f => f.path.replace(/^sre\//, "").split("/")[0] === dirId);
}

function filePathHint(file: KnowledgeFileEntry): string {
  return file.path.replace(/^sre\//, "");
}

function fileIcon(file: KnowledgeFileEntry): string {
  const t = file.meta?.type;
  if (t === "summary" || t === "index") return "📖";
  if (t === "template") return "📋";
  if (t === "howto" || t === "guide") return "📘";
  if (t === "report" || t === "analysis") return "📊";
  if (t === "reference") return "📚";
  return "📄";
}

function cardTags(file: KnowledgeFileEntry): string {
  const tags = (file.meta?.tags ?? []).filter(
    (t: string) => !["sre", "incident-response", "observability", "release", "leaf", "index", "moc"].includes(t)
  );
  return tags.slice(0, 4).join(", ");
}

function tagType(t: string): "info" | "warning" | "primary" {
  if (t === "summary" || t === "index") return "info";
  if (t === "template") return "warning";
  if (t === "howto" || t === "guide") return "primary";
  return "info";
}

function statusType(s: string): "success" | "warning" | "info" | "danger" | "primary" {
  if (s === "stable" || s === "active") return "success";
  if (s === "evolving") return "primary";
  if (s === "draft") return "warning";
  if (s === "deprecated" || s === "archived") return "danger";
  return "info";
}

function lifecycleType(l: string): "success" | "warning" | "info" | "danger" | "primary" {
  if (l === "stable") return "success";
  if (l === "active" || l === "evolving") return "primary";
  if (l === "draft" || l === "in-review") return "warning";
  if (l === "deprecated") return "danger";
  return "info";
}

function formatSize(bytes: number): string {
  return String(filesize(bytes));
}
</script>

<style scoped lang="scss">
.sre-knowledge__header {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 12px;
}

.sre-knowledge__heading {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.sre-knowledge__count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.sre-knowledge__section {
  margin-bottom: 14px;
}

.sre-knowledge__section-header {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-align: left;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.sre-knowledge__section-arrow {
  display: inline-block;
  font-size: 12px;
  transition: transform 0.2s;
  transform: rotate(90deg);

  &.collapsed {
    transform: rotate(0deg);
  }
}

.sre-knowledge__section-icon {
  font-size: 18px;
}

.sre-knowledge__section-label {
  flex: 1;
}

.sre-knowledge__section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border-radius: 10px;
}

.sre-knowledge__section-desc {
  padding-left: 26px;
  margin: 4px 0 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  border-left: 3px solid transparent;
}

.sre-knowledge__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}

.sre-knowledge__card {
  cursor: pointer;
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    padding: 14px;
  }
}

.sre-knowledge__card-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 6px;
}

.sre-knowledge__card-icon {
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 20px;
}

.sre-knowledge__card-title-area {
  min-width: 0;
}

.sre-knowledge__card-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: break-word;
}

.sre-knowledge__card-path {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.sre-knowledge__card-benefit {
  display: -webkit-box;
  margin: 0 0 4px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-color-warning);
  -webkit-box-orient: vertical;
}

.sre-knowledge__card-desc {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}

.sre-knowledge__card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.sre-knowledge__card-size {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
}

.sre-knowledge__empty {
  padding: 24px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>