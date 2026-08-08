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
      <h4 class="title">Family Architecture</h4>
      <span class="text">
        All three projects communicate over a unified <strong>RPC envelope</strong>:
        <code>{ "module_name": "services.&lt;domain&gt;.&lt;service&gt;", "method_name": "&lt;method&gt;", "parameters": {...} }</code>.
        YiPet and YiVad both POST this envelope to YiAi's root endpoint; YiAi resolves the module + method dynamically and
        returns the unified response <code>{ "code": 0, "message": "ok", "data": &lt;any&gt; }</code>.
      </span>
      <div class="arch-diagram">
        <el-tag type="warning" size="large">YiPet (MV3)</el-tag>
        <span class="arch-arrow">→</span>
        <el-tag type="success" size="large">YiAi (FastAPI :10086)</el-tag>
        <span class="arch-arrow">←</span>
        <el-tag type="primary" size="large">YiVad (Vue 3 Admin)</el-tag>
      </div>
      <div class="arch-legend">
        <span><el-tag type="warning" size="small">YiPet</el-tag> captures in-browser intent — popup + chat + pet companion.</span>
        <span><el-tag type="success" size="small">YiAi</el-tag> hosts LLM chat (Ollama + SSE), RAG over YiKnowledge (llama_index + hybrid retrieval), file dual-write, RSS, WeCom, and a generic execution engine.</span>
        <span><el-tag type="primary" size="small">YiVad</el-tag> visualises sessions, FAQs, file trees, knowledge, bugs, and AI chat for admin users.</span>
      </div>
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
