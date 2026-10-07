import { useTransition } from "@vueuse/core";
import { computed, type Ref } from "vue";

/**
 * Smoothly interpolates a displayed number toward `target` over `durationMs`.
 * Backed by @vueuse/core useTransition.
 */
export function useAnimatedNumber(target: Ref<number>, durationMs = 400): Ref<number> {
  const trans = useTransition(target, { duration: durationMs });
  return computed(() => Math.round(trans.value));
}