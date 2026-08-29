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
            seg.action === 'clear' ? emit('clearAll')
            : seg.action === 'backToCategory' ? emit('backToCategory')
            : seg.action === 'removeModule' || seg.action === 'removeSubModule' ? emit('removeFilter', seg.key!)
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
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-wrap: wrap;
  gap: 6px;
}
.db-path {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
}
.db-sep {
  color: #c0c4cc;
  margin: 0 2px;
}
.db-seg {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #606266;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.12s;
  &.clickable {
    cursor: pointer;
    &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  }
  &.active {
    color: var(--el-color-primary);
    font-weight: 600;
    background: var(--el-color-primary-light-9);
  }
}
.db-tags {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.db-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 10px;
  line-height: 18px;
  cursor: pointer;
  color: #606266;
  background: var(--el-fill-color-light);
  transition: all 0.12s;
  &:hover { background: var(--el-color-primary-light-7); color: #fff; }
}
.db-tag-x {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  opacity: 0.5;
}
</style>
