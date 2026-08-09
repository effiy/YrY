<script setup lang="ts" name="tlrRiskRegisterDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["risk-register"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="risk-register" label="Risk Register" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
