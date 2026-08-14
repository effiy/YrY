export interface FlowItem {
  id: string;
  label: string;
  /** Keywords to match in file paths/names for filtering */
  keywords: string[];
  /** Short description shown on the item detail header */
  description: string;
}

export interface Stage {
  id: string;
  name: string;
  role: string;
  /** Knowledge category key matching useKnowledgeStore categories */
  category: string;
  input: string;
  output: string;
  /** Individual clickable input items */
  inputItems: FlowItem[];
  /** Individual clickable output items */
  outputItems: FlowItem[];
  description: string;
  topics: { label: string; file: string }[];
  boundary: string;
  /** Secondary categories to also scan for this stage (e.g. engineer/lessons/ for operate-learn) */
  secondaryCategories?: string[];
}

export interface DecisionRule {
  question: string;
  role: string;
}

export interface ProjectInfo {
  key: string;
  label: string;
  tagType: "primary" | "success" | "warning";
  /** Path segment to filter knowledge files by project */
  pathSegment: string;
  description: string;
}

export const projects: ProjectInfo[] = [
  {
    key: "all",
    label: "All",
    tagType: "primary",
    pathSegment: "",
    description: "All three Yi-family projects"
  },
  {
    key: "yiai",
    label: "YiAi",
    tagType: "primary",
    pathSegment: "yiai",
    description: "FastAPI backend — AI chat, RAG engine, agent loop"
  },
  {
    key: "yivad",
    label: "YiVad",
    tagType: "success",
    pathSegment: "yivad",
    description: "Vue 3.5 admin dashboard — management UI"
  },
  {
    key: "yipet",
    label: "YiPet",
    tagType: "warning",
    pathSegment: "yipet",
    description: "Chrome MV3 extension — AI companion"
  }
];

export const stages: Stage[] = [
  {
    id: "requirements",
    name: "Requirements",
    role: "producter/",
    category: "producter",
    input: "Business strategy",
    output: "PRDs, user stories, priorities",
    inputItems: [
      { id: "business-strategy", label: "Business strategy", keywords: ["strategy", "business"], description: "Market intelligence, competitive landscape, and org-level goals from executiver/" }
    ],
    outputItems: [
      { id: "prds", label: "PRDs", keywords: ["prd", "brd", "product-requirement"], description: "Product Requirement Documents — what to build, for whom, and how to measure success" },
      { id: "user-stories", label: "user stories", keywords: ["user-story", "story", "jtbd", "kano", "user-research", "story-mapping", "persona"], description: "User stories and JTBD narratives — the user's perspective on feature value" },
      { id: "priorities", label: "priorities", keywords: ["priority", "prioritization", "rice", "ice", "north-star", "okr", "moscow", "metric", "backlog", "goal"], description: "Prioritization frameworks (RICE/ICE) and north-star metric definitions" }
    ],
    description:
      "Define what to build, for whom, and how to measure success — before any code is written.",
    topics: [
      { label: "Frameworks", file: "frameworks/" },
      { label: "Discovery", file: "discovery/prd/" },
      { label: "Delivery", file: "delivery/" },
      { label: "Strategy", file: "strategy/" },
      { label: "Projects", file: "projects/" }
    ],
    boundary:
      "producter defines WHAT feature to build, not HOW to implement it (→ engineer/) or WHICH technology to use (→ leader/)."
  },
  {
    id: "decisions",
    name: "Decisions",
    role: "leader/",
    category: "leader",
    input: "PRDs, requirements",
    output: "ADRs, tech selections, capacity plans",
    inputItems: [
      { id: "prds", label: "PRDs", keywords: ["prd", "brd", "product-requirement"], description: "Product Requirement Documents from producter/ — the feature definitions to make decisions about" },
      { id: "requirements", label: "requirements", keywords: ["requirement", "spec"], description: "Functional and non-functional requirements that constrain technical decisions" }
    ],
    outputItems: [
      { id: "adrs", label: "ADRs", keywords: ["adr", "decision", "architecture-decision"], description: "Architecture Decision Records — Context/Decision/Consequences for every significant technical choice" },
      { id: "tech-selections", label: "tech selections", keywords: ["tech-select", "technology", "stack", "tool", "migration", "maturity", "selection", "debt"], description: "Technology stack evaluations, comparison matrices, and selection rationale" },
      { id: "capacity-plans", label: "capacity plans", keywords: ["capacity", "planning", "finops", "cost"], description: "Capacity planning, FinOps reviews, and infrastructure sizing decisions" }
    ],
    description:
      "Make technical decisions explicit. Every choice is an ADR: Context, Decision, Consequences — why A over B.",
    topics: [
      { label: "Architecture", file: "architecture/" },
      { label: "Decisions (YiAi)", file: "decisions/yiai/" },
      { label: "Decisions (YiVad)", file: "decisions/yivad/" },
      { label: "Decisions (YiPet)", file: "decisions/yipet/" },
      { label: "Capacity", file: "capacity/" },
      { label: "Risk", file: "risk/" },
      { label: "Roadmap", file: "roadmap/" }
    ],
    boundary:
      "leader makes DECISIONS with tradeoffs, not IMPLEMENTATION patterns (→ engineer/architecture/). Decision = why A over B. Pattern = how to implement A."
  },
  {
    id: "design-build",
    name: "Design + Build",
    role: "engineer/",
    category: "engineer",
    input: "ADRs, PRDs",
    output: "Working software",
    inputItems: [
      { id: "adrs", label: "ADRs", keywords: ["adr", "decision", "architecture-decision"], description: "Architecture Decision Records from leader/ — the technical direction to implement" },
      { id: "prds", label: "PRDs", keywords: ["prd", "brd", "product-requirement"], description: "Product Requirement Documents from producter/ — the feature specifications to build" }
    ],
    outputItems: [
      { id: "architecture-patterns", label: "Architecture patterns", keywords: ["architecture", "pattern", "cqrs", "saga", "event-driven", "api-gateway", "bff"], description: "Implementation-level architecture patterns — CQRS, Saga, Event-Driven, API Gateway, BFF" },
      { id: "dev-practices", label: "Dev practices", keywords: ["development", "dev", "dx", "ci-cd", "tooling", "dependency"], description: "Development practices, tooling, DX improvements, and dependency management" },
      { id: "quality-security", label: "Quality & security", keywords: ["quality", "security", "testing", "audit", "hardening", "supply-chain"], description: "Code quality standards, security hardening, testing strategies, and supply-chain audits" },
      { id: "data-reliability", label: "Data & reliability", keywords: ["data", "reliability", "resilience", "idempotency", "backpressure", "cdc", "materialized-view"], description: "Data patterns (migrations, caching, pipelines) and reliability patterns (retry, backpressure, idempotency)" },
      { id: "lessons", label: "Lessons learned", keywords: ["lesson", "win", "failure", "gotcha", "postmortem", "retrospective"], description: "Wins, failures, gotchas, and bugs — field notes from real implementation experience" }
    ],
    description:
      "Turn decisions into working software. Eight subdirectories covering the full BUILD → SHIP cycle.",
    topics: [
      { label: "Architecture", file: "architecture/" },
      { label: "Development", file: "development/" },
      { label: "Quality & Security", file: "quality-security/" },
      { label: "Data", file: "data/" },
      { label: "Reliability", file: "reliability/" },
      { label: "Lessons", file: "lessons/" },
      { label: "Process", file: "process/" },
      { label: "Projects", file: "projects/" }
    ],
    boundary:
      "engineer is the IMPLEMENTATION layer — it does not substitute for leader's decisions. If an architecture-level issue surfaces during implementation → go back to leader/ and write an ADR; don't decide on the side inside engineer/."
  },
  {
    id: "quality-release",
    name: "Ship + Operate",
    role: "srer/ + engineer/lessons/",
    category: "srer",
    secondaryCategories: ["engineer"],
    input: "Working software",
    output: "Reliable systems in production",
    inputItems: [
      { id: "working-software", label: "Working software", keywords: ["implementation", "deployable", "artifact"], description: "Implementation artifacts from engineer/ — code that has passed design and build quality gates" }
    ],
    outputItems: [
      { id: "release-procedures", label: "Release procedures", keywords: ["release", "deploy", "rollback", "canary", "hotfix", "staged-rollout"], description: "Release, rollback, canary, and hotfix procedures — how code reaches production safely" },
      { id: "incident-response", label: "Incident response", keywords: ["incident", "postmortem", "on-call", "oncall", "handover"], description: "Incident response procedures, on-call handover, and blameless postmortem templates" },
      { id: "observability", label: "Observability", keywords: ["observability", "monitoring", "alerting", "dashboard", "slo", "sli"], description: "Monitoring, alerting, dashboards, SLO/SLI definitions, and observability triad" },
      { id: "lessons-learned", label: "Lessons learned", keywords: ["lesson", "win", "failure", "gotcha", "bug"], description: "Operational lessons — wins to replicate, failures to learn from, and gotchas to avoid" }
    ],
    description:
      "Ship safely and keep running. Quality gates, release procedures, observability, incident response, and lessons from wins and failures.",
    topics: [
      { label: "Release", file: "release/" },
      { label: "Incident Response", file: "incident-response/" },
      { label: "Observability", file: "observability/" },
      { label: "Security Audit", file: "quality-security/" },
      { label: "Lessons: Wins", file: "lessons/wins/" },
      { label: "Lessons: Failures", file: "lessons/failures/" },
      { label: "Lessons: Gotchas", file: "lessons/gotchas/" },
      { label: "Lessons: Bugs", file: "lessons/bugs/" }
    ],
    boundary:
      "srer/release/ owns RELEASE PROCESS and coordination; engineer/reliability/ owns the TECHNICAL PATTERNS used for release (canary implementation, feature flags). Process vs. implementation."
  }
];

export interface CrossCuttingLayer {
  id: string;
  category: string;
  icon: string;
  label: string;
  role: string;
  desc: string;
  inputItems: FlowItem[];
  outputItems: FlowItem[];
  boundary: string;
  description: string;
  topics: { label: string; file: string }[];
}

/** Cross-cutting layers shown above/below the pipeline flow */
export const crossCuttingLayers: CrossCuttingLayer[] = [
  {
    id: "business",
    category: "executiver",
    icon: "🏢",
    label: "Business Strategy",
    role: "executiver/",
    desc: "Why this business · Market intelligence · Org goals · Industry trends · Roadmap",
    description:
      "Define the strategic context that drives every downstream decision. Business Strategy provides the market intelligence, competitive landscape, and organizational goals that shape product requirements, technical decisions, and operational priorities. Without a clear business foundation, product and engineering teams operate without direction.",
    boundary:
      "executiver/ sets the WHY and the WHAT at the organizational level — market positioning, strategic goals, and resource allocation. It does not define HOW to build (→ engineer/) or WHICH features to prioritize (→ producter/). Strategy informs; execution decides.",
    inputItems: [],
    outputItems: [
      { id: "market-intel", label: "Market intelligence", keywords: ["market", "competitor", "industry", "trend", "report", "landscape", "analysis"], description: "Market sizing, competitor analysis, industry trends, and strategic intelligence reports that ground every product decision in external reality" },
      { id: "org-strategy", label: "Org strategy", keywords: ["strategy", "roadmap", "vision", "goal", "okr", "mission", "objective"], description: "Organizational vision, strategic roadmaps, OKR frameworks, and goal cascades that align teams around shared outcomes" },
      { id: "reading-list", label: "Reading list", keywords: ["reading", "book", "paper", "article", "leadership", "management"], description: "Curated reading lists for executive development — leadership, strategy, organizational design, and industry-specific knowledge" }
    ],
    topics: [
      { label: "Strategy", file: "strategy/" },
      { label: "Industry", file: "industry/" },
      { label: "Roadmap", file: "roadmap/" },
      { label: "Reading List", file: "reading-list/" }
    ]
  },
  {
    id: "ai",
    category: "aier",
    icon: "🤖",
    label: "AI Enablement",
    role: "aier/",
    desc: "How AI accelerates every stage — foundations, methodology, platform, data, ML, skills",
    description:
      "AI Enablement is the horizontal acceleration layer that amplifies every stage of the pipeline. From foundational theory (transformers, embeddings) to engineering methodology (prompt design, RAG, agents) to platform infrastructure (model serving, inference optimization), this layer ensures AI capability is not a bottleneck but a multiplier across the organization.",
    boundary:
      "aier/ provides AI THEORY, METHODOLOGY, and PLATFORM — the how of AI. It does not own product decisions (→ producter/), technical architecture choices (→ leader/), or implementation patterns (→ engineer/). AI is a tool; what to build with it lives in the vertical stages.",
    inputItems: [],
    outputItems: [
      { id: "ai-foundations", label: "AI foundations", keywords: ["foundation", "transformer", "attention", "embedding", "fine-tune"], description: "Core AI concepts — transformers, attention mechanisms, embeddings, and fine-tuning" },
      { id: "ai-methodology", label: "AI methodology", keywords: ["methodology", "prompt", "agent", "rag", "chain"], description: "AI engineering methods — prompt engineering, agent design, RAG patterns, and evaluation" },
      { id: "ai-platform", label: "AI platform", keywords: ["platform", "llm", "model", "inference", "deploy"], description: "AI platform infrastructure — model serving, inference optimization, and LLM ops" },
      { id: "ai-ml", label: "ML engineering", keywords: ["ml", "machine-learning", "training", "dataset", "eval"], description: "Machine learning engineering — training pipelines, dataset curation, and model evaluation" },
      { id: "ai-data", label: "AI data", keywords: ["data", "pipeline", "vector", "embedding", "index"], description: "AI data infrastructure — vector databases, embedding pipelines, and data preparation" }
    ],
    topics: [
      { label: "Foundations", file: "foundations/" },
      { label: "Methodology", file: "methodology/" },
      { label: "Platform", file: "platform/" },
      { label: "Data", file: "data/" },
      { label: "ML", file: "ml/" }
    ]
  },
  {
    id: "governance",
    category: "curator",
    icon: "📦",
    label: "Knowledge Governance",
    role: "curator/",
    desc: "How the KB itself is maintained — lifecycle, diagrams, templates, archive, governance",
    description:
      "Knowledge Governance ensures the knowledge base itself remains healthy, consistent, and useful over time. It defines the lifecycle of every knowledge artifact — from draft through review to stable or archival — and provides the templates, diagrams, and processes that make knowledge creation repeatable and scalable across all roles.",
    boundary:
      "curator/ owns the STRUCTURE and HEALTH of the knowledge base — lifecycle policies, templates, directory design, and governance rules. It does not own the CONTENT of any specific domain (that belongs to each role's directory). Curator is the librarian; each role is the author.",
    inputItems: [],
    outputItems: [
      { id: "kb-lifecycle", label: "KB lifecycle", keywords: ["lifecycle", "governance", "review", "readiness", "evolve"], description: "Knowledge base lifecycle management — review cycles, readiness checklists, and evolution guides" },
      { id: "kb-templates", label: "KB templates", keywords: ["template", "leaf", "knowledge", "format"], description: "Knowledge base templates — leaf format, frontmatter specs, and writing guidelines" },
      { id: "kb-diagrams", label: "KB diagrams", keywords: ["diagram", "blueprint", "map", "journey", "architecture"], description: "Knowledge base architecture diagrams — directory blueprints, knowledge maps, and user journeys" }
    ],
    topics: [
      { label: "Governance", file: "governance/" },
      { label: "Templates", file: "templates/" },
      { label: "Diagrams", file: "diagrams/" },
      { label: "Archive", file: "archive/" }
    ]
  }
];

export const decisionTree: DecisionRule[] = [
  { question: "Business strategy, market, competitors?", role: "executiver/" },
  { question: "Product requirements, user stories, priorities?", role: "producter/" },
  { question: "Technical decisions, architecture choices, ADRs?", role: "leader/" },
  { question: "Implementation patterns, dev tools, code?", role: "engineer/" },
  { question: "Release procedures, monitoring, incident response?", role: "srer/" },
  { question: "AI/ML-specific theory and practice?", role: "aier/" },
  { question: "The KB's own structure and rules?", role: "curator/" }
];

export const stageColors: Record<string, string> = {
  requirements: "#409eff",
  decisions: "#7c3aed",
  "design-build": "#10b981",
  "quality-release": "#f59e0b"
};

/** Map stage id to its color */
export function getStageColor(stageId: string): string {
  return stageColors[stageId] || "#409eff";
}

/** Map category key to stage id (reverse lookup) */
export const categoryToStage: Record<string, string> = {
  "producter": "requirements",
  "leader": "decisions",
  engineer: "design-build",
  "srer": "quality-release",
  executiver: "business",
  "aier": "ai",
  "curator": "governance"
};