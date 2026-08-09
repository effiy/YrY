<script setup lang="ts" name="tlrMaturityModelDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["maturity-model"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="maturity-model" label="Maturity Model" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
