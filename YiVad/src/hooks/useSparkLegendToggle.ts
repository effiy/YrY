import { useStorage } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";

export interface SparkLegendToggle {
  collapsed: RemovableRef<boolean>;
  toggle: () => void;
}

/** Shared collapse-state for sparkline legends — backed by @vueuse/core useStorage. */
export function useSparkLegendToggle(storageKey: string): SparkLegendToggle {
  const collapsed = useStorage(storageKey, false);
  return { collapsed, toggle: () => (collapsed.value = !collapsed.value) };
}