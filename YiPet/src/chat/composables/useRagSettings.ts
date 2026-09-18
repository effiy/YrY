import { ref, computed, watch } from 'vue';

const PREFIX = 'yipet.rag.';
const KEYS = [
  'knowledgeGrounded', 'ragHybrid', 'ragRerank', 'ragCitations',
  'ragHyde', 'ragScope', 'ragNumQueries', 'ragChatMode',
] as const;
type SettingKey = typeof KEYS[number];

const DEFAULTS: Record<SettingKey, unknown> = {
  knowledgeGrounded: false,
  ragHybrid: true,
  ragRerank: false,
  ragCitations: true,
  ragHyde: false,
  ragScope: '',
  ragNumQueries: 1,
  ragChatMode: 'condense_plus_context',
};

function readLs<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeLs(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
  }
}

function persistChrome(key: string, value: unknown) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [PREFIX + key]: value }).catch(() => {});
    }
  } catch {
  }
}

async function loadChrome(): Promise<Partial<Record<SettingKey, unknown>>> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const fullKeys = KEYS.map(k => PREFIX + k);
      const result = await chrome.storage.local.get(fullKeys);
      const out: Partial<Record<SettingKey, unknown>> = {};
      for (const k of KEYS) {
        if ((PREFIX + k) in result) out[k] = result[PREFIX + k];
      }
      return out;
    }
  } catch {
  }
  return {};
}

function persistAll(key: SettingKey, value: unknown) {
  writeLs(key, value);
  persistChrome(key, value);
}

export function useRagSettings() {
  const knowledgeGrounded = ref<boolean>(readLs('knowledgeGrounded', DEFAULTS.knowledgeGrounded as boolean));
  const ragHybrid = ref<boolean>(readLs('ragHybrid', DEFAULTS.ragHybrid as boolean));
  const ragRerank = ref<boolean>(readLs('ragRerank', DEFAULTS.ragRerank as boolean));
  const ragCitations = ref<boolean>(readLs('ragCitations', DEFAULTS.ragCitations as boolean));
  const ragHyde = ref<boolean>(readLs('ragHyde', DEFAULTS.ragHyde as boolean));
  const ragScope = ref<string>(readLs('ragScope', DEFAULTS.ragScope as string));
  const ragNumQueries = ref<number>(readLs('ragNumQueries', DEFAULTS.ragNumQueries as number));
  const ragChatMode = ref<string>(readLs('ragChatMode', DEFAULTS.ragChatMode as string));

  const ragEnabled = computed<boolean>(() => knowledgeGrounded.value);

  watch(knowledgeGrounded, v => persistAll('knowledgeGrounded', v));
  watch(ragHybrid, v => persistAll('ragHybrid', v));
  watch(ragRerank, v => persistAll('ragRerank', v));
  watch(ragCitations, v => persistAll('ragCitations', v));
  watch(ragHyde, v => persistAll('ragHyde', v));
  watch(ragScope, v => persistAll('ragScope', v));
  watch(ragNumQueries, v => persistAll('ragNumQueries', v));
  watch(ragChatMode, v => persistAll('ragChatMode', v));

  async function load() {
    const chromeVals = await loadChrome();
    if (typeof chromeVals.knowledgeGrounded === 'boolean') knowledgeGrounded.value = chromeVals.knowledgeGrounded;
    if (typeof chromeVals.ragHybrid === 'boolean') ragHybrid.value = chromeVals.ragHybrid;
    if (typeof chromeVals.ragRerank === 'boolean') ragRerank.value = chromeVals.ragRerank;
    if (typeof chromeVals.ragCitations === 'boolean') ragCitations.value = chromeVals.ragCitations;
    if (typeof chromeVals.ragHyde === 'boolean') ragHyde.value = chromeVals.ragHyde;
    if (typeof chromeVals.ragScope === 'string') ragScope.value = chromeVals.ragScope;
    if (typeof chromeVals.ragNumQueries === 'number') ragNumQueries.value = chromeVals.ragNumQueries;
    if (typeof chromeVals.ragChatMode === 'string') ragChatMode.value = chromeVals.ragChatMode;
  }

  return {
    ragEnabled,
    knowledgeGrounded,
    ragHybrid,
    ragRerank,
    ragCitations,
    ragHyde,
    ragScope,
    ragNumQueries,
    ragChatMode,
    load,
  };
}
