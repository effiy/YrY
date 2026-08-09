<script setup lang="ts" name="crAccessReviewDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["access-review"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="access-review" label="Access review" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related>
    </template>
  </TopicDetailPage>
</template>
