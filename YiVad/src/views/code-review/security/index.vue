<script setup lang="ts" name="crSecurityList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["security"];
</script>
<template>
  <TopicListPage tree="code-review" topic="security" label="Security review" :meta-columns="schema.metaColumns" />
</template>
