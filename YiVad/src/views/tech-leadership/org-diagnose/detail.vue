<script setup lang="ts" name="tlrOrgDiagnoseDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["org-diagnose"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="org-diagnose" label="Org Diagnose" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="org-diagnose"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
