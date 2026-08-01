<script setup lang="ts" name="brdDocumentsDetail">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";

const { t } = useI18n();
const schema = brdMetaSchemas["brd-documents"];
const label = computed(() => t("story.brd.brdDocuments"));
</script>
<template>
  <TopicDetailPage tree="brd" topic="brd-documents" :label="label" :meta-fields="schema.metaFields" :template-content="schema.templateContent" label-width="220px" i18n-prefix="brdMeta.brdDocuments" />
</template>
