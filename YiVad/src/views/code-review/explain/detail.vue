<script setup lang="ts" name="crExplainDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("explain")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="explain" :label="config.label" :template-content="config.content" />
</template>
