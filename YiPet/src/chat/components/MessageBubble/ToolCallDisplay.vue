<script setup lang="ts">
/**
 * ToolCallDisplay — tool call events timeline (Pi-inspired).
 * Extracted from MessageBubble.vue.
 */
import type { ToolCall } from '../../types';

defineProps<{
  toolCalls: ToolCall[];
}>();

function formatDuration(ms: number): string {
  if (!ms || ms < 1) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function stringifyTruncated(obj: Record<string, unknown>, max = 80): string {
  try {
    const s = JSON.stringify(obj);
    return s.length > max ? s.slice(0, max) + '\u2026' : s;
  } catch {
    return String(obj).slice(0, max);
  }
}

function toolProgressPct(ms: number | undefined): number {
  if (ms == null) return 0;
  const v = Math.min(100, Math.round((ms / 10000) * 100));
  return Math.max(2, v);
}

function toolSpeedClass(ms: number | undefined): string {
  if (ms == null) return 'is-idle';
  if (ms > 5000) return 'is-slow';
  if (ms > 2000) return 'is-mid';
  return 'is-fast';
}

function toolSpeedLabel(ms: number | undefined): string {
  if (ms == null) return 'pending';
  if (ms > 5000) return 'slow';
  if (ms > 2000) return 'mid';
  if (ms < 300) return 'fast';
  return 'ok';
}
</script>

<template>
  <div class="mb-tool-timeline">
    <div class="mb-tool-timeline-label">Tools</div>
    <div class="mb-tool-calls">
      <div
        v-for="(tc, i) in toolCalls"
        :key="`${tc.name}-${i}`"
        class="mb-tool-call"
      >
        <div class="mb-tool-call-header">
          <span class="mb-tool-call-name">{{ tc.label }}</span>
          <span v-if="tc.durationMs" class="mb-tool-call-duration">
            {{ formatDuration(tc.durationMs) }}
          </span>
          <span
            v-if="tc.durationMs && tc.durationMs > 2000"
            class="mb-tool-call-slow"
            :class="{ 'mb-tool-call-slow--very': tc.durationMs > 5000 }"
          >
            {{ tc.durationMs > 5000 ? 'very slow' : 'slow' }}
          </span>
          <span v-if="tc.error" class="mb-tool-call-error">err</span>
        </div>
        <div v-if="tc.durationMs != null" class="mb-tool-prog">
          <div class="mb-tool-prog-bar" :class="toolSpeedClass(tc.durationMs)" :style="`width:${toolProgressPct(tc.durationMs)}%`" />
          <span class="mb-tool-prog-label">{{ toolSpeedLabel(tc.durationMs) }}</span>
        </div>
        <div v-if="tc.args" class="mb-tool-call-args">
          {{ stringifyTruncated(tc.args, 80) }}
        </div>
        <div v-if="tc.content" class="mb-tool-call-content">
          <details>
            <summary>Result ({{ tc.content.length }} chars)</summary>
            <pre>{{ tc.content.slice(0, 1200) }}{{ tc.content.length > 1200 ? '\u2026' : '' }}</pre>
          </details>
        </div>
        <div v-if="tc.error" class="mb-tool-call-errstack">
          <details>
            <summary>Error</summary>
            <pre>{{ tc.error }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mb-tool-timeline { margin-top: 8px; }
.mb-tool-timeline-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}
.mb-tool-calls { display: flex; flex-direction: column; gap: 4px; }
.mb-tool-call {
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 6px;
  padding: 6px 8px;
  background: rgba(99,102,241,.05);
}
.mb-tool-call-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.mb-tool-call-name {
  font-weight: 600;
  color: #c7d2fe;
}
.mb-tool-call-duration {
  font-family: 'SF Mono', monospace;
  font-size: 10px;
  color: #94a3b8;
}
.mb-tool-call-slow {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(251,191,36,.15);
  color: var(--el-color-warning-light-5);
  font-weight: 600;
}
.mb-tool-call-slow--very {
  background: rgba(239,68,68,.15);
  color: #ef4444;
}
.mb-tool-call-error {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(239,68,68,.15);
  color: #ef4444;
  font-weight: 600;
}
.mb-tool-call-args {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 3px;
  font-family: 'SF Mono', monospace;
}
.mb-tool-call-content { margin-top: 4px; }
.mb-tool-call-content summary { cursor: pointer; font-size: 10px; color: #94a3b8; }
.mb-tool-call-content pre {
  font-size: 10px;
  padding: 4px 6px;
  background: rgba(0,0,0,.3);
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 3px;
  color: #d1d5db;
}
.mb-tool-call-errstack { margin-top: 4px; }
.mb-tool-call-errstack summary { cursor: pointer; font-size: 10px; color: var(--el-color-danger-light-3); }
.mb-tool-call-errstack pre {
  font-size: 10px;
  padding: 4px 6px;
  background: rgba(239,68,68,.08);
  color: #fecaca;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 3px;
}

.mb-tool-prog {
  margin-top: 4px; display: flex; align-items: center; gap: 8px;
  position: relative;
  height: 14px;
}
.mb-tool-prog::before {
  content: ''; position: absolute; left: 0; right: 0; top: 3px;
  height: 4px; border-radius: 2px; background: rgba(99,102,241,.12);
}
.mb-tool-prog-bar {
  position: relative;
  top: 0;
  height: 4px;
  border-radius: 2px;
  transition: width .35s ease, background .2s;
  z-index: 1;
  &.is-fast { background: linear-gradient(90deg,#22c55e,#86efac); }
  &.is-mid  { background: linear-gradient(90deg,#eab308,#fde047); }
  &.is-slow { background: linear-gradient(90deg,#ef4444,#fca5a5); }
  &.is-idle { background: rgba(99,102,241,.25); }
}
.mb-tool-prog-label {
  flex-shrink: 0; margin-left: auto;
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .04em;
}
.mb-tool-prog:has(.is-fast) .mb-tool-prog-label { color: var(--el-color-success); }
.mb-tool-prog:has(.is-mid)  .mb-tool-prog-label { color: #eab308; }
.mb-tool-prog:has(.is-slow) .mb-tool-prog-label { color: #ef4444; }
.mb-tool-prog:has(.is-idle) .mb-tool-prog-label { color: var(--el-color-primary); opacity: .7; }
</style>