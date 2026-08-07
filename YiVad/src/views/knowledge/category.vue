<script setup lang="ts" name="KnowledgeCategory">
import { computed, onMounted, watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useKnowledgeStore, KNOWLEDGE_CATEGORIES } from "@/stores/modules/knowledge";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import { Search } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const store = useKnowledgeStore();

const categoryKey = computed(() => route.params.category as string);
const categoryInfo = computed(() => KNOWLEDGE_CATEGORIES.find(c => c.key === categoryKey.value));

const files = computed<KnowledgeFileEntry[]>(() => store.filesOf(categoryKey.value));
const loading = computed(() => store.isCategoryLoading(categoryKey.value));

const searchText = ref("");

const filteredFiles = computed(() => {
  if (!searchText.value) return files.value;
  const q = searchText.value.toLowerCase();
  return files.value.filter(f => f.name.toLowerCase().includes(q) || f.meta?.title?.toLowerCase().includes(q));
});

function goToDetail(file: KnowledgeFileEntry) {
  router.push(`/knowledge/${categoryKey.value}/detail/${encodeURIComponent(file.path)}`);
}

function goBack() {
  router.push("/knowledge");
}

onMounted(() => {
  if (categoryKey.value) store.loadCategory(categoryKey.value);
});

watch(categoryKey, (key) => {
  if (key) store.loadCategory(key);
});
</script>

<template>
  <div class="knowledge-category">
    <header class="kc-header">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/knowledge' }">Knowledge Base</el-breadcrumb-item>
          <el-breadcrumb-item>{{ categoryInfo?.label || categoryKey }}</el-breadcrumb-item>
        </el-breadcrumb>
        <h1>{{ categoryInfo?.label || categoryKey }}</h1>
        <p v-if="categoryInfo">{{ categoryInfo.desc }}</p>
      </div>
    </header>

    <div class="kc-toolbar">
      <el-input
        v-model="searchText"
        placeholder="Search files..."
        clearable
        :prefix-icon="Search"
        style="width: 320px"
      />
      <span class="kc-count">{{ filteredFiles.length }} files</span>
    </div>

    <el-table
      :data="filteredFiles"
      stripe
      v-loading="loading"
      @row-click="goToDetail"
      class="kc-table"
      empty-text="No files in this category"
    >
      <el-table-column prop="name" label="File" min-width="240" show-overflow-tooltip />
      <el-table-column label="Title" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ row.meta?.title || row.name }}</template>
      </el-table-column>
      <el-table-column label="Status" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.meta?.status" size="small" :type="row.meta.status === 'stable' ? 'success' : 'info'">
            {{ row.meta.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Lifecycle" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.meta?.lifecycle" size="small" :type="row.meta.lifecycle === 'active' ? 'success' : 'warning'">
            {{ row.meta.lifecycle }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Updated" width="160">
        <template #default="{ row }">
          {{ row.updatedAt ? new Date(row.updatedAt * 1000).toLocaleDateString() : "—" }}
        </template>
      </el-table-column>
      <el-table-column label="Size" width="80">
        <template #default="{ row }">{{ row.size ? (row.size / 1024).toFixed(1) + "KB" : "—" }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.knowledge-category {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.kc-header {
  margin-bottom: 20px;
  h1 { margin: 8px 0 4px; font-size: 22px; }
  p { margin: 0; color: var(--el-text-color-secondary); }
}
.kc-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.kc-count { color: var(--el-text-color-secondary); font-size: 13px; }
.kc-table {
  :deep(.el-table__row) { cursor: pointer; }
}
</style>
