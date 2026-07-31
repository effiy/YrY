<script setup lang="ts" name="tlrTechDebtDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["tech-debt"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="tech-debt" label="Tech Debt" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
