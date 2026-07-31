<template>
  <div class="card content-box">
    <el-alert
      title="SVG icons are implemented via build/svg-sprite-plugin.ts (replaces vite-plugin-svg-icons). See build/svg-sprite-plugin.ts"
      type="warning"
      :closable="false"
    />
    <div class="icon-list">
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
      <SvgIcon name="xianxingxiarilengyin" />
    </div>
    <el-descriptions title="Config Options 📚" :column="1" border>
      <el-descriptions-item label="name">
        Icon name; SVG icons must be stored under src/assets/icons directory
      </el-descriptions-item>
      <el-descriptions-item label="prefix"> Icon prefix, default "icon" </el-descriptions-item>
      <el-descriptions-item label="iconStyle"> Icon style, default { width: "100px", height: "100px" } </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="svgIcon">
import SvgIcon from "@/components/SvgIcon/index.vue";
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
