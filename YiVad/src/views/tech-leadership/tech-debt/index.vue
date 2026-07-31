<script setup lang="ts" name="tlrTechDebtList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["tech-debt"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="tech-debt" label="Tech Debt" :meta-columns="schema.metaColumns" />
</template>
