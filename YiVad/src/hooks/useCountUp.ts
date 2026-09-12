import { ref, watch } from "vue";

/** Animated count-up for stat displays. Mirrors knowledgeBase's live deltas. */
export function useCountUp(source: () => number, duration = 600) {
  const display = ref(0);
  let raf = 0;
  watch(source, to => {
    cancelAnimationFrame(raf);
    const from = display.value;
    const start = performance.now();
    const delta = to - from;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      display.value = Math.round(from + delta * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else display.value = to;
    };
    raf = requestAnimationFrame(step);
  }, { immediate: true });
  return display;
}