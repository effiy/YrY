<script setup lang="ts" name="crRefactorList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["refactor"];
</script>
<template>
  <TopicListPage tree="code-review" topic="refactor" label="Refactor suggestions" :meta-columns="schema.metaColumns" />
</template>
