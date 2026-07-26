<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiAi is a FastAPI-based backend server that provides AI-powered services (Ollama chat), file management with dual-write
        persistence, WeCom bot messaging, RSS feed aggregation, a generic module-execution engine, and a state-store for arbitrary
        key-value records. It runs on uvicorn, uses MongoDB via motor for async data access, and integrates with external storage
        (OSS) and self-hosted LLM inference (Ollama).
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
        Domain-driven modular architecture: routes/ → services/ → domain/. Each domain sub-package (ai, files, rss, wework,
        execution) owns its logic and exposes a clean public API via __init__.py. MongoDB access via Motor (async) with
        repository-pattern CRUD helpers. All endpoints return a unified response envelope with error codes.
      </span>
      <div class="arch-diagram">
        <el-tag type="primary" size="large">Routes (APIRouter)</el-tag>
        <span class="arch-arrow">→</span>
        <el-tag type="success" size="large">Services (Adapt)</el-tag>
        <span class="arch-arrow">→</span>
        <el-tag type="warning" size="large">Domain (Logic)</el-tag>
        <span class="arch-arrow">→</span>
        <el-tag type="danger" size="large">Data (MongoDB)</el-tag>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">Project Info</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Version" label-align="left">
          <el-tag>1.0.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Runtime" label-align="left">
          <el-tag>Python 3 / uvicorn (ASGI)</el-tag>
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
        <el-descriptions-item label="API Format" label-align="left">
          <el-tag>Unified envelope (code + message + data)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="File Persistence" label-align="left">
          <el-tag>Dual-write (disk + MongoDB)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Auth" label-align="left">
          <el-tag>X-Token header (optional)</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Production Dependencies</h4>
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="(value, key) in prodDeps" :key="key" width="400px" :label="key">
          <el-tag type="info">{{ value }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Development Dependencies</h4>
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="(value, key) in devDeps" :key="key" width="400px" :label="key">
          <el-tag type="info">{{ value }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Domain Language</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="t in domainTerms" :key="t.name" :label="t.name">
          <span class="term-desc">{{ t.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">API Design</h4>
      <span class="text">
        All endpoints return a unified envelope: <code>{ "code": int, "message": str, "data": any }</code>. Success uses
        <code>ErrorCode.OK.business</code> (0); failures map to typed error codes defined in
        <code>src/shared/error_codes.py</code>. Paginated responses include an optional <code>pagination</code> key. Routes are
        organised as <code>APIRouter</code> modules under <code>src/server/routes/</code>, assembled in <code>src/app.py</code>'s
        <code>create_app()</code> factory. The auth middleware (<code>X-Token</code> header verification) is optional and disabled
        by default.
      </span>
    </div>

    <div class="card mb10">
      <h4 class="title">Related Projects</h4>
      <div class="related-list">
        <div v-for="p in relatedProjects" :key="p.name" class="related-item">
          <span class="related-name">{{ p.name }}</span>
          <span class="related-desc">{{ p.description }}</span>
        </div>
      </div>
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
const prodDeps: Record<string, string> = {
  fastapi: ">=0.104.0",
  uvicorn: ">=0.24.0",
  pydantic: ">=2.0.0",
  "pydantic-settings": ">=2.0.0",
  motor: ">=3.3.0",
  pymongo: ">=4.6.0",
  "python-dotenv": ">=1.0.0",
  ollama: ">=0.1.0",
  aiohttp: ">=3.9.0",
  feedparser: ">=6.0.10",
  apscheduler: ">=3.10.0",
  pyyaml: ">=6.0",
  oss2: ">=2.18.0",
  "python-multipart": ">=0.0.9",
  aiofiles: ">=23.2.1",
  tenacity: ">=8.2.3",
  mcp: ">=1.28.0",
  bcrypt: ">=4.0.0",
  pyjwt: ">=2.8.0"
};

const devDeps: Record<string, string> = {
  typer: ">=0.9.0",
  rich: ">=13.0.0",
  "qwen-vl-utils": ">=0.0.14",
  transformers: ">=4.37.0"
};

const features = [
  "Ollama-powered LLM chat with SSE streaming and image processing",
  "File management with dual-write persistence (disk + MongoDB)",
  "WeCom (企业微信) bot messaging via webhook",
  "RSS feed aggregation with APScheduler-based scheduling",
  "Generic module-execution engine (GET/POST + SSE streaming)",
  "State-store for arbitrary key-value records with type/tag filtering",
  "MCP (Model Context Protocol) server integration",
  "Unified API response envelope with typed error codes",
  "Config-driven architecture via config.yaml + pydantic-settings",
  "Observer runtime monitoring (throttle, sampler, sandbox, reentrancy guard)"
];

const domainTerms = [
  {
    name: "State Record",
    desc: "A persistent key-value record with a unique key, supporting type/tag categorization and time-range retrieval via the state-store API"
  },
  {
    name: "Module Execution",
    desc: "A generic execution mechanism that dynamically invokes any module method in services/ or domain/ via HTTP GET/POST or SSE streaming"
  },
  {
    name: "Dual Write",
    desc: "A persistence strategy that writes files simultaneously to local disk (primary) and MongoDB (backup), prioritizing disk success with best-effort MongoDB upsert"
  },
  {
    name: "Seed",
    desc: "Initialization data/config stored in the MongoDB seeds collection, used for data population during system startup"
  },
  {
    name: "Observer",
    desc: "In-process runtime monitoring components: Throttle (rate limiting), Sampler (slow-request sampling), Sandbox (execution isolation), ReentrancyGuard (re-entry protection)"
  }
];

const relatedProjects = [
  { name: "YiPet", description: "Chrome MV3 extension — interactive browser companion" },
  { name: "YiVad", description: "Vue 3 admin dashboard with Element Plus" }
];

const techStack = [
  "Python 3",
  "FastAPI",
  "Motor (async MongoDB)",
  "Ollama",
  "uvicorn",
  "pydantic",
  "pydantic-settings",
  "APScheduler",
  "feedparser",
  "aiohttp",
  "oss2 (Alibaba OSS)",
  "bcrypt",
  "PyJWT",
  "PyYAML",
  "MCP",
  "tenacity",
  "typer",
  "rich"
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
    code {
      font-size: 13px;
      background: var(--el-fill-color-light);
      padding: 1px 5px;
      border-radius: 3px;
    }
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

.related-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.related-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
  min-width: 50px;
}

.related-desc {
  font-size: 13px;
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

.term-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
</style>
