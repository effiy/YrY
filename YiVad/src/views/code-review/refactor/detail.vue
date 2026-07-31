<script setup lang="ts" name="crRefactorDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["refactor"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="refactor" label="Refactor suggestions" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
