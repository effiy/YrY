<template>
  <div class="pd">
    <div class="pd__sidebar">
      <div class="pd__sidebar-head">
        <el-input
          v-model="searchText"
          size="small"
          clearable
          placeholder="搜索文档…"
          :prefix-icon="Search"
        />
        <el-button
          v-if="!hasPages"
          size="small"
          type="primary"
          :icon="Upload"
          :loading="seeding"
          @click="seedDocs"
        >
          导入文档
        </el-button>
      </div>
      <div class="pd__toc">
        <div
          v-for="section in filteredSections"
          :key="section.title"
          class="pd__toc-item"
          :class="{ 'pd__toc-item--active': activeSection === section.title }"
          @click="selectSection(section.title)"
        >
          <el-icon class="pd__toc-icon"><Document /></el-icon>
          <span class="pd__toc-label">{{ section.title }}</span>
        </div>
        <el-empty v-if="!filteredSections.length" description="无匹配文档" :image-size="40" />
      </div>
    </div>
    <div class="pd__content">
      <template v-if="activeContent">
        <div class="pd__content-head">
          <h2 class="pd__content-title">{{ activeSection }}</h2>
          <div class="pd__content-meta">
            <span v-if="activeSource === 'db'" class="pd__content-badge">已保存</span>
            <span v-else class="pd__content-badge pd__content-badge--seed">预览</span>
            <span class="pd__content-date">{{ contentStats.chars }} 字符 · {{ contentStats.lines }} 行</span>
          </div>
        </div>
        <div class="markdown-body" v-html="renderedContent" />
      </template>
      <el-empty v-else description="从左侧选择文档章节" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Document, Search, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { usePageStore } from "@/stores/modules/page";
import { useMarkdown } from "@/hooks/useMarkdown";
import { yivadDocs } from "../seed/yivad-docs";
import { yiaiDocs } from "../seed/yiai-docs";
import { yipetDocs } from "../seed/yipet-docs";
import { yiknowledgeDocs } from "../seed/yiknowledge-docs";
import type { SeedPage } from "../seed/yivad-docs";

const props = defineProps<{ projectKey: string }>();

const SEED_DOCS: Record<string, SeedPage[]> = {
  yivad: yivadDocs,
  yiai: yiaiDocs,
  yipet: yipetDocs,
  yiknowledge: yiknowledgeDocs
};

const store = usePageStore();
const { render: renderMarkdown } = useMarkdown();

const searchText = ref("");
const activeSection = ref("");
const seeding = ref(false);

const pages = computed(() => store.pages);
const hasPages = computed(() => pages.value.length > 0);

const sections = computed(() => {
  if (hasPages.value) {
    return pages.value
      .map(p => ({ title: p.title, content: p.content }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }
  return (SEED_DOCS[props.projectKey] || yivadDocs) as Pick<SeedPage, "title" | "content">[];
});

const filteredSections = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  if (!q) return sections.value;
  return sections.value.filter(
    s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
  );
});

const activeContent = computed(() => {
  if (!activeSection.value) return null;
  return sections.value.find(s => s.title === activeSection.value)?.content || null;
});

const activeSource = computed(() => (hasPages.value ? "db" : "seed"));

const renderedContent = computed(() => {
  if (!activeContent.value) return "";
  return renderMarkdown(activeContent.value);
});

const contentStats = computed(() => {
  const c = activeContent.value || "";
  return { chars: c.length, lines: c.split("\n").filter(Boolean).length };
});

function selectSection(title: string) {
  activeSection.value = title;
}

async function seedDocs() {
  seeding.value = true;
  try {
    const docs = SEED_DOCS[props.projectKey] || yivadDocs;
    for (const doc of docs) {
      await store.addPage({
        key: `DOC-${props.projectKey}-${doc.order}-${Date.now().toString(36)}`,
        project_key: props.projectKey,
        title: doc.title,
        content: doc.content,
        parent_key: "",
        order: doc.order
      });
    }
    ElMessage.success(`已导入 ${docs.length} 篇文档`);
    await store.fetchPages({ project_key: props.projectKey });
  } catch (e) {
    ElMessage.error("导入失败，请检查后端是否运行");
  } finally {
    seeding.value = false;
  }
}

onMounted(async () => {
  await store.fetchPages({ project_key: props.projectKey });
  if (sections.value.length) {
    activeSection.value = sections.value[0].title;
  }
});
</script>

<style scoped lang="scss">
.pd {
  display: flex;
  gap: 0;
  height: calc(100vh - 260px);
  min-height: 400px;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--el-bg-color);
}
.pd__sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color);
  background: var(--el-fill-color-lighter);
}
.pd__sidebar-head {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.pd__toc {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}
.pd__toc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: background 0.1s, color 0.1s;
  &:hover {
    background: var(--el-fill-color-light);
  }
  &--active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 500;
  }
}
.pd__toc-icon {
  font-size: 14px;
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  .pd__toc-item--active & {
    color: var(--el-color-primary);
  }
}
.pd__toc-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pd__content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}
.pd__content-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.pd__content-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.pd__content-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.pd__content-badge {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
  font-weight: 500;
  &--seed {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
  }
}
.pd__content-date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
:deep(.markdown-body) {
  max-width: 860px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  h1 { font-size: 1.6em; margin: 24px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--el-border-color-lighter); }
  h2 { font-size: 1.35em; margin: 22px 0 12px; }
  h3 { font-size: 1.15em; margin: 18px 0 10px; }
  p { margin: 0 0 14px; }
  ul, ol { padding-left: 22px; margin: 0 0 14px; }
  li { margin-bottom: 4px; }
  code {
    padding: 2px 6px;
    font-size: 0.88em;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-family: "SF Mono", "Fira Code", monospace;
  }
  pre {
    padding: 14px 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    overflow: auto;
    margin: 0 0 16px;
    code { padding: 0; background: none; }
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 16px;
    font-size: 13px;
    th, td { padding: 8px 12px; border: 1px solid var(--el-border-color-lighter); text-align: left; }
    th { background: var(--el-fill-color-light); font-weight: 600; }
  }
  blockquote {
    padding: 8px 14px;
    margin: 0 0 14px;
    border-left: 3px solid var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
    color: var(--el-text-color-secondary);
    border-radius: 0 6px 6px 0;
  }
  a { color: var(--el-color-primary); }
  hr { border: none; border-top: 1px solid var(--el-border-color-lighter); margin: 20px 0; }
}
</style>