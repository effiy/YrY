<script setup lang="ts" name="crObservabilityGapDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["observability-gap"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="observability-gap" label="Observability gap" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="cr"
        current-topic="observability-gap"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
