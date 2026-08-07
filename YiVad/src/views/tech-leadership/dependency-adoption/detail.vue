<script setup lang="ts" name="tlrDependencyAdoptionDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["dependency-adoption"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="dependency-adoption" label="Dependency Adoption" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="dependency-adoption"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
