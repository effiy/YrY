<script setup lang="ts" name="brdAcceptanceDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-acceptance"];
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-acceptance" label="Acceptance Criteria" :meta-fields="schema.metaFields" :template-content="schema.templateContent" label-width="180px" />
</template>
