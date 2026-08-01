<script setup lang="ts" name="brdStakeholdersList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-stakeholders"];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-stakeholders" label="Stakeholders" :meta-columns="schema.metaColumns" :template-content="schema.templateContent" />
</template>
