<script setup lang="ts" name="tlrOncallHandoverDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["oncall-handover"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="oncall-handover" label="Oncall Handover" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="oncall-handover"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
