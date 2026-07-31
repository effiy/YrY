<script setup lang="ts" name="tlrDependencyAuditList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["dependency-audit"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="dependency-audit" label="Dependency Audit" :meta-columns="schema.metaColumns" />
</template>
