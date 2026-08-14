export default {
  home: {
    welcome: "欢迎",
    title: "Yi 系统 · Agent Harness 总览",
    subtitle: "一切皆插件 · Everything is a plugin",
    updated: "更新于 {time}",
    refresh: "刷新",
    aiChat: "AI 对话",
    okr: "OKR",

    status: {
      online: "在线",
      offline: "离线",
      running: "运行中",
      stopped: "已停止",
      connected: "已连接",
      disconnected: "未连接",
      enabled: "已开启",
      disabled: "已关闭",
      built: "已构建",
      notBuilt: "未构建",
      ready: "就绪",
      noData: "暂无数据"
    },

    projects: {
      title: "项目版图",
      subtitle: "Yi 家族的每个产品都是 harness 中的一个可组合插件",
      yiAi: {
        name: "YiAi",
        role: "Agent 核心 · 模型适配 / 工具 / 确认门"
      },
      yiVad: {
        name: "YiVad",
        role: "管理控制台 · 你当前所在的应用"
      },
      yiPet: {
        name: "YiPet",
        role: "浏览器扩展 · 内容分发与采集"
      },
      yiKnowledge: {
        name: "YiKnowledge",
        role: "知识库 · 会话日志与可重放事实"
      }
    },

    seams: {
      title: "Harness 能力接缝",
      subtitle: "把 deepseek-harness 的插件模型映射到 YiAi 的 agent 循环",
      modelAdapter: {
        name: "模型适配器",
        mapping: "ctx.llm → OllamaRuntime + model_fallback"
      },
      toolRegistry: {
        name: "工具注册表",
        mapping: "ctx.tools → get_tool_registry()"
      },
      confirmationGate: {
        name: "确认门",
        mapping: "approval 策略 → _wait_for_confirmation"
      },
      sessionLog: {
        name: "会话日志",
        mapping: "session log → save/load_session_history"
      },
      turnBudget: {
        name: "轮次预算",
        mapping: "turn / step → max_turns"
      },
      eventSurface: {
        name: "事件面",
        mapping: "capability events → on_event / AgentEvent"
      }
    },

    health: {
      title: "系统健康",
      server: "服务",
      mongodb: "MongoDB",
      scheduler: "调度器",
      watcher: "知识监听",
      ollama: "Ollama",
      observer: "Observer",
      version: "版本",
      uptime: "运行时长",
      database: "数据库",
      modelCount: "模型数",
      sessions: "会话",
      knowledgeFiles: "知识文件",
      rssSources: "RSS 源"
    },

    ai: {
      title: "AI Agent 活动",
      totalSessions: "会话总数",
      messagesToday: "今日消息",
      activeToday: "今日活跃会话",
      avgPerSession: "平均消息/会话",
      dailyTrend: "每日趋势",
      modelUsage: "模型使用分布"
    },

    services: {
      title: "服务性能",
      totalCalls: "总调用",
      successRate: "成功率",
      avgLatency: "平均延迟",
      byService: "各服务调用"
    },

    rag: {
      title: "RAG 检索",
      docs: "文档数",
      llmModel: "LLM 模型",
      embedModel: "嵌入模型",
      lastBuilt: "最近构建",
      recentQueries: "最近查询"
    },

    infra: {
      title: "基础设施",
      memory: "内存",
      disk: "磁盘"
    },

    quickLinks: {
      title: "快捷入口",
      aiChat: "Agent 对话",
      pipeline: "知识管道",
      skills: "技能库",
      rag: "RAG 系统",
      rss: "RSS 管理",
      okr: "OKR 看板"
    }
  }
};
