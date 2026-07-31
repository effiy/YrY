<script setup lang="ts" name="crExplainList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["explain"];
</script>
<template>
  <TopicListPage tree="code-review" topic="explain" label="Explain the logic" :meta-columns="schema.metaColumns" />
</template>
