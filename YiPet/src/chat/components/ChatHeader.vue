<script setup lang="ts">
import { FullScreen, Close } from '@element-plus/icons-vue';

defineProps<{
  title: string;
  isProcessing: boolean;
  streamingPhase: string;
}>();

const emit = defineEmits<{
  close: [];
  toggleFullscreen: [];
  headerMouseDown: [e: MouseEvent];
}>();
</script>

<template>
  <div
    class="yipet-chat-header"
    role="banner"
    title="Drag to move | Double-click for fullscreen"
    @mousedown="emit('headerMouseDown', $event)"
    @dblclick="emit('toggleFullscreen')"
  >
    <div class="header-inner">
      <div class="header-left">
        <div class="header-brand-dot" />
        <span class="header-title">{{ title }}</span>
        <span v-if="isProcessing" class="header-streaming" :class="`phase-${streamingPhase || 'processing'}`">
          <span class="header-streaming-dot" />
          <span class="header-streaming-label">{{
            streamingPhase === 'retrieving' ? 'Retrieving…' :
            streamingPhase === 'thinking' ? 'Thinking…' :
            streamingPhase === 'streaming' ? 'Writing…' :
            'Processing…'
          }}</span>
        </span>
      </div>
      <div class="header-right">
        <el-button circle size="small" :icon="FullScreen" class="hdr-ctrl-btn" title="Fullscreen" @click="emit('toggleFullscreen')" />
        <el-button circle size="small" :icon="Close" class="hdr-ctrl-btn hdr-close-btn" title="Close" @click="emit('close')" />
      </div>
    </div>
    <div class="header-divider" />
  </div>
</template>

<style lang="scss" scoped>
.yipet-chat-header {
  position: relative;
  display: block;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
  background: var(--yp-gradient-header, var(--header-gradient, linear-gradient(180deg, rgba(99,102,241,0.22) 0%, rgba(15,17,41,0.85) 55%, rgba(24,27,58,0.92) 100%)));
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow: var(--yp-header-glow, var(--header-glow, 0 0 40px rgba(99,102,241,0.12), 0 1px 0 rgba(255,255,255,0.08) inset));
  overflow: hidden;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 12% 50%, rgba(var(--yp-color-primary-rgb, 99,102,241), 0.14), transparent 42%),
      radial-gradient(circle at 88% 20%, rgba(var(--yp-color-accent-rgb, 129,140,248), 0.10), transparent 38%);
    pointer-events: none;
    z-index: 0;
  }
}

.header-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 7px;
  min-height: 40px;
}

.header-divider {
  height: 1px;
  background: var(--yp-header-border, var(--header-border, rgba(129,140,248,0.28)));
  box-shadow: 0 1px 0 rgba(255,255,255,0.02) inset;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.header-brand-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--yp-gradient-primary, var(--primary-gradient, linear-gradient(135deg, #6366f1 0%, #4338ca 100%)));
  box-shadow:
    0 0 0 2px rgba(var(--yp-color-primary-rgb, 99,102,241), 0.16),
    0 0 12px rgba(var(--yp-color-primary-rgb, 99,102,241), 0.55);
  animation: hdr-brand-breathe 3.6s ease-in-out infinite;
}

@keyframes hdr-brand-breathe {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 2px rgba(var(--yp-color-primary-rgb, 99,102,241), 0.16), 0 0 10px rgba(var(--yp-color-primary-rgb, 99,102,241), 0.4); }
  50% { transform: scale(1.12); box-shadow: 0 0 0 2px rgba(var(--yp-color-primary-rgb, 99,102,241), 0.22), 0 0 18px rgba(var(--yp-color-primary-rgb, 99,102,241), 0.7); }
}

.header-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--yp-header-text-primary, var(--header-text-primary, #eef2ff));
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0,0,0,0.25);
}

.header-streaming {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  color: var(--yp-header-accent, var(--header-accent, #a5b4fc));
  background: rgba(var(--yp-color-primary-rgb, 99,102,241), 0.12);
  border: 1px solid rgba(var(--yp-color-primary-rgb, 99,102,241), 0.22);
  backdrop-filter: blur(4px);
  transition: all 0.18s ease;

  &.phase-retrieving {
    color: #38bdf8;
    background: rgba(56,189,248,0.14);
    border-color: rgba(56,189,248,0.28);
  }
  &.phase-thinking {
    color: #f59e0b;
    background: rgba(245,158,11,0.14);
    border-color: rgba(245,158,11,0.28);
  }
  &.phase-streaming {
    color: #22c55e;
    background: rgba(34,197,94,0.14);
    border-color: rgba(34,197,94,0.28);
  }
  &.phase-preparing, &.phase-fetching {
    color: #a78bfa;
    background: rgba(167,139,250,0.14);
    border-color: rgba(167,139,250,0.28);
  }
}

.header-streaming-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: hdr-dot-pulse 1.2s ease-in-out infinite;
  box-shadow: 0 0 8px currentColor;
}

@keyframes hdr-dot-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.78); }
  50% { opacity: 1; transform: scale(1.28); }
}

.header-streaming-label {
  font-family: 'SF Mono', 'Menlo', 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.3px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.hdr-ctrl-btn:deep(.el-button.is-circle) {
  --el-button-bg-color: rgba(255,255,255,0.04);
  --el-button-border-color: rgba(255,255,255,0.06);
  --el-button-text-color: var(--yp-header-text-secondary, var(--header-text-secondary, rgba(199,210,254,0.75)));
  --el-button-hover-bg-color: rgba(var(--yp-color-primary-rgb, 99,102,241), 0.14);
  --el-button-hover-border-color: rgba(var(--yp-color-primary-rgb, 99,102,241), 0.30);
  --el-button-hover-text-color: var(--yp-header-text-primary, var(--header-text-primary, #eef2ff));
  --el-button-active-bg-color: rgba(var(--yp-color-primary-rgb, 99,102,241), 0.22);
  width: 30px;
  height: 30px;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
  }
}

.hdr-close-btn:deep(.el-button.is-circle) {
  --el-button-hover-bg-color: rgba(239, 68, 68, 0.16);
  --el-button-hover-border-color: rgba(239, 68, 68, 0.34);
  --el-button-hover-text-color: #fca5a5;
}

@media (max-width: 480px) {
  .header-inner { padding: 7px 10px 6px; min-height: 36px; }
  .header-title { max-width: 110px; font-size: 12px; }
  .hdr-ctrl-btn:deep(.el-button.is-circle) { width: 28px; height: 28px; }
}
</style>