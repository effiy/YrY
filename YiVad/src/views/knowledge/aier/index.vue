<template>
  <RoleKnowledgePage
    title="AI Engineer"
    domains-word="knowledge areas"
    description="AI foundations, methodology, platform, data, and ML ops for building effective AI systems."
    category="aier"
    :subdirs="subdirs"
    :structural-tags="['prompts']"
  >
    <template #title>
      <RoleNav active="aier" />
    </template>
    <template #header>
      <div class="role-page__quick-nav">
        <div class="role-page__quick-nav-card" @click="$router.push('/knowledge/skills')">
          <span class="role-page__quick-nav-icon">🪄</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Skills</span>
            <span class="role-page__quick-nav-desc">Claude Code skills — frontend, backend, platform, AI & business capabilities</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/okr/aier')">
          <span class="role-page__quick-nav-icon">🎯</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">AI Engineer OKR</span>
            <span class="role-page__quick-nav-desc">Goals & metrics — skill/agent/mcp orchestration and agent reliability</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/knowledge/pipeline')">
          <span class="role-page__quick-nav-icon">🔄</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Pipeline</span>
            <span class="role-page__quick-nav-desc">Software delivery pipeline — requirements → build → test → launch across roles</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/knowledge/metrics')">
          <span class="role-page__quick-nav-icon">📊</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Metrics & KPIs</span>
            <span class="role-page__quick-nav-desc">Role metrics — orchestration coverage, agent completion & confirmation-gate effectiveness</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
      </div>
    </template>
  </RoleKnowledgePage>
</template>

<script setup lang="ts" name="aierHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const subdirs = [
  { id: "foundations", icon: "🧠", label: "Foundations", color: "#1677ff", desc: "Core architectural primitives of modern LLMs: self-attention mechanisms, KV-cache optimization, MoE routing, long-context scaling, quantization, alignment, and multimodal fusion — the theoretical foundation every AI engineer must master." },
  { id: "methodology", icon: "📐", label: "Methodology", color: "#10b981", desc: "Engineering playbooks for building reliable AI systems: prompt engineering with defense-in-depth, RAG architecture patterns, agent orchestration, LLM evaluation frameworks, red-teaming, hallucination mitigation, and model fine-tuning decision logic." },
  { id: "platform", icon: "🖥️", label: "Platform", color: "#7c3aed", desc: "Infrastructure decisions that determine cost, latency, and reliability: LLM provider selection, inference engine benchmarking, vector database trade-offs, AI gateway architecture, embedding model evaluation, and observability platform comparison." },
  { id: "data", icon: "📊", label: "Data", color: "#f59e0b", desc: "Data engineering for AI workloads: schema design for hybrid (vector + structured) queries, ETL/ELT pipeline patterns, lakehouse architecture for feature engineering, MongoDB indexing for RAG, and Redis caching to reduce LLM inference cost." },
  { id: "ml", icon: "⚙️", label: "ML Ops", color: "#ef4444", desc: "Production ML operations: model serving with vLLM/Ollama, vector index construction, evaluation-driven development, content moderation guardrails, inline-citation RAG, and Chrome-extension AI safety boundaries." }
];
</script>

<style scoped lang="scss">
.role-page__quick-nav { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
.role-page__quick-nav-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--el-bg-color); border-radius: 10px; border: 1px solid var(--el-border-color-lighter); cursor: pointer; transition: box-shadow .2s, border-color .2s, transform .2s; &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.08); transform: translateY(-1px); } }
.role-page__quick-nav-icon { font-size: 28px; flex-shrink: 0; }
.role-page__quick-nav-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.role-page__quick-nav-title { font-size: 14px; font-weight: 700; color: var(--el-text-color-primary); }
.role-page__quick-nav-desc { font-size: 11px; color: var(--el-text-color-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.role-page__quick-nav-arrow { font-size: 18px; color: var(--el-text-color-placeholder); flex-shrink: 0; transition: color .2s, transform .2s; .role-page__quick-nav-card:hover & { color: var(--el-color-primary); transform: translateX(3px); } }
</style>
