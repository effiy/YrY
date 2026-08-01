<template>
  <div class="topic-detail" v-loading="loading">
    <header class="topic-detail__header">
      <div class="topic-detail__header-left">
        <el-button :icon="ArrowLeft" link @click="back">Back to list</el-button>
        <el-divider direction="vertical" />
        <nav class="topic-detail__breadcrumb" aria-label="Breadcrumb">
          <span class="topic-detail__breadcrumb-root">{{ label }}</span>
          <el-icon><ArrowRight /></el-icon>
          <span class="topic-detail__breadcrumb-current">{{ isNew ? "New entry" : entry?.title || route.params.id }}</span>
        </nav>
      </div>
      <div class="topic-detail__header-right">
        <template v-if="isViewMode">
          <el-button v-if="tree === 'brd' && !isNew" :icon="Connection" plain @click="editInAicr">Edit in aicr</el-button>
          <el-button type="primary" :icon="EditPen" @click="switchToEdit">Edit</el-button>
        </template>
        <template v-else>
          <el-button @click="handleCancel">Cancel</el-button>
          <el-button v-if="!isNew" type="danger" :icon="DeleteIcon" @click="handleDelete">Delete</el-button>
          <el-button type="primary" :icon="CirclePlus" @click="handleSave">Save</el-button>
        </template>
      </div>
    </header>

    <div class="topic-detail__body">
      <el-form ref="formRef" :model="form" :rules="rules" :label-width="labelWidth" label-suffix=" :" class="topic-detail__form">
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" placeholder="Concise entry title" clearable :disabled="isViewMode" />
        </el-form-item>

        <!-- Structured meta fields -->
        <template v-if="metaFields.length">
          <el-divider content-position="left">
            <span class="topic-detail__meta-divider-text">Structured fields</span>
          </el-divider>
          <el-row :gutter="16">
            <el-col v-for="field in metaFields" :key="field.key" :span="field.colSpan ?? 12" :xs="24" :sm="field.colSpan ?? 12">
              <el-form-item :label="field.label" :prop="`meta.${field.key}`" :required="field.required">
                <!-- Input -->
                <el-input
                  v-if="field.type === 'input'"
                  v-model="form.meta[field.key]"
                  :placeholder="field.placeholder ?? `Enter ${field.label.toLowerCase()}`"
                  clearable
                  :disabled="isViewMode"
                />
                <!-- Number -->
                <el-input-number
                  v-else-if="field.type === 'number'"
                  v-model="form.meta[field.key]"
                  :placeholder="field.placeholder"
                  :min="field.min"
                  :max="field.max"
                  controls-position="right"
                  style="width: 100%"
                  :disabled="isViewMode"
                />
                <!-- Select -->
                <el-select
                  v-else-if="field.type === 'select'"
                  v-model="form.meta[field.key]"
                  :placeholder="field.placeholder ?? `Select ${field.label.toLowerCase()}`"
                  clearable
                  style="width: 100%"
                  :disabled="isViewMode"
                >
                  <el-option
                    v-for="opt in field.options"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <!-- Date -->
                <el-date-picker
                  v-else-if="field.type === 'date'"
                  v-model="form.meta[field.key]"
                  type="date"
                  :placeholder="field.placeholder ?? 'Pick a date'"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  :disabled="isViewMode"
                />
                <!-- Textarea -->
                <el-input
                  v-else-if="field.type === 'textarea'"
                  v-model="form.meta[field.key]"
                  type="textarea"
                  :rows="field.rows ?? 3"
                  :placeholder="field.placeholder ?? `Enter ${field.label.toLowerCase()}`"
                  :disabled="isViewMode"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-divider content-position="left">
          <span class="topic-detail__meta-divider-text">Content</span>
        </el-divider>
        <el-form-item label="Tags" prop="tags">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="Press Enter to add a tag" class="topic-detail__tags" :disabled="isViewMode">
            <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <el-input v-if="!isViewMode" v-model="form.content" type="textarea" :rows="14" placeholder="Fill the template; the original prompt is pre-loaded." />
          <div v-else class="topic-detail__md" v-html="contentHtml" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts" name="TopicDetailPage">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowRight, CirclePlus, ArrowLeft, Delete as DeleteIcon, EditPen, Connection } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useMarkdown } from "@/hooks/useMarkdown";
import { callService } from "@/api/modules/dataService";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";
import {
  getTopicEntry,
  createTopicEntry,
  updateTopicEntry,
  deleteTopicEntry,
  contentPathFor,
  type TopicEntryDocument,
  type TopicTree
} from "@/api/modules/topic";

export interface MetaField {
  key: string;
  label: string;
  type: "input" | "select" | "date" | "number" | "textarea";
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  /** 1-24, Element Plus col span (default 12 for 2-col layout). */
  colSpan?: number;
  min?: number;
  max?: number;
  rows?: number;
}

const props = withDefaults(defineProps<{
  tree: TopicTree;
  topic: string;
  label: string;
  /** Original prompt content — pre-fills the editor when creating a new entry. */
  templateContent?: string;
  /** Topic-specific structured form fields rendered above the content textarea. */
  metaFields?: MetaField[];
  /** Form label-width (default "140px"). Pass a wider value for forms with longer labels. */
  labelWidth?: string;
}>(), {
  labelWidth: "140px"
});

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const entry = ref<TopicEntryDocument | null>(null);

const isNew = computed(() => route.params.id === "new" || !route.params.id);
const isViewMode = computed(() => route.query.mode === "view");

const metaFields = computed(() => props.metaFields ?? []);

const form = reactive({
  title: "",
  content: props.templateContent ?? "",
  tags: [] as string[],
  meta: {} as Record<string, any>
});

const knowledgeStore = useAicrKnowledgeStore();
const { render } = useMarkdown();
const contentHtml = computed(() => render(form.content));
const tagOptions = computed(() => Array.from(new Set([...(entry.value?.tags ?? []), ...form.tags])));

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }],
  content: [{ required: true, message: "Content is required", trigger: "blur" }]
};

async function loadEntry() {
  if (isNew.value) return;
  loading.value = true;
  try {
    const doc = await getTopicEntry<TopicEntryDocument>(props.tree, props.topic, String(route.params.id));
    if (!doc) {
      ElMessage.error("Entry not found");
      back();
      return;
    }
    entry.value = doc;
    form.title = doc.title;
    form.content = doc.content;
    form.tags = [...(doc.tags ?? [])];
    // Populate meta fields from saved data
    if (doc.meta) {
      Object.keys(form.meta).forEach(k => delete form.meta[k]);
      Object.assign(form.meta, doc.meta);
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to load entry");
  } finally {
    loading.value = false;
  }
}

async function editInAicr() {
  if (!isViewMode.value || !entry.value) return;
  const cpath = entry.value.contentPath || contentPathFor(props.tree, props.topic, entry.value.key);
  try {
    // Ensure the YiKnowledge file is current
    if (form.content) {
      await callService("services.knowledge.knowledge_service", "write_entry_markdown", {
        rel_path: cpath,
        content: form.content,
        meta: { title: form.title, key: entry.value.key, tags: form.tags }
      });
    }
    knowledgeStore.setPendingSelectPath(cpath);
    ElMessage.success("Opening in aicr…");
    router.push({
      path: "/aicr",
      query: {
        source: "brd",
        brdTopic: props.topic,
        brdKey: entry.value.key,
        brdTitle: form.title,
        brdBreadcrumb: props.label
      }
    });
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to open in aicr");
  }
}

async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  try {
    if (isNew.value) {
      await createTopicEntry(props.tree, props.topic, {
        title: form.title,
        content: form.content,
        tags: form.tags,
        meta: { ...form.meta }
      });
      ElMessage.success("Entry created");
    } else {
      await updateTopicEntry(props.tree, props.topic, entry.value!.key, {
        title: form.title,
        content: form.content,
        tags: form.tags,
        meta: { ...form.meta }
      });
      ElMessage.success("Entry updated");
    }
    back();
  } catch (e: any) {
    ElMessage.error(e?.message || "Save failed");
  }
}

async function handleDelete() {
  if (!entry.value) return;
  try {
    await deleteTopicEntry(props.tree, props.topic, entry.value.key);
    ElMessage.success("Entry deleted");
    back();
  } catch (e: any) {
    ElMessage.error(e?.message || "Delete failed");
  }
}

async function handleCancel() {
  if (isNew.value) {
    back();
    return;
  }
  // Reload original data and switch to view mode
  await loadEntry();
  router.replace({ query: { mode: "view" } });
}

function back() {
  const prefix = props.tree === "tech-leadership" ? "tlr" : props.tree === "brd" ? "brd" : "cr";
  // BRD topics already contain the tree prefix (e.g. "brd-documents").
  const topicName = props.topic.startsWith(props.tree + "-")
    ? props.topic.slice(props.tree.length + 1)
    : props.topic;
  router.push({ name: `${prefix}${pascal(topicName)}` });
}

function switchToEdit() {
  router.replace({ query: {} });
}

function pascal(s: string) {
  return s
    .split(/[-_]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

onMounted(loadEntry);
</script>

<style scoped lang="scss">
.topic-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color-page);
}
.topic-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.topic-detail__header-left {
  display: flex;
  gap: 8px;
  align-items: center;
}
.topic-detail__breadcrumb {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.topic-detail__breadcrumb-current {
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.topic-detail__body {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
.topic-detail__tags {
  width: 100%;
}
.topic-detail__meta-divider-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.topic-detail__form {
  :deep(.el-form-item__label) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.topic-detail__md {
  min-height: 200px;
  padding: 16px 20px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  max-height: 600px;
  overflow: auto;
  :deep(h1) { font-size: 1.5em; margin: 1em 0 0.4em; }
  :deep(h2) { font-size: 1.3em; margin: 0.9em 0 0.3em; }
  :deep(h3) { font-size: 1.15em; margin: 0.8em 0 0.2em; }
  :deep(p) { margin: 0.5em 0; }
  :deep(ul), :deep(ol) { padding-left: 1.6em; margin: 0.4em 0; }
  :deep(li) { margin: 0.15em 0; }
  :deep(code) {
    padding: 2px 6px;
    background: var(--el-color-primary-light-9);
    border-radius: 3px;
    font-size: 0.9em;
  }
  :deep(pre) {
    padding: 12px 16px;
    background: var(--el-bg-color-page);
    border-radius: 4px;
    overflow: auto;
    code { padding: 0; background: none; }
  }
  :deep(blockquote) {
    margin: 0.5em 0;
    padding: 4px 14px;
    border-left: 3px solid var(--el-color-primary);
    background: var(--el-bg-color);
    color: var(--el-text-color-secondary);
  }
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 0.6em 0;
    th, td { border: 1px solid var(--el-border-color); padding: 6px 10px; text-align: left; }
    th { background: var(--el-fill-color); font-weight: 600; }
  }
}
</style>
