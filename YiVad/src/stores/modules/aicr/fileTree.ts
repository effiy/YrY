/**
 * AICR File Tree store — file tree data, selection, CRUD operations.
 * Builds the file tree from session documents, applying project and time-range filters.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getSessions, getSession, upsertSession, updateSession, deleteSession } from "@/api/modules/sessions";
import { readFile, readProjectFile, writeFile, deleteFile, deleteFolder, renameFile, renameFolder, fetchSourceFromDevServer } from "@/api/modules/fileService";
import { useAicrFilterStore } from "@/stores/modules/aicr/filters";
import type { SessionDocument } from "@/api/interface/yiweb";

// Read a file from the best source for its path. Project source paths
// (e.g. "YiVad/src/foo.vue", "YiKnowledge/foo.md") hit YiAi's
// /read-project-file, which resolves against the workspace projects_root
// with sibling-project detection — so cross-project paths land on the
// right disk. Static files (no project prefix) fall back to /read-file
// (disk + MongoDB). This avoids stale SPA-shell entries that earlier
// dev-server fallbacks wrote into MongoDB's static_files collection.
async function smartReadFile(path: string): Promise<string> {
  const first = (path || "").split("/")[0] ?? "";
  if (/^[A-Z][a-zA-Z0-9_]+$/.test(first)) {
    try {
      return await readProjectFile("YiAi", path);
    } catch {
      // Not on project disk — fall through to /read-file (static dir + Mongo)
    }
  }
  return readFile(path);
}

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
  // One-shot filter: when set, the next `loadFileTree` call will only keep
  // sessions whose file_path is in this set, then clear itself. Used by
  // external pages (e.g. story cards) to scope the aicr sidebar to a
  // specific file list. Cleared after applying so subsequent refreshes /
  // file creations inside aicr show the full tree again.
  const pendingFilterPaths = ref<Set<string> | null>(null);
  // One-shot auto-select: when set, the aicr page's onMounted/onActivated
  // will expand the path to this file, select it (loading its content into
  // the CodeViewer), and collapse the side panels so the code is front and
  // center. Cleared after applying.
  const pendingSelectKey = ref<string | null>(null);
  // Persistent path filter for "review mode" — set by the story / bug page
  // when the user clicks Code Review. Unlike `pendingFilterPaths`, this is
  // NOT cleared after applying, so refresh / filter changes inside aicr
  // keep the sidebar scoped to the reviewed card's files. Cleared via
  // `clearReviewFilter` (typically when the user dismisses the context chip).
  const reviewFilterPaths = ref<Set<string> | null>(null);

  function setPendingFilter(paths: string[] | null) {
    const unique = Array.from(new Set((paths ?? []).filter(Boolean)));
    pendingFilterPaths.value = unique.length > 0 ? new Set(unique) : null;
  }

  function setReviewFilter(paths: string[] | null) {
    const unique = Array.from(new Set((paths ?? []).filter(Boolean)));
    reviewFilterPaths.value = unique.length > 0 ? new Set(unique) : null;
  }

  function clearReviewFilter() {
    reviewFilterPaths.value = null;
  }

  function setPendingSelectKey(key: string | null) {
    pendingSelectKey.value = key || null;
  }

  function consumePendingSelectKey(): string | null {
    const k = pendingSelectKey.value;
    pendingSelectKey.value = null;
    return k;
  }

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

  async function loadFileTree(forceClear = false) {
    if (forceClear) {
      tree.value = [];
      flatFiles.value = [];
    }
    loading.value = true;
    error.value = null;
    try {
      const sessions = await getSessions();

      // Apply time filter
      const filterStore = useAicrFilterStore();
      const tf = filterStore.getTimeFilter();
      let filtered = sessions;
      if (tf.start) filtered = filtered.filter(s => (s.createdAt || 0) >= tf.start!);
      if (tf.end) filtered = filtered.filter(s => (s.createdAt || 0) <= tf.end!);

      // Apply one-shot path filter (set by external pages before navigating
      // into aicr). Keep only sessions whose file_path is in the set, then
      // clear so subsequent refreshes inside aicr show the full tree again.
      const filterPaths = pendingFilterPaths.value;
      if (filterPaths && filterPaths.size > 0) {
        filtered = filtered.filter(s => filterPaths.has(s.file_path || s.filePath || ""));
      }
      pendingFilterPaths.value = null;

      // Apply persistent review-mode filter (story/scenario card → Code
      // Review). Stays active across refreshes until the user dismisses the
      // context chip in the aicr header.
      const reviewPaths = reviewFilterPaths.value;
      if (reviewPaths && reviewPaths.size > 0) {
        filtered = filtered.filter(s => reviewPaths.has(s.file_path || s.filePath || ""));
      }

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
      currentFileContent.value = await smartReadFile(key);
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

  /** Filter the tree by `searchQuery` — a node is kept if it or any descendant matches. */
  function filterTreeByQuery(nodes: FileNode[], q: string): FileNode[] {
    if (!q) return nodes;
    const lower = q.toLowerCase();
    const walk = (items: FileNode[]): FileNode[] => {
      const out: FileNode[] = [];
      for (const n of items) {
        const selfMatch = n.name.toLowerCase().includes(lower) || n.key.toLowerCase().includes(lower);
        const children = n.children ? walk(n.children) : [];
        if (selfMatch || children.length > 0) {
          out.push({ ...n, children: n.children ? children : n.children });
        }
      }
      return out;
    };
    return walk(nodes);
  }

  const filteredTree = computed(() => filterTreeByQuery(tree.value, searchQuery.value.trim()));
  const flatFilteredFiles = computed(() => flattenTree(filteredTree.value));

  /** Build the session document fields derived from a file path. Mirrors YiWeb sessionSyncService.fileToSession. */
  function sessionFieldsFromPath(path: string) {
    const parts = path.split("/").filter(Boolean);
    const fileName = (parts[parts.length - 1] || "").trim().replace(/\s+/g, "_");
    const tags = parts.slice(0, -1); // folder segments become tags
    return {
      key: path,
      url: `aicr-session://${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      title: fileName,
      pageDescription: `File: ${path}`,
      tags,
      isFavorite: false,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastAccessTime: Date.now(),
      file_path: path
    } as Partial<SessionDocument> & { key: string };
  }

  /** Path-derived fields to override when a file/folder is renamed. Everything
   *  else on the existing session (url, pageDescription, pageContent, createdAt,
   *  messages, isFavorite, …) is preserved — only key/file_path/title/tags change
   *  with the new path. Without this, renaming would wipe the user's page context
   *  and history.
   */
  function pathDerivedFields(path: string): Partial<SessionDocument> & { key: string } {
    const parts = path.split("/").filter(Boolean);
    const fileName = (parts[parts.length - 1] || "").trim().replace(/\s+/g, "_");
    const tags = parts.slice(0, -1);
    return { key: path, file_path: path, title: fileName, tags };
  }

  /** Create a file on disk and a matching session document. */
  async function createFile(parentPath: string, fileName: string, content = "") {
    const path = parentPath ? `${parentPath}/${fileName}` : fileName;
    await writeFile(path, content);
    await upsertSession(sessionFieldsFromPath(path));
    await loadFileTree(true);
    return path;
  }

  /** Rename a file or folder — disk + session document. */
  async function renameNode(oldKey: string, newName: string, isFolder: boolean) {
    const parts = oldKey.split("/").filter(Boolean);
    parts[parts.length - 1] = newName;
    const newKey = parts.join("/");
    if (oldKey === newKey) return;

    if (isFolder) {
      await renameFolder(oldKey, newKey);
      // Update every FILE session whose file_path is under the old folder.
      // `flatFiles` includes folder nodes too, but folders don't have a
      // session (session is undefined for type==="folder"). Without this
      // filter, the folder node itself would enter the upsert loop with
      // `session: undefined`, and `upsertSession({ ...{}, ...pathDerivedFields(newKey), ... })`
      // would create a spurious session document at the new folder path —
      // which then renders as a phantom file at the root of the tree after
      // loadFileTree(true) re-walks sessions.
      const under = flatFiles.value.filter(
        f => f.type === "file" && (f.key === oldKey || f.key.startsWith(oldKey + "/"))
      );
      await Promise.all(
        under.map(async f => {
          const suffix = f.key.slice(oldKey.length);
          const nextPath = `${newKey}${suffix}`;
          await upsertSession({
            ...(f.session ?? {}),
            ...pathDerivedFields(nextPath),
            updatedAt: Date.now()
          } as any);
          await deleteSession(f.key);
        })
      );
    } else {
      await renameFile(oldKey, newKey);
      // Replace the single session doc: create under new key, delete old.
      const oldSession = flatFiles.value.find(f => f.key === oldKey)?.session;
      await upsertSession({
        ...(oldSession ?? {}),
        ...pathDerivedFields(newKey),
        updatedAt: Date.now()
      } as any);
      await deleteSession(oldKey);
    }
    // Keep the selection pointing at the live path — without this, a save
    // after renaming the selected file would write to the old (now-gone)
    // disk path, and CodeViewer would keep showing the pre-rename content.
    if (selectedKey.value === oldKey) {
      selectedKey.value = newKey;
    } else if (isFolder && selectedKey.value?.startsWith(oldKey + "/")) {
      selectedKey.value = newKey + selectedKey.value.slice(oldKey.length);
    }
    await loadFileTree(true);
  }

  /** Delete a file or folder — disk + session document(s). */
  async function deleteNode(key: string, isFolder: boolean) {
    if (isFolder) {
      await deleteFolder(key);
      // Only FILE nodes have sessions; folder nodes are virtual tree entries
      // with session===undefined. Filtering to files avoids a no-op
      // deleteSession call for the folder's own key (which has no session).
      const under = flatFiles.value.filter(
        f => f.type === "file" && (f.key === key || f.key.startsWith(key + "/"))
      );
      await Promise.all(under.map(f => deleteSession(f.session?.key ?? f.key)));
    } else {
      await deleteFile(key);
      // Session's `key` field is a UUID, not the file_path — delete by
      // that. If no session backs this path, there's nothing to delete.
      const node = flatFiles.value.find(f => f.key === key);
      await deleteSession(node?.session?.key ?? key);
    }
    if (selectedKey.value === key || (isFolder && selectedKey.value?.startsWith(key + "/"))) {
      selectedKey.value = null;
      currentFileContent.value = "";
    }
    await loadFileTree(true);
  }

  /** Ensure each path has a session document so it renders in the aicr
   *  sidebar file tree, and the file's REAL content is staged on the
   *  session's `pageContent` field so the aicr chat AI can use it as
   *  system context for code review.
   *
   *  Content resolution order:
   *    1. YiAi `readFile` — hits YiAi's static/ disk, falls back to its
   *       MongoDB static_files collection.
   *    2. YiVad dev server — story cards often reference YiVad's own
   *       source paths (e.g. `src/views/foo.vue`) which don't exist on
   *       YiAi's disk. In dev mode, Rsbuild serves those paths; we fetch
   *       the content and `writeFile` it to YiAi so subsequent reads hit
   *       disk. Skipped in production (source tree not served).
   *
   *  - Session exists: only refresh `pageContent` (other fields preserved
   *    via YiAi's $set merge).
   *  - Session missing: create with path-derived fields + pageContent.
   *  - If neither source produces content, leave pageContent untouched.
   *
   *  No tree reload here — the aicr page's onMounted reloads.
   */
  async function ensureFilesInTree(paths: string[]) {
    const unique = Array.from(new Set(paths.filter(Boolean)));
    if (unique.length === 0) return;
    await Promise.all(
      unique.map(async path => {
        // Read from the live source (project disk via /read-project-file).
        // Falls back to /read-file (static + Mongo) for non-project paths.
        // Reject HTML shell content that stale MongoDB entries may hold —
        // a real source file never starts with `<!DOCTYPE`/`<html`.
        let content: string | null = null;
        try {
          const raw = await smartReadFile(path);
          if (raw && !/^\s*<!doctype\s/i.test(raw) && !/^\s*<html/i.test(raw)) {
            content = raw;
          }
        } catch {
          content = null;
        }
        if (content === null) {
          // Last-resort: YiVad dev server source fetch (dev mode only).
          // Useful when YiAi's projects_root doesn't include the file's
          // project (e.g. a brand-new sibling not yet on disk).
          const devContent = await fetchSourceFromDevServer(path);
          if (devContent !== null) {
            try {
              await writeFile(path, devContent);
            } catch {
              /* ignore — pageContent still carries the content for AI context */
            }
            content = devContent;
          }
        }
        const existing = await getSession(path);
        if (existing) {
          if (content !== null) {
            await updateSession(path, { pageContent: content, updatedAt: Date.now() });
          }
          return;
        }
        const fields = sessionFieldsFromPath(path);
        await upsertSession(content !== null ? { ...fields, pageContent: content } : fields);
      })
    );
  }

  return {
    tree,
    filteredTree,
    flatFiles,
    flatFilteredFiles,
    selectedKey,
    currentFileContent,
    expandedFolders,
    searchQuery,
    loading,
    fileLoading,
    error,
    pendingFilterPaths,
    pendingSelectKey,
    reviewFilterPaths,
    setPendingFilter,
    setPendingSelectKey,
    setReviewFilter,
    clearReviewFilter,
    consumePendingSelectKey,
    loadFileTree,
    selectFile,
    toggleFolder,
    expandPathToFile,
    createFile,
    renameNode,
    deleteNode,
    ensureFilesInTree
  };
});
