<script setup lang="ts" name="crObservabilityGapDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["observability-gap"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="observability-gap" label="Observability gap" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
