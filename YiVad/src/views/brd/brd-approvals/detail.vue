<script setup lang="ts" name="brdApprovalsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-approvals"];
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-approvals" label="Approval Records" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
