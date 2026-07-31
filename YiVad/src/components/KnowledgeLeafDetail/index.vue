<script setup lang="ts" name="KnowledgeLeafDetail">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useKnowledgeStore } from "@/stores/modules/knowledge";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";
import { leafListPath } from "@/views/knowledge/leaves";
import MarkdownView from "@/views/knowledge/components/MarkdownView.vue";

const props = defineProps<{
  category: string;
  leaf: string;
  label: string;
}>();

const route = useRoute();
const router = useRouter();
const store = useKnowledgeStore();
const aicrKnowledgeStore = useAicrKnowledgeStore();

const path = computed(() => String(route.query.path ?? ""));

const detail = computed(() => store.currentDetail);

const meta = computed(() => detail.value?.meta ?? null);

const title = computed(() => meta.value?.title || detail.value?.name || path.value.split("/").pop() || "");

const tags = computed<string[]>(() => {
  const t = meta.value?.tags;
  return Array.isArray(t) ? t.map(String) : [];
});

const updated = computed(() => {
  const ts = meta.value?.updated ?? meta.value?.created;
  if (!ts) return "";
  const d = new Date(String(ts));
  if (Number.isNaN(d.getTime())) return String(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
});

const category = computed(() => detail.value?.category ?? props.category);

function back() {
  router.push(leafListPath(props.category, props.leaf));
}

function copyPath() {
  navigator.clipboard
    .writeText(path.value)
    .then(() => ElMessage.success("Path copied"))
    .catch(() => ElMessage.error("Copy failed"));
}

function askInAicr() {
  if (!path.value) return;
  aicrKnowledgeStore.setPendingSelectPath(path.value);
  router.push("/aicr");
}

async function loadCurrent() {
  if (!path.value) {
    router.replace("/404");
    return;
  }
  await store.selectFile(path.value);
  if (!store.currentDetail) {
    router.replace("/404");
  }
}

onMounted(loadCurrent);

watch(path, loadCurrent);
</script>

<template>
  <div v-loading="store.fileLoading" class="kld-page">
    <header class="kld-header">
      <el-button link @click="back">← /{{ category }}/{{ leaf }}</el-button>
      <div class="kld-header__title">
        <h1 class="kld-title">{{ title }}</h1>
        <code class="kld-path">{{ path }}</code>
      </div>
      <div class="kld-actions">
        <el-button size="small" @click="copyPath">Copy path</el-button>
        <el-button size="small" type="primary" @click="askInAicr">Ask in aicr</el-button>
      </div>
    </header>

    <el-descriptions v-if="meta" :column="2" border size="small" class="kld-meta">
      <el-descriptions-item v-if="meta.title" label="Title">{{ meta.title }}</el-descriptions-item>
      <el-descriptions-item v-if="category" label="Leaf">/{{ category }}/{{ leaf }}</el-descriptions-item>
      <el-descriptions-item v-if="updated" label="Updated">{{ updated }}</el-descriptions-item>
      <el-descriptions-item v-if="meta.source" label="Source">
        <a v-if="String(meta.source).startsWith('http')" :href="String(meta.source)" target="_blank" rel="noopener">
          {{ meta.source }}
        </a>
        <span v-else>{{ meta.source }}</span>
      </el-descriptions-item>
      <el-descriptions-item v-if="tags.length" label="Tags" :span="2">
        <el-tag v-for="t in tags" :key="t" size="small" type="info" effect="plain" class="kld-tag">
          {{ t }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <article v-if="detail" class="kld-body">
      <MarkdownView :content="detail.content" />
    </article>
  </div>
</template>

<style scoped lang="scss">
.kld-page {
  padding: 20px 24px 40px;
  max-width: 960px;
  margin: 0 auto;
}

.kld-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--el-border-color);
  margin-bottom: 18px;

  &__title {
    flex: 1;
  }
}

.kld-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 6px;
  line-height: 1.3;
}

.kld-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: ui-monospace, monospace;
  word-break: break-all;
}

.kld-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.kld-meta {
  margin-bottom: 24px;
}

.kld-tag {
  margin: 2px 4px 2px 0;
}

.kld-body {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px 28px;
  border: 1px solid var(--el-border-color);
}
</style>
