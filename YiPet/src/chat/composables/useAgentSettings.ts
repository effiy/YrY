/**
 * YiPet Chat — Agent settings dialogs composable.
 * Extracted from ChatToolbar.vue: system prompt, model rotation, fallback models.
 */
import { ref } from 'vue';
import { useChatStore } from '../stores/chat';

export function useAgentSettings() {
  const store = useChatStore();
  const s = store.state;

  const showSysPrompt = ref(false);
  const sysPromptDraft = ref('');

  function openSysPrompt() {
    sysPromptDraft.value = s.agentSystemPrompt || '';
    showSysPrompt.value = true;
  }
  function saveSysPrompt() {
    s.agentSystemPrompt = sysPromptDraft.value.trim();
    showSysPrompt.value = false;
  }

  const showModelRotation = ref(false);
  const modelRotationDraft = ref('');

  function openModelRotation() {
    modelRotationDraft.value = (s.agentModelRotation || []).join(', ');
    showModelRotation.value = true;
  }
  function saveModelRotation() {
    s.agentModelRotation = modelRotationDraft.value.split(',').map((m: string) => m.trim()).filter(Boolean);
    showModelRotation.value = false;
  }

  const showModelFallback = ref(false);
  const modelFallbackDraft = ref('');

  function openModelFallback() {
    modelFallbackDraft.value = (s.agentModelFallback || []).join(', ');
    showModelFallback.value = true;
  }
  function saveModelFallback() {
    s.agentModelFallback = modelFallbackDraft.value.split(',').map((m: string) => m.trim()).filter(Boolean);
    showModelFallback.value = false;
  }

  return {
    showSysPrompt, sysPromptDraft, openSysPrompt, saveSysPrompt,
    showModelRotation, modelRotationDraft, openModelRotation, saveModelRotation,
    showModelFallback, modelFallbackDraft, openModelFallback, saveModelFallback,
  };
}