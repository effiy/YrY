<script setup lang="ts" name="crDependencyRiskDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("dependency_risk")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="dependency_risk" :label="config.label" :template-content="config.content" />
</template>
