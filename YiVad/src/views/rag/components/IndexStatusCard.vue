<script setup lang="ts" name="IndexStatusCard">
/**
 * RAG Dashboard — Index Status card.
 * Shows document count, last build time, persist directory, and any errors.
 */
import { DataBoard } from "@element-plus/icons-vue";
import { formatTimestamp } from "@/views/rag/constants";
import type { RagStatusResponse } from "@/api/interface/rag";

defineProps<{
  status: RagStatusResponse;
}>();
</script>

<template>
  <el-card shadow="hover" class="isc-card">
    <template #header>
      <div class="isc-header">
        <span
          ><el-icon><DataBoard /></el-icon> Index Status</span
        >
        <el-tag :type="status.built ? 'success' : 'warning'" size="small" effect="dark">
          {{ status.built ? "HEALTHY" : "NOT BUILT" }}
        </el-tag>
      </div>
    </template>
    <div class="isc-body">
      <div class="isc-row">
        <span class="isc-label">Documents Indexed</span>
        <span class="isc-value">{{ status.num_docs ?? "—" }}</span>
      </div>
      <div class="isc-row">
        <span class="isc-label">Last Built</span>
        <span class="isc-value isc-value--time">{{
          status.last_built_at ? formatTimestamp(status.last_built_at) : "Never"
        }}</span>
      </div>
      <div class="isc-row">
        <span class="isc-label">Persist Directory</span>
        <span class="isc-value isc-value--path">{{ status.persist_dir ?? "—" }}</span>
      </div>
      <div v-if="status.error" class="isc-row isc-row--error">
        <span class="isc-label">Error</span>
        <span class="isc-value">{{ status.error }}</span>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.isc-card {
  .isc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .isc-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
.isc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  line-height: 1.8;
  &--error {
    color: var(--el-color-danger);
  }
}
.isc-label {
  flex-shrink: 0;
  margin-right: 12px;
  color: var(--el-text-color-secondary);
}
.isc-value {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: right;
  &--time {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
  &--path {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}
</style>
