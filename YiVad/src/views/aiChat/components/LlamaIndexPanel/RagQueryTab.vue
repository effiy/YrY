<script setup lang="ts">
/**
 * RAG Query Tab — semantic search with scored results and snippet preview.
 *
 * Handles the full query flow: input → API call → results display with
 * client-side filtering (min score, stale filter, file filter, grouping).
 * Supports hybrid retrieval, LLM rerank, inline citations, and metadata
 * filters (category + tags from llama_index MetadataFilters).
 */
import { ref, computed } from "vue";
import { Search, Collection, InfoFilled, Document, FolderOpened, Clock, DocumentCopy } from "@element-plus/icons-vue";
import { ragQuery, ragCategories, ragHistory, type RagCategories } from "@/api/modules/ragService";
import type { RagSource } from "@/api/interface/rag";
import {
  scoreColor, scorePct, scoreLvl, scoreW, latencyBucket,
  snippet, tagsArray, metaCharCount, metaTokenEstimate, metaFreshness,
} from "./ragFormat";

const props = withDefaults(
  defineProps<{
    scopeFiles?: string[];
    derivedScope?: string;
    hasScope?: boolean;
  }>(),
  { scopeFiles: () => [], derivedScope: "", hasScope: false },
);

const emit = defineEmits<{
  (e: "open-file", path: string): void;
  (e: "history-changed"): void;
}>();

// ── Query state ──
const queryText = ref("");
const queryTopK = ref(4);
const queryNumQueries = ref(1);
const queryLoading = ref(false);
const queryError = ref("");
const querySources = ref<RagSource[]>([]);
const queryLatency = ref(0);
const hasSearched = ref(false);

// ── Search overrides ──
const queryHybrid = ref(false);
const queryRerank = ref(false);
const queryCitations = ref(false);
let overridesSeeded = false;

// ── Metadata filters ──
const kbCategories = ref<RagCategories | null>(null);
const queryCategory = ref<string>("");
const queryTags = ref<string[]>([]);
const queryTagsLoading = ref(false);
const hasMetaFilter = computed(() => !!queryCategory.value || queryTags.value.length > 0);
const categoryOptions = computed(() => (kbCategories.value?.categories ?? []).map(c => c.name));
const tagOptions = computed(() =>
  Object.entries(kbCategories.value?.tags ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count })),
);

// ── Client-side result filters ──
const queryMinScore = ref(0);
const queryHideStale = ref(false);
const queryFileFilter = ref("");
const queryGroupByFile = ref(false);
const querySortBy = ref<"score" | "file" | "freshness">("score");

const filteredQuerySources = computed(() => {
  const list = querySources.value.filter(s => {
    if (s.score < queryMinScore.value) return false;
    if (queryHideStale.value) {
      const f = metaFreshness(s.metadata);
      if (f?.stale) return false;
    }
    const q = queryFileFilter.value.trim().toLowerCase();
    if (q && !(s.file_path || "").toLowerCase().includes(q)) return false;
    return true;
  });
  if (querySortBy.value === "file") {
    return [...list].sort((a, b) => (a.file_path || "").localeCompare(b.file_path || "") || (b.score - a.score));
  }
  if (querySortBy.value === "freshness") {
    return [...list].sort((a, b) => {
      const fa = metaFreshness(a.metadata)?.ageDays ?? Number.MAX_SAFE_INTEGER;
      const fb = metaFreshness(b.metadata)?.ageDays ?? Number.MAX_SAFE_INTEGER;
      return fa - fb || (b.score - a.score);
    });
  }
  return list;
});

/** Group filtered results by file_path — chunks nested under parent file header. */
const groupedQuerySources = computed(() => {
  if (!queryGroupByFile.value) return null;
  const groups: Record<string, RagSource[]> = {};
  for (const s of filteredQuerySources.value) {
    const fp = s.file_path || "(unknown)";
    if (!groups[fp]) groups[fp] = [];
    groups[fp].push(s);
  }
  return Object.entries(groups).map(([path, sources]) => {
    const scores = sources.map(s => s.score || 0);
    return { path, sources, count: sources.length, best: Math.max(...scores), avg: scores.reduce((a, b) => a + b, 0) / scores.length };
  }).sort((a, b) => b.best - a.best);
});

/** Context-window token budget across filtered sources. */
const queryTokenBudget = computed(() => {
  let tokens = 0, chars = 0, known = 0;
  for (const s of filteredQuerySources.value) {
    const te = metaTokenEstimate(s.metadata);
    const cc = metaCharCount(s.metadata);
    if (te != null) { tokens += te; known++; }
    if (cc != null) chars += cc;
  }
  return { tokens, chars, known, total: filteredQuerySources.value.length };
});

/** Low-relevance nudge — when best score < 0.5, surface one-click recovery. */
const lowRelevanceHint = computed<{ text: string; action: () => void } | null>(() => {
  if (!querySources.value.length) return null;
  const top = Math.max(...querySources.value.map(s => s.score || 0));
  if (top >= 0.5) return null;
  if (!queryHybrid.value && !props.hasScope && !hasMetaFilter.value) {
    return { text: "Low relevance — try hybrid (vector + BM25 fusion)", action: () => { queryHybrid.value = true; void doQuery(); } };
  }
  if (queryHybrid.value && !queryRerank.value) {
    return { text: "Still weak — enable LLMRerank postprocessor", action: () => { queryRerank.value = true; void doQuery(); } };
  }
  if (queryTopK.value < 8) {
    return { text: `Only ${queryTopK.value} chunk(s) — raise top-k`, action: () => { queryTopK.value = Math.min(20, queryTopK.value + 4); void doQuery(); } };
  }
  return null;
});

const staleHiddenCount = computed(() => {
  if (!querySources.value.length) return 0;
  let n = 0;
  for (const s of querySources.value) {
    if (s.score < queryMinScore.value) continue;
    const f = metaFreshness(s.metadata);
    if (f?.stale) n++;
  }
  return n;
});

const copiedChunkIdx = ref<number | null>(null);
async function copyChunk(idx: number, text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedChunkIdx.value = idx;
    setTimeout(() => { if (copiedChunkIdx.value === idx) copiedChunkIdx.value = null; }, 1800);
  } catch { /* clipboard unavailable */ }
}

// ── API calls ──
async function loadCategories() {
  if (kbCategories.value) return;
  queryTagsLoading.value = true;
  try { kbCategories.value = await ragCategories(); } catch { /* ignore */ }
  finally { queryTagsLoading.value = false; }
}

async function doQuery() {
  const q = queryText.value.trim(); if (!q) return;
  queryLoading.value = true; queryError.value = ""; querySources.value = [];
  const t0 = performance.now();
  try {
    const scope = props.derivedScope || undefined;
    const effectiveHybrid = queryHybrid.value && !hasMetaFilter.value;
    const effectiveNumQueries = effectiveHybrid && !props.hasScope ? queryNumQueries.value : 1;
    const res = await ragQuery({
      question: q, top_k: queryTopK.value,
      hybrid: effectiveHybrid, rerank: queryRerank.value,
      citations: queryCitations.value, num_queries: effectiveNumQueries,
      ...(scope ? { scope } : {}),
      ...(queryCategory.value ? { category: queryCategory.value } : {}),
      ...(queryTags.value.length ? { tags: queryTags.value } : {}),
    });
    querySources.value = res.sources ?? [];
    queryLatency.value = Math.round(performance.now() - t0);
  } catch (e: unknown) { queryError.value = e instanceof Error ? e.message : "Query failed"; }
  finally { queryLoading.value = false; hasSearched.value = true; emit("history-changed"); }
}

/** Seed overrides from backend config on first load. */
function seedOverrides(cfg: { hybrid_retrieval?: boolean; rerank_enabled?: boolean; inline_citations?: boolean }) {
  if (overridesSeeded) return;
  queryHybrid.value = !!cfg.hybrid_retrieval;
  queryRerank.value = !!cfg.rerank_enabled;
  queryCitations.value = !!cfg.inline_citations;
  overridesSeeded = true;
}

loadCategories();

defineExpose({ seedOverrides });
</script>

<template>
  <div class="rc-body">
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
        <label>
          <span>Q-variants</span>
          <el-input-number v-model="queryNumQueries" :min="1" :max="5" size="small" controls-position="right" style="width:68px" :disabled="!queryHybrid || hasScope || hasMetaFilter" />
        </label>
        <span class="rc-toggles">
          <button class="rc-toggle" :class="{ on: queryHybrid }" :disabled="!!hasScope || hasMetaFilter" @click="queryHybrid = !queryHybrid">hybrid</button>
          <button class="rc-toggle" :class="{ on: queryRerank }" @click="queryRerank = !queryRerank">rerank</button>
          <button class="rc-toggle" :class="{ on: queryCitations }" @click="queryCitations = !queryCitations">citations</button>
        </span>
        <span v-if="hasScope" class="rc-scope-badge"><el-icon><FolderOpened /></el-icon><code>{{ derivedScope || 'all' }}</code></span>
      </div>
      <!-- Metadata filters -->
      <div class="rc-meta-filters">
        <label class="rc-meta-field">
          <span class="rc-meta-label">category</span>
          <el-select v-model="queryCategory" size="small" clearable filterable placeholder="All categories" style="width:170px" :loading="queryTagsLoading">
            <el-option v-for="cat in categoryOptions" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </label>
        <label class="rc-meta-field">
          <span class="rc-meta-label">tags</span>
          <el-select v-model="queryTags" size="small" clearable filterable multiple collapse-tags collapse-tags-tooltip placeholder="All tags" style="width:240px" :loading="queryTagsLoading">
            <el-option v-for="t in tagOptions" :key="t.name" :label="`#${t.name} (${t.count})`" :value="t.name" />
          </el-select>
        </label>
        <span v-if="hasMetaFilter" class="rc-meta-warn">hybrid off</span>
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
        <span class="rc-results-stat">
          {{ filteredQuerySources.length }}/{{ querySources.length }} result(s)
          <span v-if="filteredQuerySources.length < querySources.length" class="rc-results-filtered">· filtered</span>
          <span v-if="queryHideStale && staleHiddenCount" class="rc-results-filtered">· {{ staleHiddenCount }} stale</span>
        </span>
        <span class="rc-results-stat rc-results-latency" :style="{ color: latencyBucket(queryLatency).color, borderColor: latencyBucket(queryLatency).color }">
          {{ latencyBucket(queryLatency).label }} · {{ queryLatency }}ms
        </span>
        <span v-if="queryTokenBudget.total" class="rc-results-stat rc-results-tokens" :title="`~${queryTokenBudget.chars.toLocaleString()} chars across ${queryTokenBudget.known}/${queryTokenBudget.total} sources`">
          ~{{ queryTokenBudget.tokens.toLocaleString() }}t context
        </span>
        <div class="rc-thresh">
          <span class="rc-thresh-lbl">min</span>
          <el-slider v-model="queryMinScore" :min="0" :max="1" :step="0.05" :show-tooltip="false" style="width:120px" />
          <span class="rc-thresh-val" :style="{ color: scoreColor(queryMinScore || 0) }">{{ (queryMinScore * 100).toFixed(0) }}%</span>
        </div>
        <label class="rc-thresh-toggle"><input type="checkbox" v-model="queryHideStale" /><span>hide stale</span></label>
        <el-input v-model="queryFileFilter" size="small" clearable placeholder="Filter by file…" :prefix-icon="Search" class="rc-thresh-file-filter" />
        <label class="rc-thresh-toggle"><input type="checkbox" v-model="queryGroupByFile" /><span>group by file</span></label>
        <el-select v-model="querySortBy" size="small" class="rc-thresh-sort">
          <el-option label="sort: score" value="score" />
          <el-option label="sort: file" value="file" />
          <el-option label="sort: freshness" value="freshness" />
        </el-select>
      </div>

      <!-- Low-relevance nudge -->
      <div v-if="lowRelevanceHint" class="rc-results-nudge">
        <el-icon><InfoFilled /></el-icon>
        <span class="rc-nudge-text">{{ lowRelevanceHint.text }}</span>
        <el-button size="small" type="primary" @click="lowRelevanceHint.action">Apply</el-button>
      </div>

      <!-- Group-by-file view -->
      <template v-if="groupedQuerySources">
        <div v-for="(g, gi) in groupedQuerySources" :key="g.path" class="rc-card-group">
          <div class="rc-card-group-hd" @click="emit('open-file', g.path)">
            <el-icon :size="13"><Document /></el-icon>
            <span class="rc-card-group-path">{{ g.path }}</span>
            <span class="rc-card-group-meta">{{ g.count }} chunk(s)</span>
            <span class="rc-card-group-score" :style="{ color: scoreColor(g.best) }">best {{ (g.best * 100).toFixed(0) }}%</span>
          </div>
          <div v-for="(src, idx) in g.sources" :key="`${gi}-${idx}`" class="rc-card" :class="[`rc-card--${scoreLvl(src.score)}`]" @click="emit('open-file', src.file_path)">
            <div class="rc-card-hd">
              <span class="rc-card-rank">#{{ idx + 1 }}</span>
              <div class="rc-card-meter"><div class="rc-card-meter-fill" :class="`rc-card-meter-fill--${scoreLvl(src.score)}`" :style="{ width: scoreW(src.score) }" /></div>
              <span class="rc-card-pct" :class="`rc-card-pct--${scoreLvl(src.score)}`">{{ scorePct(src.score) }}</span>
              <el-tooltip :content="copiedChunkIdx === idx ? 'Copied!' : 'Copy chunk text'" placement="top">
                <el-button size="small" text :icon="DocumentCopy" class="rc-card-copy" @click.stop="copyChunk(idx, src.text)" />
              </el-tooltip>
            </div>
            <div class="rc-card-body"><p class="rc-card-snip">{{ snippet(src.text, 160) }}</p></div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="(src, idx) in filteredQuerySources" :key="idx" class="rc-card" :class="[`rc-card--${scoreLvl(src.score)}`]" @click="emit('open-file', src.file_path)">
          <div class="rc-card-hd">
            <span class="rc-card-rank">#{{ idx + 1 }}</span>
            <span class="rc-card-path"><el-icon :size="13"><Document /></el-icon>{{ src.file_path }}</span>
            <div class="rc-card-meter"><div class="rc-card-meter-fill" :class="`rc-card-meter-fill--${scoreLvl(src.score)}`" :style="{ width: scoreW(src.score) }" /></div>
            <span class="rc-card-pct" :class="`rc-card-pct--${scoreLvl(src.score)}`">{{ scorePct(src.score) }}</span>
            <el-tooltip :content="copiedChunkIdx === idx ? 'Copied!' : 'Copy chunk text'" placement="top">
              <el-button size="small" text :icon="DocumentCopy" class="rc-card-copy" @click.stop="copyChunk(idx, src.text)" />
            </el-tooltip>
          </div>
          <div class="rc-card-body">
            <div v-if="src.metadata" class="rc-card-meta">
              <span v-if="src.metadata.category" class="rc-meta-tag rc-meta-tag--cat">{{ src.metadata.category }}</span>
              <span v-if="src.metadata.type" class="rc-meta-tag">{{ src.metadata.type }}</span>
              <span v-if="src.metadata.status" class="rc-meta-tag">{{ src.metadata.status }}</span>
              <span v-for="t in tagsArray(src.metadata).slice(0, 3)" :key="t" class="rc-meta-tag rc-meta-tag--tag">#{{ t }}</span>
              <span v-if="metaCharCount(src.metadata) != null" class="rc-meta-stat">{{ metaCharCount(src.metadata) }}c</span>
              <span v-if="metaTokenEstimate(src.metadata) != null" class="rc-meta-stat">~{{ metaTokenEstimate(src.metadata) }}t</span>
              <span v-if="metaFreshness(src.metadata)" class="rc-meta-stat rc-meta-freshness" :class="{ 'rc-meta-freshness--stale': metaFreshness(src.metadata)!.stale }">
                <el-icon :size="11"><Clock /></el-icon>{{ metaFreshness(src.metadata)!.label }}
              </span>
            </div>
            <p class="rc-card-snip">{{ snippet(src.text, 160) }}</p>
          </div>
        </div>
      </template>
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
</template>

<style scoped lang="scss">
.rc-body { min-height: 260px; }
.rc-err { padding: 10px 14px; margin-top: 8px; font-size: 13px; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border-radius: 8px; }
.rc-search { display: flex; flex-direction: column; gap: 8px; }
.rc-search-opts { display: flex; gap: 16px; align-items: center;
  label { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--el-text-color-secondary); }
}
.rc-scope-badge { display: inline-flex; gap: 4px; align-items: center; font-size: 12px; color: var(--el-color-primary);
  code { font-size: 11px; padding: 1px 8px; background: var(--el-fill-color); border-radius: 3px; }
}
.rc-meta-filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding-top: 4px; }
.rc-meta-field { display: inline-flex; gap: 6px; align-items: center; }
.rc-meta-label { font-size: 10px; font-family: "SF Mono", Menlo, monospace; text-transform: uppercase; letter-spacing: .4px; color: var(--el-text-color-placeholder); }
.rc-meta-warn { font-size: 10px; font-family: "SF Mono", Menlo, monospace; color: var(--el-color-warning); background: var(--el-color-warning-light-9); padding: 1px 6px; border-radius: 8px; }
.rc-toggles { display: inline-flex; gap: 4px; align-items: center; }
.rc-toggle { padding: 2px 10px; font-size: 11px; font-weight: 600; line-height: 1.5; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-secondary); background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 4px; cursor: pointer; user-select: none; transition: background .12s, color .12s, border-color .12s;
  &:hover:not(:disabled) { background: var(--el-fill-color-light); }
  &.on { color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-7); }
  &:disabled { opacity: .5; cursor: not-allowed; }
}
.rc-loading { display: flex; flex-direction: column; gap: 10px; align-items: center; padding: 48px 0; font-size: 13px; color: var(--el-text-color-placeholder); }
.rc-loading-dots { display: flex; gap: 6px;
  span { width: 8px; height: 8px; border-radius: 50%; background: var(--el-color-primary-light-5); animation: rc-bounce 1.2s ease-in-out infinite;
    &:nth-child(2) { animation-delay: .2s; }
    &:nth-child(3) { animation-delay: .4s; }
  }
}
@keyframes rc-bounce { 0%,80%,100% { transform: scale(.6); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }
.rc-results { margin-top: 14px; }
.rc-results-hd { display: flex; gap: 12px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
.rc-results-stat { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); padding: 2px 10px; background: var(--el-fill-color-lighter); border-radius: 4px; }
.rc-results-tokens { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.rc-results-latency { border: 1px solid currentColor; font-variant-numeric: tabular-nums; }
.rc-results-nudge { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding: 8px 12px; background: var(--el-color-warning-light-9); border: 1px solid var(--el-color-warning-light-7); border-radius: 6px; color: var(--el-text-color-regular); font-size: 12px;
  .el-icon { color: var(--el-color-warning); }
}
.rc-nudge-text { flex: 1; }
.rc-results-filtered { color: var(--el-color-warning); }
.rc-results-score { background: var(--el-fill-color-lighter); }
.rc-thresh { display: inline-flex; gap: 6px; align-items: center; }
.rc-thresh-lbl { font-size: 10px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-placeholder); text-transform: uppercase; }
.rc-thresh-val { font-size: 12px; font-weight: 600; font-family: "SF Mono",Menlo,monospace; font-variant-numeric: tabular-nums; }
.rc-thresh-toggle { display: inline-flex; gap: 4px; align-items: center; font-size: 11px; color: var(--el-text-color-secondary); cursor: pointer; user-select: none;
  input { cursor: pointer; }
}
.rc-thresh-file-filter { width: 160px; }
.rc-thresh-sort { width: 150px; }

// Cards & groups
.rc-card { border: 1px solid var(--el-border-color-lighter); border-radius: 8px; padding: 10px 14px; cursor: pointer; transition: background .12s, border-color .12s;
  &:hover { background: var(--el-fill-color-light); }
  &--high { border-left: 3px solid var(--el-color-success); }
  &--mid { border-left: 3px solid var(--el-color-warning); }
  &--low { border-left: 3px solid var(--el-text-color-secondary); }
}
.rc-card-group { margin-bottom: 8px; }
.rc-card-group-hd { display: flex; gap: 8px; align-items: center; padding: 6px 12px; background: var(--el-fill-color-lighter); border-radius: 6px; cursor: pointer; font-size: 12px;
  &:hover { background: var(--el-fill-color-light); }
}
.rc-card-group-path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; color: var(--el-text-color-primary); }
.rc-card-group-meta { font-size: 11px; color: var(--el-text-color-placeholder); }
.rc-card-group-score { font-size: 12px; font-weight: 600; font-family: "SF Mono",Menlo,monospace; }
.rc-card-hd { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
.rc-card-rank { font-size: 11px; font-weight: 700; padding: 1px 8px; background: var(--el-color-primary-light-9); color: var(--el-color-primary); border-radius: 4px; font-family: "SF Mono",Menlo,monospace; }
.rc-card-path { font-size: 11px; color: var(--el-text-color-secondary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; gap: 4px; align-items: center; }
.rc-card-meter { flex: 1; height: 4px; background: var(--el-fill-color); border-radius: 2px; overflow: hidden; }
.rc-card-meter-fill { height: 100%; border-radius: 2px; transition: width .2s;
  &--high { background: var(--el-color-success); }
  &--mid { background: var(--el-color-warning); }
  &--low { background: var(--el-text-color-secondary); }
}
.rc-card-pct { font-size: 12px; font-weight: 600; font-family: "SF Mono",Menlo,monospace;
  &--high { color: var(--el-color-success); }
  &--mid { color: var(--el-color-warning); }
  &--low { color: var(--el-text-color-secondary); }
}
.rc-card-copy { font-size: 12px; }
.rc-card-body { padding-left: 0; }
.rc-card-snip { font-size: 13px; line-height: 1.5; color: var(--el-text-color-regular); margin: 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.rc-card-meta { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; margin-bottom: 6px; }
.rc-meta-tag { font-size: 10px; padding: 0 6px; border-radius: 3px; background: var(--el-fill-color); color: var(--el-text-color-secondary);
  &--cat { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
  &--tag { background: var(--el-color-success-light-9); color: var(--el-color-success); }
}
.rc-meta-stat { font-size: 10px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-placeholder); }
.rc-meta-freshness { display: inline-flex; gap: 2px; align-items: center;
  &--stale { color: var(--el-color-danger); }
}
.rc-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 48px 0; color: var(--el-text-color-placeholder); font-size: 14px; }
.rc-empty-hint { font-size: 12px; color: var(--el-text-color-placeholder); }
</style>