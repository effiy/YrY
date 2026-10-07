/**
 * useSkillPrefs — localStorage preference management for the Skills/MCP panel.
 * Handles compact mode, skill sort mode, pin sort mode, and pinned tools persistence.
 */
import { ref, watch } from "vue";

const SKILLS_PREF_LS_KEY = "yivad.aichat.skillsPrefs";
const PINNED_LS_KEY = "yivad.aichat.pinnedTools";
const PIN_SORT_MODE_LS_KEY = "yivad.aichat.pinSortMode";

export type SkillSortMode = "registry" | "calls" | "recent";
export type PinSortMode = "default" | "calls" | "recent";

export interface SkillPrefsDeps {
  skillSortMode: { value: SkillSortMode };
  compactMode: { value: boolean };
  pinSortMode: { value: PinSortMode };
  pinnedTools: { value: Set<string> };
}

export function useSkillPrefs(deps?: SkillPrefsDeps) {
  // ── Compact mode ──
  function loadCompactMode(): boolean {
    try {
      const raw = localStorage.getItem(SKILLS_PREF_LS_KEY);
      if (!raw) return false;
      return JSON.parse(raw)?.compact === true;
    } catch { return false; }
  }

  function loadSkillSortMode(): SkillSortMode {
    try {
      const raw = localStorage.getItem(SKILLS_PREF_LS_KEY);
      if (!raw) return "registry";
      const v = JSON.parse(raw);
      return v?.sortMode === "calls" || v?.sortMode === "recent" ? v.sortMode : "registry";
    } catch { return "registry"; }
  }

  function persistSkillPrefs(sortMode: SkillSortMode, compact: boolean): void {
    try {
      localStorage.setItem(SKILLS_PREF_LS_KEY, JSON.stringify({ sortMode, compact }));
    } catch { /* ignore */ }
  }

  // ── Pin sort mode ──
  function loadPinSortMode(): PinSortMode {
    try {
      const raw = localStorage.getItem(PIN_SORT_MODE_LS_KEY);
      if (raw === "calls" || raw === "recent") return raw;
      if (localStorage.getItem("yivad.aichat.pinSortByCount") === "1") {
        localStorage.setItem(PIN_SORT_MODE_LS_KEY, "calls");
        localStorage.removeItem("yivad.aichat.pinSortByCount");
        return "calls";
      }
    } catch { /* ignore */ }
    return "default";
  }

  function persistPinSortMode(mode: PinSortMode): void {
    try { localStorage.setItem(PIN_SORT_MODE_LS_KEY, mode); } catch { /* ignore */ }
  }

  // ── Pinned tools ──
  function loadPinned(): string[] {
    try {
      const raw = localStorage.getItem(PINNED_LS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(x => typeof x === "string") : [];
    } catch { return []; }
  }

  function persistPinned(pinned: Set<string>): void {
    try { localStorage.setItem(PINNED_LS_KEY, JSON.stringify([...pinned])); } catch { /* ignore */ }
  }

  if (deps) {
    watch(deps.compactMode, () => persistSkillPrefs(deps.skillSortMode.value ?? "registry", deps.compactMode.value));
  }

  return {
    loadCompactMode,
    loadSkillSortMode,
    persistSkillPrefs,
    loadPinSortMode,
    persistPinSortMode,
    loadPinned,
    persistPinned,
    SKILLS_PREF_LS_KEY,
    PINNED_LS_KEY,
    PIN_SORT_MODE_LS_KEY
  };
}