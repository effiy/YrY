<script setup lang="ts" name="aiChatLlamaIndexPanel">
/**
 * RAG Console — per-conversation semantic search over context files.
 * Query tab: search + scored results with snippet preview.
 * Index tab: file list with index status + rebuild.
 */
import { ref, computed } from "vue";
import { Refresh, Search, DataAnalysis, Cpu, Collection, FolderOpened, Document, Files } from "@element-plus/icons-vue";
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
  const c: string[] = [];
  for (let i = 0; i < minLen; i++) { if (parts.every(p => p[i] === parts[0][i])) c.push(parts[0][i]); else break; }
  return c.join("/") || "";
});

// ── Context files ──
interface ScopeFileInfo { path: string; name: string; dir: string }
const scopeFileInfos = computed<ScopeFileInfo[]>(() =>
  props.scopeFiles.map((p: string) => { const s = p.split("/"); return { path: p, name: s.pop() || p, dir: s.join("/") || "root" }; })
);
const scopeFileGroups = computed(() => {
  const m = new Map<string, ScopeFileInfo[]>();
  for (const f of scopeFileInfos.value) { const l = m.get(f.dir) || []; l.push(f); m.set(f.dir, l); }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
});

// ── Index status ──
const status = ref<RagStatusResponse | null>(null);
const building = ref(false);
async function loadStatus() { try { status.value = await ragStatus(); } catch { /* */ } }
async function doRebuild() { building.value = true; try { await ragBuild(); await loadStatus(); } finally { building.value = false; } }

// ── Query ──
const queryText = ref("");
const queryTopK = ref(4);
const queryLoading = ref(false);
const queryError = ref("");
const querySources = ref<RagSource[]>([]);
const queryLatency = ref(0);
const hasSearched = ref(false);

async function doQuery() {
  const q = queryText.value.trim(); if (!q) return;
  queryLoading.value = true; queryError.value = ""; querySources.value = [];
  const t0 = performance.now();
  try {
    const scope = derivedScope.value || undefined;
    const res = await ragQuery({ question: q, top_k: queryTopK.value, ...(scope ? { scope } : {}) });
    querySources.value = res.sources ?? [];
    queryLatency.value = Math.round(performance.now() - t0);
  } catch (e: any) { queryError.value = e?.message || "Query failed"; }
  finally { queryLoading.value = false; hasSearched.value = true; }
}

function scorePct(s: number): string { return `${(s * 100).toFixed(0)}%`; }
function scoreLvl(s: number): string { return s >= 0.7 ? "high" : s >= 0.4 ? "mid" : "low"; }
function scoreW(s: number): string { return `${Math.round(s * 100)}%`; }
function snippet(text: string, max = 140): string { return text.length > max ? text.slice(0, max) + "…" : text; }

// ── File preview ──
const { render } = useMarkdown();
const fp = ref({ visible: false, title: "", loading: false, html: "" });
async function preview(path: string) {
  fp.value = { visible: true, title: path.split("/").pop() || path, loading: true, html: "" };
  try { const r = await readKnowledgeFile(path); fp.value.html = render(r.content || ""); }
  catch { fp.value.html = "<p style='color:var(--el-color-danger)'>Failed to load.</p>"; }
  finally { fp.value.loading = false; }
}

loadStatus();
</script>

<template>
  <el-dialog
    :model-value="true"
    :title="scopeTitle ? `RAG — ${scopeTitle}` : 'RAG Console'"
    width="920px" top="2vh"
    append-to-body :close-on-click-modal="false"
    @close="emit('close')"
  >
    <!-- Context bar -->
    <div class="rc-ctx" :class="{ 'rc-ctx--on': hasScope }">
      <div class="rc-ctx-top">
        <span class="rc-ctx-icon">📚</span>
        <span class="rc-ctx-n">{{ scopeFiles.length }} context file(s)</span>
        <code v-if="hasScope" class="rc-ctx-scope">{{ derivedScope || 'mixed' }}</code>
        <span v-else class="rc-ctx-empty-tag">No context files attached</span>
      </div>
      <div v-if="hasScope" class="rc-ctx-list">
        <template v-for="[dir, files] in scopeFileGroups" :key="dir">
          <span class="rc-ctx-dir">{{ dir }}/</span>
          <span
            v-for="f in files" :key="f.path"
            class="rc-ctx-file" @click="preview(f.path)"
            :title="f.path"
          >{{ f.name }}</span>
        </template>
      </div>
    </div>

    <!-- Tabs -->
    <div class="rc-tabs">
      <button class="rc-tab" :class="{ on: activeTab === 'query' }" @click="activeTab = 'query'">
        <el-icon><Search /></el-icon> Query
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'index' }" @click="activeTab = 'index'">
        <el-icon><Files /></el-icon> Index
      </button>
    </div>

    <!-- ═══ Query ═══ -->
    <div v-if="activeTab === 'query'" class="rc-body">
      <div class="rc-search">
        <el-input
          v-model="queryText" size="large" clearable
          :placeholder="hasScope ? `Search within ${scopeFiles.length} context file(s)…` : 'No context files to search'"
          :disabled="!hasScope"
          @keydown.enter="doQuery"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
          <template #append>
            <el-button :icon="Search" :loading="queryLoading" type="primary" :disabled="!hasScope" @click="doQuery">Search</el-button>
          </template>
        </el-input>
        <div class="rc-search-opts">
          <label><span>Top-K</span><el-input-number v-model="queryTopK" :min="1" :max="20" size="small" controls-position="right" style="width:76px" /></label>
          <span v-if="hasScope" class="rc-scope-badge"><el-icon><FolderOpened /></el-icon><code>{{ derivedScope || 'all' }}</code></span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="queryLoading" class="rc-loading">
        <div class="rc-loading-dots"><span /><span /><span /></div>
        <span>Searching…</span>
      </div>

      <div v-else-if="queryError" class="rc-err">{{ queryError }}</div>

      <!-- Results -->
      <div v-else-if="querySources.length" class="rc-results">
        <div class="rc-results-hd">
          <span class="rc-results-stat">{{ querySources.length }} result(s)</span>
          <span class="rc-results-stat">{{ queryLatency }}ms</span>
        </div>

        <div
          v-for="(src, idx) in querySources" :key="idx"
          class="rc-card" :class="[`rc-card--${scoreLvl(src.score)}`]"
          @click="preview(src.file_path)"
        >
          <div class="rc-card-hd">
            <span class="rc-card-rank">#{{ idx + 1 }}</span>
            <span class="rc-card-path"><el-icon :size="13"><Document /></el-icon>{{ src.file_path }}</span>
            <div class="rc-card-meter"><div class="rc-card-meter-fill" :class="`rc-card-meter-fill--${scoreLvl(src.score)}`" :style="{width:scoreW(src.score)}" /></div>
            <span class="rc-card-pct" :class="`rc-card-pct--${scoreLvl(src.score)}`">{{ scorePct(src.score) }}</span>
          </div>
          <div class="rc-card-body">
            <p class="rc-card-snip">{{ snippet(src.text, 160) }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="hasSearched && !queryError" class="rc-empty">
        <el-icon :size="40"><Search /></el-icon>
        <span>No matching results in context files</span>
      </div>
      <div v-else-if="!hasScope" class="rc-empty">
        <el-icon :size="40"><Collection /></el-icon>
        <span>Add context files to enable RAG search</span>
        <span class="rc-empty-hint">Drag files from the left sidebar or use Edit context</span>
      </div>
    </div>

    <!-- ═══ Index ═══ -->
    <div v-if="activeTab === 'index'" class="rc-body">
      <div class="rc-ix-bar">
        <div class="rc-ix-stat">
          <span class="rc-ix-n">{{ scopeFiles.length }}</span>
          <span class="rc-ix-lbl">files in scope</span>
        </div>
        <div class="rc-ix-stat">
          <span class="rc-ix-n">{{ scopeFileGroups.length }}</span>
          <span class="rc-ix-lbl">directories</span>
        </div>
        <div class="rc-ix-stat">
          <span class="rc-ix-n" :style="{color: status?.built ? 'var(--el-color-success)':'var(--el-color-warning)'}">{{ status?.built ? 'Ready' : 'N/A' }}</span>
          <span class="rc-ix-lbl">index status</span>
        </div>
        <div class="rc-ix-acts">
          <el-button size="small" :icon="Refresh" @click="loadStatus" />
          <el-button size="small" type="primary" :icon="Cpu" :loading="building" @click="doRebuild">{{ building ? 'Building…' : 'Rebuild' }}</el-button>
        </div>
      </div>

      <div v-if="hasScope" class="rc-ix-list">
        <div v-for="f in scopeFileInfos" :key="f.path" class="rc-ix-file" @click="preview(f.path)">
          <span class="rc-ix-file-icon">📄</span>
          <div class="rc-ix-file-info">
            <span class="rc-ix-file-name">{{ f.name }}</span>
            <span class="rc-ix-file-path">{{ f.dir }}/</span>
          </div>
          <el-tag size="small" type="success" effect="light">indexed</el-tag>
        </div>
      </div>
      <div v-else class="rc-empty">
        <el-icon :size="40"><Files /></el-icon>
        <span>No context files attached</span>
      </div>
    </div>

    <!-- Preview -->
    <el-dialog v-model="fp.visible" :title="fp.title" width="800px" top="5vh" append-to-body :close-on-click-modal="true">
      <div v-if="fp.loading" class="rc-fp-loading">Loading…</div>
      <div v-else class="rc-fp-body" v-html="fp.html" />
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
// ── Context bar ──
.rc-ctx { margin-bottom: 14px; padding: 12px 16px; background: var(--el-fill-color-lighter); border-radius: 10px; border: 1px solid var(--el-border-color-lighter); transition: background .2s; }
.rc-ctx--on { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-7); }
.rc-ctx-top { display: flex; gap: 8px; align-items: center; }
.rc-ctx-icon { font-size: 16px; }
.rc-ctx-n { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); }
.rc-ctx-scope { font-size: 11px; padding: 1px 8px; background: var(--el-color-primary-light-7); color: var(--el-color-primary); border-radius: 3px; font-family: "SF Mono",Menlo,monospace; }
.rc-ctx-empty-tag { font-size: 12px; color: var(--el-text-color-placeholder); }
.rc-ctx-list { margin-top: 10px; display: flex; gap: 4px 8px; flex-wrap: wrap; align-items: baseline; }
.rc-ctx-dir { font-size: 11px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-secondary); }
.rc-ctx-file { font-size: 12px; padding: 2px 8px; background: var(--el-color-primary-light-8); color: var(--el-color-primary); border-radius: 4px; cursor: pointer; font-weight: 500; transition: background .1s; &:hover { background: var(--el-color-primary-light-6); color: #fff; } }

// ── Tabs ──
.rc-tabs { display: flex; gap: 0; margin-bottom: 18px; border-bottom: 2px solid var(--el-border-color-lighter); }
.rc-tab { display: inline-flex; gap: 6px; align-items: center; padding: 8px 22px; font-size: 13px; font-weight: 500; color: var(--el-text-color-secondary); cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color .15s,border-color .15s; }
.rc-tab:hover { color: var(--el-text-color-primary); }
.rc-tab.on { color: var(--el-color-primary); border-bottom-color: var(--el-color-primary); }
.rc-body { min-height: 260px; }
.rc-err { padding: 10px 14px; margin-top: 8px; font-size: 13px; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border-radius: 8px; }

// ── Search ──
.rc-search { display: flex; flex-direction: column; gap: 8px; }
.rc-search-opts { display: flex; gap: 16px; align-items: center; label { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--el-text-color-secondary); } }
.rc-scope-badge { display: inline-flex; gap: 4px; align-items: center; font-size: 12px; color: var(--el-color-primary); code { font-size: 11px; padding: 1px 8px; background: var(--el-fill-color); border-radius: 3px; } }

// ── Loading ──
.rc-loading { display: flex; flex-direction: column; gap: 10px; align-items: center; padding: 48px 0; font-size: 13px; color: var(--el-text-color-placeholder); }
.rc-loading-dots { display: flex; gap: 6px; span { width: 8px; height: 8px; border-radius: 50%; background: var(--el-color-primary-light-5); animation: rc-bounce 1.2s ease-in-out infinite; &:nth-child(2) { animation-delay: .2s; } &:nth-child(3) { animation-delay: .4s; } } }
@keyframes rc-bounce { 0%,80%,100% { transform: scale(.6); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }

// ── Results ──
.rc-results { margin-top: 14px; }
.rc-results-hd { display: flex; gap: 12px; margin-bottom: 10px; }
.rc-results-stat { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); padding: 2px 10px; background: var(--el-fill-color-lighter); border-radius: 4px; }

// ── Result cards ──
.rc-card { background: var(--el-fill-color-lighter); border-left: 3px solid var(--el-border-color); border-radius: 0 8px 8px 0; margin-bottom: 8px; cursor: pointer; overflow: hidden; transition: background .12s, box-shadow .12s; &:hover { background: var(--el-fill-color-light); box-shadow: 0 1px 6px rgba(0,0,0,.06); } }
.rc-card--high { border-left-color: var(--el-color-success); }
.rc-card--mid { border-left-color: var(--el-color-warning); }
.rc-card--low { border-left-color: var(--el-color-info); }
.rc-card-hd { display: flex; gap: 8px; align-items: center; padding: 10px 14px 0; }
.rc-card-rank { width: 26px; flex-shrink: 0; font-size: 12px; font-weight: 700; color: var(--el-color-primary); }
.rc-card-path { flex: 1; min-width: 0; display: flex; gap: 5px; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-regular); }
.rc-card-meter { width: 72px; height: 5px; flex-shrink: 0; background: var(--el-fill-color); border-radius: 3px; overflow: hidden; }
.rc-card-meter-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.rc-card-meter-fill--high { background: var(--el-color-success); }
.rc-card-meter-fill--mid { background: var(--el-color-warning); }
.rc-card-meter-fill--low { background: var(--el-color-info); }
.rc-card-pct { width: 38px; flex-shrink: 0; text-align: right; font-size: 12px; font-weight: 700; font-family: "SF Mono",Menlo,monospace; }
.rc-card-pct--high { color: var(--el-color-success); }
.rc-card-pct--mid { color: var(--el-color-warning); }
.rc-card-pct--low { color: var(--el-text-color-secondary); }
.rc-card-body { padding: 6px 14px 10px 48px; }
.rc-card-snip { margin: 0; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

// ── Empty ──
.rc-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 44px 0; font-size: 13px; color: var(--el-text-color-placeholder); }
.rc-empty-hint { font-size: 11px; margin-top: -4px; }

// ── Index ──
.rc-ix-bar { display: flex; gap: 20px; align-items: center; margin-bottom: 16px; padding: 12px 16px; background: var(--el-fill-color-lighter); border-radius: 10px; }
.rc-ix-stat { display: flex; flex-direction: column; gap: 2px; }
.rc-ix-n { font-size: 20px; font-weight: 700; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-primary); }
.rc-ix-lbl { font-size: 10px; color: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: .5px; }
.rc-ix-acts { margin-left: auto; display: flex; gap: 6px; }
.rc-ix-list { display: flex; flex-direction: column; gap: 4px; }
.rc-ix-file { display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: var(--el-fill-color-lighter); border-radius: 6px; cursor: pointer; transition: background .1s; &:hover { background: var(--el-fill-color-light); } }
.rc-ix-file-icon { font-size: 16px; }
.rc-ix-file-info { flex: 1; min-width: 0; }
.rc-ix-file-name { font-size: 13px; font-weight: 500; display: block; }
.rc-ix-file-path { font-size: 11px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-placeholder); }

// ── Preview ──
.rc-fp-loading { display: flex; justify-content: center; padding: 48px 0; font-size: 14px; color: var(--el-text-color-secondary); }
.rc-fp-body { max-height: 70vh; overflow-y: auto; padding: 0 4px; font-size: 14px; line-height: 1.7; color: var(--el-text-color-primary);
  :deep(h1),:deep(h2),:deep(h3) { margin: 1em 0 .5em; } :deep(h1) { font-size: 1.5em; } :deep(h2) { font-size: 1.3em; }
  :deep(p) { margin: .5em 0; } :deep(pre) { padding: 12px; overflow-x: auto; font-size: 13px; background: var(--el-fill-color); border-radius: 6px; }
  :deep(code) { font-family: "SF Mono",Menlo,monospace; font-size: .9em; }
}
</style>
