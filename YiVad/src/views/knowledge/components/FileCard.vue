<script setup lang="ts" name="KnowledgeFileCard">
import { computed } from "vue";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";

const props = defineProps<{ entry: KnowledgeFileEntry }>();
const emit = defineEmits<{ click: [KnowledgeFileEntry] }>();

const title = computed(() => props.entry.meta?.title || props.entry.name);
const tags = computed<string[]>(() => {
  const t = props.entry.meta?.tags;
  return Array.isArray(t) ? t.map(String) : [];
});
const updated = computed(() => {
  const ts = props.entry.updatedAt;
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
});

function fmtSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <div class="kf-card" @click="emit('click', entry)">
    <div class="kf-card__title" :title="title">{{ title }}</div>
    <div class="kf-card__path" :title="entry.path">{{ entry.path }}</div>
    <div class="kf-card__tags">
      <el-tag v-for="t in tags" :key="t" size="small" type="info" effect="plain" class="kf-card__tag">
        {{ t }}
      </el-tag>
    </div>
    <div class="kf-card__meta">
      <span v-if="updated" class="kf-card__date">{{ updated }}</span>
      <span v-if="fmtSize(entry.size)" class="kf-card__size">{{ fmtSize(entry.size) }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.kf-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 130px;
  padding: 14px 16px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.18s ease;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
    transform: translateY(-1px);
  }
  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }
  &__path {
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 22px;
  }
  &__tag {
    max-width: 100%;
  }
  &__meta {
    display: flex;
    gap: 12px;
    margin-top: auto;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
