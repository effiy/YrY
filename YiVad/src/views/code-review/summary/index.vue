<script setup lang="ts" name="crSummaryList">
import { ref } from "vue";
import TopicListPage from "@/components/TopicListPage/index.vue";
import { crMetaSchemas } from "@/views/code-review/meta-schemas";
import type { TopicEntryDocument } from "@/api/modules/topic";

const schema = crMetaSchemas["summary"];

const drawerOpen = ref(false);
const drawerProject = ref<string | undefined>();
const drawerCurrentKey = ref<string | undefined>();

function onMetaClick({ row, key, value }: { row: TopicEntryDocument; key: string; value: any }) {
  if (key !== "project" || !value) return;
  drawerProject.value = String(value);
  drawerCurrentKey.value = row.key;
  drawerOpen.value = true;
}
</script>
<template>
  <TopicListPage tree="code-review" topic="summary" label="Summarize this file" :meta-columns="schema.metaColumns" @meta-click="onMetaClick" />
  <el-drawer
    v-model="drawerOpen"
    :title="$t('brdRelated.title')"
    direction="rtl"
    size="520px"
    :destroy-on-close="true"
  >

  </el-drawer>
</template>
