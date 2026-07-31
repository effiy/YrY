<script setup lang="ts" name="crTestsList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["tests"];
</script>
<template>
  <TopicListPage tree="code-review" topic="tests" label="Generate tests" :meta-columns="schema.metaColumns" />
</template>
