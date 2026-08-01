<script setup lang="ts" name="brdApprovalsList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-approvals"];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-approvals" label="Approval Records" :meta-columns="schema.metaColumns" :template-content="schema.templateContent" />
</template>
