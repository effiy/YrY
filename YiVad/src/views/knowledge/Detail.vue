<script setup lang="ts" name="KnowledgeDetail">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useKnowledgeStore } from "@/stores/modules/knowledge";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";
import MarkdownView from "./components/MarkdownView.vue";

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

const category = computed(() => detail.value?.category ?? path.value.split("/")[0] ?? "");

function back() {
  const cat = category.value;
  if (cat) router.push(`/knowledge/${cat}`);
  else router.push("/knowledge");
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
  <div v-loading="store.fileLoading" class="kd-page">
    <header class="kd-header">
      <el-button link @click="back">← Back to /{{ category || "knowledge" }}</el-button>
      <div class="kd-header__title">
        <h1 class="kd-title">{{ title }}</h1>
        <code class="kd-path">{{ path }}</code>
      </div>
      <div class="kd-actions">
        <el-button size="small" @click="copyPath">Copy path</el-button>
        <el-button size="small" type="primary" @click="askInAicr">Ask in aicr</el-button>
      </div>
    </header>

    <el-descriptions v-if="meta" :column="2" border size="small" class="kd-meta">
      <el-descriptions-item v-if="meta.title" label="Title">{{ meta.title }}</el-descriptions-item>
      <el-descriptions-item v-if="category" label="Category">/{{ category }}</el-descriptions-item>
      <el-descriptions-item v-if="updated" label="Updated">{{ updated }}</el-descriptions-item>
      <el-descriptions-item v-if="meta.source" label="Source">
        <a v-if="String(meta.source).startsWith('http')" :href="String(meta.source)" target="_blank" rel="noopener">
          {{ meta.source }}
        </a>
        <span v-else>{{ meta.source }}</span>
      </el-descriptions-item>
      <el-descriptions-item v-if="tags.length" label="Tags" :span="2">
        <el-tag v-for="t in tags" :key="t" size="small" type="info" effect="plain" class="kd-tag">
          {{ t }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <article v-if="detail" class="kd-body">
      <MarkdownView :content="detail.content" />
    </article>
  </div>
</template>

<style scoped lang="scss">
.kd-page {
  max-width: 960px;
  padding: 20px 24px 40px;
  margin: 0 auto;
}
.kd-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--el-border-color);
  &__title {
    flex: 1;
  }
}
.kd-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}
.kd-path {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}
.kd-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.kd-meta {
  margin-bottom: 24px;
}
.kd-tag {
  margin: 2px 4px 2px 0;
}
.kd-body {
  padding: 24px 28px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}
</style>
