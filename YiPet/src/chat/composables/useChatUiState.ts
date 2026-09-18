import { ref, reactive } from 'vue';

export function useChatUiState() {
  const faqVisible = ref(false);
  const faqSearch = ref('');
  const faqApplyMode = ref<'append' | 'insert'>('append');
  const weChatVisible = ref(false);
  const tagManagerVisible = ref(false);
  const llamaIndexVisible = ref(false);
  const sessionEditVisible = ref(false);
  const contextEditorVisible = ref(false);
  const contextEditorDraft = ref('');
  const contextPanelNewMode = ref(false);
  const batchMode = ref(false);
  const selectedKeys = reactive<Set<string>>(new Set());

  function clearSelection() {
    selectedKeys.clear();
  }

  return {
    faqVisible,
    faqSearch,
    faqApplyMode,
    weChatVisible,
    tagManagerVisible,
    llamaIndexVisible,
    sessionEditVisible,
    contextEditorVisible,
    contextEditorDraft,
    contextPanelNewMode,
    batchMode,
    selectedKeys,
    clearSelection,
  };
}
