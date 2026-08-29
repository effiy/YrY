import { ref, watch } from "vue";
import type { RssItemDocument } from "@/api/modules/rssService";

const READ_KEYS_STORAGE = "yivad:rss:readKeys";
const STARRED_KEYS_STORAGE = "yivad:rss:starredKeys";

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      return new Set(Array.isArray(arr) ? arr : []);
    }
  } catch { /* ignore */ }
  return new Set();
}

function persistSet(key: string, s: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...s]));
  } catch { /* ignore */ }
}

export function useRssReadStar() {
  const readKeys = ref<Set<string>>(loadSet(READ_KEYS_STORAGE));
  const starredKeys = ref<Set<string>>(loadSet(STARRED_KEYS_STORAGE));

  watch(readKeys, s => persistSet(READ_KEYS_STORAGE, s), { deep: true });
  watch(starredKeys, s => persistSet(STARRED_KEYS_STORAGE, s), { deep: true });

  function isRead(row: RssItemDocument) {
    return !!(row.key && readKeys.value.has(row.key));
  }
  function markRead(row: RssItemDocument) {
    if (!row.key || readKeys.value.has(row.key)) return;
    readKeys.value = new Set(readKeys.value).add(row.key);
  }
  function toggleRead(row: RssItemDocument) {
    if (!row.key) return;
    const next = new Set(readKeys.value);
    if (next.has(row.key)) next.delete(row.key);
    else next.add(row.key);
    readKeys.value = next;
  }
  function isStarred(row: RssItemDocument) {
    return !!(row.key && starredKeys.value.has(row.key));
  }
  function toggleStar(row: RssItemDocument) {
    if (!row.key) return;
    const next = new Set(starredKeys.value);
    if (next.has(row.key)) next.delete(row.key);
    else next.add(row.key);
    starredKeys.value = next;
  }
  function markAllRead(rows: RssItemDocument[]) {
    const next = new Set(readKeys.value);
    for (const r of rows) if (r.key) next.add(r.key);
    readKeys.value = next;
  }
  function isReadKey(k: string) {
    return readKeys.value.has(k);
  }
  function isStarredKey(k: string) {
    return starredKeys.value.has(k);
  }

  return {
    readKeys,
    starredKeys,
    isRead,
    markRead,
    toggleRead,
    isStarred,
    toggleStar,
    markAllRead,
    isReadKey,
    isStarredKey
  };
}