<script setup lang="ts" name="crPerfDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("perf")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="perf" :label="config.label" :template-content="config.content" />
</template>
