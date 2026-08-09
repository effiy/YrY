<script setup lang="ts" name="tlrCapacityPlanDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["capacity-plan"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="capacity-plan" label="Capacity Planning" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
