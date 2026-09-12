<template>
  <div v-if="displayItems.length" class="issue-list__recent">
    <span class="issue-list__recent-label">Recently viewed</span>
    <button
      v-for="r in displayItems"
      :key="r.key"
      type="button"
      class="issue-list__recent-chip"
      :title="r.title"
      @click="onClick(r.key)"
    >
      <span class="issue-list__recent-dot" :style="{ background: statusColor(r.status) }" />
      <span class="issue-list__recent-key">{{ r.key }}</span>
      <span class="issue-list__recent-title">{{ r.title }}</span>
    </button>
    <button type="button" class="issue-list__recent-clear" @click="onClear">✕</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Issue, IssueStatus } from "@/api/modules/issueService";

const props = defineProps<{
  items: Issue[];
  statusColor: (s: IssueStatus) => string;
}>();

const emit = defineEmits<{
  (e: "click", key: string): void;
  (e: "clear"): void;
}>();

const displayItems = computed(() => props.items.slice(0, 8));

function onClick(key: string) {
  emit("click", key);
}

function onClear() {
  emit("clear");
}
</script>

<style scoped lang="scss">
.issue-list__recent {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
}
.issue-list__recent-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-right: 2px;
}
.issue-list__recent-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  }
}
.issue-list__recent-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.issue-list__recent-key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.issue-list__recent-title {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.issue-list__recent-clear {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 4px;
  &:hover {
    color: var(--el-color-danger);
  }
}
</style>
