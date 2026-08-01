<script setup lang="ts" name="brdRisksList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-risks"];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-risks" label="Risk Assessment" :meta-columns="schema.metaColumns" />
</template>
