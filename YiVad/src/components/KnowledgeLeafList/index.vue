<script setup lang="ts" name="KnowledgeLeafList">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useKnowledgeStore } from "@/stores/modules/knowledge";
import { leafDetailRouteName } from "@/views/knowledge/leaves";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import FileCard from "@/views/knowledge/components/FileCard.vue";

const props = defineProps<{
  category: string;
  leaf: string;
  label: string;
  desc?: string;
}>();

const router = useRouter();
const store = useKnowledgeStore();

const searchQuery = ref("");

const prefix = computed(() => `${props.category}/${props.leaf}/`);

const files = computed<KnowledgeFileEntry[]>(() => {
  const all = store.filesOf(props.category);
  return all.filter(f => f.path.startsWith(prefix.value));
});

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

const loading = computed(() => store.isCategoryLoading(props.category));

function loadCurrent(force = false) {
  store.loadCategory(props.category, force);
}

function gotoDetail(entry: KnowledgeFileEntry) {
  router.push({
    name: leafDetailRouteName(props.category, props.leaf),
    query: { path: entry.path }
  });
}

function back() {
  router.push(`/knowledge/${props.category}`);
}

onMounted(loadCurrent);

watch(() => props.category, () => {
  searchQuery.value = "";
  loadCurrent();
});
</script>

<template>
  <div v-loading="loading && files.length === 0" class="kll-page">
    <header class="kll-header">
      <el-button link @click="back">← /{{ category }}</el-button>
      <div class="kll-header__main">
        <h1 class="kll-title">{{ label }}</h1>
        <p v-if="desc" class="kll-desc">{{ desc }}</p>
      </div>
      <div class="kll-header__count">{{ files.length }} files</div>
    </header>

    <div class="kll-toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="Filter by title, path, tag…"
        clearable
        class="kll-search"
      />
      <el-button :loading="loading" @click="loadCurrent(true)">Refresh</el-button>
    </div>

    <div v-if="!loading && filteredFiles.length === 0" class="kll-empty">
      <span v-if="files.length === 0">No files in this leaf.</span>
      <span v-else>No matches for "{{ searchQuery }}".</span>
    </div>

    <div v-else class="kll-grid">
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
.kll-page {
  padding: 20px 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.kll-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--el-border-color);
  margin-bottom: 18px;

  &__main {
    flex: 1;
  }

  &__count {
    color: var(--el-color-primary);
    font-weight: 600;
    font-size: 14px;
    padding-top: 6px;
  }
}

.kll-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.kll-desc {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.kll-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.kll-search {
  max-width: 360px;
}

.kll-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.kll-empty {
  padding: 40px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  text-align: center;
}
</style>
