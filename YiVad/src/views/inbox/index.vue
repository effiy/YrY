<template>
  <div class="inbox">
    <div class="inbox__head">
      <div class="inbox__head-left">
        <h1 class="inbox__title">Inbox</h1>
        <el-tag v-if="unreadCount" type="danger" size="small">{{ unreadCount }} unread</el-tag>
      </div>
      <div class="inbox__head-right">
        <el-button text size="small" @click="markAllRead">Mark all read</el-button>
        <el-button text size="small" type="danger" @click="clearAll">Clear all</el-button>
      </div>
    </div>

    <div v-loading="loading" class="inbox__list">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="inbox__item"
        :class="{ 'inbox__item--unread': !n.read }"
        @click="openNotification(n)"
      >
        <div class="inbox__item-dot" :style="{ background: n.read ? '#c0c4cc' : n.color }" />
        <div class="inbox__item-icon" :style="{ background: n.color }">
          <el-icon :size="14"><component :is="iconFor(n.type)" /></el-icon>
        </div>
        <div class="inbox__item-content">
          <div class="inbox__item-title">
            {{ n.title }}
            <span v-if="!n.read" class="inbox__item-badge">New</span>
          </div>
          <div class="inbox__item-body">{{ n.body }}</div>
          <div class="inbox__item-time">{{ formatTime(n.time) }}</div>
        </div>
      </div>
      <el-empty v-if="!loading && !notifications.length" description="No notifications" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts" name="inboxNotifications">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Tickets, ChatDotRound, User, CircleCheck, Bell } from "@element-plus/icons-vue";

const router = useRouter();

interface Notification {
  id: string;
  type: "assigned" | "mentioned" | "status_change" | "comment" | "due_date";
  title: string;
  body: string;
  color: string;
  link: string;
  read: boolean;
  time: string;
}

const loading = ref(false);
const notifications = ref<Notification[]>([
  // Static demo notifications — in production, fetched from API
  { id: "1", type: "assigned", title: "Assigned to you", body: "Issue #1: Update homepage layout", color: "#409eff", link: "/issue/1", read: false, time: new Date(Date.now() - 300000).toISOString() },
  { id: "2", type: "comment", title: "New comment", body: "Alice commented on: Fix login redirect bug", color: "#67c23a", link: "/issue/2", read: false, time: new Date(Date.now() - 1800000).toISOString() },
  { id: "3", type: "status_change", title: "Status changed", body: "API rate limiting moved to In Review", color: "#e6a23c", link: "/issue/3", read: true, time: new Date(Date.now() - 3600000).toISOString() },
  { id: "4", type: "due_date", title: "Due date approaching", body: "Sprint 3 retrospective is due tomorrow", color: "#f56c6c", link: "/cycle/1", read: false, time: new Date(Date.now() - 7200000).toISOString() },
  { id: "5", type: "mentioned", title: "You were mentioned", body: "Bob mentioned you in: Design system update", color: "#9b59b6", link: "/page", read: true, time: new Date(Date.now() - 86400000).toISOString() }
]);

const unreadCount = ref(notifications.value.filter(n => !n.read).length);

function openNotification(n: Notification) {
  n.read = true;
  unreadCount.value = notifications.value.filter(x => !x.read).length;
  if (n.link) router.push(n.link);
}

function markAllRead() {
  notifications.value.forEach(n => { n.read = true; });
  unreadCount.value = 0;
}

function clearAll() {
  notifications.value = [];
  unreadCount.value = 0;
}

function iconFor(type: string) {
  const icons: Record<string, any> = { assigned: User, mentioned: Bell, status_change: CircleCheck, comment: ChatDotRound, due_date: Tickets };
  return icons[type] || Bell;
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
</script>

<style scoped lang="scss">
.inbox {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.inbox__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.inbox__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.inbox__title { margin: 0; font-size: 20px; font-weight: 600; }
.inbox__head-right { display: flex; gap: 8px; }
.inbox__list {
  max-width: 650px;
  display: flex;
  flex-direction: column;
}
.inbox__item {
  display: flex;
  gap: 14px;
  padding: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.1s;
  &:hover { background: var(--el-fill-color-light); }
  &--unread { background: var(--el-color-primary-light-9); }
}
.inbox__item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.inbox__item-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 14px;
  flex-shrink: 0;
}
.inbox__item-content { flex: 1; min-width: 0; }
.inbox__item-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.inbox__item-badge {
  font-size: 10px;
  color: var(--el-color-danger);
  font-weight: 600;
  margin-left: 6px;
}
.inbox__item-body { font-size: 13px; color: var(--el-text-color-secondary); margin-bottom: 4px; }
.inbox__item-time { font-size: 12px; color: var(--el-text-color-placeholder); }
</style>