<script setup lang="ts" name="crApiContractDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { findTopicConfig } from "@/views/code-review/constants";

const config = findTopicConfig("api_contract")!;
</script>

<template>
  <TopicDetailPage tree="code-review" topic="api_contract" :label="config.label" :template-content="config.content" />
</template>
