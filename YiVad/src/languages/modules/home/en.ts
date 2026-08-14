export default {
  home: {
    welcome: "Welcome",
    title: "Yi System · Agent Harness Overview",
    subtitle: "Everything is a plugin",
    updated: "Updated {time}",
    refresh: "Refresh",
    aiChat: "AI Chat",
    okr: "OKR",

    status: {
      online: "Online",
      offline: "Offline",
      running: "Running",
      stopped: "Stopped",
      connected: "Connected",
      disconnected: "Disconnected",
      enabled: "Enabled",
      disabled: "Disabled",
      built: "Built",
      notBuilt: "Not built",
      ready: "Ready",
      noData: "No data"
    },

    projects: {
      title: "Project Landscape",
      subtitle: "Every Yi-family product is a composable plugin in the harness",
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

    seams: {
      title: "Harness Capability Seams",
      subtitle: "Mapping deepseek-harness's plugin model onto YiAi's agent loop",
      modelAdapter: {
        name: "Model Adapter",
        mapping: "ctx.llm → OllamaRuntime + model_fallback"
      },
      toolRegistry: {
        name: "Tool Registry",
        mapping: "ctx.tools → get_tool_registry()"
      },
      confirmationGate: {
        name: "Confirmation Gate",
        mapping: "approval policy → _wait_for_confirmation"
      },
      sessionLog: {
        name: "Session Log",
        mapping: "session log → save/load_session_history"
      },
      turnBudget: {
        name: "Turn Budget",
        mapping: "turn / step → max_turns"
      },
      eventSurface: {
        name: "Event Surface",
        mapping: "capability events → on_event / AgentEvent"
      }
    },

    health: {
      title: "System Health",
      server: "Server",
      mongodb: "MongoDB",
      scheduler: "Scheduler",
      watcher: "Knowledge Watcher",
      ollama: "Ollama",
      observer: "Observer",
      version: "Version",
      uptime: "Uptime",
      database: "Database",
      modelCount: "Models",
      sessions: "Sessions",
      knowledgeFiles: "Knowledge files",
      rssSources: "RSS sources"
    },

    ai: {
      title: "AI Agent Activity",
      totalSessions: "Total sessions",
      messagesToday: "Messages today",
      activeToday: "Active sessions today",
      avgPerSession: "Avg messages / session",
      dailyTrend: "Daily trend",
      modelUsage: "Model usage"
    },

    services: {
      title: "Service Performance",
      totalCalls: "Total calls",
      successRate: "Success rate",
      avgLatency: "Avg latency",
      byService: "Calls by service"
    },

    rag: {
      title: "RAG Retrieval",
      docs: "Documents",
      llmModel: "LLM model",
      embedModel: "Embedding model",
      lastBuilt: "Last built",
      recentQueries: "Recent queries"
    },

    infra: {
      title: "Infrastructure",
      memory: "Memory",
      disk: "Disk"
    },

    quickLinks: {
      title: "Quick Links",
      aiChat: "Agent Chat",
      pipeline: "Knowledge Pipeline",
      skills: "Skills",
      rag: "RAG System",
      rss: "RSS Manager",
      okr: "OKR Board"
    }
  }
};
