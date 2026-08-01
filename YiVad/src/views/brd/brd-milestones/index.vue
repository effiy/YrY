<script setup lang="ts" name="brdMilestonesList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-milestones"];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-milestones" label="Milestones" :meta-columns="schema.metaColumns" :template-content="schema.templateContent" />
</template>
