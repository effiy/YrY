<script setup lang="ts" name="tlrMaturityModelDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["maturity-model"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="maturity-model" label="Maturity Model" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="maturity-model"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
