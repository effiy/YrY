<template>
  <div class="error-empty">
    <EmptyState variant="error" size="sm" :title="description" :action-text="actionText" @action="$emit('action')">
      <template v-if="$slots.default" #action>
        <slot />
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
/**
 * ErrorEmpty — 错误/异常态下的空状态（兼容层：保持原 props，内部统一桥接到 EmptyState variant="error"）。
 *
 * 对外 API 100% 兼容旧实现（`el-empty` + description/imageSize/actionText），内部已
 * 收敛到 EmptyState 单实现，不再直接依赖 Element Plus 的默认插画风格，保证深色
 * /浅色主题下与 EmptyFilter / EmptySearch 的整体视觉一致（同一套 icon + 间距）。
 *
 * 注意：`imageSize` 参数在新实现中不生效（由 EmptyState 的 size="sm|md|lg" 控制，
 * 保留声明以便旧调用方编译通过）。
 */
import EmptyState from "@/components/EmptyState/EmptyState.vue";

interface Props {
  description?: string;
  /** @deprecated 保留以兼容旧签名；由 size="sm" 驱动插画尺寸。 */
  imageSize?: number;
  actionText?: string;
}

withDefaults(defineProps<Props>(), {
  description: "暂无数据",
  imageSize: 120
});

defineEmits<{
  action: [];
}>();
</script>

<style scoped>
.error-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 48px 24px;
}
</style>
