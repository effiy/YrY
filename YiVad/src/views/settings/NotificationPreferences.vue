<template>
  <div class="notif-prefs">
    <h2 class="notif-prefs__title">通知偏好设置</h2>

    <el-card class="notif-prefs__card">
      <template #header><span>浏览器通知</span></template>
      <div class="pref-row">
        <div>
          <span class="pref-label">桌面通知</span>
          <p class="pref-desc">当页面不在前台时，通过浏览器通知提醒您</p>
        </div>
        <el-switch v-model="browserEnabled" @change="handleBrowserToggle" />
      </div>
      <p v-if="browserDenied" class="pref-warning">
        浏览器通知已被阻止，请在浏览器设置中重新开启
      </p>
    </el-card>

    <el-card class="notif-prefs__card">
      <template #header><span>通知类型</span></template>
      <div class="pref-row" v-for="item in typeItems" :key="item.key">
        <div>
          <span class="pref-label">{{ item.label }}</span>
          <p class="pref-desc">{{ item.desc }}</p>
        </div>
        <el-switch v-model="store.preferences[item.key]" @change="store.savePreferences()" />
      </div>
    </el-card>

    <el-card class="notif-prefs__card">
      <template #header><span>免打扰时段</span></template>
      <div class="pref-row">
        <span>启用免打扰</span>
        <el-switch v-model="store.quietHours.enabled" @change="store.savePreferences()" />
      </div>
      <div class="pref-row" v-if="store.quietHours.enabled">
        <span>开始时间</span>
        <el-time-picker
          v-model="quietStart"
          format="HH:mm"
          placeholder="22:00"
          @change="onQuietHoursChange"
        />
      </div>
      <div class="pref-row" v-if="store.quietHours.enabled">
        <span>结束时间</span>
        <el-time-picker
          v-model="quietEnd"
          format="HH:mm"
          placeholder="08:00"
          @change="onQuietHoursChange"
        />
      </div>
      <p class="pref-desc" style="margin-top: 8px">
        免打扰时段内不会弹出通知，通知仍会被保存可在通知中心查看
      </p>
    </el-card>

    <el-card class="notif-prefs__card">
      <template #header><span>连接状态</span></template>
      <div class="pref-row">
        <span>实时通知连接</span>
        <el-tag :type="sseConnected ? 'success' : 'danger'" size="small">
          {{ sseConnected ? '已连接' : '未连接' }}
        </el-tag>
      </div>
      <div class="pref-row" v-if="sseError">
        <span class="pref-error">{{ sseError }}</span>
        <el-button size="small" @click="sseReconnect()">重新连接</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useNotificationStore, type NotificationType } from "@/stores/modules/notification";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";

const store = useNotificationStore();
const { connected: sseConnected, error: sseError, reconnect: sseReconnect } = useNotificationSSE();

const browserEnabled = ref(store.browserPermission);
const browserDenied = ref(typeof Notification !== "undefined" && Notification.permission === "denied");

const quietStart = computed({
  get: () => store.quietHours.start,
  set: () => {},
});

const quietEnd = computed({
  get: () => store.quietHours.end,
  set: () => {},
});

const typeItems: { key: NotificationType; label: string; desc: string }[] = [
  { key: "system", label: "系统通知", desc: "部署状态、备份完成、服务更新" },
  { key: "user_action", label: "用户协作", desc: "被提及、任务分配、评论回复" },
  { key: "ai", label: "AI 通知", desc: "聊天完成、Agent 执行完毕、RAG 索引更新" },
  { key: "error", label: "错误告警", desc: "API 异常、构建失败、服务不可用" },
];

async function handleBrowserToggle(value: string | number | boolean): Promise<void> {
  if (value) {
    const granted = await store.requestBrowserPermission();
    browserEnabled.value = granted;
    browserDenied.value = !granted;
  } else {
    browserEnabled.value = false;
  }
}

function onQuietHoursChange(): void {
  store.savePreferences();
}
</script>

<style scoped lang="scss">
.notif-prefs {
  padding: 20px;
  max-width: 720px;
  margin: 0 auto;
}

.notif-prefs__title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
}

.notif-prefs__card {
  margin-bottom: 16px;
}

.pref-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.pref-label {
  font-weight: 500;
  font-size: 14px;
}

.pref-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pref-warning {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--el-color-warning);
}

.pref-error {
  font-size: 12px;
  color: var(--el-color-danger);
}
</style>