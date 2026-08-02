<!--
  ContextFilesPanel — dedicated column showing context files for the active
  chat session. Supports drag-and-drop from the knowledge files sidebar.
  Positioned between knowledge files and chat sessions in the aiChat layout.
-->
<script setup lang="ts" name="aiChatContextFilesPanel">
import { ref, computed, watch } from "vue";
import { Delete, DataAnalysis, Search, FolderOpened, Folder, Document, Plus } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";

const store = useAiChatStore();

// ── Search / filter ──
const contextSearch = ref("");

// ── Types ──

interface ContextNode {
  key: string;
  name: string;
  path: string;
  type: "file" | "folder";
  content?: string;
  tags?: string[];
  children?: ContextNode[];
}

/** Drag payload node (from ConversationSidebar). */
interface DragContextNode {
  type: "file" | "folder";
  name: string;
  path: string;
  content?: string;
  tags?: string[];
  children?: DragContextNode[];
}

// ── Mode ──

/** Current mode: "new" = creating a new session; "view" = editing active session. */
type PanelMode = "new" | "view";
const mode = ref<PanelMode>("view");

// ── Form state ──

const sessionTitle = ref("");
const contextRoots = ref<ContextNode[]>([]);

// ── Derive display list ──

interface DisplayItem {
  node: ContextNode;
  depth: number;
  key: string;
}

function flattenForDisplay(nodes: ContextNode[], depth = 0): DisplayItem[] {
  const out: DisplayItem[] = [];
  for (const n of nodes) {
    out.push({ node: n, depth, key: n.key });
    if (n.type === "folder" && n.children?.length) {
      out.push(...flattenForDisplay(n.children, depth + 1));
    }
  }
  return out;
}

const displayContexts = computed(() => flattenForDisplay(contextRoots.value));

// ── File count ──
const fileCount = computed(() => {
  function count(nodes: ContextNode[]): number {
    let n = 0;
    for (const node of nodes) {
      if (node.type === "file") n++;
      if (node.children) n += count(node.children);
    }
    return n;
  }
  return count(contextRoots.value);
});

// ── Search filtering ──
const filteredContexts = computed(() => {
  const q = contextSearch.value.toLowerCase().trim();
  if (!q) return displayContexts.value;
  return displayContexts.value.filter(
    item => item.node.name.toLowerCase().includes(q) || item.node.path.toLowerCase().includes(q)
  );
});

// ── Collapsed folders ──
const collapsedFolders = ref<Set<string>>(new Set());
function toggleFolderCollapse(key: string) {
  const s = new Set(collapsedFolders.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  collapsedFolders.value = s;
}
// Hide children of collapsed folders from display
const visibleContexts = computed(() => {
  const collapsed = new Set(collapsedFolders.value);
  const out: typeof displayContexts.value = [];
  let skipUntilDepth = -1;
  for (const item of filteredContexts.value) {
    if (skipUntilDepth >= 0) {
      if (item.depth > skipUntilDepth) continue;
      skipUntilDepth = -1;
    }
    if (item.node.type === "folder" && collapsed.has(item.node.key)) {
      out.push(item);
      skipUntilDepth = item.depth;
    } else {
      out.push(item);
    }
  }
  return out;
});

// ── Parsing / building ──

const CTX_PREFIX = "ctx:";

function buildCtxTags(nodes: ContextNode[]): string[] {
  return collectFilePaths(nodes).map(p => `${CTX_PREFIX}${p}`);
}

function collectFilePaths(nodes: ContextNode[]): string[] {
  const paths: string[] = [];
  for (const n of nodes) {
    if (n.type === "file") paths.push(n.path);
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

function buildPageContent(nodes: ContextNode[]): string {
  const sections: string[] = [];
  function walk(ns: ContextNode[]) {
    for (const n of ns) {
      if (n.type === "file") {
        sections.push(`## ${n.path}\n\n${n.content || ""}`);
      }
      if (n.children) walk(n.children);
    }
  }
  walk(nodes);
  return sections.join("\n\n---\n\n");
}

function extractCtxPaths(tags: string[]): string[] {
  return (tags || [])
    .filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX))
    .map(t => (t as string).slice(CTX_PREFIX.length));
}

function parseToTree(raw: string, tags: string[]): ContextNode[] {
  const ctxPaths = extractCtxPaths(tags);
  let filePaths: string[];
  if (ctxPaths.length) {
    filePaths = ctxPaths;
  } else if (raw) {
    const sections = raw.split(/\n\n---\n\n/);
    filePaths = sections
      .map(s => {
        const pathMatch = s.split("\n")[0]?.match(/^## (.+)$/);
        return pathMatch?.[1] || "";
      })
      .filter(Boolean);
  } else {
    return [];
  }

  // Build content lookup
  const contentMap = new Map<string, string>();
  if (raw) {
    const sections = raw.split(/\n\n---\n\n/);
    for (const section of sections) {
      const lines = section.split("\n");
      const pathMatch = lines[0]?.match(/^## (.+)$/);
      const path = pathMatch?.[1] || "";
      const body = lines.slice(1).join("\n").trim();
      if (path) contentMap.set(path, body);
    }
  }

  // Build flat file nodes
  const files: ContextNode[] = [];
  for (const path of filePaths) {
    const name = path.split("/").pop() || path;
    files.push({
      key: path,
      name,
      path,
      type: "file",
      content: contentMap.get(path) || "",
      tags: path.split("/").slice(0, -1)
    });
  }

  // Rebuild tree
  const roots: ContextNode[] = [];
  const folderMap = new Map<string, ContextNode>();

  for (const file of files) {
    const parts = file.path.split("/");
    if (parts.length <= 1) {
      roots.push(file);
      continue;
    }

    let siblings = roots;
    let prefix = "";
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
      const folderKey = `folder:${prefix}`;
      let folder = folderMap.get(folderKey);
      if (!folder) {
        folder = {
          key: folderKey,
          name: parts[i],
          path: prefix,
          type: "folder",
          children: []
        };
        folderMap.set(folderKey, folder);
        siblings.push(folder);
      }
      siblings = folder.children!;
    }
    siblings.push(file);
  }

  function sortTree(nodes: ContextNode[]) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name, "zh-CN");
    });
    for (const n of nodes) if (n.children) sortTree(n.children);
  }
  sortTree(roots);

  return roots;
}

// ── Load session context into the panel ──

function loadFromSession() {
  const s = store.activeConversation;
  if (!s) {
    contextRoots.value = [];
    sessionTitle.value = "";
    return;
  }
  sessionTitle.value = s.title || "";
  contextRoots.value = parseToTree(s.pageContent || "", s.tags || []);
}

/** Enter "new" mode — user wants to create a fresh session. */
function enterNewMode() {
  mode.value = "new";
  sessionTitle.value = "";
  contextRoots.value = [];
}

function cancelNewMode() {
  mode.value = "view";
  contextRoots.value = [];
  sessionTitle.value = "";
  store.exitNewContextMode();
  // Reload from active session if any
  loadFromSession();
}

// ── RAG ──

const ctxCount = computed(() => {
  const tags = store.activeConversation?.tags ?? [];
  return tags.filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX)).length;
});

function onOpenRag() {
  store.ragEnabled = true;
  store.openLlamaIndex();
}

// ── Watch store state ──

watch(() => store.activeConversation, () => {
  if (mode.value === "view") {
    loadFromSession();
  }
}, { immediate: true });

watch(() => store.contextPanelNewMode, (v) => {
  if (v) enterNewMode();
});

// ── Drag handlers ──

function toContextNode(dn: DragContextNode): ContextNode {
  return {
    key: dn.type === "folder" ? `folder:${dn.path}` : dn.path,
    name: dn.name,
    path: dn.path,
    type: dn.type,
    content: dn.content,
    tags: dn.tags,
    children: dn.children?.map(toContextNode)
  };
}

function mergeContextNode(dn: DragContextNode) {
  const node = toContextNode(dn);
  const existingIdx = contextRoots.value.findIndex(r => r.key === node.key);
  if (existingIdx >= 0) {
    contextRoots.value[existingIdx] = node;
  } else {
    contextRoots.value.push(node);
  }
  // Auto-fill title from first file
  if (!sessionTitle.value.trim()) {
    sessionTitle.value = node.name;
  }
}

function removeContextNode(key: string) {
  function walk(nodes: ContextNode[]): ContextNode[] {
    return nodes.filter(n => {
      if (n.key === key) return false;
      if (n.children) n.children = walk(n.children);
      return true;
    });
  }
  contextRoots.value = walk(contextRoots.value);
}

const isDragOver = ref(false);
let dragCounter = 0;

function onDragOver(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  e.preventDefault();
  e.dataTransfer!.dropEffect = "link";
}

function onDragEnter(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  e.preventDefault();
  dragCounter++;
  isDragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    isDragOver.value = false;
  }
}

function onDrop(e: DragEvent) {
  isDragOver.value = false;
  dragCounter = 0;
  const raw = e.dataTransfer?.getData("application/x-knowledge-file");
  if (!raw) return;
  e.preventDefault();
  try {
    const parsed = JSON.parse(raw);
    const items: DragContextNode[] = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      if (!item.path || !item.name) continue;
      mergeContextNode(item);
    }
  } catch {
    /* ignore */
  }
}

// ── Collect file nodes ──

function collectFileNodes(nodes: ContextNode[]): ContextNode[] {
  const out: ContextNode[] = [];
  for (const n of nodes) {
    if (n.type === "file") out.push(n);
    if (n.children) out.push(...collectFileNodes(n.children));
  }
  return out;
}

/** Load missing file contents from the server. */
async function ensureContents() {
  const files = collectFileNodes(contextRoots.value).filter(f => !f.content && f.path);
  if (!files.length) return;
  const results = await Promise.allSettled(
    files.map(f => readKnowledgeFile(f.path).catch(() => null))
  );
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) {
      files[i].content = r.value.content || "";
    }
  });
}

// ── Save / Create ──

const saving = ref(false);

async function onSave() {
  if (saving.value) return;
  saving.value = true;
  try {
    await ensureContents();

    if (mode.value === "new") {
      const title = sessionTitle.value.trim() || "New chat";
      const pageContent = contextRoots.value.length ? buildPageContent(contextRoots.value) : "";
      const tags = contextRoots.value.length
        ? [...buildCtxTags(contextRoots.value), ...collectAllTags(contextRoots.value)]
        : [];
      await store.createConversation(title, pageContent, tags);
      mode.value = "view";
      store.exitNewContextMode();
      // After creation, load the new session's context into the panel.
      // The watcher skipped reload because mode was "new" when it fired.
      loadFromSession();
    } else {
      const s = store.activeConversation;
      if (!s) return;
      const pageContent = buildPageContent(contextRoots.value);
      const tags = [
        ...buildCtxTags(contextRoots.value),
        ...collectAllTags(contextRoots.value)
      ];
      await store.updateSessionMeta(s.key, {
        title: sessionTitle.value.trim() || undefined,
        pageContent,
        tags
      });
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="cfp-panel">
    <div class="cfp-header">
      <span class="cfp-title">
        {{ mode === "new" ? "New session" : "Context files" }}
        <span v-if="fileCount" class="cfp-count">{{ fileCount }}</span>
      </span>
      <div class="cfp-header-right">
        <el-button
          v-if="mode === 'view' && ctxCount > 0"
          size="small"
          :type="store.ragActive ? 'primary' : ''"
          :icon="DataAnalysis"
          :title="`RAG search ${ctxCount} context file(s)`"
          @click="onOpenRag"
        >
          <span class="cfp-rag-count">{{ ctxCount }}</span>
        </el-button>
        <el-button
          v-if="mode === 'new'"
          size="small"
          text
          title="Back"
          @click="cancelNewMode"
        >← Back</el-button>
      </div>
    </div>

    <div class="cfp-body">
      <!-- Title -->
      <div class="cfp-field">
        <label class="cfp-label">Title</label>
        <el-input
          v-model="sessionTitle"
          placeholder="Session title"
          size="small"
          clearable
        />
      </div>

      <!-- Search -->
      <div v-if="displayContexts.length > 0" class="cfp-field">
        <el-input
          v-model="contextSearch"
          placeholder="Filter files..."
          size="small"
          clearable
          :prefix-icon="Search"
        />
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
          <span class="cfp-drop-icon">📄</span>
          <span>Release to add</span>
        </template>
        <template v-else>
          <el-icon :size="18"><Plus /></el-icon>
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
            @click="item.node.type === 'folder' ? toggleFolderCollapse(item.node.key) : undefined"
          >
            <el-icon v-if="item.node.type === 'folder'" :size="14">
              <FolderOpened v-if="!collapsedFolders.has(item.node.key)" />
              <Folder v-else />
            </el-icon>
            <el-icon v-else :size="14"><Document /></el-icon>
          </span>
          <span class="cfp-item-path" :title="item.node.path">{{ item.node.name }}</span>
          <el-button
            size="small"
            text
            type="danger"
            :icon="Delete"
            title="Remove"
            @click="removeContextNode(item.node.key)"
          />
        </div>
      </div>
      <div v-else class="cfp-empty">
        {{ mode === "new" ? "No knowledge files yet. Drag files from the left panel." : "No context files. Drag files from the knowledge panel on the left." }}
      </div>
    </div>

    <div class="cfp-footer">
      <el-button
        v-if="mode === 'new'"
        size="small"
        @click="cancelNewMode"
      >Cancel</el-button>
      <el-button
        size="small"
        type="primary"
        :loading="saving"
        @click="onSave"
      >
        {{ mode === "new" ? "Create" : "Save" }}
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cfp-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
}
.cfp-header {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.cfp-title {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cfp-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}
.cfp-header-right {
  display: flex;
  gap: 4px;
  align-items: center;
}
.cfp-rag-count {
  margin-left: 2px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.cfp-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  min-height: 0;
  overflow: hidden;
}
.cfp-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cfp-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.cfp-drop {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 12px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  border: 2px dashed var(--el-border-color);
  border-radius: 6px;
  transition: border-color 0.15s, background 0.15s;
}
.cfp-drop.is-over {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}
.cfp-drop-icon {
  font-size: 20px;
}
.cfp-drop-hint {
  font-size: 11px;
}
.cfp-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.cfp-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 3px 8px;
  font-size: 12px;
  border-radius: 4px;
}
.cfp-item:hover {
  background: var(--el-fill-color-light);
}
.cfp-icon {
  flex-shrink: 0;
  font-size: 13px;
}
.cfp-icon--collapsible {
  cursor: pointer;
  color: var(--el-color-warning);
  transition: color 0.15s;
}
.cfp-icon--collapsible:hover {
  color: var(--el-color-warning-light-1);
}
.cfp-item-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-regular);
}
.cfp-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.cfp-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
