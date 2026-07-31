<script setup lang="ts" name="storyCard">
import { computed } from "vue";
import type { StoryDocument } from "@/api/modules/story";
import StoryStatusBadge from "./StoryStatusBadge.vue";

const props = defineProps<{
  story: StoryDocument;
}>();

const emit = defineEmits<{
  (e: "click", story: StoryDocument): void;
  (e: "edit", story: StoryDocument): void;
  (e: "delete", story: StoryDocument): void;
}>();

const priorityColors: Record<string, string> = {
  p0: "danger",
  p1: "warning",
  p2: "info",
  p3: ""
};

const scenarioCount = computed(() => props.story.scenarios?.length ?? 0);
const scenarioDone = computed(() => props.story.scenarios?.filter(sc => sc.status === "operations").length ?? 0);
const scenarioProgress = computed(() => {
  const total = scenarioCount.value;
  if (!total) return 0;
  return Math.round((scenarioDone.value / total) * 100);
});
const fileCount = computed(() => props.story.files?.length ?? 0);
</script>

<template>
  <el-card class="sb-card" shadow="hover" @click="emit('click', story)">
    <!-- Header: name + status + priority -->
    <div class="sc-hdr">
      <span class="sc-name">{{ story.name }}</span>
      <div class="sc-badges">
        <StoryStatusBadge :status="story.status" />
        <el-tag v-if="story.priority" :type="priorityColors[story.priority] as any" size="small">
          {{ story.priority.toUpperCase() }}
        </el-tag>
      </div>
    </div>
    <!-- Progress -->
    <div v-if="scenarioCount > 0" class="sc-progress">
      <el-progress :percentage="scenarioProgress" :stroke-width="6" :show-text="false" />
      <span class="sc-progress-text">{{ scenarioDone }}/{{ scenarioCount }}</span>
    </div>
    <div class="sc-meta">
      <el-tag v-if="story.project" size="small" type="info">
        {{ story.project }}
      </el-tag>
    </div>
    <p class="sc-desc">{{ story.description || $t("story.noDescription") }}</p>
    <!-- Tags -->
    <div v-if="story.tags?.length" class="sc-tags">
      <el-tag v-for="tag in story.tags" :key="tag" size="small" class="sc-tag-chip">
        {{ tag }}
      </el-tag>
    </div>
    <!-- Counts row -->
    <div class="sc-counts">
      <span v-if="fileCount > 0" class="sc-count-item"> 📎 {{ fileCount }} file{{ fileCount > 1 ? "s" : "" }} </span>
    </div>
    <!-- Actions -->
    <div class="sc-acts" @click.stop>
      <el-button size="small" text @click="emit('edit', story)">
        {{ $t("story.edit") }}
      </el-button>
      <el-button size="small" text type="danger" @click="emit('delete', story)">
        {{ $t("story.del") }}
      </el-button>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.sb-card {
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
  border-left: 3px solid transparent;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    padding: 10px 12px;
  }
}

.sc-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 4px;
}

.sc-name {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sc-badges {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.sc-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}

.sc-desc {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.sc-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.sc-progress-text {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.sc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 3px;
}

.sc-tag-chip {
  font-size: 10px;
  opacity: 0.8;
}

.sc-counts {
  display: flex;
  gap: 8px;
}

.sc-count-item {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.sc-acts {
  display: flex;
  gap: 0;
  justify-content: flex-end;
  margin-top: 3px;
  padding-top: 3px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
