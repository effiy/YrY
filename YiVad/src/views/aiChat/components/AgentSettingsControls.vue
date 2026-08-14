<script setup lang="ts" name="agentSettingsControls">
import { ref, watch } from "vue";
import { MagicStick, Edit, Refresh, ArrowLeft } from "@element-plus/icons-vue";

/**
 * Agent-settings pill cluster + config dialogs, extracted from ChatToolbar.
 * Owns the agent mode toggle, the system-prompt editor, and the model
 * rotation / fallback editors (Pi: prepareNextTurn + escalate-on-stall).
 * Pure prop/emit boundary — the parent still owns the agent state.
 */
const props = withDefaults(
  defineProps<{
    agentMode?: boolean;
    agentSystemPrompt?: string;
    agentModelRotation?: string[];
    agentModelFallback?: string[];
  }>(),
  { agentMode: false, agentSystemPrompt: "", agentModelRotation: () => [], agentModelFallback: () => [] }
);

const emit = defineEmits<{
  (e: "toggle-agent"): void;
  (e: "update-agent-system-prompt", prompt: string): void;
  (e: "update-agent-model-rotation", models: string[]): void;
  (e: "update-agent-model-fallback", models: string[]): void;
}>();

// ── Agent system prompt editor ──
const showSysPromptEditor = ref(false);
const sysPromptDraft = ref("");

function saveSysPrompt() {
  emit("update-agent-system-prompt", sysPromptDraft.value.trim());
  showSysPromptEditor.value = false;
}

// Watch for prop changes to initialize draft
watch(() => props.agentSystemPrompt, (v) => {
  if (!showSysPromptEditor.value) sysPromptDraft.value = v ?? "";
}, { immediate: true });

// ── Agent model rotation editor (Pi: prepareNextTurn model switching) ──
const showModelRotationEditor = ref(false);
const modelRotationDraft = ref("");

function openModelRotationEditor() {
  modelRotationDraft.value = (props.agentModelRotation ?? []).join(", ");
  showModelRotationEditor.value = true;
}

function saveModelRotation() {
  const models = modelRotationDraft.value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  emit("update-agent-model-rotation", models);
  showModelRotationEditor.value = false;
}

// ── Agent model fallback editor (Pi: escalate when the active model stalls) ──
const showModelFallbackEditor = ref(false);
const modelFallbackDraft = ref("");

function openModelFallbackEditor() {
  modelFallbackDraft.value = (props.agentModelFallback ?? []).join(", ");
  showModelFallbackEditor.value = true;
}

function saveModelFallback() {
  const models = modelFallbackDraft.value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  emit("update-agent-model-fallback", models);
  showModelFallbackEditor.value = false;
}
</script>

<template>
  <div
    class="ct-pill" :class="{ on: props.agentMode }"
    :title="props.agentMode ? 'Agent mode on — multi-turn tool calling with observability' : 'Agent mode off — direct chat'"
    @click="emit('toggle-agent')"
  >
    <el-icon :size="14"><MagicStick /></el-icon>
    <el-switch :model-value="props.agentMode" size="small" @click.stop @update:model-value="emit('toggle-agent')" />
  </div>
  <div v-if="props.agentMode" class="ct-pill ct-pill--sys-prompt" title="Customize agent system prompt">
    <el-icon :size="14" @click="showSysPromptEditor = true"><Edit /></el-icon>
  </div>
  <div v-if="props.agentMode" class="ct-pill ct-pill--model-rotation" :title="props.agentModelRotation?.length ? `Model rotation: ${props.agentModelRotation.join(' → ')}` : 'Configure model rotation between turns'">
    <el-icon :size="14" @click="openModelRotationEditor"><Refresh /></el-icon>
    <span v-if="props.agentModelRotation?.length" class="ct-pill-label">{{ props.agentModelRotation.length }}⇄</span>
  </div>
  <div v-if="props.agentMode" class="ct-pill ct-pill--model-fallback" :title="props.agentModelFallback?.length ? `Fallback models: ${props.agentModelFallback.join(' → ')}` : 'Configure fallback models (escalation when the active model stalls)'">
    <el-icon :size="14" @click="openModelFallbackEditor"><ArrowLeft /></el-icon>
    <span v-if="props.agentModelFallback?.length" class="ct-pill-label">{{ props.agentModelFallback.length }}↓</span>
  </div>
  <!-- Agent system prompt editor dialog -->
  <el-dialog
    v-model="showSysPromptEditor"
    title="Agent System Prompt"
    width="560px"
    :close-on-click-modal="false"
  >
    <el-input
      v-model="sysPromptDraft"
      type="textarea"
      :autosize="{ minRows: 4, maxRows: 12 }"
      placeholder="Custom system prompt for the agent (e.g. 'You are a senior software engineer...')"
    />
    <template #footer>
      <el-button @click="showSysPromptEditor = false">Cancel</el-button>
      <el-button type="primary" @click="saveSysPrompt">Save</el-button>
    </template>
  </el-dialog>
  <!-- Agent model rotation editor dialog (Pi: prepareNextTurn) -->
  <el-dialog
    v-model="showModelRotationEditor"
    title="Agent Model Rotation"
    width="480px"
    :close-on-click-modal="false"
  >
    <p class="ct-dialog-hint">Comma-separated model names to rotate between turns. The agent switches to the next model after each turn. Leave empty to use a single model.</p>
    <el-input
      v-model="modelRotationDraft"
      placeholder="e.g. qwen3.5, qwen3.5-think, qwen3.5"
    />
    <template #footer>
      <el-button @click="showModelRotationEditor = false">Cancel</el-button>
      <el-button type="primary" @click="saveModelRotation">Save</el-button>
    </template>
  </el-dialog>
  <!-- Agent model fallback editor dialog (Pi: escalate on stall) -->
  <el-dialog
    v-model="showModelFallbackEditor"
    title="Agent Fallback Models"
    width="480px"
    :close-on-click-modal="false"
  >
    <p class="ct-dialog-hint">Comma-separated fallback models to escalate to when the active model stalls (narrates a tool call without executing it). Leave empty to use the server default.</p>
    <el-input
      v-model="modelFallbackDraft"
      placeholder="e.g. qwen3-coder, qwen3.5"
    />
    <template #footer>
      <el-button @click="showModelFallbackEditor = false">Cancel</el-button>
      <el-button type="primary" @click="saveModelFallback">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
// Status pill — mirrors ChatToolbar's `.ct-pill` so the extracted agent pills
// render identically (scoped styles don't pierce the child boundary).
.ct-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 14px;
  transition: all .15s;
  &:hover { border-color: var(--el-border-color); }
  &.on {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.ct-pill-label { line-height: 1; }
</style>
