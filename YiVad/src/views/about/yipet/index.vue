<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiPet (Gentle Companion) is a Chrome MV3 browser extension that injects an interactive animated companion into any web
        page. It supports multi-role AI chat powered by a local YiAi backend, a React-based control panel, on-demand CDN resource
        injection, and full i18n (en + zh_CN) with timezone-aware display. Built with Vite + TypeScript.
      </span>
    </div>

    <div class="card mb10">
      <h4 class="title">Highlights</h4>
      <el-row :gutter="12">
        <el-col :span="12" v-for="f in features" :key="f" class="feature-item">
          <span class="feature-text">{{ f }}</span>
        </el-col>
      </el-row>
    </div>

    <div class="card mb10">
      <h4 class="title">Architecture</h4>
      <span class="text">
        YiPet runs across two Chrome execution contexts (ISOLATED + MAIN world) and communicates with a local YiAi FastAPI
        backend. The popup UI, content scripts, and API layer form a clean three-tier stack. The API layer follows a strict
        four-tier architecture: client → endpoints → types → services.
      </span>
      <div class="arch-diagram">
        <el-tag type="primary" size="large">Popup UI (React 15)</el-tag>
        <span class="arch-arrow">↔</span>
        <el-tag type="success" size="large">Content Script (MV3 Dual)</el-tag>
        <span class="arch-arrow">↔</span>
        <el-tag type="warning" size="large">YiAi API (FastAPI)</el-tag>
      </div>
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
        <el-descriptions-item label="Backend" label-align="left">
          <el-tag type="success">YiAi FastAPI (localhost:10086)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="API Layer" label-align="left">
          <el-tag>Four-tier (Client → Endpoints → Types → Services)</el-tag>
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
const features = [
  "Animated pet companion on any page",
  "Multi-role AI chat window",
  "React 15 control panel (popup)",
  "On-demand CDN resource injection",
  "i18n: English & 简体中文",
  "Timezone-aware display",
  "Four-tier API layer with SSE streaming",
  "Chrome MV3 dual execution context"
];

const techStack = [
  "TypeScript",
  "Vite 5",
  "React 15.6.1",
  "Chrome MV3",
  "Bootstrap 5.2.3",
  "chrome.i18n",
  "chrome.storage",
  "FastAPI (YiAi)",
  "MongoDB (Motor)"
];
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

.feature-item {
  margin-bottom: 8px;
}

.feature-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 22px;

  &::before {
    content: "•";
    margin-right: 6px;
    color: var(--el-color-primary);
    font-weight: bold;
  }
}

.arch-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.arch-arrow {
  font-size: 20px;
  color: var(--el-text-color-secondary);
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
