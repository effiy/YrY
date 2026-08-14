<template>
  <div class="role-page">
    <header class="role-page__header">
      <h1>Tech Lead</h1>
      <p>
        {{ totalFiles }} files across {{ subdirs.length }} domains — architecture decisions,
        tech selection, capacity planning, risk management, and roadmap for technical leadership.
      </p>
    </header>

    <div class="role-page__controls">
      <div class="role-page__stats">
        <div v-for="dir in subdirs" :key="dir.id" class="role-page__stat-chip" :class="{ 'role-page__stat-chip--active': filters.domain.includes(dir.label) }" :style="{ background: (filters.domain.includes(dir.label) ? dir.color + '28' : dir.color + '18'), borderColor: (filters.domain.includes(dir.label) ? dir.color : dir.color + '40'), color: dir.color, cursor: 'pointer' }" @click="scrollTo(dir.id)">
          <span class="role-page__stat-chip-icon">{{ dir.icon }}</span>
          <span class="role-page__stat-chip-label">{{ dir.label }}</span>
          <span class="role-page__stat-chip-count">{{ fileCounts[dir.id] || 0 }}</span>
        </div>
      </div>
      <div class="role-page__toolbar">
        <span class="role-page__toolbar-label">View</span>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="card">Cards</el-radio-button>
          <el-radio-button value="table">Table</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <template v-if="viewMode === 'card'">
    <section v-for="dir in subdirs" :key="dir.id" class="role-page__section" :ref="(el: any) => sectionRefs[dir.id] = el">
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
        <el-table-column label="Actions" width="130" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openFile(row.file)">Open</el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row.file)">Del</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="leaderHub">
import { ref, computed, onMounted, nextTick, reactive } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import { scanKnowledge, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const subdirs = [
  { id: "architecture", icon: "🏛️", label: "Architecture", color: "#1677ff", desc: "Technical leadership architecture — maturity model assessments, architecture decision records, tech selection evaluations, and system coherence strategies." },
  { id: "decisions", icon: "📝", label: "Decisions (ADRs)", color: "#10b981", desc: "Architecture Decision Records organized by project — YiAi, YiVad, YiPet, FDE — documenting trade-offs, context, and rationale for key technical choices." },
  { id: "risk", icon: "⚠️", label: "Risk", color: "#ef4444", desc: "Risk management for tech leads — risk register, dependency risk assessment, outage communication protocols, and postmortem methodology." },
  { id: "capacity", icon: "📈", label: "Capacity", color: "#f59e0b", desc: "Capacity planning and cost management — FinOps reviews, cost overrun handling, dependency audits, and capacity trend tracking across YiAi, YiVad, YiPet." },
  { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#7c3aed", desc: "Technical roadmap planning — SLO definition, tech debt management, PoC evaluation, service decommissioning, feature deprecation, and quarterly roadmap reviews." }
];

const allFiles = ref<KnowledgeFileEntry[]>([]);
const sectionRefs: Record<string, HTMLElement> = {};
const collapsedSections = ref(new Set(subdirs.map(d => d.id)));
const viewMode = ref<"card" | "table">("table");

const filters = reactive({
  title: "",
  domain: [] as string[],
  domainText: "",
  type: "",
  status: "",
  lifecycle: "",
  review: ""
});

function scrollTo(id: string) {
  if (viewMode.value === "table") {
    const dir = subdirs.find(d => d.id === id);
    if (!dir) return;
    const idx = filters.domain.indexOf(dir.label);
    if (idx >= 0) filters.domain.splice(idx, 1);
    else filters.domain.push(dir.label);
    return;
  }
  if (collapsedSections.value.has(id)) toggleSection(id);
  nextTick(() => sectionRefs[id]?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function toggleSection(id: string) {
  const s = collapsedSections.value;
  if (s.has(id)) s.delete(id); else s.add(id);
  collapsedSections.value = new Set(s);
}

const totalFiles = computed(() => allFiles.value.length);
const filesByDir = computed<Record<string, KnowledgeFileEntry[]>>(() => {
  const map: Record<string, KnowledgeFileEntry[]> = {};
  for (const dir of subdirs) map[dir.id] = [];
  for (const f of allFiles.value) {
    const dirName = f.path.replace(/^leader\//, "").split("/")[0];
    if (map[dirName]) map[dirName].push(f);
  }
  for (const dir of subdirs) map[dir.id].sort(compareByMaturity);
  return map;
});

const flatFiles = computed(() => {
  const rows: Array<{ file: KnowledgeFileEntry; path: string; name: string; title: string; size: number; domain: string; domainIcon: string; domainColor: string }> = [];
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
  for (const dir of subdirs) counts[dir.id] = (filesByDir.value[dir.id] || []).length;
  return counts;
});

function filePathHint(file: KnowledgeFileEntry): string {
  return file.path.replace(/^leader\//, '');
}

const STRUCTURAL_TAGS = new Set([
  'leaf', 'index', 'moc', 'summary', 'template',
  'architecture', 'decisions', 'risk', 'capacity', 'roadmap', 'leader',
  'yivad', 'yiai', 'yipet', 'adr',
]);

function cardDescription(file: KnowledgeFileEntry): string {
  const tags = (file.meta?.tags ?? []).filter(t => !STRUCTURAL_TAGS.has(t));
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
  try {
    const res = await scanKnowledge("leader");
    allFiles.value = res.categories?.flatMap(c => c.files) ?? [];
  } catch { allFiles.value = []; }
}
onMounted(loadFiles);
</script>

<style scoped lang="scss">
.role-page { display: flex; flex-direction: column; box-sizing: border-box; padding: 20px 24px; background: var(--el-bg-color-page); }
.role-page__header { margin-bottom: 14px; h1 { margin: 0 0 4px; font-size: 20px; font-weight: 700; } p { margin: 0; font-size: 13px; color: var(--el-text-color-secondary); line-height: 1.6; } }
.role-page__controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.role-page__stats { display: flex; flex-wrap: wrap; gap: 8px; }
.role-page__stat-chip { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1px solid; transition: background .2s, border-color .2s, box-shadow .2s; }
.role-page__stat-chip--active { box-shadow: 0 0 0 1px currentColor; }
.role-page__stat-chip-icon { font-size: 14px; } .role-page__stat-chip-count { font-size: 11px; opacity: 0.7; margin-left: 2px; }
.role-page__toolbar { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.role-page__toolbar-label { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .3px; }
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
.role-page__empty-dir { padding: 24px; text-align: center; font-size: 13px; color: var(--el-text-color-secondary); }
</style>