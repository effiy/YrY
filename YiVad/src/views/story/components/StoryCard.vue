<script setup lang="ts" name="storyCard">
import type { StoryItem } from "@/stores/modules/story";
import StoryStatusBadge from "./StoryStatusBadge.vue";

defineProps<{
  story: StoryItem;
}>();

defineEmits<{
  click: [];
}>();

function formatDate(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
</script>

<template>
  <el-card class="story-card" shadow="hover" @click="$emit('click')">
    <div class="story-card-header">
      <span class="story-card-name">{{ story.name }}</span>
      <StoryStatusBadge :status="story.status" />
    </div>
    <div class="story-card-tags" v-if="story.projectTags.length">
      <el-tag v-for="tag in story.projectTags.slice(0, 3)" :key="tag" size="small" type="info">{{ tag }}</el-tag>
      <span v-if="story.projectTags.length > 3" class="story-card-tags-more">+{{ story.projectTags.length - 3 }}</span>
    </div>
    <p class="story-card-desc">{{ story.description || "暂无描述" }}</p>
    <div class="story-card-footer">
      <span class="story-card-files">{{ story.fileCount }} 个文件</span>
      <span class="story-card-date">{{ formatDate(story.lastModified) }}</span>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.story-card {
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}

.story-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.story-card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.story-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.story-card-tags-more {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 22px;
}

.story-card-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.story-card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
