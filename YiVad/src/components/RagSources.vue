<!--
  RagSources — RAG source citations shown under chat messages.
  Clicking a source chip opens a markdown file preview dialog.
-->
<script setup lang="ts">
import { ref } from "vue";
import type { RagSource } from "@/api/interface/rag";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";

const props = defineProps<{ sources: RagSource[] }>();

const { render } = useMarkdown();

const preview = ref({ visible: false, title: "", loading: false, html: "" });

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
</script>

<template>
  <div v-if="props.sources.length" class="rs">
    <div class="rs-hd">Sources</div>
    <div class="rs-list">
      <span
        v-for="(s, i) in props.sources" :key="i"
        class="rs-chip" :title="s.file_path"
        @click="openPreview(s.file_path)"
      >
        <span class="rs-chip-idx">[{{ i + 1 }}]</span>
        <span class="rs-chip-path">{{ shortPath(s.file_path) }}</span>
        <span class="rs-chip-score" :style="{color: scoreColor(s.score)}">{{ (s.score * 100).toFixed(0) }}%</span>
      </span>
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
.rs-list { display: flex; flex-wrap: wrap; gap: 4px; }
.rs-chip {
  display: inline-flex; gap: 4px; align-items: center;
  max-width: 320px; padding: 2px 8px;
  font-size: 11px; line-height: 1.5;
  background: var(--el-fill-color-lighter); border-radius: 4px;
  cursor: pointer; user-select: none;
  transition: background .1s, transform .1s;
  &:hover { background: var(--el-fill-color-light); transform: translateY(-1px); }
}
.rs-chip-idx { flex-shrink: 0; color: var(--el-color-primary); font-weight: 600; }
.rs-chip-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-regular); }
.rs-chip-score { flex-shrink: 0; font-weight: 700; font-family: "SF Mono",Menlo,monospace; font-size: 10px; }

.rs-fp-loading { display: flex; justify-content: center; padding: 48px 0; font-size: 14px; color: var(--el-text-color-secondary); }
.rs-fp-body { max-height: 70vh; overflow-y: auto; padding: 0 4px; font-size: 14px; line-height: 1.7; color: var(--el-text-color-primary);
  :deep(h1),:deep(h2),:deep(h3) { margin: 1em 0 .5em; } :deep(h1) { font-size: 1.5em; } :deep(h2) { font-size: 1.3em; }
  :deep(p) { margin: .5em 0; } :deep(pre) { padding: 12px; overflow-x: auto; font-size: 13px; background: var(--el-fill-color); border-radius: 6px; }
  :deep(code) { font-family: "SF Mono",Menlo,monospace; font-size: .9em; }
}
</style>
