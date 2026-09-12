import { ref, type Ref } from "vue";

// Shared prompt history (Pi-inspired: shell-style ArrowUp/ArrowDown recall
// + a Skills-popover sub-panel that lists recent prompts for copy/re-invoke).
// Singleton via module-level state — ChatInput (push + recall) and ChatToolbar
// (view + clear) share one source of truth.

const PROMPT_HISTORY_LS_KEY = "yivad.aichat.promptHistory";
const PROMPT_HISTORY_MAX = 100;

function load(): string[] {
  try {
    const raw = localStorage.getItem(PROMPT_HISTORY_LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(x => typeof x === "string").slice(-PROMPT_HISTORY_MAX) : [];
  } catch {
    return [];
  }
}

const promptHistory: Ref<string[]> = ref(load());

function persist(): void {
  try {
    localStorage.setItem(PROMPT_HISTORY_LS_KEY, JSON.stringify(promptHistory.value));
  } catch {
    /* ignore */
  }
}

export function pushPromptHistory(s: string): void {
  const trimmed = s.trim();
  if (!trimmed) return;
  // Deduplicate consecutive duplicates (shell behavior).
  if (promptHistory.value[promptHistory.value.length - 1] === trimmed) return;
  promptHistory.value = [...promptHistory.value, trimmed].slice(-PROMPT_HISTORY_MAX);
  persist();
}

export function removePromptHistoryAt(idx: number): void {
  if (idx < 0 || idx >= promptHistory.value.length) return;
  const next = [...promptHistory.value];
  next.splice(idx, 1);
  promptHistory.value = next;
  persist();
}

export function clearPromptHistory(): void {
  promptHistory.value = [];
  persist();
}

export function usePromptHistory(): { promptHistory: Ref<string[]> } {
  return { promptHistory };
}
