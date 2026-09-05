export default {
  home: {
    title: "Yi 系统 · Agent Harness 总览",
    heroDesc: "统一管理 Yi 生态系统的项目、任务、知识与 AI 能力。选择一个角色开始，或直接进入 AI 对话。",
    aiChat: "AI 对话",
    quickNav: "快速导航",
    projectOverview: "项目概览",
    recentActivity: "最近动态",
    okr: "OKR",
    rss: "RSS",
    knowledge: "知识库",
    skills: "技能",
    roleFilter: "角色筛选",
    projectFilter: "项目",

    stats: {
      tasks: "推荐任务",
      p0: "P0 优先",
      projects: "项目",
      activeRoles: "活跃角色",
      bugs: "缺陷",
      noData: "--"
    },

    quickNavItems: {
      kanban: { label: "看板", desc: "Kanban 视图管理任务" },
      sprint: { label: "冲刺规划", desc: "Sprint 迭代计划" },
      roadmap: { label: "路线图", desc: "产品路线图概览" },
      project: { label: "项目", desc: "项目管理与概览" },
      issue: { label: "Issue", desc: "任务与需求追踪" },
            bug: { label: "缺陷", desc: "Bug 追踪与修复" },
      module: { label: "模块", desc: "系统模块架构" },
      search: { label: "全局搜索", desc: "跨项目搜索实体" },
      aiChat: { label: "AI 对话", desc: "Agent 驱动的智能助手" },
      knowledge: { label: "知识库", desc: "团队知识管理" },
      rag: { label: "RAG 检索", desc: "AI 增强检索问答" },
      skills: { label: "技能", desc: "技能管理" },
      rss: { label: "RSS", desc: "RSS 订阅内容" }
    },

    quickNavGroups: {
      plan: { label: "P · 规划" },
      build: { label: "D · 执行" },
      quality: { label: "C · 检查" },
      intelligence: { label: "A · 改进" }
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
        title: "OKR 仪表盘",
        desc: "目标、指标、每日站会、周报与复盘"
      },
      rss: {
        title: "RSS 管理",
        desc: "订阅源、自动分类与文章管理"
      },
      readingList: {
        title: "阅读清单",
        desc: "精选书籍、文章与论文，含阅读状态与笔记"
      },
      process: {
        title: "流程记录",
        desc: "需求评审 · 技术评审 · 构建调试 · 测试报告 · 上线 — 全流程自闭环记录"
      }
    },

    project: {
      active: "活跃",
      archived: "已归档",
      members: "{n} 位成员",
      viewDetail: "查看详情"
    },

    activity: {
      empty: "暂无动态",
      created: "创建了",
      updated: "更新了",
      issue: "Issue",
      bug: "Bug"
    },

    pipeline: {
      title: "交付流水线",
      requirements: "需求",
      inProgress: "进行中",
      stages: {
        req: "需求",
        dev: "开发",
        done: "完成"
      }
    },

    quickCreate: {
      title: "快速创建",
      issue: "新建 Issue",
      issueDesc: "创建任务或需求",
      bug: "提交 Bug",
      bugDesc: "报告缺陷或问题"
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
        project: "项目",
        metric: "指标",
        skill: "技能",
        agent: "Agent",
        mcp: "MCP",
        effort: "工作量",
        due: "截止",
        reason: "推荐理由",
        process: "流程记录",
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