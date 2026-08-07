<script setup lang="ts" name="tlrTechDebtDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["tech-debt"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="tech-debt" label="Tech Debt" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="tech-debt"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
