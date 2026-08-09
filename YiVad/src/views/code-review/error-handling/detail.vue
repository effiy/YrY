<script setup lang="ts" name="crErrorHandlingDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["error-handling"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="error-handling" label="Error handling review" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related>
    </template>
  </TopicDetailPage>
</template>
