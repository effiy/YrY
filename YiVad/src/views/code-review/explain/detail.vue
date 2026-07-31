<script setup lang="ts" name="crExplainDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["explain"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="explain" label="Explain the logic" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
