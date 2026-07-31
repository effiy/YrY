<script setup lang="ts" name="tlrRiskRegisterList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["risk-register"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="risk-register" label="Risk Register" :meta-columns="schema.metaColumns" />
</template>
