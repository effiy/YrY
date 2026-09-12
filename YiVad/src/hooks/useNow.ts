import { ref, onMounted, onUnmounted, type Ref } from "vue";

/**
 * Reactive `Date.now()` that ticks every `intervalMs`.
 * Use as a single source of truth for all relative-time displays
 * so "just now" → "1m ago" transitions happen automatically.
 */
export function useNow(intervalMs = 30_000): Ref<number> {
  const now = ref(Date.now());
  let timer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now();
    }, intervalMs);
  });

  onUnmounted(() => {
    if (timer !== null) clearInterval(timer);
  });

  return now;
}