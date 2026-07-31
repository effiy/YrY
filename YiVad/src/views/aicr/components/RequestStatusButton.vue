<script setup lang="ts" name="aicrRequestStatusButton">
import { computed } from "vue";
import { VideoPause } from "@element-plus/icons-vue";

const props = defineProps<{
  sending: boolean;
  streamingType?: "" | "send" | "regenerate" | "resend";
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "stop"): void;
}>();

const title = computed(() => {
  if (props.sending) {
    const t = props.streamingType || "send";
    const labelMap: Record<string, string> = {
      send: "Sending",
      regenerate: "Regenerating",
      resend: "Resending"
    };
    return `Request status: ${labelMap[t] || "Sending"} (click to stop)`;
  }
  return "Request status: idle";
});
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
  </button>
</template>

<style scoped lang="scss">
.rs-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  user-select: none;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 14px;
  transition: all 0.15s;
}
.rs-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.rs-btn--idle {
  color: var(--el-text-color-placeholder);
}
.rs-btn--active {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger);
  animation: rs-pulse 1.4s ease-in-out infinite;
}
.rs-btn--active:hover {
  background: var(--el-color-danger-light-7);
}

@keyframes rs-pulse {
  0%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
}
.rs-icon {
  flex-shrink: 0;
}
</style>
