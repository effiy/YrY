/**
 * YiPet Chat — Context files composable.
 * Mirrors YiVad aiChat's ChatToolbar useContextFiles: flat list of ctx:-tagged
 * file paths, with a popover that has "Context" (file list) and "Browse"
 * (knowledge tree) tabs. Drag-and-drop support, inline editor.
 *
 * Tree-building logic delegates to ../ContextFilesPanel/contextTreeUtils.ts.
 */
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useChatStore } from '../../stores/chat';
import {
  type ContextNode,
  type DisplayItem,
  extractCtxPaths,
  buildKnowledgeBrowseTree,
  flattenForDisplay,
} from '../ContextFilesPanel/contextTreeUtils';

export function useContextFiles() {
  const store = useChatStore();
  const s = store.state;

  // ── Current session ──
  const currentSession = computed(() =>
    s.sessions.find((ses) => ses.id === s.currentSessionId),
  );

  // ── Context files (flat list from ctx: tags) ──
  const contextFiles = computed<string[]>(() => {
    const ses = currentSession.value;
    return ses?.tags ? extractCtxPaths(ses.tags as string[]) : [];
  });

  const contextFileCount = computed(() => contextFiles.value.length);

  // ── Popover ──
  const showContextPopover = ref(false);
  const contextPopoverTab = ref<'context' | 'browse'>('context');

  // ── RAG (placeholder) ──
  const ragScopeInfo = computed(() => null);
  const ragAutoScoped = computed(() => false);

  // ── Context DnD handlers ──
  const contextDropCounter = ref(0);
  const contextDropOver = ref(false);

  function isCtxDrag(e: DragEvent): boolean {
    return !!(
      e.dataTransfer?.types.includes('application/x-yipet-knowledge-file') ||
      e.dataTransfer?.types.includes('application/x-knowledge-file')
    );
  }

  function onCtxDragOver(e: DragEvent) {
    if (!isCtxDrag(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }

  function onCtxDragEnter(e: DragEvent) {
    if (!isCtxDrag(e)) return;
    e.preventDefault();
    contextDropCounter.value += 1;
    contextDropOver.value = true;
  }

  function onCtxDragLeave(e: DragEvent) {
    e.preventDefault();
    contextDropCounter.value -= 1;
    if (contextDropCounter.value <= 0) {
      contextDropCounter.value = 0;
      contextDropOver.value = false;
    }
  }

  async function onCtxDrop(e: DragEvent) {
    e.preventDefault();
    contextDropCounter.value = 0;
    contextDropOver.value = false;
    const yipet = e.dataTransfer?.getData('application/x-yipet-knowledge-file') || '';
    const yivad = e.dataTransfer?.getData('application/x-knowledge-file') || '';
    if (yipet) {
      await addSingleToContext(yipet);
    } else if (yivad) {
      try {
        const parsed = JSON.parse(yivad);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item.path) await addSingleToContext(item.path);
        }
      } catch { /* ignore */ }
    }
  }

  // ── Context inline editor ──
  const ctxEditorOpen = ref(false);
  const ctxEditorPath = ref('');
  const ctxEditorContent = ref('');
  const ctxEditorOriginal = ref('');
  const ctxEditorLoading = ref(false);
  const ctxEditorSaving = ref(false);

  async function openCtxEditor(path: string) {
    ctxEditorPath.value = path;
    ctxEditorLoading.value = true;
    ctxEditorSaving.value = false;
    ctxEditorOpen.value = true;
    try {
      const content = (await store.getContextSectionContent?.(path)) as any;
      ctxEditorOriginal.value = typeof content === 'string' ? content : content?.content || '';
      ctxEditorContent.value = ctxEditorOriginal.value;
    } catch {
      ctxEditorOriginal.value = '';
      ctxEditorContent.value = '';
      ElMessage.warning('Could not load context content');
    } finally {
      ctxEditorLoading.value = false;
    }
  }

  function closeCtxEditor() {
    ctxEditorOpen.value = false;
    ctxEditorPath.value = '';
    ctxEditorContent.value = '';
    ctxEditorOriginal.value = '';
  }

  async function saveCtxEditor() {
    if (!ctxEditorPath.value) return;
    ctxEditorSaving.value = true;
    try {
      await store.applyContextChange?.(ctxEditorPath.value, ctxEditorContent.value);
      ElMessage.success('Context updated');
      closeCtxEditor();
    } catch {
      ElMessage.error('Failed to save context changes');
    } finally {
      ctxEditorSaving.value = false;
    }
  }

  // ── Browse tree (delegates to contextTreeUtils) ──

  const knowledgeSearch = ref('');
  const knowledgeExpandedFolders = ref<Set<string>>(new Set());

  const browseTree = computed<ContextNode[]>(() =>
    buildKnowledgeBrowseTree(s.knowledgeTree, knowledgeSearch.value.trim()),
  );

  const browseItems = computed<DisplayItem[]>(() => {
    const expanded = knowledgeExpandedFolders.value;
    const all = flattenForDisplay(browseTree.value);
    // Respect collapsed state
    const out: DisplayItem[] = [];
    let skipDepth = -1;
    for (const item of all) {
      if (skipDepth >= 0) {
        if (item.depth > skipDepth) continue;
        skipDepth = -1;
      }
      if (item.node.type === 'folder' && !expanded.has(item.node.key)) {
        out.push(item);
        skipDepth = item.depth;
      } else {
        out.push(item);
      }
    }
    return out;
  });

  function toggleKnowledgeFolder(key: string) {
    const next = new Set(knowledgeExpandedFolders.value);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    knowledgeExpandedFolders.value = next;
  }

  // ── Context file operations ──

  async function addSingleToContext(path: string) {
    if (!path) return;
    if (contextFiles.value.includes(path)) {
      ElMessage.info(`Already in context: ${path}`);
      return;
    }
    try {
      const content = await store.readKnowledgeFileContent?.(path);
      if (content) {
        await store.applyContextChange?.(path, content);
        ElMessage.success(`Added to context: ${path}`);
      } else {
        await store.addContextFile?.(path);
        ElMessage.success(`Added to context (content will load on send): ${path}`);
      }
    } catch {
      try { await store.addContextFile?.(path); } catch { /* ignore */ }
      ElMessage.warning(`Added tag only: ${path}`);
    }
  }

  async function addFolderToContext(node: ContextNode) {
    if (!node.children?.length) return;
    const files: ContextNode[] = [];
    const collect = (arr: ContextNode[]) => {
      for (const n of arr) {
        if (n.type === 'file') files.push(n);
        else if (n.children?.length) collect(n.children);
      }
    };
    collect(node.children);
    let added = 0;
    let tagOnly = 0;
    for (const f of files) {
      if (contextFiles.value.includes(f.path)) continue;
      try {
        const content = await store.readKnowledgeFileContent?.(f.path);
        if (content) {
          await store.applyContextChange?.(f.path, content);
          added++;
        } else {
          await store.addContextFile?.(f.path);
          tagOnly++; added++;
        }
      } catch { /* skip */ }
    }
    if (added > 0) {
      const detail = tagOnly > 0 ? ` (${tagOnly} tag-only)` : '';
      ElMessage.success(`Added ${added} file(s) from "${node.name}"${detail}`);
    }
  }

  function onContextPopoverShow() {
    contextPopoverTab.value = contextFileCount.value > 0 ? 'context' : 'browse';
    knowledgeSearch.value = '';
    store.loadKnowledgeTree();
  }

  async function handleContextFileClick(path: string) {
    store.openKnowledgePreview?.(path);
    showContextPopover.value = false;
  }

  function removeContextFile(path: string) {
    store.removeContextFile?.(path);
  }

  // ── File health indicators ──

  const fileHealthIssues = computed(() => {
    const stale: string[] = [];
    const missingMeta: string[] = [];
    const now = Date.now();
    const reviewCycleDays: Record<string, number> = {
      weekly: 7, monthly: 30, quarterly: 90, 'half-yearly': 180, yearly: 365,
    };

    for (const cat of s.knowledgeTree) {
      for (const f of cat.files) {
        const meta = (f.meta || {}) as Record<string, unknown>;
        const reviewCycle = String(meta.review_cycle || '');
        const updated = String(meta.updated || f.updated || '');
        if (reviewCycle && updated && reviewCycleDays[reviewCycle]) {
          const updatedMs = new Date(updated).getTime();
          if (!isNaN(updatedMs) && now - updatedMs > reviewCycleDays[reviewCycle] * 86400000) {
            stale.push(f.path);
          }
        }
        if (!meta.status || !meta.type || !meta.lifecycle) {
          missingMeta.push(f.path);
        }
      }
    }
    return { stale, missingMeta, total: stale.length + missingMeta.length };
  });

  return {
    showContextPopover,
    contextPopoverTab,
    contextFiles,
    contextFileCount,
    ragScopeInfo,
    ragAutoScoped,
    currentSession,
    // DnD
    contextDropOver,
    onCtxDragEnter,
    onCtxDragOver,
    onCtxDragLeave,
    onCtxDrop,
    // Editor
    ctxEditorOpen,
    ctxEditorPath,
    ctxEditorContent,
    ctxEditorOriginal,
    ctxEditorLoading,
    ctxEditorSaving,
    openCtxEditor,
    closeCtxEditor,
    saveCtxEditor,
    cancelCtxEditor: closeCtxEditor,
    // Browse
    knowledgeSearch,
    knowledgeExpandedFolders,
    browseItems,
    knowledgeLoading: computed(() => s.knowledgeLoading),
    knowledgeError: computed(() => s.knowledgeError),
    knowledgeLoaded: computed(() => s.knowledgeTree.length > 0),
    toggleKnowledgeFolder,
    addSingleToContext,
    addFolderToContext,
    onContextPopoverShow,
    handleContextFileClick,
    removeContextFile,
    fileHealthIssues,
  };
}