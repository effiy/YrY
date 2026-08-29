<script setup lang="ts">
/**
 * AgentTimelinePanel — agent turn progress + timeline + events.
 * Extracted from MessageBubble.vue.
 */
import type { ToolCallEntry } from '../../types';
import ToolCallPanel from './ToolCallPanel.vue';

defineProps<{
  turnProgress: { current: number; max: number; active: boolean; nearLimit: boolean } | null;
  showTimeline: boolean;
  turnSummaries: Array<{
    turnIndex: number;
    usage?: { turnTokens: number };
    toolCalls: ToolCallEntry[];
    thinkingText?: string;
  }>;
  isProcessing: boolean;
  agentEvents: any[];
  thinkingExpandedMap: Record<number, boolean>;
  agentEventsExpanded: boolean;
  // ToolCallPanel props
  copiedToolIdx: number | null;
  failedToolIdx: number | null;
  slowBadgeMs: number;
  verySlowBadgeMs: number;
  errorCollapseThreshold: number;
  contentCollapseThreshold: number;
  isErrorExpanded: (ci: number) => boolean;
  isErrorLong: (err: string) => boolean;
  isContentExpanded: (ci: number) => boolean;
  isContentLong: (s: string) => boolean;
  capabilityKind: (call: ToolCallEntry) => 'todo' | 'skill' | 'ask' | null;
  todoItems: (call: ToolCallEntry) => Array<{ id: string; content: string; status: string }>;
  askQuestion: (call: ToolCallEntry) => string;
  askOptions: (call: ToolCallEntry) => string[];
  callLatencyLevel: (ms: number | undefined | null) => '' | 'slow' | 'very-slow';
  formatDuration: (ms?: number) => string;
  formatEventPayload: (event: any) => string;
  eventTypeColors: Record<string, string>;
}>();

const emit = defineEmits<{
  toggleThinking: [ti: number];
  toggleError: [idx: number];
  toggleContent: [idx: number];
  copy: [content: string, idx: number];
  toggleEvent: [idx: number];
  toggleEventsExpanded: [];
}>();
</script>

<template>
  <!-- Agent turn progress -->
  <div
    v-if="turnProgress && turnProgress.active && turnProgress.max > 0"
    class="mb-agent-progress"
    :class="{ 'mb-agent-progress--near': turnProgress.nearLimit }"
    :title="turnProgress.nearLimit ? 'Approaching max turns — reply continue to resume' : ''"
  >
    <span class="mb-agent-progress-label">
      Agent running · Turn {{ turnProgress.current }} / {{ turnProgress.max }}
    </span>
    <div class="mb-agent-progress-bar">
      <div
        class="mb-agent-progress-fill"
        :class="{ 'mb-agent-progress-fill--warn': turnProgress.nearLimit }"
        :style="{ width: `${Math.min(100, Math.round((turnProgress.current / turnProgress.max) * 100))}%` }"
      />
    </div>
  </div>

  <!-- Agent timeline -->
  <template v-if="showTimeline">
    <div class="mb-agent-turns">
      <div
        v-for="(turn, ti) in turnSummaries"
        :key="ti"
        class="mb-agent-turn"
        :class="{
          'mb-agent-turn--running': ti === turnSummaries.length - 1 && isProcessing,
          'mb-agent-turn--done': !isProcessing || ti < turnSummaries.length - 1,
        }"
      >
        <div class="mb-agent-turn-header">
          <span class="mb-agent-turn-num">Turn {{ turn.turnIndex }}</span>
          <span v-if="turn.usage" class="mb-agent-turn-usage">
            ~{{ turn.usage.turnTokens }} tok
          </span>
          <span class="mb-agent-turn-tools">{{ turn.toolCalls.length }} tool{{ turn.toolCalls.length !== 1 ? 's' : '' }}</span>
        </div>

        <div
          v-if="turn.thinkingText"
          class="mb-agent-thinking"
          @click="emit('toggleThinking', ti)"
        >
          <div class="mb-agent-thinking-header">
            <span class="mb-agent-thinking-label">Thinking</span>
            <span class="mb-agent-thinking-toggle">{{ thinkingExpandedMap[ti] ? '−' : '+' }}</span>
          </div>
          <div v-if="thinkingExpandedMap[ti]" class="mb-agent-thinking-text">{{ turn.thinkingText }}</div>
        </div>

        <ToolCallPanel
          v-for="(call, ci) in turn.toolCalls"
          :key="ci"
          :call="call"
          :idx="ci"
          :copied-idx="copiedToolIdx"
          :failed-idx="failedToolIdx"
          :is-error-expanded="isErrorExpanded(ci)"
          :is-error-long="isErrorLong(call.error || '')"
          :is-content-expanded="isContentExpanded(ci)"
          :is-content-long="isContentLong(call.content || '')"
          :slow-badge-ms="slowBadgeMs"
          :very-slow-badge-ms="verySlowBadgeMs"
          :error-collapse-threshold="errorCollapseThreshold"
          :content-collapse-threshold="contentCollapseThreshold"
          :capability-kind="capabilityKind"
          :todo-items="todoItems"
          :ask-question="askQuestion"
          :ask-options="askOptions"
          :call-latency-level="callLatencyLevel"
          :format-duration="formatDuration"
          @toggle-error="emit('toggleError', $event)"
          @toggle-content="emit('toggleContent', $event)"
          @copy="(content: string, idx: number) => emit('copy', content, idx)"
        />
      </div>
    </div>

    <!-- Agent events panel -->
    <div v-if="agentEvents.length" class="mb-agent-events">
      <div class="mb-agent-events-toggle" @click="emit('toggleEventsExpanded')">
        <span class="mb-agent-events-caret">{{ agentEventsExpanded ? '▾' : '▸' }}</span>
        <span class="mb-agent-events-label">Agent Events ({{ agentEvents.length }})</span>
        <span class="mb-agent-events-hint">click to inspect</span>
      </div>
      <div v-if="agentEventsExpanded" class="mb-agent-events-body">
        <div
          v-for="(evt, ei) in agentEvents"
          :key="ei"
          class="mb-agent-event"
          :class="{ 'is-expanded': false }"
        >
          <div class="mb-agent-event-head" @click="emit('toggleEvent', ei)">
            <span
              class="mb-agent-event-dot"
              :style="{ background: eventTypeColors[evt.type] || '#888' }"
            />
            <span class="mb-agent-event-type">{{ evt.type }}</span>
            <span class="mb-agent-event-toggle">{{ false ? '▾' : '▸' }}</span>
          </div>
          <div v-if="false" class="mb-agent-event-body">
            <pre>{{ formatEventPayload(evt) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>