import { useTransition } from "@vueuse/core";
import { computed, type Ref } from "vue";

/** Animated count-up for stat displays — backed by @vueuse/core useTransition. */
export function useCountUp(source: () => number, duration = 600): Ref<number> {
  const target = computed(source);
  const trans = useTransition(target, { duration });
  return computed(() => Math.round(trans.value));
}