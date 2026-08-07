<script setup lang="ts" name="tlrProjectHandoffsDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["project-handoffs"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="project-handoffs" label="Project Handoff" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="project-handoffs"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
