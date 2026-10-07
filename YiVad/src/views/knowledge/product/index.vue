<template>
  <div class="product-page" v-loading="loading">
    <!-- Stats Header -->
    <header class="product-page__header">
      <div class="product-page__title-row">
        <div>
          <h1 class="product-page__title">Product Manager</h1>
          <p class="product-page__subtitle">
            Stage 1 of the delivery pipeline — frameworks, discovery, delivery, strategy, and projects for product management.
          </p>
        </div>
        <div class="product-page__header-actions">
          <span class="product-page__updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="loadFiles" :loading="loading">Refresh</el-button>
        </div>
      </div>

      <div class="product-page__stats">
        <div
          v-for="card in statsCards"
          :key="card.key"
          class="product-stat"
          :class="{ 'product-stat--clickable': !!card.onClick }"
          @click="card.onClick?.()"
        >
          <span class="product-stat__value" :style="{ color: card.color }">{{ card.value }}</span>
          <span class="product-stat__label">{{ card.label }}</span>
          <span v-if="card.sub" class="product-stat__sub">{{ card.sub }}</span>
        </div>
      </div>
    </header>

    <!-- Pipeline Context Bar -->
    <div class="product-pipeline">
      <span class="product-pipeline__label">Delivery Pipeline</span>
      <div class="product-pipeline__stages">
        <div
          v-for="stage in pipelineStages"
          :key="stage.key"
          class="product-pipeline__stage"
          :class="{
            'is-active': stage.key === 'product',
            'is-before': stage.before
          }"
        >
          <span class="product-pipeline__stage-icon">{{ stage.icon }}</span>
          <span class="product-pipeline__stage-name">{{ stage.label }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Reference -->
    <div class="product-quickref">
      <span class="product-quickref__label">Quick Reference</span>
      <div class="product-quickref__chips">
        <el-tooltip
          v-for="qr in quickRefs"
          :key="qr.label"
          :content="qr.desc"
          placement="bottom"
          :show-after="300"
        >
          <button class="product-quickref__chip" @click="openQuickRef(qr.filePath)">
            <span>{{ qr.icon }}</span>
            <span>{{ qr.label }}</span>
          </button>
        </el-tooltip>
      </div>
    </div>

    <!-- Error State -->
    <KnowledgeError v-if="error" :message="error" @retry="loadFiles" />

    <!-- Main Body -->
    <template v-else>
      <div class="product-page__body">
        <nav
          class="product-page__sidebar"
          v-sticky="{
            top: 96,
            zIndex: 18,
            activeClass: 'is-stuck'
          }"
        >
          <div class="product-page__sidebar-view">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="card">Cards</el-radio-button>
              <el-radio-button value="list">List</el-radio-button>
              <el-radio-button value="table">Table</el-radio-button>
            </el-radio-group>
          </div>
          <button
            v-for="dir in subdirs"
            :key="dir.id"
            class="product-page__sidebar-item"
            :class="{
              'is-active': viewMode === 'table'
                ? filters.domain.includes(dir.label)
                : cardActiveDomain === dir.id
            }"
            @click="scrollTo(dir)"
          >
            <span class="product-page__sidebar-icon">{{ dir.icon }}</span>
            <div class="product-page__sidebar-info">
              <span class="product-page__sidebar-label">{{ dir.label }}</span>
              <span class="product-page__sidebar-detail">
                <span class="product-page__sidebar-stable">{{ getStableCount(dir.id) }}</span>
                <span v-if="getDraftCount(dir.id)" class="product-page__sidebar-draft">{{ getDraftCount(dir.id) }} draft</span>
              </span>
            </div>
            <span class="product-page__sidebar-badge">{{ fileCounts[dir.id] || 0 }}</span>
          </button>
        </nav>

        <div class="product-page__content">
          <RoleCardView
            v-if="viewMode === 'card'"
            :subdirs="subdirs"
            :files-by-dir="filesByDir"
            :collapsed-sections="collapsedSections"
            :category="'product'"
            :structural-tags="structuralTags"
            @open="openFile"
            @delete="handleDelete"
            @toggle-section="toggleSection"
          />
          <RoleListView
            v-else-if="viewMode === 'list'"
            :files="filteredFiles"
            :total-count="flatFiles.length"
            :category="'product'"
            @open="openFile"
            @delete="handleDelete"
          />
          <RoleTableView
            v-else
            :files="filteredFiles"
            :total-count="flatFiles.length"
            :filters="filters"
            :category="'product'"
            @open="openFile"
            @delete="handleDelete"
          />
        </div>
      </div>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="ProductManagerPage">
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { confirm } from "@/hooks/useConfirmAction";
import { Refresh } from "@element-plus/icons-vue";
import { listKnowledgeFiles, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import KnowledgeError from "../components/KnowledgeError.vue";
import RoleCardView from "../components/RoleCardView.vue";
import RoleListView from "../components/RoleListView.vue";
import RoleTableView from "../components/RoleTableView.vue";
import { timeAgo } from "@/utils/time";

interface Subdir {
  id: string;
  icon: string;
  label: string;
  color: string;
  desc: string;
}

const subdirs: Subdir[] = [
  {
    id: "frameworks",
    icon: "🧩",
    label: "Frameworks",
    color: "#1677ff",
    desc: "PM frameworks — RICE/ICE prioritization, MoSCoW, JTBD, Kano model, story mapping, OKR design, OST, lean startup."
  },
  {
    id: "discovery",
    icon: "🔍",
    label: "Discovery",
    color: "#10b981",
    desc: "User research & discovery — PRD writing, data-driven decisions, personas, user interviews, UX checklists, metrics."
  },
  {
    id: "delivery",
    icon: "🚀",
    label: "Delivery",
    color: "#7c3aed",
    desc: "Sprint execution — sprint rituals, release checklists, stakeholder communication, beta testing, cross-project coordination."
  },
  {
    id: "strategy",
    icon: "🎯",
    label: "Strategy",
    color: "#ef4444",
    desc: "Product strategy — AI case studies, competitive analysis, roadmap design, PMF validation, feature adoption strategy."
  },
  {
    id: "projects",
    icon: "📦",
    label: "Projects",
    color: "#f59e0b",
    desc: "Per-project PM — YiAi, YiVad, YiPet project coordination, iteration planning, stakeholder visibility."
  }
];

const structuralTags = ["product", "product-management", "yivad", "yiai", "yipet"];

const quickRefs = [
  { label: "RICE/ICE", icon: "📊", desc: "RICE/ICE scoring for feature prioritization", filePath: "product/frameworks/06-框架-RICE-ICE优先级.md" },
  { label: "MoSCoW", icon: "🎯", desc: "MoSCoW four-category prioritization", filePath: "product/frameworks/04-框架-MoSCoW优先级.md" },
  { label: "JTBD", icon: "📋", desc: "Jobs-to-Be-Done framework", filePath: "product/frameworks/02-框架-JTBD框架摘要.md" },
  { label: "Kano", icon: "📈", desc: "Kano model for feature classification", filePath: "product/frameworks/03-框架-Kano模型摘要.md" },
  { label: "PRD", icon: "📝", desc: "PRD writing complete guide", filePath: "product/discovery/01-发现-编写PRD.md" },
  { label: "OKR", icon: "🎯", desc: "OKR design principles and anti-patterns", filePath: "product/frameworks/05-框架-OKR设计摘要.md" },
  { label: "Sprint", icon: "🔄", desc: "Sprint management — five rituals", filePath: "product/delivery/01-交付-运作Sprint.md" },
  { label: "Story Map", icon: "🗺️", desc: "User story mapping method", filePath: "product/frameworks/07-框架-用户故事地图.md" },
];

const pipelineStages = [
  { key: "product", label: "Requirements", icon: "📦", before: false },
  { key: "leader", label: "Decisions", icon: "🏛️", before: false },
  { key: "engineer", label: "Design+Build", icon: "🏗️", before: false },
  { key: "sre", label: "Delivery+Quality", icon: "🛡️", before: false },
  { key: "sre", label: "Operate+Learn", icon: "🔄", before: false },
];

const { t } = useI18n();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const allFiles = ref<KnowledgeFileEntry[]>([]);
const loading = ref(false);
const error = ref("");
const viewMode = ref<"card" | "list" | "table">("table");
const cardActiveDomain = ref<string | null>(null);
const collapsedSections = ref(new Set(subdirs.slice(1).map(d => d.id)));

const filters = reactive({
  title: "",
  domain: [] as string[],
  domainText: "",
  type: "",
  status: "",
  lifecycle: "",
  review: ""
});

// Derive domain from file path (product/{domain}/filename.md)
function fileDomain(f: KnowledgeFileEntry): Subdir | undefined {
  const relative = f.path.replace(/^product\//, "");
  const dirName = relative.split("/")[0];
  return subdirs.find(d => d.id === dirName);
}

const filesByDir = computed<Record<string, KnowledgeFileEntry[]>>(() => {
  const map: Record<string, KnowledgeFileEntry[]> = {};
  for (const dir of subdirs) map[dir.id] = [];
  for (const f of allFiles.value) {
    const dir = fileDomain(f);
    if (dir) map[dir.id].push(f);
  }
  for (const dir of subdirs) map[dir.id].sort(compareByMaturity);
  return map;
});

const fileCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {};
  for (const dir of subdirs) counts[dir.id] = filesByDir.value[dir.id]?.length ?? 0;
  return counts;
});

function getStableCount(dirId: string): string {
  const files = filesByDir.value[dirId] || [];
  const stable = files.filter(f => f.meta?.status === "stable" || f.meta?.status === "active").length;
  return `${stable} stable`;
}

function getDraftCount(dirId: string): number {
  const files = filesByDir.value[dirId] || [];
  return files.filter(f => f.meta?.status === "draft").length;
}

const flatFiles = computed(() => {
  const rows: Array<{
    file: KnowledgeFileEntry;
    path: string;
    name: string;
    title: string;
    size: number;
    domain: string;
    domainIcon: string;
    domainColor: string;
  }> = [];
  for (const dir of subdirs) {
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
    if (ft && !row.title.toLowerCase().includes(ft) && !(row.file.meta?.title || "").toLowerCase().includes(ft)) return false;
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
const LIFECYCLE_ORDER: Record<string, number> = { active: 0, evolving: 1, draft: 2, "in-review": 2, deprecated: 3 };

function compareByMaturity(a: KnowledgeFileEntry, b: KnowledgeFileEntry): number {
  const sa = STATUS_ORDER[a.meta?.status ?? ""] ?? 99;
  const sb = STATUS_ORDER[b.meta?.status ?? ""] ?? 99;
  if (sa !== sb) return sa - sb;
  const la = LIFECYCLE_ORDER[a.meta?.lifecycle ?? ""] ?? 99;
  const lb = LIFECYCLE_ORDER[b.meta?.lifecycle ?? ""] ?? 99;
  if (la !== lb) return la - lb;
  return a.name.localeCompare(b.name);
}

// Stats
const statsCards = computed(() => {
  const files = allFiles.value;
  const total = files.length;
  const stable = files.filter(f => f.meta?.status === "stable" || f.meta?.status === "active").length;
  const draft = files.filter(f => f.meta?.status === "draft").length;
  const withReview = files.filter(f => f.meta?.review_cycle).length;
  const reviewPct = total > 0 ? Math.round((withReview / total) * 100) : 0;
  const timestamps = files.map(f => f.updatedAt).filter(Boolean) as number[];
  const latest = timestamps.length > 0 ? Math.max(...timestamps) : null;

  return [
    {
      key: "total",
      value: total,
      label: "Knowledge Files",
      sub: `${subdirs.length} domains`,
      color: "#1677ff",
    },
    {
      key: "stable",
      value: stable,
      label: "Stable / Active",
      sub: total > 0 ? `${Math.round((stable / total) * 100)}%` : "—",
      color: "#10b981",
    },
    {
      key: "draft",
      value: draft,
      label: "Drafts",
      sub: total > 0 ? `${Math.round((draft / total) * 100)}%` : "—",
      color: "#f59e0b",
      onClick: draft > 0 ? () => { filters.status = "draft"; } : undefined,
    },
    {
      key: "review",
      value: `${reviewPct}%`,
      label: "Review Coverage",
      sub: `${withReview} of ${total} files`,
      color: reviewPct >= 80 ? "#10b981" : reviewPct >= 50 ? "#f59e0b" : "#ef4444",
    },
    {
      key: "updated",
      value: latest ? timeAgo(latest) : "—",
      label: "Last Updated",
      sub: latest ? formatDate(latest) : "No data",
      color: "#7c3aed",
    },
  ];
});

const lastUpdated = computed(() => {
  const timestamps = allFiles.value.map(f => f.updatedAt).filter(Boolean) as number[];
  if (timestamps.length === 0) return "";
  return fmtAgo(Math.max(...timestamps));
});

const fmtAgo = (ts: number): string => timeAgo(ts);

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Actions
function scrollTo(dir: Subdir) {
  if (viewMode.value === "table" || viewMode.value === "list") {
    const idx = filters.domain.indexOf(dir.label);
    if (idx >= 0) filters.domain.splice(idx, 1);
    else filters.domain.push(dir.label);
    return;
  }
  cardActiveDomain.value = cardActiveDomain.value === dir.id ? null : dir.id;
  if (collapsedSections.value.has(dir.id)) toggleSection(dir.id);
}

function toggleSection(id: string) {
  const s = new Set(collapsedSections.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  collapsedSections.value = s;
}

function openFile(file: KnowledgeFileEntry) {
  previewDlg.value?.open(file.path);
}

function openQuickRef(filePath: string) {
  previewDlg.value?.open(filePath);
}

async function handleDelete(file: KnowledgeFileEntry) {
  const ok = await confirm(
    t("knowledge.common.deleteFileConfirm", { path: file.path }),
    t("knowledge.common.deleteFileTitle")
  );
  if (!ok) return;
  try {
    await deleteKnowledgeFile(file.path);
    ElMessage.success(t("knowledge.common.fileDeleted"));
    allFiles.value = allFiles.value.filter(f => f.path !== file.path);
  } catch {
    ElMessage.error(t("knowledge.common.fileDeleteFailed"));
  }
}

async function loadFiles() {
  loading.value = true;
  error.value = "";
  try {
    const res = await listKnowledgeFiles("product");
    allFiles.value = (res.files ?? []).filter(f => f.meta?.type !== "rss");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load product knowledge files";
    allFiles.value = [];
  } finally {
    loading.value = false;
  }
}

// Reset table filters when switching away from table/list mode
watch(viewMode, (mode) => {
  if (mode === "card") {
    filters.title = "";
    filters.domain = [];
    filters.domainText = "";
    filters.type = "";
    filters.status = "";
    filters.lifecycle = "";
    filters.review = "";
  }
});

onMounted(loadFiles);
</script>

<style scoped lang="scss">
.product-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  background: var(--el-bg-color-page);
}

// ── Header ──
.product-page__header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 20px 24px;
}
.product-page__title-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
.product-page__title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.product-page__subtitle {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  max-width: 600px;
}
.product-page__header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
.product-page__updated {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

// ── Stats Row ──
.product-page__stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.product-stat {
  text-align: center;
  padding: 14px 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  transition: background 0.15s;
  &--clickable {
    cursor: pointer;
    &:hover {
      background: var(--el-fill-color-light);
    }
  }
}
.product-stat__value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.product-stat__label {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.product-stat__sub {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

// ── Pipeline Bar ──
.product-pipeline {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.product-pipeline__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.product-pipeline__stages {
  display: flex;
  gap: 0;
  flex: 1;
}
.product-pipeline__stage {
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-lighter);
  border-right: 2px solid var(--el-border-color-lighter);
  transition: all 0.2s;
  &:first-child {
    border-radius: 6px 0 0 6px;
  }
  &:last-child {
    border-right: none;
    border-radius: 0 6px 6px 0;
  }
  &.is-active {
    font-weight: 700;
    color: #fff;
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}
.product-pipeline__stage-icon {
  font-size: 14px;
}
.product-pipeline__stage-name {
  white-space: nowrap;
}

// ── Quick Reference ──
.product-quickref {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.product-quickref__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.product-quickref__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.product-quickref__chip {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid transparent;
  border-radius: 16px;
  transition: all 0.18s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    transform: translateY(-1px);
  }
}

// ── Body + Sidebar ──
.product-page__body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.product-page__sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  width: 200px;
  padding: 10px 10px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  &.is-stuck {
    border-color: color-mix(in srgb, var(--el-border-color) 70%, transparent);
    box-shadow:
      0 8px 24px -10px rgb(0 0 0 / 12%),
      0 2px 6px rgb(0 0 0 / 4%);
    transform: translateY(-2px);
  }
}
.product-page__sidebar-item {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition: all 0.15s;
  &:hover {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }
  &.is-active {
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}
.product-page__sidebar-icon {
  flex-shrink: 0;
  font-size: 18px;
}
.product-page__sidebar-info {
  flex: 1;
  min-width: 0;
}
.product-page__sidebar-label {
  display: block;
  font-size: 13px;
  line-height: 1.3;
}
.product-page__sidebar-detail {
  display: block;
  margin-top: 1px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.product-page__sidebar-stable {
  color: var(--el-color-success);
}
.product-page__sidebar-draft {
  margin-left: 6px;
  color: var(--el-color-warning);
}
.product-page__sidebar-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 10px;
  .product-page__sidebar-item.is-active & {
    color: #fff;
    background: var(--el-color-primary);
  }
}
.product-page__sidebar-view {
  padding: 4px 8px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) {
    display: flex;
    width: 100%;
  }
  :deep(.el-radio-button) {
    flex: 1;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 4px 0;
    font-size: 12px;
    text-align: center;
  }
}
.product-page__content {
  flex: 1;
  min-width: 0;
}
</style>