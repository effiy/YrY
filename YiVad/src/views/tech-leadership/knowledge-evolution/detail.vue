<script setup lang="ts" name="tlrKnowledgeEvolutionDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["knowledge-evolution"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="knowledge-evolution" label="Knowledge Evolution" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
