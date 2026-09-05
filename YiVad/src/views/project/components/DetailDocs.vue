<template>
  <div>
    <div v-if="docItems.length > 1" class="dd-toolbar">
      <el-input
        v-model="docSearch"
        :placeholder="$t('project.docs.searchPlaceholder')"
        size="small"
        clearable
        :prefix-icon="Search"
        style="width: 220px"
      />
      <el-select v-model="docTagFilter" size="small" :placeholder="$t('project.docs.filterAll')" clearable style="width: 140px">
        <el-option :label="$t('project.docs.filterAll')" value="" />
        <el-option v-for="(label, key) in TAG_LABELS" :key="key" :label="label" :value="key" />
      </el-select>
      <span class="dd-count">{{ filteredDocItems.length }} docs</span>
    </div>

    <div v-if="filteredDocItems.length" class="dd-table-wrap">
      <el-table :data="filteredDocItems" stripe size="small" style="width: 100%">
        <el-table-column :label="$t('project.docs.columns.file')" min-width="220" sortable prop="title">
          <template #default="{ row }">
            <div class="dd-file-cell">
              <el-icon :size="14" class="dd-file-icon"><component :is="docIcon(row.tag)" /></el-icon>
              <el-button
                link
                type="primary"
                :loading="row.isSpecial && claudeLoading"
                @click="openDoc(row as DocItem)"
              >
                {{ row.title }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.docs.columns.tag')" width="100" sortable prop="tag">
          <template #default="{ row }">
            <span
              class="dd-tag"
              :style="{ background: TAG_COLORS[row.tag] || '#909399' }"
            >{{ TAG_LABELS[row.tag] || row.tag }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.docs.columns.updated')" width="120" sortable prop="updatedAt">
          <template #default="{ row }">
            <span v-if="row.updatedAt">{{ row.updatedAt.slice(0, 10) }}</span>
            <span v-else class="dd-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('project.docs.columns.path')" min-width="180">
          <template #default="{ row }">
            <span class="dd-path">{{ row.path }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-empty v-else :description="emptyDescription" :image-size="60" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Search, Document, Tickets, Folder } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { readProjectFile } from "@/api/modules/fileService";
import type { Project } from "@/api/modules/projectService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import { TAG_COLORS, TAG_LABELS, type DocItem } from "@/views/project/types";

const props = defineProps<{
  project: Project;
  knowledgeFiles: KnowledgeFileEntry[];
  previewDlgRef: any;
}>();

const docSearch = ref("");
const docTagFilter = ref("");
const claudeLoading = ref(false);

const TAG_ICONS: Record<string, any> = {
  "getting-started": Tickets,
  architecture: Folder,
  deployment: Folder,
  conventions: Folder,
  "ai-guide": Document,
  unknown: Document
};

function docIcon(tag: string) {
  return TAG_ICONS[tag] || Document;
}

const docItems = computed<DocItem[]>(() => {
  const key = props.project?.key || "";
  const prefix = `projects/${key}/文档/`;
  const items = props.knowledgeFiles
    .filter(f => f.path.startsWith(prefix) && f.path.endsWith(".md"))
    .map(f => {
      const rel = f.path.slice(prefix.length);
      const tag = rel.split("/")[0] || "unknown";
      return {
        title: (f.meta?.title as string) || f.name.replace(/\.md$/, ""),
        path: f.path,
        tag,
        updatedAt: (f.meta?.updated as string) || "",
        isSpecial: false
      };
    })
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  items.unshift({
    title: "CLAUDE.md",
    path: "CLAUDE.md",
    tag: "ai-guide",
    updatedAt: "",
    isSpecial: true
  });
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

const emptyDescription = computed(() => {
  if (docSearch.value || docTagFilter.value) return "No matching docs";
  return "No documentation files";
});

async function openDoc(doc: DocItem) {
  if (doc.isSpecial) {
    if (!props.project) return;
    claudeLoading.value = true;
    try {
      const content = await readProjectFile(props.project.key, "CLAUDE.md");
      props.previewDlgRef?.openRaw({ title: "CLAUDE.md", content });
    } catch {
      ElMessage.warning("Failed to load CLAUDE.md");
    } finally {
      claudeLoading.value = false;
    }
    return;
  }
  props.previewDlgRef?.open(doc.path);
}
</script>

<style scoped lang="scss">
.dd-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}
.dd-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: auto;
}
.dd-table-wrap {
  :deep(.el-table__row) { cursor: pointer; }
}
.dd-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}
.dd-path {
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.dd-muted {
  color: var(--el-text-color-placeholder);
}
.dd-file-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.dd-file-icon {
  flex-shrink: 0;
  color: var(--el-color-primary);
}
</style>