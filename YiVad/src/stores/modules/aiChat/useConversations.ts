/**
 * useConversations — Conversation management composable for the AI chat store.
 *
 * Extracted from `aiChat.ts` to separate conversation CRUD from streaming,
 * context files, and tool events. Owns conversation list state and all
 * persistence operations.
 */
import { ref, type Ref } from "vue";
import type { SessionDocument } from "@/api/interface/yiAi";
import { getSessions, getSession, upsertSession, updateSession, deleteSession } from "@/api/modules/sessions";
import { escape as escapeHtml } from "lodash-es";
import { newKey, normalizeSession } from "@/utils/chatNormalizers";

const STORAGE_ACTIVE_KEY = "aiChat.activeKey";

export interface ConversationsDeps {
  /** The active conversation ref, owned by the main store. */
  activeConversation: Ref<SessionDocument | null>;
  /** Whether a stream is currently active. */
  sending: Ref<boolean>;
  /** Callback to abort the current stream (provided by main store). */
  stopSending: () => void;
}

export function useConversations(deps: ConversationsDeps) {
  const { activeConversation, sending, stopSending } = deps;

  const conversations = ref<SessionDocument[]>([]);
  const conversationsLoaded = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ── Batch selection state ──
  const batchMode = ref(false);
  const selectedKeys = ref<Set<string>>(new Set());

  // ── Private helpers ──

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

  // ── Conversation CRUD ──

  async function loadConversations() {
    if (loading.value) return;
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
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load conversations";
    } finally {
      loading.value = false;
      conversationsLoaded.value = true;
    }
  }

  function sortConversations() {
    conversations.value = [...conversations.value].sort((a, b) => {
      if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    });
  }

  async function selectConversation(key: string) {
    if (activeConversation.value?.key === key) return;
    if (sending.value) stopSending();
    loading.value = true;
    error.value = null;
    try {
      const session = normalizeSession(await getSession(key));
      activeConversation.value = session;
      rememberActive(key);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load conversation";
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
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to create conversation";
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
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to rename conversation";
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
    const updatedAt = Date.now();
    try {
      await updateSession(key, { ...meta, updatedAt });
      const isActive = activeConversation.value?.key === key;
      const liveMessages = isActive ? activeConversation.value!.messages : target.messages;
      const patch = { ...target, ...meta, messages: liveMessages, updatedAt };
      conversations.value = conversations.value.map(c => (c.key === key ? patch : c));
      if (isActive) activeConversation.value = patch;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to update session";
    }
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
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to delete conversation";
    }
  }

  async function toggleFavorite(key: string) {
    const target = conversations.value.find(c => c.key === key);
    if (!target) return;
    const next = !target.isFavorite;
    try {
      await upsertSession({ key, isFavorite: next, updatedAt: Date.now() });
      target.isFavorite = next;
      sortConversations();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to toggle favorite";
    }
  }

  // ── Batch operations ──

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

  function selectAll(keys: string[]) {
    selectedKeys.value = new Set(keys);
  }

  function clearSelection() {
    selectedKeys.value = new Set();
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

  // ── Export ──

  function exportConversation() {
    const s = activeConversation.value;
    if (!s) return;
    const lines: string[] = [];
    lines.push(`# ${s.title || "Chat"}`);
    lines.push("");
    lines.push(`> Exported: ${new Date().toISOString()}`);
    if (s.pageContent) {
      lines.push("");
      lines.push("## Context");
      lines.push("");
      lines.push(s.pageContent);
    }
    lines.push("");
    lines.push("## Conversation");
    lines.push("");
    for (const m of s.messages ?? []) {
      const role = m.type === "user" ? "**User**" : m.type === "followup" ? "**Follow-up (queued)**" : "**AI**";
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";
      lines.push(`### ${role} ${time ? `(${time})` : ""}`);
      lines.push("");
      lines.push(m.message || "_(empty)_");
      lines.push("");
      if (m.toolCalls?.length) {
        for (const tc of m.toolCalls) {
          lines.push(`<details>`);
          lines.push(`<summary>Tool: \`${tc.name}\`</summary>`);
          lines.push("");
          if (tc.content) {
            lines.push("```");
            lines.push(tc.content);
            lines.push("```");
          }
          lines.push("");
          lines.push(`</details>`);
          lines.push("");
        }
      }
    }
    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(s.title || "chat").replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportConversationHtml() {
    const s = activeConversation.value;
    if (!s) return;
    const title = s.title || "Chat";
    const exported = new Date().toISOString();
    const parts: string[] = [];
    parts.push(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
  h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
  .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
  .msg { margin: 1.5rem 0; padding: 1rem; border-radius: 8px; }
  .msg--user { background: #f3f4f6; }
  .msg--ai { background: #eff6ff; border-left: 3px solid #3b82f6; }
  .msg__role { font-weight: 600; font-size: 0.8rem; text-transform: uppercase; color: #6b7280; margin-bottom: 0.5rem; }
  .msg__time { font-weight: 400; color: #9ca3af; }
  .msg__content { white-space: pre-wrap; }
  .msg__content img { max-width: 100%; }
  details { margin-top: 0.75rem; }
  summary { cursor: pointer; color: #3b82f6; font-size: 0.875rem; }
  pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8125rem; }
  code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.875em; }
  @media (prefers-color-scheme: dark) {
    body { background: #111827; color: #f9fafb; }
    .msg--user { background: #1f2937; }
    .msg--ai { background: #1e3a5f; border-left-color: #60a5fa; }
    .meta, .msg__role { color: #9ca3af; }
    h1 { border-bottom-color: #374151; }
  }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p class="meta">Exported: ${exported}</p>`);

    if (s.pageContent) {
      parts.push(`<h2>Context</h2>`);
      parts.push(`<pre>${escapeHtml(s.pageContent)}</pre>`);
    }

    parts.push(`<h2>Conversation</h2>`);
    for (const m of s.messages ?? []) {
      const role = m.type === "user" ? "User" : m.type === "followup" ? "Follow-up (queued)" : "AI";
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";
      parts.push(`<div class="msg msg--${m.type === "user" || m.type === "followup" ? "user" : "ai"}">`);
      parts.push(`<div class="msg__role">${role} <span class="msg__time">${time}</span></div>`);
      parts.push(`<div class="msg__content">${escapeHtml(m.message || "(empty)")}</div>`);
      if (m.toolCalls?.length) {
        for (const tc of m.toolCalls) {
          parts.push(`<details>`);
          parts.push(`<summary>Tool: <code>${escapeHtml(tc.name)}</code></summary>`);
          if (tc.content) {
            parts.push(`<pre>${escapeHtml(tc.content)}</pre>`);
          }
          parts.push(`</details>`);
        }
      }
      parts.push(`</div>`);
    }

    parts.push(`</body>\n</html>`);
    const html = parts.join("\n");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(s.title || "chat").replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    // State
    conversations,
    conversationsLoaded,
    loading,
    error,
    batchMode,
    selectedKeys,
    // CRUD
    loadConversations,
    selectConversation,
    createConversation,
    renameConversation,
    updateSessionMeta,
    deleteConversation,
    toggleFavorite,
    sortConversations,
    // Batch ops
    toggleBatchMode,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete,
    clearAllConversations,
    // Export
    exportConversation,
    exportConversationHtml,
    escapeHtml
  };
}