/**
 * State module — centralized app state and localStorage persistence.
 * Extracted from home/index.js per refactor-home-controller Story 1.
 */

// ---- storage keys ----

export const STORAGE_KEYS = Object.freeze({
  API_TOKEN: "YiH5.apiToken.v1",
  APP_VERSION: "YiH5.appVersion.v1",
  BOTTOM_TAB: "YiH5.bottomTab.v1",
  CHAT_FOLD: "YiH5.chatFoldExpanded.v1",
  NEWS_READ: "YiH5.newsRead.v1",
  NEWS_FAVORITE: "YiH5.newsFavorite.v1",
  TAG_ORDER: "YiH5.tagOrder.v1",
  DELETE_SUCCESS: "YiH5.deleteSuccess.v1",
});

const CHAT_FOLD_MAX = 300;
export const DEFAULT_PINNED_TAGS = ["日记", "家庭", "工作", "工具"];

// ---- state ----

export const state = {
  tab: "all",
  q: "",
  selectedDate: "",
  lastError: "",
  view: "list", // list | chat | newsChat
  activeSessionKey: "",
  activeNewsKey: "",
  sessions: [],
  sessionsLoading: false,
  sessionsLoadedAt: 0,
  faq: {
    items: [],
    loading: false,
    error: "",
    loadedAt: 0,
  },
  changelog: {
    manifest: null,
    loading: false,
    error: "",
    loadedAt: 0,
  },
  filter: {
    selectedTags: [],
    sortBy: 'time',
  },
  bottomTab: "sessions",
  chatSourceTab: null,
  scrollToSessionKey: null,
  scrollToNewsKey: null,
  news: {
    items: [],
    loading: false,
    error: "",
    isoDate: "",
    loadedAt: 0,
    requestId: 0,
    abortController: null,
    q: "",
    filter: {
      selectedTags: [],
      sortBy: 'time',
    },
    chatMessages: {},
  },
  auth: {
    token: "",
  },
  chatUi: {
    foldExpanded: {},
    sending: false,
    abortController: null,
    streamingTarget: null,
  },
};

/** Deep-read a dotted-path from state. */
export function getState(path) {
  if (!path) return state;
  const keys = String(path).split('.');
  let cur = state;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[k];
  }
  return cur;
}

/** Shallow-merge partial into state (mutates in place). */
export function setState(partial) {
  Object.assign(state, partial);
}

// ---- localStorage helpers ----

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch { /* ignore */ }
}

function safeParse(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ---- auth ----

export function getAuthHeaders() {
  const token = String(state.auth.token || "").trim();
  if (!token) return {};
  return { "X-Token": token };
}

export function loadAuthFromStorage() {
  const raw = safeGet(STORAGE_KEYS.API_TOKEN);
  state.auth.token = String(raw || "").trim();
}

export function saveAuthToken(token) {
  state.auth.token = String(token || "").trim();
  safeSet(STORAGE_KEYS.API_TOKEN, state.auth.token);
}

// ---- chat fold state ----

export function loadChatFoldState() {
  const raw = safeGet(STORAGE_KEYS.CHAT_FOLD);
  const obj = safeParse(raw);
  const map = obj && typeof obj === "object" ? obj.foldExpanded : null;
  if (!map || typeof map !== "object") return {};
  const next = {};
  for (const [k, v] of Object.entries(map)) {
    if (!k) continue;
    if (v) next[k] = v;
  }
  return next;
}

export function saveChatFoldState(foldExpanded) {
  const map = foldExpanded && typeof foldExpanded === "object" ? foldExpanded : {};
  const entries = Object.entries(map)
    .filter(([k, v]) => k && v)
    .map(([k, v]) => [k, Number.isFinite(Number(v)) ? Number(v) : 1]);
  entries.sort((a, b) => (Number(b[1]) || 1) - (Number(a[1]) || 1));
  const pruned = entries.slice(0, CHAT_FOLD_MAX);
  const next = Object.fromEntries(pruned);
  safeSet(STORAGE_KEYS.CHAT_FOLD, JSON.stringify({ v: 1, savedAt: Date.now(), foldExpanded: next }));
}

// ---- news read state ----

export function loadReadNews() {
  const raw = safeGet(STORAGE_KEYS.NEWS_READ);
  const obj = safeParse(raw);
  const keys = obj && typeof obj === "object" && Array.isArray(obj.keys) ? obj.keys : [];
  return new Set(keys.filter(k => k && String(k).trim()));
}

export function saveReadNews(readNewsSet) {
  const keys = Array.from(readNewsSet).filter(k => k && String(k).trim());
  safeSet(STORAGE_KEYS.NEWS_READ, JSON.stringify({ v: 1, savedAt: Date.now(), keys }));
}

export function markNewsAsRead(newsKey) {
  if (!newsKey) return;
  const readNews = loadReadNews();
  readNews.add(String(newsKey));
  saveReadNews(readNews);
}

// ---- news favorites ----

export function loadFavoriteNews() {
  const raw = safeGet(STORAGE_KEYS.NEWS_FAVORITE);
  const obj = safeParse(raw);
  const keys = obj && typeof obj === "object" && Array.isArray(obj.keys) ? obj.keys : [];
  return new Set(keys.filter(k => k && String(k).trim()));
}

export function saveFavoriteNews(favoriteNewsSet) {
  const keys = Array.from(favoriteNewsSet).filter(k => k && String(k).trim());
  safeSet(STORAGE_KEYS.NEWS_FAVORITE, JSON.stringify({ v: 1, savedAt: Date.now(), keys }));
}

// ---- tag order ----

export function loadTagOrder() {
  const raw = safeGet(STORAGE_KEYS.TAG_ORDER);
  const arr = safeParse(raw);
  if (!Array.isArray(arr)) return [];
  return arr.map(x => String(x || "").trim()).filter(Boolean);
}

export function saveTagOrder(order) {
  safeSet(STORAGE_KEYS.TAG_ORDER, JSON.stringify(order));
}

// ---- app version ----

export function getStoredAppVersion() {
  return String(safeGet(STORAGE_KEYS.APP_VERSION) || "").trim();
}

export function setStoredAppVersion(v) {
  safeSet(STORAGE_KEYS.APP_VERSION, String(v || "").trim());
}

// Re-export from utils for backward compatibility
export { cssEscape, fmt } from "../../../YiPet/cdn/utils/h5/index.js";
