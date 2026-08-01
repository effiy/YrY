/**
 * AICR Filters store — multi-level tag filtering (projects → stories → skills/templates/rules/agents)
 * plus project and time-range dimensions for file tree management.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getSessions } from "@/api/modules/sessions";
import type { SessionDocument } from "@/api/interface/yiweb";

export type TimeRange = "all" | "week" | "month" | "quarter" | "custom";

export const useAicrFilterStore = defineStore("yivad-aicr-filters", () => {
  // ── Tag filters (existing) ──
  const tagFilterNoTags = ref(false);
  const selectedProjectTags = ref<string[]>([]);
  const selectedSkillTags = ref<string[]>([]);
  const selectedTemplateTags = ref<string[]>([]);
  const selectedRuleTags = ref<string[]>([]);
  const selectedAgentTags = ref<string[]>([]);

  // ── Project & time dimensions ──
  const timeRange = ref<TimeRange>("all");
  const customStart = ref("");
  const customEnd = ref("");

  // ── Tag universe (populated from sessions) ──
  const allStoryTags = ref<string[]>([]);
  const allSkillTags = ref<string[]>([]);
  const allTemplateTags = ref<string[]>([]);
  const allRuleTags = ref<string[]>([]);
  const allAgentTags = ref<string[]>([]);
  const tagCounts = ref<Record<string, number>>({});

  function clearAll() {
    tagFilterNoTags.value = false;
    selectedProjectTags.value = [];
    selectedSkillTags.value = [];
    selectedTemplateTags.value = [];
    selectedRuleTags.value = [];
    selectedAgentTags.value = [];
  }

  // ── Project & time methods ──

  function setTimeRange(r: TimeRange) {
    timeRange.value = r;
  }

  /** Returns { start, end } in epoch ms for client-side filtering */
  function getTimeFilter(): { start?: number; end?: number } {
    const now = Date.now();
    switch (timeRange.value) {
      case "week":
        return { start: now - 7 * 86400000 };
      case "month":
        return { start: now - 30 * 86400000 };
      case "quarter":
        return { start: now - 90 * 86400000 };
      case "custom":
        return {
          start: customStart.value ? new Date(customStart.value).getTime() : undefined,
          end: customEnd.value ? new Date(customEnd.value).getTime() + 86400000 : undefined
        };
      default:
        return {};
    }
  }

  /** Populate tag universe + counts from a session list. Call after sessions load. */
  function loadTagsFromSessions(sessions: SessionDocument[]) {
    const stories = new Set<string>();
    const skills = new Set<string>();
    const templates = new Set<string>();
    const rules = new Set<string>();
    const agents = new Set<string>();
    const counts: Record<string, number> = {};

    for (const s of sessions) {
      const tags = s.tags ?? [];
      for (const t of tags) {
        counts[t] = (counts[t] || 0) + 1;
        // Heuristic: classify by leading path segment keywords (mirrors YiWeb's tagComputeds).
        const lower = String(t).toLowerCase();
        if (/skill|skills/.test(lower)) skills.add(t);
        else if (/template|templates/.test(lower)) templates.add(t);
        else if (/rule|rules/.test(lower)) rules.add(t);
        else if (/agent|agents/.test(lower)) agents.add(t);
        else stories.add(t);
      }
    }

    const sort = (arr: string[]) => arr.sort((a, b) => a.localeCompare(b, "zh-CN"));
    allStoryTags.value = sort([...stories]);
    allSkillTags.value = sort([...skills]);
    allTemplateTags.value = sort([...templates]);
    allRuleTags.value = sort([...rules]);
    allAgentTags.value = sort([...agents]);
    tagCounts.value = counts;
  }

  /** Pull sessions from backend and refresh the tag universe in one shot. */
  async function refreshTagUniverse() {
    try {
      const sessions = await getSessions();
      loadTagsFromSessions(sessions);
    } catch {
      /* ignore — caller may surface error separately */
    }
  }

  return {
    // tag state
    tagFilterNoTags,
    selectedProjectTags,
    selectedSkillTags,
    selectedTemplateTags,
    selectedRuleTags,
    selectedAgentTags,
    allStoryTags,
    allSkillTags,
    allTemplateTags,
    allRuleTags,
    allAgentTags,
    tagCounts,
    // tag methods
    clearAll,
    loadTagsFromSessions,
    refreshTagUniverse,
    // project & time state
    timeRange,
    customStart,
    customEnd,
    // project & time methods
    setTimeRange,
    getTimeFilter
  };
});
