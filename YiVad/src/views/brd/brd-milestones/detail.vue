<script setup lang="ts" name="brdMilestonesDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-milestones"];
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-milestones" label="Milestones" :meta-fields="schema.metaFields" :template-content="schema.templateContent" label-width="180px" />
</template>
