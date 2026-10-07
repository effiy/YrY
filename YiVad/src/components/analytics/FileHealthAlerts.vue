<script setup lang="ts" name="analyticsFileHealthAlerts">
import { ref, onMounted, watch } from "vue";
import { WarningFilled, Document, Folder, Clock } from "@element-plus/icons-vue";
import { getFileAlerts } from "@/api/modules/analyticsService";
import type { FileAlertsResponse } from "@/types/analytics";

const props = defineProps<{ project_key?: string }>();

const data = ref<FileAlertsResponse | null>(null);
const loading = ref(false);
const error = ref("");

const domainLabels: Record<string, string> = {
  knowledge: "Knowledge",
  data: "Modules",
  code: "Code",
};

async function fetch() {
  loading.value = true;
  error.value = "";
  try {
    data.value = await getFileAlerts({ project_key: props.project_key || undefined });
  } catch (e: any) {
    error.value = e?.message || "Failed to load file alerts";
  } finally {
    loading.value = false;
  }
}

onMounted(fetch);
watch(() => props.project_key, fetch);
</script>

<template>
  <div class="file-health-alerts" v-loading="loading">
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb16" />

    <template v-if="data">
      <!-- Summary strip -->
      <div class="fha-summary">
        <div class="fha-summary__item fha-summary__item--critical">
          <span class="fha-summary__count">{{ data.summary.critical }}</span>
          <span class="fha-summary__label">Critical</span>
        </div>
        <div class="fha-summary__item fha-summary__item--warning">
          <span class="fha-summary__count">{{ data.summary.warning }}</span>
          <span class="fha-summary__label">Warnings</span>
        </div>
        <div class="fha-summary__item">
          <span class="fha-summary__count">{{ data.summary.info }}</span>
          <span class="fha-summary__label">Info</span>
        </div>
      </div>

      <!-- By domain -->
      <div class="fha-kinds" v-if="data.alerts.length">
        <div
          v-for="domain in ['knowledge', 'data', 'code']"
          :key="domain"
          class="fha-kind-chip"
        >
          <template v-if="data.alerts.filter(a => a.domain === domain).length">
            {{ domainLabels[domain] }}: {{ data.alerts.filter(a => a.domain === domain).length }}
          </template>
        </div>
      </div>

      <!-- Alert list -->
      <div class="fha-list" v-if="data.alerts.length">
        <div
          v-for="alert in data.alerts.slice(0, 15)"
          :key="`${alert.domain}-${alert.title}`"
          class="fha-item"
          :class="`fha-item--${alert.severity}`"
        >
          <div class="fha-item__icon">
            <el-icon v-if="alert.domain === 'knowledge'"><Document /></el-icon>
            <el-icon v-else-if="alert.domain === 'code'"><Folder /></el-icon>
            <el-icon v-else><Clock /></el-icon>
          </div>
          <div class="fha-item__body">
            <div class="fha-item__header">
              <span class="fha-item__title">{{ alert.title }}</span>
              <span class="fha-item__domain">{{ domainLabels[alert.domain] || alert.domain }}</span>
            </div>
            <div class="fha-item__msg">{{ alert.description }}</div>
            <div v-if="alert.suggestion" class="fha-item__suggestion">{{ alert.suggestion }}</div>
          </div>
          <span class="fha-item__count">{{ alert.count }}</span>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!data.alerts.length && !loading" class="fha-empty">
        <el-icon :size="32"><WarningFilled /></el-icon>
        <span>No file health issues detected</span>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.file-health-alerts {
  min-height: 120px;
}

.fha-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    background: var(--el-fill-color-light);

    &--critical {
      background: rgba(245,108,108,.08);
      .fha-summary__count { color: #f56c6c; }
    }
    &--warning {
      background: rgba(230,162,60,.08);
      .fha-summary__count { color: #e6a23c; }
    }
  }

  &__count {
    font-size: 24px;
    font-weight: 700;
  }

  &__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.fha-kinds {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.fha-kind-chip {
  padding: 3px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.fha-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fha-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid var(--el-border-color);

  &--critical {
    border-left-color: #f56c6c;
    background: rgba(245,108,108,.04);
  }
  &--warning {
    border-left-color: #e6a23c;
    background: rgba(230,162,60,.04);
  }
  &--info {
    border-left-color: #909399;
  }

  &__icon {
    padding-top: 2px;
    color: var(--el-text-color-secondary);
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__domain {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    white-space: nowrap;
  }

  &__msg {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__suggestion {
    margin-top: 2px;
    font-size: 11px;
    color: var(--el-color-primary);
    font-style: italic;
  }

  &__count {
    font-family: DIN, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
  }
}

.fha-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.mb16 { margin-bottom: 16px; }
</style>