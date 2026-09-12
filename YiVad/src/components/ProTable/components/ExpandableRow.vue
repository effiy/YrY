<template>
  <div class="expandable-row">
    <div class="expandable-row__trigger" @click="toggle">
      <el-icon :class="{ 'expandable-row__icon--expanded': expanded }">
        <ArrowRight />
      </el-icon>
    </div>
    <Transition name="expand">
      <div v-if="expanded" class="expandable-row__content">
        <slot :row="row" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ArrowRight } from "@element-plus/icons-vue";

defineProps<{ row: Record<string, any> }>();

const expanded = ref(false);
const toggle = () => { expanded.value = !expanded.value; };

defineExpose({ expanded, toggle });
</script>

<style scoped lang="scss">
.expandable-row__trigger {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  padding: 4px;
}
.expandable-row__icon--expanded {
  transform: rotate(90deg);
}
.expandable-row__content {
  padding: 8px 24px;
  background: var(--el-fill-color-lighter);
}
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>