<template>
  <div class="goal-detail">
    <el-breadcrumb separator="/" class="goal-detail__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/executiver/okr' }">OKR Dashboard</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: `/executiver/okr/${roleId}` }">{{ roleName }} OKR</el-breadcrumb-item>
      <el-breadcrumb-item>{{ goal?.title }}</el-breadcrumb-item>
    </el-breadcrumb>

    <header class="goal-detail__header">
      <div class="goal-detail__header-left">
        <el-button text @click="$router.push(`/executiver/okr/${roleId}`)">
          <el-icon><ArrowLeft /></el-icon>
          {{ roleName }} Goals
        </el-button>
        <h1>{{ goal?.title }}</h1>
      </div>
      <el-tag :type="statusTagType(goal?.status || '')" size="small">{{ goal?.status }}</el-tag>
    </header>

    <div class="goal-detail__meta">
      <div class="goal-detail__meta-item">
        <span class="goal-detail__meta-label">Goal ID</span>
        <code class="goal-detail__meta-value">{{ goal?.id }}</code>
      </div>
      <div class="goal-detail__meta-item">
        <span class="goal-detail__meta-label">Period</span>
        <span class="goal-detail__meta-value">{{ goal?.period }}</span>
      </div>
      <div class="goal-detail__meta-item">
        <span class="goal-detail__meta-label">Owner</span>
        <span class="goal-detail__meta-value">{{ goal?.owner }}</span>
      </div>
      <div class="goal-detail__meta-item">
        <span class="goal-detail__meta-label">Project</span>
        <el-tag :type="projectTagType(goal?.project || '')" size="small">{{ goal?.project }}</el-tag>
      </div>
    </div>

    <el-divider />

    <section class="goal-detail__section">
      <h2>Description</h2>
      <p class="goal-detail__desc">{{ goal?.description }}</p>
    </section>

    <section class="goal-detail__section">
      <h2>Key Results</h2>
      <div class="goal-detail__krs">
        <div v-for="(kr, i) in goal?.keyResults || []" :key="i" class="goal-detail__kr">
          <div class="goal-detail__kr-head">
            <span class="goal-detail__kr-num">KR{{ i + 1 }}</span>
            <span class="goal-detail__kr-progress">{{ kr.progress }}%</span>
          </div>
          <p class="goal-detail__kr-text">{{ kr.text }}</p>
          <el-progress :percentage="kr.progress" :status="kr.progress >= 100 ? 'success' : undefined" :stroke-width="8" />
        </div>
      </div>
    </section>

    <el-divider />

    <section class="goal-detail__section">
      <h2>Related Knowledge Base</h2>
      <div class="goal-detail__related">
        <div v-for="r in goal?.related || []" :key="r.file" class="goal-detail__related-item">
          <span class="goal-detail__related-icon">📄</span>
          <div class="goal-detail__related-body">
            <span class="goal-detail__related-file">{{ r.file }}</span>
            <span class="goal-detail__related-desc">{{ r.description }}</span>
          </div>
        </div>
      </div>
    </section>

    <el-divider />

    <section class="goal-detail__section">
      <h2>Related Metrics</h2>
      <div class="goal-detail__related">
        <div v-for="m in goalMetrics" :key="m.id" class="goal-detail__related-item goal-detail__related-item--clickable" @click="router.push(`/executiver/okr/${roleId}/metric/${m.id}`)">
          <span class="goal-detail__related-icon">{{ m.icon }}</span>
          <div class="goal-detail__related-body">
            <span class="goal-detail__related-file">{{ m.name }}</span>
            <span class="goal-detail__related-desc">{{ m.desc }}</span>
          </div>
        </div>
        <div v-if="!goalMetrics.length" class="goal-detail__related-empty">No related metrics found.</div>
      </div>
    </section>

    <el-divider />

    <section class="goal-detail__section">
      <h2>Cascade Impact</h2>
      <p class="goal-detail__cascade-desc">This goal affects downstream roles:</p>
      <div class="goal-detail__cascade-flow">
        <div v-for="(c, i) in goal?.cascade || []" :key="i" class="goal-detail__cascade-item">
          <span v-if="i > 0" class="goal-detail__cascade-arrow">→</span>
          <div class="goal-detail__cascade-card" @click="router.push(`/executiver/okr/${roleIdByName(c.role)}`)">
            <span class="goal-detail__cascade-icon">{{ c.icon }}</span>
            <span class="goal-detail__cascade-role">{{ c.role }}</span>
            <span class="goal-detail__cascade-impact">{{ c.impact }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="goalDetail">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";

const router = useRouter();

const props = defineProps<{ roleId: string; goalId: string }>();

interface KeyResult { text: string; progress: number }
interface CascadeItem { icon: string; role: string; impact: string }
interface RelatedItem { file: string; description: string }
interface Goal {
  id: string; icon: string; title: string; status: string;
  description: string; period: string; owner: string; project: string;
  keyResults: KeyResult[]; cascade: CascadeItem[]; related: RelatedItem[];
}

const roleNames: Record<string, string> = {
  executiver: "Executive", producter: "Product", leader: "Leader",
  engineer: "Engineer", srer: "SRE", aier: "AI Engineer", curator: "Curator"
};

const allGoals: Record<string, Record<string, Goal>> = {
  executiver: {
    "exec-001": {
      id: "exec-001", icon: "📈", title: "Yi Product Suite Growth", status: "active",
      description: "Grow the Yi product suite (YiAi + YiVad + YiPet) from internal tools to a self-serve platform. YiAi serves as the AI backend for multiple business lines, YiVad is the admin console for all internal operations, and YiPet is the daily AI companion for knowledge workers. This goal is the north star for the entire Yi family.",
      period: "2026 H2", owner: "CEO", project: "YiAi",
      keyResults: [
        { text: "YiAi serves 3+ business lines with independent tenant isolation", progress: 67 },
        { text: "YiVad becomes the single admin console for all internal operations", progress: 80 },
        { text: "YiPet reaches 50+ daily active users across departments", progress: 45 },
        { text: "YiKnowledge reaches 500+ verified knowledge files with 90% freshness", progress: 82 }
      ],
      cascade: [
        { icon: "📋", role: "Product", impact: "Translate growth targets into feature roadmaps for each project" },
        { icon: "🧭", role: "Leader", impact: "Design multi-tenant architecture and plan capacity for growth" },
        { icon: "⚡", role: "Engineer", impact: "Deliver features that enable multi-tenant isolation and admin workflows" }
      ],
      related: [
        { file: "executiver/roadmap/annual-strategic-planning.md", description: "Annual strategic planning framework" },
        { file: "executiver/strategy/product-strategy-framework.md", description: "Product strategy framework" },
        { file: "producter/discovery/metrics/north-star-metric.md", description: "North star metric definition" }
      ]
    },
    "exec-002": {
      id: "exec-002", icon: "🤖", title: "AI-First Transformation", status: "active",
      description: "Position AI as the primary interface for all internal tools. The BRD agent, RAG system, and aiChat agent mode should handle 70% of routine operational tasks without human intervention. This is a multi-quarter transformation that requires buy-in from every role in the pipeline.",
      period: "2026 Q3-Q4", owner: "CTO", project: "YiAi",
      keyResults: [
        { text: "BRD agent autonomously generates 80% of BRD first drafts from voice/text input", progress: 60 },
        { text: "aiChat agent mode completes 70% of CRUD tasks without human intervention", progress: 55 },
        { text: "RAG retrieval relevance score > 0.85 across all knowledge domains", progress: 72 },
        { text: "Model cost per task reduced by 30% through multi-provider routing", progress: 40 }
      ],
      cascade: [
        { icon: "📋", role: "Product", impact: "Prioritize AI features that deliver measurable automation wins" },
        { icon: "🤖", role: "AI Engineer", impact: "Build the agent loop, RAG pipeline, and model evaluation framework" },
        { icon: "🧭", role: "Leader", impact: "Implement multi-provider LLM strategy and cost optimization" },
        { icon: "📦", role: "Curator", impact: "Ensure KB quality enables AI accuracy — garbage in, garbage out" }
      ],
      related: [
        { file: "executiver/strategy/ai-first-vision.md", description: "AI-first transformation vision" },
        { file: "aier/ai-eval/rag-evaluation-framework.md", description: "RAG evaluation methodology" },
        { file: "leader/decisions/yiai/multi-provider-llm-strategy.md", description: "Multi-provider LLM ADR" }
      ]
    },
    "exec-003": {
      id: "exec-003", icon: "⚙️", title: "Operational Excellence", status: "active",
      description: "Establish operational baselines for the Yi product suite. Every project must have defined SLOs, monitored dashboards, and documented incident response procedures. Operational excellence is the foundation that enables fast iteration without breaking things.",
      period: "2026 Q3", owner: "VP Engineering", project: "YiVad",
      keyResults: [
        { text: "YiAi uptime SLO defined and monitored (target: 99.5%)", progress: 85 },
        { text: "YiVad build pipeline: type-check + lint pass on every commit", progress: 100 },
        { text: "YiPet extension: automated E2E test coverage for core user flows", progress: 30 },
        { text: "All 3 projects have documented incident response runbooks", progress: 50 }
      ],
      cascade: [
        { icon: "🔧", role: "SRE", impact: "Define and monitor SLOs; build incident response muscle" },
        { icon: "⚡", role: "Engineer", impact: "Implement CI/CD quality gates; write runbooks" },
        { icon: "🧭", role: "Leader", impact: "Establish test infrastructure and coverage baselines" }
      ],
      related: [
        { file: "srer/slo/slo-definition-template.md", description: "SLO definition template" },
        { file: "srer/incident/postmortem-process.md", description: "Incident postmortem process" },
        { file: "engineer/projects/yivad/functional-modules.md", description: "YiVad build pipeline docs" }
      ]
    },
    "exec-004": {
      id: "exec-004", icon: "🌱", title: "Talent & Culture", status: "active",
      description: "Build a learning culture where knowledge is captured, shared, and maintained. The YiKnowledge base is the single source of truth for all project decisions and patterns. Every team member contributes to and benefits from the collective knowledge.",
      period: "2026 H2", owner: "CTO", project: "YiVad",
      keyResults: [
        { text: "Every engineer contributes at least 1 knowledge file per sprint", progress: 70 },
        { text: "YiKnowledge frontmatter compliance > 95% across all files", progress: 88 },
        { text: "Onboarding time for new engineers reduced from 4 weeks to 2 weeks", progress: 50 },
        { text: "Quarterly knowledge audit completed with < 5% stale files", progress: 100 }
      ],
      cascade: [
        { icon: "📦", role: "Curator", impact: "Run governance cadence; maintain KB quality standards" },
        { icon: "⚡", role: "Engineer", impact: "Contribute knowledge files; participate in knowledge sharing" },
        { icon: "🧭", role: "Leader", impact: "Set knowledge-sharing expectations in sprint planning" }
      ],
      related: [
        { file: "curator/governance/README.md", description: "Governance overview and cadence" },
        { file: "curator/quality/readiness-checklist.md", description: "10-question readiness checklist" },
        { file: "engineer/dev-standards/knowledge-contribution-guide.md", description: "How to contribute KB files" }
      ]
    }
  },
  producter: {
    "prod-001": {
      id: "prod-001", icon: "💬", title: "YiAi Chat Experience", status: "active",
      description: "Make YiAi's chat interface (aiChat) the primary interaction model for all knowledge work. The agent mode should handle complex multi-turn tasks with confirmation gates for safety. The chat experience must feel like working with a capable colleague, not a command-line tool.",
      period: "2026 Q3", owner: "PM YiAi", project: "YiAi",
      keyResults: [
        { text: "aiChat agent mode task completion rate > 70% for CRUD operations", progress: 55 },
        { text: "Confirmation UX: user approves/rejects tool calls in < 3 seconds", progress: 90 },
        { text: "Chat-based confirmation answers (yes/no) adoption > 50%", progress: 75 },
        { text: "User satisfaction score > 4.0/5.0 for agent-assisted tasks", progress: 60 }
      ],
      cascade: [
        { icon: "🤖", role: "AI Engineer", impact: "Build agent loop reliability and confirmation UX" },
        { icon: "⚡", role: "Engineer", impact: "Implement chat UI components and streaming SSE" },
        { icon: "🧭", role: "Leader", impact: "Design agent architecture (Pi-inspired loop, tool registry)" }
      ],
      related: [
        { file: "producter/discovery/prd/yi-ai-chat-platform.md", description: "YiAi Chat Platform PRD" },
        { file: "aier/ai-eval/agent-task-completion-benchmark.md", description: "Agent task completion benchmark" },
        { file: "engineer/projects/yiai/agent-architecture.md", description: "Agent architecture deep dive" }
      ]
    },
    "prod-002": {
      id: "prod-002", icon: "🖥️", title: "YiVad Admin Maturity", status: "active",
      description: "YiVad evolves from a basic admin panel to a comprehensive management console. Every role in the pipeline should have dedicated views for their goals, metrics, and workflows. The admin console should be the primary interface for managing the YiKnowledge base, tracking project health, and monitoring AI performance.",
      period: "2026 Q3-Q4", owner: "PM YiVad", project: "YiVad",
      keyResults: [
        { text: "7 role-specific goal and metric views implemented", progress: 40 },
        { text: "ProTable-driven CRUD pages for all YiKnowledge collections", progress: 85 },
        { text: "Knowledge base dashboard with freshness tracking and stale alerts", progress: 70 },
        { text: "Admin console used by all 5 pipeline roles weekly", progress: 50 }
      ],
      cascade: [
        { icon: "🧭", role: "Leader", impact: "Prioritize YiVad features in technical roadmap; allocate capacity" },
        { icon: "⚡", role: "Engineer", impact: "Implement role-specific views, dashboards, and CRUD pages" },
        { icon: "📦", role: "Curator", impact: "Ensure KB health metrics are surfaced in YiVad dashboards" }
      ],
      related: [
        { file: "producter/discovery/prd/README.md", description: "PRD templates and examples" },
        { file: "engineer/projects/yivad/functional-modules.md", description: "YiVad functional modules overview" },
        { file: "leader/decisions/yivad/vitest-introduction.md", description: "YiVad Vitest ADR" }
      ]
    },
    "prod-003": {
      id: "prod-003", icon: "🧩", title: "YiPet Extension Adoption", status: "active",
      description: "YiPet becomes the daily AI companion for knowledge workers. The extension should reduce context-switching and make AI assistance available in any browser tab. Success means users reach for YiPet before they reach for a search engine.",
      period: "2026 Q3-Q4", owner: "PM YiPet", project: "YiPet",
      keyResults: [
        { text: "50+ DAU with > 3 chat sessions per user per day", progress: 45 },
        { text: "Content script injection works on 10+ internal web platforms", progress: 70 },
        { text: "Chat window response time < 2s for first token", progress: 80 },
        { text: "Extension rating > 4.5 stars in Chrome Web Store", progress: 0 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Build MV3 extension with dual-world execution and multi-entry build" },
        { icon: "🧭", role: "Leader", impact: "Design cross-project API contracts for extension-to-backend communication" },
        { icon: "🤖", role: "AI Engineer", impact: "Integrate RAG and agent chat into the extension sidebar" }
      ],
      related: [
        { file: "producter/discovery/prd/yipet-extension-prd.md", description: "YiPet Extension PRD" },
        { file: "engineer/projects/yipet/architecture.md", description: "YiPet MV3 architecture" },
        { file: "engineer/projects/yipet/multi-entry-build.md", description: "YiPet multi-entry build design" }
      ]
    },
    "prod-004": {
      id: "prod-004", icon: "📝", title: "BRD Agent Quality", status: "active",
      description: "The BRD agent must produce business requirement documents that are actionable, complete, and require minimal human editing. Target: 80% acceptance rate on first draft. A BRD that requires heavy editing defeats the purpose of AI assistance.",
      period: "2026 Q3", owner: "PM YiAi", project: "YiAi",
      keyResults: [
        { text: "BRD first-draft acceptance rate > 80% (no major structural edits)", progress: 65 },
        { text: "Average BRD generation time < 5 minutes from voice/text input", progress: 70 },
        { text: "BRD completeness score > 90% against template checklist", progress: 75 },
        { text: "3+ business lines actively using BRD agent for requirements", progress: 50 }
      ],
      cascade: [
        { icon: "🤖", role: "AI Engineer", impact: "Build BRD agent prompt templates and evaluation pipeline" },
        { icon: "🏢", role: "Executive", impact: "Drive BRD agent adoption across business lines" },
        { icon: "📦", role: "Curator", impact: "Maintain BRD templates and best practices in KB" }
      ],
      related: [
        { file: "producter/discovery/prd/brd-agent-prd.md", description: "BRD Agent PRD" },
        { file: "aier/prompts/brd-generation-system-prompt.md", description: "BRD generation system prompt" },
        { file: "producter/discovery/brd/template.md", description: "Standard BRD template" }
      ]
    },
    "prod-005": {
      id: "prod-005", icon: "🔗", title: "Cross-Project Integration", status: "active",
      description: "YiAi, YiVad, and YiPet must feel like one product suite. Shared design language, consistent API contracts, and unified user experience across all touchpoints. A user should not feel like they're switching between three separate tools.",
      period: "2026 H2", owner: "PM Lead", project: "YiVad",
      keyResults: [
        { text: "Unified RPC envelope contract documented and enforced across all projects", progress: 100 },
        { text: "Shared UI component library for YiVad and YiPet (where applicable)", progress: 20 },
        { text: "Single sign-on and permission model shared across all 3 projects", progress: 40 },
        { text: "Cross-project user journey: YiPet → YiAi → YiVad end-to-end < 3 clicks", progress: 60 }
      ],
      cascade: [
        { icon: "🧭", role: "Leader", impact: "Define cross-project API contracts and shared architecture patterns" },
        { icon: "⚡", role: "Engineer", impact: "Implement shared RPC envelope and unified auth across projects" },
        { icon: "📋", role: "Product", impact: "Design unified user journeys across all three touchpoints" }
      ],
      related: [
        { file: "leader/decisions/cross-project/rpc-envelope-standard.md", description: "RPC envelope standard ADR" },
        { file: "engineer/projects/yivad/api-request-layer.md", description: "YiVad API request layer" },
        { file: "producter/discovery/research/cross-project-ux-audit.md", description: "Cross-project UX audit" }
      ]
    }
  },
  leader: {
    "lead-001": {
      id: "lead-001", icon: "🏗️", title: "Architecture Maturity L4", status: "active",
      description: "Advance architecture maturity from L3 (Defined) to L4 (Measured). Key gap: OpenAPI schema auto-generation and architecture fitness function auto-validation across all three projects. L4 means the architecture is not just documented — it is automatically validated on every change.",
      period: "2026 Q3-Q4", owner: "Tech Lead", project: "YiAi",
      keyResults: [
        { text: "YiAi: OpenAPI schema auto-generated from FastAPI routes", progress: 30 },
        { text: "YiVad: TypeScript types generated from OpenAPI schema", progress: 0 },
        { text: "Architecture fitness functions run in CI for contract compliance", progress: 0 },
        { text: "All ADRs updated with current status and consequences", progress: 85 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Add OpenAPI decorators to YiAi routes; generate TypeScript types" },
        { icon: "🔧", role: "SRE", impact: "Add fitness functions to CI pipeline; monitor contract compliance" },
        { icon: "🏢", role: "Executive", impact: "Architecture maturity is a key input to operational excellence goal" }
      ],
      related: [
        { file: "leader/architecture/tl-maturity-model-arch-2026-08.md", description: "Architecture maturity model assessment" },
        { file: "leader/decisions/yiai/openapi-schema-generation.md", description: "OpenAPI schema generation ADR" },
        { file: "leader/architecture/fitness-function-patterns.md", description: "Architecture fitness function patterns" }
      ]
    },
    "lead-002": {
      id: "lead-002", icon: "🔀", title: "Multi-Provider LLM Strategy", status: "active",
      description: "Implement multi-provider LLM routing for YiAi with cost optimization and fallback. The agent loop should escalate from cheaper/faster models to stronger ones on stall. A single-provider strategy is a single point of failure for AI features.",
      period: "2026 Q3", owner: "Tech Lead", project: "YiAi",
      keyResults: [
        { text: "3+ LLM providers integrated with unified interface", progress: 67 },
        { text: "Model escalation (stall → stronger) implemented and verified", progress: 100 },
        { text: "Cost per task reduced by 30% through intelligent routing", progress: 40 },
        { text: "Provider fallback: zero failed requests due to single-provider outage", progress: 90 }
      ],
      cascade: [
        { icon: "🤖", role: "AI Engineer", impact: "Implement model runtime abstraction; build evaluation per provider" },
        { icon: "⚡", role: "Engineer", impact: "Integrate multi-provider routing into agent loop and chat service" },
        { icon: "💰", role: "Executive", impact: "LLM cost is the primary variable cost — multi-provider is a cost lever" }
      ],
      related: [
        { file: "leader/decisions/yiai/multi-provider-llm-strategy.md", description: "Multi-provider LLM strategy ADR" },
        { file: "aier/ai-eval/model-benchmark-methodology.md", description: "Model benchmark methodology" },
        { file: "leader/architecture/llm-cost-optimization-patterns.md", description: "LLM cost optimization patterns" }
      ]
    },
    "lead-003": {
      id: "lead-003", icon: "🧪", title: "Test Coverage Baseline", status: "active",
      description: "Establish test infrastructure and coverage baselines for all three projects. YiVad and YiPet currently lack test frameworks; YiAi has partial pytest coverage. Testing is not optional — it is the foundation of confident delivery.",
      period: "2026 Q3-Q4", owner: "Tech Lead", project: "YiVad",
      keyResults: [
        { text: "YiVad: Vitest introduced with > 60% coverage on utils and stores", progress: 25 },
        { text: "YiPet: Vitest test suite for API client and shared utilities", progress: 10 },
        { text: "YiAi: pytest coverage > 70% on domain and service layers", progress: 50 },
        { text: "All 3 projects: CI pipeline blocks merge on test failure", progress: 33 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Write tests for critical paths; follow test-first for new features" },
        { icon: "🔧", role: "SRE", impact: "Add test coverage gates to CI; monitor coverage trends" },
        { icon: "📋", role: "Product", impact: "Include test time in feature estimates; don't treat tests as optional" }
      ],
      related: [
        { file: "leader/decisions/yivad/vitest-introduction.md", description: "YiVad Vitest introduction ADR" },
        { file: "engineer/dev-standards/testing-strategy.md", description: "Cross-project testing strategy" },
        { file: "leader/architecture/test-coverage-benchmarks.md", description: "Test coverage benchmarks by project type" }
      ]
    },
    "lead-004": {
      id: "lead-004", icon: "💰", title: "Cost Efficiency", status: "active",
      description: "Track and optimize infrastructure and API costs across all projects. LLM API costs are the primary variable cost; establish budgets and monitoring. Every dollar spent on AI inference should be traceable to business value.",
      period: "2026 H2", owner: "Tech Lead", project: "YiAi",
      keyResults: [
        { text: "LLM API cost dashboard with per-model and per-task breakdown", progress: 60 },
        { text: "Monthly LLM cost within 80% of budget with proactive alerts", progress: 50 },
        { text: "YiAi infrastructure cost < $500/month for current load", progress: 85 },
        { text: "Cost attribution: each project's LLM usage tracked and billed separately", progress: 30 }
      ],
      cascade: [
        { icon: "🤖", role: "AI Engineer", impact: "Track cost per quality point; optimize model selection for cost" },
        { icon: "🔧", role: "SRE", impact: "Build cost dashboards; set budget alerts; monitor infrastructure spend" },
        { icon: "🏢", role: "Executive", impact: "Approve AI budget; review cost-efficiency quarterly" }
      ],
      related: [
        { file: "leader/architecture/llm-cost-optimization-patterns.md", description: "LLM cost optimization patterns" },
        { file: "srer/observability/cost-monitoring-dashboard.md", description: "Cost monitoring dashboard spec" },
        { file: "executiver/strategy/ai-investment-framework.md", description: "AI investment framework" }
      ]
    },
    "lead-005": {
      id: "lead-005", icon: "🛡️", title: "Security Posture", status: "active",
      description: "Establish security baseline across all projects. Dependency audits, supply chain hardening, and access control review. Security is not a feature — it is a property of every feature. Start with the basics and iterate.",
      period: "2026 Q3-Q4", owner: "Tech Lead", project: "YiVad",
      keyResults: [
        { text: "Quarterly dependency audit with critical CVE remediation < 7 days", progress: 75 },
        { text: "YiVad: v-auth directive coverage on all sensitive operations", progress: 90 },
        { text: "YiAi: API rate limiting and input validation on all public endpoints", progress: 60 },
        { text: "YiPet: CSP headers and extension permissions minimized to least-privilege", progress: 80 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Apply v-auth on all sensitive operations; fix CVEs promptly" },
        { icon: "🔧", role: "SRE", impact: "Monitor dependency vulnerabilities; enforce rate limiting" },
        { icon: "📋", role: "Product", impact: "Include security review in feature acceptance criteria" }
      ],
      related: [
        { file: "leader/security/security-baseline-checklist.md", description: "Security baseline checklist" },
        { file: "engineer/projects/yivad/directives-auth.md", description: "YiVad v-auth directive" },
        { file: "srer/security/dependency-audit-process.md", description: "Dependency audit process" }
      ]
    }
  },
  engineer: {
    "eng-001": {
      id: "eng-001", icon: "🚀", title: "Delivery Velocity", status: "active",
      description: "Maintain consistent delivery velocity across all three projects. Measure DORA metrics (deployment frequency, lead time, change failure rate, MTTR) and improve quarter over quarter. Velocity without quality is just breaking things faster.",
      period: "2026 Q3", owner: "Engineering Lead", project: "YiAi",
      keyResults: [
        { text: "YiAi: deploy frequency > 3x/week, lead time < 2 days", progress: 70 },
        { text: "YiVad: deploy frequency > 2x/week, lead time < 1 day", progress: 85 },
        { text: "YiPet: extension release cycle < 2 weeks per version", progress: 60 },
        { text: "Change failure rate < 10% across all projects", progress: 80 }
      ],
      cascade: [
        { icon: "🔧", role: "SRE", impact: "Build CI/CD pipelines; enable safe, frequent deployments" },
        { icon: "🧭", role: "Leader", impact: "Remove process bottlenecks; invest in deployment automation" },
        { icon: "📋", role: "Product", impact: "Right-size features for small-batch delivery" }
      ],
      related: [
        { file: "engineer/dev-standards/dora-metrics-guide.md", description: "DORA metrics implementation guide" },
        { file: "srer/cicd/deployment-pipeline-design.md", description: "CI/CD pipeline design" },
        { file: "engineer/projects/yiai/deployment-workflow.md", description: "YiAi deployment workflow" }
      ]
    },
    "eng-002": {
      id: "eng-002", icon: "✅", title: "Code Quality", status: "active",
      description: "Enforce consistent code quality standards. TypeScript strict mode, lint rules, and code review expectations must be uniform across projects. Code quality is a team habit, not a one-time cleanup.",
      period: "2026 Q3", owner: "Engineering Lead", project: "YiVad",
      keyResults: [
        { text: "TypeScript strict mode enabled on all 3 projects", progress: 100 },
        { text: "0 lint errors on main branch for all projects", progress: 90 },
        { text: "Code review turnaround < 4 hours during business hours", progress: 75 },
        { text: "Pre-commit hooks: lint + type-check pass rate > 95%", progress: 85 }
      ],
      cascade: [
        { icon: "🧭", role: "Leader", impact: "Define code quality standards; enforce via CI" },
        { icon: "🤖", role: "AI Engineer", impact: "Use AI code review to catch common issues before human review" }
      ],
      related: [
        { file: "engineer/dev-standards/code-review-checklist.md", description: "Code review checklist" },
        { file: "engineer/projects/yivad/typescript-strict-mode.md", description: "TypeScript strict mode guide" },
        { file: "leader/decisions/cross-project/lint-format-standard.md", description: "Lint/format standard ADR" }
      ]
    },
    "eng-003": {
      id: "eng-003", icon: "📚", title: "Knowledge Sharing", status: "active",
      description: "Every significant design decision, bug fix, and lesson learned is captured in YiKnowledge. Engineers contribute to the KB as part of their regular workflow — not as an afterthought. The best engineering orgs write things down.",
      period: "2026 H2", owner: "Engineering Lead", project: "YiAi",
      keyResults: [
        { text: "YiKnowledge: 10+ new engineer-contributed files per month", progress: 80 },
        { text: "Postmortem for every P1+ incident within 48 hours", progress: 100 },
        { text: "Architecture decision records for all non-trivial technical choices", progress: 70 },
        { text: "Weekly knowledge-sharing session attendance > 80%", progress: 60 }
      ],
      cascade: [
        { icon: "📦", role: "Curator", impact: "Review and classify engineer-contributed files; maintain quality" },
        { icon: "🧭", role: "Leader", impact: "Set expectation that knowledge work is part of engineering work" },
        { icon: "🏢", role: "Executive", impact: "Knowledge sharing is a key input to talent & culture goal" }
      ],
      related: [
        { file: "engineer/dev-standards/knowledge-contribution-guide.md", description: "Knowledge contribution guide" },
        { file: "curator/governance/inbox-triage-process.md", description: "Inbox triage process" },
        { file: "engineer/lessons/postmortem-template.md", description: "Postmortem template" }
      ]
    },
    "eng-004": {
      id: "eng-004", icon: "🛠️", title: "Developer Experience", status: "active",
      description: "Reduce friction in the development workflow. Fast builds, clear error messages, and consistent tooling across all projects. Developer experience is a productivity multiplier — every second saved in the inner loop compounds across the team.",
      period: "2026 Q3-Q4", owner: "Engineering Lead", project: "YiVad",
      keyResults: [
        { text: "YiVad: Rsbuild dev server start < 3 seconds, HMR < 200ms", progress: 90 },
        { text: "YiPet: multi-entry build time < 30 seconds (all targets)", progress: 75 },
        { text: "YiAi: uvicorn reload on file change < 2 seconds", progress: 85 },
        { text: "Developer setup guide: new engineer productive in < 1 day", progress: 60 }
      ],
      cascade: [
        { icon: "🧭", role: "Leader", impact: "Prioritize DX improvements in technical roadmap; allocate time" },
        { icon: "🏢", role: "Executive", impact: "DX directly impacts onboarding time and talent retention" }
      ],
      related: [
        { file: "engineer/projects/yivad/rsbuild-migration.md", description: "Vite to Rsbuild migration" },
        { file: "engineer/projects/yipet/multi-entry-build.md", description: "YiPet multi-entry build design" },
        { file: "engineer/dev-standards/developer-setup-guide.md", description: "Developer setup guide" }
      ]
    },
    "eng-005": {
      id: "eng-005", icon: "🧹", title: "Technical Debt Reduction", status: "active",
      description: "Actively reduce technical debt. YiVad's 18 pre-existing type errors must be resolved. YiPet's dependency warnings must be addressed. Technical debt is not a moral failing — it is a business decision to be managed, not ignored.",
      period: "2026 Q3", owner: "Engineering Lead", project: "YiVad",
      keyResults: [
        { text: "YiVad: resolve 18 pre-existing vue-tsc errors to zero", progress: 15 },
        { text: "YiPet: npm audit critical/high severity issues to zero", progress: 50 },
        { text: "YiAi: remove deprecated API endpoints with migration path", progress: 40 },
        { text: "Quarterly tech debt review added to sprint planning cadence", progress: 100 }
      ],
      cascade: [
        { icon: "🧭", role: "Leader", impact: "Allocate 20% of sprint capacity to tech debt reduction" },
        { icon: "📋", role: "Product", impact: "Accept that tech debt work is feature work — it delivers reliability" },
        { icon: "🔧", role: "SRE", impact: "Tech debt directly impacts change failure rate and MTTR" }
      ],
      related: [
        { file: "engineer/lessons/tech-debt-management-framework.md", description: "Tech debt management framework" },
        { file: "leader/decisions/yivad/typescript-strict-enforcement.md", description: "TypeScript strict enforcement ADR" },
        { file: "engineer/projects/yipet/dependency-management.md", description: "YiPet dependency management" }
      ]
    }
  },
  srer: {
    "sre-001": {
      id: "sre-001", icon: "🎯", title: "SLO Compliance", status: "active",
      description: "Define and monitor Service Level Objectives for YiAi. The backend serves both YiVad and YiPet, so availability directly impacts both frontends. SLOs are not just targets — they are contracts between the platform and its users.",
      period: "2026 Q3", owner: "SRE Lead", project: "YiAi",
      keyResults: [
        { text: "YiAi API availability > 99.5% (measured monthly)", progress: 95 },
        { text: "P99 latency < 500ms for non-LLM endpoints", progress: 85 },
        { text: "P99 latency < 5s for LLM streaming endpoints", progress: 80 },
        { text: "Error budget tracking dashboard live with weekly review", progress: 60 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Design for reliability; add health checks to all services" },
        { icon: "🧭", role: "Leader", impact: "Define SLO targets; approve error budget policies" },
        { icon: "📋", role: "Product", impact: "Respect error budgets — feature freezes when budget is exhausted" }
      ],
      related: [
        { file: "srer/slo/slo-definition-template.md", description: "SLO definition template" },
        { file: "srer/slo/error-budget-policy.md", description: "Error budget policy" },
        { file: "srer/observability/slo-dashboard-design.md", description: "SLO dashboard design" }
      ]
    },
    "sre-002": {
      id: "sre-002", icon: "🚨", title: "Incident Response Maturity", status: "active",
      description: "Build incident response muscle. Every incident gets a blameless postmortem, every postmortem produces action items, and action items are tracked to completion. Mature incident response means incidents are learning opportunities, not blame opportunities.",
      period: "2026 H2", owner: "SRE Lead", project: "YiAi",
      keyResults: [
        { text: "MTTD (Mean Time to Detect) < 5 minutes for critical incidents", progress: 70 },
        { text: "MTTR (Mean Time to Resolve) < 30 minutes for P1 incidents", progress: 65 },
        { text: "100% of P1+ incidents have postmortems within 48 hours", progress: 100 },
        { text: "Postmortem action items: 90% completed within stated timeline", progress: 80 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Participate in on-call rotation; contribute to postmortems" },
        { icon: "🧭", role: "Leader", impact: "Ensure on-call rotation is staffed; review postmortem quality" },
        { icon: "🏢", role: "Executive", impact: "Incident response maturity is part of operational excellence" }
      ],
      related: [
        { file: "srer/incident/postmortem-process.md", description: "Postmortem process" },
        { file: "srer/incident/on-call-rotation-guide.md", description: "On-call rotation guide" },
        { file: "srer/incident/incident-severity-classification.md", description: "Incident severity classification" }
      ]
    },
    "sre-003": {
      id: "sre-003", icon: "📊", title: "Observability Coverage", status: "active",
      description: "Achieve comprehensive observability across the YiAi stack. Metrics, logs, and traces for every API endpoint, database query, and LLM call. You cannot improve what you cannot measure — and you cannot fix what you cannot see.",
      period: "2026 Q3-Q4", owner: "SRE Lead", project: "YiAi",
      keyResults: [
        { text: "All YiAi API endpoints have request count, latency, and error rate dashboards", progress: 70 },
        { text: "MongoDB query performance monitoring with slow-query alerts", progress: 50 },
        { text: "LLM call metrics: token usage, cost, latency per model and per task", progress: 60 },
        { text: "Alert coverage: all SLO breaches trigger notification within 2 minutes", progress: 75 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Add structured logging to all services; emit metrics from code" },
        { icon: "🤖", role: "AI Engineer", impact: "Log LLM call metadata for cost and quality tracking" },
        { icon: "🧭", role: "Leader", impact: "Invest in observability tooling; define required dashboards" }
      ],
      related: [
        { file: "srer/observability/observability-strategy.md", description: "Observability strategy" },
        { file: "srer/observability/dashboard-design-standards.md", description: "Dashboard design standards" },
        { file: "srer/observability/alerting-rules.md", description: "Alerting rules and thresholds" }
      ]
    },
    "sre-004": {
      id: "sre-004", icon: "🔄", title: "Release Safety", status: "active",
      description: "Make releases boring. Every deploy should be predictable, reversible, and verified. Zero-downtime deploys for YiAi, staged rollouts for YiPet extension. If you're scared to deploy on Friday, your release process needs work.",
      period: "2026 Q3", owner: "SRE Lead", project: "YiAi",
      keyResults: [
        { text: "YiAi: zero-downtime deploys with health check verification", progress: 80 },
        { text: "Rollback capability: any deploy can be reversed in < 5 minutes", progress: 90 },
        { text: "YiPet: staged rollout (5% → 25% → 100%) with automated crash monitoring", progress: 30 },
        { text: "Deploy checklist documented and followed for every release", progress: 100 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Write deployable code; include health checks and migration scripts" },
        { icon: "📋", role: "Product", impact: "Accept staged rollouts as part of release process" },
        { icon: "🧭", role: "Leader", impact: "Invest in deployment automation; approve release safety budget" }
      ],
      related: [
        { file: "srer/cicd/deployment-pipeline-design.md", description: "CI/CD pipeline design" },
        { file: "srer/cicd/staged-rollout-strategy.md", description: "Staged rollout strategy" },
        { file: "srer/cicd/deploy-checklist-template.md", description: "Deploy checklist template" }
      ]
    }
  },
  aier: {
    "aier-001": {
      id: "aier-001", icon: "🔍", title: "RAG Retrieval Quality", status: "active",
      description: "The RAG system is the foundation of AI-powered knowledge work. Retrieval quality directly impacts every downstream use case — chat, BRD generation, code review. If the retriever returns irrelevant chunks, even the best LLM produces wrong answers.",
      period: "2026 Q3", owner: "AI Engineer", project: "YiAi",
      keyResults: [
        { text: "Hybrid retrieval (semantic + keyword) relevance score > 0.85", progress: 72 },
        { text: "RAG evaluation benchmark: 100+ test queries across all knowledge domains", progress: 60 },
        { text: "Chunking strategy optimized per content type (code, markdown, frontmatter)", progress: 45 },
        { text: "Inline citation accuracy: > 90% of citations point to correct source", progress: 78 }
      ],
      cascade: [
        { icon: "📦", role: "Curator", impact: "KB structure and frontmatter quality directly impact retrieval accuracy" },
        { icon: "📋", role: "Product", impact: "RAG quality is the foundation of chat experience and BRD agent quality" },
        { icon: "🧭", role: "Leader", impact: "Invest in RAG evaluation infrastructure; approve chunking experiments" }
      ],
      related: [
        { file: "aier/ai-eval/rag-evaluation-framework.md", description: "RAG evaluation framework" },
        { file: "aier/rag/llama-index-architecture.md", description: "LlamaIndex RAG architecture" },
        { file: "aier/rag/chunking-strategy-guide.md", description: "Chunking strategy optimization" }
      ]
    },
    "aier-002": {
      id: "aier-002", icon: "🤖", title: "Agent Task Completion", status: "active",
      description: "The agent loop (Pi-inspired) must reliably complete multi-step tasks. Focus on tool-use reliability, confirmation UX, and recovery from stalls. A reliable agent is the difference between AI as a toy and AI as a tool.",
      period: "2026 Q3", owner: "AI Engineer", project: "YiAi",
      keyResults: [
        { text: "Agent task completion rate > 70% for CRUD operations (menus, knowledge files)", progress: 55 },
        { text: "Agent stall recovery: model escalation succeeds in > 80% of stalls", progress: 70 },
        { text: "Tool confirmation rate: < 10% false positives (approving wrong tool)", progress: 85 },
        { text: "Agent max_turns: 80% of tasks complete within 5 turns", progress: 60 }
      ],
      cascade: [
        { icon: "📋", role: "Product", impact: "Agent task completion rate directly impacts chat experience and BRD quality" },
        { icon: "🧭", role: "Leader", impact: "Multi-provider LLM strategy enables stall recovery via model escalation" },
        { icon: "⚡", role: "Engineer", impact: "Build agent UI components; implement tool lifecycle in frontend" }
      ],
      related: [
        { file: "aier/ai-eval/agent-task-completion-benchmark.md", description: "Agent task completion benchmark" },
        { file: "engineer/projects/yiai/agent-architecture.md", description: "Agent architecture deep dive" },
        { file: "aier/prompts/agent-system-prompt-template.md", description: "Agent system prompt template" }
      ]
    },
    "aier-003": {
      id: "aier-003", icon: "📏", title: "Model Evaluation Cadence", status: "active",
      description: "Regular evaluation of LLM models against project-specific benchmarks. YiAi's tasks span code generation, document writing, and data operations — each needs targeted evaluation. You cannot improve AI quality without measuring it.",
      period: "2026 H2", owner: "AI Engineer", project: "YiAi",
      keyResults: [
        { text: "Monthly model evaluation run against YiAi-specific benchmark suite", progress: 50 },
        { text: "Benchmark covers: CRUD accuracy, RAG relevance, BRD completeness, code correctness", progress: 65 },
        { text: "Model selection decision documented with evaluation data (not intuition)", progress: 80 },
        { text: "Cost-per-quality-point metric defined and tracked per model", progress: 30 }
      ],
      cascade: [
        { icon: "🧭", role: "Leader", impact: "Use evaluation data to inform multi-provider routing decisions" },
        { icon: "📋", role: "Product", impact: "Model quality directly impacts user satisfaction and feature adoption" },
        { icon: "💰", role: "Executive", impact: "Cost-per-quality-point enables ROI-based model selection" }
      ],
      related: [
        { file: "aier/ai-eval/model-benchmark-methodology.md", description: "Model benchmark methodology" },
        { file: "aier/ai-eval/cost-quality-tradeoff-analysis.md", description: "Cost-quality tradeoff analysis" },
        { file: "leader/decisions/yiai/multi-provider-llm-strategy.md", description: "Multi-provider LLM strategy ADR" }
      ]
    },
    "aier-004": {
      id: "aier-004", icon: "⚡", title: "AI Feature Velocity", status: "active",
      description: "Deliver AI features that users actually want. The aiChat agent mode, BRD agent, and RAG chat are the current flagship features. Ship fast, measure impact, iterate — the same engineering principles apply to AI features.",
      period: "2026 Q3", owner: "AI Engineer", project: "YiVad",
      keyResults: [
        { text: "aiChat agent mode: live turn-progress, confirmation, resume-by-session shipped", progress: 100 },
        { text: "BRD agent: voice input → structured BRD end-to-end shipped", progress: 85 },
        { text: "RAG chat: per-file agent mode with tool lifecycle shipped", progress: 100 },
        { text: "User-reported AI feature requests: median time-to-ship < 2 weeks", progress: 55 }
      ],
      cascade: [
        { icon: "📋", role: "Product", impact: "Prioritize AI features based on user impact and adoption data" },
        { icon: "⚡", role: "Engineer", impact: "Build AI feature UI components; integrate with agent loop" },
        { icon: "🧭", role: "Leader", impact: "Ensure AI feature architecture is modular and testable" }
      ],
      related: [
        { file: "aier/features/agent-mode-roadmap.md", description: "Agent mode feature roadmap" },
        { file: "aier/features/brd-agent-architecture.md", description: "BRD agent architecture" },
        { file: "producter/discovery/prd/yi-ai-chat-platform.md", description: "YiAi Chat Platform PRD" }
      ]
    },
    "aier-005": {
      id: "aier-005", icon: "📝", title: "Prompt Engineering Standards", status: "active",
      description: "System prompts are the UI for AI behavior. Establish prompt versioning, evaluation, and improvement cadence. Prompts are code — treat them as such. A prompt change can be as impactful as a code change, and should be reviewed with the same rigor.",
      period: "2026 Q3", owner: "AI Engineer", project: "YiAi",
      keyResults: [
        { text: "All system prompts version-controlled with change history", progress: 90 },
        { text: "Prompt evaluation: A/B test framework for prompt changes", progress: 30 },
        { text: "Prompt regression test suite: 50+ test cases across all prompt templates", progress: 45 },
        { text: "Prompt documentation: each prompt has documented intent, constraints, and edge cases", progress: 70 }
      ],
      cascade: [
        { icon: "📋", role: "Product", impact: "Prompt changes can alter AI behavior — product review required for user-facing prompts" },
        { icon: "🧭", role: "Leader", impact: "Prompt versioning is part of the codebase; follow same review process" },
        { icon: "🤖", role: "AI Engineer", impact: "Build A/B test framework; maintain prompt regression suite" }
      ],
      related: [
        { file: "aier/prompts/prompt-engineering-standards.md", description: "Prompt engineering standards" },
        { file: "aier/prompts/brd-generation-system-prompt.md", description: "BRD generation system prompt" },
        { file: "aier/prompts/agent-system-prompt-template.md", description: "Agent system prompt template" }
      ]
    }
  },
  curator: {
    "cur-001": {
      id: "cur-001", icon: "📖", title: "KB Coverage", status: "active",
      description: "Ensure every project decision, pattern, and lesson is captured in YiKnowledge. The KB is the single source of truth for all three projects. Coverage gaps mean decisions are made in the dark — the KB is the AI's cognitive boundary.",
      period: "2026 H2", owner: "Curator", project: "YiAi",
      keyResults: [
        { text: "YiKnowledge: 500+ files with complete frontmatter across 7 roles", progress: 82 },
        { text: "Coverage gaps identified and tracked in tacit-knowledge-backlog.md", progress: 60 },
        { text: "Each project (YiAi/YiVad/YiPet) has architecture + functional-modules + dev-standards docs", progress: 100 },
        { text: "No orphaned content: every file has a role home and related links", progress: 75 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Contribute files for uncovered topics; flag knowledge gaps" },
        { icon: "🧭", role: "Leader", impact: "Ensure ADRs and technical decisions are written up in KB" },
        { icon: "🤖", role: "AI Engineer", impact: "KB coverage gaps directly limit RAG retrieval quality" }
      ],
      related: [
        { file: "curator/coverage/tacit-knowledge-backlog.md", description: "Tacit knowledge backlog" },
        { file: "curator/governance/README.md", description: "Governance overview" },
        { file: "curator/quality/content-structure-standards.md", description: "Content structure standards" }
      ]
    },
    "cur-002": {
      id: "cur-002", icon: "🔄", title: "Freshness Compliance", status: "active",
      description: "Content rots without maintenance. Track review_cycle compliance and proactively flag approaching staleness. The 6-month deprecation rule is automatic — if content hasn't been verified in 6 months, it is no longer trustworthy.",
      period: "2026 Q3", owner: "Curator", project: "YiVad",
      keyResults: [
        { text: "90% of files have last_verified within their declared review_cycle", progress: 78 },
        { text: "0 files with last_verified > 6 months (auto-deprecation enforced)", progress: 85 },
        { text: "YiVad Knowledge Base dashboard: freshness tracking with 5-month warnings", progress: 70 },
        { text: "Quarterly review: all files with review_cycle: quarterly verified", progress: 100 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Respond to freshness flags; update files within review cycle" },
        { icon: "🧭", role: "Leader", impact: "Ensure ADRs are reviewed on schedule; update status as decisions evolve" },
        { icon: "🏢", role: "Executive", impact: "Freshness compliance is a key input to talent & culture goal" }
      ],
      related: [
        { file: "curator/freshness/review-cycle-policy.md", description: "Review cycle policy" },
        { file: "curator/freshness/deprecation-rules.md", description: "Deprecation rules" },
        { file: "curator/governance/lifecycle-state-machine.md", description: "Content lifecycle state machine" }
      ]
    },
    "cur-003": {
      id: "cur-003", icon: "✅", title: "Content Quality", status: "active",
      description: "Every knowledge file must pass the 10-question readiness checklist. Content must be actionable, well-structured, and AI-searchable. Quality is not subjective — the checklist defines what good looks like.",
      period: "2026 H2", owner: "Curator", project: "YiKnowledge",
      keyResults: [
        { text: "Readiness checklist pass rate > 90% for all stable files", progress: 75 },
        { text: "Frontmatter completeness: benefit + acceptance_criteria present on all stable files", progress: 82 },
        { text: "Anti-patterns section present in all how-to and pattern files", progress: 65 },
        { text: "User story format (As a/I want to/so that) used consistently in all summaries", progress: 88 }
      ],
      cascade: [
        { icon: "🤖", role: "AI Engineer", impact: "High-quality content produces better RAG retrieval and AI outputs" },
        { icon: "⚡", role: "Engineer", impact: "Follow content structure standards when contributing KB files" },
        { icon: "📋", role: "Product", impact: "Content quality impacts AI feature quality and user satisfaction" }
      ],
      related: [
        { file: "curator/quality/readiness-checklist.md", description: "10-question readiness checklist" },
        { file: "curator/quality/content-structure-standards.md", description: "Content structure standards" },
        { file: "curator/quality/frontmatter-specification.md", description: "Frontmatter specification" }
      ]
    },
    "cur-004": {
      id: "cur-004", icon: "📅", title: "Governance Cadence", status: "active",
      description: "Run the governance machine on schedule. Inbox triage, readiness reviews, and periodic audits must happen on a predictable cadence. Governance is not bureaucracy — it is the rhythm that keeps the KB healthy.",
      period: "2026 Q3", owner: "Curator", project: "YiKnowledge",
      keyResults: [
        { text: "Weekly inbox triage: zero items older than 7 days in inbox", progress: 90 },
        { text: "Monthly readiness review: all draft files reviewed within 30 days", progress: 70 },
        { text: "Quarterly archive audit: deprecated files migration paths verified", progress: 100 },
        { text: "Governance metrics dashboard updated weekly with KB health indicators", progress: 50 }
      ],
      cascade: [
        { icon: "⚡", role: "Engineer", impact: "Respond to triage requests; participate in readiness reviews" },
        { icon: "🧭", role: "Leader", impact: "Ensure governance cadence is resourced; review audit results" },
        { icon: "🏢", role: "Executive", impact: "Governance health is a key input to operational excellence" }
      ],
      related: [
        { file: "curator/governance/inbox-triage-process.md", description: "Inbox triage process" },
        { file: "curator/governance/readiness-review-process.md", description: "Readiness review process" },
        { file: "curator/governance/quarterly-audit-checklist.md", description: "Quarterly audit checklist" }
      ]
    }
  }
};

const roleName = computed(() => roleNames[props.roleId] || props.roleId);
const goal = computed(() => allGoals[props.roleId]?.[props.goalId] || null);

const relatedMetricsMap: Record<string, Array<{ id: string; icon: string; name: string; desc: string }>> = {
  "exec-001": [{ id: "exec-m01", icon: "👥", name: "Yi Product Suite DAU", desc: "Daily active users across YiAi, YiVad, and YiPet" }, { id: "exec-m02", icon: "🏭", name: "Business Line Adoption", desc: "Number of business lines actively using YiAi" }, { id: "exec-m06", icon: "🎯", name: "Strategic Alignment", desc: "Team goals tracing to company-level OKRs" }],
  "exec-002": [{ id: "exec-m03", icon: "⚡", name: "AI Task Automation Rate", desc: "Routine tasks handled by AI agents without human intervention" }],
  "exec-003": [{ id: "sre-m01", icon: "📡", name: "API Availability", desc: "YiAi API uptime — SLO: 99.5%" }, { id: "sre-m02", icon: "🐌", name: "P99 Latency (non-LLM)", desc: "99th percentile response time for non-LLM endpoints" }],
  "exec-004": [{ id: "exec-m04", icon: "📚", name: "KB Coverage", desc: "YiKnowledge file count with complete frontmatter" }, { id: "exec-m05", icon: "😊", name: "Org Health Score", desc: "Composite score: onboarding, freshness, satisfaction" }],
  "prod-001": [{ id: "prod-m01", icon: "⭐", name: "North Star Metric", desc: "Weekly active users completing AI-assisted tasks" }, { id: "prod-m02", icon: "😊", name: "Happiness (CSAT)", desc: "Customer satisfaction score for AI-assisted tasks" }, { id: "prod-m06", icon: "⏱️", name: "Time-to-Value", desc: "Time from first use to first successful AI-assisted task" }],
  "prod-002": [{ id: "eng-m06", icon: "📚", name: "KB Contributions", desc: "New knowledge files contributed by engineers per month" }],
  "prod-003": [{ id: "prod-m04", icon: "🔄", name: "User Retention (D30)", desc: "Users returning within 30 days of first use" }],
  "prod-004": [{ id: "aier-m02", icon: "✅", name: "Agent Task Completion", desc: "Agent tasks completing successfully" }, { id: "aier-m07", icon: "📊", name: "Benchmark Pass Rate", desc: "YiAi-specific benchmark tests passing" }],
  "prod-005": [{ id: "prod-m03", icon: "📈", name: "Feature Adoption Rate", desc: "Users who tried a new feature within 30 days" }, { id: "prod-m07", icon: "📋", name: "NPS Score", desc: "Would users recommend Yi products to colleagues?" }],
  "lead-001": [{ id: "lead-m01", icon: "🏗️", name: "Architecture Maturity", desc: "Current architecture maturity level across all projects" }, { id: "lead-m02", icon: "🚀", name: "DORA Elite Benchmark", desc: "Composite DORA score across all four metrics" }, { id: "lead-m06", icon: "📝", name: "ADR Coverage", desc: "Significant technical decisions with ADRs" }],
  "lead-002": [{ id: "lead-m03", icon: "💰", name: "Cost per AI Task", desc: "Average LLM API cost per completed agent task" }],
  "lead-003": [{ id: "lead-m07", icon: "🧪", name: "Test Coverage", desc: "Average test coverage across all three projects" }],
  "lead-004": [{ id: "lead-m03", icon: "💰", name: "Cost per AI Task", desc: "Average LLM API cost per completed agent task" }],
  "lead-005": [{ id: "lead-m05", icon: "🛡️", name: "CVE Resolution Time", desc: "Median time from critical CVE disclosure to remediation" }],
  "eng-001": [{ id: "eng-m01", icon: "🚀", name: "Deployment Frequency", desc: "Deployments per week per project" }, { id: "eng-m02", icon: "⏱️", name: "Lead Time for Changes", desc: "Median time from commit to production" }, { id: "prod-m05", icon: "🚀", name: "Deployment Frequency", desc: "How often each project deploys to production" }, { id: "prod-m08", icon: "🔧", name: "Change Failure Rate", desc: "Deployments causing incidents or rollback" }],
  "eng-002": [{ id: "eng-m03", icon: "🔧", name: "Change Failure Rate", desc: "Deployments causing incidents or rollback" }, { id: "eng-m04", icon: "👀", name: "Code Review Turnaround", desc: "Median time from PR open to first review" }, { id: "eng-m05", icon: "✅", name: "Lint Pass Rate", desc: "Commits passing pre-commit lint + type-check" }],
  "eng-003": [{ id: "eng-m06", icon: "📚", name: "KB Contributions", desc: "New knowledge files contributed by engineers per month" }],
  "eng-004": [{ id: "eng-m07", icon: "🌱", name: "Developer Onboarding Time", desc: "Days until new engineer is productive" }],
  "eng-005": [{ id: "lead-m04", icon: "🧹", name: "Tech Debt Ratio", desc: "Acknowledged tech debt items vs. resolved items" }],
  "sre-001": [{ id: "sre-m01", icon: "📡", name: "API Availability", desc: "YiAi API uptime — SLO: 99.5%" }, { id: "sre-m02", icon: "🐌", name: "P99 Latency (non-LLM)", desc: "99th percentile response time for non-LLM endpoints" }, { id: "sre-m03", icon: "🎫", name: "Error Budget Remaining", desc: "Error budget remaining this month" }],
  "sre-002": [{ id: "sre-m04", icon: "🔔", name: "MTTD", desc: "Mean time from incident start to detection" }, { id: "sre-m05", icon: "🔧", name: "MTTR", desc: "Mean time from detection to resolution" }],
  "sre-003": [{ id: "sre-m06", icon: "📊", name: "Alert Coverage", desc: "SLO breaches alerting within 2 minutes" }],
  "sre-004": [{ id: "sre-m07", icon: "✅", name: "Deploy Success Rate", desc: "Deployments without rollback or hotfix" }],
  "aier-001": [{ id: "aier-m01", icon: "🔍", name: "RAG Relevance Score", desc: "Hybrid retrieval relevance against 100+ test queries" }, { id: "aier-m04", icon: "📎", name: "Citation Accuracy", desc: "Inline citations pointing to correct source" }],
  "aier-002": [{ id: "aier-m02", icon: "✅", name: "Agent Task Completion", desc: "Agent tasks completing successfully" }, { id: "aier-m03", icon: "🔄", name: "Model Fallback Rate", desc: "Agent turns where primary model stalls" }],
  "aier-003": [{ id: "aier-m05", icon: "💰", name: "Cost per Quality Point", desc: "LLM API cost divided by task quality score" }, { id: "aier-m07", icon: "📊", name: "Benchmark Pass Rate", desc: "YiAi-specific benchmark tests passing" }],
  "aier-004": [{ id: "aier-m08", icon: "🚀", name: "AI Feature Time-to-Ship", desc: "Median time from AI feature request to production" }],
  "aier-005": [{ id: "aier-m06", icon: "🧪", name: "Prompt A/B Win Rate", desc: "Prompt changes winning in A/B tests" }],
  "cur-001": [{ id: "cur-m01", icon: "📄", name: "File Count", desc: "Total verified knowledge files with complete frontmatter" }, { id: "cur-m06", icon: "👻", name: "Orphan Content", desc: "Files without valid related links or role home" }],
  "cur-002": [{ id: "cur-m03", icon: "🔄", name: "Freshness Score", desc: "Files with last_verified within review_cycle" }],
  "cur-003": [{ id: "cur-m02", icon: "📋", name: "Frontmatter Compliance", desc: "Files with complete frontmatter" }, { id: "cur-m04", icon: "✅", name: "Readiness Pass Rate", desc: "Stable files passing the readiness checklist" }],
  "cur-004": [{ id: "cur-m05", icon: "📥", name: "Inbox Age", desc: "Age of oldest unclassified item in inbox" }]
};

const goalMetrics = computed(() => {
  if (!goal.value) return [];
  return relatedMetricsMap[goal.value.id] || [];
});

function statusTagType(status: string) {
  return status === "active" ? "success" : status === "planned" ? "warning" : "info";
}
function projectTagType(project: string) {
  return project === "YiAi" ? "primary" : project === "YiVad" ? "success" : "warning";
}

function roleIdByName(name: string): string {
  const map: Record<string, string> = {
    "Executive": "executiver", "Product": "producter", "Leader": "leader",
    "Engineer": "engineer", "SRE": "srer", "AI Engineer": "aier", "Curator": "curator"
  };
  return map[name] || "executiver";
}
</script>

<style scoped lang="scss">
.goal-detail {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; padding: 24px; overflow: auto;
  background: var(--el-bg-color-page); max-width: 900px;
}
.goal-detail__breadcrumb { margin-bottom: 16px; }
.goal-detail__header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.goal-detail__header-left {
  display: flex; align-items: center; gap: 12px;
  h1 { margin: 0; font-size: 22px; }
}
.goal-detail__meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 4px; }
.goal-detail__meta-item { display: flex; flex-direction: column; gap: 2px; }
.goal-detail__meta-label { font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; }
.goal-detail__meta-value { font-size: 13px; color: var(--el-text-color-regular); }
.goal-detail__meta-value code { font-family: monospace; font-size: 12px; background: var(--el-fill-color-light); padding: 1px 6px; border-radius: 3px; }

.goal-detail__section {
  h2 { margin: 0 0 10px; font-size: 16px; }
}
.goal-detail__desc { margin: 0; font-size: 13px; line-height: 1.8; color: var(--el-text-color-regular); }

.goal-detail__krs { display: flex; flex-direction: column; gap: 12px; }
.goal-detail__kr {
  padding: 14px; background: var(--el-fill-color-light); border-radius: 8px;
  border-left: 3px solid var(--el-color-primary);
}
.goal-detail__kr-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.goal-detail__kr-num { font-weight: 700; font-size: 13px; color: var(--el-color-primary); font-family: monospace; }
.goal-detail__kr-progress { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); }
.goal-detail__kr-text { margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: var(--el-text-color-regular); }

.goal-detail__related { display: flex; flex-direction: column; gap: 8px; }
.goal-detail__related-item {
  display: flex; gap: 10px; padding: 10px 14px; background: var(--el-fill-color-light);
  border-radius: 8px; font-size: 13px;
}
.goal-detail__related-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.goal-detail__related-item--clickable { cursor: pointer; transition: box-shadow .2s, border-color .2s; &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 6px rgba(0,0,0,.06); } }
.goal-detail__related-empty { font-size: 13px; color: var(--el-text-color-placeholder); font-style: italic; padding: 8px 0; }
.goal-detail__related-file { font-weight: 600; font-family: monospace; font-size: 12px; color: var(--el-color-primary); display: block; }
.goal-detail__related-desc { font-size: 12px; color: var(--el-text-color-secondary); }

.goal-detail__cascade-desc { margin: 0 0 10px; font-size: 13px; color: var(--el-text-color-secondary); }
.goal-detail__cascade-flow { display: flex; align-items: center; flex-wrap: wrap; gap: 0; }
.goal-detail__cascade-item { display: flex; align-items: center; }
.goal-detail__cascade-arrow { margin: 0 10px; font-size: 18px; color: var(--el-color-primary); font-weight: 700; }
.goal-detail__cascade-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 18px; background: var(--el-fill-color-light); border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter); text-align: center;
  cursor: pointer; transition: box-shadow .2s, border-color .2s;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.08); }
}
.goal-detail__cascade-icon { font-size: 22px; }
.goal-detail__cascade-role { font-weight: 600; font-size: 13px; }
.goal-detail__cascade-impact { font-size: 11px; color: var(--el-text-color-secondary); max-width: 160px; }
</style>