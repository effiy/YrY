<template>
  <div class="notif-prefs">
    <h2 class="notif-prefs__title">{{ $t("notification.preferences.title") }}</h2>

    <el-card class="notif-prefs__card">
      <template #header><span>{{ $t("notification.preferences.browserTitle") }}</span></template>
      <div class="pref-row">
        <div>
          <span class="pref-label">{{ $t("notification.preferences.desktopLabel") }}</span>
          <p class="pref-desc">{{ $t("notification.preferences.desktopDesc") }}</p>
        </div>
        <el-switch v-model="browserEnabled" @change="handleBrowserToggle" />
      </div>
      <p v-if="browserDenied" class="pref-warning">{{ $t("notification.preferences.blockedWarning") }}</p>
    </el-card>

    <el-card class="notif-prefs__card">
      <template #header><span>{{ $t("notification.preferences.typeTitle") }}</span></template>
      <div class="pref-row" v-for="item in typeItems" :key="item.key">
        <div>
          <span class="pref-label">{{ item.label }}</span>
          <p class="pref-desc">{{ item.desc }}</p>
        </div>
        <el-switch v-model="store.preferences[item.key]" @change="store.savePreferences()" />
      </div>
    </el-card>

    <el-card class="notif-prefs__card">
      <template #header><span>{{ $t("notification.preferences.quietTitle") }}</span></template>
      <div class="pref-row">
        <span>{{ $t("notification.preferences.enableQuiet") }}</span>
        <el-switch v-model="store.quietHours.enabled" @change="store.savePreferences()" />
      </div>
      <div class="pref-row" v-if="store.quietHours.enabled">
        <span>{{ $t("notification.preferences.startTime") }}</span>
        <el-time-picker v-model="quietStart" format="HH:mm" placeholder="22:00" @change="onQuietHoursChange" />
      </div>
      <div class="pref-row" v-if="store.quietHours.enabled">
        <span>{{ $t("notification.preferences.endTime") }}</span>
        <el-time-picker v-model="quietEnd" format="HH:mm" placeholder="08:00" @change="onQuietHoursChange" />
      </div>
      <p class="pref-desc" style="margin-top: 8px">{{ $t("notification.preferences.quietHint") }}</p>
    </el-card>

    <el-card class="notif-prefs__card">
      <template #header><span>{{ $t("notification.preferences.connectionTitle") }}</span></template>
      <div class="pref-row">
        <span>{{ $t("notification.preferences.realtimeLabel") }}</span>
        <el-tag :type="sseConnected ? 'success' : 'danger'" size="small">
          {{ sseConnected ? $t("notification.preferences.connected") : $t("notification.preferences.disconnected") }}
        </el-tag>
      </div>
      <div class="pref-row" v-if="sseError">
        <span class="pref-error">{{ sseError }}</span>
        <el-button size="small" @click="sseReconnect()">{{ $t("notification.preferences.reconnect") }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="notificationPrefs">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNotificationStore, type NotificationType } from "@/stores/modules/notification";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";

const { t } = useI18n();
const store = useNotificationStore();
const { connected: sseConnected, error: sseError, reconnect: sseReconnect } = useNotificationSSE();

const browserEnabled = ref(store.browserPermission);
const browserDenied = ref(typeof Notification !== "undefined" && Notification.permission === "denied");

const quietStart = computed({
  get: () => store.quietHours.start,
  set: () => {}
});

const quietEnd = computed({
  get: () => store.quietHours.end,
  set: () => {}
});

const typeItems: { key: NotificationType; label: string; desc: string }[] = [
  { key: "system", label: t("notification.filters.system"), desc: "部署状态、备份完成、服务更新" },
  { key: "user_action", label: "用户协作", desc: "被提及、任务分配、评论回复" },
  { key: "ai", label: "AI 通知", desc: "聊天完成、Agent 执行完毕、RAG 索引更新" },
  { key: "error", label: "错误告警", desc: "API 异常、构建失败、服务不可用" }
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
  max-width: 720px;
  padding: 20px;
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
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}
.pref-label {
  font-size: 14px;
  font-weight: 500;
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