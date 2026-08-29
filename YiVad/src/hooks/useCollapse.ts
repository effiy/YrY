/**
 * YiVad — Collapse state composable.
 * Extracted from AiChatBox.vue: localStorage-persisted collapsed state.
 */
import { ref } from 'vue';

export function useCollapse(storageKey?: string) {
  const collapsed = ref(false);

  function load() {
    if (!storageKey) return;
    try {
      collapsed.value = localStorage.getItem(storageKey) === '1';
    } catch { /* ignore */ }
  }

  function save() {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, collapsed.value ? '1' : '0');
    } catch { /* ignore */ }
  }

  function toggle() {
    collapsed.value = !collapsed.value;
    save();
  }

  load();

  return { collapsed, toggle };
}