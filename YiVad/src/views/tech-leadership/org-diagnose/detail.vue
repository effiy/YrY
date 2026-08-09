<script setup lang="ts" name="tlrOrgDiagnoseDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["org-diagnose"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="org-diagnose" label="Org Diagnose" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
