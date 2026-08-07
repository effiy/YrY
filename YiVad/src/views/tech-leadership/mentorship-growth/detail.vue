<script setup lang="ts" name="tlrMentorshipGrowthDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["mentorship-growth"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="mentorship-growth" label="Mentorship & Growth" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="mentorship-growth"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
