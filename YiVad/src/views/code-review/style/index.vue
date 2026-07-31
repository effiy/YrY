<script setup lang="ts" name="crStyleList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["style"];
</script>
<template>
  <TopicListPage tree="code-review" topic="style" label="Naming & style" :meta-columns="schema.metaColumns" />
</template>
