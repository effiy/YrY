<script setup lang="ts" name="tlrCapacityCostDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["capacity-cost"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="capacity-cost" label="Capacity & Cost (FinOps)" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="capacity-cost"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
