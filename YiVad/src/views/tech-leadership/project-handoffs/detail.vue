<script setup lang="ts" name="tlrProjectHandoffsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["project-handoffs"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="project-handoffs" label="Project Handoff" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
