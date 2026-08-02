<!--
  RagSources — RAG source citations shown under chat messages.
  Clicking a source chip expands an inline snippet preview.
-->
<script setup lang="ts">
import { ref } from "vue";
import type { RagSource } from "@/api/interface/rag";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";

const props = defineProps<{ sources: RagSource[] }>();

const { render } = useMarkdown();

const preview = ref({ visible: false, title: "", loading: false, html: "" });
const expandedIdx = ref<number | null>(null);

function toggleExpand(idx: number) {
  expandedIdx.value = expandedIdx.value === idx ? null : idx;
}

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
</script>

<template>
  <div v-if="props.sources.length" class="rs">
    <div class="rs-hd">Sources ({{ props.sources.length }})</div>
    <div class="rs-list">
      <div v-for="(s, i) in props.sources" :key="i" class="rs-item">
        <span
          class="rs-chip" :title="s.file_path"
          @click="toggleExpand(i)"
        >
          <span class="rs-chip-idx">[{{ i + 1 }}]</span>
          <span class="rs-chip-path">{{ shortPath(s.file_path) }}</span>
          <span class="rs-chip-score" :style="{color: scoreColor(s.score)}">{{ (s.score * 100).toFixed(0) }}%</span>
        </span>
        <!-- Expandable snippet -->
        <div v-if="expandedIdx === i" class="rs-snippet">
          <p class="rs-snippet-text">{{ snippetText(s.text) }}</p>
          <button class="rs-snippet-more" @click="openPreview(s.file_path)">View full file →</button>
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
.rs-hd { margin-bottom: 6px; font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: .5px; }
.rs-list { display: flex; flex-direction: column; gap: 4px; }
.rs-item { display: flex; flex-direction: column; }
.rs-chip {
  display: inline-flex; gap: 4px; align-items: center;
  max-width: 100%; padding: 2px 8px;
  font-size: 11px; line-height: 1.5;
  background: var(--el-fill-color-lighter); border-radius: 4px;
  cursor: pointer; user-select: none;
  transition: background .1s, transform .1s;
  &:hover { background: var(--el-fill-color-light); transform: translateY(-1px); }
  align-self: flex-start;
}
.rs-chip-idx { flex-shrink: 0; color: var(--el-color-primary); font-weight: 600; }
.rs-chip-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-regular); }
.rs-chip-score { flex-shrink: 0; font-weight: 700; font-family: "SF Mono",Menlo,monospace; font-size: 10px; }

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
.rs-snippet-text {
  margin: 0;
}
.rs-snippet-more {
  display: inline-block;
  margin-top: 6px;
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
