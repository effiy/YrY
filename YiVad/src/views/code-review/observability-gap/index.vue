<script setup lang="ts" name="crObservabilityGapList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["observability-gap"];
</script>
<template>
  <TopicListPage tree="code-review" topic="observability-gap" label="Observability gap" :meta-columns="schema.metaColumns" />
</template>
