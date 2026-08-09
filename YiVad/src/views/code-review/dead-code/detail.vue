<script setup lang="ts" name="crDeadCodeDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["dead-code"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="dead-code" label="Dead code review" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related>
    </template>
  </TopicDetailPage>
</template>
