<script setup lang="ts" name="crConcurrencyDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["concurrency"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="concurrency" label="Concurrency review" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="cr"
        current-topic="concurrency"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
