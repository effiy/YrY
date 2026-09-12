/**
 * useSparkLegendToggle — shared collapse-state for sparkline legends.
 *
 * Pin sparkline (ChatToolbar) and session sparkline (SessionStatusBar) each
 * had their own ref + localStorage dance. This composable collapses both
 * into one factory: caller passes a storage key, gets back `{ collapsed, toggle }`.
 *
 * Pattern adapted from Pi's per-card legend collapse — single source of
 * truth per legend, persisted across sessions.
 */
import { ref } from "vue";

export interface SparkLegendToggle {
  collapsed: ReturnType<typeof ref<boolean>>;
  toggle: () => void;
}

export function useSparkLegendToggle(storageKey: string): SparkLegendToggle {
  const collapsed = ref<boolean>(load(storageKey));
  function load(key: string): boolean {
    try { return localStorage.getItem(key) === "1"; } catch { return false; }
  }
  function persist(): void {
    try { localStorage.setItem(storageKey, collapsed.value ? "1" : "0"); } catch { /* noop */ }
  }
  function toggle(): void {
    collapsed.value = !collapsed.value;
    persist();
  }
  return { collapsed, toggle };
}
