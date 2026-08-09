<script setup lang="ts" name="crPerfDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["perf"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="perf" label="Performance analysis" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related>
    </template>
  </TopicDetailPage>
</template>
