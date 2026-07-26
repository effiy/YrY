/**
 * AICR Filters store — multi-level tag filtering (projects → stories → skills/templates/rules/agents)
 * plus project and time-range dimensions for file tree management.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { PROJECTS } from "@/config";

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
  const selectedProject = ref<string | null>(null);
  const timeRange = ref<TimeRange>("all");
  const customStart = ref("");
  const customEnd = ref("");
  const projects = ref<string[]>([...PROJECTS]);
  const projectFileCounts = ref<Record<string, number>>({});

  // ── Tag methods (existing) ──

  function toggleProjectTag(name: string) {
    const idx = selectedProjectTags.value.indexOf(name);
    if (idx >= 0) selectedProjectTags.value.splice(idx, 1);
    else selectedProjectTags.value.push(name);
  }

  function toggleSkillTag(name: string) {
    const idx = selectedSkillTags.value.indexOf(name);
    if (idx >= 0) selectedSkillTags.value.splice(idx, 1);
    else selectedSkillTags.value.push(name);
  }

  function toggleTemplateTag(name: string) {
    const idx = selectedTemplateTags.value.indexOf(name);
    if (idx >= 0) selectedTemplateTags.value.splice(idx, 1);
    else selectedTemplateTags.value.push(name);
  }

  function toggleRuleTag(name: string) {
    const idx = selectedRuleTags.value.indexOf(name);
    if (idx >= 0) selectedRuleTags.value.splice(idx, 1);
    else selectedRuleTags.value.push(name);
  }

  function toggleAgentTag(name: string) {
    const idx = selectedAgentTags.value.indexOf(name);
    if (idx >= 0) selectedAgentTags.value.splice(idx, 1);
    else selectedAgentTags.value.push(name);
  }

  function clearProjectTags() {
    selectedProjectTags.value = [];
  }
  function clearSkillTags() {
    selectedSkillTags.value = [];
  }
  function clearTemplateTags() {
    selectedTemplateTags.value = [];
  }
  function clearRuleTags() {
    selectedRuleTags.value = [];
  }
  function clearAgentTags() {
    selectedAgentTags.value = [];
  }

  function clearAll() {
    tagFilterNoTags.value = false;
    selectedProjectTags.value = [];
    selectedSkillTags.value = [];
    selectedTemplateTags.value = [];
    selectedRuleTags.value = [];
    selectedAgentTags.value = [];
  }

  function hasAnyFilter(): boolean {
    return (
      tagFilterNoTags.value ||
      selectedProjectTags.value.length > 0 ||
      selectedSkillTags.value.length > 0 ||
      selectedTemplateTags.value.length > 0 ||
      selectedRuleTags.value.length > 0 ||
      selectedAgentTags.value.length > 0
    );
  }

  // ── Project & time methods ──

  function selectProject(p: string | null) {
    selectedProject.value = p;
  }

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

  return {
    // tag state
    tagFilterNoTags,
    selectedProjectTags,
    selectedSkillTags,
    selectedTemplateTags,
    selectedRuleTags,
    selectedAgentTags,
    // tag methods
    toggleProjectTag,
    toggleSkillTag,
    toggleTemplateTag,
    toggleRuleTag,
    toggleAgentTag,
    clearProjectTags,
    clearSkillTags,
    clearTemplateTags,
    clearRuleTags,
    clearAgentTags,
    clearAll,
    hasAnyFilter,
    // project & time state
    selectedProject,
    timeRange,
    customStart,
    customEnd,
    projects,
    projectFileCounts,
    // project & time methods
    selectProject,
    setTimeRange,
    getTimeFilter
  };
});
