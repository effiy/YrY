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
        <el-button v-if="!isNew" type="danger" :icon="DeleteIcon" @click="handleDelete">Delete</el-button>
        <el-button type="primary" :icon="CirclePlus" @click="handleSave">Save</el-button>
      </div>
    </header>

    <div class="topic-detail__body">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" label-suffix=" :">
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" placeholder="Concise entry title" clearable />
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
                  v-model="formMeta[field.key]"
                  :placeholder="field.placeholder ?? `Enter ${field.label.toLowerCase()}`"
                  clearable
                />
                <!-- Number -->
                <el-input-number
                  v-else-if="field.type === 'number'"
                  v-model="formMeta[field.key]"
                  :placeholder="field.placeholder"
                  :min="field.min"
                  :max="field.max"
                  controls-position="right"
                  style="width: 100%"
                />
                <!-- Select -->
                <el-select
                  v-else-if="field.type === 'select'"
                  v-model="formMeta[field.key]"
                  :placeholder="field.placeholder ?? `Select ${field.label.toLowerCase()}`"
                  clearable
                  style="width: 100%"
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
                  v-model="formMeta[field.key]"
                  type="date"
                  :placeholder="field.placeholder ?? 'Pick a date'"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
                <!-- Textarea -->
                <el-input
                  v-else-if="field.type === 'textarea'"
                  v-model="formMeta[field.key]"
                  type="textarea"
                  :rows="field.rows ?? 3"
                  :placeholder="field.placeholder ?? `Enter ${field.label.toLowerCase()}`"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-divider content-position="left">
          <span class="topic-detail__meta-divider-text">Content</span>
        </el-divider>
        <el-form-item label="Tags" prop="tags">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="Press Enter to add a tag" class="topic-detail__tags">
            <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="14" placeholder="Fill the template; the original prompt is pre-loaded." />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts" name="TopicDetailPage">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowRight, CirclePlus, ArrowLeft, Delete as DeleteIcon } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  getTopicEntry,
  createTopicEntry,
  updateTopicEntry,
  deleteTopicEntry,
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

const props = defineProps<{
  tree: TopicTree;
  topic: string;
  label: string;
  /** Original prompt content — pre-fills the editor when creating a new entry. */
  templateContent?: string;
  /** Topic-specific structured form fields rendered above the content textarea. */
  metaFields?: MetaField[];
}>();

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const entry = ref<TopicEntryDocument | null>(null);

const isNew = computed(() => route.params.id === "new" || !route.params.id);

const metaFields = computed(() => props.metaFields ?? []);

const form = reactive({
  title: "",
  content: props.templateContent ?? "",
  tags: [] as string[]
});

/** Reactive bag for meta field values — synced to entry.meta on load / save. */
const formMeta = reactive<Record<string, any>>({});

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
      Object.keys(formMeta).forEach(k => delete formMeta[k]);
      Object.assign(formMeta, doc.meta);
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to load entry");
  } finally {
    loading.value = false;
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
        meta: { ...formMeta }
      });
      ElMessage.success("Entry created");
    } else {
      await updateTopicEntry(props.tree, props.topic, entry.value!.key, {
        title: form.title,
        content: form.content,
        tags: form.tags,
        meta: { ...formMeta }
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

function back() {
  router.push({ name: props.tree === "tech-leadership" ? `tlr${pascal(props.topic)}List` : `cr${pascal(props.topic)}List` });
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
</style>
