<script setup lang="ts" name="brdStakeholdersDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-stakeholders"];
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-stakeholders" label="Stakeholders" :meta-fields="schema.metaFields" :template-content="schema.templateContent" label-width="180px" />
</template>
