<script setup lang="ts" name="crDependencyRiskDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["dependency-risk"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="dependency-risk" label="Dependency risk" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="cr"
        current-topic="dependency-risk"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
