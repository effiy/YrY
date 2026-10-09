<template>
  <div
    class="empty-state"
    role="status"
    :class="`empty-state--${variant} empty-state--${size}`"
  >
    <div class="empty-state__illustration">
      <slot name="illustration">
        <el-icon v-if="variant === 'data'" :size="iconSize" color="var(--el-text-color-disabled)"><FolderOpened /></el-icon>
        <el-icon v-else-if="variant === 'filter'" :size="iconSize" color="var(--el-text-color-disabled)"><Filter /></el-icon>
        <el-icon v-else-if="variant === 'search'" :size="iconSize" color="var(--el-text-color-disabled)"><Search /></el-icon>
        <el-icon v-else-if="variant === 'error'" :size="iconSize" color="var(--el-color-danger)"><Warning /></el-icon>
        <el-icon v-else :size="iconSize" color="var(--el-text-color-disabled)"><FolderOpened /></el-icon>
      </slot>
    </div>
    <h3 class="empty-state__title">{{ title ?? defaultTitle }}</h3>
    <p v-if="description ?? defaultDescription" class="empty-state__description">{{ description ?? defaultDescription }}</p>
    <div v-if="$slots.action || actionText" class="empty-state__action">
      <slot name="action">
        <el-button v-if="actionText" :type="variant === 'error' ? 'danger' : 'primary'" @click="$emit('action')">
          {{ actionText }}
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FolderOpened, Filter, Search, Warning } from "@element-plus/icons-vue";

type EmptyVariant = "data" | "filter" | "search" | "error";
type EmptySize = "sm" | "md" | "lg";

const props = withDefaults(defineProps<{
  /** Empty 语义变体：data 通用空数据｜filter 过滤后空｜search 搜索无结果｜error 错误/异常空 */
  variant?: EmptyVariant;
  size?: EmptySize;
  title?: string;
  description?: string;
  actionText?: string;
  /** 搜索关键词（仅 variant="search" 时用于默认描述） */
  keyword?: string;
}>(), {
  variant: "data",
  size: "md"
});

defineEmits<{
  /** 当 actionText 或 #action 插槽被点击时触发；filter 通常语义是 reset，search 是 clear。 */
  action: [];
  /** 别名：清空搜索（variant="search" 推荐） */
  clear: [];
  /** 别名：重置筛选（variant="filter" 推荐） */
  reset: [];
}>();

const SIZE_MAP: Record<EmptySize, number> = { sm: 40, md: 64, lg: 96 };

const iconSize = computed(() => SIZE_MAP[props.size]);

const defaultTitle = computed<string>(() => {
  switch (props.variant) {
    case "filter": return "No data matching filters";
    case "search": return "No results found";
    case "error": return "Something went wrong";
    default: return "No data";
  }
});

const defaultDescription = computed<string | undefined>(() => {
  switch (props.variant) {
    case "filter": return "Try adjusting your filter conditions.";
    case "search": return props.keyword
      ? `No matches for '${props.keyword}'. Try a different keyword.`
      : "Try a different keyword.";
    case "error": return "The component could not be displayed. Please retry or refresh.";
    default: return undefined;
  }
});
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  &--sm { padding: 16px 12px; }
  &--md { padding: 48px 24px; }
  &--lg { padding: 72px 32px; }
  &__illustration {
    margin-bottom: 16px;
    opacity: 0.6;
  }
  &--error &__illustration { opacity: 0.85; }
  &__title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
  &__description {
    max-width: 320px;
    margin: 0 0 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}
</style>
