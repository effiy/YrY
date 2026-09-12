<template>
  <slot v-if="!error" />
  <ErrorCard
    v-else
    :title="errorTitle"
    :message="errorMessage"
    :retryable="true"
    :error-detail="errorStack"
    @retry="handleRetry"
  />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";
import ErrorCard from "./ErrorCard.vue";
import { reportError } from "@/utils/errorReporter";

interface Props {
  fallbackTitle?: string;
  componentName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fallbackTitle: "组件加载失败",
});

const error = ref<Error | null>(null);
const errorTitle = ref("");
const errorMessage = ref("");
const errorStack = ref("");

onErrorCaptured((err: unknown, instance, info) => {
  const normalized = err instanceof Error ? err : new Error(String(err));
  error.value = normalized;
  errorTitle.value = props.fallbackTitle;
  errorMessage.value = normalized.message || "未知错误";
  errorStack.value = normalized.stack || "";

  reportError({
    type: "RENDER",
    error: normalized,
    componentName: props.componentName || (instance as any)?.$options?.name || "unknown",
    info,
    timestamp: Date.now(),
  });

  return false;
});

function handleRetry() {
  error.value = null;
  errorTitle.value = "";
  errorMessage.value = "";
  errorStack.value = "";
}
</script>