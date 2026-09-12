<script setup lang="ts" name="RetrievalConfigCard">
/**
 * RAG Dashboard — Retrieval Configuration card.
 * Displays embed model, LLM, chunk settings, hybrid/rerank/citation toggles.
 */
import { Setting } from "@element-plus/icons-vue";
import { INDEX_INFO_FIELDS } from "@/views/rag/meta-schemas";

defineProps<{
  indexInfo: Record<string, any>;
}>();
</script>

<template>
  <el-card shadow="hover" class="rcc-card">
    <template #header>
      <span><el-icon><Setting /></el-icon> Retrieval Configuration</span>
    </template>
    <div class="rcc-body">
      <div v-for="field in INDEX_INFO_FIELDS" :key="field.key" class="rcc-row">
        <span class="rcc-label">{{ field.label }}</span>
        <template v-if="field.format === 'tag' || field.format === 'boolean-tag'">
          <el-tag
            size="small"
            :type="(field.tagMap?.[String(indexInfo[field.key])]?.type || 'info') as any"
          >
            {{ field.tagMap?.[String(indexInfo[field.key])]?.label ?? indexInfo[field.key] }}
          </el-tag>
        </template>
        <template v-else>
          <span class="rcc-value">{{ indexInfo[field.key] ?? "—" }}</span>
        </template>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.rcc-card {
  .rcc-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
.rcc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  line-height: 1.8;
}
.rcc-label {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  margin-right: 12px;
}
.rcc-value {
  text-align: right;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
</style>
