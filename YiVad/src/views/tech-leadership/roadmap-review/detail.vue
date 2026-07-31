<script setup lang="ts" name="tlrRoadmapReviewDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["roadmap-review"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="roadmap-review" label="Roadmap Review" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
