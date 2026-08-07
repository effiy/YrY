<script setup lang="ts" name="KnowledgeHub">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useKnowledgeStore, KNOWLEDGE_CATEGORIES } from "@/stores/modules/knowledge";
import { syncKnowledge } from "@/api/modules/knowledgeService";
import { ElMessage } from "element-plus";

const router = useRouter();
const store = useKnowledgeStore();
const syncing = ref(false);

const mergedCategories = computed(() => KNOWLEDGE_CATEGORIES);

const fileCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const c of mergedCategories.value) {
    counts[c.key] = store.filesOf(c.key).length;
  }
  return counts;
});

function goToCategory(key: string) {
  router.push(`/knowledge/${key}`);
}

async function handleSync() {
  syncing.value = true;
  try {
    const res = await syncKnowledge();
    ElMessage.success(`Synced ${res.synced} files, deleted ${res.deleted}`);
    store.reset();
    await store.loadAllCategories(true);
  } catch (e: any) {
    ElMessage.error(e?.message || "Sync failed");
  } finally {
    syncing.value = false;
  }
}

onMounted(() => {
  store.loadAllCategories();
});
</script>

<template>
  <div class="knowledge-hub">
    <header class="kh-header">
      <div>
        <h1>Knowledge Base</h1>
        <p>{{ store.totalFiles }} files across {{ mergedCategories.length }} role domains</p>
      </div>
      <el-button type="primary" :loading="syncing" @click="handleSync">
        <el-icon><RefreshRight /></el-icon> Sync from Disk
      </el-button>
    </header>

    <section class="kh-grid">
      <el-card
        v-for="cat in mergedCategories"
        :key="cat.key"
        shadow="hover"
        class="kh-card"
        @click="goToCategory(cat.key)"
      >
        <div class="kh-card__header">
          <span class="kh-card__title">{{ cat.label }}</span>
          <el-tag size="small" type="info">{{ fileCounts[cat.key] ?? "..." }}</el-tag>
        </div>
        <p class="kh-card__desc">{{ cat.desc }}</p>
        <div v-if="store.isCategoryLoading(cat.key)" class="kh-card__loading">
          <el-icon class="is-loading"><Loading /></el-icon> loading...
        </div>
      </el-card>
    </section>

    <section v-if="store.recentFiles.length" class="kh-recent">
      <h2>Recently Updated</h2>
      <el-table :data="store.recentFiles" stripe size="small" @row-click="(row: any) => router.push(`/knowledge/${row.category}/detail/${encodeURIComponent(row.path)}`)">
        <el-table-column prop="name" label="File" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="Category" width="140" />
        <el-table-column label="Updated" width="160">
          <template #default="{ row }">
            {{ row.updatedAt ? new Date(row.updatedAt * 1000).toLocaleDateString() : "—" }}
          </template>
        </el-table-column>
        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.meta?.status" size="small" :type="row.meta.status === 'stable' ? 'success' : 'info'">
              {{ row.meta.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<style scoped lang="scss">
.knowledge-hub {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.kh-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  h1 { margin: 0 0 4px; font-size: 24px; }
  p { margin: 0; color: var(--el-text-color-secondary); }
}
.kh-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.kh-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: translateY(-2px); }
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  &__title { font-weight: 600; font-size: 15px; }
  &__desc { margin: 0; color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.5; }
  &__loading { margin-top: 8px; font-size: 12px; color: var(--el-text-color-placeholder); }
}
.kh-recent {
  h2 { font-size: 18px; margin-bottom: 12px; }
  :deep(.el-table__row) { cursor: pointer; }
}
</style>
