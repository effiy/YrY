<script setup lang="ts" name="crSummaryDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("summary")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="summary" :label="config.label" :template-content="config.content" />
</template>
