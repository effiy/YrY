export default {
  home: {
    title: "Yi 系统 · Agent Harness 总览",
    updated: "更新于 {time}",
    aiChat: "AI 对话",
    okr: "OKR",
    rss: "RSS",
    knowledge: "知识库",
    skills: "技能",
    roleFilter: "角色筛选",

    status: {
      online: "在线",
      offline: "离线",
      disconnected: "未连接",
      ready: "就绪"
    },

    projects: {
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

    aiRecommend: {
      title: "AI 自主推荐 · OKR 任务清单",
      subtitle: "参考 deepseek-harness「一切皆插件」——模型可见即日志，刷新即可重放",
      scopeAll: "全部角色",
      filterAll: "全部",
      searchPlaceholder: "搜索任务 / 角色…",
      datePlaceholder: "截止日期",
      stats: {
        total: "共 {n} 条",
        p0: "P0 {n} 项",
        overdue: "逾期 {n} 项"
      },
      empty: "暂无推荐",
      view: {
        table: "表格",
        list: "列表",
        card: "卡片"
      },
      lists: {
        daily: "今日推荐",
        weekly: "本周推荐",
        risk: "风险与阻塞",
        sprint: "目标冲刺"
      },
      cols: {
        category: "清单",
        priority: "优先级",
        score: "综合评分",
        task: "任务",
        role: "角色",
        goal: "关联目标",
        metric: "指标",
        skill: "技能",
        agent: "Agent",
        mcp: "MCP",
        effort: "工作量",
        due: "截止",
        reason: "推荐理由",
        action: "操作"
      },
      dims: {
        roi: "ROI",
        difficulty: "难度",
        urgency: "紧迫"
      },
      level: {
        high: "高",
        medium: "中",
        low: "低"
      },
      generate: "生成推荐",
      generating: "生成中…",
      generateSuccess: "已生成 {n} 条推荐任务",
      generateEmpty: "模型未返回可解析结果",
      generateFailed: "生成失败",
      regen: "重生成",
      regenSuccess: "已重生成",
      regenFailed: "重生成失败"
    }
  }
};
