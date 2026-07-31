<script setup lang="ts" name="tlrAdrReviewDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["adr-review"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="adr-review" label="Architecture Decision Records" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
