import { ref, computed, type Ref } from "vue";
import type { SessionDocument, ChatMessage, FileNode } from "@/api/interface/yiweb";

export interface ConversationTreeDeps {
  conversations: Ref<SessionDocument[]>;
  sending: Ref<boolean>;
  streamingTargetTimestamp: Ref<number | null>;
}

export function useConversationTree(deps: ConversationTreeDeps) {
  const searchQuery = ref("");
  const expandedFolders = ref<Set<string>>(new Set());

  function toggleFolder(key: string) {
    const s = new Set(expandedFolders.value);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    expandedFolders.value = s;
  }

  function buildConversationTree(items: SessionDocument[]): FileNode[] {
    const root: Record<string, FileNode> = {};
    for (const c of items) {
      const tags = (c.tags ?? []).map(t => String(t).trim()).filter(Boolean);
      const parts = [...tags, c.key];
      if (parts.length === 0) continue;
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        const isLast = i === parts.length - 1;
        const key = parts.slice(0, i + 1).join("/");
        if (!current[seg]) {
          current[seg] = {
            key,
            name: isLast ? (c.title || "(Untitled)") : seg,
            type: isLast ? "file" : "folder",
            children: isLast ? undefined : {},
            session: isLast ? c : undefined,
            updatedAt: c.updatedAt
          } as any;
        }
        if (!isLast) {
          const node = current[seg];
          if (!node.children || Array.isArray(node.children)) node.children = {} as any;
          current = node.children as any;
        }
      }
    }
    function toArray(nodes: Record<string, FileNode>): FileNode[] {
      return Object.values(nodes)
        .map(n => ({
          ...n,
          children: n.children && !Array.isArray(n.children) ? toArray(n.children as any) : n.children
        }))
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return a.name.localeCompare(b.name, "zh-CN");
        });
    }
    return toArray(root);
  }

  function filterTreeByQuery(nodes: FileNode[], q: string): FileNode[] {
    if (!q) return nodes;
    const lower = q.toLowerCase();
    const walk = (items: FileNode[]): FileNode[] => {
      const out: FileNode[] = [];
      for (const n of items) {
        const selfMatch = n.name.toLowerCase().includes(lower) || n.key.toLowerCase().includes(lower);
        const children = n.children ? walk(n.children) : [];
        if (selfMatch || children.length > 0) out.push({ ...n, children: n.children ? children : n.children });
      }
      return out;
    };
    return walk(nodes);
  }

  function isStreaming(msg: ChatMessage, _idx: number): boolean {
    if (!deps.sending.value) return false;
    const targetTs = deps.streamingTargetTimestamp.value;
    if (typeof targetTs !== "number") return false;
    return msg.timestamp === targetTs && msg.type === "pet";
  }

  const conversationTree = computed(() => buildConversationTree(deps.conversations.value));
  const filteredConversationTree = computed(() => filterTreeByQuery(conversationTree.value, searchQuery.value.trim()));

  return {
    searchQuery,
    expandedFolders,
    toggleFolder,
    conversationTree,
    filteredConversationTree,
    isStreaming,
  };
}