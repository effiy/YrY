<script setup lang="ts" name="KnowledgeHub">
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useKnowledgeStore, KNOWLEDGE_CATEGORIES } from "@/stores/modules/knowledge";
import { leavesOf, leafListPath } from "./leaves";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import CategoryCard from "./components/CategoryCard.vue";
import FileCard from "./components/FileCard.vue";

const router = useRouter();
const store = useKnowledgeStore();

onMounted(() => {
  store.loadAllCategories();
});

const totalCount = computed(() => store.totalFiles);
const recentFiles = computed(() => store.recentFiles);

function gotoCategory(cat: string) {
  router.push(`/knowledge/${cat}`);
}

function gotoLeaf(cat: string, leaf: string) {
  router.push(leafListPath(cat, leaf));
}

function gotoDetail(entry: KnowledgeFileEntry) {
  router.push({ path: "/knowledge/detail", query: { path: entry.path } });
}
</script>

<template>
  <div class="kh-page">
    <header class="kh-header">
      <div>
        <h1 class="kh-title">YiKnowledge</h1>
        <p class="kh-subtitle">个人知识库 — 行业 / 教训 / 方法论 / 人脉 / 产品 / 资源 / 技术 / 工作</p>
      </div>
      <div class="kh-total">
        <span class="kh-total__num">{{ totalCount }}</span>
        <span class="kh-total__lbl">files</span>
      </div>
    </header>

    <section class="kh-section">
      <h2 class="kh-section__title">Categories</h2>
      <div class="kh-grid">
        <CategoryCard
          v-for="c in KNOWLEDGE_CATEGORIES"
          :key="c.key"
          :category="c.key"
          :label="c.label"
          :desc="c.desc"
          :count="store.filesOf(c.key).length"
          :loading="store.isCategoryLoading(c.key)"
          @click="gotoCategory"
        />
      </div>

      <div v-for="c in KNOWLEDGE_CATEGORIES" :key="`leaves-${c.key}`" class="kh-leaves">
        <h3 class="kh-leaves__title">{{ c.label }}</h3>
        <div class="kh-leaves__chips">
          <el-tag
            v-for="l in leavesOf(c.key)"
            :key="l.leaf"
            size="large"
            effect="plain"
            class="kh-leaf-chip"
            @click="gotoLeaf(l.category, l.leaf)"
          >
            {{ l.label }}
          </el-tag>
        </div>
      </div>
    </section>

    <section class="kh-section">
      <h2 class="kh-section__title">Recently updated</h2>
      <div v-if="recentFiles.length === 0" class="kh-empty">No recent files.</div>
      <div v-else class="kh-recent">
        <FileCard
          v-for="f in recentFiles"
          :key="f.path"
          :entry="f"
          @click="gotoDetail"
        />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.kh-page {
  max-width: 1200px;
  padding: 20px 24px 32px;
  margin: 0 auto;
}
.kh-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color);
}
.kh-title {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
}
.kh-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.kh-total {
  text-align: right;
  &__num {
    font-size: 26px;
    font-weight: 600;
    color: var(--el-color-primary);
  }
  &__lbl {
    margin-left: 6px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}
.kh-section {
  margin-top: 28px;
  &__title {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}
.kh-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.kh-recent {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.kh-empty {
  padding: 24px 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.kh-leaves {
  margin-top: 18px;
  &__title {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }
  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
.kh-leaf-chip {
  cursor: pointer;
}
</style>
