<template>
  <div class="rag">
    <header class="rag__header">
      <h1>RAG Playground</h1>
      <p>Query your indexed knowledge base with retrieval-augmented generation.</p>
    </header>

    <div class="rag__panel">
      <el-card class="rag__query">
        <el-input
          v-model="question"
          type="textarea"
          :rows="3"
          placeholder="Ask a question about your knowledge base..."
          @keyup.enter.ctrl="queryRag"
        />
        <div class="rag__query-actions">
          <el-button type="primary" :loading="loading" @click="queryRag">
            {{ loading ? "Searching..." : "Search" }}
          </el-button>
          <el-button text @click="buildIndex" :loading="building">Rebuild Index</el-button>
          <el-tag v-if="status" :type="status.built ? 'success' : 'warning'" size="small">
            {{ status.built ? `${status.num_docs ?? "?"} docs indexed` : "Index not built" }}
          </el-tag>
        </div>
      </el-card>

      <el-card v-if="sources.length" class="rag__sources">
        <template #header><span>Sources ({{ sources.length }})</span></template>
        <div v-for="(s, i) in sources" :key="i" class="rag__source">
          <div class="rag__source-path">{{ s.file_path ?? s.source ?? `Source ${i + 1}` }}</div>
          <p class="rag__source-text">{{ s.text ?? s.content ?? "" }}</p>
        </div>
      </el-card>

      <el-card v-if="sources.length === 0 && !loading && searched" class="rag__empty">
        <el-empty description="No relevant documents found. Try a different query." />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="ragPlayground">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { ragQuery, ragBuild, ragStatus } from "@/api/modules/ragService";
import type { RagSource } from "@/api/interface/rag";

const question = ref("");
const sources = ref<RagSource[]>([]);
const searched = ref(false);
const loading = ref(false);
const building = ref(false);
const status = ref<{ built: boolean; num_docs?: number } | null>(null);

onMounted(async () => {
  try {
    status.value = await ragStatus();
  } catch {
    // backend may not be available
  }
});

async function queryRag() {
  const q = question.value.trim();
  if (!q) return;

  loading.value = true;
  searched.value = false;
  sources.value = [];
  try {
    const res = await ragQuery({ question: q, top_k: 5 });
    sources.value = res.sources ?? [];
    searched.value = true;
  } catch (e: any) {
    ElMessage.error(e.message ?? "RAG query failed");
  } finally {
    loading.value = false;
  }
}

async function buildIndex() {
  building.value = true;
  try {
    const res = await ragBuild();
    ElMessage.success(res.message ?? "Index rebuild triggered");
    status.value = await ragStatus();
  } catch (e: any) {
    ElMessage.error(e.message ?? "Build failed");
  } finally {
    building.value = false;
  }
}
</script>

<style scoped lang="scss">
.rag {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;

  &__header {
    margin-bottom: 24px;
    h1 { margin: 0 0 4px; font-size: 24px; }
    p { margin: 0; color: var(--el-text-color-secondary); font-size: 14px; }
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__query-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }

  &__source {
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    &:last-child { border-bottom: none; }

    &-path {
      font-size: 12px;
      color: var(--el-color-primary);
      margin-bottom: 4px;
      font-family: monospace;
    }
    &-text {
      margin: 0;
      font-size: 13px;
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }
  }

  &__empty {
    text-align: center;
  }
}
</style>
