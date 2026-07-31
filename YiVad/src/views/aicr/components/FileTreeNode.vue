<script setup lang="ts" name="aicrFileTreeNode">
import { computed } from "vue";
import { Edit, Delete, Star, StarFilled } from "@element-plus/icons-vue";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import type { FileNode } from "@/stores/modules/aicr/fileTree";

const props = defineProps<{
  data: FileNode;
  label: string;
  active: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-favorite", data: FileNode): void;
  (e: "rename", data: FileNode): void;
  (e: "delete", data: FileNode): void;
}>();

const fileTreeStore = useAicrFileTreeStore();

const isFavorite = computed(() => !!props.data.session?.isFavorite);

function formatTime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

const metaTime = computed(() => props.data.session?.updatedAt ?? props.data.updatedAt);
</script>

<template>
  <div class="ft-item" :class="{ 'ft-item--active': active }" @click="fileTreeStore.selectFile(data.key)">
    <div class="ft-item-main">
      <div class="ft-item-title-row">
        <span class="ft-item-title">{{ label }}</span>
        <el-icon v-if="isFavorite" class="ft-fav-mark" title="Favorite">
          <StarFilled />
        </el-icon>
      </div>
      <div v-if="metaTime" class="ft-item-meta">{{ formatTime(metaTime) }}</div>
    </div>
    <div class="ft-item-actions" @click.stop>
      <el-button
        text
        size="small"
        :title="isFavorite ? 'Unfavorite' : 'Favorite'"
        :class="{ 'is-fav': isFavorite }"
        @click="emit('toggle-favorite', data)"
      >
        <el-icon><component :is="isFavorite ? StarFilled : Star" /></el-icon>
      </el-button>
      <el-button text :icon="Edit" size="small" title="Rename" @click="emit('rename', data)" />
      <el-button text :icon="Delete" size="small" title="Delete" type="danger" @click="emit('delete', data)" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ft-item {
  display: flex;
  flex: 1;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.ft-item:hover {
  background: var(--el-fill-color-light);
}
.ft-item--active {
  background: var(--el-color-primary-light-9);
}
.ft-item-main {
  flex: 1;
  min-width: 0;
}
.ft-item-title-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.ft-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.ft-fav-mark {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-color-warning);
}
.ft-item-meta {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.ft-item-actions {
  display: flex;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.ft-item:hover .ft-item-actions,
.ft-item--active .ft-item-actions {
  opacity: 1;
}
.ft-item-actions .is-fav {
  color: var(--el-color-warning);
}
</style>
