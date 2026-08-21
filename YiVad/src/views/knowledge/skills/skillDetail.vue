<template>
  <div class="skill-detail">
    <!-- Header -->
    <header class="skill-detail__header">
      <div class="skill-detail__header-left">
        <el-button text @click="$router.push('/skills')">
          <el-icon><ArrowLeft /></el-icon>
          Skills
        </el-button>
        <div class="skill-detail__header-info">
          <h1>
            <span class="skill-detail__header-icon">{{ skillDef?.icon || "📄" }}</span>
            {{ skillDef?.title || skillId }}
          </h1>
          <span class="skill-detail__header-handle">/{{ skillDef?.name || skillId }}</span>
          <el-tag
            v-if="categoryInfo"
            :style="{ background: categoryInfo.color + '18', borderColor: categoryInfo.color + '40', color: categoryInfo.color }"
            size="small"
          >
            {{ categoryInfo.label }}
          </el-tag>
        </div>
      </div>
      <div class="skill-detail__header-right">
        <el-input
          v-model="searchText"
          placeholder="Search files..."
          :prefix-icon="Search"
          clearable
          size="small"
          style="width: 220px"
        />
        <el-button size="small" :loading="loading" @click="loadFiles">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
        <el-button size="small" :loading="downloading" @click="handleDownload">
          <el-icon><Download /></el-icon>
          Download
        </el-button>
      </div>
    </header>

    <!-- Info bar: description + badges + file count merged -->
    <div class="skill-detail__info">
      <p v-if="skillDef?.description" class="skill-detail__info-desc">{{ skillDef.description }}</p>
      <div class="skill-detail__info-row">
        <span class="skill-detail__info-count">{{ filteredFiles.length }} files</span>
        <span v-if="searchText" class="skill-detail__info-filtered">(filtered from {{ allFiles.length }})</span>
        <template v-if="skillDef || hasMeta">
          <span class="skill-detail__info-sep">·</span>
          <el-tag v-if="meta.status" :type="statusTagType(meta.status)" size="small">{{ meta.status }}</el-tag>
          <el-tag v-if="meta.lifecycle" :type="lifecycleTagType(meta.lifecycle)" size="small">{{ meta.lifecycle }}</el-tag>
          <el-tag v-if="skillDef?.user_invocable" type="success" size="small">user-invocable</el-tag>
          <el-tag v-if="meta.review_cycle" size="small" type="info">{{ meta.review_cycle }}</el-tag>
          <el-tag v-if="meta.created" size="small" type="info">{{ meta.created }}</el-tag>
          <span v-if="meta.roles?.length" class="skill-detail__info-sep">·</span>
          <el-tag v-for="r in meta.roles" :key="r" size="small" type="info" effect="plain">{{ r }}</el-tag>
        </template>
      </div>
    </div>

    <!-- File table -->
    <div class="skill-detail__list">
      <el-table
        v-loading="loading"
        :data="filteredFiles"
        stripe
        row-key="path"
        height="100%"
        highlight-current-row
        @row-click="(row) => openDetail(row as KnowledgeFileEntry)"
      >
        <el-table-column label="File" min-width="320">
          <template #default="{ row }">
            <div class="skill-detail__file">
              <span class="skill-detail__file-icon">{{ fileIcon(row as KnowledgeFileEntry) }}</span>
              <div class="skill-detail__file-body">
                <span class="skill-detail__file-name">{{ row.name }}</span>
                <span class="skill-detail__file-path">{{ row.path }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Type" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="fileTypeTag(row as KnowledgeFileEntry)" size="small">{{ fileTypeLabel(row as KnowledgeFileEntry) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.meta?.status"
              :type="statusTagType(row.meta.status)"
              size="small"
            >
              {{ row.meta.status }}
            </el-tag>
            <span v-else class="skill-detail__na">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Size" width="90" align="right">
          <template #default="{ row }">
            <span class="skill-detail__size">{{ formatSize(row.size) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Updated" width="150" align="center">
          <template #default="{ row }">
            <span v-if="row.updatedAt" class="skill-detail__date">{{ formatDate(row.updatedAt) }}</span>
            <span v-else class="skill-detail__na">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="danger" size="small" @click.stop="handleDelete(row as KnowledgeFileEntry)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && filteredFiles.length === 0" class="skill-detail__empty">
        <el-empty :description="searchText ? 'No files match your search' : 'No files found for this skill'" />
      </div>
    </div>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="skillDetail">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, Search, Refresh, Delete, Download } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { readKnowledgeFile, scanKnowledge, deleteKnowledgeFile, exportKnowledgeDir } from "@/api/modules/knowledgeService";
import type { KnowledgeMeta, KnowledgeFileEntry } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { skills, categories, type SkillDef } from "./constants";

const route = useRoute();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const skillId = computed(() => route.params.skillId as string);
const skillDef = computed<SkillDef | undefined>(() => skills.find(s => s.id === skillId.value));

const categoryInfo = computed(() => {
  if (!skillDef.value) return null;
  return categories.find(c => c.id === skillDef.value!.category) || null;
});

const meta = ref<KnowledgeMeta>({});
const allFiles = ref<KnowledgeFileEntry[]>([]);
const loading = ref(false);
const searchText = ref("");
const downloading = ref(false);

const hasMeta = computed(() => {
  const m = meta.value;
  return Boolean(m.status || m.lifecycle || m.review_cycle || m.type || m.roles?.length || m.tags?.length || m.created || m.updated);
});

const filteredFiles = computed(() => {
  let list = allFiles.value;
  if (searchText.value) {
    const q = searchText.value.toLowerCase();
    list = list.filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
  }
  return list.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
});

function fileIcon(row: KnowledgeFileEntry): string {
  const n = row.name.toLowerCase();
  if (n === "skill.md") return "⭐";
  if (n.endsWith(".md")) return "📄";
  if (n.endsWith(".mjs") || n.endsWith(".js")) return "📜";
  if (n.endsWith(".json")) return "📋";
  if (n.endsWith(".ts")) return "🔷";
  return "📁";
}

function fileTypeLabel(row: KnowledgeFileEntry): string {
  const path = row.path.toLowerCase();
  if (path.includes("/agents/")) return "Agent";
  if (path.includes("/commands/")) return "Command";
  if (path.includes("/rules/")) return "Rule";
  if (path.includes("/references/")) return "Reference";
  if (path.includes("/steps/")) return "Step";
  if (path.includes("/templates/")) return "Template";
  if (path.includes("/lib/")) return "Lib";
  if (row.name.toLowerCase() === "skill.md") return "Skill";
  return "Other";
}

function fileTypeTag(row: KnowledgeFileEntry): "primary" | "success" | "warning" | "info" | "danger" {
  const type = fileTypeLabel(row);
  if (type === "Skill") return "primary";
  if (type === "Agent") return "success";
  if (type === "Command") return "warning";
  if (type === "Rule") return "danger";
  if (type === "Step") return "primary";
  return "info";
}

function statusTagType(s: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (s === "stable" || s === "active") return "success";
  if (s === "draft") return "warning";
  if (s === "deprecated" || s === "archived") return "danger";
  return "info";
}

function lifecycleTagType(l: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (l === "stable") return "success";
  if (l === "draft" || l === "in-review") return "warning";
  if (l === "deprecated") return "danger";
  return "info";
}

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function openDetail(row: KnowledgeFileEntry) {
  previewDlg.value?.open(row.path);
}

async function handleDelete(row: KnowledgeFileEntry) {
  try {
    await ElMessageBox.confirm(
      `Delete "${row.path}"? This action cannot be undone.`,
      "Confirm Delete",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
    );
  } catch {
    return;
  }
  try {
    await deleteKnowledgeFile(row.path);
    ElMessage.success("File deleted");
    allFiles.value = allFiles.value.filter(f => f.path !== row.path);
  } catch {
    ElMessage.error("Failed to delete file");
  }
}

async function handleDownload() {
  downloading.value = true;
  try {
    await exportKnowledgeDir(`skills/${skillId.value}`);
    ElMessage.success("Download started");
  } catch {
    ElMessage.error("Failed to download skill directory");
  } finally {
    downloading.value = false;
  }
}

async function loadFiles() {
  loading.value = true;
  try {
    // Load SKILL.md metadata first
    const skillPath = `skills/${skillId.value}/SKILL.md`;
    readKnowledgeFile(skillPath).then(res => {
      meta.value = res.meta || {};
    }).catch(() => {});

    // Scan the skill directory
    const res = await scanKnowledge(`skills/${skillId.value}`);
    allFiles.value = res.categories?.[0]?.files ?? [];
  } catch {
    allFiles.value = [];
  } finally {
    loading.value = false;
  }
}

watch(skillId, () => {
  searchText.value = "";
  loadFiles();
});

loadFiles();
</script>

<style scoped lang="scss">
.skill-detail {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 24px;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

// ── Header ──────────────────────────────────────────────
.skill-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.skill-detail__header-left {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.skill-detail__header-info {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.skill-detail__header-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.skill-detail__header-handle {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 8px;
  border-radius: 4px;
}

.skill-detail__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

// ── Info bar (desc + badges + count merged) ────────────
.skill-detail__info {
  margin-bottom: 10px;
  flex-shrink: 0;
}

.skill-detail__info-desc {
  margin: 0 0 4px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.skill-detail__info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.skill-detail__info-count {
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.skill-detail__info-filtered {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.skill-detail__info-sep {
  color: var(--el-border-color-darker);
  margin: 0 2px;
  user-select: none;
}

// ── List ────────────────────────────────────────────────
.skill-detail__list {
  flex: 1;
  min-height: 0;
  overflow: hidden;

  :deep(.el-table) {
    --el-table-row-hover-bg-color: var(--el-fill-color-light);
  }

  :deep(.el-table__body tr) {
    cursor: pointer;
  }
}

.skill-detail__file {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-detail__file-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.skill-detail__file-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.skill-detail__file-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.skill-detail__file-path {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-detail__na {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.skill-detail__date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
}

.skill-detail__size {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
}

.skill-detail__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>