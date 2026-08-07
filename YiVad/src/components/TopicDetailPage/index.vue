<template>
  <div class="topic-detail" v-loading="loading">
    <header class="topic-detail__header">
      <div class="topic-detail__header-left">
        <el-button :icon="ArrowLeft" link @click="back">{{ $t("topicDetail.backToList") }}</el-button>
        <el-divider direction="vertical" />
        <nav class="topic-detail__breadcrumb" aria-label="Breadcrumb">
          <span class="topic-detail__breadcrumb-root">{{ label || topicLabel(topic) }}</span>
          <el-icon><ArrowRight /></el-icon>
          <span class="topic-detail__breadcrumb-current">{{
            isNew ? $t("topicDetail.newEntry") : entry?.title || route.params.id
          }}</span>
        </nav>
      </div>
      <div class="topic-detail__header-right">
        <span v-if="!isViewMode" class="topic-detail__shortcut-hint">{{ $t("topicDetail.shortcutHint") }}</span>
        <template v-if="isViewMode">
          <el-button v-if="!isNew" :icon="Link" @click="copyPermalink">{{ $t("topicDetail.copyLink") }}</el-button>
          <el-button v-if="!isNew" :icon="ChatDotRound" @click="discussInAiChat">{{ $t("topicDetail.discussInAiChat") }}</el-button>
          <el-button v-if="!isNew" link @click="viewRelatedAiChatSessions">Related AI Chat sessions</el-button>
          <el-button type="primary" :icon="EditPen" @click="switchToEdit">{{ $t("topicDetail.edit") }}</el-button>
        </template>
        <template v-else>
          <el-button @click="handleCancel">{{ $t("topicDetail.cancel") }}</el-button>
          <el-button v-if="!isNew" type="danger" :icon="DeleteIcon" @click="handleDelete">{{
            $t("topicDetail.delete")
          }}</el-button>
          <el-button v-if="!isNew" plain type="primary" @click="saveAndContinue">{{
            $t("topicDetail.saveAndContinue")
          }}</el-button>
          <el-button type="primary" :icon="CirclePlus" @click="handleSave()">{{ $t("topicDetail.save") }}</el-button>
        </template>
      </div>
    </header>

    <div class="topic-detail__body">
      <el-form ref="formRef" :model="form" :rules="rules" :label-width="labelWidth" label-suffix=" :" class="topic-detail__form">
        <el-form-item :label="$t('topicDetail.title')" prop="title">
          <el-input
            v-model="form.title"
            :placeholder="titlePlaceholder || $t('topicDetail.titlePlaceholder')"
            clearable
            :disabled="isViewMode"
            maxlength="120"
            show-word-limit
          />
        </el-form-item>

        <!-- Structured meta fields -->
        <template v-if="metaFields.length">
          <el-divider content-position="left">
            <span class="topic-detail__meta-divider-text">{{ $t("topicDetail.structuredFields") }}</span>
          </el-divider>
          <el-row :gutter="16">
            <el-col
              v-for="field in translatedMetaFields"
              :key="field.key"
              :span="field.colSpan ?? 12"
              :xs="24"
              :sm="field.colSpan ?? 12"
            >
              <el-form-item :label="field.label" :prop="`meta.${field.key}`" :required="field.required">
                <!-- View mode: read-only text for input/number/select/date -->
                <div
                  v-if="isViewMode && ['input', 'number', 'select', 'date'].includes(field.type)"
                  class="topic-detail__meta-view"
                >
                  {{ formatMetaValue(field, form.meta[field.key]) }}
                </div>
                <!-- Edit mode: form controls -->
                <el-input
                  v-else-if="field.type === 'input'"
                  v-model="form.meta[field.key]"
                  :placeholder="field.placeholder"
                  clearable
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
                />
                <!-- Select -->
                <el-select
                  v-else-if="field.type === 'select'"
                  v-model="form.meta[field.key]"
                  :placeholder="field.placeholder"
                  clearable
                  style="width: 100%"
                >
                  <el-option v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
                <!-- Date -->
                <el-date-picker
                  v-else-if="field.type === 'date'"
                  v-model="form.meta[field.key]"
                  type="date"
                  :placeholder="field.placeholder"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
                <!-- Textarea -->
                <el-input
                  v-if="field.type === 'textarea' && !isViewMode"
                  v-model="form.meta[field.key]"
                  type="textarea"
                  :autosize="{ minRows: field.rows ?? 3, maxRows: 40 }"
                  :placeholder="field.placeholder"
                />
                <div v-else-if="field.type === 'textarea' && isViewMode" class="topic-detail__textarea-view">
                  {{ form.meta[field.key] || "—" }}
                </div>
                <!-- Array-field (key-value repeater) -->
                <template v-else-if="field.type === 'array-field'">
                  <!-- Edit mode: dynamic key-value rows -->
                  <div v-if="!isViewMode" class="array-field">
                    <div v-for="(row, idx) in getArrayRows(field.key)" :key="idx" class="array-field__row">
                      <div class="array-field__index">{{ idx + 1 }}</div>
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
                        :icon="ArrowUp"
                        circle
                        size="small"
                        :disabled="idx === 0"
                        :title="$t('topicDetail.moveUp')"
                        @click="moveArrayRow(field.key, idx, -1)"
                      />
                      <el-button
                        :icon="ArrowDown"
                        circle
                        size="small"
                        :disabled="idx === getArrayRows(field.key).length - 1"
                        :title="$t('topicDetail.moveDown')"
                        @click="moveArrayRow(field.key, idx, 1)"
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
                    <el-button :icon="CirclePlus" size="small" type="primary" plain @click="addArrayRow(field.key)">
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
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="tagsHint || $t('topicDetail.tagsPlaceholder')"
            class="topic-detail__tags"
            :disabled="isViewMode"
          >
            <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('topicDetail.contentLabel')" prop="content">
          <div v-if="!isViewMode" class="topic-detail__editor">
            <div class="topic-detail__editor-bar">
              <span class="topic-detail__editor-count">{{ $t("topicDetail.wordCount", { chars: contentChars, words: contentWords }) }}</span>
              <el-radio-group v-model="editorMode" size="small">
                <el-radio-button value="edit">{{ $t("topicDetail.editorModeEdit") }}</el-radio-button>
                <el-radio-button value="split">{{ $t("topicDetail.editorModeSplit") }}</el-radio-button>
                <el-radio-button value="preview">{{ $t("topicDetail.editorModePreview") }}</el-radio-button>
              </el-radio-group>
            </div>
            <div class="topic-detail__editor-body" :class="`is-${editorMode}`">
              <el-input
                v-show="editorMode !== 'preview'"
                v-model="form.content"
                type="textarea"
                :autosize="{ minRows: 20, maxRows: 60 }"
                :placeholder="$t('topicDetail.contentPlaceholder')"
                class="topic-detail__editor-input"
              />
              <div
                v-show="editorMode !== 'edit'"
                class="topic-detail__md topic-detail__editor-preview"
                v-html="contentHtml"
              />
            </div>
          </div>
          <div v-else class="topic-detail__content-wrap">
            <div class="topic-detail__md" v-html="tocContent.html" />
            <aside v-if="tocContent.toc.length >= 2" class="topic-detail__toc" aria-label="Table of contents">
              <div class="topic-detail__toc-title">{{ $t("topicDetail.tocTitle") }}</div>
              <ul>
                <li
                  v-for="item in tocContent.toc"
                  :key="item.id"
                  :class="`topic-detail__toc-item topic-detail__toc-item--h${item.level}`"
                >
                  <a :href="`#${item.id}`" @click.prevent="scrollToHeading(item.id)">{{ item.text }}</a>
                </li>
              </ul>
            </aside>
          </div>
        </el-form-item>
      </el-form>

      <!-- Slot for related cross-topic entries; only rendered in view mode after the form. -->
      <div v-if="isViewMode && !isNew && $slots.related" class="topic-detail__related">
        <slot name="related" :entry="entry" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="TopicDetailPage">
import { ref, reactive, computed, onMounted, onBeforeUnmount, h } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowRight, CirclePlus, ArrowLeft, ArrowUp, ArrowDown, Delete as DeleteIcon, EditPen, Link, ChatDotRound } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { buildRelatedEntriesSection } from "@/hooks/useRelatedByProject";
import { callService } from "@/api/modules/dataService";
import { topicLabel } from "@/views/brd/topicLabels";

import {
  getTopicEntry,
  createTopicEntry,
  updateTopicEntry,
  deleteTopicEntry,
  contentPathFor,
  makeKey,
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

const props = withDefaults(
  defineProps<{
    tree: TopicTree;
    topic: string;
    label?: string;
    /** Original prompt content — pre-fills the editor when creating a new entry. */
    templateContent?: string;
    /** Topic-specific structured form fields rendered above the content textarea. */
    metaFields?: MetaField[];
    /** Form label-width (default "140px"). Pass a wider value for forms with longer labels. */
    labelWidth?: string;
    /** i18n key prefix for translating meta-field labels (e.g. "brdMeta.brdDocuments"). Falls back to raw label when omitted. */
    i18nPrefix?: string;
    /** Role-specific placeholder for the built-in title input. Overrides the default i18n placeholder. */
    titlePlaceholder?: string;
    /** Role-specific hint shown as placeholder for the built-in tags select. */
    tagsHint?: string;
  }>(),
  {
    labelWidth: "140px"
  }
);

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

// ── Unsaved-changes guard ────────────────────────────────────────────────
// Snapshot of the form right after load or save. Compared against the live
// form to detect dirty state; used to intercept navigation away from the page.
const initialSnapshot = ref("");

function snapshot(): string {
  return JSON.stringify({
    title: form.title,
    content: form.content,
    tags: [...form.tags],
    meta: { ...form.meta }
  });
}

const isDirty = computed(() => snapshot() !== initialSnapshot.value);

async function confirmDiscard(): Promise<boolean> {
  if (!isDirty.value) return true;
  try {
    await ElMessageBox.confirm(t("topicDetail.unsavedChanges"), t("topicDetail.unsavedChangesTitle"), {
      type: "warning",
      distinguishCancelAndClose: true,
      confirmButtonText: t("topicDetail.discard"),
      cancelButtonText: t("topicDetail.cancel")
    });
    return true;
  } catch {
    return false;
  }
}

function beforeUnloadHandler(e: BeforeUnloadEvent) {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = "";
  }
}

onBeforeRouteLeave(async () => await confirmDiscard());

const { render } = useMarkdown();
const contentHtml = computed(() => render(form.content));
const tagOptions = computed(() => Array.from(new Set([...(entry.value?.tags ?? []), ...form.tags])));

// ── Markdown TOC (view mode) ──────────────────────────────────────────────
// Post-process rendered HTML: add IDs to h2/h3 and collect them as a TOC.
// Only rendered for view mode; click → smooth scroll to the heading.
interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}
function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) || `heading-${Math.random().toString(36).slice(2, 6)}`
  );
}
const tocContent = computed<{ html: string; toc: TocItem[] }>(() => {
  const html = contentHtml.value;
  if (!html) return { html: "", toc: [] };
  const doc = new DOMParser().parseFromString(html, "text/html");
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();
  doc.querySelectorAll("h2, h3").forEach(h => {
    const level = (h.tagName === "H2" ? 2 : 3) as 2 | 3;
    const text = h.textContent || "";
    let id = slugify(text);
    while (usedIds.has(id)) id = `${id}-1`;
    usedIds.add(id);
    h.id = id;
    toc.push({ id, text, level });
  });
  return { html: doc.body.innerHTML, toc };
});
function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Editor view mode: edit-only / split / preview-only. Reset to edit on entry switch.
type EditorMode = "edit" | "split" | "preview";
const editorMode = ref<EditorMode>("edit");

const contentChars = computed(() => form.content.length);
const contentWords = computed(() => {
  const trimmed = form.content.trim();
  if (!trimmed) return 0;
  // CJK characters counted individually; latin words split by whitespace.
  const cjk = (trimmed.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  const latin = (trimmed.match(/[a-zA-Z0-9]+/g) || []).length;
  return cjk + latin;
});

const rules = computed<FormRules>(() => {
  const r: FormRules = {
    title: [{ required: true, message: t("topicDetail.titleRequired"), trigger: "blur" }],
    content: [{ required: true, message: t("topicDetail.contentRequired"), trigger: "blur" }]
  };
  for (const field of translatedMetaFields.value) {
    if (!field.required) continue;
    r[`meta.${field.key}`] = [
      {
        required: true,
        message: t("topicDetail.fieldRequired", { field: field.label }),
        trigger: field.type === "select" || field.type === "date" || field.type === "number" ? "change" : "blur"
      }
    ];
  }
  return r;
});

async function loadEntry() {
  if (isNew.value) {
    initialSnapshot.value = snapshot();
    editorMode.value = "edit";
    return;
  }
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
    initialSnapshot.value = snapshot();
    editorMode.value = "edit";
  } catch (e: any) {
    ElMessage.error(e?.message || t("topicDetail.loadFailed"));
  } finally {
    loading.value = false;
  }
}

async function handleSave(stay = false) {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  try {
    let viewKey: string;
    if (isNew.value) {
      // Pre-generate key so the toast's "view" link can navigate to it.
      viewKey = makeKey(props.tree, props.topic);
      await createTopicEntry(
        props.tree,
        props.topic,
        {
          title: form.title,
          content: form.content,
          tags: form.tags,
          meta: { ...form.meta }
        },
        viewKey
      );
      showSaveToast("topicDetail.entryCreated", viewKey);
    } else {
      viewKey = entry.value!.key;
      await updateTopicEntry(props.tree, props.topic, viewKey, {
        title: form.title,
        content: form.content,
        tags: form.tags,
        meta: { ...form.meta }
      });
      showSaveToast("topicDetail.entryUpdated", viewKey);
    }
    initialSnapshot.value = snapshot();
    if (stay && !isNew.value) {
      // Save & continue — switch to view mode without leaving the page.
      await router.replace({ query: { mode: "view" } });
    } else {
      back();
    }
  } catch (e: any) {
    ElMessage.error(e?.message || t("topicDetail.saveFailed"));
  }
}

async function saveAndContinue() {
  await handleSave(true);
}

// ── Save toast with "view" action ──────────────────────────────────────────
// Renders a VNode message so the toast carries a clickable link that jumps
// to the just-saved entry's view URL — survives the subsequent navigation.
function detailRouteName(): string {
  const prefix = props.tree === "tech-leadership" ? "tlr" : props.tree === "brd" ? "brd" : "cr";
  const topicName = props.topic.startsWith(props.tree + "-") ? props.topic.slice(props.tree.length + 1) : props.topic;
  return `${prefix}${pascal(topicName)}Detail`;
}
function showSaveToast(messageKey: string, key: string) {
  ElMessage({
    type: "success",
    duration: 5000,
    message: h("span", { style: "display: inline-flex; align-items: center; gap: 12px;" }, [
      t(messageKey),
      h(
        "a",
        {
          style: "color: var(--el-color-primary); cursor: pointer; font-size: 13px; text-decoration: none;",
          onClick: (e: Event) => {
            e.preventDefault();
            router.push({ name: detailRouteName(), params: { id: key }, query: { mode: "view" } });
          }
        },
        t("common.view")
      )
    ])
  });
}

// ── View-mode meta value formatter ─────────────────────────────────────────
// Renders plain text instead of disabled form controls — cleaner read-only UX.
function formatMetaValue(field: MetaField, val: any): string {
  if (val === undefined || val === null || val === "") return "—";
  if (field.type === "select") {
    const opt = field.options?.find(o => o.value === val);
    return opt?.label ?? String(val);
  }
  if (field.type === "date") {
    // Stored as YYYY-MM-DD; pass through.
    return String(val);
  }
  if (field.type === "number") {
    return typeof val === "number" ? String(val) : String(val);
  }
  return String(val);
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
  await router.replace({ query: { mode: "view" } });
}

function back() {
  const prefix = props.tree === "tech-leadership" ? "tlr" : props.tree === "brd" ? "brd" : "cr";
  // BRD topics already contain the tree prefix (e.g. "brd-documents").
  const topicName = props.topic.startsWith(props.tree + "-") ? props.topic.slice(props.tree.length + 1) : props.topic;
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

function moveArrayRow(key: string, idx: number, dir: -1 | 1) {
  ensureArrayField(key);
  const arr = form.meta[key];
  const next = idx + dir;
  if (next < 0 || next >= arr.length) return;
  [arr[idx], arr[next]] = [arr[next], arr[idx]];
}

function switchToEdit() {
  router.replace({ query: {} });
}

async function copyPermalink() {
  try {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    ElMessage.success(t("topicDetail.copyLinkSuccess"));
  } catch {
    ElMessage.error(t("topicDetail.copyLinkFailed"));
  }
}

const { openInAiChat, linkToAiChatByTag } = useAiChatBridge();

async function discussInAiChat() {
  if (!entry.value) return;
  const ctxPath = `${props.tree}/${props.topic}/${entry.value.key}`;
  const project = entry.value.meta?.project as string | undefined;
  const tags = [`ctx:${ctxPath}`, props.tree, props.topic, `${props.topic}:${entry.value.key}`];
  if (project) tags.push(`project:${project}`);
  let pageContent = form.content;
  if (project) {
    const section = await buildRelatedEntriesSection(project, entry.value.key, props.topic);
    if (section) pageContent = `${pageContent}\n${section}`;
  }
  await openInAiChat({
    title: entry.value.title || `${props.label || topicLabel(props.topic)} — ${entry.value.key}`,
    pageContent,
    tags,
    sourceUrl: router.currentRoute.value.fullPath
  });
}

function viewRelatedAiChatSessions() {
  if (!entry.value?.key) return;
  router.push(linkToAiChatByTag(`${props.topic}:${entry.value.key}`));
}

function pascal(s: string) {
  return s
    .split(/[-_]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────
// Ctrl/Cmd+S → save (edit mode only). Esc → cancel (edit) or back (view).
// Alt+1/2/3 → editor mode edit/split/preview (edit mode only).
// Defer Esc to inputs / selects / dialogs first so they can close themselves.
function keydownHandler(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  const isInInput = tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true;
  const inOverlay = !!target?.closest(".el-dialog, .el-popper, .el-select-dropdown");

  if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    if (!isViewMode.value && !inOverlay) void handleSave();
    return;
  }
  if (e.altKey && (e.key === "1" || e.key === "2" || e.key === "3") && !isViewMode.value && !inOverlay) {
    e.preventDefault();
    editorMode.value = e.key === "1" ? "edit" : e.key === "2" ? "split" : "preview";
    return;
  }
  if (e.key === "Escape" && !isInInput && !inOverlay) {
    e.preventDefault();
    if (isViewMode.value) back();
    else void handleCancel();
  }
}

onMounted(() => {
  loadEntry();
  window.addEventListener("beforeunload", beforeUnloadHandler);
  window.addEventListener("keydown", keydownHandler);
});
onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeUnloadHandler);
  window.removeEventListener("keydown", keydownHandler);
});
</script>

<style scoped lang="scss">
.topic-detail {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  max-height: calc(100vh - 95px);
  overflow: hidden;
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
.topic-detail__shortcut-hint {
  margin-right: 12px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", "Menlo", monospace;
  white-space: nowrap;
}
.topic-detail__editor {
  width: 100%;
}
.topic-detail__editor-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.topic-detail__editor-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", "Menlo", monospace;
  white-space: nowrap;
}
.topic-detail__editor-body {
  display: flex;
  gap: 12px;
  width: 100%;
}
.topic-detail__editor-body.is-edit .topic-detail__editor-input {
  flex: 1;
  width: 100%;
}
.topic-detail__editor-body.is-preview .topic-detail__editor-preview {
  flex: 1;
  width: 100%;
}
.topic-detail__editor-body.is-split .topic-detail__editor-input,
.topic-detail__editor-body.is-split .topic-detail__editor-preview {
  flex: 1;
  width: 50%;
  min-width: 0;
}
.topic-detail__editor-preview {
  max-height: 600px;
  overflow-y: auto;
}
.topic-detail__editor-input {
  :deep(.el-textarea__inner) {
    width: 100%;
    min-height: 400px !important;
  }
}
.topic-detail__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}
.topic-detail__related {
  margin-top: 8px;
  padding: 0 4px 24px;
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
.topic-detail__meta-view {
  width: 100%;
  min-height: 2.4em;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  word-break: break-word;
}
.topic-detail__content-wrap {
  display: flex;
  gap: 24px;
  width: 100%;
  align-items: flex-start;
}
.topic-detail__content-wrap > .topic-detail__md {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}
.topic-detail__toc {
  flex-shrink: 0;
  position: sticky;
  top: 12px;
  width: 200px;
  max-height: calc(100vh - 100px);
  padding: 12px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow-y: auto;
}
.topic-detail__toc-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--el-text-color-secondary);
}
.topic-detail__toc ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.topic-detail__toc-item a {
  display: block;
  padding: 4px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.topic-detail__toc-item a:hover {
  color: var(--el-color-primary);
}
.topic-detail__toc-item--h3 a {
  padding-left: 12px;
}
.topic-detail__md {
  padding: 32px 40px;
  background: var(--el-bg-color);

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
  :deep(p) {
    margin: 0.7em 0;
  }
  :deep(ul),
  :deep(ol) {
    padding-left: 1.8em;
    margin: 0.6em 0;
  }
  :deep(li) {
    margin: 0.25em 0;
  }
  :deep(strong) {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

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
    code {
      padding: 0;
      background: none;
      color: var(--el-text-color-primary);
      font-size: 0.85em;
    }
  }

  /* ── Blockquote (callout) ───────────────────────────────────────── */
  :deep(blockquote) {
    margin: 1em 0;
    padding: 12px 18px;
    border-left: 4px solid var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 0 6px 6px 0;
    color: var(--el-text-color-secondary);
    p {
      margin: 0.3em 0;
    }
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
    th,
    td {
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
    &:hover {
      text-decoration: underline;
    }
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
.array-field__index {
  flex-shrink: 0;
  width: 20px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  font-family: "SF Mono", "Menlo", monospace;
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
  th,
  td {
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
