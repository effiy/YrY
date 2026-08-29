<template>
  <el-popover :visible="popoverVisible" placement="bottom-end" :width="360" trigger="click" @show="loadNotifications">
    <template #reference>
      <el-badge :value="unreadCount" :hidden="!unreadCount" :max="99">
        <el-button :icon="Bell" text @click="popoverVisible = !popoverVisible" />
      </el-badge>
    </template>

    <div class="notif">
      <div class="notif__head">
        <span class="notif__title">Notifications</span>
        <el-button v-if="notifications.length" text size="small" @click="clearAll">Clear all</el-button>
      </div>
      <div v-if="loading" class="notif__loading">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
      <div v-else-if="!notifications.length" class="notif__empty">
        <el-empty description="No notifications" :image-size="40" />
      </div>
      <div v-else class="notif__list">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notif__item"
          :class="{ 'notif__item--unread': !n.read }"
          @click="handleClick(n)"
        >
          <div class="notif__item-icon" :style="{ background: iconColor(n.type) }">
            <el-icon :size="12"><component :is="iconFor(n.type)" /></el-icon>
          </div>
          <div class="notif__item-body">
            <div class="notif__item-text">{{ n.text }}</div>
            <div class="notif__item-time">{{ formatTime(n.time) }}</div>
          </div>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Bell, Loading, Tickets, Calendar, Promotion, ChatDotRound } from "@element-plus/icons-vue";
import { useIssueStore } from "@/stores/modules/issue";
import { useCycleStore } from "@/stores/modules/cycle";

const router = useRouter();
const issueStore = useIssueStore();
const cycleStore = useCycleStore();

const popoverVisible = ref(false);
const loading = ref(false);
const notifications = ref<Array<{ id: string; type: string; text: string; time: string; link: string; read: boolean }>>([]);

const unreadCount = ref(0);

async function loadNotifications() {
  loading.value = true;
  try {
    await Promise.all([
      issueStore.fetchIssues({ pageSize: 50, orderBy: "updated_at", orderType: "desc" }),
      cycleStore.fetchCycles({ pageSize: 20 })
    ]);

    const items: typeof notifications.value = [];

    issueStore.issues.slice(0, 10).forEach(i => {
      items.push({
        id: i.key,
        type: i.issue_type === "bug" ? "bug" : "issue",
        text: `${i.title} — ${i.status}`,
        time: i.updated_at,
        link: `/issue/${i.key}`,
        read: false
      });
    });

    cycleStore.cycles.filter(c => c.status === "active").forEach(c => {
      items.push({
        id: c.key,
        type: "cycle",
        text: `Active cycle: ${c.name} (${c.issue_keys?.length || 0} issues)`,
        time: c.updated_at,
        link: `/cycle`,
        read: false
      });
    });

    notifications.value = items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 20);
    unreadCount.value = notifications.value.length;
  } finally {
    loading.value = false;
  }
}

function handleClick(n: typeof notifications.value[0]) {
  n.read = true;
  unreadCount.value = notifications.value.filter(x => !x.read).length;
  popoverVisible.value = false;
  if (n.link) router.push(n.link);
}

function clearAll() {
  notifications.value = [];
  unreadCount.value = 0;
}

function iconFor(type: string) {
  const m: Record<string, any> = { issue: Tickets, bug: Tickets, cycle: Calendar, release: Promotion };
  return m[type] || ChatDotRound;
}

function iconColor(type: string) {
  const m: Record<string, string> = { issue: "#409eff", bug: "#f56c6c", cycle: "#67c23a", release: "#e6a23c" };
  return m[type] || "#909399";
}

function formatTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}
</script>

<style scoped lang="scss">
.notif {
  margin: -12px;
}
.notif__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.notif__title {
  font-weight: 600;
  font-size: 14px;
}
.notif__loading {
  padding: 40px;
  text-align: center;
}
.notif__empty {
  padding: 20px;
}
.notif__list {
  max-height: 400px;
  overflow-y: auto;
}
.notif__item {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  &:hover { background: var(--el-fill-color-light); }
}
.notif__item--unread {
  background: var(--el-color-primary-light-9);
}
.notif__item-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  margin-top: 2px;
}
.notif__item-body {
  flex: 1;
  min-width: 0;
}
.notif__item-text {
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.notif__item-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
}
</style>