<script setup lang="ts">
/**
 * ToolCallPanel — single tool call entry with rich rendering.
 * Extracted from MessageBubble.vue: todo/skill/ask capability rendering,
 * error/content collapse, copy, latency badges.
 */
import type { ToolCallEntry } from '../../types';

defineProps<{
  call: ToolCallEntry;
  idx: number;
  copiedIdx: number | null;
  failedIdx: number | null;
  isErrorExpanded: boolean;
  isErrorLong: boolean;
  isContentExpanded: boolean;
  isContentLong: boolean;
  slowBadgeMs: number;
  verySlowBadgeMs: number;
  errorCollapseThreshold: number;
  contentCollapseThreshold: number;
  capabilityKind: (call: ToolCallEntry) => 'todo' | 'skill' | 'ask' | null;
  todoItems: (call: ToolCallEntry) => Array<{ id: string; content: string; status: string }>;
  askQuestion: (call: ToolCallEntry) => string;
  askOptions: (call: ToolCallEntry) => string[];
  callLatencyLevel: (ms: number | undefined | null) => '' | 'slow' | 'very-slow';
  formatDuration: (ms?: number) => string;
}>();

const emit = defineEmits<{
  toggleError: [idx: number];
  toggleContent: [idx: number];
  copy: [content: string, idx: number];
}>();

function latencyLevel(ms: number | undefined | null) {
  if (ms == null) return '';
  if (ms >= 5000) return 'very-slow';
  if (ms >= 1000) return 'slow';
  return '';
}
</script>

<template>
  <div
    class="mb-tool-call"
    :class="{
      'mb-tool-call--running': !call.content && !call.error,
      'mb-tool-call--error': !!call.error,
    }"
  >
    <div class="mb-tool-call-head">
      <span class="mb-tool-call-status">
        <span v-if="!call.content && !call.error" class="mb-tool-call-spinner" />
        <span v-else-if="call.error" class="mb-tool-call-err-icon">✕</span>
        <span v-else class="mb-tool-call-ok-icon">✓</span>
      </span>
      <span class="mb-tool-call-name">{{ call.label }}</span>
      <span
        v-if="call.durationMs != null"
        class="mb-tool-call-ms"
        :class="{
          'mb-tool-call-ms--slow': latencyLevel(call.durationMs) === 'slow',
          'mb-tool-call-ms--very-slow': latencyLevel(call.durationMs) === 'very-slow',
        }"
        :title="latencyLevel(call.durationMs) ? `Slow call — >=${latencyLevel(call.durationMs) === 'very-slow' ? verySlowBadgeMs : slowBadgeMs}ms` : ''"
      >{{ formatDuration(call.durationMs) }}</span>
      <span
        v-if="latencyLevel(call.durationMs) === 'slow'"
        class="mb-tool-call-tag mb-tool-call-tag--slow"
        title="Slow call (>=1s)"
      >slow</span>
      <span
        v-else-if="latencyLevel(call.durationMs) === 'very-slow'"
        class="mb-tool-call-tag mb-tool-call-tag--very-slow"
        title="Very slow call (>=5s)"
      >very slow</span>
      <span v-if="call.error" class="mb-tool-call-state mb-tool-call-state--err">failed</span>
    </div>
    <div v-if="call.args && Object.keys(call.args).length && !capabilityKind(call)" class="mb-tool-call-args">
      <code>{{ JSON.stringify(call.args) }}</code>
    </div>

    <div v-if="capabilityKind(call) === 'todo' && todoItems(call).length" class="mb-tool-call-capability">
      <div
        v-for="t in todoItems(call)"
        :key="t.id"
        class="mb-tool-call-todo"
        :class="`mb-tool-call-todo--${t.status}`"
      >
        <span class="mb-tool-call-todo-mark">{{ t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '▶' : '○' }}</span>
        <span class="mb-tool-call-todo-text">{{ t.content }}</span>
      </div>
    </div>
    <div v-else-if="capabilityKind(call) === 'ask'" class="mb-tool-call-capability mb-tool-call-ask">
      <div class="mb-tool-call-ask-q">Q: {{ askQuestion(call) }}</div>
      <div v-if="askOptions(call).length" class="mb-tool-call-ask-opts">
        <span v-for="o in askOptions(call)" :key="o" class="mb-tool-call-ask-opt">{{ o }}</span>
      </div>
      <div v-if="call.content" class="mb-tool-call-ask-a">A: {{ call.content }}</div>
    </div>
    <div v-else-if="capabilityKind(call) === 'skill'" class="mb-tool-call-capability mb-tool-call-skill">
      <span class="mb-tool-call-skill-label">Skill</span>
      <span class="mb-tool-call-skill-name">{{ call.args?.name }}</span>
    </div>
    <div v-if="call.error" class="mb-tool-call-error">
      <span class="mb-tool-call-error-text">{{ isErrorExpanded || !isErrorLong ? call.error : call.error.slice(0, errorCollapseThreshold) + '...' }}</span>
      <button
        v-if="isErrorLong"
        type="button"
        class="mb-tool-call-toggle"
        :title="isErrorExpanded ? 'Collapse error' : `Expand full error (${call.error.length} chars)`"
        @click="emit('toggleError', idx)"
      >{{ isErrorExpanded ? '−' : `+${call.error.length - errorCollapseThreshold}` }}</button>
      <button
        type="button"
        class="mb-tool-call-copy-btn"
        :title="copiedIdx === idx ? 'Copied' : 'Copy error'"
        @click="emit('copy', call.error!, idx)"
      >{{ copiedIdx === idx ? 'Copied' : 'Copy' }}</button>
    </div>
    <div v-else-if="call.content" class="mb-tool-call-content">
      <pre>{{ isContentExpanded || !isContentLong ? call.content : call.content.slice(0, contentCollapseThreshold) + '...' }}</pre>
      <button
        v-if="isContentLong"
        type="button"
        class="mb-tool-call-toggle"
        :title="isContentExpanded ? 'Collapse content' : `Expand full content (${call.content.length} chars)`"
        @click="emit('toggleContent', idx)"
      >{{ isContentExpanded ? '−' : `+${call.content.length - contentCollapseThreshold}` }}</button>
      <button
        type="button"
        class="mb-tool-call-copy-btn"
        :title="copiedIdx === idx ? 'Copied' : 'Copy content'"
        @click="emit('copy', call.content, idx)"
      >{{ copiedIdx === idx ? 'Copied' : 'Copy' }}</button>
    </div>
  </div>
</template>