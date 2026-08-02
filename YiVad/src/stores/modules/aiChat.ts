/**
 * AI Chat store — conversation list, active session, SSE streaming via
 * `streamChat`, message persistence through the YiWeb sessions API.
 *
 * Mirrors `src/stores/modules/aicr/chat.ts` shape, extended with a
 * conversation sidebar and per-message feedback.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { getSessions, getSession, upsertSession, deleteSession } from "@/api/modules/sessions";
import { streamChat } from "@/api/modules/chatService";
import { streamRagChat } from "@/api/modules/ragService";
import { queryDocuments } from "@/api/modules/dataService";
import { loadRobots, sendWeChatMessage } from "@/api/modules/weChatService";
import { webSearch, webFetch, extractUrls, formatSearchResults, formatFetchedContent } from "@/api/modules/searchService";
import type { WebSearchResult, WebSearchResponse } from "@/api/modules/searchService";
import type { SessionDocument, ChatMessage, FaqDocument } from "@/api/interface/yiweb";
import type { RagSource, RagStreamHandlers } from "@/api/interface/rag";
import type { FileNode } from "@/stores/modules/aicr/fileTree";
import type { AiChatFeedbackRating, AiChatStreamingType } from "@/views/aiChat/types";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";

const STORAGE_ACTIVE_KEY = "aiChat.activeKey";
const MAX_DRAFT_IMAGES = 4;
const SCROLL_THROTTLE_MS = 120;

function newKey(): string {
  return `aichat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").trim());
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

// Legacy sessions stored messages under `content`; normalize to `message` on load.
function normalizeMessage(m: ChatMessage): ChatMessage {
  if (!m) return m;
  const message = m.message ?? (m as { content?: string }).content ?? "";
  return message === m.message ? m : { ...m, message };
}

function normalizeSession(s: SessionDocument | null): SessionDocument | null {
  if (!s) return s;
  const messages = (s.messages ?? []).map(normalizeMessage);
  return messages === s.messages ? s : { ...s, messages };
}

export const useAiChatStore = defineStore("yivad-aiChat", () => {
  const conversations = ref<SessionDocument[]>([]);
  const activeConversation = ref<SessionDocument | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const input = ref("");
  const sending = ref(false);
  const abortController = ref<{ abort: () => void } | null>(null);
  const streamingTargetTimestamp = ref<number | null>(null);
  const streamingType = ref<AiChatStreamingType>("");
  const scrollTick = ref(0);
  const copyFeedback = ref<Record<string, string>>({});
  const feedback = ref<Record<number, AiChatFeedbackRating>>({});
  const draftImages = ref<string[]>([]);
  const faqs = ref<FaqDocument[]>([]);
  const faqVisible = ref(false);
  const faqSearch = ref("");
  const faqLoading = ref(false);
  const faqApplyMode = ref<"append" | "insert">("append");
  let faqLoaded = false;
  const sessionEditVisible = ref(false);
  const contextEditorVisible = ref(false);
  const contextEditorDraft = ref("");
  /** When true, ContextFilesPanel shows "new session" form instead of active session context. */
  const contextPanelNewMode = ref(false);
  const tagManagerVisible = ref(false);
  // RAG toggle — user-controlled. When ON + conversation has ctx: files → RAG chat.
  // Persisted to localStorage so the user's preference survives page reloads.
  const ragEnabled = ref(true);

  // Web search toggle — user-controlled. When ON, the user's query is sent to
  // the /web-search endpoint and results are prepended to the chat context.
  const webSearchEnabled = ref(false);

  // Results from the most recent web search (displayed in the message bubble).
  const webSearchResults = ref<WebSearchResult[]>([]);

  // True while web search API call is in-flight.
  const webSearching = ref(false);

  // Context change history for undo support. Each entry stores the state
  // before a change was applied so it can be restored.
  interface ContextChangeEntry {
    path: string;
    previousContent: string;
    previousPageContent: string;
    previousTags: string[];
    timestamp: number;
  }
  const contextChangeHistory = ref<ContextChangeEntry[]>([]);
  const MAX_CHANGE_HISTORY = 50;

  // True when the active conversation has ctx:-tagged files (can use RAG).
  const ragActive = computed(() => {
    const tags = activeConversation.value?.tags ?? [];
    return tags.some(t => typeof t === "string" && t.startsWith("ctx:"));
  });

  /**
   * System prompt snippet that teaches the AI how to propose context file edits.
   * Injected when RAG is active, so the model knows it can suggest changes to
   * the session's knowledge context via fenced code blocks.
   */
  const contextChangeSystemPrompt = computed(() => {
    if (!ragActive.value) return "";
    const hasContent = (activeConversation.value?.pageContent ?? "").trim().length > 0;
    const files = (activeConversation.value?.tags ?? [])
      .filter(t => typeof t === "string" && t.startsWith("ctx:"))
      .map(t => (t as string).slice(4));
    if (!files.length && !hasContent) return "";
    const fileList = files.map(f => `  - ${f}`).join("\n");
    return [
      "",
      "## Context file editing",
      "",
      "You can manage the session's context files. The user will see visual cards and can apply or reject your proposals.",
      "",
      "**Editing file content** — use `context:<path>`:",
      "",
      "```context:<path>",
      "<the complete new markdown content for this file>",
      "```",
      "",
      "**Adding a file to context** — use `context:add <path>` (tag only, no content required):",
      "",
      "```context:add <path>",
      "```",
      "",
      "**Removing a file from context** — use `context:remove <path>`:",
      "",
      "```context:remove <path>",
      "```",
      "",
      "**Showing a file to the user** — use `context:view <path>`:",
      "",
      "```context:view <path>",
      "```",
      "",
      "**Actions summary:**",
      "- **Create**: use a path not listed below with full content",
      "- **Update**: include the COMPLETE new content for an existing file",
      "- **Delete**: use an empty code block with `context:<path>`",
      "- **Add to context**: use `context:add <path>` to link a file without editing it",
      "- **Remove from context**: use `context:remove <path>` to unlink a file",
      "- **View file**: use `context:view <path>` to show current content",
      "",
      "Current context files:",
      fileList || "  (none)",
      "",
      "**Important:** For create/update, include COMPLETE file content, not just a diff.",
    ].join("\n");
  });

  // Backward-compat aliases
  const knowledgeMode = computed(() => ragEnabled.value && ragActive.value);
  const contextSwitchEnabled = computed(() => ragEnabled.value);
  // Transient per-message system prompt — set by callers (e.g. story's
  // file-preview chat passes the file content as context) and consumed by
  // runStream on the next send. Not persisted: file content changes between
  // previews, so storing it on the session would go stale.
  const systemPrompt = ref("");
  const weChatVisible = ref(false);
  const llamaIndexVisible = ref(false);
  const batchMode = ref(false);
  const selectedKeys = ref<Set<string>>(new Set());

  const messages = computed<ChatMessage[]>(() => activeConversation.value?.messages ?? []);

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

  const conversationTree = computed(() => buildConversationTree(conversations.value));
  const filteredConversationTree = computed(() => filterTreeByQuery(conversationTree.value, searchQuery.value.trim()));

  function isStreaming(msg: ChatMessage, _idx: number): boolean {
    if (!sending.value) return false;
    const targetTs = streamingTargetTimestamp.value;
    if (typeof targetTs !== "number") return false;
    return msg.timestamp === targetTs && msg.type === "pet";
  }

  function rememberActive(key: string) {
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, key);
    } catch {
      /* ignore */
    }
  }

  function forgetActive() {
    try {
      localStorage.removeItem(STORAGE_ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  }

  async function loadConversations() {
    loading.value = true;
    error.value = null;
    try {
      const list = (await getSessions()).map(normalizeSession).filter(Boolean) as SessionDocument[];
      conversations.value = list.sort((a, b) => {
        if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
        return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
      });
      if (!activeConversation.value && list.length) {
        let savedKey: string | null = null;
        try {
          savedKey = localStorage.getItem(STORAGE_ACTIVE_KEY);
        } catch {
          /* ignore */
        }
        const target = (savedKey && list.find(c => c.key === savedKey)) || list[0];
        await selectConversation(target.key);
      }
    } catch (e: any) {
      error.value = e?.message || "Failed to load conversations";
    } finally {
      loading.value = false;
    }
  }

  function sortConversations() {
    conversations.value = [...conversations.value].sort((a, b) => {
      if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    });
  }

  async function toggleFavorite(key: string) {
    const target = conversations.value.find(c => c.key === key);
    if (!target) return;
    const next = !target.isFavorite;
    try {
      await upsertSession({ key, isFavorite: next, updatedAt: Date.now() });
      target.isFavorite = next;
      sortConversations();
    } catch (e: any) {
      error.value = e?.message || "Failed to toggle favorite";
    }
  }

  function toggleBatchMode() {
    batchMode.value = !batchMode.value;
    if (!batchMode.value) selectedKeys.value = new Set();
  }

  function toggleSelection(key: string) {
    const s = new Set(selectedKeys.value);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    selectedKeys.value = s;
  }

  async function bulkDelete() {
    const keys = [...selectedKeys.value];
    if (!keys.length) return;
    await Promise.all(keys.map(k => deleteSession(k).catch(() => {})));
    const keySet = new Set(keys);
    conversations.value = conversations.value.filter(c => !keySet.has(c.key));
    if (activeConversation.value && keySet.has(activeConversation.value.key)) {
      activeConversation.value = null;
      forgetActive();
      if (conversations.value.length) {
        await selectConversation(conversations.value[0].key);
      }
    }
    selectedKeys.value = new Set();
    batchMode.value = false;
  }

  async function clearAllConversations() {
    const keys = conversations.value.map(c => c.key);
    if (!keys.length) return;
    await Promise.all(keys.map(k => deleteSession(k).catch(() => {})));
    conversations.value = [];
    activeConversation.value = null;
    forgetActive();
    selectedKeys.value = new Set();
    batchMode.value = false;
  }

  async function selectConversation(key: string) {
    if (activeConversation.value?.key === key) return;
    // Abort any in-flight stream before switching — otherwise the old stream
    // keeps running, and its onDone handler persists the wrong session while
    // the old pet message is abandoned as empty text. Mirrors aicr/chat.ts fix.
    if (sending.value) stopSending();
    loading.value = true;
    error.value = null;
    try {
      const session = normalizeSession(await getSession(key));
      activeConversation.value = session;
      rememberActive(key);
    } catch (e: any) {
      error.value = e?.message || "Failed to load conversation";
    } finally {
      loading.value = false;
    }
  }

  async function createConversation(title?: string, pageContent?: string, tags?: string[]) {
    const key = newKey();
    const now = Date.now();
    const session: SessionDocument = {
      key,
      url: "",
      title: title || "New chat",
      pageTitle: "",
      pageDescription: "",
      pageContent: pageContent || "",
      messages: [],
      tags: tags || [],
      createdAt: now,
      updatedAt: now
    };
    try {
      await upsertSession(session);
      conversations.value = [session, ...conversations.value];
      activeConversation.value = session;
      rememberActive(key);
      input.value = "";
    } catch (e: any) {
      error.value = e?.message || "Failed to create conversation";
    }
    return key;
  }

  async function renameConversation(key: string, title: string) {
    const target = conversations.value.find(c => c.key === key);
    if (!target) return;
    const patch = { ...target, title, updatedAt: Date.now() };
    try {
      await upsertSession(patch);
      conversations.value = conversations.value.map(c => (c.key === key ? patch : c));
      if (activeConversation.value?.key === key) {
        activeConversation.value = patch;
      }
    } catch (e: any) {
      error.value = e?.message || "Failed to rename conversation";
    }
  }

  /** Patch editable meta fields onto a session. */
  async function updateSessionMeta(
    key: string,
    meta: {
      title?: string;
      pageDescription?: string;
      pageTitle?: string;
      pageContent?: string;
      tags?: string[];
    }
  ) {
    const target = conversations.value.find(c => c.key === key);
    if (!target) return;
    const patch = { ...target, ...meta, updatedAt: Date.now() };
    try {
      await upsertSession(patch);
      conversations.value = conversations.value.map(c => (c.key === key ? patch : c));
      if (activeConversation.value?.key === key) {
        activeConversation.value = patch;
      }
    } catch (e: any) {
      error.value = e?.message || "Failed to update session";
    }
  }

  function openSessionEdit() {
    if (!activeConversation.value) return;
    sessionEditVisible.value = true;
  }

  function closeSessionEdit() {
    sessionEditVisible.value = false;
  }

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

  /**
   * Apply a context change proposal from an AI message.
   *
   * The session's pageContent is built by `ContextFilesPanel.buildPageContent()`
   * as sections joined by `\n\n---\n\n`:
   *
   *   ## path1.md
   *
   *   content for path1
   *
   *   ---
   *
   *   ## path2.md
   *
   *   content for path2
   *
   * This method splits on the separator, locates the target section by its
   * `## <path>` header, and replaces / inserts / removes it. It also keeps
   * `ctx:<path>` tags in sync with the sections.
   *
   * @param path    File path within the context (e.g. "notes/deployment.md")
   * @param content New markdown content for the section (empty = delete)
   */
  async function applyContextChange(path: string, content: string) {
    const s = activeConversation.value;
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;

    const current = s.pageContent || "";
    const header = `## ${normalized}`;
    const SEP = "\n\n---\n\n";

    // Split into sections by separator, trim whitespace, drop empties
    const sections = current
      .split(SEP)
      .map(sec => sec.trim())
      .filter(Boolean);

    // Find existing section index
    let existingIdx = -1;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].startsWith(header)) {
        existingIdx = i;
        break;
      }
    }

    const trimmedContent = content.trim();

    // Save history for undo BEFORE mutating
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
      // ── Delete ──
      if (existingIdx < 0) return;
      sections.splice(existingIdx, 1);
    } else if (existingIdx >= 0) {
      // ── Update ──
      sections[existingIdx] = `${header}\n\n${trimmedContent}`;
    } else {
      // ── Create ──
      sections.push(`${header}\n\n${trimmedContent}`);
    }

    const newPageContent = sections.join(SEP);

    // Sync ctx: tags — keep them aligned with the sections so RAG scope
    // stays accurate and ContextFilesPanel rebuilds the correct tree.
    const tags = [...(s.tags ?? [])];
    const ctxTag = `ctx:${normalized}`;
    if (!trimmedContent) {
      // Delete: remove the ctx: tag
      const tagIdx = tags.indexOf(ctxTag);
      if (tagIdx >= 0) tags.splice(tagIdx, 1);
    } else if (existingIdx < 0 && !tags.includes(ctxTag)) {
      // Create: add ctx: tag if not already present
      tags.push(ctxTag);
    }
    // Update: keep existing tag (no change needed)

    await updateSessionMeta(s.key, { pageContent: newPageContent, tags });
  }

  /**
   * Remove a context file section from pageContent by path.
   * Convenience wrapper — delegates to applyContextChange with empty content.
   */
  async function deleteContextSection(path: string) {
    return applyContextChange(path, "");
  }

  /**
   * Undo a context change from history.
   *
   * @param path  If provided, finds and restores the most recent change for
   *              that specific path. If omitted, restores the most recent
   *              change regardless of path (global undo).
   */
  async function undoLastContextChange(path?: string) {
    const s = activeConversation.value;
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
    await updateSessionMeta(s.key, {
      pageContent: entry.previousPageContent,
      tags: entry.previousTags
    });
  }

  /**
   * Add a context file by path — adds a `ctx:<path>` tag to the session.
   * The file content is NOT automatically loaded into pageContent;
   * that happens via ContextFilesPanel or a subsequent context change.
   */
  async function addContextFile(path: string) {
    const s = activeConversation.value;
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;
    const ctxTag = `ctx:${normalized}`;
    const tags = [...(s.tags ?? [])];
    if (tags.includes(ctxTag)) return;
    // Save history before mutating
    contextChangeHistory.value = [
      { path: normalized, previousContent: "", previousPageContent: s.pageContent || "", previousTags: [...(s.tags ?? [])], timestamp: Date.now() },
      ...contextChangeHistory.value
    ].slice(0, MAX_CHANGE_HISTORY);
    tags.push(ctxTag);
    await updateSessionMeta(s.key, { tags });
  }

  /**
   * Remove a context file by path — removes the `ctx:<path>` tag and the
   * corresponding pageContent section (if any).
   */
  async function removeContextFile(path: string) {
    const s = activeConversation.value;
    if (!s) return;
    const normalized = path.trim();
    if (!normalized) return;
    const ctxTag = `ctx:${normalized}`;
    const tags = (s.tags ?? []).filter(t => t !== ctxTag);
    if (tags.length === (s.tags ?? []).length && !getContextSectionContent(normalized)) {
      return; // nothing to remove
    }
    // Save history before mutating (applyContextChange will add its own entry too,
    // but we want a clean tag-only revert point)
    contextChangeHistory.value = [
      { path: normalized, previousContent: getContextSectionContent(normalized), previousPageContent: s.pageContent || "", previousTags: [...(s.tags ?? [])], timestamp: Date.now() },
      ...contextChangeHistory.value
    ].slice(0, MAX_CHANGE_HISTORY);
    // Also remove the section from pageContent
    await applyContextChange(normalized, "");
    // Then update tags (applyContextChange already handles tag removal, but
    // this ensures the tag is gone even if there was no section)
    await updateSessionMeta(s.key, { tags });
  }

  /**
   * Get the current content of a context file section from pageContent.
   * Uses the same split-on-separator approach as applyContextChange so
   * the returned content never includes separator debris.
   * Returns empty string if the section doesn't exist.
   */
  function getContextSectionContent(path: string): string {
    const s = activeConversation.value;
    if (!s) return "";
    const current = s.pageContent || "";
    const header = `## ${path.trim()}`;
    const SEP = "\n\n---\n\n";
    const sections = current.split(SEP);
    for (const section of sections) {
      const trimmed = section.trim();
      if (trimmed.startsWith(header)) {
        // Strip the header line + any blank line after it
        const body = trimmed.slice(header.length).trim();
        return body;
      }
    }
    return "";
  }

  function openTagManager() {
    if (!activeConversation.value) return;
    tagManagerVisible.value = true;
  }

  function closeTagManager() {
    tagManagerVisible.value = false;
  }

  function toggleTagManager() {
    if (!activeConversation.value) return;
    tagManagerVisible.value = !tagManagerVisible.value;
  }

  function openWeChat() {
    weChatVisible.value = true;
  }

  function closeWeChat() {
    weChatVisible.value = false;
  }

  function openLlamaIndex() {
    llamaIndexVisible.value = true;
  }

  function closeLlamaIndex() {
    llamaIndexVisible.value = false;
  }

  function toggleLlamaIndex() {
    llamaIndexVisible.value = !llamaIndexVisible.value;
  }

  async function addTag(name: string) {
    const trimmed = name.trim();
    const s = activeConversation.value;
    if (!s || !trimmed) return;
    const existing = s.tags ?? [];
    if (existing.includes(trimmed)) return;
    const next = [...existing, trimmed];
    await updateSessionMeta(s.key, { tags: next });
  }

  async function removeTag(name: string) {
    const s = activeConversation.value;
    if (!s) return;
    const next = (s.tags ?? []).filter(t => t !== name);
    await updateSessionMeta(s.key, { tags: next });
  }

  // RAG is auto — no user toggle. setContextSwitchEnabled kept for backward compat as no-op.
  function setContextSwitchEnabled(_v: boolean) { /* no-op: RAG auto-detected from conversation ctx: files */ }

  function setSystemPrompt(text: string) {
    systemPrompt.value = (text || "").trim();
  }

  /** Forward AI reply text to every enabled+autoForward WeCom robot. */
  async function forwardReplyToWeCom(content: string) {
    const text = content.trim();
    if (!text) return;
    const targets = loadRobots().filter(r => r && r.enabled && r.autoForward && r.webhook);
    if (!targets.length) return;
    await Promise.all(targets.map(r => sendWeChatMessage(r.webhook, text).catch(() => {})));
  }

  async function deleteConversation(key: string) {
    try {
      await deleteSession(key);
      conversations.value = conversations.value.filter(c => c.key !== key);
      if (activeConversation.value?.key === key) {
        activeConversation.value = null;
        forgetActive();
        if (conversations.value.length) {
          await selectConversation(conversations.value[0].key);
        }
      }
    } catch (e: any) {
      error.value = e?.message || "Failed to delete conversation";
    }
  }

  function setActiveMessages(updater: (msgs: ChatMessage[]) => ChatMessage[]) {
    if (!activeConversation.value) return;
    const next = updater(activeConversation.value.messages ?? []);
    activeConversation.value = { ...activeConversation.value, messages: next };
  }

  // Chain persisting calls so a fire-and-forget persist (e.g. from onDone) can't
  // race with a later explicit persist (e.g. from deleteMessage). Each call waits
  // for the previous one to finish, then snapshots the *latest* messages before
  // sending its own request.
  let _persistChain: Promise<void> = Promise.resolve();

  async function persistActive() {
    if (!activeConversation.value) return;
    const prev = _persistChain;
    let resolve: () => void;
    _persistChain = new Promise(r => {
      resolve = r;
    });
    try {
      await prev;
      if (!activeConversation.value) return;
      const msgs = activeConversation.value.messages;
      const key = activeConversation.value.key;
      const now = Date.now();
      await upsertSession({ key, messages: msgs, updatedAt: now });
      conversations.value = conversations.value.map(c =>
        c.key === key ? { ...c, updatedAt: now, messages: msgs } : c
      );
    } catch (e: any) {
      console.error("[aiChat] persistActive failed:", e?.message ?? e);
      ElMessage.error("Failed to save messages");
    } finally {
      resolve!();
    }
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input.value).trim();
    const hasImages = draftImages.value.length > 0;
    if (!content && !hasImages && !sending.value) return;
    if (sending.value) return;
    if (!activeConversation.value) {
      await createConversation();
    }
    if (!activeConversation.value) return;

    // Store the query for potential web search
    const userQuery = content;

    const now = Date.now();
    const images = [...draftImages.value];
    const userMsg: ChatMessage = {
      type: "user",
      message: content,
      timestamp: now,
      ...(images.length ? { imageDataUrls: images } : {})
    };
    const petMsg: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    const prevLen = activeConversation.value.messages?.length ?? 0;
    setActiveMessages(msgs => [...msgs, userMsg, petMsg]);
    input.value = "";
    draftImages.value = [];

    // ── Web search / URL fetch ──
    // When the user included URLs in their message, fetch them BEFORE
    // streaming so the LLM sees the page content in its initial response.
    // The DuckDuckGo search still runs in the background and arrives as a
    // follow-up when it enriches the answer beyond the direct URL content.
    let initialSearchContext = "";

    if (webSearchEnabled.value && userQuery) {
      const urls = extractUrls(userQuery);

      if (urls.length > 0) {
        // ── Direct URL mode: fetch first, stream with content ─────────
        webSearching.value = true;
        const fetchResults = await Promise.all(
          urls.map(u => webFetch(u).catch(() => ({ text: "", url: u, error: "fetch failed" })))
        );
        webSearching.value = false;

        const parts: string[] = [];
        for (const fr of fetchResults) {
          const f = fr as { text: string; url: string; error?: string };
          if (f.text) parts.push(formatFetchedContent(f.url, f.text));
        }
        initialSearchContext = parts.filter(Boolean).join("\n\n");

        // Also flag the user message for UI display
        if (initialSearchContext) {
          setActiveMessages(msgs => {
            const idx = msgs.findIndex(m => m.timestamp === now);
            if (idx < 0) return msgs;
            const next = [...msgs];
            next[idx] = { ...next[idx], searchContext: initialSearchContext };
            return next;
          });
        }

        // Kick off DuckDuckGo search in background for supplementary context.
        // When it completes, send a follow-up if it finds anything beyond
        // what was already in the directly-fetched URL content.
        let pendingSearchContext = "";
        const seenUrls = new Set(urls.map(u => u.toLowerCase()));

        Promise.resolve(
          webSearch(userQuery, 6).then(async searchRes => {
            const results = (searchRes as WebSearchResponse).results ?? [];
            webSearchResults.value = results;

            // Fetch search result URLs not already fetched
            const topResultUrls = results
              .map(r => r.url)
              .filter(u => u && !seenUrls.has(u.toLowerCase()))
              .slice(0, 3);

            const searchFetchResults = topResultUrls.length
              ? await Promise.all(
                topResultUrls.map(u => webFetch(u).catch(() => ({ text: "", url: u, error: "fetch failed" })))
              )
              : [];

            const extraParts: string[] = [];
            for (const fr of searchFetchResults) {
              const f = fr as { text: string; url: string; error?: string };
              if (f.text) extraParts.push(formatFetchedContent(f.url, f.text));
            }
            if (results.length) extraParts.push(formatSearchResults(results));
            pendingSearchContext = extraParts.filter(Boolean).join("\n\n");
          }).catch(() => {
            webSearchResults.value = [];
          })
        ).finally(async () => {
          await streamPromise;
          if (!pendingSearchContext) return;
          await persistActive();
          const s = activeConversation.value;
          if (!s) return;
          const followUpPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() + 1 };
          const msgs = s.messages ?? [];
          const prev = msgs.length;
          setActiveMessages(m => [...m, followUpPet]);
          await runStream(prev, followUpPet.timestamp, "send", pendingSearchContext);
        });
      } else {
        // ── No URLs in message: search in background ──────────────────
        // Same fire-and-forget pattern — stream immediately, follow-up
        // arrives when search completes.
        webSearching.value = true;
        let pendingSearchContext = "";

        Promise.resolve(
          webSearch(userQuery, 6).then(async searchRes => {
            const results = (searchRes as WebSearchResponse).results ?? [];
            webSearchResults.value = results;

            const topResultUrls = results
              .map(r => r.url)
              .filter(Boolean)
              .slice(0, 3);

            const searchFetchResults = topResultUrls.length
              ? await Promise.all(
                topResultUrls.map(u => webFetch(u).catch(() => ({ text: "", url: u, error: "fetch failed" })))
              )
              : [];

            const parts: string[] = [];
            for (const fr of searchFetchResults) {
              const f = fr as { text: string; url: string; error?: string };
              if (f.text) parts.push(formatFetchedContent(f.url, f.text));
            }
            if (results.length) parts.push(formatSearchResults(results));
            pendingSearchContext = parts.filter(Boolean).join("\n\n");
            webSearching.value = false;

            if (pendingSearchContext) {
              setActiveMessages(msgs => {
                const idx = msgs.findIndex(m => m.timestamp === now);
                if (idx < 0) return msgs;
                const next = [...msgs];
                next[idx] = { ...next[idx], searchContext: pendingSearchContext };
                return next;
              });
            }
          }).catch(() => {
            webSearching.value = false;
            webSearchResults.value = [];
          })
        ).finally(async () => {
          await streamPromise;
          if (!pendingSearchContext) return;
          await persistActive();
          const s = activeConversation.value;
          if (!s) return;
          const followUpPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() + 1 };
          const msgs = s.messages ?? [];
          const prev = msgs.length;
          setActiveMessages(m => [...m, followUpPet]);
          await runStream(prev, followUpPet.timestamp, "send", pendingSearchContext);
        });
      }
    } else {
      webSearchResults.value = [];
    }

    // Start streaming (with initialSearchContext if URLs were in the message)
    const streamPromise = runStream(prevLen, petMsg.timestamp, "send", initialSearchContext);

    await streamPromise;
  }

  /**
   * Shared streaming helper. Sends `aiMessages` (filtered, up to and including
   * the user message at `upToIdxInclusive`) to the chat service and writes
   * streamed chunks into the pet message identified by `petTimestamp`.
   * Mirrors YiWeb `sessionChatContextChatMethods.streaming.js`.
   */
  async function runStream(upToIdxInclusive: number, petTimestamp: number, type: AiChatStreamingType, searchContext = "") {
    if (!activeConversation.value) return;
    const session = activeConversation.value;
    const slice = (session.messages ?? []).slice(0, upToIdxInclusive + 1);
    const aiMessages = slice
      .filter(m => m.type === "user" || (m.type === "pet" && !!m.message))
      .map(m => ({ type: m.type, message: m.message, timestamp: m.timestamp }));

    const useRag = ragEnabled.value && ragActive.value;
    const contextText = useRag ? (session.pageContent || "").trim() : "";
    if (contextText) {
      aiMessages.unshift({
        type: "user",
        message: contextText,
        timestamp: (petTimestamp || Date.now()) - 2
      });
    }

    // Web search context: prepend as system-level context (injected as a user
    // message so the LLM sees it as factual context, not instructions).
    if (searchContext) {
      aiMessages.unshift({
        type: "user",
        message: searchContext,
        timestamp: (petTimestamp || Date.now()) - 3
      });
    }

    const lastUserMsg = [...slice].reverse().find(m => m.type === "user");
    const images = lastUserMsg?.imageDataUrls ?? [];

    let streamed = "";
    let lastScrollAt = 0;
    sending.value = true;
    streamingTargetTimestamp.value = petTimestamp;
    streamingType.value = type;

    const onChunk = (chunk: string) => {
      streamed += chunk;
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], message: streamed, error: false, aborted: false };
        return next;
      });
      const now = Date.now();
      if (now - lastScrollAt > SCROLL_THROTTLE_MS) {
        lastScrollAt = now;
        scrollTick.value++;
      }
    };
    const onSources = (sources: RagSource[]) => {
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], sources };
        return next;
      });
    };
    const onDone = () => {
      sending.value = false;
      streamingTargetTimestamp.value = null;
      streamingType.value = "";
      abortController.value = null;
      persistActive();
      const idx = activeConversation.value?.messages?.findIndex(m => m.timestamp === petTimestamp) ?? -1;
      const petMsg = idx >= 0 ? activeConversation.value?.messages?.[idx] : null;
      if (petMsg && !petMsg.aborted && !petMsg.error && streamed.trim()) {
        forwardReplyToWeCom(streamed);
      }
    };
    const onError = (err: Error) => {
      sending.value = false;
      streamingTargetTimestamp.value = null;
      streamingType.value = "";
      abortController.value = null;
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = {
          ...next[idx],
          error: true,
          message: streamed || `Error: ${err.message}`
        };
        return next;
      });
      persistActive();
    };

    let abort: () => void;
    if (ragEnabled.value && ragActive.value) {
      // RAG mode — scope to the conversation's ctx:-tagged files.
      const ctxPaths = (session.tags ?? [])
        .filter(t => typeof t === "string" && t.startsWith("ctx:"))
        .map(t => (t as string).slice(4));
      let scope: string | undefined;
      if (ctxPaths.length === 1) {
        scope = ctxPaths[0];
      } else if (ctxPaths.length > 1) {
        // Find common directory prefix across all ctx paths
        const parts = ctxPaths.map(p => p.split("/"));
        const minLen = Math.min(...parts.map(p => p.length));
        const common: string[] = [];
        for (let i = 0; i < minLen; i++) {
          if (parts.every(p => p[i] === parts[0][i])) common.push(parts[0][i]);
          else break;
        }
        scope = common.join("/") || undefined;
      }

      const ragMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
      // Inject context-editing instructions as a system message so the AI knows
      // it can propose context file changes (BUG 1 fix — was only sent in non-RAG mode).
      if (contextChangeSystemPrompt.value) {
        ragMessages.push({ role: "system", content: contextChangeSystemPrompt.value });
      }
      ragMessages.push(
        ...aiMessages
          .filter(m => (m.message ?? "").trim().length > 0)
          .map(m => ({ role: m.type === "user" ? ("user" as const) : ("assistant" as const), content: m.message }))
      );
      const handlers: RagStreamHandlers = { onChunk, onSources, onDone, onError };
      abort = streamRagChat({ messages: ragMessages, scope }, handlers).abort;
    } else {
      // Build combined system prompt: caller-provided systemPrompt (e.g. file preview)
      // + context-editing instructions when the session has context files.
      // + web search pending note when search is running in background.
      const webSearchPendingNote = (webSearchEnabled.value && !searchContext)
        ? "Note: A web search has been initiated for the user's query. Results are being fetched and will be provided to you in a follow-up message. In your current response, briefly acknowledge the query and indicate that you're checking the latest information from the web."
        : "";
      const sysParts = [systemPrompt.value, contextChangeSystemPrompt.value, webSearchPendingNote]
        .map(s => s.trim())
        .filter(Boolean);
      const system = sysParts.length ? sysParts.join("\n\n") : undefined;
      const result = streamChat(
        {
          messages: aiMessages,
          model: DEFAULT_MODEL,
          images,
          ...(system ? { system } : {})
        },
        onChunk,
        onDone,
        onError
      );
      abort = result.abort;
    }

    abortController.value = { abort };
  }

  function stopSending() {
    const targetTs = streamingTargetTimestamp.value;
    abortController.value?.abort();
    sending.value = false;
    streamingTargetTimestamp.value = null;
    streamingType.value = "";
    abortController.value = null;
    if (targetTs !== null) {
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === targetTs);
        if (idx < 0) return msgs;
        const next = [...msgs];
        const cur = next[idx];
        const trimmed = String(cur.message || "").trim();
        next[idx] = {
          ...cur,
          aborted: true,
          error: false,
          message: trimmed || "Stopped"
        };
        return next;
      });
    }
    persistActive();
  }

  /**
   * Regenerate a pet reply. Resets the pet message at `idx` and re-streams
   * from the preceding user message. Mirrors `regenerateSessionChatMessageAt`.
   */
  async function regenerateMessage(idx: number) {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const pet = messages[i];
    if (!pet || pet.type !== "pet") return;

    let userIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (messages[j] && messages[j].type !== "pet") {
        userIdx = j;
        break;
      }
    }
    if (userIdx < 0) return;
    const userMsg = messages[userIdx];
    const text = String(userMsg.message ?? "").trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    const now = Date.now();
    const petTimestamp = typeof pet.timestamp === "number" ? pet.timestamp : now;
    const resetMessages = [...messages];
    resetMessages[i] = {
      ...pet,
      type: "pet",
      timestamp: petTimestamp,
      message: "",
      error: false,
      aborted: false
    };
    activeConversation.value = { ...s, messages: resetMessages, updatedAt: now };
    scrollTick.value++;
    await runStream(userIdx, petTimestamp, "regenerate");
  }

  /**
   * Retry the last failed/aborted pet reply. Mirrors `retryLastSessionChatMessage`.
   */
  async function retryLastMessage() {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    if (messages.length === 0) return;

    let petIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i] && messages[i].type === "pet") {
        petIdx = i;
        break;
      }
    }
    if (petIdx < 0) return;
    const pet = messages[petIdx];
    if (!pet || (!pet.error && !pet.aborted)) return;

    await regenerateMessage(petIdx);
  }

  /**
   * Resend a user message: insert a fresh pet placeholder right after it,
   * then stream. Mirrors `resendSessionChatMessageAt`.
   */
  async function resendMessage(idx: number) {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const userMsg = messages[i];
    if (!userMsg || userMsg.type === "pet") return;
    const text = String(userMsg.message ?? "").trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    const now = Date.now();
    const insertedPet: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    const nextMessages = [...messages];
    nextMessages.splice(i + 1, 0, insertedPet);
    const userTimestamp = typeof userMsg.timestamp === "number" ? userMsg.timestamp : now;
    activeConversation.value = { ...s, messages: nextMessages, updatedAt: now };
    scrollTick.value++;

    // ── Web search / URL fetch ──
    // Same pattern as sendMessage: fetch user-provided URLs BEFORE streaming
    // so the LLM sees page content in its initial response.
    let initialSearchContext = "";

    if (webSearchEnabled.value && text) {
      const urls = extractUrls(text);

      if (urls.length > 0) {
        // ── Direct URL mode: fetch first, stream with content ─────────
        webSearching.value = true;
        const fetchResults = await Promise.all(
          urls.map(u => webFetch(u).catch(() => ({ text: "", url: u, error: "fetch failed" })))
        );
        webSearching.value = false;

        const parts: string[] = [];
        for (const fr of fetchResults) {
          const f = fr as { text: string; url: string; error?: string };
          if (f.text) parts.push(formatFetchedContent(f.url, f.text));
        }
        initialSearchContext = parts.filter(Boolean).join("\n\n");

        if (initialSearchContext) {
          setActiveMessages(msgs => {
            const idx = msgs.findIndex(m => m.timestamp === userTimestamp);
            if (idx < 0) return msgs;
            const next = [...msgs];
            next[idx] = { ...next[idx], searchContext: initialSearchContext };
            return next;
          });
        }

        // DuckDuckGo search in background for supplementary follow-up
        let pendingSearchContext = "";
        const seenUrls = new Set(urls.map(u => u.toLowerCase()));

        Promise.resolve(
          webSearch(text, 6).then(async searchRes => {
            const results = (searchRes as WebSearchResponse).results ?? [];
            webSearchResults.value = results;

            const topResultUrls = results
              .map(r => r.url)
              .filter(u => u && !seenUrls.has(u.toLowerCase()))
              .slice(0, 3);

            const searchFetchResults = topResultUrls.length
              ? await Promise.all(
                topResultUrls.map(u => webFetch(u).catch(() => ({ text: "", url: u, error: "fetch failed" })))
              )
              : [];

            const extraParts: string[] = [];
            for (const fr of searchFetchResults) {
              const f = fr as { text: string; url: string; error?: string };
              if (f.text) extraParts.push(formatFetchedContent(f.url, f.text));
            }
            if (results.length) extraParts.push(formatSearchResults(results));
            pendingSearchContext = extraParts.filter(Boolean).join("\n\n");
          }).catch(() => {
            webSearchResults.value = [];
          })
        ).finally(async () => {
          await streamPromise;
          if (!pendingSearchContext) return;
          await persistActive();
          const sess = activeConversation.value;
          if (!sess) return;
          const followUpPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() + 1 };
          const msgs = sess.messages ?? [];
          const prev = msgs.length;
          setActiveMessages(m => [...m, followUpPet]);
          await runStream(prev, followUpPet.timestamp, "send", pendingSearchContext);
        });
      } else {
        // ── No URLs in message: search in background ──────────────────
        webSearching.value = true;
        let pendingSearchContext = "";

        Promise.resolve(
          webSearch(text, 6).then(async searchRes => {
            const results = (searchRes as WebSearchResponse).results ?? [];
            webSearchResults.value = results;

            const topResultUrls = results
              .map(r => r.url)
              .filter(Boolean)
              .slice(0, 3);

            const searchFetchResults = topResultUrls.length
              ? await Promise.all(
                topResultUrls.map(u => webFetch(u).catch(() => ({ text: "", url: u, error: "fetch failed" })))
              )
              : [];

            const parts: string[] = [];
            for (const fr of searchFetchResults) {
              const f = fr as { text: string; url: string; error?: string };
              if (f.text) parts.push(formatFetchedContent(f.url, f.text));
            }
            if (results.length) parts.push(formatSearchResults(results));
            pendingSearchContext = parts.filter(Boolean).join("\n\n");
            webSearching.value = false;

            if (pendingSearchContext) {
              setActiveMessages(msgs => {
                const idx = msgs.findIndex(m => m.timestamp === userTimestamp);
                if (idx < 0) return msgs;
                const next = [...msgs];
                next[idx] = { ...next[idx], searchContext: pendingSearchContext };
                return next;
              });
            }
          }).catch(() => {
            webSearching.value = false;
            webSearchResults.value = [];
          })
        ).finally(async () => {
          await streamPromise;
          if (!pendingSearchContext) return;
          await persistActive();
          const sess = activeConversation.value;
          if (!sess) return;
          const followUpPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() + 1 };
          const msgs = sess.messages ?? [];
          const prev = msgs.length;
          setActiveMessages(m => [...m, followUpPet]);
          await runStream(prev, followUpPet.timestamp, "send", pendingSearchContext);
        });
      }
    } else {
      webSearchResults.value = [];
    }

    // Start streaming (with initialSearchContext if URLs were in the message)
    const streamPromise = runStream(i, insertedPet.timestamp, "resend", initialSearchContext);

    await streamPromise;
  }

  /** Delete a single message from the active conversation. */
  async function deleteMessage(idx: number) {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const nextMessages = messages.filter((_, j) => j !== i);
    activeConversation.value = { ...s, messages: nextMessages, updatedAt: Date.now() };
    await persistActive();
  }

  /** Inline-edit a user message's text. */
  async function editMessage(idx: number, content: string) {
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const m = messages[i];
    if (!m) return;
    const nextMessages = [...messages];
    nextMessages[i] = { ...m, message: content };
    activeConversation.value = { ...s, messages: nextMessages, updatedAt: Date.now() };
    await persistActive();
  }

  function copyMessage(message: ChatMessage) {
    const text = message.message ?? "";
    if (!text) return;
    const key = String(message.timestamp);
    navigator.clipboard.writeText(text).then(() => {
      copyFeedback.value = { ...copyFeedback.value, [key]: "copied" };
      setTimeout(() => {
        copyFeedback.value = { ...copyFeedback.value, [key]: "" };
      }, 2000);
    });
  }

  function submitFeedback(timestamp: number, rating: AiChatFeedbackRating) {
    const current = feedback.value[timestamp];
    feedback.value = { ...feedback.value, [timestamp]: current === rating ? null : rating };
  }

  function clearInput() {
    input.value = "";
    draftImages.value = [];
  }

  async function addDraftImageFiles(files: File[]) {
    const remaining = MAX_DRAFT_IMAGES - draftImages.value.length;
    if (remaining <= 0) {
      ElMessage.warning(`Up to ${MAX_DRAFT_IMAGES} images supported`);
      return;
    }
    const picked = files.slice(0, remaining);
    if (picked.length < files.length) {
      ElMessage.warning(`Up to ${MAX_DRAFT_IMAGES} images supported`);
    }
    try {
      const urls = await Promise.all(picked.map(readFileAsDataUrl));
      draftImages.value = [...draftImages.value, ...urls.filter(u => u.startsWith("data:image/"))];
    } catch (e) {
      ElMessage.error("Failed to read image");
    }
  }

  function removeDraftImage(idx: number) {
    const list = [...draftImages.value];
    if (idx < 0 || idx >= list.length) return;
    list.splice(idx, 1);
    draftImages.value = list;
  }

  function clearDraftImages() {
    draftImages.value = [];
  }

  async function loadFaqs(force = false) {
    if (faqLoaded && !force) return;
    faqLoading.value = true;
    try {
      const res = await queryDocuments<FaqDocument>({ cname: "faqs", limit: 100000 });
      if (res.code !== 0) throw new Error(res.message || "Failed to load FAQs");
      const list = res.data?.list ?? [];
      list.sort((a, b) => (a.order ?? a.createdAt ?? 0) - (b.order ?? b.createdAt ?? 0));
      faqs.value = list;
      faqLoaded = true;
    } catch {
      /* ignore */
    } finally {
      faqLoading.value = false;
    }
  }

  function openFaq() {
    faqVisible.value = true;
    if (!faqLoaded) loadFaqs();
  }

  function closeFaq() {
    faqVisible.value = false;
  }

  function toggleFaq() {
    if (faqVisible.value) closeFaq();
    else openFaq();
  }

  function applyFaq(item: FaqDocument, mode: "insert" | "append" = faqApplyMode.value) {
    const title = (item.title || "").trim();
    const prompt = (item.prompt || "").trim();
    const text = title && prompt ? `${title}\n\n${prompt}` : prompt || title;
    if (!text) return;
    const current = input.value;
    input.value = mode === "append" && current ? `${current}\n\n${text}` : text;
    closeFaq();
  }

  return {
    conversations,
    activeConversation,
    loading,
    error,
    input,
    sending,
    streamingTargetTimestamp,
    streamingType,
    scrollTick,
    copyFeedback,
    feedback,
    draftImages,
    faqs,
    faqVisible,
    faqSearch,
    faqLoading,
    faqApplyMode,
    sessionEditVisible,
    contextEditorVisible,
    contextEditorDraft,
    tagManagerVisible,
    contextPanelNewMode,
    knowledgeMode,
    contextSwitchEnabled,
    ragEnabled,
    webSearchEnabled,
    webSearchResults,
    webSearching,
    weChatVisible,
    batchMode,
    selectedKeys,
    messages,
    searchQuery,
    expandedFolders,
    conversationTree,
    filteredConversationTree,
    toggleFolder,
    isStreaming,
    loadConversations,
    selectConversation,
    createConversation,
    renameConversation,
    updateSessionMeta,
    toggleFavorite,
    toggleBatchMode,
    toggleSelection,
    bulkDelete,
    clearAllConversations,
    openSessionEdit,
    closeSessionEdit,
    openContextEditor,
    closeContextEditor,
    saveContextEditorContent,
    applyContextChange,
    deleteContextSection,
    getContextSectionContent,
    contextChangeHistory,
    undoLastContextChange,
    addContextFile,
    removeContextFile,
    contextChangeSystemPrompt,
    enterNewContextMode,
    exitNewContextMode,
    toggleTagManager,
    openTagManager,
    closeTagManager,
    openWeChat,
    closeWeChat,
    llamaIndexVisible,
    openLlamaIndex,
    closeLlamaIndex,
    toggleLlamaIndex,
    addTag,
    removeTag,
    setContextSwitchEnabled,
    setSystemPrompt,
    systemPrompt,
    deleteConversation,
    sendMessage,
    stopSending,
    regenerateMessage,
    retryLastMessage,
    resendMessage,
    deleteMessage,
    editMessage,
    copyMessage,
    submitFeedback,
    clearInput,
    addDraftImageFiles,
    removeDraftImage,
    clearDraftImages,
    loadFaqs,
    openFaq,
    closeFaq,
    toggleFaq,
    applyFaq,
    persistActive
  };
});
