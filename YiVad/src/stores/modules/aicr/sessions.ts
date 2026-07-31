/**
 * AICR Sessions store — session list, creation, and management.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { getSessions, getSession, createSession as apiCreateSession, updateSession as apiUpdateSession, upsertSession, deleteSession } from "@/api/modules/sessions";
import { chat } from "@/api/modules/chatService";
import type { SessionDocument } from "@/api/interface/yiweb";

export const useAicrSessionStore = defineStore("yivad-aicr-sessions", () => {
  const list = ref<SessionDocument[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const batchMode = ref(false);
  const selectedKeys = ref<Set<string>>(new Set());

  async function loadSessions() {
    loading.value = true;
    error.value = null;
    try {
      const items = await getSessions();
      // Favorites first, then by updatedAt desc — mirrors YiWeb aicr loadSessions.
      list.value = items.sort((a, b) => {
        if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
        return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
      });
    } catch (e: any) {
      error.value = e?.message || "Failed to load sessions";
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create or update a session. If a session with this key already exists, only
   * the fields in `data` are patched — `messages`/`tags`/`createdAt` defaults
   * are NOT applied on update, since that would wipe the existing session's
   * messages and history. Defaults are only applied when creating a new session.
   */
  async function createSession(data: Partial<SessionDocument> & { key: string }) {
    const existing = await getSession(data.key);
    if (existing) {
      // Patch-only via the API updateSession — avoids the local updateSession's
      // upsert+load cycle, since the loadSessions at the end of this function
      // will refresh the list once.
      await apiUpdateSession(data.key, { ...data, updatedAt: Date.now() });
    } else {
      const now = Date.now();
      await apiCreateSession({
        ...data,
        messages: data.messages ?? [],
        tags: data.tags ?? [],
        createdAt: data.createdAt ?? now,
        updatedAt: now
      });
    }
    await loadSessions();
  }

  async function updateSession(key: string, data: Partial<SessionDocument>) {
    await upsertSession({ key, ...data, updatedAt: Date.now() });
    await loadSessions();
  }

  async function toggleFavorite(key: string) {
    const s = list.value.find(x => x.key === key);
    if (!s) return;
    await updateSession(key, { isFavorite: !s.isFavorite });
    // fileTreeStore.flatFiles caches the session doc (including isFavorite) at
    // loadFileTree time — a favorite toggle via the star icon on any view
    // (tree/card) would otherwise stay stale until the tree is reloaded.
    // Lazy-import to avoid a circular dependency at module init time.
    try {
      const { useAicrFileTreeStore } = await import("@/stores/modules/aicr/fileTree");
      const fileTreeStore = useAicrFileTreeStore();
      await fileTreeStore.loadFileTree();
    } catch {
      /* non-critical — tree stays stale for isFavorite but no user-facing break */
    }
  }

  async function removeSession(key: string) {
    await deleteSession(key);
    list.value = list.value.filter(s => s.key !== key);
  }

  async function batchDelete() {
    const keys = [...selectedKeys.value];
    await Promise.all(keys.map(k => deleteSession(k)));
    selectedKeys.value = new Set();
    batchMode.value = false;
    await loadSessions();
  }

  /** Ask the AI to draft a one-line description for a session, given title + url. */
  async function generateDescription(key: string, title: string, url: string): Promise<string> {
    const user = `Generate a concise English description (under 30 words) for the page below:\nTitle: ${title}\nURL: ${url}`;
    const reply = await chat({
      model: "qwen3.5",
      messages: [{ type: "user", message: user, timestamp: Date.now() }],
      stream: false,
      system: "You are a concise, reliable description generator. Output only the description, with no extra explanation."
    });
    return reply.trim();
  }

  return {
    list,
    loading,
    error,
    batchMode,
    selectedKeys,
    loadSessions,
    createSession,
    updateSession,
    toggleFavorite,
    removeSession,
    batchDelete,
    generateDescription
  };
});
