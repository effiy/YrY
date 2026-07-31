<script setup lang="ts" name="crDependencyRiskDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["dependency-risk"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="dependency-risk" label="Dependency risk" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
