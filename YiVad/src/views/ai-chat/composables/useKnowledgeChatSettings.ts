/**
 * useKnowledgeChatSettings — Model selection, RAG/web search toggles
 * with localStorage persistence for KnowledgeChatPanel.
 */
import { ref, computed, watch, type Ref } from "vue";

export interface SettingsDeps {
  filePath: Ref<string>;
}

export function useKnowledgeChatSettings(deps: SettingsDeps) {
  const { filePath } = deps;

  const STORAGE_SETTINGS_PREFIX = "kchat:cfg:";
  const STORAGE_MODEL_PREFIX = "kchat:model:";
  const DEFAULT_MODEL = "qwen3.5:4b";

  const ragEnabled = ref(false);
  const webSearchEnabled = ref(false);
  const ragAvailable = ref(true);
  const selectedModel = ref(DEFAULT_MODEL);

  const modelKey = computed(() => `${STORAGE_MODEL_PREFIX}${filePath.value}`);
  const settingsKey = computed(() => `${STORAGE_SETTINGS_PREFIX}${filePath.value}`);

  function loadModel() {
    try { const raw = localStorage.getItem(modelKey.value); if (raw) selectedModel.value = raw; } catch { /* ignore */ }
  }
  function saveModel() {
    try { localStorage.setItem(modelKey.value, selectedModel.value); } catch { /* ignore */ }
  }

  interface PanelSettings { ragEnabled: boolean; webSearchEnabled: boolean; }
  function loadSettings() {
    try {
      const raw = localStorage.getItem(settingsKey.value);
      if (raw) { const s: PanelSettings = JSON.parse(raw); ragEnabled.value = s.ragEnabled ?? false; webSearchEnabled.value = s.webSearchEnabled ?? false; }
    } catch { /* ignore */ }
  }
  function saveSettings() {
    try { localStorage.setItem(settingsKey.value, JSON.stringify({ ragEnabled: ragEnabled.value, webSearchEnabled: webSearchEnabled.value })); } catch { /* ignore */ }
  }

  watch(selectedModel, () => saveModel());
  watch([ragEnabled, webSearchEnabled], () => saveSettings());

  return {
    ragEnabled, webSearchEnabled, ragAvailable, selectedModel, DEFAULT_MODEL,
    modelKey, settingsKey, loadModel, saveModel, loadSettings, saveSettings
  };
}