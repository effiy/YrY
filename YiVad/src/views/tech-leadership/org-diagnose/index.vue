<script setup lang="ts" name="tlrOrgDiagnoseList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["org-diagnose"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="org-diagnose" label="Org Diagnose" :meta-columns="schema.metaColumns" />
</template>
