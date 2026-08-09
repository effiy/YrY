<script setup lang="ts" name="tlrPostmortemDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["postmortem"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="postmortem" label="Postmortem" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
