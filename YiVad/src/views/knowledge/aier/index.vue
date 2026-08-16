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
