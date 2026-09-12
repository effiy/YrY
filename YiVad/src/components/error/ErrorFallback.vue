<template>
  <div class="error-fallback">
    <div class="error-fallback-content">
      <el-result icon="error" :title="title" :sub-title="message">
        <template #extra>
          <el-button type="primary" @click="handleReload">
            {{ $t("error.reload") }}
          </el-button>
          <el-button @click="handleGoHome">
            {{ $t("error.goHome") }}
          </el-button>
        </template>
      </el-result>
      <details v-if="showDetails" class="error-fallback-details">
        <summary>{{ $t("error.technicalDetails") }}</summary>
        <pre>{{ errorDetail }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { HOME_URL } from "@/config";

interface Props {
  title?: string;
  message?: string;
  error?: Error | null;
}

const props = withDefaults(defineProps<Props>(), {
  title: "页面发生错误",
  message: "抱歉，页面遇到了意外错误。请尝试刷新页面。",
  error: null,
});

const router = useRouter();

const showDetails = import.meta.env.DEV;

const errorDetail = computed(() => {
  if (!props.error) return "";
  return props.error.stack || props.error.message || "";
});

function handleReload() {
  window.location.reload();
}

function handleGoHome() {
  router.replace(HOME_URL);
}
</script>

<style scoped>
.error-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48px 24px;
  background: var(--el-bg-color-page, #f5f5f5);
}

.error-fallback-content {
  max-width: 520px;
  width: 100%;
}

.error-fallback-details {
  margin-top: 16px;
}

.error-fallback-details summary {
  cursor: pointer;
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}

.error-fallback-details pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>