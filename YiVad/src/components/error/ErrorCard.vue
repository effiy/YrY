<template>
  <div class="error-card">
    <el-result :icon="iconType" :title="title" :sub-title="message">
      <template #extra>
        <el-button v-if="retryable" type="primary" @click="$emit('retry')">
          {{ $t("error.retry") }}
        </el-button>
        <el-button v-if="showGoBack" @click="handleGoBack">
          {{ $t("error.goBack") }}
        </el-button>
        <el-button v-if="showReload" @click="handleReload">
          {{ $t("error.reload") }}
        </el-button>
      </template>
    </el-result>
    <details v-if="showDetails && errorDetail" class="error-details">
      <summary>{{ $t("error.details") }}</summary>
      <pre>{{ errorDetail }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

interface Props {
  title: string;
  message?: string;
  retryable?: boolean;
  showGoBack?: boolean;
  showReload?: boolean;
  showDetails?: boolean;
  errorDetail?: string;
  errorType?: "network" | "server" | "permission" | "notfound" | "unknown";
}

const props = withDefaults(defineProps<Props>(), {
  retryable: false,
  showGoBack: true,
  showReload: true,
  showDetails: import.meta.env.DEV,
  errorType: "unknown",
});

defineEmits<{
  retry: [];
  goBack: [];
}>();

const router = useRouter();

const iconType = computed<"success" | "warning" | "info" | "error">(() => {
  const map: Record<string, "success" | "warning" | "info" | "error"> = {
    network: "warning",
    server: "error",
    permission: "warning",
    notfound: "info",
    unknown: "error",
  };
  return map[props.errorType] || "error";
});

function handleGoBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace("/");
  }
}

function handleReload() {
  window.location.reload();
}
</script>

<style scoped>
.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  min-height: 300px;
}

.error-details {
  margin-top: 16px;
  max-width: 600px;
  width: 100%;
}

.error-details summary {
  cursor: pointer;
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}

.error-details pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>