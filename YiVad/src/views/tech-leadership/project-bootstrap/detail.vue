<script setup lang="ts" name="tlrProjectBootstrapDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["project-bootstrap"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="project-bootstrap" label="Project Bootstrap" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project || entry?.meta?.project_name"
        :project="entry.meta.project || entry.meta.project_name"
        current-tree="tl"
        current-topic="project-bootstrap"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
