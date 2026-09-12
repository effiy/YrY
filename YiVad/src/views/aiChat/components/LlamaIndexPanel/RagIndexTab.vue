<script setup lang="ts">
/**
 * RAG Index Tab — file list with index status, rebuild, pipeline diagram,
 * KB coverage, scope popularity, and freshness analytics.
 *
 * Surfaces the llama_index backend configuration visually: embed model,
 * chunk settings, hybrid/rerank toggles, and the retrieval pipeline flow.
 * Analytics cards (top files, stale files, coverage gaps, repeated questions)
 * aggregate across both retrieval records and chat turns from the History tab.
 */
import { ref, computed } from "vue";
import { Refresh, Cpu, Files, FolderOpened, Search, DataAnalysis, Document } from "@element-plus/icons-vue";
import { ragStatus, ragBuild, ragCategories, type RagCategories } from "@/api/modules/ragService";
import type { RagStatusResponse } from "@/api/interface/rag";
import type { ScopeFileInfo } from "./useRagScope";
import { scoreColor, latencyBucket, indexFreshness, formatBytes, metaFreshness } from "./ragFormat";

const props = withDefaults(
  defineProps<{
    derivedScope?: string;
    hasScope?: boolean;
    scopeFiles?: string[];
    scopeFileInfos?: ScopeFileInfo[];
    scopeFileGroups?: [string, ScopeFileInfo[]][];
    scopePopularity?: any;
    topRepeatedQuestions?: any;
    topStaleFiles?: any;
    topScoringFiles?: any;
    coverageGap?: any;
  }>(),
  { derivedScope: "", hasScope: false, scopeFiles: () => [], scopeFileInfos: () => [], scopeFileGroups: () => [] },
);

const emit = defineEmits<{
  (e: "open-file", path: string): void;
}>();

// ── Index status ──
const status = ref<RagStatusResponse | null>(null);
const building = ref(false);

async function loadStatus() {
  try { status.value = await ragStatus(); } catch { /* */ }
}
async function doRebuild() {
  building.value = true;
  try { await ragBuild(); await loadStatus(); }
  finally { building.value = false; }
}

const configCopied = ref(false);
async function copyConfigJSON() {
  const cfg = status.value?.config;
  if (!cfg) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(cfg, null, 2));
    configCopied.value = true;
    setTimeout(() => (configCopied.value = false), 1800);
  } catch { /* clipboard unavailable */ }
}

// ── KB coverage ──
const kbCategories = ref<RagCategories | null>(null);
const kbCoverage = computed(() => {
  const cats = (kbCategories.value?.categories ?? []).slice();
  const total = kbCategories.value?.total_files ?? (cats.reduce((s, c) => s + c.file_count, 0) || 1);
  const sorted = [...cats].sort((a, b) => b.file_count - a.file_count).slice(0, 8);
  const rest = cats.length > 8 ? cats.slice(8).reduce((s, c) => s + c.file_count, 0) : 0;
  return {
    sorted: sorted.map(c => ({ ...c, pct: (c.file_count / total) * 100 })),
    restCount: cats.length - 8, restFiles: rest, totalFiles: total, catCount: cats.length,
  };
});

async function loadCategories() {
  if (kbCategories.value) return;
  try { kbCategories.value = await ragCategories(); } catch { /* ignore */ }
}

// ── Scope file filter ──
const scopeFileFilter = ref("");

const filteredScopeFileInfos = computed(() => {
  const q = scopeFileFilter.value.trim().toLowerCase();
  if (!q) return props.scopeFileInfos;
  return props.scopeFileInfos.filter(f => f.path.toLowerCase().includes(q));
});

// KB content freshness — most recent update across retrieved sources.
const kbContentFreshness = computed(() => {
  // This is populated externally via the history tab; kept for display.
  return null;
});

loadCategories();
loadStatus();
</script>

<template>
  <div class="rc-body">
    <div class="rc-ix-bar">
      <div class="rc-ix-stat"><span class="rc-ix-n">{{ scopeFiles.length }}</span><span class="rc-ix-lbl">files in scope</span></div>
      <div class="rc-ix-stat"><span class="rc-ix-n">{{ scopeFileGroups.length }}</span><span class="rc-ix-lbl">directories</span></div>
      <div class="rc-ix-stat">
        <span class="rc-ix-n" :style="{ color: status?.built ? 'var(--el-color-success)' : 'var(--el-color-warning)' }">{{ status?.built ? 'Ready' : 'N/A' }}</span>
        <span class="rc-ix-lbl">index status</span>
      </div>
      <div v-if="indexFreshness(status?.last_built_at)" class="rc-ix-stat">
        <span class="rc-ix-n rc-ix-freshness" :style="{ color: indexFreshness(status?.last_built_at)!.color, borderColor: indexFreshness(status?.last_built_at)!.color }">{{ indexFreshness(status?.last_built_at)!.label }} · {{ indexFreshness(status?.last_built_at)!.age }}</span>
        <span class="rc-ix-lbl">freshness</span>
      </div>
      <div v-if="status?.persist_dir_size" class="rc-ix-stat">
        <span class="rc-ix-n">{{ formatBytes(status.persist_dir_size) }}</span>
        <span class="rc-ix-lbl">index size</span>
      </div>
      <div class="rc-ix-acts">
        <el-tooltip content="Copy current llama_index config as JSON" placement="top">
          <el-button size="small" :icon="Document" :disabled="!status?.config" @click="copyConfigJSON">{{ configCopied ? 'Copied!' : 'Copy config' }}</el-button>
        </el-tooltip>
        <el-button size="small" :icon="Refresh" @click="loadStatus" />
        <el-button size="small" type="primary" :icon="Cpu" :loading="building" @click="doRebuild">{{ building ? 'Building…' : 'Rebuild' }}</el-button>
      </div>
    </div>

    <!-- Pipeline diagram -->
    <div v-if="status?.config" class="rc-pipeline">
      <div class="rc-pipe-node">
        <span class="rc-pipe-stage">1 · Embed</span>
        <code class="rc-pipe-cfg">{{ status.config.embed_model || '—' }}</code>
      </div>
      <span class="rc-pipe-arrow">→</span>
      <div class="rc-pipe-node">
        <span class="rc-pipe-stage">2 · Vector Store</span>
        <code class="rc-pipe-cfg">{{ status.num_docs || 0 }} chunks</code>
      </div>
      <span class="rc-pipe-arrow">{{ status.config.hybrid_retrieval ? '⤵ hybrid' : '→' }}</span>
      <div class="rc-pipe-node" :class="{ 'on': status.config.hybrid_retrieval }">
        <span class="rc-pipe-stage">3 · Retriever</span>
        <code class="rc-pipe-cfg">top_k={{ status.config.top_k }}</code>
      </div>
      <span class="rc-pipe-arrow">{{ status.config.rerank_enabled ? '⤵ rerank' : '→' }}</span>
      <div class="rc-pipe-node" :class="{ 'on': status.config.rerank_enabled }">
        <span class="rc-pipe-stage">4 · Postprocess</span>
        <code class="rc-pipe-cfg">{{ status.config.rerank_enabled ? 'LLMRerank' : 'passthrough' }}</code>
      </div>
      <span class="rc-pipe-arrow">→</span>
      <div class="rc-pipe-node">
        <span class="rc-pipe-stage">5 · Synthesize</span>
        <code class="rc-pipe-cfg">{{ status.config.llm_model || '—' }}</code>
      </div>
    </div>

    <!-- Config grid -->
    <div v-if="status?.config" class="rc-cfg">
      <div class="rc-cfg-hd"><el-icon :size="14"><DataAnalysis /></el-icon><span>llama_index config</span></div>
      <div class="rc-cfg-grid">
        <div class="rc-cfg-cell"><span class="rc-cfg-k">embed</span><code>{{ status.config.embed_model || '—' }}</code></div>
        <div class="rc-cfg-cell"><span class="rc-cfg-k">llm</span><code>{{ status.config.llm_model || '—' }}</code></div>
        <div class="rc-cfg-cell"><span class="rc-cfg-k">chunk</span><code>{{ status.config.chunk_size }}/{{ status.config.chunk_overlap }}</code></div>
        <div class="rc-cfg-cell"><span class="rc-cfg-k">top-k</span><code>{{ status.config.top_k }}</code></div>
        <div class="rc-cfg-cell" :class="{ 'on': status.config.hybrid_retrieval }"><span class="rc-cfg-k">hybrid</span><span class="rc-cfg-v">{{ status.config.hybrid_retrieval ? 'on' : 'off' }}</span></div>
        <div class="rc-cfg-cell" :class="{ 'on': status.config.rerank_enabled }"><span class="rc-cfg-k">rerank</span><span class="rc-cfg-v">{{ status.config.rerank_enabled ? 'on' : 'off' }}</span></div>
        <div class="rc-cfg-cell" :class="{ 'on': status.config.inline_citations }"><span class="rc-cfg-k">citations</span><span class="rc-cfg-v">{{ status.config.inline_citations ? 'on' : 'off' }}</span></div>
        <div class="rc-cfg-cell" :class="{ 'on': status.config.auto_rebuild }"><span class="rc-cfg-k">auto-build</span><span class="rc-cfg-v">{{ status.config.auto_rebuild ? 'on' : 'off' }}</span></div>
      </div>
      <div v-if="status.num_docs" class="rc-cfg-foot">
        <span class="rc-cfg-docs">{{ status.num_docs }} chunks indexed</span>
        <span v-if="status.last_built_at" class="rc-cfg-built">built {{ status.last_built_at }}</span>
      </div>
    </div>

    <!-- KB Coverage bar -->
    <div v-if="kbCoverage.catCount" class="rc-ix-cov">
      <div class="rc-ix-cov-hd"><span class="rc-ix-cov-title">Coverage</span><span class="rc-ix-cov-sub">{{ kbCoverage.totalFiles }} files · {{ kbCoverage.catCount }} categories</span></div>
      <div class="rc-ix-cov-bar">
        <div v-for="c in kbCoverage.sorted" :key="c.name" class="rc-ix-cov-seg" :style="{ width: `${Math.max(c.pct, 1)}%` }">
          <span class="rc-ix-cov-seg-lbl" v-if="c.pct > 8">{{ c.name }}</span>
        </div>
        <div v-if="kbCoverage.restFiles" class="rc-ix-cov-seg rc-ix-cov-seg--rest" :style="{ width: `${Math.max((kbCoverage.restFiles / kbCoverage.totalFiles) * 100, 1)}%` }" />
      </div>
      <div class="rc-ix-cov-legend">
        <span v-for="c in kbCoverage.sorted" :key="c.name" class="rc-ix-cov-leg"><span class="rc-ix-cov-leg-dot" />{{ c.name }}<span class="rc-ix-cov-leg-n">{{ c.file_count }}</span></span>
        <span v-if="kbCoverage.restFiles" class="rc-ix-cov-leg rc-ix-cov-leg--rest">+{{ kbCoverage.restCount }}<span class="rc-ix-cov-leg-n">{{ kbCoverage.restFiles }}</span></span>
      </div>
    </div>

    <!-- Cross-tab analytics (data from History tab) -->
    <div v-if="scopePopularity" class="rc-ix-cov"><div class="rc-ix-cov-hd"><span class="rc-ix-cov-title">Scope popularity</span><span class="rc-ix-cov-sub">{{ scopePopularity.total }} queries · {{ scopePopularity.unique }} scopes</span></div></div>
    <div v-if="topStaleFiles?.length" class="rc-ix-cov"><div class="rc-ix-cov-hd"><span class="rc-ix-cov-title">Stale files</span><span class="rc-ix-cov-sub">{{ topStaleFiles.length }} files with chunks &gt;90d</span></div></div>
    <div v-if="topScoringFiles?.length" class="rc-ix-cov"><div class="rc-ix-cov-hd"><span class="rc-ix-cov-title">Top scoring</span><span class="rc-ix-cov-sub">{{ topScoringFiles.length }} files, μ≥2 hits</span></div></div>
    <div v-if="coverageGap" class="rc-ix-cov"><div class="rc-ix-cov-hd"><span class="rc-ix-cov-title">Coverage gap</span><span class="rc-ix-cov-sub">{{ coverageGap.total }}/{{ coverageGap.scoped }} files never retrieved</span></div></div>

    <!-- Scope file list -->
    <div v-if="hasScope" class="rc-ix-list">
      <div v-if="scopeFileInfos.length > 6" class="rc-ix-list-filter">
        <el-input v-model="scopeFileFilter" size="small" clearable placeholder="Filter scope files…" :prefix-icon="Search" />
        <span class="rc-ix-list-count">{{ filteredScopeFileInfos.length }}/{{ scopeFileInfos.length }}</span>
      </div>
      <div v-for="f in filteredScopeFileInfos" :key="f.path" class="rc-ix-file" @click="emit('open-file', f.path)">
        <span class="rc-ix-file-icon">📄</span>
        <div class="rc-ix-file-info"><span class="rc-ix-file-name">{{ f.name }}</span><span class="rc-ix-file-path">{{ f.dir }}/</span></div>
        <el-tag size="small" type="success" effect="light">indexed</el-tag>
      </div>
    </div>
    <div v-else class="rc-empty">
      <el-icon :size="40"><Files /></el-icon>
      <span>No context files attached</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rc-body { min-height: 260px; }
.rc-ix-bar { display: flex; gap: 20px; align-items: center; margin-bottom: 18px; padding: 12px 16px; background: var(--el-fill-color-lighter); border-radius: 10px; flex-wrap: wrap; }
.rc-ix-stat { display: flex; flex-direction: column; gap: 2px; }
.rc-ix-n { font-size: 18px; font-weight: 700; font-family: "SF Mono", Menlo, monospace; font-variant-numeric: tabular-nums; color: var(--el-text-color-primary); }
.rc-ix-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .4px; color: var(--el-text-color-placeholder); }
.rc-ix-freshness { border: 1px solid currentColor; font-variant-numeric: tabular-nums; padding: 1px 6px; border-radius: 4px; font-size: 12px; }
.rc-ix-acts { margin-left: auto; display: flex; gap: 6px; }

// Pipeline
.rc-pipeline { display: flex; gap: 4px; align-items: center; margin-bottom: 14px; padding: 10px 14px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 10px; overflow-x: auto; flex-wrap: wrap; }
.rc-pipe-node { display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; min-width: 70px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-light); border-radius: 6px;
  &.on { border-color: var(--el-color-primary-light-5); background: var(--el-color-primary-light-9); }
}
.rc-pipe-stage { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; color: var(--el-text-color-placeholder); font-family: "SF Mono", Menlo, monospace; }
.rc-pipe-cfg { font-size: 11px; font-family: "SF Mono", Menlo, monospace; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px; }
.rc-pipe-arrow { font-size: 14px; color: var(--el-text-color-placeholder); font-family: "SF Mono", Menlo, monospace; line-height: 1; }

// Config
.rc-cfg { margin-bottom: 14px; padding: 14px 16px; background: var(--el-fill-color-lighter); border-radius: 10px; border: 1px solid var(--el-border-color-lighter); }
.rc-cfg-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); }
.rc-cfg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
.rc-cfg-cell { display: flex; gap: 6px; align-items: center; padding: 4px 10px; border-radius: 6px; background: var(--el-bg-color);
  code { font-family: "SF Mono",Menlo,monospace; font-size: 12px; color: var(--el-text-color-primary); }
  &.on { background: var(--el-color-primary-light-9); }
}
.rc-cfg-k { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .3px; color: var(--el-text-color-placeholder); }
.rc-cfg-v { font-size: 12px; font-family: "SF Mono",Menlo,monospace; color: var(--el-color-primary); }
.rc-cfg-foot { margin-top: 10px; display: flex; gap: 12px; font-size: 11px; color: var(--el-text-color-placeholder); }
.rc-cfg-docs { font-weight: 500; color: var(--el-text-color-secondary); }

// Coverage
.rc-ix-cov { margin-bottom: 14px; padding: 12px 14px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 10px; }
.rc-ix-cov-hd { display: flex; gap: 8px; align-items: baseline; margin-bottom: 8px; }
.rc-ix-cov-title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); }
.rc-ix-cov-sub { font-size: 11px; color: var(--el-text-color-placeholder); }
.rc-ix-cov-bar { display: flex; height: 22px; border-radius: 6px; overflow: hidden; background: var(--el-bg-color); margin-bottom: 8px; }
.rc-ix-cov-seg { display: flex; align-items: center; justify-content: center; min-width: 0; padding: 0 4px; overflow: hidden;
  &:nth-child(8n+1) { background: var(--el-color-primary); }
  &:nth-child(8n+2) { background: var(--el-color-success); }
  &:nth-child(8n+3) { background: var(--el-color-warning); }
  &:nth-child(8n+4) { background: var(--el-color-danger); }
  &:nth-child(8n+5) { background: var(--el-color-info); }
  &:nth-child(8n+6) { background: var(--el-color-primary-light-3); }
  &:nth-child(8n+7) { background: var(--el-color-success-light-3); }
  &:nth-child(8n+0) { background: var(--el-color-warning-light-3); }
  &--rest { background: var(--el-fill-color-dark); }
}
.rc-ix-cov-seg-lbl { font-size: 9px; font-weight: 600; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-ix-cov-legend { display: flex; gap: 10px; flex-wrap: wrap; }
.rc-ix-cov-leg { font-size: 10px; color: var(--el-text-color-secondary); display: flex; gap: 4px; align-items: center;
  &--rest { color: var(--el-text-color-placeholder); }
}
.rc-ix-cov-leg-dot { width: 8px; height: 8px; border-radius: 2px; background: var(--el-color-primary); flex-shrink: 0; }
.rc-ix-cov-leg-n { font-weight: 600; color: var(--el-text-color-primary); }

// File list
.rc-ix-list { margin-top: 8px; }
.rc-ix-list-filter { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.rc-ix-list-count { font-size: 11px; color: var(--el-text-color-placeholder); font-family: "SF Mono",Menlo,monospace; }
.rc-ix-file { display: flex; gap: 10px; align-items: center; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background .12s;
  &:hover { background: var(--el-fill-color-light); }
}
.rc-ix-file-icon { font-size: 18px; flex-shrink: 0; }
.rc-ix-file-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.rc-ix-file-name { font-size: 13px; font-weight: 500; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-ix-file-path { font-size: 11px; color: var(--el-text-color-placeholder); font-family: "SF Mono",Menlo,monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.rc-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 48px 0; color: var(--el-text-color-placeholder); font-size: 14px; }
</style>