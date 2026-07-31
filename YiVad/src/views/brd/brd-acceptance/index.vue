<script setup lang="ts" name="brdAcceptanceList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-acceptance"];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-acceptance" label="Acceptance Criteria" :meta-columns="schema.metaColumns" />
</template>
