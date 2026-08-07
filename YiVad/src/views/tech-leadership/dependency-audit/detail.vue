<script setup lang="ts" name="tlrDependencyAuditDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["dependency-audit"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="dependency-audit" label="Dependency Audit" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="dependency-audit"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
