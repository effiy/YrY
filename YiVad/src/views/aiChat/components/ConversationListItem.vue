<script setup lang="ts" name="aiChatConversationListItem">
import { computed } from "vue";
import { Edit, Delete, Star, StarFilled } from "@element-plus/icons-vue";
import type { SessionDocument } from "@/api/interface/yiweb";
import { useAiChatStore } from "@/stores/modules/aiChat";

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
const isFavorite = computed(() => !!props.conversation.isFavorite);
const isBatchChecked = computed(() => store.selectedKeys.has(props.conversation.key));

function formatTime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
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
    <div class="cs-item-main">
      <div class="cs-item-title-row">
        <span class="cs-item-title">{{ conversation.title || "(Untitled)" }}</span>
        <el-icon v-if="isFavorite" class="cs-fav-mark" title="Favorite">
          <StarFilled />
        </el-icon>
      </div>
      <div class="cs-item-meta">{{ formatTime(conversation.updatedAt) }}</div>
    </div>
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
</template>

<style scoped lang="scss">
.cs-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
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
}
.cs-item-main {
  flex: 1;
  min-width: 0;
}
.cs-item-title-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.cs-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.cs-fav-mark {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-color-warning);
}
.cs-item-meta {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.cs-item-actions {
  display: flex;
  flex-shrink: 0;
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
