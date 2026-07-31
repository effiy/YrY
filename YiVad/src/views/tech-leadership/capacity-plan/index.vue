<script setup lang="ts" name="tlrCapacityPlanList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["capacity-plan"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="capacity-plan" label="Capacity Planning" :meta-columns="schema.metaColumns" />
</template>
