<script setup lang="ts" name="brdDocumentsList">
import TopicListPage from "@/components/TopicListPage/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
import type { ActionButton } from "@/components/TopicListPage/index.vue";
const schema = brdMetaSchemas["brd-documents"];
const actions: ActionButton[] = [
  { type: "view", label: "View Document" },
  { type: "edit", label: "Edit Document" },
  { type: "delete", label: "Delete Document" }
];
</script>
<template>
  <TopicListPage tree="brd" topic="brd-documents" label="BRD Documents" :meta-columns="schema.metaColumns" :actions="actions" :template-content="schema.templateContent" />
</template>
