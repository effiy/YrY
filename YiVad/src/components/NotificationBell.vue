<template>
  <el-popover
    :visible="visible"
    placement="bottom-end"
    :width="400"
    trigger="click"
    @show="handleOpen"
    @hide="visible = false"
  >
    <template #reference>
      <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
        <el-button :icon="Bell" text @click="visible = !visible" />
      </el-badge>
    </template>

    <div class="notif-panel">
      <div class="notif-panel__head">
        <span class="notif-panel__title">通知</span>
        <div class="notif-panel__actions">
          <el-button v-if="unreadCount > 0" text size="small" type="primary" @click="handleMarkAllRead">
            全部已读
          </el-button>
          <el-button text size="small" @click="handleViewAll">
            查看全部
          </el-button>
        </div>
      </div>

      <div class="notif-panel__filter">
        <el-radio-group v-model="activeFilter" size="small">
          <el-radio-button value="all">全部 ({{ counts.all }})</el-radio-button>
          <el-radio-button value="system">系统 ({{ counts.system }})</el-radio-button>
          <el-radio-button value="user_action">协作 ({{ counts.user_action }})</el-radio-button>
          <el-radio-button value="ai">AI ({{ counts.ai }})</el-radio-button>
          <el-radio-button value="error">告警 ({{ counts.error }})</el-radio-button>
        </el-radio-group>
      </div>

      <div class="notif-panel__list" v-loading="loading">
        <template v-if="filteredList.length">
          <div
            v-for="n in filteredList"
            :key="n.id"
            class="notif-item"
            :class="{ 'notif-item--unread': !n.read }"
            @click="handleClick(n)"
          >
            <div class="notif-item__icon" :style="{ background: iconColor(n.type) }">
              <el-icon :size="14"><component :is="iconFor(n.type)" /></el-icon>
            </div>
            <div class="notif-item__body">
              <div class="notif-item__title">{{ n.title }}</div>
              <div class="notif-item__msg">{{ n.message }}</div>
              <div class="notif-item__time">{{ formatTime(n.createdAt) }}</div>
            </div>
            <el-button
              :icon="Close"
              text
              size="small"
              class="notif-item__dismiss"
              @click.stop="store.removeNotification(n.id)"
            />
          </div>
        </template>
        <el-empty v-else description="暂无通知" :image-size="60" />
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Bell, Close, Setting, User, Cpu, Warning } from "@element-plus/icons-vue";
import { useNotificationStore } from "@/stores/modules/notification";
import type { Notification, NotificationType } from "@/stores/modules/notification";

const router = useRouter();
const store = useNotificationStore();
const visible = ref(false);
const activeFilter = ref<NotificationType | "all">("all");
const loading = ref(false);

const unreadCount = computed(() => store.unreadCount);

const counts = computed(() => ({
  all: store.notifications.length,
  system: store.notificationsByType.system.length,
  user_action: store.notificationsByType.user_action.length,
  ai: store.notificationsByType.ai.length,
  error: store.notificationsByType.error.length,
}));

const filteredList = computed(() => {
  const source = activeFilter.value === "all"
    ? store.unreadNotifications
    : store.unreadNotifications.filter((n) => n.type === activeFilter.value);
  return source.slice(0, 10);
});

function handleClick(n: Notification): void {
  store.markAsRead(n.id);
  visible.value = false;
  if (n.actionUrl) router.push(n.actionUrl);
}

function handleMarkAllRead(): void {
  store.markAllAsRead();
}

function handleViewAll(): void {
  visible.value = false;
  router.push("/notifications");
}

function handleOpen(): void {
  loading.value = true;
  setTimeout(() => (loading.value = false), 200);
}

const TYPE_ICONS: Record<string, any> = {
  system: Setting,
  user_action: User,
  ai: Cpu,
  error: Warning,
};

const TYPE_COLORS: Record<string, string> = {
  system: "#409eff",
  user_action: "#67c23a",
  ai: "#e6a23c",
  error: "#f56c6c",
};

function iconFor(type: string) {
  return TYPE_ICONS[type] || Setting;
}

function iconColor(type: string) {
  return TYPE_COLORS[type] || "#909399";
}

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
.notif-panel {
  margin: -12px;
}

.notif-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.notif-panel__title {
  font-weight: 600;
  font-size: 14px;
}

.notif-panel__actions {
  display: flex;
  gap: 4px;
}

.notif-panel__filter {
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  :deep(.el-radio-button__inner) {
    padding: 4px 10px;
    font-size: 12px;
  }
}

.notif-panel__list {
  max-height: 420px;
  overflow-y: auto;
}

.notif-item {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background 0.2s;

  &:hover { background: var(--el-fill-color-light); }

  &--unread { background: var(--el-color-primary-light-9); }

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

  &__title {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }

  &__msg {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
    margin-top: 2px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__time {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    margin-top: 4px;
  }

  &__dismiss {
    padding: 0;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
    align-self: flex-start;
    .notif-item:hover & { opacity: 1; }
  }
}
</style>