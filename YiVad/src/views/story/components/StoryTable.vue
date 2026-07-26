<script setup lang="ts" name="storyTable">
import type { StoryItem } from "@/stores/modules/story";
import StoryStatusBadge from "./StoryStatusBadge.vue";

defineProps<{ stories: StoryItem[] }>();
defineEmits<{ rowClick: [story: StoryItem] }>();

function formatDate(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
</script>

<template>
  <el-table :data="stories" stripe @row-click="(row: StoryItem) => $emit('rowClick', row)">
    <el-table-column prop="name" label="Name" min-width="180" />
    <el-table-column prop="status" label="Status" width="100"
      ><template #default="{ row }"><StoryStatusBadge :status="row.status" /></template
    ></el-table-column>
    <el-table-column label="Tags" min-width="200"
      ><template #default="{ row }"
        ><el-tag
          v-for="tag in row.projectTags.slice(0, 4)"
          :key="tag"
          size="small"
          type="info"
          style="margin-right: 4px; margin-bottom: 4px"
          >{{ tag }}</el-tag
        ></template
      ></el-table-column
    >
    <el-table-column prop="fileCount" label="Files" width="80" align="center" />
    <el-table-column label="Date" width="120"
      ><template #default="{ row }">{{ formatDate(row.lastModified) }}</template></el-table-column
    >
  </el-table>
</template>
