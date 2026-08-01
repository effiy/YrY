<script setup lang="ts" name="brdRulesDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-rules"];
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-rules" label="Business Rules" :meta-fields="schema.metaFields" :template-content="schema.templateContent" label-width="180px" />
</template>
