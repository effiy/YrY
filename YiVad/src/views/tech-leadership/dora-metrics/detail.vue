<script setup lang="ts" name="tlrDoraMetricsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["dora-metrics"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="dora-metrics" label="DORA Metrics" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="dora-metrics"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
