<script setup lang="ts" name="aiChatConversationSessionSidebar">
import { ref, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { Search, Delete, Operation, Plus } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import ConversationListItem from "./ConversationListItem.vue";

const store = useAiChatStore();

// ── Mode: "list" | "context" ──

type PanelMode = "list" | "context";
const mode = ref<PanelMode>("list");
type ContextMode = "new" | "edit";
const contextMode = ref<ContextMode>("new");
const editingKey = ref("");

// ── Session list state ──

const searchQuery = ref("");

const filteredConversations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return store.conversations;
  return store.conversations.filter(
    c =>
      (c.title || "").toLowerCase().includes(q) ||
      c.key.toLowerCase().includes(q) ||
      (c.tags || []).some(t => String(t).toLowerCase().includes(q))
  );
});

const selectedCount = computed(() => store.selectedKeys.size);

async function onSelect(key: string) {
  await store.selectConversation(key);
}

async function onRename(key: string, currentTitle: string) {
  const res = await ElMessageBox.prompt("Enter a new title", "Rename conversation", {
    confirmButtonText: "Save",
    cancelButtonText: "Cancel",
    inputValue: currentTitle
  }).catch(() => null);
  if (!res) return;
  await store.renameConversation(key, res.value?.trim() || currentTitle);
}

async function onDelete(key: string, title: string) {
  const res = await ElMessageBox.confirm(`Delete conversation "${title}"?`, "Confirm delete", {
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    type: "warning"
  }).catch(() => null);
  if (!res) return;
  await store.deleteConversation(key);
}

async function onToggleFavorite(key: string) {
  await store.toggleFavorite(key);
}

async function onBulkDelete() {
  if (selectedCount.value === 0) return;
  const res = await ElMessageBox.confirm(
    `Delete ${selectedCount.value} selected conversation(s)?`,
    "Confirm delete",
    { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
  ).catch(() => null);
  if (!res) return;
  await store.bulkDelete();
}

// ── Context tree ──

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

const newSessionTitle = ref("");
const contextRoots = ref<ContextNode[]>([]);

/** Deep-clone a DragContextNode into a mutable ContextNode. */
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

/** Flatten tree into a depth-annotated list for display. */
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

/** Merge a DragContextNode tree into contextRoots (dedup by key). */
function mergeContextNode(dn: DragContextNode) {
  const node = toContextNode(dn);
  const existingIdx = contextRoots.value.findIndex(r => r.key === node.key);
  if (existingIdx >= 0) {
    // Replace existing root
    contextRoots.value[existingIdx] = node;
  } else {
    contextRoots.value.push(node);
  }
}

/** Remove a node (and its children) from the tree by key. */
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

/** Extract all file paths from contextRoots. */
function collectAllPaths(nodes: ContextNode[]): string[] {
  const paths: string[] = [];
  for (const n of nodes) {
    if (n.type === "file") paths.push(n.path);
    if (n.children) paths.push(...collectAllPaths(n.children));
  }
  return paths;
}

/** Collect all tags from the tree. */
function collectAllTags(nodes: ContextNode[]): string[] {
  const tags: string[] = [];
  for (const n of nodes) {
    if (n.tags) tags.push(...n.tags);
    if (n.children) tags.push(...collectAllTags(n.children));
  }
  return [...new Set(tags)];
}

/** Serialize file paths as ctx: prefixed tags for session binding. */
const CTX_PREFIX = "ctx:";

function buildCtxTags(nodes: ContextNode[]): string[] {
  return collectAllPaths(nodes).map(p => `${CTX_PREFIX}${p}`);
}

function extractCtxPaths(tags: string[]): string[] {
  return (tags || [])
    .filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX))
    .map(t => (t as string).slice(CTX_PREFIX.length));
}

/** Build pageContent from context tree. */
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

/** Parse pageContent back into a tree (rebuilds folder structure from paths).
 *  Uses ctx:-prefixed tags as the authoritative file list; falls back to
 *  parsing `## path` headers from pageContent for legacy sessions. */
function parsePageContentToTree(raw: string, tags: string[]): ContextNode[] {
  // Primary: ctx:-prefixed tag paths define the file set
  const ctxPaths = extractCtxPaths(tags);
  let filePaths: string[];
  if (ctxPaths.length) {
    filePaths = ctxPaths;
  } else if (raw) {
    // Legacy fallback: extract paths from pageContent headers
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

  // Build a content lookup from pageContent sections
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

  // Build flat file nodes from the authoritative path list
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

  // Rebuild tree from file paths
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

  // Sort: folders first, then alphabetical
  function sortTree(nodes: ContextNode[]) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name, "zh-CN");
    });
    for (const n of nodes) {
      if (n.children) sortTree(n.children);
    }
  }
  sortTree(roots);

  return roots;
}

// ── Context mode actions ──

function onNewSession() {
  newSessionTitle.value = "";
  contextRoots.value = [];
  contextMode.value = "new";
  editingKey.value = "";
  mode.value = "context";
}

async function onEditContext(key: string) {
  const session = store.conversations.find(c => c.key === key);
  if (!session) return;
  newSessionTitle.value = session.title || "";
  contextRoots.value = parsePageContentToTree(session.pageContent || "", session.tags || []);
  contextMode.value = "edit";
  editingKey.value = key;
  mode.value = "context";
}

function onCancelContext() {
  mode.value = "list";
  contextRoots.value = [];
  editingKey.value = "";
}

/** Collect all file nodes from the context tree. */
function collectFileNodes(nodes: ContextNode[]): ContextNode[] {
  const out: ContextNode[] = [];
  for (const n of nodes) {
    if (n.type === "file") out.push(n);
    if (n.children) out.push(...collectFileNodes(n.children));
  }
  return out;
}

/** Load missing content for all file nodes in the context tree. */
async function ensureContextContents() {
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

async function onSaveContext() {
  // Load file contents before saving (scan results may not include content)
  await ensureContextContents();

  if (contextMode.value === "new") {
    const title = newSessionTitle.value.trim() || "New chat";
    const pageContent = contextRoots.value.length ? buildPageContent(contextRoots.value) : "";
    const tags = contextRoots.value.length
      ? [...buildCtxTags(contextRoots.value), ...collectAllTags(contextRoots.value)]
      : [];
    await store.createConversation(title, pageContent, tags);
  } else {
    const key = editingKey.value;
    if (!key) return;
    const pageContent = buildPageContent(contextRoots.value);
    const tags = [
      ...buildCtxTags(contextRoots.value),
      ...collectAllTags(contextRoots.value)
    ];
    await store.updateSessionMeta(key, {
      title: newSessionTitle.value.trim() || undefined,
      pageContent,
      tags
    });
  }

  mode.value = "list";
  contextRoots.value = [];
  editingKey.value = "";
}

// ── Drop handlers for context mode ──

const isDragOverContext = ref(false);
let contextDragCounter = 0;

function onContextDragOver(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  e.preventDefault();
  e.dataTransfer!.dropEffect = "link";
}

function onContextDragEnter(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  e.preventDefault();
  contextDragCounter++;
  isDragOverContext.value = true;
}

function onContextDragLeave(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  contextDragCounter--;
  if (contextDragCounter <= 0) {
    contextDragCounter = 0;
    isDragOverContext.value = false;
  }
}

function onContextDrop(e: DragEvent) {
  isDragOverContext.value = false;
  contextDragCounter = 0;
  const raw = e.dataTransfer?.getData("application/x-knowledge-file");
  if (!raw) return;
  e.preventDefault();
  try {
    const parsed = JSON.parse(raw);
    const items: DragContextNode[] = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      if (!item.path || !item.name) continue;
      mergeContextNode(item);
      if (!newSessionTitle.value.trim()) {
        newSessionTitle.value = item.name;
      }
    }
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div class="css-sidebar">
    <!-- ═══ List mode ═══ -->
    <template v-if="mode === 'list'">
      <div class="css-header">
        <el-input
          v-model="searchQuery"
          placeholder="Search sessions..."
          clearable
          size="small"
          :prefix-icon="Search"
        />
        <el-button
          size="small"
          type="primary"
          :icon="Plus"
          title="New session"
          aria-label="New session"
          @click="onNewSession"
        />
        <el-button
          v-if="!store.batchMode"
          size="small"
          :icon="Operation"
          title="Batch manage"
          aria-label="Batch manage"
          @click="store.toggleBatchMode()"
        />
      </div>

      <el-scrollbar class="css-list">
        <div v-if="store.loading && !filteredConversations.length" class="css-empty">
          Loading sessions...
        </div>
        <div v-else-if="!filteredConversations.length" class="css-empty">
          {{ searchQuery ? "No matching sessions" : "No sessions yet" }}
        </div>
        <template v-else>
          <ConversationListItem
            v-for="conv in filteredConversations"
            :key="conv.key"
            :conversation="conv"
            :active="store.activeConversation?.key === conv.key"
            @select="onSelect"
            @rename="onRename"
            @delete="onDelete"
            @toggle-favorite="onToggleFavorite"
            @edit-context="onEditContext"
          />
        </template>
      </el-scrollbar>

      <div v-if="store.batchMode" class="css-batch-bar">
        <span class="css-batch-count">{{ selectedCount }} selected</span>
        <el-button
          size="small"
          type="danger"
          :icon="Delete"
          :disabled="selectedCount === 0"
          @click="onBulkDelete"
        >Delete selected</el-button>
        <el-button size="small" @click="store.toggleBatchMode()">Cancel</el-button>
      </div>
    </template>

    <!-- ═══ Context mode ═══ -->
    <template v-else>
      <div class="css-header">
        <el-button
          size="small"
          text
          title="Back to sessions"
          aria-label="Back to sessions"
          @click="onCancelContext"
        >← Back</el-button>
        <span class="css-ctx-title">{{ contextMode === "edit" ? "Edit context" : "New session" }}</span>
      </div>

      <div class="css-ctx-body">
        <!-- Session title -->
        <div class="css-ctx-field">
          <label class="css-ctx-label">Title</label>
          <el-input
            v-model="newSessionTitle"
            placeholder="Session title"
            size="small"
            clearable
          />
        </div>

        <!-- Drop zone -->
        <div
          class="css-ctx-drop"
          :class="{ 'is-over': isDragOverContext }"
          @dragover="onContextDragOver"
          @dragenter="onContextDragEnter"
          @dragleave="onContextDragLeave"
          @drop="onContextDrop"
        >
          <template v-if="isDragOverContext">
            <span class="css-ctx-drop-icon">📄</span>
            <span>Release to add</span>
          </template>
          <template v-else>
            <span class="css-ctx-drop-hint">Drag knowledge files or folders here</span>
          </template>
        </div>

        <!-- Context tree -->
        <div v-if="displayContexts.length" class="css-ctx-list">
          <div
            v-for="item in displayContexts"
            :key="item.key"
            class="css-ctx-item"
            :style="{ paddingLeft: (item.depth * 16 + 8) + 'px' }"
          >
            <span class="css-ctx-icon">{{ item.node.type === "folder" ? "📁" : "📄" }}</span>
            <span class="css-ctx-item-path" :title="item.node.path">{{ item.node.name }}</span>
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
        <div v-else class="css-ctx-empty">
          No knowledge files yet. Drag files or folders from the left panel.
        </div>
      </div>

      <div class="css-ctx-footer">
        <el-button size="small" @click="onCancelContext">Cancel</el-button>
        <el-button size="small" type="primary" @click="onSaveContext">
          {{ contextMode === "edit" ? "Save" : "Create" }}
        </el-button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.css-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
}
.css-header {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.css-ctx-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.css-list {
  flex: 1;
  min-height: 0;
}
.css-empty {
  padding: 24px 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.css-batch-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);
}
.css-batch-count {
  flex: 1;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

// ── Context mode ──

.css-ctx-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  min-height: 0;
  overflow: hidden;
}
.css-ctx-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.css-ctx-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.css-ctx-drop {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  border: 2px dashed var(--el-border-color);
  border-radius: 6px;
  transition: border-color 0.15s, background 0.15s;
}
.css-ctx-drop.is-over {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}
.css-ctx-drop-icon {
  font-size: 24px;
}
.css-ctx-drop-hint {
  font-size: 12px;
}
.css-ctx-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.css-ctx-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
}
.css-ctx-item:hover {
  background: var(--el-fill-color-light);
}
.css-ctx-icon {
  flex-shrink: 0;
  font-size: 13px;
}
.css-ctx-item-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-regular);
}
.css-ctx-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.css-ctx-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
