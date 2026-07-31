<script setup lang="ts" name="tlrDoraMetricsList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["dora-metrics"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="dora-metrics" label="DORA Metrics" :meta-columns="schema.metaColumns" />
</template>
