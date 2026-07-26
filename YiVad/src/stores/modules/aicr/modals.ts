/**
 * AICR Modals store — visibility and draft state for all AICR modals.
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAicrModalStore = defineStore("yivad-aicr-modals", () => {
  // Session edit
  const sessionEditVisible = ref(false);
  const sessionEditKey = ref<string | null>(null);
  const sessionEditTitle = ref("");
  const sessionEditUrl = ref("");
  const sessionEditDescription = ref("");
  const sessionEditGenerating = ref(false);

  // FAQ
  const faqVisible = ref(false);

  // Bot settings
  const settingsVisible = ref(false);
  const botModel = ref("qwen3.5");
  const botSystemPrompt = ref("你是一个专业、简洁且可靠的 AI 助手。");

  // WeChat
  const weChatVisible = ref(false);

  // Context editor
  const contextEditorVisible = ref(false);
  const contextEditorDraft = ref("");
  const contextEditorMode = ref<"edit" | "split" | "preview">("edit");

  function openSessionEdit(key: string, title = "", url = "", desc = "") {
    sessionEditKey.value = key;
    sessionEditTitle.value = title;
    sessionEditUrl.value = url;
    sessionEditDescription.value = desc;
    sessionEditVisible.value = true;
  }

  function closeSessionEdit() {
    sessionEditVisible.value = false;
  }

  function toggleFaq() {
    faqVisible.value = !faqVisible.value;
  }

  function toggleSettings() {
    settingsVisible.value = !settingsVisible.value;
  }

  function toggleWeChat() {
    weChatVisible.value = !weChatVisible.value;
  }

  function openContextEditor(draft = "") {
    contextEditorDraft.value = draft;
    contextEditorVisible.value = true;
  }

  function closeContextEditor() {
    contextEditorVisible.value = false;
  }

  return {
    sessionEditVisible,
    sessionEditKey,
    sessionEditTitle,
    sessionEditUrl,
    sessionEditDescription,
    sessionEditGenerating,
    faqVisible,
    settingsVisible,
    botModel,
    botSystemPrompt,
    weChatVisible,
    contextEditorVisible,
    contextEditorDraft,
    contextEditorMode,
    openSessionEdit,
    closeSessionEdit,
    toggleFaq,
    toggleSettings,
    toggleWeChat,
    openContextEditor,
    closeContextEditor
  };
});
