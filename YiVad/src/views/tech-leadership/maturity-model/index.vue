<script setup lang="ts" name="tlrMaturityModelList">
import { ref } from "vue";
import TopicListPage from "@/components/TopicListPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
import type { TopicEntryDocument } from "@/api/modules/topic";
const schema = tlrMetaSchemas["maturity-model"];
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
  <TopicListPage tree="tech-leadership" topic="maturity-model" label="Maturity Model" :meta-columns="schema.metaColumns" @meta-click="onMetaClick" />
  <el-drawer v-model="drawerOpen" :title="$t('brdRelated.title')" direction="rtl" size="520px" :destroy-on-close="true">
  </el-drawer>
</template>