<script setup lang="ts" name="crApiContractDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["api-contract"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="api-contract" label="API contract check" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
