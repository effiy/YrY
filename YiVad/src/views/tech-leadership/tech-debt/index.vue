<script setup lang="ts" name="tlrTechDebtList">
import { ref } from "vue";
import TopicListPage from "@/components/TopicListPage/index.vue";
import RelatedByProjectPanel from "@/views/brd/components/RelatedByProjectPanel.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
import type { TopicEntryDocument } from "@/api/modules/topic";
const schema = tlrMetaSchemas["tech-debt"];
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
  <TopicListPage tree="tech-leadership" topic="tech-debt" label="Tech Debt" :meta-columns="schema.metaColumns" @meta-click="onMetaClick" />
  <el-drawer v-model="drawerOpen" :title="$t('brdRelated.title')" direction="rtl" size="520px" :destroy-on-close="true">
    <RelatedByProjectPanel v-if="drawerProject" :project="drawerProject" current-tree="tl" current-topic="tech-debt" :current-key="drawerCurrentKey" />
  </el-drawer>
</template>
