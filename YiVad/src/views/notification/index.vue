<template>
  <div class="notif-center">
    <div class="notif-center__header">
      <h2 class="notif-center__title">通知中心</h2>
      <div class="notif-center__toolbar">
        <el-select v-model="typeFilter" placeholder="通知类型" clearable size="default" style="width: 140px">
          <el-option label="全部" value="all" />
          <el-option label="系统通知" value="system" />
          <el-option label="用户协作" value="user_action" />
          <el-option label="AI 通知" value="ai" />
          <el-option label="错误告警" value="error" />
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="搜索通知..."
          :prefix-icon="Search"
          clearable
          size="default"
          style="width: 240px"
        />
        <el-button v-if="unreadCount > 0" type="primary" @click="handleMarkAllRead">
          全部已读 ({{ unreadCount }})
        </el-button>
        <el-button v-if="store.notifications.length > 0" @click="handleClearAll">
          清空全部
        </el-button>
      </div>
    </div>

    <div class="notif-center__list" v-loading="loading">
      <template v-if="filteredList.length">
        <div
          v-for="n in pagedList"
          :key="n.id"
          class="notif-item"
          :class="{ 'notif-item--unread': !n.read }"
          @click="handleClick(n)"
        >
          <div class="notif-item__icon" :style="{ background: iconColor(n.type) }">
            <el-icon :size="14"><component :is="iconFor(n.type)" /></el-icon>
          </div>
          <div class="notif-item__body">
            <div class="notif-item__header">
              <span class="notif-item__title">{{ n.title }}</span>
              <el-tag :type="priorityTag(n.priority)" size="small" effect="plain">
                {{ priorityLabel(n.priority) }}
              </el-tag>
            </div>
            <div class="notif-item__msg">{{ n.message }}</div>
            <div class="notif-item__meta">
              <span class="notif-item__time">{{ formatTime(n.createdAt) }}</span>
              <el-tag v-if="n.source" size="small" type="info" effect="plain">{{ n.source }}</el-tag>
            </div>
          </div>
          <div class="notif-item__actions">
            <el-button
              v-if="n.actionUrl"
              text
              size="small"
              type="primary"
              @click.stop="handleClick(n)"
            >查看</el-button>
            <el-button
              :icon="Close"
              text
              size="small"
              @click.stop="store.removeNotification(n.id)"
            />
          </div>
        </div>
      </template>
      <el-empty v-else-if="!loading" description="暂无通知" />
    </div>

    <div class="notif-center__pagination" v-if="totalPages > 1">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredList.length"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, Close, Setting, User, Cpu, Warning } from "@element-plus/icons-vue";
import { useNotificationStore } from "@/stores/modules/notification";
import type { Notification, NotificationType, NotificationPriority } from "@/stores/modules/notification";

const router = useRouter();
const store = useNotificationStore();
const typeFilter = ref<NotificationType | "all">("all");
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = 20;
const loading = ref(false);

const unreadCount = computed(() => store.unreadCount);

const filteredList = computed(() => {
  let list = store.notifications;
  if (typeFilter.value !== "all") {
    list = list.filter((n) => n.type === typeFilter.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    );
  }
  return list;
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize));

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

function handleClick(n: Notification): void {
  store.markAsRead(n.id);
  if (n.actionUrl) router.push(n.actionUrl);
}

function handleMarkAllRead(): void {
  store.markAllAsRead();
}

function handleClearAll(): void {
  store.notifications.length = 0;
}

function handlePageChange(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(async () => {
  loading.value = true;
  try {
    const { getNotifications } = await import("@/api/modules/notificationService");
    const res = await getNotifications({ page: 1, size: 50 });
    if (res.data?.list) store.setNotifications(res.data.list as Notification[]);
  } catch { /* backend may not be ready */ } finally {
    loading.value = false;
  }
});

const TYPE_ICONS: Record<string, any> = {
  system: Setting, user_action: User, ai: Cpu, error: Warning,
};

const TYPE_COLORS: Record<string, string> = {
  system: "#409eff", user_action: "#67c23a", ai: "#e6a23c", error: "#f56c6c",
};

function iconFor(type: string) { return TYPE_ICONS[type] || Setting; }
function iconColor(type: string) { return TYPE_COLORS[type] || "#909399"; }

type TagType = "success" | "warning" | "info" | "primary" | "danger";

function priorityTag(p: NotificationPriority): TagType {
  const m: Record<string, TagType> = { urgent: "danger", high: "warning", medium: "info", low: "info" };
  return m[p] || "info";
}

function priorityLabel(p: NotificationPriority): string {
  const m: Record<string, string> = { urgent: "紧急", high: "高", medium: "中", low: "低" };
  return m[p] || p;
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
</script>

<style scoped lang="scss">
.notif-center {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.notif-center__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.notif-center__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.notif-center__toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.notif-center__list {
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  min-height: 200px;
}

.notif-center__pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.notif-item {
  display: flex;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background 0.2s;

  &:hover { background: var(--el-fill-color-light); }
  &--unread { background: var(--el-color-primary-light-9); }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__body { flex: 1; min-width: 0; }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  &__title { font-size: 14px; font-weight: 500; }

  &__msg {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    line-height: 1.5;
  }

  &__meta {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 6px;
  }

  &__time { font-size: 12px; color: var(--el-text-color-placeholder); }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
}
</style>