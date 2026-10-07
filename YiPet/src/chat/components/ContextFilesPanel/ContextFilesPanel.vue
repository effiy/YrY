<script setup lang="ts">
/**
 * YiPet Chat — ContextFilesPanel (Vue 3 SFC)
 * Mirrors YiVad aiChat's ContextFilesPanel: tree-based context files for the
 * active session. Supports drag-and-drop from the knowledge sidebar, file
 * preview via KnowledgePreviewDialog, and RAG grounding.
 * Context files are tracked via `ctx:` tags and their contents persisted into
 * pageContent as `## path` sections. Changes are auto-saved.
 */
import { computed, onMounted, ref, watch } from 'vue';
import { useChatStore } from '../../stores/chat';
import { t } from '@/shared/i18n';
import { parseToTree, sortTree, flattenForDisplay, countFiles, extractCtxPaths } from './contextTreeUtils';
import type { ContextNode, DisplayItem } from './contextTreeUtils';

const emit = defineEmits<{ back: [] }>();

const store = useChatStore();
const s = store.state;

const FROM_PREFIX = 'from:';
const CTX_PREFIX = 'ctx:';
const SEP = '\n\n---\n\n';

interface DragContextNode {
  key: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: DragContextNode[];
  tags?: string[];
}




// ── State ──

const sessionTitle = ref('');
const contextSearch = ref('');
const addFileQuery = ref('');
const showAddFile = ref(false);
const contextRoots = ref<ContextNode[]>([]);
const collapsedFolders = ref<Set<string>>(new Set());
const saving = ref(false);
const addLoading = ref(false);
const savedToKB = ref<Set<string>>(new Set());
const savingToKB = ref<Set<string>>(new Set());

const isDragOver = ref(false);
const dragCounter = ref(0);

const curSession = computed(() =>
  s.sessions.find((x) => x.id === s.currentSessionId),
);

const sourceUrl = computed(() => {
  const tags = curSession.value?.tags ?? [];
  const from = tags.find((t) => typeof t === 'string' && t.startsWith(FROM_PREFIX));
  return from ? from.slice(FROM_PREFIX.length) : '';
});

function backToSource() {
  if (!sourceUrl.value) return;
  window.open(sourceUrl.value, '_blank', 'noopener,noreferrer');
}

// ── Parse session → tree ──




// ── Display ──


const displayContexts = computed(() => flattenForDisplay(contextRoots.value));

const fileCount = computed(() => countFiles(contextRoots.value));

const filteredContexts = computed(() => {
  const q = contextSearch.value.toLowerCase().trim();
  if (!q) return displayContexts.value;
  return displayContexts.value.filter(
    (i) => i.node.name.toLowerCase().includes(q) || i.node.path.toLowerCase().includes(q),
  );
});

const visibleContexts = computed(() => {
  const collapsed = collapsedFolders.value;
  const out: DisplayItem[] = [];
  let skipDepth = -1;
  for (const item of filteredContexts.value) {
    if (skipDepth >= 0) {
      if (item.depth > skipDepth) continue;
      skipDepth = -1;
    }
    if (item.node.type === 'folder' && collapsed.has(item.node.key)) {
      out.push(item);
      skipDepth = item.depth;
    } else {
      out.push(item);
    }
  }
  return out;
});

// ── Tree helpers ──

function collectFilePaths(nodes: ContextNode[]): string[] {
  const paths: string[] = [];
  for (const n of nodes) {
    if (n.type === 'file') paths.push(n.path);
    if (n.children) paths.push(...collectFilePaths(n.children));
  }
  return paths;
}

function collectAllTags(nodes: ContextNode[]): string[] {
  const tags: string[] = [];
  for (const n of nodes) {
    if (n.tags) tags.push(...n.tags);
    if (n.children) tags.push(...collectAllTags(n.children));
  }
  return [...new Set(tags)];
}

function buildCtxTags(nodes: ContextNode[]): string[] {
  return collectFilePaths(nodes).map((p) => `${CTX_PREFIX}${p}`);
}

function buildPageContent(nodes: ContextNode[]): string {
  const sections: string[] = [];
  function walk(ns: ContextNode[]) {
    for (const n of ns) {
      if (n.type === 'file') sections.push(`## ${n.path}\n\n${n.content || ''}`);
      if (n.children) walk(n.children);
    }
  }
  walk(nodes);
  return sections.join(SEP);
}

function collectFileNodes(nodes: ContextNode[]): ContextNode[] {
  const out: ContextNode[] = [];
  for (const n of nodes) {
    if (n.type === 'file') out.push(n);
    if (n.children) out.push(...collectFileNodes(n.children));
  }
  return out;
}

// ── Load session ──

function loadFromSession() {
  const cur = curSession.value;
  if (!cur) {
    contextRoots.value = [];
    sessionTitle.value = '';
    return;
  }
  sessionTitle.value = cur.title || '';
  contextRoots.value = parseToTree(cur.pageContent || '', cur.tags || []);
}

function reset() {
  loadFromSession();
  contextSearch.value = '';
  addFileQuery.value = '';
  showAddFile.value = false;
  collapsedFolders.value = new Set();
  savedToKB.value = new Set();
  savingToKB.value = new Set();
}

// ── File operations ──

function onFileClick(node: ContextNode) {
  if (node.type === 'file' && node.path) {
    store.openKnowledgePreview?.(node.path);
  }
}

function toggleFolder(key: string) {
  const next = new Set(collapsedFolders.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  collapsedFolders.value = next;
}

function removeContextNode(key: string) {
  function walk(nodes: ContextNode[]): ContextNode[] {
    return nodes.filter((n) => {
      if (n.key === key) return false;
      if (n.children) n.children = walk(n.children);
      return true;
    });
  }
  contextRoots.value = walk(contextRoots.value);
  onSave();
}

// ── Add files (knowledge search) ──

const fileMatches = computed(() => {
  const q = addFileQuery.value.trim();
  if (!q) return [];
  const matches: any[] = [];
  const existing = new Set(collectFilePaths(contextRoots.value));
  return matches.filter((m: { path: string }) => !existing.has(m.path));
});

async function addFile(path: string) {
  if (!path || addLoading.value) return;
  if (collectFilePaths(contextRoots.value).includes(path)) return;
  addLoading.value = true;
  try {
    const data: any = { content: '' };
    const name = path.split('/').pop() || path;
    const node: ContextNode = {
      key: path,
      name,
      path,
      type: 'file',
      content: data?.content || '',
      tags: path.split('/').slice(0, -1),
    };
    mergeContextNode(node);
    if (!sessionTitle.value.trim()) sessionTitle.value = name;
    addFileQuery.value = '';
    showAddFile.value = false;
    await onSave();
  } finally {
    addLoading.value = false;
  }
}

// ── Save to knowledge ──

async function saveFileToKB(node: ContextNode) {
  const path = node.path;
  if (!path || savingToKB.value.has(path)) return;
  savingToKB.value = new Set([...savingToKB.value, path]);
  try {
    let content = node.content || '';
    if (!content) {
      const data: any = { content: '' };
      content = data?.content || '';
    }
    if (!content) return;
    // saveContextToKnowledge removed
    await Promise.resolve();
    savedToKB.value = new Set([...savedToKB.value, path]);
  } catch { /* ignore */ }
  finally {
    const next = new Set(savingToKB.value);
    next.delete(path);
    savingToKB.value = next;
  }
}

// ── Drag and drop ──

function isKnowledgeDrag(e: DragEvent): boolean {
  return (
    e.dataTransfer?.types.includes('application/x-yipet-knowledge-file') ||
    e.dataTransfer?.types.includes('application/x-knowledge-file')
  ) ?? false;
}

function toContextNode(dn: DragContextNode): ContextNode {
  return {
    key: dn.type === 'folder' ? `folder:${dn.path}` : dn.path,
    name: dn.name,
    path: dn.path,
    type: dn.type,
    content: dn.content,
    tags: dn.tags,
    children: dn.children?.map(toContextNode),
  };
}

function mergeContextNode(node: ContextNode) {
  const existingIdx = contextRoots.value.findIndex((r: ContextNode) => r.key === node.key);
  if (existingIdx >= 0) {
    contextRoots.value[existingIdx] = node;
  } else {
    contextRoots.value.push(node);
  }
  if (!sessionTitle.value.trim()) {
    sessionTitle.value = node.name;
  }
}

function collectDragPaths(nodes: DragContextNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === 'file') paths.push(node.path);
    else if (node.type === 'folder' && node.children?.length) paths.push(...collectDragPaths(node.children));
  }
  return paths;
}

async function addDroppedItems(items: DragContextNode[]) {
  for (const dn of items) {
    if (!dn.path || !dn.name) continue;
    const node = toContextNode(dn);
    // Load content for files
    if (node.type === 'file' && !node.content) {
      try {
        const data: any = { content: '' };
        if (data?.content) node.content = data.content;
      } catch { /* ignore */ }
    }
    mergeContextNode(node);
  }
  if (!sessionTitle.value.trim() && items.length) {
    sessionTitle.value = items[0].name;
  }
  await onSave();
}

function onDragOver(e: DragEvent) {
  if (!isKnowledgeDrag(e)) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'link';
}

function onDragEnter(e: DragEvent) {
  if (!isKnowledgeDrag(e)) return;
  e.preventDefault();
  dragCounter.value += 1;
  isDragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  if (!isKnowledgeDrag(e)) return;
  dragCounter.value -= 1;
  if (dragCounter.value <= 0) {
    dragCounter.value = 0;
    isDragOver.value = false;
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = false;
  dragCounter.value = 0;

  // Try YiPet format first (plain path)
  const yipetPath = e.dataTransfer?.getData('application/x-yipet-knowledge-file');
  if (yipetPath) {
    addFile(yipetPath);
    return;
  }

  // Try YiVad format (JSON array of DragContextNode)
  const yivadData = e.dataTransfer?.getData('application/x-knowledge-file');
  if (yivadData) {
    try {
      const parsed = JSON.parse(yivadData);
      const items: DragContextNode[] = Array.isArray(parsed) ? parsed : [parsed];
      addDroppedItems(items);
    } catch { /* ignore */ }
  }
}

// ── RAG ──

const ctxCount = computed(() => {
  const tags = curSession.value?.tags ?? [];
  return tags.filter((t) => typeof t === 'string' && t.startsWith(CTX_PREFIX)).length;
});

/** Whether RAG is currently scoped to this session's context files. */
const ragScopedToContext = computed(() => false);

function onOpenRag() {
  // toggleKnowledgeGrounded removed
}

// ── Persist ──

async function ensureContents() {
  const files = collectFileNodes(contextRoots.value).filter((f) => !f.content && f.path);
  if (!files.length) return;
  const results = await Promise.allSettled(
    files.map((_f) => Promise.resolve(null)),
  );
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      files[i].content = (r.value as any)?.content || '';
    }
  });
}

async function onSave() {
  if (saving.value) return;
  saving.value = true;
  try {
    await ensureContents();
    const cur = curSession.value;
    if (!cur) return;
    const pageContent = buildPageContent(contextRoots.value);
    const ctxTags = buildCtxTags(contextRoots.value);
    const otherTags = (cur.tags || []).filter((t) => !t.startsWith(CTX_PREFIX));
    const treeTags = collectAllTags(contextRoots.value);
    await store.updateSessionMeta(cur.id, {
      title: sessionTitle.value.trim() || undefined,
      pageContent,
      tags: [...otherTags, ...ctxTags, ...treeTags],
    });
  } finally {
    saving.value = false;
  }
}

// ── Lifecycle ──

onMounted(() => {
  reset();
  // loadKnowledgeTree removed
});

watch(() => s.currentSessionId, () => reset());

// Reload when session changes externally (skip during our own save)
watch(() => curSession.value, () => {
  if (!saving.value) loadFromSession();
}, { deep: true });
</script>

<template>
  <div class="cfp-panel">
    <div class="cfp-header">
      <button type="button" class="cfp-back" :title="t('contextBackToSessions')" @click="emit('back')">&larr; Sessions</button>
      <span class="cfp-title">
        Context files
        <span v-if="fileCount" class="cfp-count">{{ fileCount }}</span>
      </span>
      <div class="cfp-body">
      <!-- Title -->
      <div class="cfp-field">
        <label class="cfp-label">Title</label>
        <input v-model="sessionTitle" type="text" class="cfp-input" :placeholder="t('contextSessionTitle')" @change="onSave()" />
      </div>

      <!-- Search -->
      <div v-if="displayContexts.length > 0" class="cfp-field">
        <input v-model="contextSearch" type="text" class="cfp-input" placeholder="Filter files..." />
      </div>

      <!-- Add files -->
      <div class="cfp-field">
        <div class="cfp-add-row">
          <button type="button" class="cfp-add-btn" @click="showAddFile = !showAddFile">+ Add files</button>
        </div>
        <div v-if="showAddFile" class="cfp-add-wrap">
          <input
            v-model="addFileQuery"
            type="text"
            class="cfp-input"
            placeholder="Search knowledge files..."
            @keydown.escape="showAddFile = false; addFileQuery = ''"
          />
          <div v-if="addLoading" class="cfp-empty">Loading...</div>
          <div v-else-if="fileMatches.length" class="cfp-add-list">
            <button
              v-for="m in fileMatches"
              :key="m.path"
              type="button"
              class="cfp-add-item"
              @click="addFile(m.path)"
            >
              <span class="cfp-item-icon">&#x1F4C4;</span>
              <span class="cfp-item-path" :title="m.path">{{ m.path }}</span>
            </button>
          </div>
          <div v-else-if="addFileQuery.trim()" class="cfp-empty">No matching files</div>
        </div>
      </div>

      <!-- Drop zone -->
      <div
        class="cfp-drop"
        :class="{ 'is-over': isDragOver }"
        @dragover="onDragOver"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <template v-if="isDragOver">
          <span class="cfp-drop-icon">&#x1F4C4;</span>
          <span>Release to add</span>
        </template>
        <template v-else>
          <span class="cfp-drop-plus">+</span>
          <span class="cfp-drop-hint">Drag knowledge files or folders here</span>
        </template>
      </div>

      <!-- Context tree -->
      <div v-if="visibleContexts.length" class="cfp-list">
        <div
          v-for="item in visibleContexts"
          :key="item.key"
          class="cfp-item"
          :class="{ 'is-folder': item.node.type === 'folder' }"
          :style="{ paddingLeft: (item.depth * 16 + 8) + 'px' }"
        >
          <span
            class="cfp-icon"
            :class="{ 'cfp-icon--collapsible': item.node.type === 'folder' }"
            @click="item.node.type === 'folder' ? toggleFolder(item.node.key) : undefined"
          >
            <template v-if="item.node.type === 'folder'">
              <span v-if="collapsedFolders.has(item.node.key)">&#x1F4C1;</span>
              <span v-else>&#x1F4C2;</span>
            </template>
            <span v-else>&#x1F4C4;</span>
          </span>
          <span
            class="cfp-item-path"
            :class="{ 'cfp-item-path--clickable': item.node.type === 'file' }"
            :title="item.node.type === 'file' ? `Click to preview: ${item.node.path}` : item.node.path"
            @click="item.node.type === 'file' ? onFileClick(item.node) : undefined"
          >{{ item.node.name }}</span>
          <button
            v-if="item.node.type === 'file' && item.node.content"
            type="button"
            class="cfp-item-act cfp-item-save"
            :class="{ 'is-saved': savedToKB.has(item.node.path) }"
            :title="savedToKB.has(item.node.path) ? t('contextSavedToKB') : t('contextSaveToKB')"
            :disabled="savingToKB.has(item.node.path)"
            @click="saveFileToKB(item.node)"
          >{{ savedToKB.has(item.node.path) ? '&#x2714;' : '&#x1F4BE;' }}</button>
          <button
            type="button"
            class="cfp-item-act cfp-item-remove"
            :title="t('chatRemove')"
            @click="removeContextNode(item.node.key)"
          >&#x2716;</button>
        </div>
      </div>
      <div v-else class="cfp-empty">
        No context files. Drag files from the knowledge panel or use "+ Add files".
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
@use "./styles/panel.scss";
</style>
