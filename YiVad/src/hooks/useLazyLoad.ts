import { ref } from "vue";

export function useLazyLoad() {
  const visible = ref(false);
  let observer: IntersectionObserver | null = null;

  const observe = (el: HTMLElement | null) => {
    observer?.disconnect();
    if (!el) return;
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible.value = true;
          observer?.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
  };

  return { visible, observe };
}