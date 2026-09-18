export default {
  home: {
    title: "Yi System · Agent Harness Overview",
    heroDesc:
      "Manage projects, tasks, knowledge, and AI capabilities across the Yi ecosystem. Pick a role to start, or jump into AI chat.",
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
      tasks: "Active Tasks",
      p0: "P0 Priority",
      projects: "Projects",
      activeRoles: "Active Roles",
      bugs: "Open Bugs",
      noData: "--",
      activeIssues: "Active",
      openBugs: "Bugs",
      todo: "Todo",
      backlog: "Backlog",
      done: "Done",
      knowledgeFiles: "Docs",
      chatSessions: "Chats",
      completionRate: "{n}% complete",
      overdueCount: "{n} overdue",
      blockedCount: "{n} blocked",
      tasksTooltip: "All incomplete issues (excludes done/cancelled)",
      bugsTooltip: "All unresolved bugs (excludes closed/resolved/rejected)",
      knowledgeTooltip: "Total markdown documents across all knowledge base roles",
      chatTooltip: "Total AI chat sessions",
      refresh: "Refresh",
      justNow: "just now",
      ago: "ago",
      issueDistribution: "Issue Status",
      bugDistribution: "Bug Status",
      recentActivity: "Recent Activity",
      total: "total",
      issue: "Issue",
      bug: "Bug",
      noActivity: "No recent activity",
      completed: "completed",
      resolved: "resolved",
      dueThisWeek: "Due This Week",
      noDueItems: "No items due this week",
      inProgress: "In Progress",
      workload: "Team Workload",
      recentlyCompleted: "Recently Completed"
    },

    error: {
      loadFailed: "Failed to load home data",
      retry: "Retry",
      statsFailed: "Failed to load stats",
      projectsFailed: "Failed to load projects",
      activityFailed: "Failed to load activity",
      recommendationsFailed: "Failed to generate recommendations"
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

    attention: {
      overdue: "Overdue",
      unassigned: "Unassigned",
      noOverdue: "No overdue items",
      noUnassigned: "All tasks assigned",
      viewAll: "View all"
    },

    aiRecommend: {
      title: "OKR Task Lists",
      subtitle: 'Modeled on deepseek-harness "everything is a plugin" — model-visible means logged, refresh means replay',
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
    },
    yesterday: {
      title: "Yesterday",
      doneIssues: "Completed",
      resolvedBugs: "Resolved",
      created: "Changed",
      issuesCreated: "Active issues",
      bugsCreated: "Bugs created",
      filesUpdated: "Knowledge updated",
      empty: "No activity yesterday",
      emptyHint: "Completed items will appear here"
    },
    today: {
      title: "Today's Focus",
      dueToday: "Due today",
      inProgress: "In progress",
      overdue: "Overdue",
      noDue: "Nothing due today",
      noInProgress: "No active items",
      viewIssue: "View"
    },
    focusTabs: {
      all: "All",
      wip: "WIP",
      todo: "Todo",
      overdue: "Overdue",
      empty: {
        all: "No active items",
        in_progress: "No items in progress — pick one from backlog",
        todo: "No todo items",
        overdue: "No overdue items"
      }
    },
    tomorrow: {
      title: "Tomorrow's Plan",
      dueTomorrow: "Due tomorrow",
      pendingReview: "Pending review",
      noDue: "Nothing due tomorrow",
      noReview: "No pending reviews"
    },
    recentImportant: {
      title: "Recent & Important",
      knowledgeBugs: "Knowledge Bugs",
      knowledgeHealth: "Knowledge Health",
      recentFiles: "Recent Updates",
      totalFiles: "{n} files total",
      maturity: "Maturity",
      distribution: "Distribution",
      unavailable: "unavailable",
      apiUnavailable: "Knowledge API unavailable — start YiAi to enable",
      noBugs: "No recent bugs",
      noFiles: "No recent updates",
      viewKnowledge: "View knowledge base"
    },
    issueSeverity: {
      critical: "Critical",
      major: "Major",
      minor: "Minor",
      trivial: "Trivial"
    },
    suggested: {
      title: "Suggested",
      backlogTriage: "{n} backlog items need triage",
      blockedItems: "{n} blocked items need attention",
      awaitingReview: "{n} items awaiting review",
      reviewGaps: "Review knowledge gaps",
      createFromTemplate: "Create issue from template"
    },
    due: {
      today: "Today",
      tomorrow: "Tomorrow"
    },
    future: {
      title: "Future Outlook",
      upcoming: "Upcoming",
      blocked: "Blocked",
      gaps: "Knowledge Gaps",
      noUpcoming: "No deadlines in next 30 days",
      noBlocked: "No blocked items",
      noGaps: "No known gaps",
      daysLeft: "{n}d left",
      viewAll: "View all"
    },
    loading: {
      stats: "Loading stats…",
      projects: "Loading projects…",
      activity: "Loading activity…",
      pipeline: "Loading pipeline…",
      recommendations: "Generating recommendations…",
      initial: "Loading home…"
    }
  }
};
