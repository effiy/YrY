<script setup lang="ts" name="tlrDoraMetricsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["dora-metrics"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="dora-metrics" label="DORA Metrics" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
