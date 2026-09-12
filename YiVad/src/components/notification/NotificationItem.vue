<template>
  <div
    class="notif-item"
    :class="{ 'notif-item--unread': !notification.read }"
    @click="$emit('click')"
  >
    <div class="notif-item__icon" :style="{ background: iconColor }">
      <el-icon :size="14"><component :is="iconComponent" /></el-icon>
    </div>
    <div class="notif-item__body">
      <div class="notif-item__header">
        <span class="notif-item__title">{{ notification.title }}</span>
        <el-button
          v-if="showClose"
          :icon="Close"
          text
          size="small"
          class="notif-item__close"
          @click.stop="$emit('close')"
        />
      </div>
      <div class="notif-item__message">{{ notification.message }}</div>
      <div class="notif-item__meta">
        <span class="notif-item__time">{{ formatTime(notification.createdAt) }}</span>
        <el-tag v-if="notification.actionLabel" size="small" type="primary" effect="plain">
          {{ notification.actionLabel }}
        </el-tag>
      </div>
    </div>
    <div v-if="showActions && notification.actionUrl" class="notif-item__actions">
      <el-button text size="small" type="primary" @click.stop="$emit('click')">
        查看
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Close, Setting, User, Cpu, Warning } from "@element-plus/icons-vue";
import type { Notification, NotificationType } from "@/stores/modules/notification";

const props = withDefaults(defineProps<{
  notification: Notification;
  showClose?: boolean;
  showActions?: boolean;
}>(), {
  showClose: true,
  showActions: false,
});

defineEmits<{
  click: [];
  close: [];
}>();

const TYPE_ICONS: Record<NotificationType, any> = {
  system: Setting,
  user_action: User,
  ai: Cpu,
  error: Warning,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  system: "#409eff",
  user_action: "#67c23a",
  ai: "#e6a23c",
  error: "#f56c6c",
};

const iconComponent = computed(() => TYPE_ICONS[props.notification.type] || Setting);
const iconColor = computed(() => TYPE_COLORS[props.notification.type] || "#909399");

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}
</script>

<style scoped lang="scss">
.notif-item {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &--unread {
    background: var(--el-color-primary-light-9);
  }

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }

  &__close {
    padding: 0;
    margin-left: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    .notif-item:hover & {
      opacity: 1;
    }
  }

  &__message {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
    margin-top: 2px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  &__time {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }

  &__actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}
</style>