<script setup lang="ts" name="crBugsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("bugs")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="bugs" :label="config.label" :template-content="config.content" />
</template>
