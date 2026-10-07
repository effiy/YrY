/**
 * Context Files Store — session context file management.
 * Wraps the useContextChanges composable in a Pinia store.
 *
 * Note: The store depends on `activeConversation` and `updateSessionMeta`
 * which are injected via `bind()` after the store is created, since they
 * come from the main chat store's reactive state.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ContextChangeEntry } from '@/chat/types';

const MAX_CONTEXT_HISTORY = 50;

export const useContextFilesStore = defineStore('contextFiles', () => {
  const contextChangeHistory = ref<ContextChangeEntry[]>([]);
  const contextEditorVisible = ref(false);
  const contextEditorDraft = ref('');
  const contextPanelNewMode = ref(false);

  let _activeSession: () => {
    id: string; title: string; pageContent?: string; tags?: string[];
    url: string; createdAt: number; updatedAt: number; messageCount: number;
  } | null = () => null;
  let _updateSessionMeta: (key: string, meta: { pageContent?: string; tags?: string[] }) => Promise<void> =
    () => Promise.resolve();
  let _readKnowledgeFile: (path: string) => Promise<{ content?: string } | null> =
    () => Promise.resolve(null);

  function bind(
    activeSession: () => {
      id: string; title: string; pageContent?: string; tags?: string[];
      url: string; createdAt: number; updatedAt: number; messageCount: number;
    } | null,
    updateSessionMeta: (key: string, meta: { pageContent?: string; tags?: string[] }) => Promise<void>,
    readKnowledgeFile?: (path: string) => Promise<{ content?: string } | null>,
  ) {
    _activeSession = activeSession;
    _updateSessionMeta = updateSessionMeta;
    if (readKnowledgeFile) _readKnowledgeFile = readKnowledgeFile;
  }

  function getContextSectionContent(path: string): string {
    const s = _activeSession();
    if (!s) return '';
    const current = s.pageContent || '';
    const header = `## ${path.trim()}`;
    const SEP = '\n\n---\n\n';
    const sections = current.split(SEP);
    for (const section of sections) {
      const trimmed = section.trim();
      if (trimmed.startsWith(header)) {
        return trimmed.slice(header.length).trim();
      }
    }
    return '';
  }

  async function applyContextChange(path: string, content: string) {
    const s = _activeSession();
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;

    const current = s.pageContent || '';
    const header = `## ${normalized}`;
    const SEP = '\n\n---\n\n';

    const sections = current
      .split(SEP)
      .map(sec => sec.trim())
      .filter(Boolean);

    let existingIdx = -1;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].startsWith(header)) { existingIdx = i; break; }
    }

    const trimmedContent = content.trim();
    const previousPageContent = current;
    const previousTags = [...(s.tags ?? [])];
    const previousSectionContent = existingIdx >= 0 ? getContextSectionContent(normalized) : '';
    const histEntry: ContextChangeEntry = {
      path: normalized, previousContent: previousSectionContent,
      previousPageContent, previousTags, timestamp: Date.now(),
    };
    contextChangeHistory.value = [histEntry, ...contextChangeHistory.value].slice(0, MAX_CONTEXT_HISTORY);

    if (!trimmedContent) {
      if (existingIdx < 0) return;
      sections.splice(existingIdx, 1);
    } else if (existingIdx >= 0) {
      sections[existingIdx] = `${header}\n\n${trimmedContent}`;
    } else {
      sections.push(`${header}\n\n${trimmedContent}`);
    }

    const newPageContent = sections.join(SEP);
    const tags = [...(s.tags ?? [])];
    const ctxTag = `ctx:${normalized}`;
    if (!trimmedContent) {
      const tagIdx = tags.indexOf(ctxTag);
      if (tagIdx >= 0) tags.splice(tagIdx, 1);
    } else if (existingIdx < 0 && !tags.includes(ctxTag)) {
      tags.push(ctxTag);
    }

    await _updateSessionMeta(s.id, { pageContent: newPageContent, tags });
  }

  async function deleteContextSection(path: string) {
    return applyContextChange(path, '');
  }

  async function undoLastContextChange(path?: string) {
    const s = _activeSession();
    if (!s) return;
    if (!contextChangeHistory.value.length) return;

    let idx = -1;
    if (path) {
      idx = contextChangeHistory.value.findIndex(e => e.path === path);
    } else {
      idx = 0;
    }
    if (idx < 0) return;

    const entry = contextChangeHistory.value[idx];
    contextChangeHistory.value = [
      ...contextChangeHistory.value.slice(0, idx),
      ...contextChangeHistory.value.slice(idx + 1),
    ];
    await _updateSessionMeta(s.id, {
      pageContent: entry.previousPageContent,
      tags: entry.previousTags,
    });
  }

  async function addContextFile(path: string) {
    const s = _activeSession();
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;
    const ctxTag = `ctx:${normalized}`;
    const tags = [...(s.tags ?? [])];
    if (tags.includes(ctxTag)) return;
    contextChangeHistory.value = [
      {
        path: normalized, previousContent: '', previousPageContent: s.pageContent || '',
        previousTags: [...(s.tags ?? [])], timestamp: Date.now(),
      },
      ...contextChangeHistory.value,
    ].slice(0, MAX_CONTEXT_HISTORY);
    tags.push(ctxTag);
    await _updateSessionMeta(s.id, { tags });
  }

  async function removeContextFile(path: string) {
    const s = _activeSession();
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;
    const ctxTag = `ctx:${normalized}`;
    const tags = (s.tags ?? []).filter(t => t !== ctxTag);
    if (tags.length === (s.tags ?? []).length && !getContextSectionContent(normalized)) {
      return;
    }
    contextChangeHistory.value = [
      {
        path: normalized, previousContent: getContextSectionContent(normalized),
        previousPageContent: s.pageContent || '', previousTags: [...(s.tags ?? [])],
        timestamp: Date.now(),
      },
      ...contextChangeHistory.value,
    ].slice(0, MAX_CONTEXT_HISTORY);
    await applyContextChange(normalized, '');
    await _updateSessionMeta(s.id, { tags });
  }

  /**
   * Load context text from ctx: tags for the active session.
   * Mirrors YiVad's useContextFiles.loadContextText() but always reads from
   * ctx: tags rather than checking pageContent first (YiPet stores page
   * markdown in pageContent, not assembled context file contents).
   */
  async function loadContextText(): Promise<string> {
    const s = _activeSession();
    if (!s) return '';
    const ctxTags = (s.tags ?? []).filter((t: string) => t.startsWith('ctx:'));
    if (!ctxTags.length) return '';
    const results = await Promise.allSettled(
      ctxTags.map(t => _readKnowledgeFile(t.slice(4)).catch(() => null))
    );
    const sections: string[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        const content = r.value?.content || '';
        if (content) sections.push(`## ${ctxTags[i].slice(4)}\n\n${content}`);
      }
    });
    if (sections.length) {
      const text = sections.join('\n\n---\n\n');
      // Cache in pageContent so subsequent calls don't re-fetch
      await _updateSessionMeta(s.id, { pageContent: text });
      return text;
    }
    return '';
  }

  return {
    // State
    contextChangeHistory,
    contextEditorVisible,
    contextEditorDraft,
    contextPanelNewMode,

    // Actions
    bind,
    applyContextChange,
    deleteContextSection,
    undoLastContextChange,
    addContextFile,
    removeContextFile,
    getContextSectionContent,
    loadContextText,
  };
});