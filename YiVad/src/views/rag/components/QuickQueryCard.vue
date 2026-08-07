<script setup lang="ts" name="QuickQueryCard">
/**
 * RAG Dashboard — Quick Query card.
 * Inline semantic search over the knowledge base with top-3 result preview.
 */
import { ref } from "vue";
import { Opportunity } from "@element-plus/icons-vue";
import { useRagQuery } from "@/views/rag/composables/useRagQuery";
import { scoreLabel, scoreTagType, truncateText } from "@/views/rag/constants";

const props = defineProps<{
  disabled: boolean;
}>();

const question = ref("");
const { querying, sources, execute } = useRagQuery();

async function run() {
  if (!question.value.trim()) return;
  await execute(question.value, 5);
}
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <span><el-icon><Opportunity /></el-icon> Quick Query</span>
    </template>
    <div class="qqc-body">
      <el-input
        v-model="question"
        placeholder="Ask a quick question..."
        @keyup.enter.ctrl="run"
        :disabled="disabled"
      />
      <el-button
        type="primary"
        :loading="querying"
        @click="run"
        :disabled="disabled || !question.trim()"
        class="qqc-run-btn"
      >
        {{ querying ? "Retrieving..." : "Search Knowledge Base" }}
      </el-button>
      <div v-if="sources.length" class="qqc-results">
        <div class="qqc-results__title">
          Top {{ sources.length }} results
          <span class="qqc-results__best">(best: {{ scoreLabel(sources[0].score) }})</span>
        </div>
        <div v-for="(s, i) in sources.slice(0, 3)" :key="i" class="qqc-result">
          <div class="qqc-result__header">
            <el-tag size="small" :type="scoreTagType(s.score)">{{ scoreLabel(s.score) }}</el-tag>
            <span class="qqc-result__path">{{ s.file_path }}</span>
          </div>
          <p class="qqc-result__text">{{ truncateText(s.text, 120) }}</p>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.qqc-body {
  display: flex;
  flex-direction: column;
}
.qqc-run-btn {
  margin-top: 12px;
  width: 100%;
}
.qqc-results {
  margin-top: 12px;
  &__title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--el-text-color-primary);
  }
  &__best {
    font-weight: 400;
    color: var(--el-color-success);
  }
}
.qqc-result {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  &:last-child { border-bottom: none; }
  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  &__path {
    font-size: 12px;
    color: var(--el-color-primary);
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__text {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
}
</style>
