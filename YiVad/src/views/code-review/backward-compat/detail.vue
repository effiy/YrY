<script setup lang="ts" name="crBackwardCompatDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["backward-compat"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="backward-compat" label="Backward compat review" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related>
    </template>
  </TopicDetailPage>
</template>
