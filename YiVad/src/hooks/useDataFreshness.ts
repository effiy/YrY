/**
 * Data freshness tracker — lightweight composable for any list/detail page.
 *
 * Tracks seconds since last data fetch and provides a human-readable age string.
 * Pages use this to show users how current their data is.
 *
 * Usage:
 *   const { dataAge, lastRefreshed, markFresh, ageLabel } = useDataFreshness();
 *   // After fetching data:
 *   markFresh();
 *   // In template:
 *   <span :class="{ stale: dataAge > 120 }">{{ ageLabel }}</span>
 */
import { ref, computed, onUnmounted, type Ref, type ComputedRef } from "vue";

export interface DataFreshness {
  dataAge: Ref<number>;
  lastRefreshed: Ref<Date | null>;
  markFresh: () => void;
  ageLabel: ComputedRef<string>;
}

export function useDataFreshness(): DataFreshness {
  const dataAge = ref(0);
  const lastRefreshed = ref<Date | null>(null);

  const timer = setInterval(() => {
    if (lastRefreshed.value) {
      dataAge.value = Math.floor(
        (Date.now() - lastRefreshed.value.getTime()) / 1000
      );
    }
  }, 1000);

  onUnmounted(() => clearInterval(timer));

  function markFresh() {
    lastRefreshed.value = new Date();
    dataAge.value = 0;
  }

  const ageLabel = computed(() => {
    if (dataAge.value < 5) return "just now";
    if (dataAge.value < 60) return `0:${String(dataAge.value).padStart(2, "0")}`;
    const m = Math.floor(dataAge.value / 60);
    if (dataAge.value < 300) return `${m}:${String(dataAge.value % 60).padStart(2, "0")}`;
    return `${m}m ago`;
  });

  return { dataAge, lastRefreshed, markFresh, ageLabel };
}