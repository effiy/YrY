<script setup lang="ts" name="tlrTechSelectionDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["tech-selection"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="tech-selection" label="Tech Selection" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
