<script setup lang="ts" name="tlrOncallHandoverDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["oncall-handover"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="oncall-handover" label="Oncall Handover" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
