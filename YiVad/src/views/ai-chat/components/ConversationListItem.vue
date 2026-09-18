<script setup lang="ts" name="aiChatConversationListItem">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Star, StarFilled, Edit, Delete } from "@element-plus/icons-vue";
import type { SessionDocument } from "@/api/interface/yiAi";
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

const firstUserMessage = computed(() => {
  const msgs = props.conversation.messages ?? [];
  const first = msgs.find(m => m.type === "user");
  if (!first?.message) return "";
  const text = first.message.trim();
  return text.length > 80 ? text.slice(0, 79) + "…" : text;
});

const SOURCE_DOMAIN_LABEL: Record<string, string> = {
  leader: "TL",
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

const SOURCE_COLORS: Record<string, string> = {
  TL: "#8b5cf6",
  CR: "#3b82f6",
  Bug: "#ef4444",
  Story: "#10b981",
  RAG: "#f59e0b",
  AI: "#6366f1"
};

function relativeTime(ts?: number): string {
  if (!ts) return "";
  const delta = Date.now() - ts;
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function backToSource() {
  if (!sourceUrl.value) return;
  router.push(sourceUrl.value);
}
</script>

<template>
  <div
    class="cs-item"
    :class="{ 'cs-item--active': active, 'cs-item--selected': store.batchMode && isBatchChecked }"
    @click="store.batchMode ? store.toggleSelection(conversation.key) : emit('select', conversation.key)"
  >
    <el-checkbox
      v-if="store.batchMode"
      :model-value="isBatchChecked"
      class="cs-batch-check"
      @update:model-value="() => store.toggleSelection(conversation.key)"
      @click.stop
    />
    <div class="cs-item-body">
      <!-- Row 1: favorite + source + title + time -->
      <div class="cs-item-row">
        <button
          class="cs-star"
          :class="{ 'is-fav': isFavorite }"
          :title="isFavorite ? 'Unfavorite' : 'Favorite'"
          @click.stop="emit('toggle-favorite', conversation.key)"
        >
          <el-icon :size="13"><component :is="isFavorite ? StarFilled : Star" /></el-icon>
        </button>
        <span
          v-if="sourceDomainLabel"
          class="cs-item-src"
          :style="{ color: SOURCE_COLORS[sourceDomainLabel] || 'var(--el-color-primary)', borderColor: 'currentColor' }"
          :title="`From ${sourceUrl}`"
          @click.stop="backToSource"
        >
          {{ sourceDomainLabel }}
        </span>
        <span class="cs-item-title">{{ conversation.title || "(Untitled)" }}</span>
        <span class="cs-item-time">{{ relativeTime(props.conversation.updatedAt) }}</span>
      </div>
      <!-- Row 2: preview snippet -->
      <div v-if="firstUserMessage" class="cs-item-preview">{{ firstUserMessage }}</div>
      <!-- Row 3: metadata badges -->
      <div class="cs-item-meta">
        <span v-if="msgCount" class="cs-item-badge">{{ msgCount }} msg{{ msgCount !== 1 ? 's' : '' }}</span>
        <span v-if="ctxCount" class="cs-item-badge cs-item-badge--ctx">{{ ctxCount }} file{{ ctxCount !== 1 ? 's' : '' }}</span>
        <span v-if="isFavorite" class="cs-item-badge cs-item-badge--fav">favorite</span>
      </div>
      <!-- Row 4: actions (hover only, non-batch) -->
      <div v-if="!store.batchMode" class="cs-item-actions" @click.stop>
        <el-button text size="small" :icon="Edit" title="Rename" @click="emit('rename', conversation.key, conversation.title || '')" />
        <el-button text size="small" :icon="Delete" title="Delete" type="danger" @click="emit('delete', conversation.key, conversation.title || '')" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cs-item {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  padding: 10px 12px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
  &:hover {
    background: var(--el-fill-color-lighter);
  }
  &--active {
    background: var(--el-color-primary-light-9);
    border-left-color: var(--el-color-primary);
  }
  &--selected {
    background: var(--el-color-primary-light-9);
  }
}
.cs-batch-check {
  flex-shrink: 0;
  margin-top: 2px;
}
.cs-item-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

// Row 1: star + source + title + time
.cs-item-row {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}
.cs-star {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  padding: 0;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  background: none;
  border: none;
  transition: color var(--transition-fast);
  &:hover {
    color: #f5a623;
  }
  &.is-fav {
    color: #f5a623;
  }
}
.cs-item-src {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  height: 16px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 0.3px;
  border: 1px solid currentColor;
  border-radius: var(--radius-xs);
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
.cs-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.cs-item-time {
  flex-shrink: 0;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}

// Row 2: preview snippet
.cs-item-preview {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.45;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}

// Row 3: metadata badges
.cs-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.cs-item-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: var(--radius-xs);
}
.cs-item-badge--ctx {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.cs-item-badge--fav {
  color: #f5a623;
  background: #fef3c7;
}

// Row 4: actions
.cs-item-actions {
  display: flex;
  gap: 0;
  align-self: flex-end;
  justify-content: flex-end;
  margin-top: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.cs-item:hover .cs-item-actions,
.cs-item--active .cs-item-actions {
  opacity: 1;
}
</style>
