<script setup lang="ts">
import { HomeFilled } from "@element-plus/icons-vue";

defineProps<{
  segments: { label: string; action: string; key?: string }[];
  hasActiveFilter: boolean;
  activeDimensions: { key: string; val: string; label: string; display: string }[];
}>();

const emit = defineEmits<{
  (e: "clearAll"): void;
  (e: "backToCategory"): void;
  (e: "removeFilter", key: string): void;
}>();
</script>

<template>
  <div class="drill-breadcrumb">
    <div class="db-path">
      <template v-for="(seg, i) in segments" :key="i">
        <span v-if="i > 0" class="db-sep">/</span>
        <span
          class="db-seg"
          :class="{ active: i === segments.length - 1, clickable: i < segments.length - 1 }"
          @click="
            seg.action === 'clear'
              ? emit('clearAll')
              : seg.action === 'backToCategory'
                ? emit('backToCategory')
                : seg.action === 'removeModule' || seg.action === 'removeSubModule'
                  ? emit('removeFilter', seg.key!)
                  : undefined
          "
        >
          <el-icon v-if="i === 0" :size="12"><HomeFilled /></el-icon>
          {{ seg.label }}
        </span>
      </template>
    </div>
    <div class="db-tags" v-if="activeDimensions.length > 0">
      <span
        v-for="d in activeDimensions"
        :key="d.key"
        class="db-tag"
        @click="emit('removeFilter', d.key)"
        :title="`Remove ${d.label} filter`"
      >
        {{ d.label }}: {{ d.display }}
        <span class="db-tag-x">&times;</span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.drill-breadcrumb {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.db-path {
  display: flex;
  gap: 2px;
  align-items: center;
  font-size: 11px;
}
.db-sep {
  margin: 0 2px;
  color: #c0c4cc;
}
.db-seg {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 2px 6px;
  color: #606266;
  border-radius: 4px;
  transition: all 0.12s;
  &.clickable {
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }
  &.active {
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.db-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.db-tag {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  padding: 0 6px;
  font-size: 10px;
  line-height: 18px;
  color: #606266;
  cursor: pointer;
  background: var(--el-fill-color-light);
  border-radius: 10px;
  transition: all 0.12s;
  &:hover {
    color: #ffffff;
    background: var(--el-color-primary-light-7);
  }
}
.db-tag-x {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  opacity: 0.5;
}
</style>
