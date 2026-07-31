<script setup lang="ts" name="crObservabilityGapDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("observability_gap")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="observability_gap" :label="config.label" :template-content="config.content" />
</template>
