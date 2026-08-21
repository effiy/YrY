<script setup lang="ts">
/**
 * YiPet Chat — KnowledgeSidebar (Vue 3 SFC)
 * Mirrors YiVad aiChat's ConversationSidebar (`ai-chat__side`): a knowledge
 * file-tree browser with search, metadata sync, folder collapse, file-click
 * preview, and drag-to-chat.
 */
import { computed, onMounted, ref } from 'vue';
import { useChatStore } from '../stores/chat';
import type { KnowledgeTreeNode } from '@/api/types';

const store = useChatStore();
const s = store.state;

const searchQuery = ref('');
const collapsedFolders = ref<Set<string>>(new Set());

interface DisplayItem {
  node: KnowledgeTreeNode;
  depth: number;
  key: string;
}

function flatten(nodes: KnowledgeTreeNode[], depth = 0): DisplayItem[] {
  const out: DisplayItem[] = [];
  for (const n of nodes) {
    const key = n.type === 'folder' ? `folder:${n.path}` : n.path;
    out.push({ node: n, depth, key });
    if (n.type === 'folder' && n.children?.length) out.push(...flatten(n.children, depth + 1));
  }
  return out;
}

const allItems = computed(() => flatten(s.knowledgeTree));

const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return allItems.value;
  return allItems.value.filter(
    (i) => i.node.name.toLowerCase().includes(q) || i.node.path.toLowerCase().includes(q),
  );
});

const visibleItems = computed(() => {
  const collapsed = collapsedFolders.value;
  const out: DisplayItem[] = [];
  let skipDepth = -1;
  for (const item of filteredItems.value) {
    if (skipDepth >= 0) {
      if (item.depth > skipDepth) continue;
      skipDepth = -1;
    }
    if (item.node.type === 'folder' && collapsed.has(item.key)) {
      out.push(item);
      skipDepth = item.depth;
    } else {
      out.push(item);
    }
  }
  return out;
});

function toggleFolder(key: string) {
  const next = new Set(collapsedFolders.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  collapsedFolders.value = next;
}

function openFile(node: KnowledgeTreeNode) {
  store.openKnowledgePreview(node.path);
}

function fmtSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function onDragStart(e: DragEvent, node: KnowledgeTreeNode) {
  if (node.type !== 'file') return;
  e.dataTransfer!.effectAllowed = 'link';
  e.dataTransfer!.setData('application/x-yipet-knowledge-file', node.path);
  e.dataTransfer!.setData('text/plain', node.name);
}

onMounted(() => {
  if (s.knowledgeTree.length === 0) store.loadKnowledgeTree();
});
</script>

<template>
  <div class="ks-sidebar">
    <div class="ks-header">
      <input
        v-model="searchQuery"
        type="text"
        class="ks-search"
        placeholder="Search knowledge..."
        aria-label="Search knowledge"
      />
      <button
        type="button"
        class="ks-sync"
        :disabled="s.knowledgeSyncing"
        title="Sync metadata from YiKnowledge directory"
        @click="store.syncKnowledge()"
      >
        {{ s.knowledgeSyncing ? '…' : '↻' }}
      </button>
      <span class="ks-hint" title="Drag files to the chat area to start a session">Drag → Chat</span>
    </div>

    <div class="ks-list">
      <div v-if="s.knowledgeLoading && !s.knowledgeTree.length" class="ks-empty">Loading knowledge...</div>
      <div v-else-if="s.knowledgeError" class="ks-empty ks-error">
        <p>{{ s.knowledgeError }}</p>
        <button type="button" class="ks-retry" @click="store.loadKnowledgeTree()">Retry</button>
      </div>
      <div v-else-if="!visibleItems.length" class="ks-empty">
        {{ searchQuery ? 'No matching knowledge' : 'No knowledge files' }}
      </div>
      <div
        v-for="item in visibleItems"
        v-else
        :key="item.key"
        class="ks-item"
        :class="{ 'is-folder': item.node.type === 'folder' }"
        :style="{ paddingLeft: item.depth * 14 + 8 + 'px' }"
        :draggable="item.node.type === 'file'"
        @dragstart="onDragStart($event, item.node)"
      >
        <span
          class="ks-item-icon"
          :class="{ 'is-clickable': item.node.type === 'folder' }"
          @click="item.node.type === 'folder' && toggleFolder(item.key)"
        >
          {{ item.node.type === 'folder' ? (collapsedFolders.has(item.key) ? '📁' : '📂') : '📄' }}
        </span>
        <span
          class="ks-item-name"
          :class="{ 'is-clickable': item.node.type === 'file' }"
          :title="item.node.path"
          @click="item.node.type === 'file' && openFile(item.node)"
        >{{ item.node.name }}</span>
        <span v-if="item.node.type === 'folder'" class="ks-item-count">{{ item.node.children?.length ?? 0 }}</span>
        <span v-else class="ks-item-size">{{ fmtSize(item.node.size) }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ks-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.ks-header {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
}

.ks-search {
  flex: 1;
  min-width: 0;
  height: 26px;
  padding: 0 8px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 6px;
  background: var(--input-bg, #181730);
  color: var(--text-primary, #f5f3ff);
  font-size: 12px;

  &::placeholder { color: var(--text-secondary, #d4d0e8); opacity: 0.5; }
  &:focus { outline: none; border-color: var(--primary-light, #818cf8); }
}

.ks-sync {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  border-radius: 6px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  color: var(--primary-light, #818cf8);
  font-size: 13px;
  cursor: pointer;

  &:hover:not(:disabled) { background: rgba(var(--primary-rgb, 99, 102, 241), 0.2); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.ks-hint {
  flex-shrink: 0;
  padding: 2px 6px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  border-radius: 4px;
  white-space: nowrap;
}

.ks-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.ks-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: default;

  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.08); }
}

.ks-item-icon {
  flex-shrink: 0;
  font-size: 13px;

  &.is-clickable { cursor: pointer; }
}

.ks-item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary, #f5f3ff);

  &.is-clickable { cursor: pointer; }
  &.is-clickable:hover { color: var(--primary-light, #818cf8); }
}

.ks-item.is-folder .ks-item-name { font-weight: 600; }

.ks-item-count {
  flex-shrink: 0;
  padding: 0 6px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  border-radius: 8px;
}

.ks-item-size {
  flex-shrink: 0;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  opacity: 0.7;
}

.ks-empty {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);

  p { margin: 0 0 8px; }
}

.ks-error { color: #ff4d4f; }

.ks-retry {
  padding: 3px 10px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  border-radius: 4px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  color: var(--primary-light, #818cf8);
  font-size: 11px;
  cursor: pointer;

  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.2); }
}
</style>
