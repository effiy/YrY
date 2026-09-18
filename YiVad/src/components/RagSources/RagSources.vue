<!--
  RagSources — RAG source citations shown under chat messages.
  Clicking a source chip expands an inline snippet preview.
-->
<script setup lang="ts" name="RagSources">
import { nextTick, ref, computed, watch } from "vue";
import { ArrowRight, ArrowDown } from "@element-plus/icons-vue";
import type { RagSource } from "@/api/interface/rag";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

const props = defineProps<{ sources: RagSource[] }>();

const previewDialogRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const expandedIdx = ref<number | null>(0);
const expandedGroup = ref<number | null>(null);
const fullTextIdx = ref<Set<number>>(new Set());
const flashIdx = ref<number | null>(null);
const sourceFilter = ref("");
const chipRefs = ref<Array<HTMLElement | null>>([]);
/** Collapse long source lists — show only first N by default. */
const showAll = ref(false);
const INITIAL_VISIBLE = 5;

// Reset showAll when sources change (new message)
watch(
  () => props.sources,
  () => {
    showAll.value = false;
    expandedIdx.value = props.sources.length > 0 ? 0 : null;
  }
);

function toggleExpand(idx: number) {
  expandedIdx.value = expandedIdx.value === idx ? null : idx;
}

function toggleFullText(idx: number) {
  const s = new Set(fullTextIdx.value);
  if (s.has(idx)) s.delete(idx);
  else s.add(idx);
  fullTextIdx.value = s;
}

/** Programmatically focus a source: expand its snippet, scroll into view,
 *  and briefly flash the chip so the user sees which one was cited.
 *  Called by MessageBubble's inline `[N]` chips via template ref. */
async function focusSource(idx: number) {
  if (idx < 0 || idx >= props.sources.length) return;
  expandedIdx.value = idx;
  flashIdx.value = idx;
  await nextTick();
  chipRefs.value[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  setTimeout(() => {
    if (flashIdx.value === idx) flashIdx.value = null;
  }, 1600);
}

defineExpose({ focusSource });

function openPreview(path: string) {
  previewDialogRef.value?.open(path);
}

function shortPath(p: string): string {
  const parts = p.split("/");
  if (parts.length <= 2) return p;
  return `…/${parts.slice(-2).join("/")}`;
}

function scoreColor(s: number): string {
  if (s >= 0.7) return "var(--el-color-success)";
  if (s >= 0.4) return "var(--el-color-warning)";
  return "var(--el-text-color-secondary)";
}

function snippetText(text: string, max = 200): string {
  const t = (text || "").replace(/\n+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

/** Extract a brief content preview (~50 chars) from source text.
 *  Strips markdown headings, code fences, and leading whitespace
 *  to surface the actual content, not formatting syntax. */
function contentPreview(text: string, max = 50): string {
  const t = (text || "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function fullSnippetText(text: string): string {
  return (text || "").trim();
}

function tagsArray(meta: RagSource["metadata"]): string[] {
  if (!meta?.tags) return [];
  if (Array.isArray(meta.tags)) return meta.tags as string[];
  return String(meta.tags)
    .split(/[,\s]+/)
    .filter(Boolean);
}

function charCount(meta: RagSource["metadata"]): number | null {
  const n = meta?.char_count;
  return typeof n === "number" ? n : null;
}

function tokenEstimate(meta: RagSource["metadata"]): number | null {
  const n = meta?.token_estimate;
  return typeof n === "number" ? n : null;
}

/** Retrieval-quality summary for the source list — surfaces top score,
 *  mean, count, and the top-worst gap. A small gap + high mean = tight,
 *  well-clustered retrieval; a large gap = one canonical chunk stood out
 *  amid less-relevant ones. Shown as a one-line header above the chips. */
const summary = computed(() => {
  const n = props.sources.length;
  if (!n) return null;
  const scores = props.sources.map(s => s.score);
  const top = Math.max(...scores);
  const worst = Math.min(...scores);
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  return { n, top, worst, mean, gap: top - worst };
});

/** Mini score-distribution histogram — one bar per source, height = score.
 *  Visualizes the shape of retrieval: cliff (one dominant chunk), plateau
 *  (even relevance), or long tail (most chunks weak). Renders inline next
 *  to the summary text so the user can read retrieval quality at a glance. */
const barHeights = computed(() => props.sources.map(s => `${Math.max(4, Math.min(100, s.score * 100))}%`));

/** Filtered sources — search by file path or chunk text. */
const filteredSources = computed(() => {
  const q = sourceFilter.value.toLowerCase().trim();
  if (!q) return props.sources;
  return props.sources.filter(s => (s.file_path || "").toLowerCase().includes(q) || (s.text || "").toLowerCase().includes(q));
});

/** Sources visible in the flat list — collapsed when > INITIAL_VISIBLE. */
const visibleSources = computed(() => {
  if (showAll.value || sourceFilter.value) return filteredSources.value;
  return filteredSources.value.slice(0, INITIAL_VISIBLE);
});

const hiddenCount = computed(() => Math.max(0, filteredSources.value.length - INITIAL_VISIBLE));

/** Group sources by file_path — surfaces which documents contributed
 *  multiple retrieved chunks (a sign of canonical reference docs) vs
 *  which contributed only one. Toggle button switches between flat list
 *  (current) and grouped-by-file view. */
const groupByFile = ref(false);
const groupedSources = computed(() => {
  const map = new Map<string, RagSource[]>();
  for (const s of props.sources) {
    const k = s.file_path || "(unknown)";
    const arr = map.get(k);
    if (arr) arr.push(s);
    else map.set(k, [s]);
  }
  // Sort groups by best score (descending) so canonical docs float up
  return [...map.entries()]
    .map(([file_path, chunks]) => ({
      file_path,
      chunks: chunks.sort((a, b) => b.score - a.score),
      bestScore: Math.max(...chunks.map(c => c.score)),
      avgScore: chunks.reduce((a, c) => a + c.score, 0) / chunks.length
    }))
    .sort((a, b) => b.bestScore - a.bestScore);
});
</script>

<template>
  <div v-if="props.sources.length" class="rs">
    <div class="rs-hd">
      <span>Sources ({{ props.sources.length }})</span>
      <input v-if="props.sources.length >= 3" v-model="sourceFilter" class="rs-hd-filter" placeholder="filter…" @click.stop />
      <button
        v-if="props.sources.length >= 2"
        class="rs-hd-toggle"
        :class="{ on: groupByFile }"
        :title="groupByFile ? 'Grouped by file — click to flatten' : 'Flat list — click to group by file'"
        @click="groupByFile = !groupByFile"
      >
        {{ groupByFile ? "flat" : "group" }}
      </button>
      <span
        v-if="summary"
        class="rs-hd-summary"
        :title="`Top ${(summary.top * 100).toFixed(0)}% · mean ${(summary.mean * 100).toFixed(0)}% · gap ${(summary.gap * 100).toFixed(0)}% across ${summary.n} chunk(s)`"
      >
        <span class="rs-hd-stat" :style="{ color: scoreColor(summary.top) }">top {{ (summary.top * 100).toFixed(0) }}%</span>
        <span class="rs-hd-sep">·</span>
        <span class="rs-hd-stat">mean {{ (summary.mean * 100).toFixed(0) }}%</span>
        <span class="rs-hd-sep">·</span>
        <span class="rs-hd-stat">Δ {{ (summary.gap * 100).toFixed(0) }}%</span>
        <!-- Inline histogram — one bar per source, color = score bucket -->
        <span class="rs-hd-hist" aria-hidden="true">
          <span
            v-for="(h, i) in barHeights"
            :key="i"
            class="rs-hd-hist-bar"
            :style="{ height: h, background: scoreColor(props.sources[i].score) }"
          />
        </span>
      </span>
    </div>
    <div v-if="!groupByFile" class="rs-list">
      <div v-if="!filteredSources.length && sourceFilter" class="rs-empty">No sources match "{{ sourceFilter }}"</div>
      <div v-for="(s, i) in visibleSources" :key="i" class="rs-item">
        <span
          :ref="el => (chipRefs[i] = (el as HTMLElement) ?? null)"
          class="rs-chip"
          :class="{ 'rs-chip--flash': flashIdx === i }"
          :title="s.file_path"
          @click="toggleExpand(i)"
        >
          <span class="rs-chip-idx">[{{ props.sources.indexOf(s) + 1 }}]</span>
          <span class="rs-chip-path">{{ shortPath(s.file_path) }}</span>
          <span class="rs-chip-score" :style="{ color: scoreColor(s.score) }">{{ (s.score * 100).toFixed(0) }}%</span>
          <span class="rs-chip-bar">
            <span
              class="rs-chip-bar-fill"
              :style="{ width: `${Math.max(2, Math.min(100, s.score * 100))}%`, background: scoreColor(s.score) }"
            />
          </span>
        </span>
        <div v-if="contentPreview(s.text)" class="rs-preview" @click="toggleExpand(i)">
          {{ s.metadata?.title || contentPreview(s.text) }}
        </div>
        <div v-if="expandedIdx === i" class="rs-snippet">
          <div v-if="s.metadata" class="rs-meta">
            <span v-if="s.metadata.category" class="rs-meta-tag rs-meta-tag--cat">{{ s.metadata.category }}</span>
            <span v-if="s.metadata.type" class="rs-meta-tag">{{ s.metadata.type }}</span>
            <span v-if="s.metadata.status" class="rs-meta-tag">{{ s.metadata.status }}</span>
            <span v-if="s.metadata.source" class="rs-meta-tag">{{ s.metadata.source }}</span>
            <span v-for="t in tagsArray(s.metadata).slice(0, 4)" :key="t" class="rs-meta-tag rs-meta-tag--tag">#{{ t }}</span>
            <span v-if="charCount(s.metadata) != null" class="rs-meta-stat" :title="'Chunk character count'"
              >{{ charCount(s.metadata) }}c</span
            >
            <span v-if="tokenEstimate(s.metadata) != null" class="rs-meta-stat" :title="'Estimated token count'"
              >~{{ tokenEstimate(s.metadata) }}t</span
            >
          </div>
          <p class="rs-snippet-text">
            <template v-if="fullTextIdx.has(i)">{{ fullSnippetText(s.text) }}</template>
            <template v-else>{{ snippetText(s.text) }}</template>
          </p>
          <div class="rs-snippet-actions">
            <button v-if="(s.text || '').trim().length > 200" class="rs-snippet-more" @click="toggleFullText(i)">
              {{ fullTextIdx.has(i) ? "Show less" : "Show full chunk" }}
            </button>
            <button class="rs-snippet-more" @click="openPreview(s.file_path)">View full file →</button>
          </div>
        </div>
      </div>
      <button v-if="hiddenCount > 0 && !sourceFilter" class="rs-show-more" @click="showAll = true">
        Show {{ hiddenCount }} more source{{ hiddenCount > 1 ? "s" : "" }} ↓
      </button>
    </div>

    <!-- Grouped-by-file view — chunks collapsed under their source file.
         Each group shows file path + chunk count + best score; click to
         expand the chunk list inline. Surfaces which documents contributed
         multiple retrieved chunks (canonical reference docs). -->
    <div v-else class="rs-grouped">
      <div
        v-for="(g, gi) in groupedSources"
        :key="g.file_path"
        class="rs-group"
        :class="{ 'rs-group--open': expandedGroup === gi }"
      >
        <div class="rs-group-hd" @click="expandedGroup = expandedGroup === gi ? null : gi">
          <span class="rs-group-rank">#{{ gi + 1 }}</span>
          <span class="rs-group-path" :title="g.file_path">{{ shortPath(g.file_path) }}</span>
          <span class="rs-group-count">{{ g.chunks.length }} {{ g.chunks.length === 1 ? "chunk" : "chunks" }}</span>
          <span
            class="rs-group-score"
            :style="{ color: scoreColor(g.bestScore) }"
            :title="`Best ${(g.bestScore * 100).toFixed(0)}% · mean ${(g.avgScore * 100).toFixed(0)}%`"
          >
            top {{ (g.bestScore * 100).toFixed(0) }}%
          </span>
          <el-icon class="rs-group-chev"><ArrowRight v-if="expandedGroup !== gi" /><ArrowDown v-else /></el-icon>
        </div>
        <div v-if="expandedGroup === gi" class="rs-group-body">
          <div v-for="(c, ci) in g.chunks" :key="ci" class="rs-item">
            <span class="rs-chip" :title="c.file_path">
              <span class="rs-chip-idx">[{{ props.sources.indexOf(c) + 1 }}]</span>
              <span class="rs-chip-path">{{ shortPath(c.file_path) }}</span>
              <span class="rs-chip-score" :style="{ color: scoreColor(c.score) }">{{ (c.score * 100).toFixed(0) }}%</span>
              <span class="rs-chip-bar">
                <span
                  class="rs-chip-bar-fill"
                  :style="{ width: `${Math.max(2, Math.min(100, c.score * 100))}%`, background: scoreColor(c.score) }"
                />
              </span>
            </span>
            <div v-if="contentPreview(c.text)" class="rs-preview">{{ c.metadata?.title || contentPreview(c.text) }}</div>
            <div class="rs-snippet">
              <p class="rs-snippet-text">{{ snippetText(c.text) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview dialog -->
    <KnowledgePreviewDialog ref="previewDialogRef" />
  </div>
</template>

<style scoped lang="scss">
.rs {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);
}
.rs-hd {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.rs-hd-summary {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
  text-transform: none;
  letter-spacing: 0;
}
.rs-hd-stat {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
}
.rs-hd-sep {
  color: var(--el-text-color-placeholder);
}
.rs-hd-hist {
  display: inline-flex;
  gap: 1px;
  align-items: flex-end;
  height: 14px;
  padding: 0 2px;
  margin-left: 4px;
  background: var(--el-fill-color-light);
  border-radius: 2px;
}
.rs-hd-hist-bar {
  display: inline-block;
  width: 3px;
  min-height: 2px;
  border-radius: 1px;
}
.rs-hd-filter {
  width: 100px;
  height: 18px;
  padding: 0 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  outline: none;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 9px;
  &:focus {
    border-color: var(--el-color-primary);
  }
}
.rs-empty {
  padding: 12px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.rs-hd-toggle {
  height: 18px;
  padding: 0 8px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 9px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  cursor: pointer;
  user-select: none;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 9px;
  transition:
    color var(--transition-instant),
    background var(--transition-instant),
    border-color var(--transition-instant);
  &:hover {
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
  }
  &.on {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}

// ── Grouped-by-file view ──
.rs-grouped {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rs-group {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
.rs-group--open {
  border-color: var(--el-border-color);
}
.rs-group-hd {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.rs-group-rank {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
}
.rs-group-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  white-space: nowrap;
}
.rs-group-count {
  padding: 1px 5px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 6px;
}
.rs-group-score {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.rs-group-chev {
  margin-left: 2px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.rs-group-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  background: var(--el-bg-color);
}
.rs-group-body .rs-chip {
  cursor: default;
  opacity: 0.85;
}
.rs-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rs-item {
  display: flex;
  flex-direction: column;
}
.rs-chip {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  align-self: flex-start;
  max-width: 100%;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.5;
  cursor: pointer;
  user-select: none;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  transition:
    background var(--transition-instant),
    transform var(--transition-instant),
    box-shadow 0.3s;
  &:hover {
    background: var(--el-fill-color-light);
    transform: translateY(-1px);
  }
}

// ── Inline content preview — first ~50 chars of the chunk text ──
.rs-preview {
  max-width: calc(100% - 20px);
  padding: 0 4px;
  margin: 2px 0 0 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: var(--el-text-color-regular);
  }
}
.rs-chip--flash {
  background: var(--el-color-primary-light-7);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-9);
  animation: rs-flash 1.6s ease-out;
}

@keyframes rs-flash {
  0% {
    box-shadow: 0 0 0 0 var(--el-color-primary-light-5);
  }
  30% {
    box-shadow: 0 0 0 6px var(--el-color-primary-light-9);
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}
.rs-chip-idx {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--el-color-primary);
}
.rs-chip-path {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}
.rs-chip-score {
  flex-shrink: 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 700;
}

// ── Score bar — visualizes the relevance score (0-100%) ──
.rs-chip-bar {
  flex-shrink: 0;
  width: 32px;
  height: 4px;
  margin-left: 2px;
  overflow: hidden;
  background: var(--el-fill-color-dark);
  border-radius: 2px;
}
.rs-chip-bar-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width var(--transition-fast) ease;
}
.rs-snippet {
  padding: 8px 12px;
  margin: 4px 0 4px 20px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-left: 3px solid var(--el-color-primary-light-5);
  border-radius: 0 6px 6px 0;
}

// ── Metadata badges — surfaces llama_index's parsed frontmatter ──
.rs-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.rs-meta-tag {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding: 0 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 8px;
}
.rs-meta-tag--cat {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.rs-meta-tag--tag {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.rs-meta-stat {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding: 0 4px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 9px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-placeholder);
}
.rs-snippet-text {
  margin: 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  line-height: 1.55;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
.rs-snippet-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}
.rs-snippet-more {
  display: inline-block;
  padding: 0;
  font-size: 11px;
  color: var(--el-color-primary);
  cursor: pointer;
  background: none;
  border: none;
  &:hover {
    text-decoration: underline;
  }
}
.rs-show-more {
  display: block;
  width: 100%;
  padding: 6px 0;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px dashed var(--el-border-color-light);
  border-radius: 4px;
  transition: all var(--transition-instant);
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
</style>
