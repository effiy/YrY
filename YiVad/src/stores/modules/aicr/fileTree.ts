/**
 * AICR File Tree store — file tree data, selection, CRUD operations.
 * Builds the file tree from session documents, applying project and time-range filters.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { getSessions } from "@/api/modules/sessions";
import { readFile } from "@/api/modules/fileService";
import { useAicrFilterStore } from "@/stores/modules/aicr/filters";
import type { SessionDocument } from "@/api/interface/yiweb";

export interface FileNode {
  key: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  session?: SessionDocument;
  size?: number;
  updatedAt?: number;
}

export const useAicrFileTreeStore = defineStore("yivad-aicr-fileTree", () => {
  const tree = ref<FileNode[]>([]);
  const flatFiles = ref<FileNode[]>([]);
  const selectedKey = ref<string | null>(null);
  const currentFileContent = ref<string>("");
  const expandedFolders = ref<Set<string>>(new Set());
  const searchQuery = ref("");
  const loading = ref(false);
  const fileLoading = ref(false);
  const error = ref<string | null>(null);
  const batchMode = ref(false);
  const selectedKeys = ref<Set<string>>(new Set());

  function flattenTree(nodes: FileNode[]): FileNode[] {
    const result: FileNode[] = [];
    const walk = (items: FileNode[]) => {
      for (const item of items) {
        result.push(item);
        if (item.children) walk(item.children);
      }
    };
    walk(nodes);
    return result;
  }

  function buildTree(sessions: SessionDocument[]): FileNode[] {
    const root: Record<string, FileNode> = {};

    for (const s of sessions) {
      const fp = s.file_path || s.filePath || "";
      if (!fp) continue;

      const parts = fp.split("/").filter(Boolean);
      if (parts.length === 0) continue;

      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        const isLast = i === parts.length - 1;
        const key = parts.slice(0, i + 1).join("/");

        if (!current[seg]) {
          current[seg] = {
            key,
            name: seg,
            type: isLast ? "file" : "folder",
            children: isLast ? undefined : {},
            session: isLast ? s : undefined,
            updatedAt: s.updatedAt
          } as any;
        }

        if (!isLast) {
          const node = current[seg];
          if (!node.children || Array.isArray(node.children)) {
            node.children = {} as any;
          }
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

  /** Merge dictionary projects with any discovered from session file paths */
  function extractProjects(sessions: SessionDocument[]) {
    const filterStore = useAicrFilterStore();
    // Start with dictionary projects
    const projectSet = new Set<string>(filterStore.projects);
    const counts: Record<string, number> = { ...filterStore.projectFileCounts };
    // Add any projects discovered from file paths
    for (const s of sessions) {
      const fp = s.file_path || s.filePath || "";
      const firstSeg = fp.split("/").filter(Boolean)[0];
      if (firstSeg) {
        projectSet.add(firstSeg);
        counts[firstSeg] = (counts[firstSeg] || 0) + 1;
      }
    }
    filterStore.projects = [...projectSet].sort((a, b) => a.localeCompare(b, "zh-CN"));
    filterStore.projectFileCounts = counts;
  }

  async function loadFileTree(forceClear = false) {
    if (forceClear) {
      tree.value = [];
      flatFiles.value = [];
    }
    loading.value = true;
    error.value = null;
    try {
      const sessions = await getSessions();

      // Extract projects from ALL sessions (before filtering)
      extractProjects(sessions);

      // Apply project filter
      const filterStore = useAicrFilterStore();
      let filtered = sessions;
      if (filterStore.selectedProject) {
        const proj = filterStore.selectedProject;
        filtered = filtered.filter(s => {
          const fp = s.file_path || s.filePath || "";
          return fp.startsWith(proj + "/") || fp === proj;
        });
      }

      // Apply time filter
      const tf = filterStore.getTimeFilter();
      if (tf.start) filtered = filtered.filter(s => (s.createdAt || 0) >= tf.start!);
      if (tf.end) filtered = filtered.filter(s => (s.createdAt || 0) <= tf.end!);

      const t = buildTree(filtered);
      tree.value = t;
      flatFiles.value = flattenTree(t);
    } catch (e: any) {
      error.value = e?.message || "Failed to load file tree";
    } finally {
      loading.value = false;
    }
  }

  async function selectFile(key: string) {
    selectedKey.value = key;
    fileLoading.value = true;
    try {
      currentFileContent.value = await readFile(key);
    } catch {
      currentFileContent.value = "// Unable to load file content";
    } finally {
      fileLoading.value = false;
    }
  }

  function toggleFolder(key: string) {
    const s = new Set(expandedFolders.value);
    if (s.has(key)) {
      s.delete(key);
    } else {
      s.add(key);
    }
    expandedFolders.value = s;
  }

  function expandPathToFile(key: string) {
    const parts = key.split("/");
    const toAdd: string[] = [];
    for (let i = 1; i < parts.length; i++) {
      toAdd.push(parts.slice(0, i).join("/"));
    }
    const s = new Set(expandedFolders.value);
    for (const p of toAdd) s.add(p);
    expandedFolders.value = s;
  }

  function toggleBatchMode() {
    batchMode.value = !batchMode.value;
    if (!batchMode.value) selectedKeys.value = new Set();
  }

  function toggleFileSelection(key: string) {
    const s = new Set(selectedKeys.value);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    selectedKeys.value = s;
  }

  return {
    tree,
    flatFiles,
    selectedKey,
    currentFileContent,
    expandedFolders,
    searchQuery,
    loading,
    fileLoading,
    error,
    batchMode,
    selectedKeys,
    loadFileTree,
    selectFile,
    toggleFolder,
    expandPathToFile,
    toggleBatchMode,
    toggleFileSelection
  };
});
