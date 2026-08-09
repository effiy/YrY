<script setup lang="ts" name="crSummaryDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["summary"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="summary" label="Summarize this file" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related>
    </template>
  </TopicDetailPage>
</template>
