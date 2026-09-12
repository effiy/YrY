import { ref, computed, onMounted, onBeforeUnmount, type Ref, type ShallowRef } from "vue";

export interface VirtualScrollOptions {
  containerRef: Ref<HTMLElement | null> | ShallowRef<HTMLElement | null>;
  totalRows: Ref<number> | number;
  rowHeight?: number;
  overscan?: number;
}

export interface VisibleRange {
  start: number;
  end: number;
  offsetTop: number;
}

export function useVirtualScroll(options: VirtualScrollOptions) {
  const { containerRef } = options;
  const rowHeight = options.rowHeight ?? 48;
  const overscan = options.overscan ?? 5;

  const scrollTop = ref(0);
  const viewportHeight = ref(0);

  const totalRows = computed(() =>
    typeof options.totalRows === "number" ? options.totalRows : options.totalRows.value
  );

  const totalHeight = computed(() => totalRows.value * rowHeight);

  const visibleRange = computed<VisibleRange>(() => {
    const start = Math.max(0, Math.floor(scrollTop.value / rowHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight.value / rowHeight);
    const end = Math.min(totalRows.value, start + visibleCount + overscan * 2);
    return { start, end, offsetTop: start * rowHeight };
  });

  let rafId: number | null = null;

  const onScroll = (e: Event) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      scrollTop.value = (e.target as HTMLElement).scrollTop;
      rafId = null;
    });
  };

  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    const el = containerRef.value;
    if (el) {
      viewportHeight.value = el.clientHeight;
      el.addEventListener("scroll", onScroll, { passive: true });
      resizeObserver = new ResizeObserver(([entry]) => {
        if (entry) viewportHeight.value = entry.contentRect.height;
      });
      resizeObserver.observe(el);
    }
  });

  onBeforeUnmount(() => {
    const el = containerRef.value;
    if (el) {
      el.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
    }
    if (rafId) cancelAnimationFrame(rafId);
  });

  const scrollToIndex = (index: number) => {
    containerRef.value?.scrollTo({ top: index * rowHeight, behavior: "smooth" });
  };

  return { visibleRange, totalHeight, scrollTop, scrollToIndex };
}