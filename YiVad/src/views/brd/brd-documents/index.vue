<script setup lang="ts" name="brdDocumentsList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-documents"];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-documents" label="BRD Documents" :meta-columns="schema.metaColumns" />
</template>
