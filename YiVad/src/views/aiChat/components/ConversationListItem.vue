<script setup lang="ts" name="aiChatConversationListItem">
import { computed } from "vue";
import { Edit, Delete, Star, StarFilled, Document, DataAnalysis } from "@element-plus/icons-vue";
import type { SessionDocument } from "@/api/interface/yiweb";
import { useAiChatStore } from "@/stores/modules/aiChat";

const CTX_PREFIX = "ctx:";

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
  (e: "open-rag", key: string): void;
}>();

const store = useAiChatStore();
const isFavorite = computed(() => !!props.conversation.isFavorite);
const isBatchChecked = computed(() => store.selectedKeys.has(props.conversation.key));

const ctxCount = computed(() => {
  const tags = props.conversation.tags || [];
  return tags.filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX)).length;
});

const msgCount = computed(() => (props.conversation.messages || []).length);

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
          :title="`Edit context (${ctxCount} files)`"
          @click="emit('edit-context', conversation.key)"
        >
          <el-icon><Document /></el-icon>
          <span v-if="ctxCount > 0" class="cs-ctx-count">{{ ctxCount }}</span>
        </el-button>
        <el-button
          v-if="ctxCount > 0"
          text
          size="small"
          :icon="DataAnalysis"
          :type="store.ragActive && active ? 'primary' : ''"
          :title="`RAG search ${ctxCount} context file(s)`"
          @click="emit('open-rag', conversation.key)"
        >
          <span class="cs-rag-count">{{ ctxCount }}</span>
        </el-button>
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
.cs-rag-count,
.cs-ctx-count {
  margin-left: 2px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>
