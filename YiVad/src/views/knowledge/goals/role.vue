<template>
  <div class="role-goals">
    <header class="role-goals__header">
      <div class="role-goals__header-left">
        <el-button text @click="$router.push('/goals')">
          <el-icon><ArrowLeft /></el-icon>
          All Goals
        </el-button>
        <h1>{{ role.name }} Goals</h1>
      </div>
      <el-tag type="info" size="small">{{ role.dir }}</el-tag>
    </header>
    <p class="role-goals__desc">{{ role.description }}</p>

    <div class="role-goals__projects">
      <span class="role-goals__projects-label">Projects:</span>
      <el-tag v-for="p in role.projects" :key="p" size="small" :type="projectTagType(p)">{{ p }}</el-tag>
    </div>

    <el-divider />

    <el-table :data="goals" stripe border style="width: 100%" row-key="id" :default-sort="{ prop: 'id', order: 'ascending' }">
      <el-table-column prop="id" label="Goal ID" width="120" sortable>
        <template #default="{ row }">
          <code class="role-goals__table-id">{{ row.id }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="Goal" min-width="240" sortable>
        <template #default="{ row }">
          <div class="role-goals__table-goal">
            <span class="role-goals__table-icon">{{ row.icon }}</span>
            <div>
              <span class="role-goals__table-title">{{ row.title }}</span>
              <p class="role-goals__table-desc">{{ row.description }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="100" sortable>
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="period" label="Period" width="120" sortable />
      <el-table-column prop="owner" label="Owner" width="140" />
      <el-table-column prop="project" label="Project" width="100">
        <template #default="{ row }">
          <el-tag :type="projectTagType(row.project)" size="small">{{ row.project }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Key Results" min-width="300">
        <template #default="{ row }">
          <div class="role-goals__table-krs">
            <div v-for="(kr, i) in row.keyResults" :key="i" class="role-goals__table-kr">
              <span class="role-goals__table-kr-num">KR{{ Number(i) + 1 }}</span>
              <span class="role-goals__table-kr-text">{{ kr.text }}</span>
              <el-progress :percentage="kr.progress" :status="kr.progress >= 100 ? 'success' : undefined" :stroke-width="4" style="width: 60px; min-width: 60px" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Avg" width="70">
        <template #default="{ row }">
          <el-progress :percentage="krAvg(row)" :status="krAvg(row) >= 100 ? 'success' : undefined" :stroke-width="6" :show-text="true" />
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="$router.push(`/goals/${role.id}/goal/${row.id}`)">Details</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-divider />

    <div class="role-goals__list">
      <el-card v-for="goal in goals" :key="goal.id" class="role-goals__card" shadow="hover">
        <div class="role-goals__card-head">
          <div class="role-goals__card-head-left">
            <span class="role-goals__card-icon">{{ goal.icon }}</span>
            <div>
              <h2 class="role-goals__card-title">{{ goal.title }}</h2>
              <span class="role-goals__card-id">{{ goal.id }}</span>
            </div>
          </div>
          <el-tag :type="statusTagType(goal.status)" size="small">{{ goal.status }}</el-tag>
        </div>

        <p class="role-goals__card-desc">{{ goal.description }}</p>

        <div class="role-goals__card-meta">
          <div class="role-goals__card-meta-item">
            <span class="role-goals__card-meta-label">Period:</span>
            <span class="role-goals__card-meta-value">{{ goal.period }}</span>
          </div>
          <div class="role-goals__card-meta-item">
            <span class="role-goals__card-meta-label">Owner:</span>
            <span class="role-goals__card-meta-value">{{ goal.owner }}</span>
          </div>
          <div class="role-goals__card-meta-item">
            <span class="role-goals__card-meta-label">Project:</span>
            <el-tag :type="projectTagType(goal.project)" size="small">{{ goal.project }}</el-tag>
          </div>
        </div>

        <el-divider style="margin: 10px 0" />

        <div class="role-goals__card-krs">
          <span class="role-goals__card-krs-label">Key Results ({{ goal.keyResults.length }}):</span>
          <div class="role-goals__card-krs-list">
            <div v-for="(kr, i) in goal.keyResults" :key="i" class="role-goals__kr">
              <span class="role-goals__kr-num">KR{{ i + 1 }}</span>
              <span class="role-goals__kr-text">{{ kr.text }}</span>
              <el-progress :percentage="kr.progress" :status="kr.progress >= 100 ? 'success' : undefined" :stroke-width="6" style="min-width: 80px" />
            </div>
          </div>
        </div>

        <div class="role-goals__card-action">
          <el-button size="small" @click="$router.push(`/goals/${role.id}/goal/${goal.id}`)">View Details</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="roleGoals">
import { ArrowLeft } from "@element-plus/icons-vue";

const props = defineProps<{ roleId: string }>();

const rolesData: Record<string, {
  id: string; name: string; icon: string; dir: string;
  description: string; projects: string[];
}> = {
  executiver: {
    id: "executiver", name: "Executive", icon: "🏢", dir: "executiver/",
    description: "Org-level objectives that cascade into team goals. Own the annual and quarterly OKR cycle for the Yi family of products.",
    projects: ["YiAi", "YiVad", "YiPet"]
  },
  producter: {
    id: "producter", name: "Product", icon: "📋", dir: "producter/",
    description: "Product goals that translate business strategy into measurable outcomes. Own the product roadmap and success metrics.",
    projects: ["YiAi", "YiVad", "YiPet"]
  },
  leader: {
    id: "leader", name: "Leader", icon: "🧭", dir: "leader/",
    description: "Technical direction goals. Every architecture decision and tech selection is a bet on a future state.",
    projects: ["YiAi", "YiVad", "YiPet"]
  },
  engineer: {
    id: "engineer", name: "Engineer", icon: "⚡", dir: "engineer/",
    description: "Delivery goals focused on velocity, quality, and knowledge sharing across the three projects.",
    projects: ["YiAi", "YiVad", "YiPet"]
  },
  srer: {
    id: "srer", name: "SRE", icon: "🔧", dir: "srer/",
    description: "Reliability goals for YiAi (the backend serving both YiVad and YiPet).",
    projects: ["YiAi"]
  },
  aier: {
    id: "aier", name: "AI Engineer", icon: "🤖", dir: "aier/",
    description: "AI capability goals across all three projects — RAG quality, agent reliability, model evaluation.",
    projects: ["YiAi", "YiVad", "YiPet"]
  },
  curator: {
    id: "curator", name: "Curator", icon: "📦", dir: "curator/",
    description: "Knowledge base health goals. Maintain the KB that feeds all projects' AI and human workflows.",
    projects: ["YiAi", "YiVad", "YiPet"]
  }
};

const goalsData: Record<string, Array<{
  id: string; icon: string; title: string; status: string;
  description: string; period: string; owner: string; project: string;
  keyResults: Array<{ text: string; progress: number }>;
}>> = {
  executiver: [
    {
      id: "exec-001", icon: "📈", title: "Yi Product Suite Growth",
      status: "active", description: "Grow the Yi product suite (YiAi + YiVad + YiPet) from internal tools to a self-serve platform. Target: YiAi as the AI backend for 3+ business lines, YiVad as the admin console for all internal operations, YiPet as the daily driver for 50+ knowledge workers.",
      period: "2026 H2", owner: "CEO", project: "YiAi",
      keyResults: [
        { text: "YiAi serves 3+ business lines with independent tenant isolation", progress: 67 },
        { text: "YiVad becomes the single admin console for all internal operations", progress: 80 },
        { text: "YiPet reaches 50+ daily active users across departments", progress: 45 },
        { text: "YiKnowledge reaches 500+ verified knowledge files with 90% freshness", progress: 82 }
      ]
    },
    {
      id: "exec-002", icon: "🤖", title: "AI-First Transformation",
      status: "active", description: "Position AI as the primary interface for all internal tools. The BRD agent, RAG system, and aiChat agent mode should handle 70% of routine operational tasks without human intervention.",
      period: "2026 Q3-Q4", owner: "CTO", project: "YiAi",
      keyResults: [
        { text: "BRD agent autonomously generates 80% of BRD first drafts from voice/text input", progress: 60 },
        { text: "aiChat agent mode completes 70% of CRUD tasks without human intervention", progress: 55 },
        { text: "RAG retrieval relevance score > 0.85 across all knowledge domains", progress: 72 },
        { text: "Model cost per task reduced by 30% through multi-provider routing", progress: 40 }
      ]
    },
    {
      id: "exec-003", icon: "⚙️", title: "Operational Excellence",
      status: "active", description: "Establish operational baselines for the Yi product suite. Every project must have defined SLOs, monitored dashboards, and documented incident response procedures.",
      period: "2026 Q3", owner: "VP Engineering", project: "YiVad",
      keyResults: [
        { text: "YiAi uptime SLO defined and monitored (target: 99.5%)", progress: 85 },
        { text: "YiVad build pipeline: type-check + lint pass on every commit", progress: 100 },
        { text: "YiPet extension: automated E2E test coverage for core user flows", progress: 30 },
        { text: "All 3 projects have documented incident response runbooks", progress: 50 }
      ]
    },
    {
      id: "exec-004", icon: "🌱", title: "Talent & Culture",
      status: "active", description: "Build a learning culture where knowledge is captured, shared, and maintained. The YiKnowledge base is the single source of truth for all project decisions and patterns.",
      period: "2026 H2", owner: "CTO", project: "YiVad",
      keyResults: [
        { text: "Every engineer contributes at least 1 knowledge file per sprint", progress: 70 },
        { text: "YiKnowledge frontmatter compliance > 95% across all files", progress: 88 },
        { text: "Onboarding time for new engineers reduced from 4 weeks to 2 weeks", progress: 50 },
        { text: "Quarterly knowledge audit completed with < 5% stale files", progress: 100 }
      ]
    }
  ],
  producter: [
    {
      id: "prod-001", icon: "💬", title: "YiAi Chat Experience",
      status: "active", description: "Make YiAi's chat interface (aiChat) the primary interaction model for all knowledge work. The agent mode should handle complex multi-turn tasks with confirmation gates for safety.",
      period: "2026 Q3", owner: "PM YiAi", project: "YiAi",
      keyResults: [
        { text: "aiChat agent mode task completion rate > 70% for CRUD operations", progress: 55 },
        { text: "Confirmation UX: user approves/rejects tool calls in < 3 seconds", progress: 90 },
        { text: "Chat-based confirmation answers (可以/不要) adoption > 50%", progress: 75 },
        { text: "User satisfaction score > 4.0/5.0 for agent-assisted tasks", progress: 60 }
      ]
    },
    {
      id: "prod-002", icon: "🖥️", title: "YiVad Admin Maturity",
      status: "active", description: "YiVad evolves from a basic admin panel to a comprehensive management console. Every role in the pipeline should have dedicated views for their goals, metrics, and workflows.",
      period: "2026 Q3-Q4", owner: "PM YiVad", project: "YiVad",
      keyResults: [
        { text: "7 role-specific goal and metric views implemented", progress: 40 },
        { text: "ProTable-driven CRUD pages for all YiKnowledge collections", progress: 85 },
        { text: "Knowledge base dashboard with freshness tracking and stale alerts", progress: 70 },
        { text: "Admin console used by all 5 pipeline roles weekly", progress: 50 }
      ]
    },
    {
      id: "prod-003", icon: "🧩", title: "YiPet Extension Adoption",
      status: "active", description: "YiPet becomes the daily AI companion for knowledge workers. The extension should reduce context-switching and make AI assistance available in any browser tab.",
      period: "2026 Q3-Q4", owner: "PM YiPet", project: "YiPet",
      keyResults: [
        { text: "50+ DAU with > 3 chat sessions per user per day", progress: 45 },
        { text: "Content script injection works on 10+ internal web platforms", progress: 70 },
        { text: "Chat window response time < 2s for first token", progress: 80 },
        { text: "Extension rating > 4.5 stars in Chrome Web Store", progress: 0 }
      ]
    },
    {
      id: "prod-004", icon: "📝", title: "BRD Agent Quality",
      status: "active", description: "The BRD agent must produce business requirement documents that are actionable, complete, and require minimal human editing. Target: 80% acceptance rate on first draft.",
      period: "2026 Q3", owner: "PM YiAi", project: "YiAi",
      keyResults: [
        { text: "BRD first-draft acceptance rate > 80% (no major structural edits)", progress: 65 },
        { text: "Average BRD generation time < 5 minutes from voice/text input", progress: 70 },
        { text: "BRD completeness score > 90% against template checklist", progress: 75 },
        { text: "3+ business lines actively using BRD agent for requirements", progress: 50 }
      ]
    },
    {
      id: "prod-005", icon: "🔗", title: "Cross-Project Integration",
      status: "active", description: "YiAi, YiVad, and YiPet must feel like one product suite. Shared design language, consistent API contracts, and unified user experience across all touchpoints.",
      period: "2026 H2", owner: "PM Lead", project: "YiVad",
      keyResults: [
        { text: "Unified RPC envelope contract documented and enforced across all projects", progress: 100 },
        { text: "Shared UI component library for YiVad and YiPet (where applicable)", progress: 20 },
        { text: "Single sign-on and permission model shared across all 3 projects", progress: 40 },
        { text: "Cross-project user journey: YiPet → YiAi → YiVad end-to-end < 3 clicks", progress: 60 }
      ]
    }
  ],
  leader: [
    {
      id: "lead-001", icon: "🏗️", title: "Architecture Maturity L4",
      status: "active", description: "Advance architecture maturity from L3 (Defined) to L4 (Measured). Key gap: OpenAPI schema auto-generation and architecture fitness function auto-validation across all three projects.",
      period: "2026 Q3-Q4", owner: "Tech Lead", project: "YiAi",
      keyResults: [
        { text: "YiAi: OpenAPI schema auto-generated from FastAPI routes", progress: 30 },
        { text: "YiVad: TypeScript types generated from OpenAPI schema", progress: 0 },
        { text: "Architecture fitness functions run in CI for contract compliance", progress: 0 },
        { text: "All ADRs updated with current status and consequences", progress: 85 }
      ]
    },
    {
      id: "lead-002", icon: "🔀", title: "Multi-Provider LLM Strategy",
      status: "active", description: "Implement multi-provider LLM routing for YiAi with cost optimization and fallback. The agent loop should escalate from cheaper/faster models to stronger ones on stall.",
      period: "2026 Q3", owner: "Tech Lead", project: "YiAi",
      keyResults: [
        { text: "3+ LLM providers integrated with unified interface", progress: 67 },
        { text: "Model escalation (stall → stronger) implemented and verified", progress: 100 },
        { text: "Cost per task reduced by 30% through intelligent routing", progress: 40 },
        { text: "Provider fallback: zero failed requests due to single-provider outage", progress: 90 }
      ]
    },
    {
      id: "lead-003", icon: "🧪", title: "Test Coverage Baseline",
      status: "active", description: "Establish test infrastructure and coverage baselines for all three projects. YiVad and YiPet currently lack test frameworks; YiAi has partial pytest coverage.",
      period: "2026 Q3-Q4", owner: "Tech Lead", project: "YiVad",
      keyResults: [
        { text: "YiVad: Vitest introduced with > 60% coverage on utils and stores", progress: 25 },
        { text: "YiPet: Vitest test suite for API client and shared utilities", progress: 10 },
        { text: "YiAi: pytest coverage > 70% on domain and service layers", progress: 50 },
        { text: "All 3 projects: CI pipeline blocks merge on test failure", progress: 33 }
      ]
    },
    {
      id: "lead-004", icon: "💰", title: "Cost Efficiency",
      status: "active", description: "Track and optimize infrastructure and API costs across all projects. LLM API costs are the primary variable cost; establish budgets and monitoring.",
      period: "2026 H2", owner: "Tech Lead", project: "YiAi",
      keyResults: [
        { text: "LLM API cost dashboard with per-model and per-task breakdown", progress: 60 },
        { text: "Monthly LLM cost within 80% of budget with proactive alerts", progress: 50 },
        { text: "YiAi infrastructure cost < $500/month for current load", progress: 85 },
        { text: "Cost attribution: each project's LLM usage tracked and billed separately", progress: 30 }
      ]
    },
    {
      id: "lead-005", icon: "🛡️", title: "Security Posture",
      status: "active", description: "Establish security baseline across all projects. Dependency audits, supply chain hardening, and access control review.",
      period: "2026 Q3-Q4", owner: "Tech Lead", project: "YiVad",
      keyResults: [
        { text: "Quarterly dependency audit with critical CVE remediation < 7 days", progress: 75 },
        { text: "YiVad: v-auth directive coverage on all sensitive operations", progress: 90 },
        { text: "YiAi: API rate limiting and input validation on all public endpoints", progress: 60 },
        { text: "YiPet: CSP headers and extension permissions minimized to least-privilege", progress: 80 }
      ]
    }
  ],
  engineer: [
    {
      id: "eng-001", icon: "🚀", title: "Delivery Velocity",
      status: "active", description: "Maintain consistent delivery velocity across all three projects. Measure DORA metrics (deployment frequency, lead time, change failure rate, MTTR) and improve quarter over quarter.",
      period: "2026 Q3", owner: "Engineering Lead", project: "YiAi",
      keyResults: [
        { text: "YiAi: deploy frequency > 3x/week, lead time < 2 days", progress: 70 },
        { text: "YiVad: deploy frequency > 2x/week, lead time < 1 day", progress: 85 },
        { text: "YiPet: extension release cycle < 2 weeks per version", progress: 60 },
        { text: "Change failure rate < 10% across all projects", progress: 80 }
      ]
    },
    {
      id: "eng-002", icon: "✅", title: "Code Quality",
      status: "active", description: "Enforce consistent code quality standards. TypeScript strict mode, lint rules, and code review expectations must be uniform across projects.",
      period: "2026 Q3", owner: "Engineering Lead", project: "YiVad",
      keyResults: [
        { text: "TypeScript strict mode enabled on all 3 projects", progress: 100 },
        { text: "0 lint errors on main branch for all projects", progress: 90 },
        { text: "Code review turnaround < 4 hours during business hours", progress: 75 },
        { text: "Pre-commit hooks: lint + type-check pass rate > 95%", progress: 85 }
      ]
    },
    {
      id: "eng-003", icon: "📚", title: "Knowledge Sharing",
      status: "active", description: "Every significant design decision, bug fix, and lesson learned is captured in YiKnowledge. Engineers contribute to the KB as part of their regular workflow.",
      period: "2026 H2", owner: "Engineering Lead", project: "YiAi",
      keyResults: [
        { text: "YiKnowledge: 10+ new engineer-contributed files per month", progress: 80 },
        { text: "Postmortem for every P1+ incident within 48 hours", progress: 100 },
        { text: "Architecture decision records for all non-trivial technical choices", progress: 70 },
        { text: "Weekly knowledge-sharing session attendance > 80%", progress: 60 }
      ]
    },
    {
      id: "eng-004", icon: "🛠️", title: "Developer Experience",
      status: "active", description: "Reduce friction in the development workflow. Fast builds, clear error messages, and consistent tooling across all projects.",
      period: "2026 Q3-Q4", owner: "Engineering Lead", project: "YiVad",
      keyResults: [
        { text: "YiVad: Rsbuild dev server start < 3 seconds, HMR < 200ms", progress: 90 },
        { text: "YiPet: multi-entry build time < 30 seconds (all targets)", progress: 75 },
        { text: "YiAi: uvicorn reload on file change < 2 seconds", progress: 85 },
        { text: "Developer setup guide: new engineer productive in < 1 day", progress: 60 }
      ]
    },
    {
      id: "eng-005", icon: "🧹", title: "Technical Debt Reduction",
      status: "active", description: "Actively reduce technical debt. YiVad's 18 pre-existing type errors must be resolved. YiPet's dependency warnings must be addressed.",
      period: "2026 Q3", owner: "Engineering Lead", project: "YiVad",
      keyResults: [
        { text: "YiVad: resolve 18 pre-existing vue-tsc errors to zero", progress: 15 },
        { text: "YiPet: npm audit critical/high severity issues to zero", progress: 50 },
        { text: "YiAi: remove deprecated API endpoints with migration path", progress: 40 },
        { text: "Quarterly tech debt review added to sprint planning cadence", progress: 100 }
      ]
    }
  ],
  srer: [
    {
      id: "sre-001", icon: "🎯", title: "SLO Compliance",
      status: "active", description: "Define and monitor Service Level Objectives for YiAi. The backend serves both YiVad and YiPet, so availability directly impacts both frontends.",
      period: "2026 Q3", owner: "SRE Lead", project: "YiAi",
      keyResults: [
        { text: "YiAi API availability > 99.5% (measured monthly)", progress: 95 },
        { text: "P99 latency < 500ms for non-LLM endpoints", progress: 85 },
        { text: "P99 latency < 5s for LLM streaming endpoints", progress: 80 },
        { text: "Error budget tracking dashboard live with weekly review", progress: 60 }
      ]
    },
    {
      id: "sre-002", icon: "🚨", title: "Incident Response Maturity",
      status: "active", description: "Build incident response muscle. Every incident gets a blameless postmortem, every postmortem produces action items, and action items are tracked to completion.",
      period: "2026 H2", owner: "SRE Lead", project: "YiAi",
      keyResults: [
        { text: "MTTD (Mean Time to Detect) < 5 minutes for critical incidents", progress: 70 },
        { text: "MTTR (Mean Time to Resolve) < 30 minutes for P1 incidents", progress: 65 },
        { text: "100% of P1+ incidents have postmortems within 48 hours", progress: 100 },
        { text: "Postmortem action items: 90% completed within stated timeline", progress: 80 }
      ]
    },
    {
      id: "sre-003", icon: "📊", title: "Observability Coverage",
      status: "active", description: "Achieve comprehensive observability across the YiAi stack. Metrics, logs, and traces for every API endpoint, database query, and LLM call.",
      period: "2026 Q3-Q4", owner: "SRE Lead", project: "YiAi",
      keyResults: [
        { text: "All YiAi API endpoints have request count, latency, and error rate dashboards", progress: 70 },
        { text: "MongoDB query performance monitoring with slow-query alerts", progress: 50 },
        { text: "LLM call metrics: token usage, cost, latency per model and per task", progress: 60 },
        { text: "Alert coverage: all SLO breaches trigger notification within 2 minutes", progress: 75 }
      ]
    },
    {
      id: "sre-004", icon: "🔄", title: "Release Safety",
      status: "active", description: "Make releases boring. Every deploy should be predictable, reversible, and verified. Zero-downtime deploys for YiAi, staged rollouts for YiPet extension.",
      period: "2026 Q3", owner: "SRE Lead", project: "YiAi",
      keyResults: [
        { text: "YiAi: zero-downtime deploys with health check verification", progress: 80 },
        { text: "Rollback capability: any deploy can be reversed in < 5 minutes", progress: 90 },
        { text: "YiPet: staged rollout (5% → 25% → 100%) with automated crash monitoring", progress: 30 },
        { text: "Deploy checklist documented and followed for every release", progress: 100 }
      ]
    }
  ],
  aier: [
    {
      id: "aier-001", icon: "🔍", title: "RAG Retrieval Quality",
      status: "active", description: "The RAG system is the foundation of AI-powered knowledge work. Retrieval quality directly impacts every downstream use case — chat, BRD generation, code review.",
      period: "2026 Q3", owner: "AI Engineer", project: "YiAi",
      keyResults: [
        { text: "Hybrid retrieval (semantic + keyword) relevance score > 0.85", progress: 72 },
        { text: "RAG evaluation benchmark: 100+ test queries across all knowledge domains", progress: 60 },
        { text: "Chunking strategy optimized per content type (code, markdown, frontmatter)", progress: 45 },
        { text: "Inline citation accuracy: > 90% of citations point to correct source", progress: 78 }
      ]
    },
    {
      id: "aier-002", icon: "🤖", title: "Agent Task Completion",
      status: "active", description: "The agent loop (Pi-inspired) must reliably complete multi-step tasks. Focus on tool-use reliability, confirmation UX, and recovery from stalls.",
      period: "2026 Q3", owner: "AI Engineer", project: "YiAi",
      keyResults: [
        { text: "Agent task completion rate > 70% for CRUD operations (menus, knowledge files)", progress: 55 },
        { text: "Agent stall recovery: model escalation succeeds in > 80% of stalls", progress: 70 },
        { text: "Tool confirmation rate: < 10% false positives (approving wrong tool)", progress: 85 },
        { text: "Agent max_turns: 80% of tasks complete within 5 turns", progress: 60 }
      ]
    },
    {
      id: "aier-003", icon: "📏", title: "Model Evaluation Cadence",
      status: "active", description: "Regular evaluation of LLM models against project-specific benchmarks. YiAi's tasks span code generation, document writing, and data operations — each needs targeted evaluation.",
      period: "2026 H2", owner: "AI Engineer", project: "YiAi",
      keyResults: [
        { text: "Monthly model evaluation run against YiAi-specific benchmark suite", progress: 50 },
        { text: "Benchmark covers: CRUD accuracy, RAG relevance, BRD completeness, code correctness", progress: 65 },
        { text: "Model selection decision documented with evaluation data (not intuition)", progress: 80 },
        { text: "Cost-per-quality-point metric defined and tracked per model", progress: 30 }
      ]
    },
    {
      id: "aier-004", icon: "⚡", title: "AI Feature Velocity",
      status: "active", description: "Deliver AI features that users actually want. The aiChat agent mode, BRD agent, and RAG chat are the current flagship features.",
      period: "2026 Q3", owner: "AI Engineer", project: "YiVad",
      keyResults: [
        { text: "aiChat agent mode: live turn-progress, confirmation, resume-by-session shipped", progress: 100 },
        { text: "BRD agent: voice input → structured BRD end-to-end shipped", progress: 85 },
        { text: "RAG chat: per-file agent mode with tool lifecycle shipped", progress: 100 },
        { text: "User-reported AI feature requests: median time-to-ship < 2 weeks", progress: 55 }
      ]
    },
    {
      id: "aier-005", icon: "📝", title: "Prompt Engineering Standards",
      status: "active", description: "System prompts are the UI for AI behavior. Establish prompt versioning, evaluation, and improvement cadence. Prompts are code — treat them as such.",
      period: "2026 Q3", owner: "AI Engineer", project: "YiAi",
      keyResults: [
        { text: "All system prompts version-controlled with change history", progress: 90 },
        { text: "Prompt evaluation: A/B test framework for prompt changes", progress: 30 },
        { text: "Prompt regression test suite: 50+ test cases across all prompt templates", progress: 45 },
        { text: "Prompt documentation: each prompt has documented intent, constraints, and edge cases", progress: 70 }
      ]
    }
  ],
  curator: [
    {
      id: "cur-001", icon: "📖", title: "KB Coverage",
      status: "active", description: "Ensure every project decision, pattern, and lesson is captured in YiKnowledge. The KB is the single source of truth for all three projects.",
      period: "2026 H2", owner: "Curator", project: "YiAi",
      keyResults: [
        { text: "YiKnowledge: 500+ files with complete frontmatter across 7 roles", progress: 82 },
        { text: "Coverage gaps identified and tracked in tacit-knowledge-backlog.md", progress: 60 },
        { text: "Each project (YiAi/YiVad/YiPet) has architecture + functional-modules + dev-standards docs", progress: 100 },
        { text: "No orphaned content: every file has a role home and related links", progress: 75 }
      ]
    },
    {
      id: "cur-002", icon: "🔄", title: "Freshness Compliance",
      status: "active", description: "Content rots without maintenance. Track review_cycle compliance and proactively flag approaching staleness. The 6-month deprecation rule is automatic.",
      period: "2026 Q3", owner: "Curator", project: "YiVad",
      keyResults: [
        { text: "90% of files have last_verified within their declared review_cycle", progress: 78 },
        { text: "0 files with last_verified > 6 months (auto-deprecation enforced)", progress: 85 },
        { text: "YiVad Knowledge Base dashboard: freshness tracking with 5-month warnings", progress: 70 },
        { text: "Quarterly review: all files with review_cycle: quarterly verified", progress: 100 }
      ]
    },
    {
      id: "cur-003", icon: "✅", title: "Content Quality",
      status: "active", description: "Every knowledge file must pass the 10-question readiness checklist. Content must be actionable, well-structured, and AI-searchable.",
      period: "2026 H2", owner: "Curator", project: "YiKnowledge",
      keyResults: [
        { text: "Readiness checklist pass rate > 90% for all stable files", progress: 75 },
        { text: "Frontmatter completeness: benefit + acceptance_criteria present on all stable files", progress: 82 },
        { text: "Anti-patterns section present in all how-to and pattern files", progress: 65 },
        { text: "User story format (As a/I want to/so that) used consistently in all summaries", progress: 88 }
      ]
    },
    {
      id: "cur-004", icon: "📅", title: "Governance Cadence",
      status: "active", description: "Run the governance machine on schedule. Inbox triage, readiness reviews, and periodic audits must happen on a predictable cadence.",
      period: "2026 Q3", owner: "Curator", project: "YiKnowledge",
      keyResults: [
        { text: "Weekly inbox triage: zero items older than 7 days in inbox", progress: 90 },
        { text: "Monthly readiness review: all draft files reviewed within 30 days", progress: 70 },
        { text: "Quarterly archive audit: deprecated files migration paths verified", progress: 100 },
        { text: "Governance metrics dashboard updated weekly with KB health indicators", progress: 50 }
      ]
    }
  ]
};

const role = rolesData[props.roleId] || rolesData.executiver;
const goals = goalsData[props.roleId] || [];

function krAvg(row: any) {
  const krs = row.keyResults as Array<{ progress: number }> | undefined;
  if (!krs || !krs.length) return 0;
  return Math.round(krs.reduce((s: number, kr: { progress: number }) => s + Number(kr.progress), 0) / krs.length);
}
function statusTagType(status: string) {
  return status === "active" ? "success" : status === "planned" ? "warning" : "info";
}
function projectTagType(project: string) {
  return project === "YiAi" ? "primary" : project === "YiVad" ? "success" : "warning";
}
</script>

<style scoped lang="scss">
.role-goals {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; padding: 24px; overflow: auto;
  background: var(--el-bg-color-page);
}
.role-goals__header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
}
.role-goals__header-left {
  display: flex; align-items: center; gap: 12px;
  h1 { margin: 0; font-size: 22px; }
}
.role-goals__desc { margin: 0 0 10px; font-size: 13px; color: var(--el-text-color-secondary); max-width: 900px; }
.role-goals__projects { display: flex; align-items: center; gap: 8px; }
.role-goals__projects-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); }

.role-goals__list { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.role-goals__card {
  :deep(.el-card__body) { padding: 18px; display: flex; flex-direction: column; }
}
.role-goals__card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.role-goals__card-head-left { display: flex; align-items: flex-start; gap: 10px; }
.role-goals__card-icon { font-size: 24px; margin-top: 2px; }
.role-goals__card-title { margin: 0 0 2px; font-size: 15px; }
.role-goals__card-id { font-size: 11px; font-family: monospace; color: var(--el-text-color-secondary); }
.role-goals__card-desc { margin: 0 0 10px; font-size: 12px; line-height: 1.6; color: var(--el-text-color-secondary); }
.role-goals__card-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 4px; }
.role-goals__card-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; }
.role-goals__card-meta-label { font-weight: 600; color: var(--el-text-color-secondary); }
.role-goals__card-meta-value { color: var(--el-text-color-regular); }

.role-goals__card-krs { display: flex; flex-direction: column; gap: 6px; }
.role-goals__card-krs-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); }
.role-goals__card-krs-list { display: flex; flex-direction: column; gap: 6px; }
.role-goals__kr {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px;
  background: var(--el-fill-color-light); border-radius: 6px; font-size: 12px;
}
.role-goals__kr-num {
  font-weight: 700; font-size: 11px; color: var(--el-color-primary); white-space: nowrap;
  font-family: monospace;
}
.role-goals__kr-text { flex: 1; color: var(--el-text-color-regular); line-height: 1.4; }
.role-goals__card-action { margin-top: 12px; display: flex; justify-content: flex-end; }

// Table styles
.role-goals__table-id { font-family: monospace; font-size: 12px; color: var(--el-color-primary); }
.role-goals__table-goal { display: flex; align-items: flex-start; gap: 8px; }
.role-goals__table-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.role-goals__table-title { font-weight: 600; font-size: 13px; display: block; }
.role-goals__table-desc { margin: 2px 0 0; font-size: 11px; color: var(--el-text-color-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.role-goals__table-krs { display: flex; flex-direction: column; gap: 4px; }
.role-goals__table-kr { display: flex; align-items: center; gap: 6px; font-size: 11px; }
.role-goals__table-kr-num { font-weight: 700; font-family: monospace; color: var(--el-color-primary); white-space: nowrap; font-size: 10px; }
.role-goals__table-kr-text { flex: 1; color: var(--el-text-color-regular); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>