<script setup lang="ts">
import { computed } from "vue";
import { RefreshRight, WarningFilled, Connection, Clock } from "@element-plus/icons-vue";

const props = defineProps<{
  message?: string;
}>();

defineEmits<{
  (e: "retry"): void;
}>();

interface ErrorInfo {
  icon: typeof WarningFilled;
  title: string;
  suggestion: string;
}

const info = computed<ErrorInfo>(() => {
  const msg = (props.message || "").toLowerCase();
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("connect") || msg.includes("econnrefused")) {
    return {
      icon: Connection,
      title: "Connection Failed",
      suggestion: "Check that the YiAi server is running on port 10086. Try starting it with `cd YiAi && python main.py`."
    };
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return {
      icon: Clock,
      title: "Request Timed Out",
      suggestion: "The server is taking too long to respond. This may be due to model loading or heavy load. Try again or switch to a smaller model."
    };
  }
  return {
    icon: WarningFilled,
    title: props.message || "Something went wrong",
    suggestion: "An unexpected error occurred. Your conversation has been saved — try reloading the page."
  };
});
</script>

<template>
  <div class="chat-error">
    <div class="chat-error-card">
      <el-icon class="chat-error-icon" :size="40">
        <component :is="info.icon" />
      </el-icon>
      <h2 class="chat-error-title">{{ info.title }}</h2>
      <p class="chat-error-suggestion">{{ info.suggestion }}</p>
      <div class="chat-error-actions">
        <el-button type="primary" :icon="RefreshRight" @click="$emit('retry')">Retry</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-error {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--el-bg-color-page);
}
.chat-error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
.chat-error-icon {
  color: var(--el-color-danger);
  opacity: 0.8;
}
.chat-error-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.chat-error-suggestion {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
.chat-error-actions {
  margin-top: 8px;
}
</style>