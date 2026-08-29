<template>
  <div class="sd-page" @keydown="handleKeydown">
    <!-- Skeleton -->
    <template v-if="loading">
      <div class="sd-skel">
        <div class="sd-skel-header">
          <div class="sd-skel-line sd-skel-line--short" />
          <div class="sd-skel-line sd-skel-line--long" />
          <div class="sd-skel-row">
            <div class="sd-skel-tag" /><div class="sd-skel-tag" /><div class="sd-skel-tag" />
          </div>
        </div>
        <div class="sd-skel-body">
          <div class="sd-skel-main">
            <div class="sd-skel-card" v-for="i in 3" :key="i">
              <div class="sd-skel-line sd-skel-line--med" />
              <div class="sd-skel-line sd-skel-line--long" />
              <div class="sd-skel-line sd-skel-line--long" />
              <div class="sd-skel-line sd-skel-line--med" />
            </div>
          </div>
          <div class="sd-skel-sidebar">
            <div class="sd-skel-card" v-for="i in 3" :key="i">
              <div class="sd-skel-line sd-skel-line--med" />
              <div class="sd-skel-line sd-skel-line--short" />
              <div class="sd-skel-line sd-skel-line--short" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Header -->
      <div class="sd-header" :style="{ borderLeftColor: accentColor }">
        <div class="sd-header__top">
          <div class="sd-header__left">
            <el-button text :icon="ArrowLeft" @click="$router.push('/skills')">Skills</el-button>
            <h1 class="sd-header__title">
              <span class="sd-header__icon">{{ skillDef?.icon || "📄" }}</span>
              {{ skillDef?.title || skillId }}
            </h1>
            <code class="sd-header__handle">/{{ skillDef?.name || skillId }}</code>
            <el-tag
              v-if="categoryInfo"
              :style="{ background: categoryInfo.color + '18', borderColor: categoryInfo.color + '40', color: categoryInfo.color }"
              size="small"
            >
              {{ categoryInfo.label }}
            </el-tag>
          </div>
          <div class="sd-header__actions">
            <el-tooltip :content="focusMode ? 'Show sidebar' : 'Focus mode'" placement="bottom">
              <el-button size="small" :icon="focusMode ? Rank : FullScreen" @click="focusMode = !focusMode" />
            </el-tooltip>
            <el-input
              v-model="searchText"
              placeholder="Search files..."
              :prefix-icon="Search"
              clearable
              size="small"
              style="width: 200px"
            />
            <el-button size="small" :loading="downloading" @click="handleDownload">
              <el-icon><Download /></el-icon>
              Download
            </el-button>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="sd-body">
        <div class="sd-main">
          <READMECard
            :content="descContent"
            :html="descHtml"
            empty-hint="Add a SKILL.md description to document this skill"
            @edit="openDescDialog"
          />

          <!-- Files -->
          <div class="sd-card">
            <div class="sd-card__head">
              <el-icon class="sd-card__icon"><FolderOpened /></el-icon>
              <span>Files ({{ filteredFiles.length }})</span>
              <span v-if="searchText" class="sd-card__head-hint">filtered from {{ allFiles.length }}</span>
            </div>
            <div class="sd-card__body sd-card__body--flush">
              <div v-if="filteredFiles.length" class="sd-files">
                <div
                  v-for="row in filteredFiles"
                  :key="row.path"
                  class="sd-file"
                  @click="openDetail(row)"
                >
                  <div class="sd-file__accent" :style="{ background: fileAccentColor(row) }" />
                  <div class="sd-file__main">
                    <div class="sd-file__head">
                      <span class="sd-file__icon">{{ fileIcon(row) }}</span>
                      <span class="sd-file__name">{{ row.name }}</span>
                      <el-tag :type="fileTypeTag(row)" size="small" effect="plain">{{ fileTypeLabel(row) }}</el-tag>
                      <span class="sd-file__size">{{ formatSize(row.size) }}</span>
                    </div>
                    <div class="sd-file__foot">
                      <code class="sd-file__path">{{ row.path }}</code>
                      <span v-if="row.meta?.status" class="sd-file__meta">
                        <el-tag :type="statusTagType(row.meta.status)" size="small">{{ row.meta.status }}</el-tag>
                      </span>
                      <span v-if="row.updatedAt" class="sd-file__date">{{ formatDate(row.updatedAt) }}</span>
                      <el-button
                        text
                        size="small"
                        type="danger"
                        :icon="Delete"
                        class="sd-file__delete"
                        @click.stop="handleDelete(row)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="sd-empty">
                <el-icon class="sd-empty__icon"><FolderOpened /></el-icon>
                <p class="sd-empty__text">{{ searchText ? 'No files match your search' : 'No files in this skill' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sd-sidebar" :class="{ 'sd-sidebar--hidden': focusMode }">
          <!-- Overview -->
          <div class="sd-sb-group">
            <div class="sd-sb-group__title">
              <el-icon><InfoFilled /></el-icon>
              <span>Overview</span>
            </div>
            <div class="sd-sb-group__body">
              <div class="sd-sb-row">
                <span class="sd-sb-row__label">Name</span>
                <span class="sd-sb-row__value">
                  <code class="sd-sb-row__handle">/{{ skillDef?.name || skillId }}</code>
                </span>
              </div>
              <div class="sd-sb-row">
                <span class="sd-sb-row__label">Category</span>
                <span class="sd-sb-row__value" :style="{ color: accentColor }">{{ categoryInfo?.label || '—' }}</span>
              </div>
              <div class="sd-sb-row">
                <span class="sd-sb-row__label">Files</span>
                <span class="sd-sb-row__value sd-sb-row__value--muted">{{ allFiles.length }} files · {{ totalSize }}</span>
              </div>
            </div>
          </div>

          <!-- Lifecycle -->
          <div class="sd-sb-group">
            <div class="sd-sb-group__title">
              <el-icon><Clock /></el-icon>
              <span>Lifecycle</span>
            </div>
            <div class="sd-sb-group__body">
              <div class="sd-sb-row">
                <span class="sd-sb-row__label">Status</span>
                <span class="sd-sb-row__value">
                  <el-tag :type="statusTagType(skillDef?.status || '')" size="small">{{ skillDef?.status || '—' }}</el-tag>
                </span>
              </div>
              <div class="sd-sb-row">
                <span class="sd-sb-row__label">Lifecycle</span>
                <span class="sd-sb-row__value">
                  <el-tag :type="lifecycleTagType(skillDef?.lifecycle || '')" size="small">{{ skillDef?.lifecycle || '—' }}</el-tag>
                </span>
              </div>
              <div class="sd-sb-row">
                <span class="sd-sb-row__label">Invocable</span>
                <span class="sd-sb-row__value">
                  <el-tag :type="skillDef?.user_invocable ? 'success' : 'info'" size="small">{{ skillDef?.user_invocable ? 'Yes' : 'No' }}</el-tag>
                </span>
              </div>
            </div>
          </div>

          <!-- SKILL.md Metadata -->
          <div v-if="hasMeta" class="sd-sb-group">
            <div class="sd-sb-group__title">
              <el-icon><Collection /></el-icon>
              <span>SKILL.md</span>
            </div>
            <div class="sd-sb-group__body">
              <div v-if="meta.status" class="sd-sb-row">
                <span class="sd-sb-row__label">Status</span>
                <span class="sd-sb-row__value">
                  <el-tag :type="statusTagType(meta.status)" size="small">{{ meta.status }}</el-tag>
                </span>
              </div>
              <div v-if="meta.lifecycle" class="sd-sb-row">
                <span class="sd-sb-row__label">Lifecycle</span>
                <span class="sd-sb-row__value">
                  <el-tag :type="lifecycleTagType(meta.lifecycle)" size="small">{{ meta.lifecycle }}</el-tag>
                </span>
              </div>
              <div v-if="meta.review_cycle" class="sd-sb-row">
                <span class="sd-sb-row__label">Review</span>
                <span class="sd-sb-row__value sd-sb-row__value--muted">{{ meta.review_cycle }}</span>
              </div>
              <div v-if="meta.created" class="sd-sb-row">
                <span class="sd-sb-row__label">Created</span>
                <span class="sd-sb-row__value sd-sb-row__value--muted">{{ meta.created }}</span>
              </div>
              <div v-if="meta.updated" class="sd-sb-row">
                <span class="sd-sb-row__label">Updated</span>
                <span class="sd-sb-row__value sd-sb-row__value--muted">{{ meta.updated }}</span>
              </div>
              <div v-if="meta.roles?.length" class="sd-sb-dep">
                <span class="sd-sb-dep__label">Roles</span>
                <div class="sd-sb-dep__tags">
                  <el-tag v-for="r in meta.roles" :key="r" size="small" type="info" effect="plain">{{ r }}</el-tag>
                </div>
              </div>
              <div v-if="meta.tags?.length" class="sd-sb-dep">
                <span class="sd-sb-dep__label">Tags</span>
                <div class="sd-sb-dep__tags">
                  <el-tag v-for="t in meta.tags" :key="t" size="small">{{ t }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Bottom Bar -->
      <div class="sd-sticky-bar" :class="{ 'sd-sticky-bar--visible': showStickyBar }">
        <div class="sd-sticky-bar__inner">
          <div class="sd-sticky-bar__left">
            <span class="sd-sticky-bar__icon">{{ skillDef?.icon || "📄" }}</span>
            <span class="sd-sticky-bar__title">{{ skillDef?.title || skillId }}</span>
            <code class="sd-sticky-bar__handle">/{{ skillDef?.name || skillId }}</code>
            <span class="sd-sticky-bar__count">{{ filteredFiles.length }} files</span>
          </div>
          <div class="sd-sticky-bar__actions">
            <el-button size="small" :loading="downloading" @click="handleDownload">
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button size="small" :icon="Upload" circle @click="scrollToTop" />
          </div>
        </div>
      </div>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="skillDetail">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, Search, Delete, Download, FolderOpened, InfoFilled, Clock, Collection, FullScreen, Rank, Upload } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { readKnowledgeFile, scanKnowledge, deleteKnowledgeFile, exportKnowledgeDir } from "@/api/modules/knowledgeService";
import type { KnowledgeMeta, KnowledgeFileEntry } from "@/api/interface/yiweb";
import { READMECard } from "@/components";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { categories } from "./constants";

const route = useRoute();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const { render: renderMarkdown } = useMarkdown();

const skillId = computed(() => route.params.skillId as string);

interface SkillInfo {
  title: string;
  name: string;
  description: string;
  lifecycle: string;
  user_invocable: boolean;
  status: string;
  icon: string;
  category: string;
}

const skillDef = ref<SkillInfo | null>(null);

const categoryInfo = computed(() => {
  if (!skillDef.value) return null;
  return categories.find(c => c.id === skillDef.value!.category) || null;
});

const accentColor = computed(() => categoryInfo.value?.color || "#409eff");

const meta = ref<KnowledgeMeta>({});
const allFiles = ref<KnowledgeFileEntry[]>([]);
const loading = ref(false);
const searchText = ref("");
const downloading = ref(false);

const hasMeta = computed(() => {
  const m = meta.value;
  return Boolean(m.status || m.lifecycle || m.review_cycle || m.type || m.roles?.length || m.tags?.length || m.created || m.updated);
});

const totalSize = computed(() => {
  const bytes = allFiles.value.reduce((sum, f) => sum + (f.size || 0), 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
});

const filteredFiles = computed(() => {
  let list = allFiles.value;
  if (searchText.value) {
    const q = searchText.value.toLowerCase();
    list = list.filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
  }
  return list.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
});

// ── Description (SKILL.md content) ──
const descContent = ref("");
const descFilePath = computed(() => `skills/${skillId.value}/SKILL.md`);
const descHtml = computed(() => renderMarkdown(descContent.value || ""));

function openDescDialog() {
  previewDlg.value?.open(descFilePath.value);
}

// ── File helpers ──
function fileIcon(row: KnowledgeFileEntry): string {
  const n = row.name.toLowerCase();
  if (n === "skill.md") return "⭐";
  if (n.endsWith(".md")) return "📄";
  if (n.endsWith(".mjs") || n.endsWith(".js")) return "📜";
  if (n.endsWith(".json")) return "📋";
  if (n.endsWith(".ts")) return "🔷";
  return "📁";
}

function fileAccentColor(row: KnowledgeFileEntry): string {
  const n = row.name.toLowerCase();
  if (n === "skill.md") return "#f59e0b";
  if (n.endsWith(".md")) return "#409eff";
  if (n.endsWith(".mjs") || n.endsWith(".js") || n.endsWith(".ts")) return "#7c3aed";
  if (n.endsWith(".json")) return "#10b981";
  return "#909399";
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
  if (l === "stable" || l === "active") return "success";
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
    const skillPath = `skills/${skillId.value}/SKILL.md`;
    readKnowledgeFile(skillPath).then(res => {
      const m = (res.meta || {}) as Record<string, unknown>;
      skillDef.value = {
        title: (m.title as string) || skillId.value,
        name: (m.name as string) || skillId.value,
        description: (m.description as string) || "",
        lifecycle: (m.lifecycle as string) || "active",
        user_invocable: m.user_invocable === true || m.user_invocable === "true",
        status: (m.status as string) || "stable",
        icon: "📄",
        category: "ai",
      };
      meta.value = res.meta || {};
      descContent.value = res.content || "";
    }).catch(() => {});

    const res = await scanKnowledge(`skills/${skillId.value}`);
    allFiles.value = res.categories?.[0]?.files ?? [];
  } catch {
    allFiles.value = [];
  } finally {
    loading.value = false;
  }
}

// ── Keyboard Shortcuts ──
function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.key === "f" || e.key === "F") { e.preventDefault(); focusMode.value = !focusMode.value; }
}

// ── Sticky Bar ──
const showStickyBar = ref(false);
function onScroll() {
  showStickyBar.value = window.scrollY > 300;
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Focus Mode ──
const focusMode = ref(false);

watch(skillId, () => {
  searchText.value = "";
  loadFiles();
});

onMounted(() => {
  loadFiles();
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped lang="scss">
.sd-page {
  padding: 24px;
  min-height: calc(100vh - 95px);
  background: var(--el-bg-color-page);
  outline: none;
}

// ── Skeleton ──
.sd-skel { animation: sd-fade-in 0.3s ease; }
.sd-skel-header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.sd-skel-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: sd-shimmer 1.5s infinite;
  margin-bottom: 10px;
  &--short { width: 30%; }
  &--med { width: 55%; }
  &--long { width: 80%; }
}
.sd-skel-tag {
  display: inline-block;
  width: 60px;
  height: 22px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: sd-shimmer 1.5s infinite;
  margin-right: 8px;
}
.sd-skel-row { display: flex; gap: 8px; }
.sd-skel-body { display: flex; gap: 20px; }
.sd-skel-main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.sd-skel-sidebar { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }
.sd-skel-card { background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 10px; padding: 16px; }
@keyframes sd-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes sd-fade-in { from { opacity: 0; } to { opacity: 1; } }

// ── Header ──
.sd-header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  border-left: 4px solid var(--el-color-primary);
}
.sd-header__top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.sd-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.sd-header__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}
.sd-header__icon { font-size: 22px; flex-shrink: 0; }
.sd-header__handle {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 8px;
  border-radius: 4px;
}
.sd-header__actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

// ── Body ──
.sd-body { display: flex; gap: 20px; align-items: flex-start; }
.sd-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }

// ── Cards ──
.sd-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.sd-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.sd-card__icon { font-size: 16px; color: var(--el-color-primary); }
.sd-card__head-right { margin-left: auto; display: flex; align-items: center; }
.sd-card__head-hint { font-size: 12px; font-weight: 400; color: var(--el-text-color-secondary); }
.sd-card__body { padding: 16px; }
.sd-card__body--flush { padding: 0; }

// ── Empty States ──
.sd-empty {
  text-align: center;
  padding: 24px 16px;
  &__icon { font-size: 28px; color: var(--el-text-color-placeholder); margin-bottom: 8px; }
  &__text { margin: 0; font-size: 13px; font-weight: 500; color: var(--el-text-color-secondary); }
  &__hint { margin: 4px 0 0; font-size: 12px; color: var(--el-text-color-placeholder); }
}

// ── Files ──
.sd-files { display: flex; flex-direction: column; }
.sd-file {
  display: flex;
  gap: 0;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid var(--el-border-color-lighter);
  &:last-child { border-bottom: none; }
  &:hover { background: var(--el-fill-color-lighter); }
}
.sd-file__accent {
  width: 3px;
  flex-shrink: 0;
}
.sd-file__main {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
}
.sd-file__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.sd-file__icon { font-size: 15px; flex-shrink: 0; }
.sd-file__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.sd-file__size {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-family: monospace;
  flex-shrink: 0;
}
.sd-file__foot {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sd-file__path {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.sd-file__meta { flex-shrink: 0; }
.sd-file__date {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
  flex-shrink: 0;
}
.sd-file__delete {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.12s;
  .sd-file:hover & { opacity: 1; }
}

// ── Sidebar ──
.sd-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sd-sb-group {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.sd-sb-group__title {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  .el-icon { font-size: 13px; }
}
.sd-sb-group__body { padding: 8px 14px; }
.sd-sb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.sd-sb-row__label { color: var(--el-text-color-secondary); font-weight: 500; flex-shrink: 0; }
.sd-sb-row__value {
  text-align: right;
  &--muted { font-size: 12px; color: var(--el-text-color-placeholder); }
}
.sd-sb-row__handle {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 6px;
  border-radius: 3px;
}
.sd-sb-dep { margin-bottom: 8px; &:last-child { margin-bottom: 0; } }
.sd-sb-dep__label {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  display: block;
  margin-bottom: 4px;
}
.sd-sb-dep__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

// ── Focus Mode ──
.sd-sidebar--hidden { display: none; }

// ── Sticky Bottom Bar ──
.sd-sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  padding: 10px 24px;
  transform: translateY(100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  &--visible { transform: translateY(0); }
}
.sd-sticky-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}
.sd-sticky-bar__left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.sd-sticky-bar__icon { font-size: 16px; flex-shrink: 0; }
.sd-sticky-bar__title {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sd-sticky-bar__handle {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}
.sd-sticky-bar__count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.sd-sticky-bar__actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

// ── Print Styles ──
@media print {
  .sd-page {
    padding: 0;
    height: auto;
    overflow: visible;
    background: #fff;
  }
  .sd-header__actions { display: none; }
  .sd-sidebar { display: none; }
  .sd-sticky-bar { display: none; }
  .sd-header {
    border: none;
    border-left: none;
    padding: 0 0 16px;
    margin-bottom: 16px;
    border-bottom: 2px solid #000;
    border-radius: 0;
  }
  .sd-header__title { font-size: 18px; }
  .sd-card {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid #eee;
    break-inside: avoid;
    margin-bottom: 12px;
  }
  .sd-card__head { background: transparent; border-bottom: 1px solid #eee; }
  .sd-card__body { padding: 12px 0; }
  .sd-body { display: block; }
  .sd-main { max-width: 100%; }
}
</style>