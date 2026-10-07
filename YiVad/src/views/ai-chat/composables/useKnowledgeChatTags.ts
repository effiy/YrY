/**
 * useKnowledgeChatTags — Tag management and context files for KnowledgeChatPanel.
 */
import { ref, computed, type Ref } from "vue";

export interface TagsDeps {
  filePath: Ref<string>;
}

export function useKnowledgeChatTags(deps: TagsDeps) {
  const { filePath } = deps;

  const STORAGE_TAGS_PREFIX = "kchat:tags:";
  const tags = ref<string[]>([]);
  const tagManagerVisible = ref(false);
  const newTagInput = ref("");
  const tagsKey = computed(() => `${STORAGE_TAGS_PREFIX}${filePath.value}`);

  function loadTags() {
    try { const raw = localStorage.getItem(tagsKey.value); if (raw) tags.value = JSON.parse(raw); } catch { /* ignore */ }
    ensureCurrentFileInContext();
  }
  function saveTags() {
    try { localStorage.setItem(tagsKey.value, JSON.stringify(tags.value)); } catch { /* ignore */ }
  }
  function ensureCurrentFileInContext() {
    if (!filePath.value) return;
    const ctxTag = `ctx:${filePath.value}`;
    if (!tags.value.includes(ctxTag)) { tags.value.push(ctxTag); saveTags(); }
  }
  function addTag(tag: string) {
    if (!tags.value.includes(tag)) { tags.value.push(tag); saveTags(); }
  }
  function removeTag(tag: string) {
    tags.value = tags.value.filter(t => t !== tag);
    saveTags();
  }

  const contextFiles = computed(() => {
    const CTX = "ctx:";
    return tags.value.filter(t => t.startsWith(CTX)).map(t => t.slice(CTX.length));
  });

  function openTagManager() { tagManagerVisible.value = true; newTagInput.value = ""; }
  function addNewTag() { const t = newTagInput.value.trim(); if (t) addTag(t); newTagInput.value = ""; }
  function toggleTagManager() { tagManagerVisible.value = !tagManagerVisible.value; }

  return {
    tags, tagManagerVisible, newTagInput, tagsKey, contextFiles,
    loadTags, saveTags, ensureCurrentFileInContext, addTag, removeTag,
    openTagManager, addNewTag, toggleTagManager
  };
}