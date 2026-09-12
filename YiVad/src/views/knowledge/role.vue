<template>
  <RoleKnowledgePage
    :title="role.title"
    :domains-word="role.domainsWord"
    :description="role.description"
    :category="role.category"
    :subdirs="role.subdirs"
    :structural-tags="role.structuralTags"
  >
    <template #title>
      <RoleNav :active="role.category" show-quick-nav :quick-role="role.category" sticky />
    </template>
  </RoleKnowledgePage>
</template>

<script setup lang="ts" name="RolePage">
import RoleKnowledgePage from "./components/RoleKnowledgePage.vue";
import RoleNav from "./components/RoleNav.vue";

interface Subdir {
  id: string; icon: string; label: string; color: string; desc: string;
}

interface RoleConfig {
  title: string;
  domainsWord: string;
  description: string;
  category: string;
  structuralTags: string[];
  subdirs: Subdir[];
}

const ROLE_CONFIG: Record<string, RoleConfig> = {
  executiver: {
    title: "Executive",
    domainsWord: "domains",
    description: "strategy, industry analysis, roadmap planning, and reading list for executive decision-making.",
    category: "executiver",
    structuralTags: ["resources", "product", "product-management", "product-strategy"],
    subdirs: [
      { id: "strategy", icon: "🎯", label: "Strategy", color: "#ef4444", desc: "Executive strategy frameworks — Porter's Five Forces, Blue Ocean, SWOT, VRIO, product strategy, business model canvas, and value proposition design for competitive advantage." },
      { id: "industry", icon: "🏭", label: "Industry", color: "#1677ff", desc: "Market intelligence and competitive analysis — AI industry reports (Gartner, McKinsey, a16z, CAICT), competitor landscape mapping, and regional market observation." },
      { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#10b981", desc: "Strategic planning cadence — annual planning, quarterly business reviews, OKR tracking, headcount and budget planning, and organizational alignment." },
      { id: "reading-list", icon: "📚", label: "Reading List", color: "#7c3aed", desc: "Executive development reading — curated books, articles, and reading notes on management, leadership, and industry trends for continuous learning." }
    ]
  },
  engineer: {
    title: "Engineer",
    domainsWord: "phases",
    description: "Build, Ship, Run, Learn — covering the full design → deploy → operate → learn lifecycle for engineering teams.",
    category: "engineer",
    structuralTags: ["yivad", "yiai", "yipet"],
    subdirs: [
      { id: "build", icon: "🏗️", label: "Build", color: "#1677ff", desc: "Architecture & Development — system design, API and RPC contracts, dev tools, DX, dependency management, vendor evaluation, and project bootstrapping." },
      { id: "ship", icon: "🚀", label: "Ship", color: "#10b981", desc: "Quality, Security, Data & Reliability — supply chain hardening, secrets management, database migration, resilience patterns, observability, and traffic management." },
      { id: "run", icon: "🏃", label: "Run", color: "#8b5cf6", desc: "Process & Onboarding — scenario-based journeys, cross-cutting guides, team workflows, onboarding paths, and forward-deployed engineer operations." },
      { id: "learn", icon: "📖", label: "Learn", color: "#ec4899", desc: "Lessons & Projects — wins, failures, gotchas from real projects, plus YiAi, YiVad, and YiPet project-specific documentation." }
    ]
  },
  curator: {
    title: "Curator",
    domainsWord: "domains",
    description: "governance, templates, diagrams, and archive for the knowledge base lifecycle.",
    category: "curator",
    structuralTags: [],
    subdirs: [
      { id: "governance", icon: "⚖️", label: "Governance", color: "#1677ff", desc: "Knowledge base lifecycle management — review cycles, quality gates, triage protocols, tacit knowledge capture, readiness checklists, and knowledge evolution strategy." },
      { id: "templates", icon: "📝", label: "Templates", color: "#10b981", desc: "Standardized document templates for consistent knowledge creation — ADR, PRD, tech design, retrospectives, usability tests, and knowledge leaf specifications." },
      { id: "diagrams", icon: "📊", label: "Diagrams", color: "#7c3aed", desc: "Visual knowledge architecture — directory blueprints, knowledge maps, and user journey diagrams that reveal cross-department flow and knowledge bottlenecks." },
      { id: "archive", icon: "🗄️", label: "Archive", color: "#f59e0b", desc: "Deprecated and superseded content — preserved for historical traceability and audit, organized by original category for forensic lookup." }
    ]
  },
  leader: {
    title: "Tech Lead",
    domainsWord: "domains",
    description: "architecture decisions, tech selection, capacity planning, risk management, and roadmap for technical leadership.",
    category: "leader",
    structuralTags: ["yivad", "yiai", "yipet", "adr"],
    subdirs: [
      { id: "architecture", icon: "🏛️", label: "Architecture", color: "#1677ff", desc: "Technical leadership architecture — maturity model assessments, architecture decision records, tech selection evaluations, and system coherence strategies." },
      { id: "decisions", icon: "📝", label: "Decisions (ADRs)", color: "#10b981", desc: "Architecture Decision Records organized by project — YiAi, YiVad, YiPet, FDE — documenting trade-offs, context, and rationale for key technical choices." },
      { id: "risk", icon: "⚠️", label: "Risk", color: "#ef4444", desc: "Risk management for tech leads — risk register, dependency risk assessment, outage communication protocols, and postmortem methodology." },
      { id: "capacity", icon: "📈", label: "Capacity", color: "#f59e0b", desc: "Capacity planning and cost management — FinOps reviews, cost overrun handling, dependency audits, and capacity trend tracking across YiAi, YiVad, YiPet." },
      { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#7c3aed", desc: "Technical roadmap planning — SLO definition, tech debt management, PoC evaluation, service decommissioning, feature deprecation, and quarterly roadmap reviews." }
    ]
  },
  producter: {
    title: "Product Manager",
    domainsWord: "problem domains",
    description: "frameworks, discovery, delivery, strategy, and projects for product management.",
    category: "producter",
    structuralTags: ["product", "product-management", "yivad", "yiai", "yipet"],
    subdirs: [
      { id: "frameworks", icon: "🧩", label: "Frameworks", color: "#1677ff", desc: "Product management frameworks — RICE/ICE prioritization, MoSCoW, JTBD, Kano model, story mapping, OKR design, dual-track agile, and lean startup methodology." },
      { id: "discovery", icon: "🔍", label: "Discovery", color: "#10b981", desc: "User research and product discovery — PRD writing, UX patterns (Nielsen heuristics, accessibility, IA), product metrics (AARRR, NPS, DORA, retention), and AI product analytics." },
      { id: "delivery", icon: "🚀", label: "Delivery", color: "#7c3aed", desc: "Sprint execution and delivery rituals — async meetings, design reviews, retrospectives, sprint planning, quarterly planning, and stakeholder communication cadence." },
      { id: "strategy", icon: "🎯", label: "Strategy", color: "#ef4444", desc: "Product strategy and market positioning — AI after-sales case studies, RAG agent deployment cases, and competitive analysis." },
      { id: "projects", icon: "📦", label: "Projects", color: "#f59e0b", desc: "Per-project product management — YiAi, YiVad, YiPet project coordination, iteration planning, and stakeholder visibility." }
    ]
  },
  srer: {
    title: "SRE",
    domainsWord: "problem domains",
    description: "incident response, observability, and release management for production reliability.",
    category: "srer",
    structuralTags: [],
    subdirs: [
      { id: "incident-response", icon: "🚨", label: "Incident Response", color: "#ef4444", desc: "Production incident management lifecycle — war room protocols, blast radius analysis, rollback drills, oncall handovers, postmortems, and chaos engineering experiments." },
      { id: "observability", icon: "📊", label: "Observability", color: "#1677ff", desc: "Monitoring and observability stack — logs, metrics, traces triad, Docker/K8s monitoring, GPU inference observability, CI/CD pipeline visibility, and SLO tracking dashboards." },
      { id: "release", icon: "🚀", label: "Release", color: "#10b981", desc: "Safe deployment practices — canary releases, hotfix protocols, release freeze management, rollback procedures, and progressive delivery strategies." }
    ]
  },
  aier: {
    title: "AI Engineer",
    domainsWord: "knowledge areas",
    description: "AI foundations, methodology, platform, data, and ML ops for building effective AI systems.",
    category: "aier",
    structuralTags: ["prompts"],
    subdirs: [
      { id: "foundations", icon: "🧠", label: "Foundations", color: "#1677ff", desc: "Core architectural primitives of modern LLMs: self-attention mechanisms, KV-cache optimization, MoE routing, long-context scaling, quantization, alignment, and multimodal fusion — the theoretical foundation every AI engineer must master." },
      { id: "methodology", icon: "📐", label: "Methodology", color: "#10b981", desc: "Engineering playbooks for building reliable AI systems: prompt engineering with defense-in-depth, RAG architecture patterns, agent orchestration, LLM evaluation frameworks, red-teaming, hallucination mitigation, and model fine-tuning decision logic." },
      { id: "platform", icon: "🖥️", label: "Platform", color: "#7c3aed", desc: "Infrastructure decisions that determine cost, latency, and reliability: LLM provider selection, inference engine benchmarking, vector database trade-offs, AI gateway architecture, embedding model evaluation, and observability platform comparison." },
      { id: "data", icon: "📊", label: "Data", color: "#f59e0b", desc: "Data engineering for AI workloads: schema design for hybrid (vector + structured) queries, ETL/ELT pipeline patterns, lakehouse architecture for feature engineering, MongoDB indexing for RAG, and Redis caching to reduce LLM inference cost." },
      { id: "ml", icon: "⚙️", label: "ML Ops", color: "#ef4444", desc: "Production ML operations: model serving with vLLM/Ollama, vector index construction, evaluation-driven development, content moderation guardrails, inline-citation RAG, and Chrome-extension AI safety boundaries." }
    ]
  }
};

const props = defineProps<{ category: string }>();
const role = ROLE_CONFIG[props.category] ?? ROLE_CONFIG.engineer;
</script>