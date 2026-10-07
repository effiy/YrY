import { useTimestamp } from "@vueuse/core";
import type { Ref } from "vue";

/**
 * Reactive `Date.now()` that ticks every `intervalMs`.
 * Backed by @vueuse/core's useTimestamp.

 * @deprecated Prefer `useTimestamp({ interval })` from @vueuse/core directly.
 */
export function useNow(intervalMs = 30_000): Ref<number> {
  return useTimestamp({ interval: intervalMs });
}