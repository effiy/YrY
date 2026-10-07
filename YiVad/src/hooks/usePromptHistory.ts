import { useStorage } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";

// Shared prompt history — singleton via module-level useStorage.
// All callers share one reactive source of truth, automatically persisted.
const PROMPT_HISTORY_LS_KEY = "yivad.aichat.promptHistory";
const PROMPT_HISTORY_MAX = 100;

const promptHistory: RemovableRef<string[]> = useStorage(PROMPT_HISTORY_LS_KEY, [] as string[]);

export function pushPromptHistory(s: string): void {
  const trimmed = s.trim();
  if (!trimmed) return;
  if (promptHistory.value[promptHistory.value.length - 1] === trimmed) return;
  promptHistory.value = [...promptHistory.value, trimmed].slice(-PROMPT_HISTORY_MAX);
}

export function removePromptHistoryAt(idx: number): void {
  if (idx < 0 || idx >= promptHistory.value.length) return;
  const next = [...promptHistory.value];
  next.splice(idx, 1);
  promptHistory.value = next;
}

export function clearPromptHistory(): void {
  promptHistory.value = [];
}

export function usePromptHistory(): { promptHistory: RemovableRef<string[]> } {
  return { promptHistory };
}