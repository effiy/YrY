<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiPet (Gentle Companion) is a Chrome MV3 browser extension. It injects an interactive companion into any page, with
        multi-role chat, a React control panel, on-demand CDN resource injection, i18n (en + zh_CN), and timezone-aware display.
        Powered by a local YiAi FastAPI backend. Built with Vite + TypeScript.
      </span>
    </div>
    <div class="card mb10">
      <h4 class="title">Project Info</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Version" label-align="left">
          <el-tag>1.2.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Platform" label-align="left">
          <el-tag>Chrome MV3 Extension</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="UI Framework" label-align="left">
          <el-tag>React 15.6.1 (CDN)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="CSS Framework" label-align="left">
          <el-tag>Bootstrap 5.2.3 (CDN)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Build Tool" label-align="left">
          <el-tag>Vite 5 + TypeScript (strict)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="i18n" label-align="left">
          <el-tag>chrome.i18n (en + zh_CN)</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="card">
      <h4 class="title">Tech Stack</h4>
      <div class="tag-list">
        <el-tag v-for="tech in techStack" :key="tech" class="tech-tag">{{ tech }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="aboutYiPet">
const techStack = ["TypeScript", "Vite 5", "React 15", "Chrome MV3", "Bootstrap 5", "chrome.i18n", "chrome.storage"];
</script>

<style lang="scss" scoped>
.card {
  .title {
    margin: 0 0 15px;
    font-size: 17px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
  .text {
    font-size: 15px;
    line-height: 25px;
    color: var(--el-text-color-regular);
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  margin: 0;
}
</style>
