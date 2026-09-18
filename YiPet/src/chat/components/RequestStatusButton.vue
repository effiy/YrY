<script setup lang="ts">
/**
 * YiPet Chat — RequestStatusButton (Vue 3 SFC)
 * Mirrors YiVad aiChat: VideoPause icon, pulse animation, pill styling.
 */
import { computed } from 'vue';
import { VideoPause } from '@element-plus/icons-vue';

const props = defineProps<{
  sending: boolean;
  streamingType?: '' | 'send' | 'regenerate' | 'resend';
  disabled?: boolean;
}>();

defineEmits<{ stop: [] }>();

const labelMap: Record<string, string> = { send: 'Sending', regenerate: 'Regenerating', resend: 'Resending' };

const title = computed(() =>
  props.sending
    ? `Request status: ${labelMap[props.streamingType || 'send'] || 'Sending'} (click to stop)`
    : 'Request status: idle',
);

const label = computed(() => (props.sending ? 'Stop' : 'Idle'));
</script>

<template>
  <button
    type="button"
    class="rs-btn"
    :class="{ 'rs-btn--active': sending, 'rs-btn--idle': !sending }"
    :title="title"
    :aria-label="title"
    :disabled="!sending && disabled"
    @click="emit('stop')"
  >
    <el-icon :size="14" class="rs-icon"><VideoPause /></el-icon>
    <span class="rs-label">{{ label }}</span>
  </button>
</template>

<style lang="scss" scoped>
.rs-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  background: transparent;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  border-radius: 14px;
  color: var(--text-secondary, #d4d0e8);
  transition: all 0.15s;
}

.rs-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.rs-btn--idle {
  color: var(--text-secondary, #d4d0e8);
  &:hover {
    border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.35);
    color: var(--text-primary, #f5f3ff);
  }
}

.rs-btn--active {
  color: var(--el-color-danger, #ff4d4f);
  background: rgba(255, 77, 79, 0.12);
  border-color: rgba(255, 77, 79, 0.4);
  animation: rs-pulse 1.4s ease-in-out infinite;

  &:hover {
    background: rgba(255, 77, 79, 0.2);
    border-color: rgba(255, 77, 79, 0.6);
  }
}

@keyframes rs-pulse {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}

.rs-icon {
  flex-shrink: 0;
}

.rs-label {
  line-height: 1;
}
</style>