<script setup lang="ts" name="crPerfList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["perf"];
</script>
<template>
  <TopicListPage tree="code-review" topic="perf" label="Performance analysis" :meta-columns="schema.metaColumns" />
</template>
