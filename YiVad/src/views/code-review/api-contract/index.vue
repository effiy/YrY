<script setup lang="ts" name="crApiContractList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["api-contract"];
</script>
<template>
  <TopicListPage tree="code-review" topic="api-contract" label="API contract check" :meta-columns="schema.metaColumns" />
</template>
