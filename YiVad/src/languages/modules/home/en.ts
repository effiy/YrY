export default {
  home: {
    title: "Yi System · Agent Harness Overview",
    heroDesc: "Manage projects, tasks, knowledge, and AI capabilities across the Yi ecosystem. Pick a role to start, or jump into AI chat.",
    aiChat: "AI Chat",
    quickNav: "Quick Nav",
    projectOverview: "Projects",
    recentActivity: "Recent Activity",
    okr: "OKR",
    rss: "RSS",
    knowledge: "Knowledge",
    skills: "Skills",
    roleFilter: "Role",
    projectFilter: "Project",

    stats: {
      tasks: "Tasks",
      p0: "P0 Priority",
      projects: "Projects",
      activeRoles: "Active Roles",
      bugs: "Bugs",
      releases: "Releases",
      noData: "--"
    },

    quickNavItems: {
      kanban: { label: "Kanban", desc: "Visual task management" },
      sprint: { label: "Sprint", desc: "Sprint iteration plans" },
      roadmap: { label: "Roadmap", desc: "Product roadmap overview" },
      project: { label: "Projects", desc: "Project overview & management" },
      issue: { label: "Issues", desc: "Task & requirement tracking" },
      cycle: { label: "Cycles", desc: "Dev iterations & cycles" },
      release: { label: "Releases", desc: "Version release management" },
      bug: { label: "Bugs", desc: "Bug tracking & resolution" },
      module: { label: "Modules", desc: "System module architecture" },
      search: { label: "Search", desc: "Cross-project search" },
      aiChat: { label: "AI Chat", desc: "Agent-powered assistant" },
      knowledge: { label: "Knowledge", desc: "Team knowledge base" },
      rag: { label: "RAG", desc: "AI-enhanced retrieval" },
      analytics: { label: "Analytics", desc: "Stats & reports" }
    },

    project: {
      active: "Active",
      archived: "Archived",
      members: "{n} members",
      viewDetail: "View details"
    },

    activity: {
      empty: "No recent activity",
      created: "created",
      updated: "updated",
      issue: "Issue",
      bug: "Bug",
      release: "Release",
      cycle: "Cycle"
    },

    pipeline: {
      title: "Delivery Pipeline",
      requirements: "Requirements",
      activeCycles: "Active Cycles",
      inProgress: "In Progress",
      pendingReleases: "Pending Releases",
      released: "Released",
      stages: {
        req: "Req",
        cycle: "Cycle",
        dev: "Dev",
        release: "Release",
        done: "Done"
      }
    },

    quickCreate: {
      title: "Quick Create",
      issue: "New Issue",
      issueDesc: "Create task or requirement",
      bug: "Report Bug",
      bugDesc: "Report a defect or issue",
      cycle: "New Cycle",
      cycleDesc: "Start a dev iteration",
      release: "New Release",
      releaseDesc: "Plan a release version"
    },

    aiRecommend: {
      title: "OKR Task Lists",
      subtitle: "Modeled on deepseek-harness \"everything is a plugin\" — model-visible means logged, refresh means replay",
      scopeAll: "All roles",
      filterAll: "All",
      searchPlaceholder: "Search task / role…",
      datePlaceholder: "Due date",
      stats: {
        total: "{n} items",
        p0: "P0 {n}",
        overdue: "Overdue {n}"
      },
      empty: "No recommendations yet",
      view: {
        table: "Table",
        list: "List",
        card: "Card"
      },
      lists: {
        daily: "Today",
        weekly: "This Week",
        risk: "Risks & Blockers",
        sprint: "Goal Sprint"
      },
      cols: {
        category: "Category",
        priority: "Priority",
        score: "Score",
        task: "Task",
        role: "Role",
        goal: "Goal",
        project: "Project",
        metric: "Metric",
        skill: "Skill",
        agent: "Agent",
        mcp: "MCP",
        effort: "Effort",
        due: "Due",
        reason: "Why",
        process: "Process",
        action: "Actions"
      },
      dims: {
        roi: "ROI",
        difficulty: "Diff",
        urgency: "Urgent"
      },
      level: {
        high: "High",
        medium: "Mid",
        low: "Low"
      },
      generate: "Generate",
      generating: "Generating…",
      generateSuccess: "Generated {n} recommended tasks",
      generateEmpty: "Model returned nothing parseable",
      generateFailed: "Generation failed",
      regen: "Regenerate",
      regenSuccess: "Regenerated",
      regenFailed: "Regenerate failed"
    }
  }
};