<script setup lang="ts" name="brdObjectivesList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-objectives"];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-objectives" label="Business Objectives" :meta-columns="schema.metaColumns" />
</template>
