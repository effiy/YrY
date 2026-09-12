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
        <div class="notif-panel__head-actions">
          <el-button v-if="unreadCount > 0" text size="small" type="primary" @click="handleMarkAllRead">
            全部已读
          </el-button>
          <el-button text size="small" @click="handleViewAll">
            查看全部
          </el-button>
        </div>
      </div>

      <NotificationFilter
        v-model="activeFilter"
        :counts="typeCounts"
      />

      <div class="notif-panel__list" v-loading="loading">
        <template v-if="filteredList.length">
          <NotificationItem
            v-for="n in filteredList"
            :key="n.id"
            :notification="n"
            @click="handleClick(n)"
            @close="handleDismiss(n.id)"
          />
        </template>
        <el-empty v-else description="暂无通知" :image-size="60" />
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Bell } from "@element-plus/icons-vue";
import { useNotificationStore } from "@/stores/modules/notification";
import type { Notification, NotificationType } from "@/stores/modules/notification";
import NotificationItem from "./NotificationItem.vue";
import NotificationFilter from "./NotificationFilter.vue";

const router = useRouter();
const store = useNotificationStore();
const visible = ref(false);
const activeFilter = ref<NotificationType | "all">("all");
const loading = ref(false);

const unreadCount = computed(() => store.unreadCount);

const typeCounts = computed(() => ({
  all: store.notifications.length,
  system: store.notificationsByType.system.length,
  user_action: store.notificationsByType.user_action.length,
  ai: store.notificationsByType.ai.length,
  error: store.notificationsByType.error.length,
}));

const filteredList = computed(() => {
  if (activeFilter.value === "all") return store.unreadNotifications.slice(0, 10);
  return store.unreadNotifications
    .filter((n) => n.type === activeFilter.value)
    .slice(0, 10);
});

function handleClick(notification: Notification): void {
  store.markAsRead(notification.id);
  visible.value = false;
  if (notification.actionUrl) {
    router.push(notification.actionUrl);
  }
}

function handleDismiss(id: string): void {
  store.removeNotification(id);
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

.notif-panel__head-actions {
  display: flex;
  gap: 4px;
}

.notif-panel__list {
  max-height: 420px;
  overflow-y: auto;
}
</style>