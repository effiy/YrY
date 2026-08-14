<template>
  <div class="card content-box">
    <span class="text">RagSources Demo</span>
    <el-alert
      title="RagSources renders RAG source citations under chat messages. Clicking a source chip expands an inline snippet preview with the full markdown content."
      type="warning"
      :closable="false"
    />
    <RagSources :sources="sampleSources" />
    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="sources">RagSource[] — array of source documents</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="RagSource Interface" :column="1" border class="mt30">
      <el-descriptions-item label="file_path">string — source file path</el-descriptions-item>
      <el-descriptions-item label="score">number — relevance score (0-1)</el-descriptions-item>
      <el-descriptions-item label="text">string — snippet text</el-descriptions-item>
      <el-descriptions-item label="metadata">Record — additional metadata</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoRagSources">
import RagSources from "@/components/RagSources.vue";
import type { RagSource } from "@/api/interface/rag";

const sampleSources: RagSource[] = [
  {
    file_path: "YiKnowledge/engineer/projects/yivad/architecture.md",
    score: 0.92,
    text: "YiVad follows a component-extraction architecture. The Vue 3.5 admin dashboard uses ProTable as the canonical table pattern with dynamic routing and four layout modes.",
  },
  {
    file_path: "YiKnowledge/engineer/projects/yivad/dev-standards.md",
    score: 0.85,
    text: "All new pages must use `<script setup lang=\"ts\">` with Composition API. No Options API. Use `defineProps` and `defineEmits` with type generics.",
  },
  {
    file_path: "YiKnowledge/leader/decisions/yivad/vitest-introduction.md",
    score: 0.78,
    text: "Vitest was introduced as the testing framework for YiVad. Test coverage will become a priority for critical paths.",
  },
];
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>