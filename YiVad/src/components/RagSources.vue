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
  try { const r = await readKnowledgeFile(path); preview.value.html = render(r.content || ""); }
  catch { preview.value.html = "<p style='color:var(--el-color-danger)'>Failed to load.</p>"; }
  finally { preview.value.loading = false; }
}

function fileName(p: string): string { return p.split("/").pop() || p; }
function scorePct(s: number): string { return `${(s * 100).toFixed(0)}%`; }
function scoreColor(s: number): string { return s >= 0.6 ? "var(--el-color-success)" : s >= 0.4 ? "var(--el-color-warning)" : "var(--el-text-color-secondary)"; }
</script>

<template>
  <div v-if="props.sources.length" class="rs">
    <div class="rs-hd">Sources</div>
    <div class="rs-list">
      <div
        v-for="(s, i) in props.sources" :key="i"
        class="rs-item" @click="openPreview(s.file_path)" :title="s.file_path"
      >
        <span class="rs-idx">{{ i + 1 }}</span>
        <span class="rs-name">{{ fileName(s.file_path) }}</span>
        <span class="rs-score" :style="{color: scoreColor(s.score)}">{{ scorePct(s.score) }}</span>
      </div>
    </div>

    <el-dialog v-model="preview.visible" :title="preview.title" width="800px" top="5vh" append-to-body :close-on-click-modal="true">
      <div v-if="preview.loading" class="rs-fp-loading">Loading…</div>
      <div v-else class="rs-fp-body" v-html="preview.html" />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.rs { padding-top: 8px; margin-top: 8px; border-top: 1px solid var(--el-border-color-lighter); }
.rs-hd { margin-bottom: 6px; font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: .5px; }
.rs-list { display: flex; flex-wrap: wrap; gap: 6px; }
.rs-item { display: inline-flex; gap: 6px; align-items: center; padding: 3px 10px; font-size: 12px; background: var(--el-fill-color-lighter); border-radius: 6px; cursor: pointer; transition: background .12s; &:hover { background: var(--el-fill-color-light); } }
.rs-idx { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; background: var(--el-color-primary); border-radius: 50%; flex-shrink: 0; }
.rs-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; font-weight: 500; color: var(--el-text-color-regular); }
.rs-score { flex-shrink: 0; font-size: 11px; font-weight: 700; font-family: "SF Mono",Menlo,monospace; }

.rs-fp-loading { display: flex; justify-content: center; padding: 48px 0; font-size: 14px; color: var(--el-text-color-secondary); }
.rs-fp-body { max-height: 70vh; overflow-y: auto; padding: 0 4px; font-size: 14px; line-height: 1.7; color: var(--el-text-color-primary);
  :deep(h1),:deep(h2),:deep(h3) { margin: 1em 0 .5em; } :deep(h1) { font-size: 1.5em; } :deep(h2) { font-size: 1.3em; }
  :deep(p) { margin: .5em 0; } :deep(pre) { padding: 12px; overflow-x: auto; font-size: 13px; background: var(--el-fill-color); border-radius: 6px; }
  :deep(code) { font-family: "SF Mono",Menlo,monospace; font-size: .9em; }
}
</style>
