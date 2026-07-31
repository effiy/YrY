<script setup lang="ts" name="tlrMaturityModelList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["maturity-model"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="maturity-model" label="Maturity Model" :meta-columns="schema.metaColumns" />
</template>
