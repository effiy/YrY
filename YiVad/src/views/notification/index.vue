<template>
  <div class="notif-center page">
    <PageHeaderCard
      :icon="Bell"
      icon-bg="linear-gradient(135deg, #409eff, #6366f1)"
      title="通知中心"
      description="查看和管理所有系统通知、协作消息和告警"
    />

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
      <el-button v-if="store.notifications.length > 0" @click="handleClearAll">清空全部</el-button>
    </div>

    <!-- Batch Actions -->
    <div v-if="selectedIds.size" class="notif-center__batch">
      <span class="notif-center__batch-count">已选 {{ selectedIds.size }} 条</span>
      <el-button size="small" type="danger" @click="batchDelete">删除选中</el-button>
      <el-button size="small" @click="selectAll">全选 ({{ filteredList.length }})</el-button>
      <el-button size="small" text @click="selectedIds.clear()">取消选择</el-button>
    </div>

    <div class="notif-center__list" v-loading="loading">
      <template v-if="filteredList.length">
        <div
          v-for="n in pagedList"
          :key="n.id"
          class="notif-item"
          :class="{ 'notif-item--unread': !n.read, 'notif-item--selected': selectedIds.has(n.id) }"
        >
          <el-checkbox
            :model-value="selectedIds.has(n.id)"
            class="notif-item__check"
            @change="(v: any) => toggleSelect(n.id, !!v)"
            @click.stop
          />
          <div class="notif-item__icon" :style="{ background: notificationColor(n.type) }" @click="handleClick(n)">
            <el-icon :size="14"><component :is="notificationIcon(n.type)" /></el-icon>
          </div>
          <div class="notif-item__body" @click="handleClick(n)">
            <div class="notif-item__header">
              <span class="notif-item__title">{{ n.title }}</span>
              <el-tag :type="priorityTagType(n.priority)" size="small" effect="plain">
                {{ priorityLabel(n.priority) }}
              </el-tag>
            </div>
            <div class="notif-item__msg">{{ n.message }}</div>
            <div class="notif-item__meta">
              <span class="notif-item__time">{{ formatRelativeTime(n.createdAt) }}</span>
              <el-tag v-if="n.source" size="small" type="info" effect="plain">{{ n.source }}</el-tag>
            </div>
          </div>
          <div class="notif-item__actions">
            <el-button v-if="n.actionUrl" text size="small" type="primary" @click.stop="handleClick(n)">查看</el-button>
            <el-button :icon="Close" text size="small" title="Remove" @click.stop="store.removeNotification(n.id)" />
          </div>
        </div>
      </template>
      <el-empty v-else-if="!loading" description="暂无通知">
        <template #extra>
          <p style="color: var(--el-text-color-secondary); font-size: 13px; margin: 0;">新的通知会在这里显示</p>
        </template>
      </el-empty>
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

<script setup lang="ts" name="notification">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, Close, Bell } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useNotificationStore } from "@/stores/modules/notification";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import { notificationIcon, notificationColor, priorityTagType, formatRelativeTime } from "@/hooks/useTagHelpers";
import { confirm } from "@/hooks/useConfirmAction";
import type { Notification, NotificationType, NotificationPriority } from "@/stores/modules/notification";

const router = useRouter();
const store = useNotificationStore();
const typeFilter = ref<NotificationType | "all">("all");
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = 20;
const loading = ref(false);
const selectedIds = ref<Set<string>>(new Set());

const unreadCount = computed(() => store.unreadCount);

const filteredList = computed(() => {
  let list = store.notifications;
  if (typeFilter.value !== "all") {
    list = list.filter(n => n.type === typeFilter.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
  }
  return list;
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize));

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

function toggleSelect(id: string, checked: boolean) {
  const next = new Set(selectedIds.value);
  if (checked) next.add(id);
  else next.delete(id);
  selectedIds.value = next;
}

function selectAll() {
  selectedIds.value = new Set(filteredList.value.map(n => n.id));
}

async function batchDelete() {
  const count = selectedIds.value.size;
  const ok = await confirm(`删除 ${count} 条通知？`, "批量删除");
  if (!ok) return;
  for (const id of selectedIds.value) {
    store.removeNotification(id);
  }
  selectedIds.value = new Set();
  ElMessage.success(`已删除 ${count} 条通知`);
}

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
  } catch {
    /* backend may not be ready */
  } finally {
    loading.value = false;
  }
});

function priorityLabel(p: NotificationPriority): string {
  const m: Record<string, string> = { urgent: "紧急", high: "高", medium: "中", low: "低" };
  return m[p] || p;
}
</script>

<style scoped lang="scss">
.notif-center {
  max-width: 900px;
  margin: 0 auto;
  min-height: 100%;
}
.notif-center__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 24px 0 16px;
}
.notif-center__batch {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  margin-bottom: 12px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 8px;
}
.notif-center__batch-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.notif-center__list {
  min-height: 200px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
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
  &--selected { background: var(--el-color-primary-light-8); }
  &__check { flex-shrink: 0; margin-top: 8px; }
  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-top: 2px;
    color: #ffffff;
    border-radius: 50%;
  }
  &__body { flex: 1; min-width: 0; }
  &__header {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }
  &__title { font-size: 14px; font-weight: 500; }
  &__msg {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
  &__meta { display: flex; gap: 8px; align-items: center; margin-top: 6px; }
  &__time { font-size: 12px; color: var(--el-text-color-placeholder); }
  &__actions {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }
}
</style>