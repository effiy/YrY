<script setup lang="ts" name="tlrAdrReviewList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["adr-review"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="adr-review" label="Architecture Decision Records" :meta-columns="schema.metaColumns" />
</template>
