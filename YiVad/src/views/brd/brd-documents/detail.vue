<script setup lang="ts" name="brdDocumentsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-documents"];
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-documents" label="BRD Documents" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
