<script setup lang="ts" name="crI18nA11yDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
const schema = crMetaSchemas["i18n-a11y"];
</script>
<template>
  <TopicDetailPage tree="code-review" topic="i18n-a11y" label="i18n / a11y review" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
    <template #related>
    </template>
  </TopicDetailPage>
</template>
