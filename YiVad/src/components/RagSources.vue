<!--
  RagSources — RAG source citations shown under chat messages.
  Clicking a source chip expands an inline snippet preview.
-->
<script setup lang="ts" name="RagSources">
import { nextTick, ref, computed } from "vue";
import { ArrowRight, ArrowDown } from "@element-plus/icons-vue";
import type { RagSource } from "@/api/interface/rag";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";

const props = defineProps<{ sources: RagSource[] }>();

const { render } = useMarkdown();

const preview = ref({ visible: false, title: "", loading: false, html: "" });
const expandedIdx = ref<number | null>(null);
const expandedGroup = ref<number | null>(null);
const fullTextIdx = ref<Set<number>>(new Set());
const flashIdx = ref<number | null>(null);
const chipRefs = ref<Array<HTMLElement | null>>([]);

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

async function openPreview(path: string) {
  preview.value = { visible: true, title: path.split("/").pop() || path, loading: true, html: "" };
  try {
    const res = await readKnowledgeFile(path);
    preview.value.html = render(res.content || "");
  } catch {
    preview.value.html = "<p style='color:var(--el-color-danger)'>Failed to load.</p>";
  } finally {
    preview.value.loading = false;
  }
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

function fullSnippetText(text: string): string {
  return (text || "").trim();
}

function tagsArray(meta: RagSource["metadata"]): string[] {
  if (!meta?.tags) return [];
  if (Array.isArray(meta.tags)) return meta.tags as string[];
  return String(meta.tags).split(/[,\s]+/).filter(Boolean);
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
const barHeights = computed(() =>
  props.sources.map(s => `${Math.max(4, Math.min(100, s.score * 100))}%`)
);

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
      avgScore: chunks.reduce((a, c) => a + c.score, 0) / chunks.length,
    }))
    .sort((a, b) => b.bestScore - a.bestScore);
});
</script>

<template>
  <div v-if="props.sources.length" class="rs">
    <div class="rs-hd">
      <span>Sources ({{ props.sources.length }})</span>
      <button
        v-if="props.sources.length >= 2"
        class="rs-hd-toggle"
        :class="{ on: groupByFile }"
        :title="groupByFile ? 'Grouped by file — click to flatten' : 'Flat list — click to group by file'"
        @click="groupByFile = !groupByFile"
      >{{ groupByFile ? 'flat' : 'group' }}</button>
      <span v-if="summary" class="rs-hd-summary" :title="`Top ${(summary.top * 100).toFixed(0)}% · mean ${(summary.mean * 100).toFixed(0)}% · gap ${(summary.gap * 100).toFixed(0)}% across ${summary.n} chunk(s)`">
        <span class="rs-hd-stat" :style="{color: scoreColor(summary.top)}">top {{ (summary.top * 100).toFixed(0) }}%</span>
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
      <div v-for="(s, i) in props.sources" :key="i" class="rs-item">
        <span
          :ref="el => (chipRefs[i] = (el as HTMLElement) ?? null)"
          class="rs-chip" :class="{ 'rs-chip--flash': flashIdx === i }" :title="s.file_path"
          @click="toggleExpand(i)"
        >
          <span class="rs-chip-idx">[{{ i + 1 }}]</span>
          <span class="rs-chip-path">{{ shortPath(s.file_path) }}</span>
          <span class="rs-chip-score" :style="{color: scoreColor(s.score)}">{{ (s.score * 100).toFixed(0) }}%</span>
          <!-- Score bar — visualizes relevance (0-100%) -->
          <span class="rs-chip-bar">
            <span class="rs-chip-bar-fill" :style="{width: `${Math.max(2, Math.min(100, s.score * 100))}%`, background: scoreColor(s.score)}" />
          </span>
        </span>
        <!-- Expandable snippet -->
        <div v-if="expandedIdx === i" class="rs-snippet">
          <!-- Metadata badges — surfaces llama_index's parsed frontmatter -->
          <div v-if="s.metadata" class="rs-meta">
            <span v-if="s.metadata.category" class="rs-meta-tag rs-meta-tag--cat">{{ s.metadata.category }}</span>
            <span v-if="s.metadata.type" class="rs-meta-tag">{{ s.metadata.type }}</span>
            <span v-if="s.metadata.status" class="rs-meta-tag">{{ s.metadata.status }}</span>
            <span v-if="s.metadata.source" class="rs-meta-tag">{{ s.metadata.source }}</span>
            <span
              v-for="t in tagsArray(s.metadata).slice(0, 4)"
              :key="t"
              class="rs-meta-tag rs-meta-tag--tag"
            >#{{ t }}</span>
            <span v-if="charCount(s.metadata) != null" class="rs-meta-stat" :title="'Chunk character count'">{{ charCount(s.metadata) }}c</span>
            <span v-if="tokenEstimate(s.metadata) != null" class="rs-meta-stat" :title="'Estimated token count'">~{{ tokenEstimate(s.metadata) }}t</span>
          </div>
          <!-- Chunk text — truncated by default, expandable to full -->
          <p class="rs-snippet-text">
            <template v-if="fullTextIdx.has(i)">{{ fullSnippetText(s.text) }}</template>
            <template v-else>{{ snippetText(s.text) }}</template>
          </p>
          <div class="rs-snippet-actions">
            <button
              v-if="(s.text || '').trim().length > 200"
              class="rs-snippet-more"
              @click="toggleFullText(i)"
            >{{ fullTextIdx.has(i) ? "Show less" : "Show full chunk" }}</button>
            <button class="rs-snippet-more" @click="openPreview(s.file_path)">View full file →</button>
          </div>
        </div>
      </div>
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
          <span class="rs-group-count">{{ g.chunks.length }} {{ g.chunks.length === 1 ? 'chunk' : 'chunks' }}</span>
          <span class="rs-group-score" :style="{ color: scoreColor(g.bestScore) }" :title="`Best ${(g.bestScore * 100).toFixed(0)}% · mean ${(g.avgScore * 100).toFixed(0)}%`">
            top {{ (g.bestScore * 100).toFixed(0) }}%
          </span>
          <el-icon class="rs-group-chev"><ArrowRight v-if="expandedGroup !== gi" /><ArrowDown v-else /></el-icon>
        </div>
        <div v-if="expandedGroup === gi" class="rs-group-body">
          <div v-for="(c, ci) in g.chunks" :key="ci" class="rs-item">
            <span
              class="rs-chip"
              :title="c.file_path"
            >
              <span class="rs-chip-idx">[{{ props.sources.indexOf(c) + 1 }}]</span>
              <span class="rs-chip-path">{{ shortPath(c.file_path) }}</span>
              <span class="rs-chip-score" :style="{color: scoreColor(c.score)}">{{ (c.score * 100).toFixed(0) }}%</span>
              <span class="rs-chip-bar">
                <span class="rs-chip-bar-fill" :style="{width: `${Math.max(2, Math.min(100, c.score * 100))}%`, background: scoreColor(c.score)}" />
              </span>
            </span>
            <div class="rs-snippet">
              <p class="rs-snippet-text">{{ snippetText(c.text) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview dialog -->
    <el-dialog v-model="preview.visible" :title="preview.title" width="800px" top="5vh" append-to-body :close-on-click-modal="true">
      <div v-if="preview.loading" class="rs-fp-loading">Loading…</div>
      <div v-else class="rs-fp-body" v-html="preview.html" />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.rs { padding-top: 8px; margin-top: 8px; border-top: 1px dashed var(--el-border-color-lighter); }
.rs-hd { margin-bottom: 6px; font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: .5px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.rs-hd-summary {
  display: inline-flex; gap: 4px; align-items: center;
  font-weight: 400; text-transform: none; letter-spacing: 0;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}
.rs-hd-stat { font-size: 10px; font-family: "SF Mono", Menlo, monospace; }
.rs-hd-sep { color: var(--el-text-color-placeholder); }
.rs-hd-hist {
  display: inline-flex; gap: 1px; align-items: flex-end;
  height: 14px; padding: 0 2px; margin-left: 4px;
  border-radius: 2px;
  background: var(--el-fill-color-light);
}
.rs-hd-hist-bar {
  display: inline-block; width: 3px; min-height: 2px;
  border-radius: 1px;
}
.rs-hd-toggle {
  height: 18px; padding: 0 8px;
  font-size: 9px; font-weight: 700;
  font-family: "SF Mono", Menlo, monospace; letter-spacing: .3px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 9px; cursor: pointer; user-select: none;
  text-transform: uppercase;
  transition: color .12s, background .12s, border-color .12s;
  &:hover { color: var(--el-text-color-secondary); background: var(--el-fill-color-light); }
  &.on { color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); }
}

// ── Grouped-by-file view ──
.rs-grouped { display: flex; flex-direction: column; gap: 4px; }
.rs-group { border: 1px solid var(--el-border-color-lighter); border-radius: 6px; overflow: hidden; }
.rs-group--open { border-color: var(--el-border-color); }
.rs-group-hd {
  display: flex; gap: 6px; align-items: center;
  padding: 6px 8px; cursor: pointer;
  background: var(--el-fill-color-lighter);
  &:hover { background: var(--el-fill-color-light); }
}
.rs-group-rank {
  font-size: 10px; font-weight: 700; font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-placeholder);
}
.rs-group-path {
  flex: 1; min-width: 0;
  font-size: 11px; font-family: "SF Mono", Menlo, monospace;
  color: var(--el-color-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rs-group-count {
  font-size: 10px; color: var(--el-text-color-secondary);
  padding: 1px 5px; background: var(--el-fill-color); border-radius: 6px;
}
.rs-group-score {
  font-size: 10px; font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums; font-weight: 600;
}
.rs-group-chev { color: var(--el-text-color-placeholder); font-size: 11px; margin-left: 2px; }
.rs-group-body { padding: 6px 8px; display: flex; flex-direction: column; gap: 4px; background: var(--el-bg-color); }
.rs-group-body .rs-chip { cursor: default; opacity: 0.85; }
.rs-list { display: flex; flex-direction: column; gap: 4px; }
.rs-item { display: flex; flex-direction: column; }
.rs-chip {
  display: inline-flex; gap: 4px; align-items: center;
  max-width: 100%; padding: 2px 8px;
  font-size: 11px; line-height: 1.5;
  background: var(--el-fill-color-lighter); border-radius: 4px;
  cursor: pointer; user-select: none;
  transition: background .1s, transform .1s, box-shadow .3s;
  &:hover { background: var(--el-fill-color-light); transform: translateY(-1px); }
  align-self: flex-start;
}
.rs-chip--flash {
  background: var(--el-color-primary-light-7);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-9);
  animation: rs-flash 1.6s ease-out;
}
@keyframes rs-flash {
  0% { box-shadow: 0 0 0 0 var(--el-color-primary-light-5); }
  30% { box-shadow: 0 0 0 6px var(--el-color-primary-light-9); }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.rs-chip-idx { flex-shrink: 0; color: var(--el-color-primary); font-weight: 600; }
.rs-chip-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-regular); }
.rs-chip-score { flex-shrink: 0; font-weight: 700; font-family: "SF Mono",Menlo,monospace; font-size: 10px; }

// ── Score bar — visualizes the relevance score (0-100%) ──
.rs-chip-bar {
  flex-shrink: 0;
  width: 32px;
  height: 4px;
  margin-left: 2px;
  background: var(--el-fill-color-dark);
  border-radius: 2px;
  overflow: hidden;
}
.rs-chip-bar-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width .25s ease;
}

.rs-snippet {
  margin: 4px 0 4px 20px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-left: 3px solid var(--el-color-primary-light-5);
  border-radius: 0 6px 6px 0;
}

// ── Metadata badges — surfaces llama_index's parsed frontmatter ──
.rs-meta {
  display: flex; flex-wrap: wrap; gap: 4px;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.rs-meta-tag {
  display: inline-flex; align-items: center;
  height: 16px; padding: 0 6px;
  font-size: 9px; font-weight: 600; line-height: 1;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 8px;
}
.rs-meta-tag--cat { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.rs-meta-tag--tag { color: var(--el-color-success); background: var(--el-color-success-light-9); }
.rs-meta-stat {
  display: inline-flex; align-items: center;
  height: 16px; padding: 0 4px;
  font-size: 9px; font-weight: 600; line-height: 1;
  font-family: "SF Mono", Menlo, monospace; font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}

.rs-snippet-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  line-height: 1.55;
}
.rs-snippet-actions {
  display: flex; gap: 12px; flex-wrap: wrap;
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
  &:hover { text-decoration: underline; }
}

.rs-fp-loading { display: flex; justify-content: center; padding: 48px 0; font-size: 14px; color: var(--el-text-color-secondary); }
.rs-fp-body { max-height: 70vh; overflow-y: auto; padding: 0 4px; font-size: 14px; line-height: 1.7; color: var(--el-text-color-primary);
  :deep(h1),:deep(h2),:deep(h3) { margin: 1em 0 .5em; } :deep(h1) { font-size: 1.5em; } :deep(h2) { font-size: 1.3em; }
  :deep(p) { margin: .5em 0; } :deep(pre) { padding: 12px; overflow-x: auto; font-size: 13px; background: var(--el-fill-color); border-radius: 6px; }
  :deep(code) { font-family: "SF Mono",Menlo,monospace; font-size: .9em; }
}
</style>
