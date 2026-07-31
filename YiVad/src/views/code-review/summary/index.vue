<script setup lang="ts" name="crSummaryList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["summary"];
</script>
<template>
  <TopicListPage tree="code-review" topic="summary" label="Summarize this file" :meta-columns="schema.metaColumns" />
</template>
