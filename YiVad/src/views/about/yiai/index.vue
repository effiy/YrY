<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiAi is a FastAPI-based backend server that powers the Yi family. It provides AI chat services (Ollama with SSE
        streaming), file management with dual-write persistence (disk + MongoDB), WeCom bot messaging, RSS feed aggregation, a
        generic module-execution engine, a state-store for arbitrary key-value records, a RAG (retrieval-augmented generation)
        layer over the YiKnowledge markdown tree (llama_index + hybrid retrieval + inline citations), and a knowledge-base
        scanner/watcher that mirrors the markdown tree into MongoDB metadata. It runs on uvicorn (ASGI), uses MongoDB via Motor
        for async data access, and integrates with external storage (OSS) and self-hosted LLM inference (Ollama). Optional
        JWT + bcrypt auth via X-Token header.
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
        Domain-driven modular architecture: <strong>routes/ → services/ → domain/ → data/</strong>. Each domain sub-package (ai,
        files, rss, wework, execution) owns its logic and exposes a clean public API via <code>__init__.py</code>. MongoDB access
        via Motor (async) with repository-pattern CRUD helpers. All endpoints return a unified response envelope with typed error
        codes (<code>src/shared/error_codes.py</code>). Cross-cutting concerns (config, response, logging, utils) live in
        <code>src/shared/</code>.
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
      <h4 class="title">Module Boundaries</h4>
      <span class="text">
        Every caller outside a domain package depends only on that package's public API surface (the
        <code>__init__.py</code> re-exports). Internal files (e.g. <code>domain/files/local.py</code>,
        <code>domain/files/storage.py</code>) are not imported directly. Routes never call <code>data/</code> directly — they
        go through <code>services/</code>.
      </span>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="m in moduleBoundaries" :key="m.module" :label="m.module" label-align="left">
          <span class="term-desc">{{ m.publicApi }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Data Flow</h4>
      <span class="text">
        Cross-project calls use the <strong>RPC envelope</strong>:
        <code>{ module_name, method_name, parameters }</code> POSTed to <code>/</code>. YiAi resolves the module + method
        dynamically and returns <code>{ code, message, data }</code>.
      </span>
      <pre class="code-block">{{ dataFlowRpc }}</pre>
      <span class="text">
        Chat uses SSE streaming — <code>services.ai.chat_service.chat</code> returns
        <code>text/event-stream</code> with incremental <code>data:</code> frames.
      </span>
      <pre class="code-block">{{ dataFlowChat }}</pre>
    </div>

    <div class="card mb10">
      <h4 class="title">Recent Changes</h4>
      <el-timeline>
        <el-timeline-item v-for="c in recentChanges" :key="c.date" :timestamp="c.date" placement="top" :hollow="c.hollow">
          <h5 class="change-title">{{ c.title }}</h5>
          <p class="change-desc">{{ c.desc }}</p>
        </el-timeline-item>
      </el-timeline>
    </div>

    <div class="card mb10">
      <h4 class="title">Project Info</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Version" label-align="left">
          <el-tag>1.0.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Runtime" label-align="left">
          <el-tag>Python 3.10+ / uvicorn (ASGI)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Database" label-align="left">
          <el-tag>MongoDB (Motor async)</el-tag>
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
          <el-tag>JWT + bcrypt (optional X-Token header)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Retry" label-align="left">
          <el-tag>Tenacity (transient failures)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="SSE Streaming" label-align="left">
          <el-tag>Chat + module execution endpoints</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Config" label-align="left">
          <el-tag>config.yaml + pydantic-settings</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Process Model" label-align="left">
          <el-tag>Single src/ tree, no nested packages</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Route Modules</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="r in routeModules" :key="r.prefix" :label="r.prefix" label-align="left">
          <span class="term-desc">{{ r.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-collapse class="mb10">
      <el-collapse-item title="Production Dependencies" name="prod">
        <el-descriptions :column="3" border>
          <el-descriptions-item v-for="(dep, key) in prodDeps" :key="key" width="400px">
            <template #label>
              <el-link :href="dep.url" target="_blank" type="primary" :underline="false" class="dep-name">{{ key }}</el-link>
            </template>
            <el-tag type="info">{{ dep.version }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
      <el-collapse-item v-if="Object.keys(devDeps).length" title="Development Dependencies" name="dev">
        <el-descriptions :column="3" border>
          <el-descriptions-item v-for="(dep, key) in devDeps" :key="key" width="400px">
            <template #label>
              <el-link :href="dep.url" target="_blank" type="primary" :underline="false" class="dep-name">{{ key }}</el-link>
            </template>
            <el-tag type="info">{{ dep.version }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>

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
        <el-link v-for="tech in techStack" :key="tech.name" :href="tech.url" target="_blank" :underline="false" class="tech-link">
          <el-tag class="tech-tag">{{ tech.name }}</el-tag>
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="aboutYiAi">
interface Dep {
  version: string;
  url: string;
}
type DepMap = Record<string, Dep>;
interface Tech {
  name: string;
  url: string;
}

const prodDeps: DepMap = {
  fastapi: { version: ">=0.140.0", url: "https://fastapi.tiangolo.com/" },
  uvicorn: { version: ">=0.51.0", url: "https://www.uvicorn.org/" },
  pydantic: { version: ">=2.13.4", url: "https://docs.pydantic.dev/" },
  "pydantic-settings": { version: ">=2.14.2", url: "https://docs.pydantic.dev/latest/usage/pydantic_settings/" },
  motor: { version: ">=3.7.1", url: "https://motor.readthedocs.io/" },
  pymongo: { version: ">=4.17.0", url: "https://pymongo.readthedocs.io/" },
  "python-dotenv": { version: ">=1.2.2", url: "https://github.com/theskumar/python-dotenv" },
  ollama: { version: ">=0.6.2", url: "https://github.com/ollama/ollama-python" },
  aiohttp: { version: ">=3.14.3", url: "https://docs.aiohttp.org/" },
  feedparser: { version: ">=6.0.12", url: "https://feedparser.readthedocs.io/" },
  apscheduler: { version: ">=3.11.3", url: "https://apscheduler.readthedocs.io/" },
  "qwen-vl-utils": { version: ">=0.0.14", url: "https://github.com/QwenLM/Qwen-VL-utils" },
  transformers: { version: ">=5.14.1", url: "https://huggingface.co/docs/transformers" },
  PyYAML: { version: ">=6.0.3", url: "https://pyyaml.org/" },
  oss2: { version: ">=2.19.1", url: "https://www.alibabacloud.com/help/oss/developer-reference/python-1" },
  "python-multipart": { version: ">=0.0.32", url: "https://github.com/Kludex/python-multipart" },
  aiofiles: { version: ">=25.1.0", url: "https://github.com/Tinche/aiofiles" },
  tenacity: { version: ">=9.1.4", url: "https://tenacity.readthedocs.io/" },
  typer: { version: ">=0.27.0", url: "https://typer.tiangolo.com/" },
  rich: { version: ">=15.0.0", url: "https://rich.readthedocs.io/" },
  mcp: { version: ">=1.28.1", url: "https://modelcontextprotocol.io/" },
  bcrypt: { version: ">=5.0.0", url: "https://github.com/pyca/bcrypt" },
  PyJWT: { version: ">=2.13.0", url: "https://pyjwt.readthedocs.io/" }
};

const devDeps: DepMap = {};

const features = [
  "Ollama-powered LLM chat with SSE streaming and image processing",
  "File management with dual-write persistence (disk + MongoDB)",
  "WeCom (WeCom Work) bot messaging via webhook",
  "RSS feed aggregation with APScheduler-based scheduling",
  "Generic module-execution engine (GET/POST + SSE streaming)",
  "State-store for arbitrary key-value records with type/tag filtering",
  "RAG (llama_index) — hybrid retrieval (vector + BM25), optional rerank, inline [Source N] citations",
  "Knowledge-base scanner + watcher (markdown tree → MongoDB metadata mirror)",
  "MCP (Model Context Protocol) server integration",
  "Unified API response envelope with typed error codes",
  "Config-driven architecture via config.yaml + pydantic-settings",
  "Observer runtime monitoring (throttle, sampler, sandbox, reentrancy guard)",
  "JWT + bcrypt auth (optional X-Token header verification)",
  "Tenacity-backed retry for transient failures (network, MongoDB, Ollama)"
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
  { name: "YiPet", description: "Chrome MV3 extension — interactive browser companion (calls YiAi endpoints)" },
  { name: "YiVad", description: "Vue 3 admin dashboard (visualises and manages YiAi data and services)" }
];

const routeModules = [
  { prefix: "/files", desc: "File CRUD + multipart upload + /read-file, /write-file, /delete-file, /rename-file, /upload-image-to-oss" },
  { prefix: "/exec", desc: "Generic module/method execution (sync + SSE streaming)" },
  { prefix: "/wework", desc: "WeCom webhook message send endpoint" },
  { prefix: "/maintenance", desc: "Image and session cleanup endpoints" },
  { prefix: "/state", desc: "State record CRUD with type/tag filtering and time-range retrieval" },
  { prefix: "/knowledge", desc: "Knowledge-base scan / read / write / metadata CRUD (markdown tree mirror)" },
  { prefix: "/rag", desc: "RAG query + RAG chat (SSE) + per-file RAG query/chat; scope filters by file_path substring" },
  { prefix: "/health", desc: "Observer runtime health check (throttle, sampler, sandbox, reentrancy)" }
];

const techStack: Tech[] = [
  { name: "Python 3", url: "https://www.python.org/" },
  { name: "FastAPI", url: "https://fastapi.tiangolo.com/" },
  { name: "Motor (async MongoDB)", url: "https://motor.readthedocs.io/" },
  { name: "Ollama", url: "https://ollama.com/" },
  { name: "uvicorn", url: "https://www.uvicorn.org/" },
  { name: "pydantic", url: "https://docs.pydantic.dev/" },
  { name: "pydantic-settings", url: "https://docs.pydantic.dev/latest/usage/pydantic_settings/" },
  { name: "APScheduler", url: "https://apscheduler.readthedocs.io/" },
  { name: "feedparser", url: "https://feedparser.readthedocs.io/" },
  { name: "aiohttp", url: "https://docs.aiohttp.org/" },
  { name: "oss2 (Alibaba OSS)", url: "https://www.alibabacloud.com/help/oss/developer-reference/python-1" },
  { name: "bcrypt", url: "https://github.com/pyca/bcrypt" },
  { name: "PyJWT", url: "https://pyjwt.readthedocs.io/" },
  { name: "PyYAML", url: "https://pyyaml.org/" },
  { name: "MCP", url: "https://modelcontextprotocol.io/" },
  { name: "tenacity", url: "https://tenacity.readthedocs.io/" },
  { name: "typer", url: "https://typer.tiangolo.com/" },
  { name: "rich", url: "https://rich.readthedocs.io/" }
];

const moduleBoundaries = [
  { module: "domain/ai/", publicApi: "chat.py — Ollama chat + image processing" },
  { module: "domain/auth/", publicApi: "JWT + bcrypt helpers" },
  { module: "domain/execution/", publicApi: "executor.py — dynamic module/method invocation" },
  { module: "domain/files/", publicApi: "__init__.py re-exports read_file, write_file, delete_file, rename_file, delete_folder, rename_folder, upload_image. Internal: local.py, storage.py, paths.py" },
  { module: "domain/knowledge/", publicApi: "scanner.py (markdown tree walk + frontmatter parse), watcher.py (apscheduler poll), writer.py (markdown write-back)" },
  { module: "domain/rag/", publicApi: "engine.py (rag_query, rag_chat_stream, rag_file_query, rag_file_chat_stream), indexer.py (get_kb_index, build_file_index), settings.py, paths.py" },
  { module: "domain/rss/", publicApi: "feed.py, scheduler.py — RSS fetcher + APScheduler" },
  { module: "domain/state/", publicApi: "state-record CRUD helpers" },
  { module: "domain/wework/", publicApi: "__init__.py re-exports send_message. Internal: client.py" },
  { module: "services/knowledge/", publicApi: "knowledge_service.py — scan / read / write / metadata CRUD" },
  { module: "services/rag/", publicApi: "rag_service.py — wraps domain/rag/engine.py for routes" },
  { module: "services/database/", publicApi: "data_service.py (query_documents, create/update/delete_document), session_service.py, mongo_store.py" },
  { module: "data/", publicApi: "database.py MongoDB singleton (find_one, find_many, insert_one, insert_many, update_one, delete_one), repository.py (query_documents, get_document_detail, CRUD)" }
];

const dataFlowRpc = `YiPet / YiVad
  │  fetch POST /  body: {module_name, method_name, parameters}
  ▼
FastAPI root handler — resolves module → Python module, method → callable
  ▼
services.<domain>.<service>.<method>(**parameters)
  │  (if data_service.query_documents)
  │    pops filter, merges into query_params
  │    pops pageNum/pageSize/limit/page/fields/exclude/orderBy
  │    _build_filter(query_params) → Mongo filter dict
  │    collection.find(filter_dict, projection).sort().skip().limit()
  ▼
MongoDB (Motor async) → { list, total, pageNum, pageSize, totalPages }`;

const dataFlowChat = `client fetch POST /  body: {services.ai.chat_service.chat, stream:true}
  ▼
chat_service.chat() → StreamingResponse(text/event-stream)
  yields: data: {"data": {"message": "..."}}\\n\\n
  ends:   data: {"done": true}\\n\\n
  ▼
Ollama (http://localhost:11434/api/chat)`;

const recentChanges = [
  {
    date: "2026-07-31",
    title: "RAG + Knowledge modules added",
    desc: "New domain/rag/ + services/rag/ built on llama_index: hybrid retrieval (vector + BM25), optional LLMRerank, inline [Source N] citation numbering, scope filtering by file_path. New domain/knowledge/ + services/knowledge/ scans the YiKnowledge markdown tree (apscheduler watcher — macOS FSEvents is broken). New routes /knowledge and /rag.",
    hollow: false
  },
  {
    date: "2026-07-28",
    title: "Missing MongoDB wrappers added",
    desc: "data/database.py: added find_many and delete_one wrapper methods. They were called by domain/files/storage.py but never defined — delete_oss_file, delete_file_tags, get_all_tags would raise AttributeError.",
    hollow: false
  },
  {
    date: "2026-07-28",
    title: "_handle_range_or_list_filter 2-string-list fix",
    desc: "data/repository.py: a 2-element list of strings (e.g. tags=[\"work\",\"personal\"]) no longer silently drops the filter. Now falls through to $in semantics.",
    hollow: false
  },
  {
    date: "2026-07",
    title: "Cross-project protocol hygiene",
    desc: "Documented the filter (not query) contract for query_documents and the target_file (not path) contract for /read-file and /write-file. Both have been past bug sources.",
    hollow: true
  }
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
      padding: 1px 5px;
      font-size: 13px;
      background: var(--el-fill-color-light);
      border-radius: 3px;
    }
  }
}
.feature-item {
  margin-bottom: 8px;
}
.feature-text {
  font-size: 14px;
  line-height: 22px;
  color: var(--el-text-color-regular);
  &::before {
    margin-right: 6px;
    font-weight: bold;
    color: var(--el-color-primary);
    content: "•";
  }
}
.arch-diagram {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 12px;
  margin-top: 15px;
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
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
.related-name {
  min-width: 50px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
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
.tech-link {
  height: auto;
  line-height: 1;
}
.dep-name {
  font-size: 14px;
  font-weight: 500;
}
.code-block {
  padding: 12px;
  margin: 10px 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  color: var(--el-text-color-regular);
  word-break: break-word;
  white-space: pre-wrap;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
.change-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.change-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
.term-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
</style>
