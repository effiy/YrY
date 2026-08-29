import { ref, type Ref } from "vue";
import type { SessionDocument } from "@/api/interface/yiweb";

interface ContextChangeEntry {
  path: string;
  previousContent: string;
  previousPageContent: string;
  previousTags: string[];
  timestamp: number;
}

const MAX_CHANGE_HISTORY = 50;

export interface ContextChangesDeps {
  activeConversation: Ref<SessionDocument | null>;
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
}

export function useContextChanges(deps: ContextChangesDeps) {
  const contextChangeHistory = ref<ContextChangeEntry[]>([]);

  function getContextSectionContent(path: string): string {
    const s = deps.activeConversation.value;
    if (!s) return "";
    const current = s.pageContent || "";
    const header = `## ${path.trim()}`;
    const SEP = "\n\n---\n\n";
    const sections = current.split(SEP);
    for (const section of sections) {
      const trimmed = section.trim();
      if (trimmed.startsWith(header)) {
        const body = trimmed.slice(header.length).trim();
        return body;
      }
    }
    return "";
  }

  async function applyContextChange(path: string, content: string) {
    const s = deps.activeConversation.value;
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;

    const current = s.pageContent || "";
    const header = `## ${normalized}`;
    const SEP = "\n\n---\n\n";

    const sections = current
      .split(SEP)
      .map(sec => sec.trim())
      .filter(Boolean);

    let existingIdx = -1;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].startsWith(header)) {
        existingIdx = i;
        break;
      }
    }

    const trimmedContent = content.trim();

    const previousPageContent = current;
    const previousTags = [...(s.tags ?? [])];
    const previousSectionContent = existingIdx >= 0
      ? getContextSectionContent(normalized)
      : "";
    const histEntry: ContextChangeEntry = {
      path: normalized,
      previousContent: previousSectionContent,
      previousPageContent,
      previousTags,
      timestamp: Date.now()
    };
    contextChangeHistory.value = [
      histEntry,
      ...contextChangeHistory.value
    ].slice(0, MAX_CHANGE_HISTORY);

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

    await deps.updateSessionMeta(s.key, { pageContent: newPageContent, tags });
  }

  async function deleteContextSection(path: string) {
    return applyContextChange(path, "");
  }

  async function undoLastContextChange(path?: string) {
    const s = deps.activeConversation.value;
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
      ...contextChangeHistory.value.slice(idx + 1)
    ];
    await deps.updateSessionMeta(s.key, {
      pageContent: entry.previousPageContent,
      tags: entry.previousTags
    });
  }

  async function addContextFile(path: string) {
    const s = deps.activeConversation.value;
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;
    const ctxTag = `ctx:${normalized}`;
    const tags = [...(s.tags ?? [])];
    if (tags.includes(ctxTag)) return;
    contextChangeHistory.value = [
      { path: normalized, previousContent: "", previousPageContent: s.pageContent || "", previousTags: [...(s.tags ?? [])], timestamp: Date.now() },
      ...contextChangeHistory.value
    ].slice(0, MAX_CHANGE_HISTORY);
    tags.push(ctxTag);
    await deps.updateSessionMeta(s.key, { tags });
  }

  async function removeContextFile(path: string) {
    const s = deps.activeConversation.value;
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;
    const ctxTag = `ctx:${normalized}`;
    const tags = (s.tags ?? []).filter(t => t !== ctxTag);
    if (tags.length === (s.tags ?? []).length && !getContextSectionContent(normalized)) {
      return;
    }
    contextChangeHistory.value = [
      { path: normalized, previousContent: getContextSectionContent(normalized), previousPageContent: s.pageContent || "", previousTags: [...(s.tags ?? [])], timestamp: Date.now() },
      ...contextChangeHistory.value
    ].slice(0, MAX_CHANGE_HISTORY);
    await applyContextChange(normalized, "");
    await deps.updateSessionMeta(s.key, { tags });
  }

  return {
    contextChangeHistory,
    applyContextChange,
    deleteContextSection,
    undoLastContextChange,
    addContextFile,
    removeContextFile,
    getContextSectionContent,
  };
}