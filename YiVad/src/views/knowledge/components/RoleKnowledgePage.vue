<template>
  <div class="role-page" v-loading="loading">
    <header
      class="role-page__header"
      v-sticky="{
        top: 0,
        zIndex: 20,
        offsetX: [24, 24],
        offsetY: [20, 14],
        activeClass: 'is-stuck'
      }"
    >
      <div class="role-page__header-row">
        <slot name="title"><h1>{{ title }}</h1></slot>
      </div>
    </header>

    <slot name="header" />

    <KnowledgeError v-if="error" :message="error" @retry="loadFiles" />

    <template v-else>
    <div class="role-page__body">
      <nav
        class="role-page__sidebar"
        v-sticky="{
          top: 96,
          zIndex: 18,
          activeClass: 'is-stuck'
        }"
      >
        <div class="role-page__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="card">Cards</el-radio-button>
            <el-radio-button value="list">List</el-radio-button>
            <el-radio-button value="table">Table</el-radio-button>
          </el-radio-group>
        </div>
        <button
          v-for="dir in subdirs"
          :key="dir.id"
          class="role-page__sidebar-item"
          :class="{ 'is-active': isStatActive(dir) }"
          @click="scrollTo(dir.id)"
        >
          <span class="role-page__sidebar-icon">{{ dir.icon }}</span>
          <span class="role-page__sidebar-label">{{ dir.label }}</span>
          <span class="role-page__sidebar-badge">{{ fileCounts[dir.id] || 0 }}</span>
        </button>
      </nav>

      <div class="role-page__content">
        <RoleCardView
          v-if="viewMode === 'card'"
          :subdirs="subdirs"
          :files-by-dir="filesByDir"
          :collapsed-sections="collapsedSections"
          :category="category"
          :structural-tags="structuralTags"
          @open="openFile"
          @delete="handleDelete"
          @toggle-section="toggleSection"
        />
        <RoleListView
          v-else-if="viewMode === 'list'"
          :files="filteredFiles"
          :total-count="flatFiles.length"
          :category="category"
          @open="openFile"
          @delete="handleDelete"
        />
        <RoleTableView
          v-else
          :files="filteredFiles"
          :total-count="flatFiles.length"
          :filters="filters"
          :category="category"
          @open="openFile"
          @delete="handleDelete"
        />
      </div>
    </div>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="RoleKnowledgePage">
import { ref, computed, onMounted, nextTick, reactive } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { scanKnowledge, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import KnowledgeError from "./KnowledgeError.vue";
import RoleCardView from "./RoleCardView.vue";
import RoleListView from "./RoleListView.vue";
import RoleTableView from "./RoleTableView.vue";

interface Subdir {
  id: string;
  icon: string;
  label: string;
  color: string;
  desc: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    domainsWord: string;
    description: string;
    category: string;
    subdirs: Subdir[];
    structuralTags?: string[];
  }>(),
  { structuralTags: () => [] }
);

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const allFiles = ref<KnowledgeFileEntry[]>([]);
const loading = ref(false);
const error = ref("");
const collapsedSections = ref(new Set(props.subdirs.slice(1).map(d => d.id)));
const viewMode = ref<"card" | "list" | "table">("table");
const cardActiveDomain = ref<string | null>(null);

const filters = reactive({
  title: "",
  domain: [] as string[],
  domainText: "",
  type: "",
  status: "",
  lifecycle: "",
  review: ""
});

function isStatActive(dir: Subdir): boolean {
  if (viewMode.value === "table") return filters.domain.includes(dir.label);
  return cardActiveDomain.value === dir.id;
}

function scrollTo(id: string) {
  if (viewMode.value === "table" || viewMode.value === "list") {
    const dir = props.subdirs.find(d => d.id === id);
    if (!dir) return;
    const idx = filters.domain.indexOf(dir.label);
    if (idx >= 0) filters.domain.splice(idx, 1);
    else filters.domain.push(dir.label);
    return;
  }
  cardActiveDomain.value = cardActiveDomain.value === id ? null : id;
  if (collapsedSections.value.has(id)) toggleSection(id);
  nextTick(() => {
    const el = document.querySelector(`[data-section="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function toggleSection(id: string) {
  const s = collapsedSections.value;
  if (s.has(id)) s.delete(id); else s.add(id);
  collapsedSections.value = new Set(s);
}

const filesByDir = computed<Record<string, KnowledgeFileEntry[]>>(() => {
  const map: Record<string, KnowledgeFileEntry[]> = {};
  for (const dir of props.subdirs) map[dir.id] = [];
  for (const f of allFiles.value) {
    const dirName = f.path.replace(new RegExp(`^${props.category}/`), "").split("/")[0];
    if (map[dirName]) map[dirName].push(f);
  }
  for (const dir of props.subdirs) map[dir.id].sort(compareByMaturity);
  return map;
});

const flatFiles = computed(() => {
  const rows: Array<{ file: KnowledgeFileEntry; path: string; name: string; title: string; size: number; domain: string; domainIcon: string; domainColor: string }> = [];
  for (const dir of props.subdirs) {
    for (const f of filesByDir.value[dir.id]) {
      rows.push({
        file: f,
        path: f.path,
        name: f.name,
        title: f.meta?.title || f.name,
        size: f.size,
        domain: dir.label,
        domainIcon: dir.icon,
        domainColor: dir.color
      });
    }
  }
  return rows;
});

const filteredFiles = computed(() => {
  return flatFiles.value.filter(row => {
    const ft = filters.title.toLowerCase();
    if (ft && !row.title.toLowerCase().includes(ft)) return false;
    if (filters.domain.length && !filters.domain.includes(row.domain)) return false;
    const fd = filters.domainText.toLowerCase();
    if (fd && !row.domain.toLowerCase().includes(fd)) return false;
    const fty = filters.type.toLowerCase();
    if (fty && !(row.file.meta?.type || "").toLowerCase().includes(fty)) return false;
    const fs = filters.status.toLowerCase();
    if (fs && !(row.file.meta?.status || "").toLowerCase().includes(fs)) return false;
    const fl = filters.lifecycle.toLowerCase();
    if (fl && !(row.file.meta?.lifecycle || "").toLowerCase().includes(fl)) return false;
    const fr = filters.review.toLowerCase();
    if (fr && !(row.file.meta?.review_cycle || "").toLowerCase().includes(fr)) return false;
    return true;
  });
});

const STATUS_ORDER: Record<string, number> = { stable: 0, active: 0, evolving: 1, draft: 2, deprecated: 3, archived: 3 };
const LIFECYCLE_ORDER: Record<string, number> = { stable: 0, active: 0, evolving: 1, draft: 2, 'in-review': 2, deprecated: 3 };

function compareByMaturity(a: KnowledgeFileEntry, b: KnowledgeFileEntry): number {
  const sa = STATUS_ORDER[a.meta?.status ?? ''] ?? 99;
  const sb = STATUS_ORDER[b.meta?.status ?? ''] ?? 99;
  if (sa !== sb) return sa - sb;
  const la = LIFECYCLE_ORDER[a.meta?.lifecycle ?? ''] ?? 99;
  const lb = LIFECYCLE_ORDER[b.meta?.lifecycle ?? ''] ?? 99;
  if (la !== lb) return la - lb;
  return a.name.localeCompare(b.name);
}

const fileCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {};
  for (const dir of props.subdirs) counts[dir.id] = (filesByDir.value[dir.id] || []).length;
  return counts;
});

function openFile(file: KnowledgeFileEntry) { previewDlg.value?.open(file.path); }

async function handleDelete(file: KnowledgeFileEntry) {
  try {
    await ElMessageBox.confirm(
      `Delete "${file.path}"? This action cannot be undone.`,
      "Confirm Delete",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
    );
  } catch { return; }
  try {
    await deleteKnowledgeFile(file.path);
    ElMessage.success("File deleted");
    allFiles.value = allFiles.value.filter(f => f.path !== file.path);
  } catch {
    ElMessage.error("Failed to delete file");
  }
}

async function loadFiles() {
  loading.value = true;
  error.value = "";
  try {
    const res = await scanKnowledge(props.category);
    allFiles.value = (res.categories?.flatMap(c => c.files) ?? []).filter(f => f.meta?.type !== "rss");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Unknown error";
    allFiles.value = [];
  } finally {
    loading.value = false;
  }
}
onMounted(loadFiles);
</script>

<style scoped lang="scss">
.role-page { display: flex; flex-direction: column; box-sizing: border-box; padding: 20px 24px; background: var(--el-bg-color-page); }
.role-page__header {
  z-index: 20;
  transition: box-shadow .2s ease, border-color .2s ease, background-color .2s ease, backdrop-filter .2s ease;
  h1 { margin: 0 0 4px; font-size: 20px; font-weight: 700; }
  p { margin: 0; font-size: 13px; color: var(--el-text-color-secondary); line-height: 1.6; }
  &.is-stuck {
    background: color-mix(in srgb, var(--el-bg-color-page) 82%, transparent);
    backdrop-filter: saturate(180%) blur(14px);
    -webkit-backdrop-filter: saturate(180%) blur(14px);
    border-bottom: 1px solid color-mix(in srgb, var(--el-border-color-lighter) 70%, transparent);
    box-shadow: 0 6px 20px -12px rgba(0, 0, 0, .1);
  }
}
.role-page__header-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; h1 { margin-bottom: 4px; } }
// ── Body + Sidebar ──
.role-page__body { display: flex; gap: 16px; align-items: flex-start; }
.role-page__sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 180px;
  flex-shrink: 0;
  padding: 10px 10px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  &.is-stuck {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -10px rgba(0, 0, 0, .12),
                0 2px 6px rgba(0, 0, 0, .04);
    border-color: color-mix(in srgb, var(--el-border-color) 70%, transparent);
  }
}
.role-page__sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: all .15s;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  &:hover { background: var(--el-fill-color-light); color: var(--el-text-color-primary); }
  &.is-active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}
.role-page__sidebar-icon { font-size: 18px; flex-shrink: 0; }
.role-page__sidebar-label { flex: 1; min-width: 0; overflow: hidden; }
.role-page__sidebar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  .role-page__sidebar-item.is-active & {
    background: var(--el-color-primary);
    color: #fff;
  }
}
.role-page__sidebar-view {
  padding: 4px 8px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}
.role-page__content { flex: 1; min-width: 0; }
</style>