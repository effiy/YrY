<template>
  <div class="card content-box">
    <span class="text">Loading Demo</span>
    <el-alert
      title="Loading is a CSS-only spinner component. It renders a dot-spin animation suitable for inline loading states."
      type="warning"
      :closable="false"
    />
    <div class="loading-demo mt30">
      <Loading />
    </div>
    <el-descriptions title="Usage" :column="1" border class="mt30">
      <el-descriptions-item label="Import">import Loading from "@/components/Loading/index.vue"</el-descriptions-item>
      <el-descriptions-item label="Usage">&lt;Loading /&gt;</el-descriptions-item>
      <el-descriptions-item label="Location">src/components/Loading/</el-descriptions-item>
      <el-descriptions-item label="Note">No props, pure CSS animation. Wrap in a container to control size.</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoLoading">
import Loading from "@/components/Loading/index.vue";
</script>

<style scoped lang="scss">
.loading-demo {
  display: flex;
  justify-content: center;
  padding: 40px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}
.mt30 { margin-top: 30px; }
</style>