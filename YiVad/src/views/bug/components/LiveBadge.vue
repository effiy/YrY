<template>
  <el-tooltip
    effect="dark"
    placement="bottom"
    :show-after="350"
  >
    <template #content>
      <div class="live-badge__tip" role="dialog" aria-label="Live update status detail">
        <div class="live-badge__tip-row">
          <span class="live-badge__tip-label">Connection</span>
          <strong :class="`live-badge__status--${state}`">{{ stateLabel }}</strong>
        </div>
        <div v-if="state !== 'offline'" class="live-badge__tip-row">
          <span class="live-badge__tip-label">Last push</span>
          <span>{{ lastDataLabel }}</span>
        </div>
        <div class="live-badge__tip-row">
          <span class="live-badge__tip-label">Poll fallback</span>
          <span>every {{ Math.round(pollSeconds) }}s</span>
        </div>
        <div v-if="retryAttempts > 0" class="live-badge__tip-row">
          <span class="live-badge__tip-label">Retries</span>
          <span>{{ retryAttempts }}</span>
        </div>
        <div v-if="finalErr" class="live-badge__tip-row live-badge__tip-row--err">
          <span class="live-badge__tip-label">Error</span>
          <span>{{ finalErr }}</span>
        </div>
        <div class="live-badge__tip-foot">
          Click the refresh button to pull immediately.
        </div>
      </div>
    </template>

    <div
      class="live-badge"
      :class="[`live-badge--${state}`, { 'live-badge--stale': isStale }]"
      :role="'status'"
      :aria-label="ariaLabel"
    >
      <span class="live-badge__dot" aria-hidden="true"></span>
      <span class="live-badge__label">{{ stateLabel }}</span>
      <el-button
        v-if="showRefresh"
        class="live-badge__refresh"
        :icon="Refresh"
        circle
        size="small"
        text
        type="primary"
        aria-label="Refresh bug data now"
        @click="$emit('refresh')"
      />
    </div>
  </el-tooltip>
</template>

<script setup lang="ts" name="LiveBadge">
import { computed } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { formatRelativeTime } from "@/utils/datetime";

type LiveState = "live" | "poll" | "offline";

interface Props {
  /** SSE / streaming connection actually alive & pushing. */
  sseConnected?: boolean;
  /** SSE-level error message (if any). */
  sseError?: string | null;
  /** Timestamp (ms) of the most recent data update — used for "Last push" label. */
  lastDataAt?: number | null;
  /** Poll interval seconds. 60 by default. */
  pollSeconds?: number;
  /** When the data is older than this (seconds), mark the badge with a stale warning. */
  staleAfterSeconds?: number;
  /** SSE retry / reconnect attempts (shown when >0). */
  retryAttempts?: number;
  /** If false, hide the circular refresh button (when the page already exposes one). */
  showRefresh?: boolean;
  /** Timestamp (ms) for "relative to now" formatting. Accepts a reactive useTimestamp. */
  now?: number;
  /** Alias for sseError (the caller may pass sseError directly; errorMessage accepts same). */
  errorMessage?: string | null;
}
const props = withDefaults(defineProps<Props>(), {
  sseConnected: false,
  sseError: null,
  lastDataAt: null,
  pollSeconds: 60,
  staleAfterSeconds: 300,
  retryAttempts: 0,
  showRefresh: true,
  now: () => Date.now(),
  errorMessage: null,
});

defineEmits<{
  (e: "refresh"): void;
}>();

const state = computed<LiveState>(() => {
  if (props.sseConnected && !props.sseError) return "live";
  if (props.lastDataAt || !props.sseError) return "poll";
  return "offline";
});
const finalErr = computed<string | null>(() => {
  const v = props.errorMessage ?? props.sseError ?? null;
  return v ? String(v) : null;
});
const stateLabel = computed(() => {
  if (state.value === "live") return "● LIVE";
  if (state.value === "poll") return `⟳ POLL ${Math.round(props.pollSeconds)}s`;
  return "⚠ OFFLINE";
});
const isStale = computed(() => {
  if (!props.lastDataAt) return false;
  return (props.now - props.lastDataAt) / 1000 > props.staleAfterSeconds;
});
const lastDataLabel = computed(() =>
  props.lastDataAt ? formatRelativeTime(props.lastDataAt, props.now) : "—"
);
const ariaLabel = computed(() =>
  `Data update status: ${state.value}. ${state.value === "live" ? "Streaming updates are active." : state.value === "poll" ? `Polling every ${Math.round(props.pollSeconds)} seconds.` : "Connection lost; updates paused."} ${isStale.value ? "Data is stale." : ""}`
);
</script>

<style lang="scss" scoped>
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  border: 1px solid var(--md-sys-color-outline-variant, rgba(148, 153, 163, .28));
  background: var(--md-sys-color-surface-container, var(--el-bg-color-page, #fafafa));
  transition: all .2s ease;
  user-select: none;

  &--live {
    color: var(--md-sys-color-primary, #16a34a);
    border-color: color-mix(in oklab, var(--md-sys-color-primary, #16a34a) 30%, transparent);
    background: color-mix(in oklab, var(--md-sys-color-primary, #16a34a) 8%, transparent);
  }
  &--poll {
    color: var(--md-sys-color-secondary, #2563eb);
    border-color: color-mix(in oklab, var(--md-sys-color-secondary, #2563eb) 30%, transparent);
    background: color-mix(in oklab, var(--md-sys-color-secondary, #2563eb) 8%, transparent);
  }
  &--offline {
    color: var(--md-sys-color-error, #dc2626);
    border-color: color-mix(in oklab, var(--md-sys-color-error, #dc2626) 30%, transparent);
    background: color-mix(in oklab, var(--md-sys-color-error, #dc2626) 8%, transparent);
  }

  &--stale {
    outline: 2px dashed color-mix(in oklab, #f59e0b 55%, transparent);
    outline-offset: 1px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    background: currentColor;
    animation: live-badge-pulse 1.6s ease-in-out infinite;
  }
  &--poll &__dot { animation-duration: 3.2s; opacity: .7; }
  &--offline &__dot { animation: none; }

  &__label { letter-spacing: .2px; }
  &__refresh { margin-left: 2px; padding: 0 !important; }

  &__tip {
    min-width: 220px;
    font-size: 12px;
    line-height: 1.6;
    &-row {
      display: flex; justify-content: space-between; gap: 12px;
      padding: 2px 0;
      + & { border-top: 1px dashed rgba(148, 163, 184, .25); margin-top: 4px; padding-top: 6px; }
    }
    &-row--err { color: #fecaca; font-weight: 500; }
    &-label { color: #cbd5e1; opacity: .85; }
    &-foot { margin-top: 8px; color: #94a3b8; font-size: 11px; }
  }
}

@keyframes live-badge-pulse {
  0%   { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
  70%  { box-shadow: 0 0 0 6px color-mix(in oklab, currentColor 0%, transparent); opacity: .85; }
  100% { box-shadow: 0 0 0 0 transparent; opacity: 1; }
}
</style>
