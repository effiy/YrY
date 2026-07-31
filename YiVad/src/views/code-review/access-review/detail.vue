<script setup lang="ts" name="crAccessReviewDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("access_review")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="access_review" :label="config.label" :template-content="config.content" />
</template>
