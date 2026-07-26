/**
 * AICR Sessions store — session list, creation, and management.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { getSessions, upsertSession, deleteSession } from "@/api/modules/sessions";
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
      list.value = await getSessions();
    } catch (e: any) {
      error.value = e?.message || "Failed to load sessions";
    } finally {
      loading.value = false;
    }
  }

  async function createSession(data: Partial<SessionDocument> & { key: string }) {
    const now = Date.now();
    await upsertSession({
      ...data,
      messages: data.messages ?? [],
      tags: data.tags ?? [],
      createdAt: data.createdAt ?? now,
      updatedAt: now
    });
    await loadSessions();
  }

  async function removeSession(key: string) {
    await deleteSession(key);
    list.value = list.value.filter(s => s.key !== key);
  }

  return {
    list,
    loading,
    error,
    batchMode,
    selectedKeys,
    loadSessions,
    createSession,
    removeSession
  };
});
