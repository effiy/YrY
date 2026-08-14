<script setup lang="ts">
/**
 * AgentTimeline — Pi-inspired agent step visualization.
 *
 * Renders the agent's per-turn tool execution timeline as a collapsible
 * inline card within a message bubble. Shows:
 *   - Turn number and status (running / done / error)
 *   - Per-tool entries with name, duration, and result preview
 *   - Streaming phase indicator (thinking / retrieving / streaming)
 *   - Click any tool call to expand full details (args, content, error)
 *
 * High observability: every tool call is surfaced with timing, args, and
 * result so the user can inspect the agent's reasoning chain.
 */
import { computed, ref } from "vue";
import { Loading, WarningFilled, CircleCheckFilled, CopyDocument, Check, Close } from "@element-plus/icons-vue";
import type { ToolCallEntry, AgentStreamingPhase } from "../types";

const props = defineProps<{
  toolCalls: ToolCallEntry[];
  phase?: AgentStreamingPhase;
  turnIndex?: number;
  compact?: boolean;
  usage?: { turnTokens: number; totalTokens: number } | null;
  thinkingText?: string;
}>();

const emit = defineEmits<{
  (e: "toggle-detail", call: ToolCallEntry): void;
}>();

const thinkingExpanded = ref(false);
/** Index of the currently expanded tool call detail, or -1 if none. */
const expandedCallIdx = ref(-1);

function toggleCallDetail(idx: number) {
  expandedCallIdx.value = expandedCallIdx.value === idx ? -1 : idx;
}

const hasRunning = computed(() =>
  props.toolCalls.some((c) => c.content === "(running)")
);

const statusIcon = computed(() => {
  if (hasRunning.value) return Loading;
  if (props.toolCalls.some((c) => c.error)) return WarningFilled;
  return CircleCheckFilled;
});

const statusClass = computed(() => {
  if (hasRunning.value) return "agent-timeline--running";
  if (props.toolCalls.some((c) => c.error)) return "agent-timeline--error";
  return "agent-timeline--done";
});

function formatDuration(ms?: number): string {
  if (ms == null) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatArgs(args?: Record<string, unknown>): string {
  if (!args) return "";
  const entries = Object.entries(args).slice(0, 3);
  return entries.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ");
}

function previewContent(content?: string): string {
  if (!content) return "";
  return content.length > 120 ? content.slice(0, 120) + "..." : content;
}

// ── Capability-tool rich rendering (dsh: todo / skill / ask_user) ──
// These three read-only/planning tools get first-class rendering instead of
// the generic args/JSON dump, so the user reads a checklist, a Q&A pair, or a
// loaded skill name — not a stringified parameter blob.

type CapabilityKind = "todo" | "skill" | "ask";

function capabilityKind(call: ToolCallEntry): CapabilityKind | null {
  if (call.name === "todo_write") return "todo";
  if (call.name === "skill_list" || call.name === "skill_load") return "skill";
  if (call.name === "ask_user") return "ask";
  return null;
}

interface TodoItemShape {
  id: string;
  content: string;
  status: string;
}

function todoItems(call: ToolCallEntry): TodoItemShape[] {
  const raw = call.args?.todos;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is Record<string, unknown> => !!t && typeof t === "object")
    .map(t => ({
      id: String(t.id ?? ""),
      content: String(t.content ?? ""),
      status: String(t.status ?? "pending"),
    }));
}

function askQuestion(call: ToolCallEntry): string {
  return String(call.args?.question ?? "");
}

function askOptions(call: ToolCallEntry): string[] {
  const o = call.args?.options;
  return Array.isArray(o) ? o.map(String) : [];
}

const copiedCallIdx = ref<number | null>(null);
async function copyCallContent(content: string, idx: number) {
  try {
    await navigator.clipboard.writeText(content);
    copiedCallIdx.value = idx;
    setTimeout(() => { if (copiedCallIdx.value === idx) copiedCallIdx.value = null; }, 1500);
  } catch { /* ignore */ }
}
</script>

<template>
  <div class="agent-timeline" :class="statusClass">
    <div class="agent-timeline__header">
      <el-icon :size="14">
        <component :is="statusIcon" />
      </el-icon>
      <span class="agent-timeline__label">
        <template v-if="turnIndex != null">Turn {{ turnIndex }}</template>
        <template v-else>Agent</template>
      </span>
      <span v-if="phase && phase !== 'idle'" class="agent-timeline__phase">
        {{ phase }}
      </span>
      <span class="agent-timeline__count">
        {{ toolCalls.length }} tool{{ toolCalls.length !== 1 ? "s" : "" }}
      </span>
      <span v-if="usage" class="agent-timeline__usage">
        ~{{ usage.turnTokens }} tok
        <span v-if="usage.totalTokens"> / {{ usage.totalTokens }} total</span>
      </span>
    </div>

    <div v-if="!compact" class="agent-timeline__calls">
      <!-- Thinking/reasoning text (Pi: agent's internal reasoning before tool calls) -->
      <div
        v-if="thinkingText"
        class="agent-timeline__thinking"
        :class="{ 'agent-timeline__thinking--expanded': thinkingExpanded }"
        @click="thinkingExpanded = !thinkingExpanded"
      >
        <div class="agent-timeline__thinking-header">
          <span class="agent-timeline__thinking-label">Thinking</span>
          <span class="agent-timeline__thinking-toggle">{{ thinkingExpanded ? '− collapse' : '+ expand' }}</span>
        </div>
        <div v-if="thinkingExpanded" class="agent-timeline__thinking-text">{{ thinkingText }}</div>
      </div>

      <div
        v-for="(call, idx) in toolCalls"
        :key="idx"
        class="agent-timeline__call"
        :class="{
          'agent-timeline__call--running': call.content === '(running)',
          'agent-timeline__call--error': !!call.error,
          'agent-timeline__call--expanded': expandedCallIdx === idx,
        }"
        @click="toggleCallDetail(idx)"
      >
        <div class="agent-timeline__call-header">
          <el-icon :size="12">
            <Loading v-if="call.content === '(running)'" />
            <WarningFilled v-else-if="call.error" />
            <CircleCheckFilled v-else />
          </el-icon>
          <span class="agent-timeline__call-name">{{ call.label }}</span>
          <span v-if="call.durationMs != null" class="agent-timeline__call-duration">
            {{ formatDuration(call.durationMs) }}
          </span>
          <el-icon :size="12" class="agent-timeline__call-chevron">
            <component :is="expandedCallIdx === idx ? Close : Check" />
          </el-icon>
        </div>
        <div v-if="call.args && Object.keys(call.args).length && !capabilityKind(call)" class="agent-timeline__call-args">
          {{ formatArgs(call.args) }}
        </div>

        <!-- Capability-tool rich rendering (todo / ask_user / skill) -->
        <div v-if="capabilityKind(call) === 'todo' && todoItems(call).length" class="agent-timeline__capability">
          <div
            v-for="t in todoItems(call)"
            :key="t.id"
            class="agent-timeline__todo"
            :class="`agent-timeline__todo--${t.status}`"
          >
            <span class="agent-timeline__todo-mark">{{ t.status === "completed" ? "✓" : t.status === "in_progress" ? "▶" : "○" }}</span>
            <span class="agent-timeline__todo-text">{{ t.content }}</span>
          </div>
        </div>
        <div v-else-if="capabilityKind(call) === 'ask'" class="agent-timeline__capability agent-timeline__ask">
          <div class="agent-timeline__ask-q">Q: {{ askQuestion(call) }}</div>
          <div v-if="askOptions(call).length" class="agent-timeline__ask-opts">
            <span v-for="o in askOptions(call)" :key="o" class="agent-timeline__ask-opt">{{ o }}</span>
          </div>
          <div v-if="call.content" class="agent-timeline__ask-a">A: {{ call.content }}</div>
        </div>
        <div v-else-if="capabilityKind(call) === 'skill' && call.args?.name" class="agent-timeline__capability agent-timeline__skill">
          <span class="agent-timeline__skill-label">Skill</span>
          <span class="agent-timeline__skill-name">{{ call.args.name }}</span>
        </div>

        <div v-if="call.error && expandedCallIdx !== idx" class="agent-timeline__call-error">
          {{ call.error }}
        </div>
        <div v-else-if="call.content && call.content !== '(running)' && expandedCallIdx !== idx" class="agent-timeline__call-preview">
          {{ previewContent(call.content) }}
        </div>

        <!-- Expanded detail panel -->
        <div v-if="expandedCallIdx === idx" class="agent-timeline__call-detail" @click.stop>
          <div class="agent-timeline__call-detail-row">
            <span class="agent-timeline__call-detail-label">Duration</span>
            <span class="agent-timeline__call-detail-value">{{ formatDuration(call.durationMs) || "—" }}</span>
          </div>
          <div v-if="call.args && Object.keys(call.args).length" class="agent-timeline__call-detail-row">
            <span class="agent-timeline__call-detail-label">Arguments</span>
            <pre class="agent-timeline__call-detail-code">{{ JSON.stringify(call.args, null, 2) }}</pre>
          </div>
          <div v-if="call.error" class="agent-timeline__call-detail-row">
            <span class="agent-timeline__call-detail-label">Error</span>
            <pre class="agent-timeline__call-detail-code agent-timeline__call-detail-code--error">{{ call.error }}</pre>
          </div>
          <div v-else-if="call.content && call.content !== '(running)'" class="agent-timeline__call-detail-row">
            <div class="agent-timeline__call-detail-label-row">
              <span class="agent-timeline__call-detail-label">Result</span>
              <el-button
                text
                size="small"
                :icon="copiedCallIdx === idx ? Check : CopyDocument"
                class="agent-timeline__call-detail-copy"
                @click.stop="copyCallContent(call.content || '', idx)"
              >
                {{ copiedCallIdx === idx ? "Copied" : "Copy" }}
              </el-button>
            </div>
            <pre class="agent-timeline__call-detail-code">{{ call.content }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.agent-timeline {
  margin: 6px 0;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  overflow: hidden;
  font-size: 12px;

  &--running {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
  &--error {
    border-color: var(--el-color-danger-light-5);
    background: var(--el-color-danger-light-9);
  }
  &--done {
    border-color: var(--el-color-success-light-5);
    background: var(--el-color-success-light-9);
  }
}

.agent-timeline__header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.agent-timeline__phase {
  color: var(--el-color-primary);
  text-transform: capitalize;
}

.agent-timeline__count {
  margin-left: auto;
  font-weight: 400;
  color: var(--el-text-color-placeholder);
}

.agent-timeline__usage {
  font-weight: 400;
  color: var(--el-color-success);
  font-variant-numeric: tabular-nums;
  font-size: 11px;
}

.agent-timeline__calls {
  padding: 2px 0;
}

.agent-timeline__thinking {
  padding: 4px 8px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &--expanded {
    background: var(--el-fill-color-light);
  }
}

.agent-timeline__thinking-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.agent-timeline__thinking-label {
  font-weight: 600;
  color: var(--el-color-info);
}

.agent-timeline__thinking-toggle {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

.agent-timeline__thinking-text {
  margin-top: 4px;
  padding: 6px 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  background: var(--el-bg-color);
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.agent-timeline__call {
  padding: 4px 8px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  & + & {
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  &--running {
    color: var(--el-color-primary);
  }
  &--error {
    color: var(--el-color-danger);
  }
  &--expanded {
    background: var(--el-fill-color-light);
  }
}

.agent-timeline__call-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.agent-timeline__call-name {
  font-weight: 500;
}

.agent-timeline__call-duration {
  margin-left: auto;
  color: var(--el-text-color-placeholder);
  font-size: 11px;
}

.agent-timeline__call-chevron {
  margin-left: 2px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.agent-timeline__call-args {
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-timeline__call-error {
  margin-top: 2px;
  color: var(--el-color-danger);
  font-size: 11px;
}

.agent-timeline__call-preview {
  margin-top: 2px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  word-break: break-word;
}

// ── Capability-tool rich rendering (todo / ask_user / skill) ──
.agent-timeline__capability {
  margin-top: 2px;
}

.agent-timeline__todo {
  display: flex;
  gap: 6px;
  align-items: baseline;

  & + & {
    margin-top: 1px;
  }
}

.agent-timeline__todo-mark {
  flex-shrink: 0;
  width: 12px;
  font-size: 11px;
  text-align: center;
}

.agent-timeline__todo-text {
  font-size: 11px;
  line-height: 1.4;
  word-break: break-word;
}

.agent-timeline__todo--completed .agent-timeline__todo-mark {
  color: var(--el-color-success);
}

.agent-timeline__todo--completed .agent-timeline__todo-text {
  color: var(--el-text-color-placeholder);
  text-decoration: line-through;
}

.agent-timeline__todo--in_progress .agent-timeline__todo-mark {
  color: var(--el-color-primary);
}

.agent-timeline__todo--pending .agent-timeline__todo-mark {
  color: var(--el-text-color-placeholder);
}

.agent-timeline__ask-q {
  font-weight: 500;
  font-size: 11px;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.agent-timeline__ask-opts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.agent-timeline__ask-opt {
  font-size: 10px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 6px;
  border-radius: 3px;
}

.agent-timeline__ask-a {
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.agent-timeline__skill {
  display: flex;
  gap: 6px;
  align-items: center;
}

.agent-timeline__skill-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--el-color-info);
}

.agent-timeline__skill-name {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 11px;
  color: var(--el-text-color-primary);
}

.agent-timeline__call-detail {
  margin-top: 6px;
  padding: 6px;
  background: var(--el-bg-color);
  border-radius: 4px;
  cursor: default;
}

.agent-timeline__call-detail-row {
  & + & {
    margin-top: 6px;
  }
}

.agent-timeline__call-detail-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.agent-timeline__call-detail-label {
  font-weight: 600;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.agent-timeline__call-detail-value {
  font-size: 11px;
  color: var(--el-text-color-regular);
}

.agent-timeline__call-detail-code {
  margin: 2px 0 0;
  padding: 6px;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
  border-radius: 3px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 240px;
  overflow-y: auto;

  &--error {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}

.agent-timeline__call-detail-copy {
  font-size: 11px;
  height: 20px;
  padding: 0 4px;
}
</style>