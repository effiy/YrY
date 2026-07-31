<script setup lang="ts" name="crSecurityDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("security")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="security" :label="config.label" :template-content="config.content" />
</template>
