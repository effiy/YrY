/**
 * AICR Filters store — multi-level tag filtering (projects → stories → skills/templates/rules/agents).
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAicrFilterStore = defineStore("yivad-aicr-filters", () => {
  const tagFilterNoTags = ref(false);
  const selectedProjectTags = ref<string[]>([]);
  const selectedSkillTags = ref<string[]>([]);
  const selectedTemplateTags = ref<string[]>([]);
  const selectedRuleTags = ref<string[]>([]);
  const selectedAgentTags = ref<string[]>([]);

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

  return {
    tagFilterNoTags,
    selectedProjectTags,
    selectedSkillTags,
    selectedTemplateTags,
    selectedRuleTags,
    selectedAgentTags,
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
    hasAnyFilter
  };
});
