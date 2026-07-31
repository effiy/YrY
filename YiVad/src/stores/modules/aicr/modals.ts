/**
 * AICR Modals store — visibility and draft state for all AICR modals.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import type { FaqDocument } from "@/api/interface/yiweb";

export const useAicrModalStore = defineStore("yivad-aicr-modals", () => {
  // Session edit
  const sessionEditVisible = ref(false);
  const sessionEditKey = ref<string | null>(null);
  const sessionEditTitle = ref("");
  const sessionEditUrl = ref("");
  const sessionEditDescription = ref("");
  const sessionEditGenerating = ref(false);

  // FAQ manager + FAQ edit
  const faqVisible = ref(false);
  const faqEditVisible = ref(false);
  const faqEditDraft = ref<Partial<FaqDocument> & { key?: string }>({});

  // Bot settings
  const settingsVisible = ref(false);

  // WeChat
  const weChatVisible = ref(false);

  // Context editor
  const contextEditorVisible = ref(false);
  const contextEditorDraft = ref("");
  const contextEditorBusy = ref(false);

  // Message editor (per-message edit)
  const messageEditorVisible = ref(false);
  const messageEditorIndex = ref<number>(-1);
  const messageEditorDraft = ref("");

  // Tag manager
  const tagManagerVisible = ref(false);

  // Shortcut help overlay
  const shortcutHelpVisible = ref(false);

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

  function openFaqEdit(draft: Partial<FaqDocument> & { key?: string } = {}) {
    faqEditDraft.value = { ...draft };
    faqEditVisible.value = true;
  }

  function closeFaqEdit() {
    faqEditVisible.value = false;
    faqEditDraft.value = {};
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

  function openMessageEdit(idx: number, draft: string, _type: "user" | "pet" = "user") {
    messageEditorIndex.value = idx;
    messageEditorDraft.value = draft;
    messageEditorVisible.value = true;
  }

  function closeMessageEdit() {
    messageEditorVisible.value = false;
    messageEditorIndex.value = -1;
    messageEditorDraft.value = "";
  }

  function toggleTagManager() {
    tagManagerVisible.value = !tagManagerVisible.value;
  }

  function toggleShortcutHelp() {
    shortcutHelpVisible.value = !shortcutHelpVisible.value;
  }

  return {
    sessionEditVisible,
    sessionEditKey,
    sessionEditTitle,
    sessionEditUrl,
    sessionEditDescription,
    sessionEditGenerating,
    faqVisible,
    faqEditVisible,
    faqEditDraft,
    settingsVisible,
    weChatVisible,
    contextEditorVisible,
    contextEditorDraft,
    contextEditorBusy,
    messageEditorVisible,
    messageEditorIndex,
    messageEditorDraft,
    tagManagerVisible,
    shortcutHelpVisible,
    openSessionEdit,
    closeSessionEdit,
    toggleFaq,
    openFaqEdit,
    closeFaqEdit,
    toggleSettings,
    toggleWeChat,
    openContextEditor,
    closeContextEditor,
    openMessageEdit,
    closeMessageEdit,
    toggleTagManager,
    toggleShortcutHelp
  };
});
