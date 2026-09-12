<template>
  <div>
    <!-- ═══ Docs Summary Bar ═══ -->
    <div class="dw-summary">
      <div class="dw-summary__item">
        <span class="dw-summary__value">{{ filteredDocItems.length }}</span>
        <span class="dw-summary__label">{{ $t("project.detail.tabs.workflows") }}</span>
      </div>
      <div v-for="tag in topTags" :key="tag.key" class="dw-summary__item">
        <span class="dw-summary__value">{{ tag.count }}</span>
        <span class="dw-summary__label">{{ TAG_LABELS[tag.key] || tag.key }}</span>
      </div>
    </div>

    <ProTable
      title=""
      :columns="docColumns"
      :data="filteredDocItems"
      :pagination="false"
    >
      <template #tableHeader>
        <span class="dw-table-title">{{ $t("project.detail.tabs.workflows") }}</span>
      </template>
      <template #title="scope">
        <div class="dw-file-cell">
          <el-icon :size="14" class="dw-file-icon"><component :is="docIcon(scope.row.tag)" /></el-icon>
          <el-button
            link
            type="primary"
            @click="openDoc(scope.row as DocItem)"
          >
            {{ scope.row.title }}
          </el-button>
        </div>
      </template>
      <template #tag="scope">
        <span
          class="dw-tag"
          :style="{ background: TAG_COLORS[scope.row.tag] || '#909399' }"
        >{{ TAG_LABELS[scope.row.tag] || scope.row.tag }}</span>
      </template>
      <template #updatedAt="scope">
        <span v-if="scope.row.updatedAt">{{ scope.row.updatedAt.slice(0, 10) }}</span>
        <span v-else class="dw-muted">—</span>
      </template>
      <template #path="scope">
        <span class="dw-path">{{ scope.row.path }}</span>
      </template>
    </ProTable>

    <el-empty v-if="!filteredDocItems.length" :description="emptyDescription" :image-size="60" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Document, Tickets, Folder } from "@element-plus/icons-vue";
import { ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import { TAG_COLORS, TAG_LABELS, PREVIEW_DLG_KEY, useProjectDetail, type DocItem } from "@/views/project/types";

const { t } = useI18n();

const ctx = useProjectDetail();
const previewDlg = inject(PREVIEW_DLG_KEY, null);

const { knowledgeFiles, project } = ctx;

const docSearch = ref("");
const docTagFilter = ref("");

const TAG_ICONS: Record<string, any> = {
  architecture: Folder,
  guides: Folder,
  patterns: Folder,
  workflows: Folder,
  requirements: Tickets,
  unknown: Document
};

function docIcon(tag: string) {
  return TAG_ICONS[tag] || Document;
}

const docColumns = computed<ColumnProps[]>(() => [
  { prop: "tag", label: t("project.workflows.columns.tag"), width: 100, sortable: true },
  { prop: "title", label: t("project.workflows.columns.file"), minWidth: 220, sortable: true },
  { prop: "path", label: t("project.workflows.columns.path"), minWidth: 180 },
  { prop: "updatedAt", label: t("project.workflows.columns.updated"), width: 120, sortable: true },
]);

const docItems = computed<DocItem[]>(() => {
  const key = project.value?.key || "";
  const prefix = `projects/${key}/workflows/`;
  const items = knowledgeFiles.value
    .filter(f => f.path.startsWith(prefix) && f.path.endsWith(".md"))
    .map(f => {
      const rel = f.path.slice(prefix.length);
      const tag = rel.split("/")[0] || "unknown";
      return {
        title: (f.meta?.title as string) || f.name.replace(/\.md$/, ""),
        path: f.path,
        tag,
        updatedAt: (f.meta?.updated as string) || "",
      };
    })
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  return items;
});

const filteredDocItems = computed(() => {
  let list = docItems.value;
  if (docSearch.value) {
    const q = docSearch.value.toLowerCase();
    list = list.filter(d => d.title.toLowerCase().includes(q));
  }
  if (docTagFilter.value) {
    list = list.filter(d => d.tag === docTagFilter.value);
  }
  return list;
});

const topTags = computed(() => {
  const counts: Record<string, number> = {};
  for (const d of docItems.value) {
    counts[d.tag] = (counts[d.tag] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
});

const emptyDescription = computed(() => {
  if (docSearch.value || docTagFilter.value) return t("project.workflows.noMatch");
  return t("project.workflows.empty");
});

function openDoc(doc: DocItem) {
  previewDlg?.value?.open(doc.path);
}
</script>

<style scoped lang="scss">
.dw-table-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

// ── Summary bar ──
.dw-summary {
  display: flex;
  gap: 1px;
  margin-bottom: 16px;
  background: var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}

.dw-summary__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 10px;
  background: var(--el-bg-color);
}

.dw-summary__value {
  font-size: 20px;
  font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);
}

.dw-summary__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.dw-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: auto;
}
.dw-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}
.dw-path {
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.dw-muted {
  color: var(--el-text-color-placeholder);
}
.dw-file-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.dw-file-icon {
  flex-shrink: 0;
  color: var(--el-color-primary);
}
</style>