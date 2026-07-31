<script setup lang="ts" name="tlrOncallHandoverList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["oncall-handover"];
</script>
<template>
  <TopicListPage tree="tech-leadership" topic="oncall-handover" label="Oncall Handover" :meta-columns="schema.metaColumns" />
</template>
