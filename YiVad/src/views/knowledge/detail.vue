<script setup lang="ts" name="KnowledgeDetail">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useKnowledgeStore, KNOWLEDGE_CATEGORIES } from "@/stores/modules/knowledge";
import { writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { ElMessage } from "element-plus";
import KnowledgeMetaStrip from "@/components/KnowledgeMetaStrip.vue";
import { useMarkdown } from "@/hooks/useMarkdown";

const route = useRoute();
const router = useRouter();
const store = useKnowledgeStore();

const filePath = computed(() => decodeURIComponent((route.params.file as string) || ""));
const categoryKey = computed(() => route.params.category as string);
const categoryInfo = computed(() => KNOWLEDGE_CATEGORIES.find(c => c.key === categoryKey.value));

const editing = ref(false);
const editContent = ref("");
const saving = ref(false);

const detail = computed(() => store.currentDetail);
const loading = computed(() => store.fileLoading);

const { render: renderMarkdown } = useMarkdown();

const renderedHtml = computed(() => {
  if (!detail.value?.content) return "";
  return renderMarkdown(detail.value.content);
});

function startEdit() {
  editContent.value = detail.value?.content || "";
  editing.value = true;
}

function cancelEdit() {
  editing.value = false;
  editContent.value = "";
}

async function saveEdit() {
  if (!filePath.value) return;
  saving.value = true;
  try {
    await writeKnowledgeFile(filePath.value, editContent.value, detail.value?.meta as Record<string, unknown>);
    ElMessage.success("Saved");
    editing.value = false;
    await store.selectFile(filePath.value);
  } catch (e: any) {
    ElMessage.error(e?.message || "Save failed");
  } finally {
    saving.value = false;
  }
}

function goToCategory() {
  router.push(`/knowledge/${categoryKey.value}`);
}

onMounted(() => {
  if (filePath.value) store.selectFile(filePath.value);
});

watch(filePath, (path) => {
  if (path) store.selectFile(path);
});
</script>

<template>
  <div class="knowledge-detail">
    <header class="kd-header">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/knowledge' }">Knowledge Base</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: `/knowledge/${categoryKey}` }">
            {{ categoryInfo?.label || categoryKey }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ detail?.name || filePath }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="kd-header__actions">
        <el-button v-if="!editing" type="primary" @click="startEdit">
          <el-icon><Edit /></el-icon> Edit
        </el-button>
        <el-button v-if="editing" type="success" :loading="saving" @click="saveEdit">
          <el-icon><Check /></el-icon> Save
        </el-button>
        <el-button v-if="editing" @click="cancelEdit">Cancel</el-button>
      </div>
    </header>

    <div v-if="loading" class="kd-loading">
      <el-icon class="is-loading"><Loading /></el-icon> Loading...
    </div>

    <template v-else-if="detail">
      <KnowledgeMetaStrip
        v-if="detail.meta && Object.keys(detail.meta).length"
        :meta="detail.meta"
        :current-path="filePath"
        @navigate-related="(path: string) => router.push(`/knowledge/${categoryKey}/detail/${encodeURIComponent(path)}`)"
      />

      <el-card v-if="editing" class="kd-editor">
        <el-input
          v-model="editContent"
          type="textarea"
          :rows="24"
          placeholder="Markdown content..."
        />
      </el-card>

      <el-card v-else class="kd-content">
        <div v-html="renderedHtml" class="markdown-body" />
      </el-card>
    </template>

    <el-empty v-else description="File not found" />
  </div>
</template>

<style scoped lang="scss">
.knowledge-detail {
  padding: 24px;
  max-width: 960px;
  margin: 0 auto;
}
.kd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  &__actions { display: flex; gap: 8px; }
}
.kd-loading {
  text-align: center;
  padding: 60px 0;
  color: var(--el-text-color-secondary);
}
.kd-editor {
  margin-bottom: 16px;
}
.kd-content {
  :deep(.markdown-body) {
    line-height: 1.7;
    h1, h2, h3 { margin-top: 24px; }
    pre { background: var(--el-fill-color-light); padding: 16px; border-radius: 6px; overflow-x: auto; }
    code { font-size: 13px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid var(--el-border-color); padding: 8px 12px; text-align: left; }
    th { background: var(--el-fill-color-light); }
  }
}
</style>
