<script setup lang="ts" name="KnowledgeCategoryList">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useKnowledgeStore, KNOWLEDGE_CATEGORIES } from "@/stores/modules/knowledge";
import { leavesOf, leafListPath } from "./leaves";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import FileCard from "./components/FileCard.vue";

const route = useRoute();
const router = useRouter();
const store = useKnowledgeStore();

const searchQuery = ref("");

const category = computed<string>(() => String(route.params.category ?? ""));
const categoryMeta = computed(() => KNOWLEDGE_CATEGORIES.find(c => c.key === category.value));

const isValid = computed(() => Boolean(categoryMeta.value));

const files = computed<KnowledgeFileEntry[]>(() => (isValid.value ? store.filesOf(category.value) : []));

const leaves = computed(() => (isValid.value ? leavesOf(category.value) : []));

const filteredFiles = computed<KnowledgeFileEntry[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return files.value;
  return files.value.filter(f => {
    const title = (f.meta?.title || "").toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.path.toLowerCase().includes(q) ||
      title.includes(q) ||
      (f.meta?.tags || []).some(t => String(t).toLowerCase().includes(q))
    );
  });
});

const loading = computed(() => store.isCategoryLoading(category.value));

function loadCurrent(force = false) {
  if (!isValid.value) return;
  store.loadCategory(category.value, force);
}

function gotoDetail(entry: KnowledgeFileEntry) {
  router.push({ path: "/knowledge/detail", query: { path: entry.path } });
}

function gotoLeaf(leaf: string) {
  router.push(leafListPath(category.value, leaf));
}

function back() {
  router.push("/knowledge");
}

onMounted(loadCurrent);

watch(category, () => {
  searchQuery.value = "";
  loadCurrent();
});
</script>

<template>
  <div v-if="!isValid" class="kl-invalid">
    <p>Unknown category: <code>{{ category }}</code></p>
    <el-button type="primary" @click="back">Back to Hub</el-button>
  </div>

  <div v-else v-loading="loading && files.length === 0" class="kl-page">
    <header class="kl-header">
      <el-button link @click="back">← Back</el-button>
      <div class="kl-header__main">
        <h1 class="kl-title">{{ categoryMeta?.label }}</h1>
        <p class="kl-desc">{{ categoryMeta?.desc }}</p>
      </div>
      <div class="kl-header__count">{{ files.length }} files</div>
    </header>

    <div class="kl-toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="Filter by title, path, tag…"
        clearable
        class="kl-search"
      />
      <el-button :loading="loading" @click="loadCurrent(true)">Refresh</el-button>
    </div>

    <div v-if="leaves.length" class="kl-leaves">
      <el-tag
        v-for="l in leaves"
        :key="l.leaf"
        size="large"
        effect="plain"
        class="kl-leaf-chip"
        @click="gotoLeaf(l.leaf)"
      >
        {{ l.label }}
      </el-tag>
    </div>

    <div v-if="!loading && filteredFiles.length === 0" class="kl-empty">
      <span v-if="files.length === 0">No files in this category.</span>
      <span v-else>No matches for "{{ searchQuery }}".</span>
    </div>

    <div v-else class="kl-grid">
      <FileCard
        v-for="f in filteredFiles"
        :key="f.path"
        :entry="f"
        @click="gotoDetail"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.kl-page {
  max-width: 1200px;
  padding: 20px 24px 32px;
  margin: 0 auto;
}
.kl-invalid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 60px 24px;
  text-align: center;
  code {
    padding: 2px 6px;
    font-family: ui-monospace, monospace;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
}
.kl-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--el-border-color);
  &__main {
    flex: 1;
  }
  &__count {
    padding-top: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-color-primary);
  }
}
.kl-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
.kl-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.kl-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.kl-search {
  max-width: 360px;
}
.kl-leaves {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.kl-leaf-chip {
  cursor: pointer;
}
.kl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.kl-empty {
  padding: 40px 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
