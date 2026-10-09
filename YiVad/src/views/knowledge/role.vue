<template>
  <div class="role-entry">
    <!-- ═══ RAG index status bar (global, every role) ═══ -->
    <div v-if="ragStatus" class="role-entry__rag" :class="{ 'is-empty': !ragStatus.built }">
      <span class="role-entry__rag-dot" :class="{ 'is-built': ragStatus.built }" />
      <span v-if="ragStatus.built">
        RAG index: {{ ragStatus.num_docs }} docs · built {{ ragBuiltAgo }}
      </span>
      <span v-else>RAG index not built — queries fall back to file search.</span>
    </div>

    <!-- ═══ Dispatch to per-role dashboards ═══ -->
    <AierDashboard v-if="category === 'aier'" />
    <ExecutiveDashboard v-else-if="category === 'executive'" />
    <SreDashboard v-else-if="category === 'sre'" />
    <LeaderDashboard v-else-if="category === 'leader'" />
    <ProductDashboard v-else-if="category === 'product'" />
    <EngineerDashboard v-else-if="category === 'engineer'" />
    <CuratorDashboard v-else-if="category === 'curator'" />
    <!-- fallback: generic RoleKnowledgePage — keeps old URLs working -->
    <RoleKnowledgePage
      v-else
      :title="role.title"
      :domains-word="role.domainsWord"
      :description="role.description"
      :category="role.id"
      :subdirs="role.subdirs"
      :structural-tags="role.structuralTags"
    >
      <template #title>
        <RoleNav :active="role.id" show-quick-nav :quick-role="role.id" sticky />
      </template>
    </RoleKnowledgePage>
  </div>
</template>

<script setup lang="ts" name="RolePage">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { ragStatus as fetchRagStatus } from "@/api/modules/ragService";
import type { RagStatusResponse } from "@/api/interface/rag";
import { timeAgo } from "@/utils/time";
import { getRole } from "./roleConfig";

/* ── Dispatcher targets ── */
import RoleKnowledgePage from "./components/RoleKnowledgePage.vue";
import RoleNav from "./components/RoleNav.vue";
import AierDashboard from "./aier/AierDashboard.vue";
import ExecutiveDashboard from "./executive/ExecutiveDashboard.vue";
import SreDashboard from "./sre/index.vue";
import LeaderDashboard from "./leader/index.vue";
import ProductDashboard from "./product/index.vue";
import EngineerDashboard from "./engineer/index.vue";
import CuratorDashboard from "./curator/index.vue";

/* ── RAG status (global, fetched once) ── */
const ragStatus = ref<RagStatusResponse | null>(null);

onMounted(async () => {
  try { ragStatus.value = await fetchRagStatus(); } catch { /* offline safe */ }
});

const ragBuiltAgo = computed(() => {
  if (!ragStatus.value?.last_built_at) return "";
  return timeAgo(ragStatus.value.last_built_at, "en");
});

/* ── Route → role resolution ── */
const route = useRoute();
const category = computed(() => {
  const segments = route.path.split("/").filter(Boolean);
  // URLs like /knowledge/{role}
  const idx = segments.indexOf("knowledge");
  return idx >= 0 && segments[idx + 1] ? segments[idx + 1] : "engineer";
});
const role = computed(() => getRole(category.value));
</script>

<style scoped lang="scss">
.role-entry {
  background: var(--el-bg-color-page);
  min-height: 100%;
}
.role-entry__rag {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 16px;
  margin: 8px 24px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
  border-radius: 8px;
  &.is-empty {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
    border-color: var(--el-color-warning-light-5);
  }
}
.role-entry__rag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-warning);
  &.is-built {
    background: var(--el-color-success);
    box-shadow: 0 0 4px rgba(103, 194, 58, 0.5);
  }
}
</style>
