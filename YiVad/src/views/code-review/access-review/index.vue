<script setup lang="ts" name="crAccessReviewList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["access-review"];
</script>
<template>
  <TopicListPage tree="code-review" topic="access-review" label="Access review" :meta-columns="schema.metaColumns" />
</template>
