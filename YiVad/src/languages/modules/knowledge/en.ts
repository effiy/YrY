export default {
  knowledge: {
    pipeline: {
      title: "Software Delivery Pipeline",
      subtitle: "Seven roles, four stages, one causal chain — from why build it to how to run it. Each stage has a clear input → output contract: upstream roles produce artifacts that downstream roles consume.",
      files: "{n} files",
      stages: {
        why: "Why",
        what: "What",
        how: "How",
        run: "Run",
      },
      layers: {
        business: "Business Strategy",
        ai: "AI Enablement",
        governance: "Knowledge Governance",
      },
      stagesDetail: {
        requirements: {
          name: "Requirements",
          role: "producter/",
          description:
            "Define what to build, for whom, and how to measure success — before any code is written.",
          boundary:
            "producter defines WHAT feature to build, not HOW to implement it (→ engineer/) or WHICH technology to use (→ leader/).",
        },
        decisions: {
          name: "Decisions",
          role: "leader/",
          description:
            "Make technical decisions explicit. Every choice is an ADR: Context, Decision, Consequences — why A over B.",
          boundary:
            "leader makes DECISIONS with tradeoffs, not IMPLEMENTATION patterns (→ engineer/architecture/). Decision = why A over B. Pattern = how to implement A.",
        },
        "design-build": {
          name: "Design + Build",
          role: "engineer/",
          description:
            "Turn decisions into working software. Eight subdirectories covering the full BUILD → SHIP cycle.",
          boundary:
            "engineer is the IMPLEMENTATION layer — it does not substitute for leader's decisions. If an architecture-level issue surfaces during implementation → go back to leader/ and write an ADR; don't decide on the side inside engineer/.",
        },
        "quality-release": {
          name: "Ship + Operate",
          role: "srer/ + engineer/learn/lessons/",
          description:
            "Ship safely and keep running. Quality gates, release procedures, observability, incident response, and lessons from wins and failures.",
          boundary:
            "srer/release/ owns RELEASE PROCESS and coordination; engineer/reliability/ owns the TECHNICAL PATTERNS used for release (canary implementation, feature flags). Process vs. implementation.",
        },
        businessDetail: {
          label: "Business Strategy",
          role: "executiver/",
          desc: "Why this business · Market intelligence · Org goals · Industry trends · Roadmap",
          description:
            "Define the strategic context that drives every downstream decision. Business Strategy provides the market intelligence, competitive landscape, and organizational goals that shape product requirements, technical decisions, and operational priorities. Without a clear business foundation, product and engineering teams operate without direction.",
          boundary:
            "executiver/ sets the WHY and the WHAT at the organizational level — market positioning, strategic goals, and resource allocation. It does not define HOW to build (→ engineer/) or WHICH features to prioritize (→ producter/). Strategy informs; execution decides.",
        },
        aiDetail: {
          label: "AI Enablement",
          role: "aier/",
          desc: "How AI accelerates every stage — foundations, methodology, platform, data, ML, skills",
          description:
            "AI Enablement is the horizontal acceleration layer that amplifies every stage of the pipeline. From foundational theory (transformers, embeddings) to engineering methodology (prompt design, RAG, agents) to platform infrastructure (model serving, inference optimization), this layer ensures AI capability is not a bottleneck but a multiplier across the organization.",
          boundary:
            "aier/ provides AI THEORY, METHODOLOGY, and PLATFORM — the how of AI. It does not own product decisions (→ producter/), technical architecture choices (→ leader/), or implementation patterns (→ engineer/). AI is a tool; what to build with it lives in the vertical stages.",
        },
        governanceDetail: {
          label: "Knowledge Governance",
          role: "curator/",
          desc: "How the KB itself is maintained — lifecycle, diagrams, templates, archive, governance",
          description:
            "Knowledge Governance ensures the knowledge base itself remains healthy, consistent, and useful over time. It defines the lifecycle of every knowledge artifact — from draft through review to stable or archival — and provides the templates, diagrams, and processes that make knowledge creation repeatable and scalable across all roles.",
          boundary:
            "curator/ owns the STRUCTURE and HEALTH of the knowledge base — lifecycle policies, templates, directory design, and governance rules. It does not own the CONTENT of any specific domain (that belongs to each role's directory). Curator is the librarian; each role is the author.",
        },
      },
      flowItems: {
        inputs: "Inputs",
        outputs: "Outputs",
      },
      decision: {
        title: "Role Boundary Decision Tree",
        subtitle: "Not sure which role owns a question? Follow the decision path.",
        rules: {
          business: "Business strategy, market, competitors?",
          product: "Product requirements, user stories, priorities?",
          leader: "Technical decisions, architecture choices, ADRs?",
          engineer: "Implementation patterns, dev tools, code?",
          sre: "Release procedures, monitoring, incident response?",
          ai: "AI/ML-specific theory and practice?",
          curator: "The KB's own structure and rules?",
        },
        roles: {
          executiver: "executiver/",
          producter: "producter/",
          leader: "leader/",
          engineer: "engineer/",
          srer: "srer/",
          aier: "aier/",
          curator: "curator/",
        },
      },
    },
    role: {
      executiver: "Executive",
      engineer: "Engineer",
      curator: "Curator",
      leader: "Tech Lead",
      designer: "Designer",
      tester: "Tester",
      operator: "Operator",
      executiverDesc: "Strategy, industry analysis, roadmap planning, and reading list for executive decision-making.",
      engineerDesc: "Build, Ship, Run, Learn — covering the full design → deploy → operate → learn lifecycle for engineering teams.",
      curatorDesc: "Governance, templates, diagrams, and archive for the knowledge base lifecycle.",
      leaderDesc: "Architecture decisions, tech selection, capacity planning, risk management, and roadmap for technical leadership.",
      domainsWord: "domains",
      phasesWord: "phases",
    },
    nav: {
      allRoles: "All Roles",
      pipeline: "Pipeline",
      goals: "Goals",
      metrics: "Metrics",
      resume: "Resume",
      skills: "Skills",
    },
    goals: {
      title: "Goals & OKR",
      noGoals: "No goals",
      keyResults: "Key Results",
      progress: "Progress",
    },
    metrics: {
      title: "Metrics",
      noMetrics: "No metrics",
    },
    skills: {
      title: "Skills",
      skillDetail: "Skill Detail",
      noSkills: "No skills",
      search: "Search skills...",
    },
    resume: {
      title: "Resume",
      noResume: "No resume",
    },
    rss: {
      title: "RSS Management",
      overview: "RSS Overview",
      manager: "RSS Manager",
      addFeed: "Add Feed",
      feedUrl: "Feed URL",
      feedName: "Feed Name",
      noFeeds: "No feeds",
      unread: "Unread",
      read: "Read",
      refresh: "Refresh",
    },
    okr: {
      title: "OKR",
      objective: "Objective",
      keyResults: "Key Results",
      progress: "Progress",
      status: "Status",
      owner: "Owner",
      dueDate: "Due Date",
      noOkr: "No OKRs",
    },
    processRecord: {
      title: "Process Records",
      noRecords: "No records",
      addRecord: "Add Record",
      content: "Content",
      date: "Date",
    },
    readingList: {
      title: "Reading List",
      noItems: "No items",
      status: {
        reading: "Reading",
        done: "Done",
        todo: "To Read",
      },
    },
    common: {
      view: "View",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      create: "New",
      search: "Search",
      loading: "Loading...",
      noData: "No data",
      retry: "Retry",
      error: "Failed to load",
      back: "Back",
    },
  },
};