<script setup lang="ts">
/**
 * KnowledgeDropZone — drag-and-drop target for knowledge files.
 * Extracted from AiChatBox.vue: wraps children in a drop zone with overlay.
 */
import { ref } from 'vue';
import { readKnowledgeFile } from '@/api/modules/knowledgeService';

const emit = defineEmits<{
  fileDrop: [files: Array<{ path: string; content: string; title: string; tags: string[] }>];
}>();

const isDragOver = ref(false);
let dragOverCounter = 0;
const MIME = 'application/x-knowledge-file';

function onDragOver(e: DragEvent) {
  if (!e.dataTransfer?.types.includes(MIME)) return;
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'link';
}

function onDragEnter(e: DragEvent) {
  if (!e.dataTransfer?.types.includes(MIME)) return;
  e.preventDefault();
  dragOverCounter++;
  isDragOver.value = true;
}

function onDragLeave(_e: DragEvent) {
  dragOverCounter--;
  if (dragOverCounter <= 0) { dragOverCounter = 0; isDragOver.value = false; }
}

function collectFiles(nodes: any[]): Array<{ path: string; content: string; title: string; tags: string[] }> {
  const out: Array<{ path: string; content: string; title: string; tags: string[] }> = [];
  for (const n of nodes) {
    if (n.type === 'file') out.push({ path: n.path, content: n.content || '', title: n.name, tags: n.tags || [] });
    if (n.children?.length) out.push(...collectFiles(n.children));
  }
  return out;
}

async function onDrop(e: DragEvent) {
  isDragOver.value = false;
  dragOverCounter = 0;
  const raw = e.dataTransfer?.getData(MIME);
  if (!raw) return;
  e.preventDefault();
  try {
    const parsed = JSON.parse(raw);
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    const files = collectFiles(nodes);
    const needsContent = files.filter((f) => !f.content && f.path);
    if (needsContent.length) {
      const results = await Promise.allSettled(needsContent.map((f) => readKnowledgeFile(f.path).catch(() => null)));
      results.forEach((r, i) => { if (r.status === 'fulfilled' && r.value) needsContent[i].content = r.value.content || ''; });
    }
    emit('fileDrop', files);
  } catch { /* ignore */ }
}
</script>

<template>
  <div
    class="ai-chat-box__chat"
    :class="{ 'is-drag-over': isDragOver }"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <slot />
    <div v-if="isDragOver" class="ai-chat-box__drop-overlay">
      <div class="ai-chat-box__drop-hint">
        <span class="ai-chat-box__drop-icon">📄</span>
        <span>Drop to start a new chat session</span>
      </div>
    </div>
  </div>
</template>