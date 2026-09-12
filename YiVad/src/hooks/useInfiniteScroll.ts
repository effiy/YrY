import { ref, onBeforeUnmount } from "vue";

export function useInfiniteScroll(loadMore: () => Promise<void>, options: { threshold?: number } = {}) {
  const target = ref<HTMLElement | null>(null);
  const loading = ref(false);
  const finished = ref(false);
  const error = ref<string | null>(null);

  let observer: IntersectionObserver | null = null;

  const observe = (el: HTMLElement | null) => {
    observer?.disconnect();
    if (!el) return;
    observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !loading.value && !finished.value) {
          loading.value = true;
          error.value = null;
          try {
            await loadMore();
          } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Load failed";
          } finally {
            loading.value = false;
          }
        }
      },
      { threshold: options.threshold ?? 0.1 },
    );
    observer.observe(el);
    target.value = el;
  };

  onBeforeUnmount(() => observer?.disconnect());

  const reset = () => { finished.value = false; error.value = null; };
  const setFinished = () => { finished.value = true; };

  return { target, observe, loading, finished, error, reset, setFinished };
}