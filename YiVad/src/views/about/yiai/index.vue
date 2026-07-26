<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiAi is a FastAPI-based backend server that provides AI-powered services (Ollama chat), file management with dual-write
        persistence, WeCom bot messaging, RSS feed aggregation, a generic module-execution engine, and a state-store for arbitrary
        key-value records. It runs on uvicorn, uses MongoDB via motor for async data access, and integrates with external storage
        (OSS) and LLM inference (Ollama).
      </span>
    </div>
    <div class="card mb10">
      <h4 class="title">Project Info</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Version" label-align="left">
          <el-tag>1.0.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Runtime" label-align="left">
          <el-tag>Python / FastAPI</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Database" label-align="left">
          <el-tag>MongoDB (motor async)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="LLM Inference" label-align="left">
          <el-tag>Ollama (self-hosted)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Port" label-align="left">
          <el-tag>10086</el-tag>
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

<script setup lang="ts" name="aboutYiAi">
const techStack = ["Python 3", "FastAPI", "Motor (async MongoDB)", "Ollama", "uvicorn", "pydantic", "oss2"];
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
