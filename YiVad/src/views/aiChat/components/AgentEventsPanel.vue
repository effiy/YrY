<script setup lang="ts">
/**
 * AgentEventsPanel — Pi-inspired raw agent event inspection.
 *
 * Collapsible panel that shows the raw agent SSE events for debugging
 * and observability. Events are grouped by type with color-coded badges.
 * Click any event to expand its full payload.
 */
import { ref, computed } from "vue";
import { ArrowDown, ArrowRight, Filter } from "@element-plus/icons-vue";
import type { AgentTurnSummary } from "../types";

const props = defineProps<{
  events: Array<{
    type: string;
    timestamp: number;
    turn_index?: number;
    message?:
      | { role: string; content: string }
      | { from: string; to: string }
      | { todos: Array<{ id: string; content: string; status: string }> };
    tool_results?: Array<{ name: string; content: string; error?: string; duration_ms: number }>;
    phase?: string;
    delta?: string;
    error?: string;
    usage?: Record<string, unknown>;
    stop_reason?: string;
    before_count?: number;
    after_count?: number;
    saved_tokens?: number;
    tool_name?: string;
    tool_args?: Record<string, unknown>;
    question_id?: string;
    question?: string;
    options?: string[];
  }>;
  turnSummaries: AgentTurnSummary[];
}>();

const expanded = ref(false);
const expandedEvents = ref<Set<number>>(new Set());
const typeFilter = ref<string>("");

const eventTypes = computed(() => {
  const types = new Set(props.events.map(e => e.type));
  return Array.from(types).sort();
});

const filteredEvents = computed(() => {
  if (!typeFilter.value) return props.events;
  return props.events.filter(e => e.type === typeFilter.value);
});

const typeColors: Record<string, string> = {
  agent_start: "var(--el-color-primary)",
  agent_end: "var(--el-color-primary)",
  turn_start: "var(--el-color-success)",
  turn_end: "var(--el-color-success)",
  thinking: "var(--el-color-info)",
  message_start: "var(--el-color-warning)",
  message_end: "var(--el-color-warning)",
  tool_execution_start: "var(--el-color-danger)",
  tool_execution_end: "var(--el-color-danger)",
  compaction: "var(--el-color-warning)",
  confirmation_required: "var(--el-color-danger)",
  error: "var(--el-color-danger)",
};

function toggleEvent(idx: number) {
  const next = new Set(expandedEvents.value);
  if (next.has(idx)) next.delete(idx);
  else next.add(idx);
  expandedEvents.value = next;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

function formatPayload(event: typeof props.events[number]): string {
  const { type, timestamp, ...rest } = event;
  return JSON.stringify(rest, null, 2);
}
</script>

<template>
  <div class="aep-root">
    <div class="aep-toggle" @click="expanded = !expanded">
      <el-icon :size="12">
        <ArrowRight v-if="!expanded" />
        <ArrowDown v-else />
      </el-icon>
      <span class="aep-toggle-label">Agent Events ({{ events.length }})</span>
      <span class="aep-toggle-hint">click to inspect raw SSE events</span>
    </div>

    <div v-if="expanded" class="aep-body">
      <!-- Type filter -->
      <div class="aep-filters">
        <el-icon :size="11"><Filter /></el-icon>
        <button
          class="aep-filter-chip"
          :class="{ active: !typeFilter }"
          @click="typeFilter = ''"
        >All</button>
        <button
          v-for="t in eventTypes"
          :key="t"
          class="aep-filter-chip"
          :class="{ active: typeFilter === t }"
          :style="{ borderColor: typeColors[t] || 'var(--el-border-color)' }"
          @click="typeFilter = typeFilter === t ? '' : t"
        >{{ t }}</button>
      </div>

      <!-- Event list -->
      <div class="aep-list">
        <div
          v-for="(event, idx) in filteredEvents"
          :key="idx"
          class="aep-event"
          @click="toggleEvent(idx)"
        >
          <div class="aep-event-header">
            <span
              class="aep-event-type"
              :style="{ color: typeColors[event.type] || 'var(--el-text-color-secondary)' }"
            >{{ event.type }}</span>
            <span v-if="event.turn_index" class="aep-event-turn">T{{ event.turn_index }}</span>
            <span class="aep-event-time">{{ formatTime(event.timestamp) }}</span>
            <span v-if="event.phase" class="aep-event-phase">{{ event.phase }}</span>
            <span v-if="event.stop_reason" class="aep-event-stop">{{ event.stop_reason }}</span>
          </div>
          <div v-if="event.error" class="aep-event-error">{{ event.error }}</div>
          <div v-if="event.delta" class="aep-event-delta">{{ event.delta.slice(0, 80) }}</div>
          <pre v-if="expandedEvents.has(idx)" class="aep-event-payload">{{ formatPayload(event) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.aep-root {
  margin-top: 6px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-bg-color);
  overflow: hidden;
  font-size: 11px;
}

.aep-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.aep-toggle-label {
  font-weight: 600;
}

.aep-toggle-hint {
  margin-left: auto;
  color: var(--el-text-color-placeholder);
  font-size: 10px;
}

.aep-body {
  border-top: 1px solid var(--el-border-color-lighter);
}

.aep-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.aep-filter-chip {
  padding: 1px 6px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--el-fill-color);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }
}

.aep-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 2px 0;
}

.aep-event {
  padding: 3px 8px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  & + & {
    border-top: 1px solid var(--el-border-color-extra-light);
  }
}

.aep-event-header {
  display: flex;
  gap: 6px;
  align-items: center;
}

.aep-event-type {
  font-weight: 700;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
}

.aep-event-turn {
  font-weight: 600;
  color: var(--el-color-success);
  font-size: 10px;
}

.aep-event-time {
  color: var(--el-text-color-placeholder);
  font-size: 10px;
}

.aep-event-phase {
  color: var(--el-color-info);
  font-size: 10px;
}

.aep-event-stop {
  color: var(--el-text-color-secondary);
  font-size: 10px;
  font-style: italic;
}

.aep-event-error {
  margin-top: 2px;
  color: var(--el-color-danger);
  font-size: 10px;
}

.aep-event-delta {
  margin-top: 2px;
  color: var(--el-text-color-regular);
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.aep-event-payload {
  margin: 4px 0 0;
  padding: 6px 8px;
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  background: var(--el-fill-color-darker);
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--el-text-color-regular);
}
</style>