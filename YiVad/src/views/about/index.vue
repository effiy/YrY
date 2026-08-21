<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        The Yi family is a trio of companion projects: <strong>YiVad</strong> (Vue 3 admin dashboard),
        <strong>YiAi</strong> (FastAPI AI backend), and <strong>YiPet</strong> (Chrome MV3 extension). Together they form an
        end-to-end AI-powered toolkit — YiPet captures user intent in the browser, YiAi provides LLM services and data
        persistence, and YiVad visualises and manages the system. Use the sub-pages below for project-specific details.
      </span>
    </div>

    <div class="card mb10">
      <h4 class="title">Architecture</h4>
      <span class="text">
        All three projects communicate over a unified <strong>RPC envelope</strong>:
        <code>{ "module_name": "services.&lt;domain&gt;.&lt;service&gt;", "method_name": "&lt;method&gt;", "parameters": {...} }</code>.
        YiPet and YiVad both POST this envelope to YiAi's root endpoint; YiAi resolves the module + method dynamically and
        returns the unified response <code>{ "code": 0, "message": "ok", "data": &lt;any&gt; }</code>.
      </span>
      <div ref="archRef">
        <pre class="mermaid">
graph TB
    YiPet[YiPet<br/>Chrome MV3 Extension] -->|RPC Envelope| YiAi[YiAi<br/>FastAPI :10086]
    YiVad[YiVad<br/>Vue 3 Admin SPA] -->|RPC Envelope| YiAi
    YiAi -->|Motor async| MongoDB[(MongoDB)]
    YiAi -->|Ollama API| Ollama[Ollama LLM]
    YiAi -->|apscheduler| KB[(YiKnowledge<br/>Markdown KB)]
    KB -->|llama_index RAG| YiAi
        </pre>
      </div>
      <div class="arch-legend">
        <span><el-tag type="warning" size="small">YiPet</el-tag> captures in-browser intent — popup + chat + pet companion.</span>
        <span><el-tag type="success" size="small">YiAi</el-tag> hosts LLM chat (Ollama + SSE), RAG over YiKnowledge (llama_index + hybrid retrieval), file dual-write, RSS, WeCom, and a generic execution engine.</span>
        <span><el-tag type="primary" size="small">YiVad</el-tag> visualises sessions, FAQs, file trees, knowledge, bugs, and AI chat for admin users.</span>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">Data Flow</h4>
      <div ref="dataFlowRef">
        <pre class="mermaid">
sequenceDiagram
    participant YiPet as YiPet (Chrome MV3)
    participant YiVad as YiVad (Vue 3 Admin)
    participant YiAi as YiAi (FastAPI :10086)
    participant DB as MongoDB
    participant Ollama as Ollama LLM
    participant KB as YiKnowledge

    YiPet-&gt;&gt;YiAi: POST / RPC Envelope
    YiVad-&gt;&gt;YiAi: POST / RPC Envelope
    YiAi-&gt;&gt;DB: Motor async (query/insert/update/delete)
    YiAi-&gt;&gt;Ollama: Chat + Image processing
    YiAi-&gt;&gt;KB: Knowledge watcher (apscheduler poll)
    KB--&gt;&gt;YiAi: RAG retrieval (llama_index)
    YiAi--&gt;&gt;YiPet: SSE streaming / JSON response
    YiAi--&gt;&gt;YiVad: SSE streaming / JSON response
        </pre>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">API Design</h4>
      <span class="text">
        All three projects communicate over a unified <strong>RPC envelope</strong> protocol. YiPet and YiVad both POST
        to YiAi's root endpoint; YiAi resolves the module + method dynamically and returns a typed response envelope.
      </span>
      <el-descriptions :column="2" border style="margin-top: 12px;">
        <el-descriptions-item v-for="a in apiDesign" :key="a.label" :label="a.label" label-align="left">
          <span class="term-desc">{{ a.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <div ref="apiRef">
        <pre class="mermaid" style="margin-top: 12px;">
sequenceDiagram
    participant Client as YiPet / YiVad
    participant Envelope as RPC Envelope
    participant YiAi as YiAi (FastAPI :10086)

    Client-&gt;&gt;Envelope: {module_name, method_name, parameters}
    Envelope-&gt;&gt;YiAi: POST /
    YiAi-&gt;&gt;YiAi: resolve module → import<br/>resolve method → callable
    YiAi--&gt;&gt;Client: {code: 0, message: "ok", data: &lt;any&gt;}
    Note over Client,YiAi: Error: {code: &gt;0, message: &lt;error&gt;, data: null}
        </pre>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">Cross-Project Contracts</h4>
      <span class="text">
        These parameter name mismatches have caused real bugs — the backend silently ignores the wrong key or returns 422.
      </span>
      <el-descriptions :column="2" border style="margin-top: 12px;">
        <el-descriptions-item v-for="c in contracts" :key="c.label" :label="c.label" label-align="left">
          <span class="term-desc">{{ c.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Development Setup</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="s in setupSteps" :key="s.label" :label="s.label" label-align="left">
          <span class="term-desc">{{ s.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Family Members</h4>
      <el-row :gutter="12">
        <el-col :span="8" v-for="m in members" :key="m.name">
          <div class="member-card">
            <div class="member-header">
              <el-tag :type="m.tagType" size="large" effect="dark">{{ m.name }}</el-tag>
              <span class="member-sub">{{ m.subtitle }}</span>
            </div>
            <p class="member-desc">{{ m.description }}</p>
            <div class="member-actions">
              <router-link v-if="m.route" :to="m.route" class="member-link">View details →</router-link>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="about">
import { ref } from "vue";
import { useMermaid } from "@/hooks/useMermaid";

const archRef = ref<HTMLElement | null>(null);
const dataFlowRef = ref<HTMLElement | null>(null);
const apiRef = ref<HTMLElement | null>(null);

useMermaid(archRef, dataFlowRef, apiRef);

const apiDesign = [
  { label: "Protocol", desc: "Universal RPC: POST / { module_name, method_name, parameters } → YiAi resolves dynamically" },
  { label: "Response Envelope", desc: "{ code: int, message: str, data: any } — code=0 success, code>0 typed error" },
  { label: "YiVad HTTP Layer", desc: "RequestHttp (Axios wrapper) → api/modules/*.ts → http.post() — stores never import axios directly" },
  { label: "YiPet API Layer", desc: "Four-tier: client → endpoints → types → services — ApiClient wraps fetch with retry + SSE" },
  { label: "SSE Streaming", desc: "Chat uses text/event-stream with AbortController — shared pattern across YiVad and YiPet" },
  { label: "Data CRUD", desc: "data_service.query_documents — filter param (not query), cname for collection, pageNum/pageSize pagination" },
  { label: "File I/O", desc: "POST /read-file, /write-file — target_file param (not path), optional is_base64 flag" },
  { label: "Auth", desc: "Optional X-Token header (JWT + bcrypt). YiVad interceptor auto-attaches Bearer token; 401 redirects to login" }
];

const contracts = [
  { label: "filter (not query)", desc: "data_service.query_documents parameter. The backend silently ignores query — every call with query returns unfiltered results" },
  { label: "target_file (not path)", desc: "/read-file and /write-file endpoints. Pydantic validates against target_file; path causes 422 UNPROCESSABLE" },
  { label: "cname (not collection_name)", desc: "data_service collection parameter. Short form required by the RPC resolver" },
  { label: "RPC Envelope", desc: "Every call uses POST / with {module_name, method_name, parameters}. No REST-style endpoints for data operations" }
];

const setupSteps = [
  { label: "1. Start YiAi", desc: "cd YiAi && python main.py — starts FastAPI on port 10086" },
  { label: "2. Start YiVad", desc: "cd YiVad && pnpm dev — starts Rsbuild dev server on port 8848" },
  { label: "3. Build YiPet", desc: "cd YiPet && npm run build — load dist/ as unpacked Chrome extension" },
  { label: "4. Verify", desc: "Open http://localhost:8848 — YiVad dashboard. YiAi must be running for any data" }
];

const members = [
  {
    name: "YiVad",
    subtitle: "Admin Dashboard",
    description:
      "Vue 3.5 + TypeScript + Rsbuild + Pinia + Element Plus admin framework with ProTable, dynamic routing, and button-level permissions.",
    tagType: "primary" as const,
    route: "/about/yivad"
  },
  {
    name: "YiAi",
    subtitle: "AI Backend",
    description:
      "FastAPI + Motor (MongoDB) + Ollama + llama_index backend providing AI chat, RAG over YiKnowledge, file management, RSS aggregation, knowledge-base watcher, and a generic execution engine.",
    tagType: "success" as const,
    route: "/about/yiai"
  },
  {
    name: "YiPet",
    subtitle: "Browser Companion",
    description:
      "Chrome MV3 extension with an interactive pet companion, multi-role AI chat, dual-world content script, and 80+ CDN libraries.",
    tagType: "warning" as const,
    route: "/about/yipet"
  }
];
</script>

<style lang="scss" scoped>
@use "./common.scss";

.member-card {
  height: 100%;
  padding: 16px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: var(--el-box-shadow-light);
  }
}

.member-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.member-sub {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.member-desc {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 20px;
  color: var(--el-text-color-regular);
}

.member-actions {
  text-align: right;
}

.member-link {
  font-size: 13px;
  color: var(--el-color-primary);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

.arch-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  span {
    font-size: 13px;
    line-height: 20px;
    color: var(--el-text-color-regular);
  }
}
</style>