<template>
  <div class="card content-box">
    <span class="text title">Scheduled Tasks</span>
    <el-descriptions :column="1" border style="margin-top: 16px">
      <el-descriptions-item label="RSS Scheduler Status">{{ statusInfo.status || "Loading..." }}</el-descriptions-item>
      <el-descriptions-item label="Interval">{{ statusInfo.interval ? statusInfo.interval + "s" : "—" }}</el-descriptions-item>
      <el-descriptions-item label="Enabled Sources">{{ statusInfo.source_count ?? "—" }}</el-descriptions-item>
      <el-descriptions-item label="Next Run">{{ statusInfo.next_run || "—" }}</el-descriptions-item>
      <el-descriptions-item label="Last Run">{{ statusInfo.last_run || "—" }}</el-descriptions-item>
    </el-descriptions>
    <div style="margin-top: 20px">
      <el-button type="primary" :icon="Refresh" @click="loadStatus">Refresh</el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="timingTask">
import { ref, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { getSchedulerStatus } from "@/api/modules/system";

const statusInfo = ref<Record<string, any>>({});

const loadStatus = async () => {
  const { data } = await getSchedulerStatus();
  statusInfo.value = data || {};
};

onMounted(loadStatus);
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
