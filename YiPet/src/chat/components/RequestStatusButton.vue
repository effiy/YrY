<script setup lang="ts">
/**
 * YiPet Chat — RequestStatusButton (Vue 3 SFC)
 */
import { computed } from 'vue';

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
    :class="sending ? 'rs-btn--active' : 'rs-btn--idle'"
    :title="title"
    :aria-label="title"
    :disabled="!sending && disabled"
    @click="$emit('stop')"
  >
    <span class="rs-icon">⏸</span>
    <span class="rs-label">{{ label }}</span>
  </button>
</template>

<style lang="scss" scoped>
.rs-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;

  &--idle {
    background: transparent;
    color: var(--text-secondary, #d4d0e8);
    border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  }

  &--active {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
    color: var(--primary-light, #818cf8);
    border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.4);
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.rs-icon { font-size: 14px; }
.rs-label { font-weight: 500; }
</style>