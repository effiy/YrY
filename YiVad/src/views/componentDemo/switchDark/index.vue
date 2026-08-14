<template>
  <div class="card content-box">
    <span class="text">SwitchDark Demo</span>
    <el-alert
      title="SwitchDark is a dark mode toggle switch. It uses the useTheme composable to switch between light and dark themes."
      type="warning"
      :closable="false"
    />
    <div class="switch-demo mt30">
      <span class="mr10">Toggle Dark Mode:</span>
      <SwitchDark />
    </div>
    <el-descriptions title="Usage" :column="1" border class="mt30">
      <el-descriptions-item label="Import">import SwitchDark from "@/components/SwitchDark/index.vue"</el-descriptions-item>
      <el-descriptions-item label="Usage">&lt;SwitchDark /&gt;</el-descriptions-item>
      <el-descriptions-item label="Depends on">useTheme() composable, useGlobalStore().isDark</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoSwitchDark">
import SwitchDark from "@/components/SwitchDark/index.vue";
</script>

<style scoped lang="scss">
.switch-demo { display: flex; align-items: center; }
.mr10 { margin-right: 10px; }
.mt30 { margin-top: 30px; }
</style>