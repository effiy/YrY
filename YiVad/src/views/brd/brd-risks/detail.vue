<script setup lang="ts" name="brdRisksDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-risks"];
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-risks" label="Risk Assessment" :meta-fields="schema.metaFields" label-width="200px" />
</template>
