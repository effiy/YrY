<script setup lang="ts" name="crDependencyRiskList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["dependency-risk"];
</script>
<template>
  <TopicListPage tree="code-review" topic="dependency-risk" label="Dependency risk" :meta-columns="schema.metaColumns" />
</template>
