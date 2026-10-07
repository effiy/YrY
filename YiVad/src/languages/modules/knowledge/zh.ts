export default {
  knowledge: {
    pipeline: {
      title: "软件交付流水线",
      subtitle:
        "七个角色，四个阶段，一个因果链——从为什么构建，到如何运行。每个阶段都有清晰的输入 → 输出契约：上游角色产出的产物供下游角色消费。",
      files: "{n} 个文件",
      filesLabel: "个文件",
      staleLabel: "过期",
      tacitLabel: "隐式",
      section: {
        layers: "横切关注层",
        stages: "流水线阶段"
      },
      overview: {
        files: "知识文件",
        quality: "数据质量",
        stale: "过期文件",
        latest: "最近更新",
        reviewCoverage: "审查覆盖率",
        lastScan: "上次扫描",
        roles: "个角色",
        complete: "完整",
        needsReview: "需审查",
        allFresh: "全部最新",
        orphan: "孤儿文件",
        unmaintained: "未维护",
        scanStale: "扫描过期"
      },
      time: {
        justNow: "刚刚",
        secAgo: "{n} 秒前",
        minAgo: "{n} 分钟前",
        hourAgo: "{n} 小时前",
        dayAgo: "{n} 天前",
        longAgo: "较早"
      },
      stages: {
        why: "为什么",
        what: "做什么",
        how: "如何做",
        run: "运行"
      },
      layers: {
        business: "业务战略",
        ai: "AI 赋能",
        governance: "知识治理"
      },
      stagesDetail: {
        requirements: {
          name: "需求",
          role: "产品经理",
          description: "定义要构建什么、为谁构建、以及如何衡量成功——在任何代码编写之前。",
          boundary: "product 定义「需要构建什么功能」，而不是「如何实现它」（→ engineer/）或「选择何种技术」（→ leader/）。"
        },
        decisions: {
          name: "决策",
          role: "技术负责人",
          description: "把技术决策显性化。每一个选择都是一份 ADR：背景、决策、后果——为什么选 A 而不是 B。",
          boundary:
            "leader 在权衡中做出决策，但不落地具体实现模式（→ engineer/architecture/）。决策 = 为什么 A 胜 B；模式 = 如何落地 A。"
        },
        "design-build": {
          name: "设计 + 构建",
          role: "工程师",
          description: "把决策转化为可运行的软件。八个子目录覆盖完整的 BUILD → SHIP 周期。",
          boundary:
            "engineer 是「实现层」——它不能替代 leader 的决策。如果在实现中浮现架构级问题 → 回 leader/ 写 ADR，不要在 engineer/ 内部自行拍板。"
        },
        "quality-release": {
          name: "交付 + 运维",
          role: "SRE + 工程师/复盘/教训",
          description: "安全交付并保持运行。质量门禁、发布流程、可观测性、事件响应，以及来自成功与失败的经验教训。",
          boundary:
            "sre/release/ 拥有「发布流程与协调」；engineer/reliability/ 拥有「用于发布的技术模式」（灰度实现、特性开关）。流程 vs 实现。"
        },
        businessDetail: {
          label: "业务战略",
          role: "战略执行者",
          desc: "为什么做此业务 · 市场洞察 · 组织目标 · 行业趋势 · 路线图",
          description:
            "定义驱动每一个下游决策的战略背景。业务战略提供市场情报、竞争格局和组织目标，它们塑造产品需求、技术决策和运维优先级。没有清晰的业务基础，产品与工程团队会迷失方向。",
          boundary:
            "executive/ 设定组织级的「为什么」和「做什么」——市场定位、战略目标、资源分配。它不定义「如何构建」（→ engineer/）或「优先做哪些特性」（→ product/）。战略告知方向；执行决定细节。"
        },
        aiDetail: {
          label: "AI 赋能",
          role: "AI 工程师",
          desc: "AI 如何加速每一个阶段——基础、方法论、平台、数据、机器学习、技能",
          description:
            "AI 赋能是水平加速层，放大流水线的每一个阶段。从基础理论（Transformer、向量嵌入）到工程方法论（Prompt 设计、RAG、Agent），再到平台基础设施（模型服务、推理优化），本层确保 AI 能力不成为瓶颈，而是跨组织的倍增器。",
          boundary:
            "aier/ 提供 AI 的「理论、方法论与平台」——即 AI 的 HOW。它不拥有产品决策（→ product/）、技术架构选择（→ leader/）或实现模式（→ engineer/）。AI 是工具；用它构建什么属于垂直各阶段。"
        },
        governanceDetail: {
          label: "知识治理",
          role: "知识管理者",
          desc: "知识库自身如何维护——生命周期、图表、模板、归档、治理",
          description:
            "知识治理确保知识库本身长期保持健康、一致、可用。它定义每条知识产物的生命周期——从草稿经过评审到稳定或归档——并提供让知识生产可复制、可扩展的模板、图表与流程。",
          boundary:
            "curator/ 拥有知识库的「结构与健康」——生命周期策略、模板、目录设计、治理规则。它不拥有任何具体领域的内容（内容属于各角色目录）。Curator 是图书管理员；每个角色是作者。"
        }
      },
      flowItems: {
        inputs: "输入",
        outputs: "输出"
      },
      decision: {
        title: "角色职责决策树",
        subtitle: "不确定某个问题属于哪个角色？沿着决策路径走一遍。",
        rules: {
          business: "业务战略、市场、竞争对手？",
          product: "产品需求、用户故事、优先级？",
          leader: "技术决策、架构选择、ADR？",
          engineer: "实现模式、开发工具、代码？",
          sre: "发布流程、监控、事件响应？",
          ai: "AI/ML 相关的理论与实践？",
          curator: "知识库自身的结构与规则？"
        },
        roles: {
          executive: "战略执行者",
          product: "产品经理",
          leader: "技术负责人",
          engineer: "工程师",
          sre: "SRE",
          aier: "AI 工程师",
          curator: "知识管理者"
        }
      },
      distribution: {
        title: "数据分布",
        size: "文件大小分布",
        age: "文件年龄分布"
      }
    },
    role: {
      executive: "执行者",
      engineer: "工程师",
      curator: "管理者",
      leader: "技术负责人",
      designer: "设计师",
      tester: "测试",
      operator: "运维",
      executiveDesc: "战略、行业分析、路线图规划和执行决策阅读清单。",
      engineerDesc: "构建、交付、运行、学习——覆盖工程团队从设计到部署到运维到学习的完整生命周期。",
      curatorDesc: "治理、模板、图表和知识库生命周期的归档。",
      leaderDesc: "架构决策、技术选型、容量规划、风险管理和技术领导路线图。",
      domainsWord: "领域",
      phasesWord: "阶段"
    },
    nav: {
      allRoles: "全部角色",
      pipeline: "流水线",
      goals: "目标",
      metrics: "指标",
      resume: "简历",
      skills: "技能"
    },
    goals: {
      title: "目标与 OKR",
      noGoals: "暂无目标",
      keyResults: "关键结果",
      progress: "进度"
    },
    metrics: {
      title: "指标",
      noMetrics: "暂无指标"
    },
    skills: {
      title: "技能",
      skillDetail: "技能详情",
      noSkills: "暂无技能",
      search: "搜索技能..."
    },
    resume: {
      title: "简历",
      noResume: "暂无简历"
    },
    rss: {
      title: "RSS 管理",
      overview: "RSS 概览",
      manager: "RSS 管理",
      addFeed: "添加订阅源",
      feedUrl: "订阅地址",
      feedName: "订阅名称",
      noFeeds: "暂无订阅源",
      unread: "未读",
      read: "已读",
      refresh: "刷新"
    },
    okr: {
      title: "OKR",
      objective: "目标",
      keyResults: "关键结果",
      progress: "进度",
      status: "状态",
      owner: "负责人",
      dueDate: "截止日期",
      noOkr: "暂无 OKR"
    },
    processRecord: {
      title: "过程记录",
      noRecords: "暂无记录",
      addRecord: "添加记录",
      content: "内容",
      date: "日期"
    },
    readingList: {
      title: "阅读清单",
      noItems: "暂无阅读项",
      status: {
        reading: "阅读中",
        done: "已完成",
        todo: "待阅读"
      }
    },
    common: {
      view: "查看",
      edit: "编辑",
      delete: "删除",
      save: "保存",
      cancel: "取消",
      create: "新建",
      search: "搜索",
      loading: "加载中...",
      noData: "暂无数据",
      retry: "重试",
      deleteFileConfirm: "删除「{path}」？此操作不可撤销。",
      deleteFileTitle: "确认删除",
      fileDeleted: "文件已删除",
      fileDeleteFailed: "文件删除失败",
      actionItemDeleted: "操作项已删除",
      error: "加载失败",
      back: "返回"
    },
    sre: {
      qualityScore: "质量评分",
      mttr: "平均修复时间",
      openBugs: "未关闭缺陷",
      slaCompliance: "SLA 合规率",
      criticalOpen: "严重缺陷",
      bugTrend: "缺陷趋势",
      severityDist: "严重程度分布",
      moduleQuality: "模块质量",
      bugAge: "缺陷年龄分布",
      knowledgeBase: "知识库",
      lastUpdated: "更新于",
      justNow: "刚刚",
      live: "实时",
      recent: "近期",
      active: "活跃",
      stale: "延迟"
    }
  }
};
