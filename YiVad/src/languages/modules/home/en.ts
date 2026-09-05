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
      noData: "--"
    },

    quickNavItems: {
      kanban: { label: "Kanban", desc: "Visual task management" },
      sprint: { label: "Sprint", desc: "Sprint iteration plans" },
      roadmap: { label: "Roadmap", desc: "Product roadmap overview" },
      project: { label: "Projects", desc: "Project overview & management" },
      issue: { label: "Issues", desc: "Task & requirement tracking" },
            bug: { label: "Bugs", desc: "Bug tracking & resolution" },
      module: { label: "Modules", desc: "System module architecture" },
      search: { label: "Search", desc: "Cross-project search" },
      aiChat: { label: "AI Chat", desc: "Agent-powered assistant" },
      knowledge: { label: "Knowledge", desc: "Team knowledge base" },
      rag: { label: "RAG", desc: "AI-enhanced retrieval" },
      skills: { label: "Skills", desc: "Skills management" },
      rss: { label: "RSS", desc: "RSS subscriptions" }
    },

    quickNavGroups: {
      plan: { label: "P · Plan" },
      build: { label: "D · Do" },
      quality: { label: "C · Check" },
      intelligence: { label: "A · Act" }
    },

    knowledgeSubPages: {
      aier: "AI",
      curator: "Curator",
      engineer: "Engineer",
      executiver: "Executive",
      leader: "Tech Lead",
      producter: "Producter",
      pipeline: "Pipeline",
      skills: "Skills",
      srer: "SRE"
    },

    knowledgeQuickNav: {
      okr: {
        title: "OKR Dashboard",
        desc: "Goals, metrics, daily standups, weekly reports & retrospectives"
      },
      rss: {
        title: "RSS Manager",
        desc: "Feed subscriptions, auto-classification & article management"
      },
      readingList: {
        title: "Reading List",
        desc: "Curated books, articles & papers with reading status and notes"
      },
      process: {
        title: "Process Records",
        desc: "Requirements review · Tech review · Build debug · Test report · Deploy — full lifecycle self-closed records"
      }
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
      bug: "Bug"
    },

    pipeline: {
      title: "Delivery Pipeline",
      requirements: "Requirements",
      inProgress: "In Progress",
      stages: {
        req: "Req",
        dev: "Dev",
          done: "Done"
      }
    },

    quickCreate: {
      title: "Quick Create",
      issue: "New Issue",
      issueDesc: "Create task or requirement",
      bug: "Report Bug",
      bugDesc: "Report a defect or issue"
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