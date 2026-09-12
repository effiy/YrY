<template>
  <div class="kt" v-loading="loading">
    <PageHeaderCard
      :icon-bg="role.iconBg"
      :title="role.title"
      :description="role.description"
      :pills="[
        { label: `${role.domainsWord}`, value: subdirs.length },
        { label: 'files', value: totalCount },
      ]"
    />

    <div class="kt__body">
      <ProTable
        ref="proTable"
        title=""
        :columns="columns"
        :request-api="fetchData"
        :pagination="true"
      >
        <template #tableHeader>
          <div class="kt__filters">
            <el-select v-model="domainFilter" placeholder="Domain" clearable size="small" style="width: 140px" @change="refreshTable">
              <el-option v-for="d in subdirs" :key="d.id" :label="d.label" :value="d.id" />
            </el-select>
            <el-select v-model="typeFilter" placeholder="Type" clearable size="small" style="width: 120px" @change="refreshTable">
              <el-option v-for="t in allTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="Status" clearable size="small" style="width: 120px" @change="refreshTable">
              <el-option v-for="s in allStatuses" :key="s" :label="s" :value="s" />
            </el-select>
          </div>
        </template>

        <template #domain="scope">
          <span class="kt__domain" :style="{ color: getDomainColor(scope.row._domain) }">
            {{ getDomainIcon(scope.row._domain) }} {{ getDomainLabel(scope.row._domain) }}
          </span>
        </template>

        <template #title="scope">
          <span class="kt__title" @click="openFile(scope.row)">{{ scope.row.name }}</span>
        </template>

        <template #type="scope">
          <el-tag v-if="scope.row.meta?.type" :type="tagType('type', scope.row.meta.type)" size="small">{{ scope.row.meta.type }}</el-tag>
        </template>

        <template #status="scope">
          <el-tag v-if="scope.row.meta?.status" :type="tagType('status', scope.row.meta.status)" size="small">{{ scope.row.meta.status }}</el-tag>
        </template>

        <template #lifecycle="scope">
          <el-tag v-if="scope.row.meta?.lifecycle" :type="tagType('lifecycle', scope.row.meta.lifecycle)" size="small">{{ scope.row.meta.lifecycle }}</el-tag>
        </template>

        <template #review="scope">
          <el-tag v-if="scope.row.meta?.review_cycle" :type="tagType('review', scope.row.meta.review_cycle)" size="small">{{ scope.row.meta.review_cycle }}</el-tag>
        </template>

        <template #size="scope">
          <span class="kt__size">{{ formatSize(scope.row.size) }}</span>
        </template>

        <template #operation="scope">
          <el-button link size="small" type="primary" @click="openFile(scope.row)">Open</el-button>
          <el-button link size="small" type="danger" @click="handleDelete(scope.row)">Del</el-button>
        </template>
      </ProTable>
    </div>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="KnowledgeTable">
import { ref, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { scanKnowledge, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import { PageHeaderCard, ProTable } from "@/components";
import type { ColumnProps, ProTableInstance } from "@/components";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

interface Subdir { id: string; icon: string; label: string; color: string; desc: string }
interface RoleConfig { title: string; domainsWord: string; description: string; iconBg: string; subdirs: Subdir[] }

const ROLE_CONFIG: Record<string, RoleConfig> = {
  aier: {
    title: "AI Engineer", iconBg: "linear-gradient(135deg, #1677ff, #0958d9)",
    domainsWord: "knowledge areas",
    description: "AI foundations, methodology, platform, data, and ML ops for building effective AI systems.",
    subdirs: [
      { id: "foundations", icon: "🧠", label: "Foundations", color: "#1677ff", desc: "" },
      { id: "methodology", icon: "📐", label: "Methodology", color: "#10b981", desc: "" },
      { id: "platform", icon: "🖥️", label: "Platform", color: "#7c3aed", desc: "" },
      { id: "data", icon: "📊", label: "Data", color: "#f59e0b", desc: "" },
      { id: "ml", icon: "⚙️", label: "ML Ops", color: "#ef4444", desc: "" },
    ]
  },
  executiver: {
    title: "Executive", iconBg: "linear-gradient(135deg, #ef4444, #dc2626)",
    domainsWord: "domains",
    description: "Strategy, industry analysis, roadmap planning, and reading list for executive decision-making.",
    subdirs: [
      { id: "strategy", icon: "🎯", label: "Strategy", color: "#ef4444", desc: "" },
      { id: "industry", icon: "🏭", label: "Industry", color: "#1677ff", desc: "" },
      { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#10b981", desc: "" },
      { id: "reading-list", icon: "📚", label: "Reading List", color: "#7c3aed", desc: "" },
    ]
  },
  engineer: {
    title: "Engineer", iconBg: "linear-gradient(135deg, #1677ff, #0958d9)",
    domainsWord: "phases",
    description: "Build, Ship, Run, Learn — covering the full design → deploy → operate → learn lifecycle.",
    subdirs: [
      { id: "build", icon: "🏗️", label: "Build", color: "#1677ff", desc: "" },
      { id: "ship", icon: "🚀", label: "Ship", color: "#10b981", desc: "" },
      { id: "run", icon: "🏃", label: "Run", color: "#8b5cf6", desc: "" },
      { id: "learn", icon: "📖", label: "Learn", color: "#ec4899", desc: "" },
    ]
  },
  curator: {
    title: "Curator", iconBg: "linear-gradient(135deg, #10b981, #059669)",
    domainsWord: "domains",
    description: "Governance, templates, diagrams, and archive for the knowledge base lifecycle.",
    subdirs: [
      { id: "governance", icon: "⚖️", label: "Governance", color: "#1677ff", desc: "" },
      { id: "templates", icon: "📝", label: "Templates", color: "#10b981", desc: "" },
      { id: "diagrams", icon: "📊", label: "Diagrams", color: "#7c3aed", desc: "" },
      { id: "archive", icon: "🗄️", label: "Archive", color: "#f59e0b", desc: "" },
    ]
  },
  leader: {
    title: "Tech Lead", iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
    domainsWord: "domains",
    description: "Architecture decisions, tech selection, capacity planning, risk management, and roadmap.",
    subdirs: [
      { id: "architecture", icon: "🏛️", label: "Architecture", color: "#1677ff", desc: "" },
      { id: "decisions", icon: "📝", label: "Decisions (ADRs)", color: "#10b981", desc: "" },
      { id: "risk", icon: "⚠️", label: "Risk", color: "#ef4444", desc: "" },
      { id: "capacity", icon: "📈", label: "Capacity", color: "#f59e0b", desc: "" },
      { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#7c3aed", desc: "" },
    ]
  },
  producter: {
    title: "Product Manager", iconBg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    domainsWord: "problem domains",
    description: "Frameworks, discovery, delivery, strategy, and projects for product management.",
    subdirs: [
      { id: "frameworks", icon: "🧩", label: "Frameworks", color: "#1677ff", desc: "" },
      { id: "discovery", icon: "🔍", label: "Discovery", color: "#10b981", desc: "" },
      { id: "delivery", icon: "🚀", label: "Delivery", color: "#7c3aed", desc: "" },
      { id: "strategy", icon: "🎯", label: "Strategy", color: "#ef4444", desc: "" },
      { id: "projects", icon: "📦", label: "Projects", color: "#f59e0b", desc: "" },
    ]
  },
  srer: {
    title: "SRE", iconBg: "linear-gradient(135deg, #ef4444, #dc2626)",
    domainsWord: "problem domains",
    description: "Incident response, observability, and release management for production reliability.",
    subdirs: [
      { id: "incident-response", icon: "🚨", label: "Incident Response", color: "#ef4444", desc: "" },
      { id: "observability", icon: "📊", label: "Observability", color: "#1677ff", desc: "" },
      { id: "release", icon: "🚀", label: "Release", color: "#10b981", desc: "" },
    ]
  },
};

const props = defineProps<{ category: string }>();
const role = ROLE_CONFIG[props.category] ?? ROLE_CONFIG.engineer;
const subdirs = role.subdirs;

const proTable = ref<ProTableInstance>();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const loading = ref(false);
const allFiles = ref<(KnowledgeFileEntry & { _domain: string })[]>([]);

const domainFilter = ref("");
const typeFilter = ref("");
const statusFilter = ref("");

const totalCount = computed(() => allFiles.value.length);

const allTypes = computed(() => {
  const s = new Set(allFiles.value.map(f => f.meta?.type).filter(Boolean) as string[]);
  return [...s].sort();
});

const allStatuses = computed(() => {
  const s = new Set(allFiles.value.map(f => f.meta?.status).filter(Boolean) as string[]);
  return [...s].sort();
});

function getFilteredFiles() {
  let list = allFiles.value;
  if (domainFilter.value) list = list.filter(f => f._domain === domainFilter.value);
  if (typeFilter.value) list = list.filter(f => f.meta?.type === typeFilter.value);
  if (statusFilter.value) list = list.filter(f => f.meta?.status === statusFilter.value);
  return list;
}

async function fetchData(params: { pageNum: number; pageSize: number }) {
  const filtered = getFilteredFiles();
  const start = (params.pageNum - 1) * params.pageSize;
  return { data: { list: filtered.slice(start, start + params.pageSize), total: filtered.length } };
}

const columns: ColumnProps[] = [
  { prop: "domain", label: "Domain", width: 150 },
  { prop: "title", label: "Title", minWidth: 280 },
  { prop: "type", label: "Type", width: 110 },
  { prop: "status", label: "Status", width: 110 },
  { prop: "lifecycle", label: "Lifecycle", width: 120 },
  { prop: "review", label: "Review", width: 120 },
  { prop: "size", label: "Size", width: 90 },
  { prop: "operation", label: "Actions", width: 120, fixed: "right" as const },
];

const SUBDIR_MAP = computed(() => {
  const m: Record<string, Subdir> = {};
  for (const d of subdirs) m[d.id] = d;
  return m;
});

function getDomainLabel(id: string) { return SUBDIR_MAP.value[id]?.label || id; }
function getDomainIcon(id: string) { return SUBDIR_MAP.value[id]?.icon || "📄"; }
function getDomainColor(id: string) { return SUBDIR_MAP.value[id]?.color || "#909399"; }

const TAG_STYLE: Record<string, Record<string, string>> = {
  type: { summary: "info", index: "info", template: "warning", framework: "primary" },
  status: { stable: "success", active: "success", evolving: "primary", draft: "warning", deprecated: "danger", archived: "danger" },
  lifecycle: { stable: "success", active: "primary", evolving: "primary", draft: "warning", "in-review": "warning", deprecated: "danger" },
  review: { monthly: "warning", quarterly: "primary" },
};

function tagType(kind: string, val: string): "success" | "warning" | "info" | "primary" | "danger" {
  return (TAG_STYLE[kind]?.[val] || "info") as "success" | "warning" | "info" | "primary" | "danger";
}

function formatSize(bytes: number): string {
  if (!bytes) return "—";
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
    allFiles.value = allFiles.value.filter(f => f.path !== file.path);
    ElMessage.success("File deleted");
    refreshTable();
  } catch (e) {
    console.error("Delete failed:", e);
    ElMessage.error("Failed to delete file");
  }
}

function refreshTable() { proTable.value?.getTableList(); }

function getDomain(file: KnowledgeFileEntry): string {
  const after = file.path.replace(new RegExp(`^${props.category}/`), "");
  return after.split("/")[0] || "";
}

async function loadData() {
  loading.value = true;
  try {
    const res = await scanKnowledge(props.category);
    const files = (res.categories?.flatMap(c => c.files) ?? []).filter(f => f.meta?.type !== "rss");
    allFiles.value = files.map(f => ({ ...f, _domain: getDomain(f) }));
    await nextTick();
    refreshTable();
  } catch (e) {
    console.error("Load knowledge files failed:", e);
    allFiles.value = [];
  } finally { loading.value = false; }
}

onMounted(() => { loadData(); });
</script>

<style scoped lang="scss">
.kt { padding: 24px; background: var(--el-bg-color-page); }
.kt__body { margin-top: 16px; }
.kt__filters { display: flex; gap: 8px; }
.kt__title { color: var(--el-color-primary); cursor: pointer; }
.kt__domain { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; }
.kt__size { font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); }
</style>