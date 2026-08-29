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
        <el-button size="small" type="primary" plain @click="$router.push(`/executiver/okr/${category}`)">OKR →</el-button>
      </div>
    </header>

    <slot name="header" />

    <div v-if="error" class="role-page__error">
      <span>Failed to load files: {{ error }}</span>
      <el-button size="small" type="primary" @click="loadFiles">Retry</el-button>
    </div>

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

    <template v-if="viewMode === 'card'">
    <section v-for="dir in subdirs" :key="dir.id" class="role-page__section" :ref="(el) => { if (el) sectionRefs[dir.id] = el as HTMLElement; }">
      <h2 class="role-page__section-title" :style="{ borderLeftColor: dir.color }" @click="toggleSection(dir.id)">
        <span class="role-page__section-arrow" :class="{ collapsed: collapsedSections.has(dir.id) }">▸</span>
        {{ dir.icon }} {{ dir.label }}
      </h2>
      <p class="role-page__section-desc">{{ dir.desc }}</p>
      <template v-if="!collapsedSections.has(dir.id)">
      <div class="role-page__grid">
        <el-card v-for="file in filesByDir[dir.id]" :key="file.path" class="role-page__card" shadow="hover" @click="openFile(file)">
          <el-button class="role-page__card-delete" text type="danger" size="small" :icon="Delete" @click.stop="handleDelete(file)" />
          <div class="role-page__card-head">
            <span class="role-page__card-icon">{{ fileIcon(file) }}</span>
            <div class="role-page__card-title-area">
              <h3 class="role-page__card-name">{{ file.meta?.title || file.name }}</h3>
              <span class="role-page__card-path">{{ filePathHint(file) }}</span>
            </div>
          </div>
          <p v-if="file.meta?.benefit" class="role-page__card-benefit">💡 {{ file.meta.benefit }}</p>
          <p class="role-page__card-desc">{{ cardDescription(file) }}</p>
          <div class="role-page__card-meta">
            <el-tag v-if="file.meta?.type" :type="typeTagType(file.meta.type)" size="small">{{ file.meta.type }}</el-tag>
            <el-tag v-if="file.meta?.status" :type="statusTagType(file.meta.status)" size="small">{{ file.meta.status }}</el-tag>
            <el-tag v-if="file.meta?.lifecycle" :type="lifecycleTagType(file.meta.lifecycle)" size="small">{{ file.meta.lifecycle }}</el-tag>
            <el-tag v-if="file.meta?.review_cycle" :type="reviewCycleTagType(file.meta.review_cycle)" size="small">{{ file.meta.review_cycle }}</el-tag>
            <span class="role-page__card-size">{{ formatSize(file.size) }}</span>
          </div>
        </el-card>
      </div>
      <div v-if="!filesByDir[dir.id]?.length" class="role-page__empty-dir"><span>No files found in this area.</span></div>
      </template>
    </section>
    </template>

    <template v-else-if="viewMode === 'list'">
      <div class="role-page__list">
        <div v-for="row in filteredFiles" :key="row.file.path" class="role-page__list-row" @click="openFile(row.file)">
          <el-button class="role-page__list-delete" text type="danger" size="small" :icon="Delete" @click.stop="handleDelete(row.file)" />
          <span class="role-page__list-icon">{{ fileIcon(row.file) }}</span>
          <div class="role-page__list-main">
            <span class="role-page__list-title">{{ row.title }}</span>
            <span class="role-page__list-path">{{ filePathHint(row.file) }}</span>
          </div>
          <span class="role-page__list-domain" :style="{ color: row.domainColor }">
            <span>{{ row.domainIcon }}</span>
            <span>{{ row.domain }}</span>
          </span>
          <div class="role-page__list-tags">
            <el-tag v-if="row.file.meta?.type" :type="typeTagType(row.file.meta.type)" size="small">{{ row.file.meta.type }}</el-tag>
            <el-tag v-if="row.file.meta?.status" :type="statusTagType(row.file.meta.status)" size="small">{{ row.file.meta.status }}</el-tag>
            <el-tag v-if="row.file.meta?.lifecycle" :type="lifecycleTagType(row.file.meta.lifecycle)" size="small">{{ row.file.meta.lifecycle }}</el-tag>
          </div>
          <span class="role-page__list-size">{{ formatSize(row.file.size) }}</span>
        </div>
      </div>
      <div v-if="flatFiles.length && !filteredFiles.length" class="role-page__empty-dir">
        <span>No files match the current filters.</span>
      </div>
    </template>

    <template v-else>
      <el-table :data="filteredFiles" stripe border style="width: 100%" row-key="path" class="role-page__table">
        <el-table-column min-width="280" prop="title">
          <template #header>
            <div class="role-page__th">
              <span>Title</span>
              <el-input v-model="filters.title" size="small" placeholder="Search title..." clearable />
            </div>
          </template>
          <template #default="{ row }">
            <div class="role-page__table-item" @click="openFile(row.file)">
              <span class="role-page__table-icon">{{ fileIcon(row.file) }}</span>
              <div class="role-page__table-title-area">
                <span class="role-page__table-title">{{ row.title }}</span>
                <span class="role-page__table-path">{{ filePathHint(row.file) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="150" prop="domain">
          <template #header>
            <div class="role-page__th">
              <span>Domain</span>
              <el-input v-model="filters.domainText" size="small" placeholder="Search domain..." clearable />
            </div>
          </template>
          <template #default="{ row }">
            <span class="role-page__table-domain" :style="{ color: row.domainColor }">
              <span>{{ row.domainIcon }}</span>
              <span>{{ row.domain }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column width="130">
          <template #header>
            <div class="role-page__th">
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
            <div class="role-page__th">
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
            <div class="role-page__th">
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
            <div class="role-page__th">
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
            <span class="role-page__card-size">{{ formatSize(row.size) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="80" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="danger" @click="handleDelete(row.file)">Del</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="flatFiles.length && !filteredFiles.length" class="role-page__empty-dir">
        <span>No files match the current filters.</span>
      </div>
    </template>

      </div>
    </div>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="RoleKnowledgePage">
import { ref, computed, onMounted, nextTick, reactive } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import { scanKnowledge, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

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
const sectionRefs: Record<string, HTMLElement> = {};
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
  nextTick(() => sectionRefs[id]?.scrollIntoView({ behavior: "smooth", block: "start" }));
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

function filePathHint(file: KnowledgeFileEntry): string {
  return file.path.replace(new RegExp(`^${props.category}/`), '');
}

const STRUCTURAL_TAGS = computed(() => new Set([
  'leaf', 'index', 'moc', 'summary', 'template',
  props.category,
  ...props.subdirs.map(d => d.id),
  ...props.structuralTags
]));

function cardDescription(file: KnowledgeFileEntry): string {
  const tags = (file.meta?.tags ?? []).filter(t => !STRUCTURAL_TAGS.value.has(t));
  return tags.slice(0, 4).join(', ');
}

function fileIcon(file: KnowledgeFileEntry): string {
  const t = file.meta?.type;
  if (t === 'summary' || t === 'index') return '📖';
  if (t === 'template') return '📋';
  const tags = file.meta?.tags ?? [];
  if (tags.includes('journeys')) return '🚶';
  if (tags.includes('book')) return '📘';
  if (tags.includes('framework') || tags.includes('strategy')) return '📊';
  return '📄';
}

function typeTagType(t: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (t === 'summary' || t === 'index') return 'info';
  if (t === 'template') return 'warning';
  if (t === 'framework') return 'primary';
  return 'info';
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
  if (r === 'monthly') return 'warning';
  if (r === 'quarterly') return 'primary';
  if (r === 'half-yearly' || r === 'yearly') return 'info';
  return 'info';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
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
  } catch (e: any) {
    error.value = e?.message || "Unknown error";
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
.role-page__error { display: flex; align-items: center; gap: 12px; padding: 16px; margin-bottom: 20px; border-radius: 8px; background: var(--el-color-danger-light-9); color: var(--el-color-danger); font-size: 13px; }
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
.role-page__table { margin-bottom: 20px; }
.role-page__th { display: flex; flex-direction: column; gap: 6px; padding: 2px 0; }
.role-page__table-item { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; }
.role-page__table-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.role-page__table-title-area { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.role-page__table-title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); line-height: 1.3; word-break: break-word; }
.role-page__table-path { font-size: 11px; font-family: monospace; color: var(--el-text-color-placeholder); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.role-page__table-domain { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; }
.role-page__section { margin-bottom: 20px; }
.role-page__section-title { margin: 0 0 2px; padding-left: 10px; border-left: 3px solid var(--el-color-primary); font-size: 15px; font-weight: 600; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 4px; &:hover { opacity: 0.8; } }
.role-page__section-arrow { font-size: 12px; transition: transform 0.2s; display: inline-block; &.collapsed { transform: rotate(0deg); } &:not(.collapsed) { transform: rotate(90deg); } }
.role-page__section-desc { margin: 0 0 10px; padding-left: 13px; font-size: 12px; color: var(--el-text-color-secondary); }
.role-page__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; }
.role-page__card { border-radius: 10px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; position: relative; &:hover { transform: translateY(-2px); } :deep(.el-card__body) { padding: 14px; } }
.role-page__card-delete { position: absolute; top: 6px; right: 6px; opacity: 0; transition: opacity 0.2s; .role-page__card:hover & { opacity: 1; } }
.role-page__card-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 6px; }
.role-page__card-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.role-page__card-title-area { min-width: 0; }
.role-page__card-name { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.3; word-break: break-word; }
.role-page__card-path { display: block; margin-top: 2px; font-size: 11px; font-family: monospace; color: var(--el-text-color-placeholder); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.role-page__card-benefit { margin: 0 0 4px; font-size: 12px; line-height: 1.5; color: var(--el-color-warning); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.role-page__card-desc { margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.role-page__card-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.role-page__card-size { font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); }
// ── List view ──
.role-page__list { display: flex; flex-direction: column; gap: 6px; }
.role-page__list-row {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px; cursor: pointer; transition: box-shadow 0.2s; position: relative;
  &:hover { box-shadow: 0 2px 8px rgb(0 0 0 / 6%); }
}
.role-page__list-delete {
  position: absolute; top: 6px; right: 6px; opacity: 0; transition: opacity 0.2s;
  .role-page__list-row:hover & { opacity: 1; }
}
.role-page__list-icon { font-size: 18px; flex-shrink: 0; }
.role-page__list-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.role-page__list-title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); line-height: 1.3; word-break: break-word; }
.role-page__list-path { font-size: 11px; font-family: monospace; color: var(--el-text-color-placeholder); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.role-page__list-domain { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.role-page__list-tags { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.role-page__list-size { font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); flex-shrink: 0; }
.role-page__empty-dir { padding: 24px; text-align: center; font-size: 13px; color: var(--el-text-color-secondary); }
</style>
