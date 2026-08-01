<script setup lang="ts" name="brdObjectivesDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-objectives"];
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-objectives" label="Business Objectives" :meta-fields="schema.metaFields" :template-content="schema.templateContent" label-width="180px" />
</template>
