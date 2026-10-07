import { ref, computed, type ComputedRef } from "vue";
import { ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useKnowledgeTreeStore } from "@/stores/modules/knowledgeTree";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";

export interface DragContextNode {
  type: "file" | "folder";
  name: string;
  path: string;
  content?: string;
  tags?: string[];
  children?: DragContextNode[];
}

interface KnowledgeTreeNode {
  key: string;
  label: string;
  type: "folder" | "file";
  path: string;
  children?: KnowledgeTreeNode[];
}

interface BrowseItem {
  node: KnowledgeTreeNode;
  depth: number;
}

export function useContextFiles(
  contextFiles: ComputedRef<string[]>,
  emit: (e: "remove-context-file", path: string) => void,
  openKnowledgePreview: (path: string) => void
) {
  const store = useAiChatStore();
  const knowledgeStore = useKnowledgeTreeStore();

  const contextPopoverVisible = ref(false);
  const contextFileCount = computed(() => contextFiles.value.length);

  function toggleContextPopover() {
    contextPopoverVisible.value = !contextPopoverVisible.value;
  }

  function handleFileClick(path: string) {
    openKnowledgePreview(path);
  }

  // ── Context file drag-and-drop ──

  const contextDropOver = ref(false);
  let contextDropCounter = 0;

  function collectDragFiles(nodes: DragContextNode[]): DragContextNode[] {
    const out: DragContextNode[] = [];
    for (const n of nodes) {
      if (n.type === "file") out.push(n);
      if (n.children?.length) out.push(...collectDragFiles(n.children));
    }
    return out;
  }

  async function addContextFiles(files: Array<{ path: string; content?: string; name?: string }>) {
    if (!store.activeConversation) {
      await store.createConversation();
    }
    if (!store.activeConversation) {
      ElMessage.error("No active conversation — please start a chat first");
      return;
    }
    const existingTags = store.activeConversation?.tags ?? [];
    const existingCtx = new Set(existingTags.filter((t: string) => t.startsWith("ctx:")).map((t: string) => t.slice(4)));
    let added = 0;
    for (const f of files) {
      if (!f.path) continue;
      if (existingCtx.has(f.path)) continue;
      try {
        let content = f.content || "";
        if (!content) {
          const result = await readKnowledgeFile(f.path);
          content = (result as any)?.content || "";
        }
        if (!content) {
          ElMessage.warning(`No content found for: ${f.path}`);
          continue;
        }
        await store.applyContextChange(f.path, content);
        added++;
        existingCtx.add(f.path);
      } catch (e: unknown) {
        ElMessage.error(e instanceof Error ? e.message : `Failed to add: ${f.path}`);
      }
    }
    if (added > 0) {
      ElMessage.success(`Added ${added} file(s) to context`);
    }
  }

  function onContextDragOver(e: DragEvent) {
    if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = "link";
  }

  function onContextDragEnter(e: DragEvent) {
    if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
    e.preventDefault();
    contextDropCounter++;
    contextDropOver.value = true;
  }

  function onContextDragLeave(_e: DragEvent) {
    contextDropCounter--;
    if (contextDropCounter <= 0) {
      contextDropCounter = 0;
      contextDropOver.value = false;
    }
  }

  async function onContextDrop(e: DragEvent) {
    contextDropOver.value = false;
    contextDropCounter = 0;
    const raw = e.dataTransfer?.getData("application/x-knowledge-file");
    if (!raw) return;
    e.preventDefault();
    try {
      const parsed = JSON.parse(raw);
      const items: DragContextNode[] = Array.isArray(parsed) ? parsed : [parsed];
      const files = collectDragFiles(items);
      await addContextFiles(files);
    } catch {
      /* ignore */
    }
  }

  // ── Context file editing ──

  const editingContextFile = ref<string | null>(null);
  const editingContent = ref("");

  function openContextEditor(path: string) {
    editingContextFile.value = path;
    editingContent.value = store.getContextSectionContent(path) || "";
  }

  async function saveContextEdit() {
    const path = editingContextFile.value;
    if (!path) return;
    await store.applyContextChange(path, editingContent.value);
    editingContextFile.value = null;
    ElMessage.success(`Updated context: ${path}`);
  }

  function cancelContextEdit() {
    editingContextFile.value = null;
  }

  // ── Knowledge file browser (integrated in context popover) ──

  const contextPopoverTab = ref<"context" | "browse">("context");
  const knowledgeSearch = ref("");

  const knowledgeTree = computed<KnowledgeTreeNode[]>(() => {
    const filtered = knowledgeStore.filteredCategories;
    const rootChildren: KnowledgeTreeNode[] = [];
    const folderMap = new Map<string, KnowledgeTreeNode>();

    for (const cat of filtered) {
      for (const f of cat.files) {
        const parts = f.path.split("/").filter(Boolean);
        if (parts.length === 0) continue;

        let siblings = rootChildren;
        let prefix = "";
        for (let i = 0; i < parts.length; i++) {
          const segment = parts[i];
          prefix = prefix ? `${prefix}/${segment}` : segment;
          const isLeaf = i === parts.length - 1;
          if (isLeaf) {
            siblings.push({ key: f.path, label: f.name, type: "file", path: f.path });
          } else {
            let folder = folderMap.get(prefix);
            if (!folder) {
              folder = { key: `folder:${prefix}`, label: segment, type: "folder", path: prefix, children: [] };
              folderMap.set(prefix, folder);
              siblings.push(folder);
            }
            siblings = folder.children!;
          }
        }
      }
    }

    const q = knowledgeSearch.value.trim().toLowerCase();
    const filterTree = (nodes: KnowledgeTreeNode[]): KnowledgeTreeNode[] => {
      if (!q) return nodes;
      const out: KnowledgeTreeNode[] = [];
      for (const n of nodes) {
        if (n.type === "file") {
          if (n.label.toLowerCase().includes(q) || n.path.toLowerCase().includes(q)) {
            out.push(n);
          }
        } else {
          const filtered = n.children ? filterTree(n.children) : [];
          if (filtered.length) out.push({ ...n, children: filtered });
        }
      }
      return out;
    };

    const sorted = (nodes: KnowledgeTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.label.localeCompare(b.label, "zh-CN");
      });
      for (const n of nodes) if (n.children) sorted(n.children);
    };
    sorted(rootChildren);
    return filterTree(rootChildren);
  });

  const knowledgeExpandedFolders = ref<Set<string>>(new Set());

  const browseDisplayItems = computed<BrowseItem[]>(() => {
    const expanded = knowledgeExpandedFolders.value;
    const items: BrowseItem[] = [];

    function walk(nodes: KnowledgeTreeNode[], depth: number) {
      for (const n of nodes) {
        items.push({ node: n, depth });
        if (n.type === "folder" && n.children?.length && expanded.has(n.key)) {
          walk(n.children, depth + 1);
        }
      }
    }
    walk(knowledgeTree.value, 0);
    return items;
  });

  function toggleKnowledgeFolder(key: string) {
    const s = new Set(knowledgeExpandedFolders.value);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    knowledgeExpandedFolders.value = s;
  }

  async function onKnowledgeFileClick(node: KnowledgeTreeNode) {
    if (node.type !== "file") return;
    await addContextFiles([{ path: node.path, name: node.label }]);
  }

  function collectFolderFiles(folder: KnowledgeTreeNode): Array<{ path: string; name: string }> {
    const out: Array<{ path: string; name: string }> = [];
    for (const child of folder.children ?? []) {
      if (child.type === "file") {
        out.push({ path: child.path, name: child.label });
      } else if (child.type === "folder") {
        out.push(...collectFolderFiles(child));
      }
    }
    return out;
  }

  async function addFolderToContext(folder: KnowledgeTreeNode) {
    const files = collectFolderFiles(folder);
    if (!files.length) return;
    await addContextFiles(files);
  }

  function onContextPopoverShow() {
    contextPopoverTab.value = contextFileCount.value > 0 ? "context" : "browse";
    knowledgeSearch.value = "";
    knowledgeStore.loadAll();
  }

  return {
    contextPopoverVisible,
    contextFileCount,
    toggleContextPopover,
    handleFileClick,
    contextDropOver,
    addContextFiles,
    onContextDragOver,
    onContextDragEnter,
    onContextDragLeave,
    onContextDrop,
    editingContextFile,
    editingContent,
    openContextEditor,
    saveContextEdit,
    cancelContextEdit,
    contextPopoverTab,
    knowledgeSearch,
    knowledgeTree,
    knowledgeStore,
    knowledgeExpandedFolders,
    browseDisplayItems,
    toggleKnowledgeFolder,
    onKnowledgeFileClick,
    addFolderToContext,
    onContextPopoverShow
  };
}