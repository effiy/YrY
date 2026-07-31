<script setup lang="ts" name="tlrCapacityCostDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["capacity-cost"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="capacity-cost" label="Capacity & Cost (FinOps)" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
