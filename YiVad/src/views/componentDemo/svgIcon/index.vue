<template>
  <div class="card content-box">
    <span class="text">SvgIcon Demo</span>
    <el-alert
      title="SvgIcon renders SVG icons from src/assets/icons via the SVG sprite plugin. Powered by the build/svg-sprite-plugin.ts custom Rsbuild plugin."
      type="warning"
      :closable="false"
    />
    <div class="icon-list mt30">
      <SvgIcon name="xianxingdaoyu" />
      <SvgIcon name="xianxingdiqiu" />
      <SvgIcon name="xianxingditu" />
      <SvgIcon name="xianxingfanchuan" />
      <SvgIcon name="xianxingfeiji" />
      <SvgIcon name="xianxinglvhangriji" />
      <SvgIcon name="xianxingtianqiyubao" />
      <SvgIcon name="xianxingxiangjipaizhao" />
      <SvgIcon name="xianxingxiarilengyin" />
      <SvgIcon name="xianxingyoulun" />
    </div>
    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="name">string — icon name (SVG file name under src/assets/icons)</el-descriptions-item>
      <el-descriptions-item label="prefix">string — icon prefix, default "icon"</el-descriptions-item>
      <el-descriptions-item label="iconStyle">Record — CSS style object for the icon</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoSvgIcon">
import SvgIcon from "@/components/SvgIcon/index.vue";
</script>

<style scoped lang="scss">
.icon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.mt30 { margin-top: 30px; }
</style>