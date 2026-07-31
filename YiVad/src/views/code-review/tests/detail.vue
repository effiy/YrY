<script setup lang="ts" name="crTestsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["tests"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="tests" label="Generate tests" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
