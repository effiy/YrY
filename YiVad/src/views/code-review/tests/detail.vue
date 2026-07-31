<script setup lang="ts" name="crTestsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("tests")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="tests" :label="config.label" :template-content="config.content" />
</template>
