export default {
  home: {
    title: "Yi System · Agent Harness Overview",
    updated: "Updated {time}",
    aiChat: "AI Chat",
    okr: "OKR",
    rss: "RSS",
    knowledge: "Knowledge",
    skills: "Skills",

    status: {
      online: "Online",
      offline: "Offline",
      disconnected: "Disconnected",
      ready: "Ready"
    },

    projects: {
      yiAi: {
        name: "YiAi",
        role: "Agent core · model adapter / tools / confirmation gate"
      },
      yiVad: {
        name: "YiVad",
        role: "Admin console · the app you're in"
      },
      yiPet: {
        name: "YiPet",
        role: "Browser extension · content distribution & capture"
      },
      yiKnowledge: {
        name: "YiKnowledge",
        role: "Knowledge base · session log & replayable facts"
      }
    },

    aiRecommend: {
      title: "AI Autonomous Recommendation · OKR Task Lists",
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
        metric: "Metric",
        skill: "Skill",
        agent: "Agent",
        mcp: "MCP",
        effort: "Effort",
        due: "Due",
        reason: "Why",
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
