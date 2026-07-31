<script setup lang="ts" name="tlrPostmortemList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["postmortem"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="postmortem" label="Postmortem" :meta-columns="schema.metaColumns" />
</template>
