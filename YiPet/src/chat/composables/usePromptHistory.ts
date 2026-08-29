/**
 * YiPet Chat — Prompt history composable.
 * Extracted from ChatToolbar.vue: search, fuzzy matching, and CRUD actions
 * on the prompt history list.
 */
import { computed, ref } from 'vue';
import { useChatStore } from '../stores/chat';
import { truncatePrompt, highlightSegments, fuzzySearch } from './useTextSearch';

export function usePromptHistory() {
  const store = useChatStore();
  const s = store.state;

  const showPopover = ref(false);
  const query = ref('');

  /** Recent 3 prompts shown as chips when no search query is active. */
  const recentChips = computed(() => {
    if (query.value.trim()) return [];
    return s.promptHistory.slice(-3).reverse();
  });

  /** Filtered + reversed history list. */
  const historyList = computed(() => {
    const q = query.value.trim().toLowerCase();
    const indexed = s.promptHistory.map((text, i) => ({ text, realIdx: i }));
    const filtered = q ? indexed.filter((x) => x.text.toLowerCase().includes(q)) : indexed;
    return filtered.reverse();
  });

  /** Fuzzy matches when exact search returns nothing. */
  const similarPrompts = computed<{ text: string; score: number }[]>(() => {
    const q = query.value.trim();
    if (!q || historyList.value.length > 0) return [];
    return fuzzySearch(q, s.promptHistory, (t) => t).map((r) => ({ text: r.item, score: r.score }));
  });

  function usePrompt(text: string) {
    store.invokePromptHistory?.(s.promptHistory.indexOf(text));
    showPopover.value = false;
  }

  function copyPrompt(text: string) {
    navigator.clipboard?.writeText(text);
  }

  function removePrompt(idx: number) {
    store.removePromptHistoryAt?.(idx);
  }

  return {
    showPopover,
    query,
    recentChips,
    historyList,
    similarPrompts,
    usePrompt,
    copyPrompt,
    removePrompt,
    truncatePrompt,
    highlightSegments,
  };
}