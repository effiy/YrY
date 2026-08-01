<script setup lang="ts" name="brdRulesList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-rules"];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-rules" label="Business Rules" :meta-columns="schema.metaColumns" :template-content="schema.templateContent" />
</template>
