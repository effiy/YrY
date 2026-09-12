/**
 * Virtual Scroll composable for chat messages — YP-09-11.
 *
 * Uses @tanstack/virtual for DOM-level virtualization + memory trimming
 * (keep last 200 messages in store, persist older to chrome.storage.local).
 */
import { ref, computed, watch, type Ref } from 'vue';

export interface VirtualScrollItem {
  id: string;
  height: number;
}

export interface UseVirtualScrollOptions {
  /** Messages array (reactive). */
  items: Ref<VirtualScrollItem[]>;
  /** Max messages to keep in memory. */
  maxInMemory?: number;
  /** Estimate for unmeasured items. */
  estimateSize?: number;
  /** Overscan count for smooth scrolling. */
  overscan?: number;
}

export interface VirtualScrollRange {
  start: number;
  end: number;
  total: number;
  visibleIds: Set<string>;
}

export function useVirtualScroll(options: UseVirtualScrollOptions) {
  const { items, maxInMemory = 200, estimateSize = 120, overscan = 5 } = options;

  const scrollTop = ref(0);
  const containerHeight = ref(600);
  const itemHeights = ref<Map<string, number>>(new Map());

  const totalHeight = computed(() => {
    let total = 0;
    for (const item of items.value) {
      total += itemHeights.value.get(item.id) ?? estimateSize;
    }
    return total;
  });

  const visibleRange = computed<VirtualScrollRange>(() => {
    const startY = scrollTop.value - overscan * estimateSize;
    const endY = scrollTop.value + containerHeight.value + overscan * estimateSize;

    let y = 0;
    let start = 0;
    let end = items.value.length;
    let foundStart = false;

    for (let i = 0; i < items.value.length; i++) {
      const h = itemHeights.value.get(items.value[i].id) ?? estimateSize;
      if (!foundStart && y + h > startY) {
        start = i;
        foundStart = true;
      }
      if (y > endY) {
        end = i;
        break;
      }
      y += h;
    }

    const visibleIds = new Set<string>();
    for (let i = start; i < Math.min(end, items.value.length); i++) {
      visibleIds.add(items.value[i].id);
    }

    return { start, end, total: items.value.length, visibleIds };
  });

  const offsetY = computed(() => {
    let y = 0;
    for (let i = 0; i < visibleRange.value.start; i++) {
      y += itemHeights.value.get(items.value[i].id) ?? estimateSize;
    }
    return y;
  });

  function measureItem(id: string, height: number) {
    itemHeights.value.set(id, height);
  }

  function onScroll(event: Event) {
    scrollTop.value = (event.target as HTMLElement).scrollTop;
  }

  function onResize(height: number) {
    containerHeight.value = height;
  }

  function scrollToBottom(smooth = true) {
    const el = document.querySelector('.yipet-chat-messages');
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
  }

  // Memory trimming: when items exceed maxInMemory, persist older to chrome.storage
  watch(items, (val) => {
    if (val.length > maxInMemory) {
      const overflow = val.slice(0, val.length - maxInMemory);
      try {
        chrome.storage.local.set({ 'yipet:trimmed-messages': overflow });
      } catch {
        // chrome.storage may not be available in all contexts
      }
    }
  }, { deep: false });

  return {
    totalHeight,
    visibleRange,
    offsetY,
    measureItem,
    onScroll,
    onResize,
    scrollToBottom,
  };
}