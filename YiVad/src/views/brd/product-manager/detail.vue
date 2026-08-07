<script setup lang="ts" name="brdProductManagerDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
const schema = brdMetaSchemas["brd-product-manager"];
</script>
<template>
  <TopicDetailPage
    tree="brd"
    topic="brd-product-manager"
    :meta-fields="schema.metaFields"
    :template-content="schema.templateContent"
    :title-placeholder="schema.titlePlaceholder"
    :tags-hint="schema.tagsHint"
    label-width="180px"
  >
    <template #related="{ entry }">
      <RelatedByProjectPanel
        v-if="entry?.meta?.project"
        :project="entry.meta.project"
        current-tree="brd"
        current-topic="brd-product-manager"
        :current-key="entry.key"
      />
    </template>
  </TopicDetailPage>
</template>
