<template>
  <div class="topic-detail" v-loading="loading">
    <header class="topic-detail__header">
      <div class="topic-detail__header-left">
        <el-button :icon="ArrowLeft" link @click="back">{{ $t("topicDetail.backToList") }}</el-button>
        <el-divider direction="vertical" />
        <nav class="topic-detail__breadcrumb" aria-label="Breadcrumb">
          <span class="topic-detail__breadcrumb-root">{{ label }}</span>
          <el-icon><ArrowRight /></el-icon>
          <span class="topic-detail__breadcrumb-current">{{ isNew ? $t("topicDetail.newEntry") : entry?.title || route.params.id }}</span>
        </nav>
      </div>
      <div class="topic-detail__header-right">
        <template v-if="isViewMode">

          <el-button type="primary" :icon="EditPen" @click="switchToEdit">{{ $t("topicDetail.edit") }}</el-button>
        </template>
        <template v-else>
          <el-button @click="handleCancel">{{ $t("topicDetail.cancel") }}</el-button>
          <el-button v-if="!isNew" type="danger" :icon="DeleteIcon" @click="handleDelete">{{ $t("topicDetail.delete") }}</el-button>
          <el-button type="primary" :icon="CirclePlus" @click="handleSave">{{ $t("topicDetail.save") }}</el-button>
        </template>
      </div>
    </header>

    <div class="topic-detail__body">
      <el-form ref="formRef" :model="form" :rules="rules" :label-width="labelWidth" label-suffix=" :" class="topic-detail__form">
        <el-form-item :label="$t('topicDetail.title')" prop="title">
          <el-input v-model="form.title" :placeholder="$t('topicDetail.titlePlaceholder')" clearable :disabled="isViewMode" />
        </el-form-item>

        <!-- Structured meta fields -->
        <template v-if="metaFields.length">
          <el-divider content-position="left">
            <span class="topic-detail__meta-divider-text">{{ $t("topicDetail.structuredFields") }}</span>
          </el-divider>
          <el-row :gutter="16">
            <el-col v-for="field in translatedMetaFields" :key="field.key" :span="field.colSpan ?? 12" :xs="24" :sm="field.colSpan ?? 12">
              <el-form-item :label="field.label" :prop="`meta.${field.key}`" :required="field.required">
                <!-- Input -->
                <el-input
                  v-if="field.type === 'input'"
                  v-model="form.meta[field.key]"
                  :placeholder="field.placeholder"
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
                  :placeholder="field.placeholder"
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
                  :placeholder="field.placeholder"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  :disabled="isViewMode"
                />
                <!-- Textarea -->
                <el-input
                  v-if="field.type === 'textarea' && !isViewMode"
                  v-model="form.meta[field.key]"
                  type="textarea"
                  :autosize="{ minRows: field.rows ?? 3, maxRows: 40 }"
                  :placeholder="field.placeholder"
                />
                <div
                  v-else-if="field.type === 'textarea' && isViewMode"
                  class="topic-detail__textarea-view"
                >{{ form.meta[field.key] || "—" }}</div>
                <!-- Array-field (key-value repeater) -->
                <template v-else-if="field.type === 'array-field'">
                  <!-- Edit mode: dynamic key-value rows -->
                  <div v-if="!isViewMode" class="array-field">
                    <div
                      v-for="(row, idx) in getArrayRows(field.key)"
                      :key="idx"
                      class="array-field__row"
                    >
                      <el-input
                        v-model="row.key"
                        :placeholder="field.arrayPlaceholders?.key || $t('topicDetail.arrayFieldKeyPlaceholder')"
                        class="array-field__key"
                        clearable
                      />
                      <el-input
                        v-model="row.value"
                        :placeholder="field.arrayPlaceholders?.value || $t('topicDetail.arrayFieldValuePlaceholder')"
                        class="array-field__value"
                        clearable
                      />
                      <el-button
                        :icon="DeleteIcon"
                        circle
                        size="small"
                        type="danger"
                        plain
                        @click="removeArrayRow(field.key, idx)"
                      />
                    </div>
                    <el-button
                      :icon="CirclePlus"
                      size="small"
                      type="primary"
                      plain
                      @click="addArrayRow(field.key)"
                    >
                      {{ $t("topicDetail.arrayFieldAddRow") }}
                    </el-button>
                  </div>
                  <!-- View mode: read-only table -->
                  <div v-else class="array-field">
                    <table v-if="getArrayRows(field.key).length" class="array-field__table">
                      <thead>
                        <tr>
                          <th>{{ field.arrayLabels?.key || $t("topicDetail.arrayFieldKeyLabel") }}</th>
                          <th>{{ field.arrayLabels?.value || $t("topicDetail.arrayFieldValueLabel") }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, idx) in getArrayRows(field.key)" :key="idx">
                          <td>{{ row.key }}</td>
                          <td>{{ row.value }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <span v-else class="array-field__empty">{{ $t("topicDetail.arrayFieldEmpty") }}</span>
                  </div>
                </template>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-divider content-position="left">
          <span class="topic-detail__meta-divider-text">{{ $t("topicDetail.contentDivider") }}</span>
        </el-divider>
        <el-form-item :label="$t('topicDetail.tags')" prop="tags">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option :placeholder="$t('topicDetail.tagsPlaceholder')" class="topic-detail__tags" :disabled="isViewMode">
            <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('topicDetail.contentLabel')" prop="content">
          <el-input v-if="!isViewMode" v-model="form.content" type="textarea" :autosize="{ minRows: 20, maxRows: 60 }" :placeholder="$t('topicDetail.contentPlaceholder')" />
          <div v-else class="topic-detail__md" v-html="contentHtml" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts" name="TopicDetailPage">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowRight, CirclePlus, ArrowLeft, Delete as DeleteIcon, EditPen } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useMarkdown } from "@/hooks/useMarkdown";
import { callService } from "@/api/modules/dataService";

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
  type: "input" | "select" | "date" | "number" | "textarea" | "array-field";
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  /** 1-24, Element Plus col span (default 12 for 2-col layout). */
  colSpan?: number;
  min?: number;
  max?: number;
  rows?: number;
  /** Labels for key/value columns in array-field (default: "Key" / "Value"). */
  arrayLabels?: { key: string; value: string };
  /** Placeholders for key/value inputs in array-field. */
  arrayPlaceholders?: { key: string; value: string };
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
  /** i18n key prefix for translating meta-field labels (e.g. "brdMeta.brdDocuments"). Falls back to raw label when omitted. */
  i18nPrefix?: string;
}>(), {
  labelWidth: "140px"
});

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const entry = ref<TopicEntryDocument | null>(null);

const isNew = computed(() => route.params.id === "new" || !route.params.id);
const isViewMode = computed(() => route.query.mode === "view");

const metaFields = computed(() => props.metaFields ?? []);

/**
 * Translates an option label using brdMeta.options.<value> convention.
 * Falls back to the raw label when no translation is found.
 */
function translateOptionLabel(opt: { label: string; value: string }): string {
  const key = `brdMeta.options.${opt.value}`;
  const translated = t(key);
  return translated !== key ? translated : opt.label;
}

/**
 * Returns metaFields with all labels, placeholders, and option labels translated.
 * Uses i18nPrefix (e.g. "brdMeta.brdDocuments") to resolve field-level keys:
 *   - label: t(`${i18nPrefix}.fields.${field.key}`) ?? field.label
 *   - placeholder: t(`${i18nPrefix}.placeholders.${field.key}`) ?? field.placeholder ?? dynamic fallback
 */
const translatedMetaFields = computed(() => {
  if (!props.i18nPrefix) return metaFields.value;
  return metaFields.value.map(field => {
    // Translate label
    const labelKey = `${props.i18nPrefix}.fields.${field.key}`;
    const translatedLabel = t(labelKey);
    const label = translatedLabel !== labelKey ? translatedLabel : field.label;

    // Translate placeholder
    let placeholder = field.placeholder;
    const phKey = `${props.i18nPrefix}.placeholders.${field.key}`;
    const translatedPh = t(phKey);
    if (translatedPh !== phKey) {
      placeholder = translatedPh;
    } else if (!placeholder) {
      // Dynamic fallback placeholder
      const lcLabel = label.toLowerCase();
      if (field.type === "date") {
        placeholder = t("topicDetail.pickDate");
      } else if (field.type === "select") {
        placeholder = t("topicDetail.selectField", { field: lcLabel });
      } else {
        placeholder = t("topicDetail.enterField", { field: lcLabel });
      }
    }

    // Translate option labels
    const options = field.options?.map(opt => ({
      ...opt,
      label: translateOptionLabel(opt)
    }));

    return { ...field, label, placeholder, options };
  });
});

const form = reactive({
  title: "",
  content: props.templateContent ?? "",
  tags: [] as string[],
  meta: {} as Record<string, any>
});

const { render } = useMarkdown();
const contentHtml = computed(() => render(form.content));
const tagOptions = computed(() => Array.from(new Set([...(entry.value?.tags ?? []), ...form.tags])));

const rules: FormRules = {
  title: [{ required: true, message: t("topicDetail.titleRequired"), trigger: "blur" }],
  content: [{ required: true, message: t("topicDetail.contentRequired"), trigger: "blur" }]
};

async function loadEntry() {
  if (isNew.value) return;
  loading.value = true;
  try {
    const doc = await getTopicEntry<TopicEntryDocument>(props.tree, props.topic, String(route.params.id));
    if (!doc) {
      ElMessage.error(t("topicDetail.entryNotFound"));
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
    ElMessage.error(e?.message || t("topicDetail.loadFailed"));
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
        meta: { ...form.meta }
      });
      ElMessage.success(t("topicDetail.entryCreated"));
    } else {
      await updateTopicEntry(props.tree, props.topic, entry.value!.key, {
        title: form.title,
        content: form.content,
        tags: form.tags,
        meta: { ...form.meta }
      });
      ElMessage.success(t("topicDetail.entryUpdated"));
    }
    back();
  } catch (e: any) {
    ElMessage.error(e?.message || t("topicDetail.saveFailed"));
  }
}

async function handleDelete() {
  if (!entry.value) return;
  try {
    await deleteTopicEntry(props.tree, props.topic, entry.value.key);
    ElMessage.success(t("topicDetail.entryDeleted"));
    back();
  } catch (e: any) {
    ElMessage.error(e?.message || t("topicDetail.deleteFailed"));
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

// ── Array-field helpers ──────────────────────────────────────────────────

function ensureArrayField(key: string) {
  if (!Array.isArray(form.meta[key])) {
    form.meta[key] = [];
  }
}

function getArrayRows(key: string): { key: string; value: string }[] {
  ensureArrayField(key);
  return form.meta[key];
}

function addArrayRow(key: string) {
  ensureArrayField(key);
  form.meta[key].push({ key: "", value: "" });
}

function removeArrayRow(key: string, idx: number) {
  ensureArrayField(key);
  form.meta[key].splice(idx, 1);
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
  min-height: 100%;
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
.topic-detail__textarea-view {
  width: 100%;
  min-height: 2.4em;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}
.topic-detail__md {
  padding: 32px 40px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--el-text-color-primary);

  /* ── Headings ──────────────────────────────────────────────────── */
  :deep(h1) {
    font-size: 1.75em;
    margin: 1.6em 0 0.6em;
    padding-bottom: 0.4em;
    border-bottom: 2px solid var(--el-border-color-lighter);
    color: var(--el-text-color-primary);
    font-weight: 700;
  }
  :deep(h2) {
    font-size: 1.4em;
    margin: 1.4em 0 0.5em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
  :deep(h3) {
    font-size: 1.15em;
    margin: 1.2em 0 0.4em;
    color: var(--el-text-color-regular);
    font-weight: 600;
  }
  :deep(h1:first-child),
  :deep(h2:first-child),
  :deep(h3:first-child) {
    margin-top: 0;
  }

  /* ── Paragraphs & lists ─────────────────────────────────────────── */
  :deep(p) { margin: 0.7em 0; }
  :deep(ul), :deep(ol) { padding-left: 1.8em; margin: 0.6em 0; }
  :deep(li) { margin: 0.25em 0; }
  :deep(strong) { font-weight: 600; color: var(--el-text-color-primary); }

  /* ── Horizontal rule (section separator) ────────────────────────── */
  :deep(hr) {
    margin: 2em 0;
    border: none;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  /* ── Inline code ────────────────────────────────────────────────── */
  :deep(code) {
    padding: 2px 7px;
    background: var(--el-color-primary-light-9);
    border-radius: 4px;
    font-size: 0.88em;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    color: var(--el-color-primary-dark-2);
  }

  /* ── Code blocks ────────────────────────────────────────────────── */
  :deep(pre) {
    padding: 16px 20px;
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow-x: auto;
    margin: 1em 0;
    code { padding: 0; background: none; color: var(--el-text-color-primary); font-size: 0.85em; }
  }

  /* ── Blockquote (callout) ───────────────────────────────────────── */
  :deep(blockquote) {
    margin: 1em 0;
    padding: 12px 18px;
    border-left: 4px solid var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 0 6px 6px 0;
    color: var(--el-text-color-secondary);
    p { margin: 0.3em 0; }
  }

  /* ── Tables ─────────────────────────────────────────────────────── */
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    font-size: 0.93em;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    th, td {
      padding: 10px 14px;
      border: 1px solid var(--el-border-color-lighter);
      text-align: left;
      vertical-align: top;
    }
    th {
      background: var(--el-fill-color);
      font-weight: 600;
      color: var(--el-text-color-secondary);
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    tbody tr:nth-child(even) {
      background: var(--el-fill-color-lighter);
    }
    tbody tr:hover {
      background: var(--el-color-primary-light-9);
    }
  }

  /* ── Links ──────────────────────────────────────────────────────── */
  :deep(a) {
    color: var(--el-color-primary);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  /* ── Images ─────────────────────────────────────────────────────── */
  :deep(img) {
    max-width: 100%;
    border-radius: 6px;
    margin: 1em 0;
  }
}

/* ── Array-field ────────────────────────────────────────────────────────── */
.array-field {
  width: 100%;
}
.array-field__row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.array-field__key {
  flex: 2;
}
.array-field__value {
  flex: 3;
}
.array-field__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th, td {
    padding: 8px 12px;
    border: 1px solid var(--el-border-color-lighter);
    text-align: left;
  }
  th {
    background: var(--el-fill-color);
    font-weight: 600;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  tbody tr:nth-child(even) {
    background: var(--el-fill-color-lighter);
  }
}
.array-field__empty {
  display: block;
  padding: 12px;
  color: var(--el-text-color-placeholder);
  font-style: italic;
  font-size: 13px;
}
</style>
