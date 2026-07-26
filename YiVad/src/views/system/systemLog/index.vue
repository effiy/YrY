<template>
  <div class="card content-box">
    <span class="text title">System Logs</span>
    <el-descriptions :column="1" border style="margin-top: 16px">
      <el-descriptions-item label="Server">{{ logInfo.server || "—" }}</el-descriptions-item>
      <el-descriptions-item label="Uptime">{{ logInfo.uptime || "—" }}</el-descriptions-item>
      <el-descriptions-item label="Log Level">{{ logInfo.log_level || "—" }}</el-descriptions-item>
      <el-descriptions-item label="Database">{{ logInfo.database || "—" }}</el-descriptions-item>
      <el-descriptions-item label="RSS Scheduler">{{ logInfo.rss_scheduler || "—" }}</el-descriptions-item>
    </el-descriptions>
    <div style="margin-top: 20px">
      <el-button type="primary" :icon="Refresh" @click="loadLogs">Refresh</el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="systemLog">
import { ref, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { getSchedulerStatus } from "@/api/modules/system";

const logInfo = ref<Record<string, any>>({});

const loadLogs = async () => {
  const { data } = await getSchedulerStatus();
  logInfo.value = {
    server: document.URL,
    uptime: data?.status || "running",
    log_level: "INFO",
    database: "MongoDB — ruiyi",
    rss_scheduler: data?.status || "active"
  };
};

onMounted(loadLogs);
</script>

<style scoped lang="scss">
.card {
  padding: 20px;
  .title {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
