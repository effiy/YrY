<script setup lang="ts" name="aiChatConversationListItem">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Star, StarFilled, Edit, Delete, Back, FolderOpened } from "@element-plus/icons-vue";
import type { SessionDocument } from "@/api/interface/yiweb";
import { useAiChatStore } from "@/stores/modules/aiChat";

const CTX_PREFIX = "ctx:";
const FROM_PREFIX = "from:";

const props = defineProps<{
  conversation: SessionDocument;
  active: boolean;
}>();

const emit = defineEmits<{
  (e: "select", key: string): void;
  (e: "rename", key: string, title: string): void;
  (e: "delete", key: string, title: string): void;
  (e: "toggle-favorite", key: string): void;
  (e: "edit-context", key: string): void;
}>();

const store = useAiChatStore();
const router = useRouter();
const isFavorite = computed(() => !!props.conversation.isFavorite);
const sourceUrl = computed(() => {
  const from = (props.conversation.tags ?? []).find(t => typeof t === "string" && t.startsWith(FROM_PREFIX));
  return from ? from.slice(FROM_PREFIX.length) : "";
});
const isBatchChecked = computed(() => store.selectedKeys.has(props.conversation.key));

const ctxCount = computed(() => {
  const tags = props.conversation.tags || [];
  return tags.filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX)).length;
});

const msgCount = computed(() => (props.conversation.messages || []).length);

const SOURCE_DOMAIN_LABEL: Record<string, string> = {
  brd: "BRD",
  "leader": "TL",
  "code-review": "CR",
  story: "Story",
  rag: "RAG",
  aichat: "AI"
};
const sourceDomainLabel = computed<string>(() => {
  const url = sourceUrl.value;
  if (!url) return "";
  const m = url.match(/^\/([^/?#]+)/);
  if (!m) return "";
  const head = m[1];
  if (head === "code-review") {
    if (url.startsWith("/code-review/bugs")) return "Bug";
    return "CR";
  }
  return SOURCE_DOMAIN_LABEL[head] || head.toUpperCase();
});

function relativeTime(ts?: number): string {
  if (!ts) return "";
  const delta = Date.now() - ts;
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const metaText = computed(() => {
  const parts: string[] = [];
  const c = ctxCount.value;
  const m = msgCount.value;
  if (c) parts.push(`${c} files`);
  if (m) parts.push(`${m} msgs`);
  const time = relativeTime(props.conversation.updatedAt);
  if (time) parts.push(time);
  return parts.join("  ·  ");
});

function backToSource() {
  if (!sourceUrl.value) return;
  router.push(sourceUrl.value);
}
</script>

<template>
  <div
    class="cs-item"
    :class="{ 'cs-item--active': active }"
    @click="emit('select', conversation.key)"
  >
    <el-checkbox
      v-if="store.batchMode"
      :model-value="isBatchChecked"
      class="cs-batch-check"
      @update:model-value="() => store.toggleSelection(conversation.key)"
      @click.stop
    />
    <div class="cs-item-body">
      <!-- Row 1: title left, meta right -->
      <div class="cs-item-row">
        <el-tag
          v-if="sourceDomainLabel"
          size="small"
          effect="plain"
          class="cs-item-src"
          :title="`From ${sourceUrl}`"
          @click.stop="backToSource"
        >{{ sourceDomainLabel }}</el-tag>
        <span class="cs-item-title">{{ conversation.title || "(Untitled)" }}</span>
        <span class="cs-item-meta">{{ metaText }}</span>
      </div>
      <!-- Row 2: actions right -->
      <div v-if="!store.batchMode" class="cs-item-actions" @click.stop>
        <el-button
          text
          size="small"
          :title="isFavorite ? 'Unfavorite' : 'Favorite'"
          :class="{ 'is-fav': isFavorite }"
          @click="emit('toggle-favorite', conversation.key)"
        >
          <el-icon><component :is="isFavorite ? StarFilled : Star" /></el-icon>
        </el-button>
        <el-button
          text
          size="small"
          :title="ctxCount ? `Edit ${ctxCount} context file(s)` : 'Edit context files'"
          @click="emit('edit-context', conversation.key)"
        >
          <el-icon><FolderOpened /></el-icon>
        </el-button>
        <el-button
          v-if="sourceUrl"
          text
          :icon="Back"
          size="small"
          title="Back to source"
          @click="backToSource"
        />
        <el-button
          text
          :icon="Edit"
          size="small"
          title="Rename"
          @click="emit('rename', conversation.key, conversation.title || '')"
        />
        <el-button
          text
          :icon="Delete"
          size="small"
          title="Delete"
          type="danger"
          @click="emit('delete', conversation.key, conversation.title || '')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cs-item {
  display: flex;
  gap: 4px;
  align-items: flex-start;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.cs-item:hover {
  background: var(--el-fill-color-light);
}
.cs-item--active {
  background: var(--el-color-primary-light-9);
}
.cs-batch-check {
  flex-shrink: 0;
  margin-top: 3px;
}
.cs-item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

// Row 1: title + meta
.cs-item-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
  justify-content: space-between;
}
.cs-item-src {
  flex-shrink: 0;
  cursor: pointer;
  font-size: 10px;
  padding: 0 5px;
  height: 16px;
  line-height: 14px;
  align-self: center;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}
.cs-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.cs-item-meta {
  flex-shrink: 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

// Row 2: actions
.cs-item-actions {
  display: flex;
  gap: 0;
  justify-content: flex-end;
  align-self: flex-end;
  opacity: 0;
  transition: opacity 0.15s;
}
.cs-item:hover .cs-item-actions,
.cs-item--active .cs-item-actions {
  opacity: 1;
}
.cs-item-actions .is-fav {
  color: var(--el-color-warning);
}
</style>
