<script setup lang="ts" name="tlrTechSelectionList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["tech-selection"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="tech-selection" label="Tech Selection" :meta-columns="schema.metaColumns" />
</template>
