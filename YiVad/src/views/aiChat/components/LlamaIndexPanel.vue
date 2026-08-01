<script setup lang="ts" name="aiChatLlamaIndexPanel">
/**
 * RAG Console — per-conversation retrieval-augmented generation.
 *
 * All queries are scoped to the conversation's ctx:-tagged context files.
 * Two modules: Query (semantic search) and Index (file list + rebuild).
 */
import { ref, computed } from "vue";
import { Refresh, Search, DataAnalysis, Cpu, Collection, FolderOpened, Document } from "@element-plus/icons-vue";
import { ragStatus, ragBuild, ragQuery } from "@/api/modules/ragService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";
import type { RagStatusResponse, RagSource } from "@/api/interface/rag";

const props = withDefaults(
  defineProps<{ scopeFiles?: string[]; scopeTitle?: string }>(),
  { scopeFiles: () => [], scopeTitle: "" }
);

const emit = defineEmits<{ (e: "close"): void }>();

// ── Tabs ──
type Tab = "query" | "index";
const activeTab = ref<Tab>("query");

// ── Scope ──
const hasScope = computed(() => props.scopeFiles.length > 0);

const derivedScope = computed(() => {
  if (!props.scopeFiles.length) return "";
  if (props.scopeFiles.length === 1) return props.scopeFiles[0];
  const parts = props.scopeFiles.map((p: string) => p.split("/"));
  const minLen = Math.min(...parts.map((p: string[]) => p.length));
  const common: string[] = [];
  for (let i = 0; i < minLen; i++) {
    if (parts.every((p: string[]) => p[i] === parts[0][i])) common.push(parts[0][i]);
    else break;
  }
  return common.join("/") || "";
});

// ── Context file info ──
interface ScopeFileInfo { path: string; name: string; dir: string }
const scopeFileInfos = computed<ScopeFileInfo[]>(() =>
  props.scopeFiles.map((p: string) => {
    const parts = p.split("/");
    return { path: p, name: parts.pop() || p, dir: parts.join("/") || "root" };
  })
);

// ── Index status ──
const status = ref<RagStatusResponse | null>(null);
const building = ref(false);

async function loadStatus() {
  try { status.value = await ragStatus(); } catch { /* ignore */ }
}
async function doRebuild() {
  building.value = true;
  try { await ragBuild(); await loadStatus(); } finally { building.value = false; }
}

// ── Query ──
const queryText = ref("");
const queryTopK = ref(4);
const queryLoading = ref(false);
const queryError = ref("");
const querySources = ref<RagSource[]>([]);
const queryLatency = ref(0);

async function doQuery() {
  const q = queryText.value.trim();
  if (!q) return;
  queryLoading.value = true; queryError.value = ""; querySources.value = [];
  const t0 = performance.now();
  try {
    const scope = derivedScope.value || undefined;
    const res = await ragQuery({ question: q, top_k: queryTopK.value, ...(scope ? { scope } : {}) });
    querySources.value = res.sources ?? [];
    queryLatency.value = Math.round(performance.now() - t0);
  } catch (e: any) {
    queryError.value = e?.message || "Query failed";
    queryLatency.value = Math.round(performance.now() - t0);
  } finally { queryLoading.value = false; }
}

function scorePercent(s: number): string { return `${(s * 100).toFixed(0)}%`; }
function scoreLevel(s: number): string { return s >= 0.7 ? "high" : s >= 0.4 ? "mid" : "low"; }
function scoreWidth(s: number): string { return `${Math.round(s * 100)}%`; }

// ── File preview ──
const { render } = useMarkdown();
const filePreview = ref({ visible: false, title: "", loading: false, html: "" });

async function openFilePreview(path: string) {
  filePreview.value = { visible: true, title: path.split("/").pop() || path, loading: true, html: "" };
  try {
    const res = await readKnowledgeFile(path);
    filePreview.value.html = render(res.content || "");
  } catch {
    filePreview.value.html = "<p style='color:var(--el-color-danger)'>Failed to load.</p>";
  } finally {
    filePreview.value.loading = false;
  }
}

// ── Lifecycle ──
loadStatus();
</script>

<template>
  <el-dialog
    :model-value="true"
    :title="scopeTitle ? `RAG — ${scopeTitle}` : 'RAG Console'"
    width="900px" top="2vh"
    append-to-body :close-on-click-modal="false"
    @close="emit('close')"
  >
    <!-- Context bar -->
    <div class="rag-ctx" :class="{ 'rag-ctx--empty': !hasScope }">
      <div class="rag-ctx-hd">
        <el-icon><Collection /></el-icon>
        <span class="rag-ctx-count">{{ scopeFiles.length }} context file(s)</span>
        <code v-if="hasScope" class="rag-ctx-scope">{{ derivedScope || 'mixed' }}</code>
        <el-tag v-else type="info" size="small" effect="plain">No files</el-tag>
      </div>
      <div v-if="hasScope" class="rag-ctx-list">
        <el-tag
          v-for="f in scopeFileInfos"
          :key="f.path"
          size="small" effect="plain"
          class="rag-ctx-tag"
          @click="openFilePreview(f.path)"
        >{{ f.name }}</el-tag>
      </div>
    </div>

    <!-- Tabs -->
    <div class="rag-tabs">
      <button class="rag-tab" :class="{ active: activeTab === 'query' }" @click="activeTab = 'query'">
        <el-icon><Search /></el-icon> Query
      </button>
      <button class="rag-tab" :class="{ active: activeTab === 'index' }" @click="activeTab = 'index'">
        <el-icon><DataAnalysis /></el-icon> Index
      </button>
    </div>

    <!-- ═══ Query ═══ -->
    <div v-if="activeTab === 'query'" class="rag-body">
      <div class="rag-qf">
        <el-input
          v-model="queryText" size="large" clearable
          :placeholder="hasScope ? `Search within ${scopeFiles.length} context file(s)…` : 'No context files to search'"
          :disabled="!hasScope"
          @keydown.enter="doQuery"
        >
          <template #append>
            <el-button :icon="Search" :loading="queryLoading" type="primary" :disabled="!hasScope" @click="doQuery">Search</el-button>
          </template>
        </el-input>
        <div class="rag-qf-opts">
          <label class="rag-qf-opt"><span>Top-K</span>
            <el-input-number v-model="queryTopK" :min="1" :max="20" size="small" controls-position="right" style="width:80px" />
          </label>
          <span v-if="hasScope" class="rag-qf-scope">
            <el-icon><FolderOpened /></el-icon>
            <code>{{ derivedScope || 'all files' }}</code>
          </span>
        </div>
      </div>

      <div v-if="queryError" class="rag-err">{{ queryError }}</div>

      <div v-if="querySources.length" class="rag-results">
        <div class="rag-results-hd">
          <span>{{ querySources.length }} result(s) · {{ queryLatency }}ms</span>
        </div>
        <div
          v-for="(src, idx) in querySources"
          :key="idx"
          class="rag-src"
          :class="[`rag-src--${scoreLevel(src.score)}`]"
          @click="openFilePreview(src.file_path)"
        >
          <span class="rag-src-rank">#{{ idx + 1 }}</span>
          <span class="rag-src-path">
            <el-icon :size="12"><Document /></el-icon>{{ src.file_path }}
          </span>
          <div class="rag-src-bar">
            <div class="rag-src-fill" :class="`rag-src-fill--${scoreLevel(src.score)}`" :style="{ width: scoreWidth(src.score) }" />
          </div>
          <span class="rag-src-pct" :class="`rag-src-pct--${scoreLevel(src.score)}`">{{ scorePercent(src.score) }}</span>
        </div>
      </div>

      <div v-else-if="!queryLoading && hasScope" class="rag-empty">
        <el-icon :size="36"><Search /></el-icon>
        <span>Search the conversation's context files</span>
      </div>
      <div v-else-if="!hasScope" class="rag-empty">
        <el-icon :size="36"><Collection /></el-icon>
        <span>Add context files to this conversation to enable RAG search</span>
      </div>
    </div>

    <!-- ═══ Index ═══ -->
    <div v-if="activeTab === 'index'" class="rag-body">
      <div class="rag-ix-hd">
        <span class="rag-ix-title">
          {{ scopeFiles.length }} file(s) in scope
          <el-tag v-if="status?.built" type="success" size="small" effect="dark" style="margin-left:8px">Indexed</el-tag>
          <el-tag v-else type="warning" size="small" effect="dark" style="margin-left:8px">Not built</el-tag>
        </span>
        <div class="rag-ix-acts">
          <el-button size="small" :icon="Refresh" @click="loadStatus" />
          <el-button size="small" type="primary" :icon="Cpu" :loading="building" @click="doRebuild">
            {{ building ? 'Rebuilding…' : 'Rebuild' }}
          </el-button>
        </div>
      </div>

      <div v-if="hasScope" class="rag-ix-list">
        <div
          v-for="f in scopeFileInfos"
          :key="f.path"
          class="rag-ix-file"
          @click="openFilePreview(f.path)"
        >
          <el-icon :size="16" color="var(--el-color-primary)"><Document /></el-icon>
          <div class="rag-ix-file-body">
            <span class="rag-ix-file-name">{{ f.name }}</span>
            <span class="rag-ix-file-dir">{{ f.dir }}/</span>
          </div>
          <el-tag size="small" type="success" effect="plain">indexed</el-tag>
        </div>
      </div>
      <div v-else class="rag-empty">
        <el-icon :size="36"><Document /></el-icon>
        <span>No context files attached</span>
      </div>
    </div>

    <!-- File preview -->
    <el-dialog
      v-model="filePreview.visible"
      :title="filePreview.title"
      width="800px" top="5vh"
      append-to-body :close-on-click-modal="true"
    >
      <div v-if="filePreview.loading" class="rag-fp-loading">Loading…</div>
      <div v-else class="rag-fp-body" v-html="filePreview.html" />
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
// ── Context bar ──
.rag-ctx { margin-bottom: 14px; padding: 10px 14px; background: var(--el-color-primary-light-9); border-radius: 8px; }
.rag-ctx--empty { background: var(--el-fill-color-lighter); }
.rag-ctx-hd { display: flex; gap: 8px; align-items: center; color: var(--el-color-primary); }
.rag-ctx-count { flex: 1; font-size: 13px; font-weight: 600; }
.rag-ctx-scope { font-size: 11px; padding: 1px 8px; background: var(--el-color-primary-light-7); border-radius: 3px; }
.rag-ctx-list { margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap; }
.rag-ctx-tag { cursor: pointer; }

// ── Tabs ──
.rag-tabs { display: flex; gap: 0; margin-bottom: 16px; border-bottom: 2px solid var(--el-border-color-lighter); }
.rag-tab { display: inline-flex; gap: 6px; align-items: center; padding: 8px 20px; font-size: 13px; font-weight: 500; color: var(--el-text-color-secondary); cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color .15s,border-color .15s; }
.rag-tab:hover { color: var(--el-text-color-primary); }
.rag-tab.active { color: var(--el-color-primary); border-bottom-color: var(--el-color-primary); }
.rag-body { min-height: 240px; }
.rag-err { padding: 8px 12px; margin-top: 8px; font-size: 13px; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border-radius: 6px; }
.rag-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 40px 0; font-size: 13px; color: var(--el-text-color-placeholder); }

// ── Query ──
.rag-qf { display: flex; flex-direction: column; gap: 8px; }
.rag-qf-opts { display: flex; gap: 16px; align-items: center; }
.rag-qf-opt { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--el-text-color-secondary); }
.rag-qf-scope { display: flex; gap: 4px; align-items: center; font-size: 12px; color: var(--el-color-primary); code { font-size: 11px; padding: 1px 6px; background: var(--el-fill-color); border-radius: 3px; } }

// ── Results ──
.rag-results { margin-top: 12px; }
.rag-results-hd { margin-bottom: 8px; font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); }
.rag-src { display: flex; gap: 8px; align-items: center; padding: 10px 14px; margin-bottom: 6px; background: var(--el-fill-color-lighter); border-left: 3px solid var(--el-border-color); border-radius: 0 6px 6px 0; cursor: pointer; transition: background .1s; &:hover { background: var(--el-fill-color-light); } }
.rag-src--high { border-left-color: var(--el-color-success); }
.rag-src--mid { border-left-color: var(--el-color-warning); }
.rag-src--low { border-left-color: var(--el-color-info); }
.rag-src-rank { width: 28px; flex-shrink: 0; font-size: 12px; font-weight: 700; color: var(--el-color-primary); }
.rag-src-path { flex: 1; min-width: 0; display: flex; gap: 4px; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-family: "SF Mono",Menlo,monospace; }
.rag-src-bar { width: 80px; height: 6px; flex-shrink: 0; background: var(--el-fill-color); border-radius: 3px; overflow: hidden; }
.rag-src-fill { height: 100%; border-radius: 3px; }
.rag-src-fill--high { background: var(--el-color-success); }
.rag-src-fill--mid { background: var(--el-color-warning); }
.rag-src-fill--low { background: var(--el-color-info); }
.rag-src-pct { width: 40px; flex-shrink: 0; text-align: right; font-size: 12px; font-weight: 700; font-family: "SF Mono",Menlo,monospace; }
.rag-src-pct--high { color: var(--el-color-success); }
.rag-src-pct--mid { color: var(--el-color-warning); }
.rag-src-pct--low { color: var(--el-text-color-secondary); }

// ── Index ──
.rag-ix-hd { display: flex; gap: 8px; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.rag-ix-title { font-size: 14px; font-weight: 600; }
.rag-ix-acts { display: flex; gap: 6px; }
.rag-ix-list { display: flex; flex-direction: column; gap: 4px; }
.rag-ix-file { display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: var(--el-fill-color-lighter); border-radius: 6px; cursor: pointer; transition: background .1s; &:hover { background: var(--el-fill-color-light); } }
.rag-ix-file-body { flex: 1; min-width: 0; }
.rag-ix-file-name { font-size: 13px; font-weight: 500; display: block; }
.rag-ix-file-dir { font-size: 11px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-placeholder); }

// ── File preview ──
.rag-fp-loading { display: flex; justify-content: center; padding: 48px 0; font-size: 14px; color: var(--el-text-color-secondary); }
.rag-fp-body { max-height: 70vh; overflow-y: auto; padding: 0 4px; font-size: 14px; line-height: 1.7; color: var(--el-text-color-primary);
  :deep(h1),:deep(h2),:deep(h3) { margin: 1em 0 .5em; }
  :deep(h1) { font-size: 1.5em; } :deep(h2) { font-size: 1.3em; }
  :deep(p) { margin: .5em 0; }
  :deep(pre) { padding: 12px; overflow-x: auto; font-size: 13px; background: var(--el-fill-color); border-radius: 6px; }
  :deep(code) { font-family: "SF Mono",Menlo,monospace; font-size: .9em; }
  :deep(blockquote) { margin: .5em 0; padding: 4px 12px; border-left: 3px solid var(--el-color-primary-light-5); color: var(--el-text-color-secondary); }
}
</style>
