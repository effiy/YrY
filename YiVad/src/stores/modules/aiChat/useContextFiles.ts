/**
 * useContextFiles — Context file management composable for the AI chat store.
 *
 * Extracted from `aiChat.ts`. Manages context file editor state, context
 * sections in pageContent, and loads context file contents for RAG scoping.
 */
import { ref, type Ref } from "vue";
import { useContextChanges, type ContextChangeEntry } from "@/hooks/useContextChanges";
import type { SessionDocument } from "@/api/interface/yiAi";

export interface ContextFilesDeps {
  /** The active conversation ref, owned by the main store. */
  activeConversation: Ref<SessionDocument | null>;
  /** Session meta updater from useConversations. */
  updateSessionMeta: (
    key: string,
    meta: {
      title?: string;
      pageDescription?: string;
      pageTitle?: string;
      pageContent?: string;
      tags?: string[];
    }
  ) => Promise<void>;
  /** Optional: RAG enabled ref, so we can auto-enable on add. */
  ragEnabled?: Ref<boolean>;
}

export function useContextFiles(deps: ContextFilesDeps) {
  const { activeConversation, updateSessionMeta, ragEnabled } = deps;

  const contextEditorVisible = ref(false);
  const contextEditorDraft = ref("");
  const contextPanelNewMode = ref(false);

  // ── Delegate to useContextChanges hook ──
  const {
    contextChangeHistory,
    applyContextChange: _applyContextChange,
    undoLastContextChange: _undoLastContextChange,
    addContextFile: _addContextFile,
    removeContextFile: _removeContextFile,
    getContextSectionContent
  } = useContextChanges({ activeConversation, updateSessionMeta });

  // ── Wrappers that auto-enable RAG when files are added ──

  async function applyContextChange(path: string, content: string) {
    await _applyContextChange(path, content);
    if (content.trim() && ragEnabled) {
      ragEnabled.value = true;
    }
  }

  async function addContextFile(path: string) {
    await _addContextFile(path);
    if (ragEnabled) {
      ragEnabled.value = true;
    }
  }

  async function removeContextFile(path: string) {
    await _removeContextFile(path);
  }

  async function undoLastContextChange(path?: string) {
    await _undoLastContextChange(path);
  }

  // ── Context editor UI ──

  function openContextEditor() {
    if (!activeConversation.value) return;
    contextEditorDraft.value = activeConversation.value.pageContent || "";
    contextEditorVisible.value = true;
  }

  function enterNewContextMode() {
    contextPanelNewMode.value = true;
  }

  function exitNewContextMode() {
    contextPanelNewMode.value = false;
  }

  function closeContextEditor() {
    contextEditorVisible.value = false;
  }

  async function saveContextEditorContent(text: string) {
    const s = activeConversation.value;
    if (!s) {
      closeContextEditor();
      return;
    }
    await updateSessionMeta(s.key, { pageContent: text });
    closeContextEditor();
  }

  async function saveContextToKnowledge(path?: string, content?: string, metadata?: Record<string, unknown>) {
    if (!path || !content) return;
    const { writeKnowledgeFile } = await import("@/api/modules/knowledgeService");
    const result = await writeKnowledgeFile(path, content, metadata);
    return result;
  }

  /**
   * Load context file contents for the active session. Returns empty string
   * if no ctx: tags or cached pageContent already available.
   */
  async function loadContextText(): Promise<string> {
    const session = activeConversation.value;
    if (!session) return "";
    let contextText = (session.pageContent || "").trim();
    if (contextText) return contextText;
    const ctxTags = (session.tags ?? []).filter((t: string) => t.startsWith("ctx:"));
    if (!ctxTags.length) return "";
    const { readKnowledgeFile } = await import("@/api/modules/knowledgeService");
    const results = await Promise.allSettled(ctxTags.map(t => readKnowledgeFile(t.slice(4)).catch(() => null)));
    const sections: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value) {
        const content = (r.value as any)?.content || "";
        if (content) sections.push(`## ${ctxTags[i].slice(4)}\n\n${content}`);
      }
    });
    if (sections.length) {
      contextText = sections.join("\n\n---\n\n");
      updateSessionMeta(session.key, { pageContent: contextText });
    }
    return contextText;
  }

  return {
    // State
    contextEditorVisible,
    contextEditorDraft,
    contextPanelNewMode,
    contextChangeHistory,
    // Context file CRUD
    applyContextChange,
    undoLastContextChange,
    addContextFile,
    removeContextFile,
    getContextSectionContent,
    // Context editor UI
    openContextEditor,
    closeContextEditor,
    saveContextEditorContent,
    enterNewContextMode,
    exitNewContextMode,
    saveContextToKnowledge,
    // Loader
    loadContextText
  };
}