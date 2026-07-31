<script setup lang="ts" name="tlrRoadmapReviewList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["roadmap-review"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="roadmap-review" label="Roadmap Review" :meta-columns="schema.metaColumns" />
</template>
