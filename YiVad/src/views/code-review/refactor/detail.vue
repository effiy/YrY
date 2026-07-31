<script setup lang="ts" name="crRefactorDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("refactor")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="refactor" :label="config.label" :template-content="config.content" />
</template>
