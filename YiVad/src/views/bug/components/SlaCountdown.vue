<template>
  <div
    class="sla-countdown"
    :class="[`sla-countdown--${stateClass}`, { 'sla-countdown--closed': isClosed }]"
    :role="'status'"
    :aria-label="ariaLabel"
  >
    <div class="sla-countdown__header">
      <span class="sla-countdown__label">
        <el-icon><Timer /></el-icon>
        <span>SLA Countdown</span>
      </span>
      <el-tag
        v-if="isClosed"
        size="small"
        type="success"
        effect="dark"
        round
      >Closed</el-tag>
      <el-tag
        v-else-if="state === 'ok'"
        size="small"
        type="success"
        effect="light"
        round
      >Good</el-tag>
      <el-tag
        v-else-if="state === 'warn'"
        size="small"
        type="warning"
        effect="light"
        round
      >Watch</el-tag>
      <el-tag
        v-else-if="state === 'fail'"
        size="small"
        type="danger"
        effect="dark"
        round
      >Breach</el-tag>
      <el-tag
        v-else-if="reopened"
        size="small"
        type="danger"
        effect="plain"
        round
        class="sla-countdown__reopened"
      >Reopened · SLA reset</el-tag>
    </div>

    <div class="sla-countdown__progress">
      <el-progress
        :percentage="percentage"
        :color="barColor"
        :stroke-width="10"
        :show-text="false"
        :indeterminate="state === 'fail' && !isClosed"
      />
      <div class="sla-countdown__progress-ticks">
        <span>{{ formatHours(0) }}</span>
        <span>33%</span>
        <span>66%</span>
        <span>{{ formatHours(slaHours) }}</span>
      </div>
    </div>

    <div class="sla-countdown__body">
      <div class="sla-countdown__remaining">
        <span class="sla-countdown__metric-label">
          {{ isClosed ? "Closed in" : (state === "fail" ? "OVER by" : "Remaining") }}
        </span>
        <span class="sla-countdown__remaining-value" :class="{ 'is-breached': state === 'fail' }">
          {{ remainingLabel }}
        </span>
      </div>
      <div class="sla-countdown__meta">
        <div class="sla-countdown__meta-row">
          <span>Severity</span>
          <el-tag :type="severityTagType(severity)" size="small" effect="dark">{{ severity }}</el-tag>
        </div>
        <div class="sla-countdown__meta-row">
          <span>Limit</span>
          <strong>{{ formatHours(slaHours) }}</strong>
        </div>
        <div class="sla-countdown__meta-row">
          <span>Anchored at</span>
          <span>{{ formatAbsolute(anchorAt) }}</span>
        </div>
        <div class="sla-countdown__meta-row" v-if="reopenedTs">
          <span>Last reopen</span>
          <span class="sla-countdown__reopened">{{ formatAbsolute(reopenedTs) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="SlaCountdown">
import { computed } from "vue";
import { Timer } from "@element-plus/icons-vue";
import type { BugSeverity } from "@/api/modules/bug";
import { severityTagType } from "@/hooks/useTagHelpers";
import { formatAbsolute } from "@/utils/datetime";

interface Props {
  severity: BugSeverity;
  slaHours: number;
  /** Anchor ts for the current SLA window: max(createdAt, lastReopenTs) */
  anchorAt: number;
  /** Resolved/closed ts when the bug is done. */
  closedAt?: number | null;
  /** True if the bug was ever reopened. */
  reopened?: boolean;
  /** Timestamp of last reopen event (if known). */
  reopenedTs?: number | null;
  /** Current tick (useTimestamp output) for reactive updates. */
  now?: number;
}
const props = withDefaults(defineProps<Props>(), {
  closedAt: null,
  reopened: false,
  reopenedTs: null,
  now: () => Date.now(),
});

const isClosed = computed(() => !!props.closedAt);
const endTs = computed(() => (isClosed.value ? props.closedAt! : props.now));
const elapsedMs = computed(() => Math.max(0, endTs.value - props.anchorAt));
const limitMs = computed(() => Math.max(1, props.slaHours * 3600_000));
const usedPct = computed(() => Math.min(200, (elapsedMs.value / limitMs.value) * 100));
const percentage = computed(() => Math.round(Math.min(100, usedPct.value)));

const state = computed<"ok" | "warn" | "fail">(() => {
  if (props.reopened) return "fail";
  if (usedPct.value > 100) return "fail";
  if (usedPct.value >= 66) return "warn";
  return "ok";
});
const stateClass = computed(() => {
  if (isClosed.value) {
    return usedPct.value > 100 ? "fail" : "ok";
  }
  return state.value;
});
const barColor = computed(() => {
  if (state.value === "ok") return "#22c55e";
  if (state.value === "warn") return "#f59e0b";
  return "#ef4444";
});

// Human readable: remaining or over
const remainingLabel = computed(() => {
  let ms: number;
  if (isClosed.value) {
    ms = elapsedMs.value;
  } else if (state.value === "fail") {
    ms = elapsedMs.value - limitMs.value;
  } else {
    ms = limitMs.value - elapsedMs.value;
  }
  return formatDurationMs(ms);
});

const ariaLabel = computed(() => {
  const sev = `${props.severity} severity, limit ${formatHours(props.slaHours)}`;
  const tail = isClosed.value
    ? `Closed in ${formatDurationMs(elapsedMs.value)}${usedPct.value > 100 ? " (breached)" : ""}`
    : state.value === "fail"
      ? `Breached ${formatDurationMs(elapsedMs.value - limitMs.value)} ago`
      : `${formatDurationMs(limitMs.value - elapsedMs.value)} remaining`;
  return `SLA Countdown — ${sev}. ${tail}.${props.reopened ? " Bug was reopened: SLA always breaches." : ""}`;
});

function formatHours(h: number): string {
  if (!Number.isFinite(h)) return "—";
  if (h < 24) return `${h}h`;
  const d = h / 24;
  return Number.isInteger(d) ? `${d}d` : `${d.toFixed(1)}d`;
}
function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const totalMin = Math.floor(ms / 60_000);
  const d = Math.floor(totalMin / (24 * 60));
  const h = Math.floor((totalMin % (24 * 60)) / 60);
  const m = totalMin % 60;
  if (d >= 1) {
    const hh = h === 0 ? "" : `${h}h`;
    return `${d}d ${hh}`.trim();
  }
  if (h >= 1) return `${h}h ${m}m`;
  return `${Math.max(1, m)}m`;
}
</script>

<style lang="scss" scoped>
.sla-countdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.06), rgba(34, 197, 94, 0.01));
  border: 1px solid color-mix(in oklab, #22c55e 28%, transparent);
  transition: all .2s ease;

  &--warn {
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.01));
    border-color: color-mix(in oklab, #f59e0b 32%, transparent);
  }
  &--fail {
    background: linear-gradient(180deg, rgba(239, 68, 68, 0.10), rgba(239, 68, 68, 0.01));
    border-color: color-mix(in oklab, #ef4444 35%, transparent);
  }
  &--closed {
    background: linear-gradient(180deg, rgba(100, 116, 139, 0.08), rgba(100, 116, 139, 0.01));
    border-color: color-mix(in oklab, #64748b 30%, transparent);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .15px;
    color: var(--el-text-color-secondary);
  }
  &__label {
    display: inline-flex; align-items: center; gap: 4px;
    color: var(--el-text-color-primary);
  }
  &__reopened {
    color: var(--el-color-danger, #ef4444);
  }

  &__progress {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  &__progress-ticks {
    display: flex; justify-content: space-between;
    font-size: 10px; color: var(--el-text-color-placeholder); font-weight: 500;
    letter-spacing: .2px;
    opacity: .85;
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 10px;
    align-items: center;
    @media (max-width: 640px) { grid-template-columns: 1fr; }
  }
  &__remaining {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  &__metric-label {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    letter-spacing: .4px;
    text-transform: uppercase;
  }
  &__remaining-value {
    font-size: 22px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    line-height: 1.1;
    letter-spacing: -.3px;

    &.is-breached {
      color: var(--el-color-danger);
      text-shadow: 0 0 12px rgba(239, 68, 68, 0.18);
    }
  }
  &__meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 10px;
    font-size: 11.5px;
    color: var(--el-text-color-regular);
    border-left: 1px dashed var(--el-border-color-lighter);
    padding-left: 12px;
    @media (max-width: 640px) { border-left: none; padding-left: 0; }
  }
  &__meta-row {
    display: flex; justify-content: space-between; align-items: center;
    span:first-child { color: var(--el-text-color-placeholder); }
  }
}
</style>
