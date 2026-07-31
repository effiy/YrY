<script setup lang="ts" name="crStyleDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["style"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="style" label="Naming & style" :meta-fields="schema.metaFields" :template-content="schema.templateContent" />
</template>
