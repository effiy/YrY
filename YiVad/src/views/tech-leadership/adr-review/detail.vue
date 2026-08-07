<script setup lang="ts" name="tlrAdrReviewDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["adr-review"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="adr-review" label="Architecture Decision Records" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="tl"
        current-topic="adr-review"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
