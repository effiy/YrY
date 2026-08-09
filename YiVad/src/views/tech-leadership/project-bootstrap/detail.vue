<script setup lang="ts" name="tlrProjectBootstrapDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["project-bootstrap"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="project-bootstrap" label="Project Bootstrap" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
