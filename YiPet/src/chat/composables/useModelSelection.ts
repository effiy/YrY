import { ref, watch } from 'vue';
import { DEFAULT_MODEL } from '../constants';

const MODELS_CACHE_KEY = 'yipet.availableModels';
const MODELS_CACHE_TTL = 2 * 60 * 1000;
const SELECTED_KEY = 'yipet.selectedModel';
const FETCH_TIMEOUT_MS = 8_000;

function loadStr(key: string, fallback: string): string {
  try {
    const v = localStorage.getItem(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStr(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch { /* ignore */ }
}

let _chat: { listModels: () => Promise<string[]> } | null = null;

export function injectChatService(chat: { listModels: () => Promise<string[]> }) {
  _chat = chat;
}

export function useModelSelection() {
  const selectedModel = ref<string>(loadStr(SELECTED_KEY, DEFAULT_MODEL));
  const availableModels = ref<string[]>([]);
  const modelsLoading = ref(false);

  watch(selectedModel, v => saveStr(SELECTED_KEY, v));

  async function fetchModels() {
    if (modelsLoading.value) return;

    try {
      const raw = localStorage.getItem(MODELS_CACHE_KEY);
      if (raw) {
        const { ts, models } = JSON.parse(raw);
        if (Date.now() - ts < MODELS_CACHE_TTL && Array.isArray(models) && models.length) {
          availableModels.value = models;
          if (!selectedModel.value || !models.includes(selectedModel.value)) {
            selectedModel.value = models[0];
          }
        }
      }
    } catch { /* ignore */ }

    if (!_chat) return;

    modelsLoading.value = true;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const models = await Promise.race([
          _chat.listModels(),
          new Promise<string[]>((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('Aborted')));
          }),
        ]);
        clearTimeout(timer);
        if (Array.isArray(models) && models.length) {
          availableModels.value = models;
          if (!selectedModel.value || !models.includes(selectedModel.value)) {
            selectedModel.value = models.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : models[0];
          }
          try {
            localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify({ ts: Date.now(), models }));
          } catch { /* ignore */ }
        }
      } catch {
        clearTimeout(timer);
      }
    } finally {
      modelsLoading.value = false;
    }
  }

  return { selectedModel, availableModels, modelsLoading, fetchModels };
}
