<script setup lang="ts" name="RssItemDetailDrawer">
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { ArrowLeft, ArrowRight, ChatDotRound, ChatLineRound, Star, StarFilled } from "@element-plus/icons-vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useRssAiChat } from "@/hooks/useRssAiChat";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { updateRssItem } from "@/api/modules/rssService";
import type { KnowledgeMeta, SessionDocument } from "@/api/interface/yiweb";
import KnowledgeMetaStrip from "@/components/KnowledgeMetaStrip.vue";
import type { RssItemDocument, RssQuickAction } from "@/api/modules/rssService";

const { t } = useI18n();
const router = useRouter();
const { render } = useMarkdown();
const { discussInAiChat: doDiscuss, quickActionInAiChat: doQuickAction, linkToAiChatByTag } = useRssAiChat();
const aiChatStore = useAiChatStore();

interface Props {
  modelValue: boolean;
  item: RssItemDocument | null;
  items?: RssItemDocument[];
  index?: number;
  isStarred?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  index: -1,
  isStarred: false
});
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "mark-read", item: RssItemDocument): void;
  (e: "navigate", direction: -1 | 1): void;
  (e: "toggle-star", item: RssItemDocument): void;
  (e: "tags-updated", item: RssItemDocument): void;
}>();

const body = ref("");
const meta = ref<KnowledgeMeta>({});
const bodyLoading = ref(false);
const bodyError = ref<string | null>(null);
const bodyEmpty = ref(false);

const relatedSessions = ref<SessionDocument[]>([]);
const relatedSessionsLoaded = ref(false);

const relatedTagForItem = (item: RssItemDocument | null): string | null => {
  if (!item) return null;
  if (item.file_path) return `rss-item:${item.file_path}`;
  if (item.source_name) return `rss:${item.source_name}`;
  return null;
};

async function loadRelatedSessions(item: RssItemDocument) {
  const tag = relatedTagForItem(item);
  if (!tag) {
    relatedSessions.value = [];
    relatedSessionsLoaded.value = true;
    return;
  }
  relatedSessionsLoaded.value = false;
  try {
    if (!aiChatStore.conversations.length) {
      await aiChatStore.loadConversations().catch(() => {});
    }
    const matches = aiChatStore.conversations
      .filter(c => Array.isArray(c.tags) && c.tags.includes(tag))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      .slice(0, 3);
    relatedSessions.value = matches;
  } catch {
    relatedSessions.value = [];
  } finally {
    relatedSessionsLoaded.value = true;
  }
}

const relatedSessionsAllLink = computed(() => {
  const tag = relatedTagForItem(props.item);
  return tag ? linkToAiChatByTag(tag) : "/aiChat";
});

function openRelatedSession(key: string) {
  router.push({ path: "/aiChat", query: { session: key } });
}

function openAllRelated() {
  router.push(relatedSessionsAllLink.value);
}


const visible = ref(props.modelValue);
watch(() => props.modelValue, v => (visible.value = v));
watch(visible, v => emit("update:modelValue", v));

const bodyHtml = computed(() => render(body.value));
const hasMeta = computed(() => Object.keys(meta.value).length > 0);
const canPrev = computed(() => props.items.length > 1 && props.index > 0);
const canNext = computed(() => props.items.length > 1 && props.index >= 0 && props.index < props.items.length - 1);

const readingMinutes = computed(() => {
  const text = body.value || "";
  if (!text) return 0;
  // Strip markdown noise for a more honest length estimate.
  const stripped = text.replace(/```[\s\S]*?```/g, " ").replace(/[#*`>\-[\]()!]/g, " ").replace(/\s+/g, " ").trim();
  if (!stripped) return 0;
  // Mixed heuristic: count CJK chars + Latin words. ~300 CJK chars/min, ~250 wpm.
  const cjk = (stripped.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || []).length;
  const latinWords = (stripped.replace(/[\u4e00-\u9fff\u3040-\u30ff]/g, " ").match(/[A-Za-z][A-Za-z'-]*/g) || []).length;
  const minutes = Math.max(1, Math.round(cjk / 300 + latinWords / 250));
  return minutes;
});

function loadBody(item: RssItemDocument) {
  bodyLoading.value = true;
  bodyError.value = null;
  bodyEmpty.value = false;
  body.value = "";
  meta.value = {};
  readKnowledgeFile(item.file_path!)
    .then(r => {
      body.value = r?.content || "";
      meta.value = r?.meta || {};
      if (!body.value) bodyEmpty.value = true;
    })
    .catch((e: any) => {
      bodyError.value = e?.message || t("rss.items.detailBodyError");
    })
    .finally(() => {
      bodyLoading.value = false;
    });
}

watch(
  () => props.item,
  item => {
    body.value = "";
    bodyError.value = null;
    bodyEmpty.value = false;
    meta.value = {};
    relatedSessions.value = [];
    relatedSessionsLoaded.value = false;
    if (!item || !visible.value) return;
    if (!item.file_path) {
      bodyEmpty.value = true;
    } else {
      loadBody(item);
    }
    loadRelatedSessions(item);
    emit("mark-read", item);
  },
  { immediate: true }
);

watch(visible, async v => {
  if (!v) return;
  const item = props.item;
  if (!item) return;
  if (body.value || bodyError.value || bodyEmpty.value) return;
  if (!item.file_path) {
    bodyEmpty.value = true;
    return;
  }
  loadBody(item);
  emit("mark-read", item);
});

function openSource() {
  const link = props.item?.link;
  if (link) window.open(link, "_blank", "noopener");
}

async function copyLink() {
  const link = props.item?.link;
  if (!link) return;
  try {
    await navigator.clipboard.writeText(link);
    ElMessage.success(t("rss.items.detailLinkCopied"));
  } catch {
    ElMessage.warning(t("rss.items.detailCopyFailed"));
  }
}

async function discussInAiChat() {
  const item = props.item;
  if (!item) return;
  await doDiscuss(item, body.value || undefined);
  visible.value = false;
}

async function quickActionInAiChat(action: RssQuickAction) {
  const item = props.item;
  if (!item) return;
  await doQuickAction(item, action, body.value || undefined);
  visible.value = false;
}

function prev() {
  if (canPrev.value) emit("navigate", -1);
}
function next() {
  if (canNext.value) emit("navigate", 1);
}

// ── Inline tag editor ──
const tags = ref<string[]>([]);
const newTag = ref("");
const tagsSaving = ref(false);

watch(
  () => props.item,
  item => {
    tags.value = [...(item?.tags ?? [])];
    newTag.value = "";
  },
  { immediate: true }
);

async function saveTags() {
  if (!props.item?.key) return;
  tagsSaving.value = true;
  try {
    await updateRssItem(props.item.key, { tags: tags.value });
    ElMessage.success(t("rss.items.tagsSaved"));
    emit("tags-updated", { ...props.item, tags: [...tags.value] });
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.items.tagsSaveFailed"));
  } finally {
    tagsSaving.value = false;
  }
}

function addTag() {
  const v = newTag.value.trim();
  if (!v || tags.value.includes(v)) {
    newTag.value = "";
    return;
  }
  tags.value = [...tags.value, v];
  newTag.value = "";
  saveTags();
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag);
  saveTags();
}

function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return;
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
  switch (e.key) {
    case "j":
      e.preventDefault();
      next();
      break;
    case "k":
      e.preventDefault();
      prev();
      break;
    case "o":
      e.preventDefault();
      openSource();
      break;
    case "d":
      e.preventDefault();
      discussInAiChat();
      break;
    case "s":
      e.preventDefault();
      quickActionInAiChat("summarize");
      break;
    case "t":
      e.preventDefault();
      quickActionInAiChat("translate");
      break;
    case "c":
      e.preventDefault();
      quickActionInAiChat("critique");
      break;
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="item?.title || t('rss.items.detailTitle')"
    direction="rtl"
    size="640px"
    :destroy-on-close="true"
  >
    <template v-if="items.length > 1" #header>
      <div class="rss-detail-header">
        <el-button :icon="ArrowLeft" :disabled="!canPrev" link @click="prev" />
        <span class="rss-detail-header-title" :title="item?.title">{{ item?.title || t("rss.items.detailTitle") }}</span>
        <el-button :disabled="!canNext" link @click="next">
          {{ t("rss.items.detailNext") }}
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>
    <template #footer>
      <div class="rss-detail-shortcut-hint">{{ t("rss.items.detailShortcutHint") }}</div>
    </template>

    <div v-if="item" class="rss-detail">
      <div class="rss-detail-meta">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item :label="t('rss.items.source')">
            {{ item.source_name || "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('rss.items.category')">
            <el-tag v-if="item.category_path" size="small" type="info">{{ item.category_path }}</el-tag>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('rss.items.published')">
            {{ item.published || "—" }}
          </el-descriptions-item>
          <el-descriptions-item v-if="readingMinutes > 0" :label="t('rss.items.readTime')">
            {{ t("rss.items.readMinutes", { n: readingMinutes }) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('rss.items.author')">
            {{ item.author || "—" }}
          </el-descriptions-item>
          <el-descriptions-item v-if="item.file_path" :label="t('rss.items.detailFile')">
            <code>{{ item.file_path }}</code>
          </el-descriptions-item>
          <el-descriptions-item :label="t('rss.items.detailLink')">
            <el-link type="primary" :underline="false" @click="openSource">{{ item.link || "—" }}</el-link>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="relatedSessions.length" class="rss-detail-related">
        <div class="rss-detail-related-title">
          <el-icon><ChatLineRound /></el-icon>
          <span>{{ t("rss.items.relatedSessions") }}</span>
          <el-link type="primary" :underline="false" class="rss-detail-related-all" @click="openAllRelated">
            {{ t("rss.items.relatedSessionsAll") }}
          </el-link>
        </div>
        <div class="rss-detail-related-list">
          <el-link
            v-for="s in relatedSessions"
            :key="s.key"
            type="primary"
            :underline="false"
            class="rss-detail-related-item"
            :title="s.title"
            @click="openRelatedSession(s.key)"
          >
            {{ s.title || s.key }}
          </el-link>
        </div>
      </div>
      <div v-else-if="relatedSessionsLoaded" class="rss-detail-related rss-detail-related-empty">
        {{ t("rss.items.relatedSessionsEmpty") }}
      </div>

      <KnowledgeMetaStrip
        v-if="hasMeta"
        :meta="meta"
        :current-path="item.file_path"
        class="rss-detail-frontmatter"
      />

      <div class="rss-detail-actions">
        <el-button size="small" @click="copyLink">{{ t("rss.items.detailCopyLink") }}</el-button>
        <el-button
          size="small"
          :type="isStarred ? 'warning' : 'default'"
          :icon="isStarred ? StarFilled : Star"
          @click="emit('toggle-star', item!)"
        >
          {{ isStarred ? t("rss.items.unstar") : t("rss.items.star") }}
        </el-button>
        <el-button size="small" type="primary" :icon="ChatDotRound" @click="discussInAiChat">
          {{ t("rss.items.detailDiscussInAiChat") }}
        </el-button>
        <el-button-group class="rss-detail-quick-actions">
          <el-button size="small" @click="quickActionInAiChat('summarize')">{{ t("rss.items.quickSummarize") }}</el-button>
          <el-button size="small" @click="quickActionInAiChat('translate')">{{ t("rss.items.quickTranslate") }}</el-button>
          <el-button size="small" @click="quickActionInAiChat('critique')">{{ t("rss.items.quickCritique") }}</el-button>
        </el-button-group>
        <el-button size="small" type="primary" @click="openSource">{{ t("rss.items.detailOpenSource") }}</el-button>
      </div>

      <div class="rss-detail-tags">
        <div class="rss-detail-tags-title">{{ t("rss.items.tagsEditorTitle") }}</div>
        <div class="rss-detail-tags-list">
          <el-tag
            v-for="tag in tags"
            :key="tag"
            size="small"
            class="rss-detail-tag"
            closable
            :disabled="tagsSaving"
            @close="removeTag(tag)"
          >{{ tag }}</el-tag>
          <el-input
            v-model="newTag"
            size="small"
            class="rss-detail-tags-input"
            :placeholder="t('rss.items.tagsAddPlaceholder')"
            :disabled="tagsSaving"
            @keydown.enter.prevent="addTag"
          />
        </div>
      </div>

      <div class="rss-detail-body">
        <div v-if="bodyLoading" v-loading="true" class="rss-detail-loading" />
        <div v-else-if="bodyError" class="rss-detail-error">
          {{ bodyError }}
        </div>
        <div v-else-if="bodyEmpty" class="rss-detail-empty">
          {{ t("rss.items.detailBodyEmpty") }}
        </div>
        <div v-else class="rss-detail-md" v-html="bodyHtml" />
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.rss-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.rss-detail-header-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rss-detail-shortcut-hint {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 4px 0;
}
.rss-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rss-detail-meta {
  :deep(.el-descriptions__label) {
    width: 90px;
    background: var(--el-fill-color-light);
  }
}
.rss-detail-frontmatter {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
}
.rss-detail-related {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px 10px;
  background: var(--el-fill-color-light);
}
.rss-detail-related-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.rss-detail-related-all {
  margin-left: auto;
  font-size: 12px;
}
.rss-detail-related-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rss-detail-related-item {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rss-detail-related-empty {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 4px 0;
}
.rss-detail-tag {
  margin: 0 4px 4px 0;
}
.rss-detail-tags {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}
.rss-detail-tags-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.rss-detail-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.rss-detail-tags-input {
  width: 180px;
}
.rss-detail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.rss-detail-quick-actions {
  margin-left: 4px;
}
.rss-detail-body {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}
.rss-detail-loading {
  min-height: 200px;
}
.rss-detail-error,
.rss-detail-empty {
  padding: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  text-align: center;
}
.rss-detail-md {
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  word-break: break-word;
  max-height: 60vh;
  overflow: auto;
  padding: 4px 4px 4px 0;

  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 1em 0 0.5em;
    line-height: 1.3;
  }
  :deep(h1) { font-size: 1.5em; }
  :deep(h2) { font-size: 1.3em; }
  :deep(h3) { font-size: 1.15em; }
  :deep(p) { margin: 0.5em 0; }
  :deep(a) { color: var(--el-color-primary); }
  :deep(pre) {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: 6px;
  }
  :deep(code) {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 0.9em;
  }
  :deep(blockquote) {
    margin: 0.5em 0;
    padding: 4px 12px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
  :deep(table) {
    border-collapse: collapse;
  }
  :deep(th), :deep(td) {
    padding: 6px 12px;
    border: 1px solid var(--el-border-color-lighter);
  }
  :deep(img) {
    max-width: 100%;
  }
}
</style>
