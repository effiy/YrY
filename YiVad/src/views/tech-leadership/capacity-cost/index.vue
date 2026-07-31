<script setup lang="ts" name="tlrCapacityCostList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["capacity-cost"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="capacity-cost" label="Capacity & Cost (FinOps)" :meta-columns="schema.metaColumns" />
</template>
