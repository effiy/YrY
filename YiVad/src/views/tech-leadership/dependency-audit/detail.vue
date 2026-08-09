<script setup lang="ts" name="tlrDependencyAuditDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["dependency-audit"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="dependency-audit" label="Dependency Audit" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
