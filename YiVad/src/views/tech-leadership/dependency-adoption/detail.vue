<script setup lang="ts" name="tlrDependencyAdoptionDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["dependency-adoption"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="dependency-adoption" label="Dependency Adoption" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
