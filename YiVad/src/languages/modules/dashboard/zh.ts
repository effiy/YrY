export default {
  dashboard: {
    title: "仪表盘",
    knowledgeBase: "知识库概览",
    custom: "自定义仪表盘",
    welcome: "欢迎回来，{name}",
    lastUpdated: "最近更新",
    stats: {
      totalFiles: "文件总数",
      totalRoles: "角色数",
      activeProjects: "活跃项目",
      openIssues: "待处理 Issue",
      resolvedBugs: "已解决 Bug",
      activeSprints: "进行中迭代",
      coverageRate: "测试覆盖率",
      uptime: "服务可用率"
    },
    charts: {
      issueTrend: "Issue 趋势 · 近 30 天",
      bugResolution: "Bug 解决率 · 近 14 天",
      storyProgress: "故事完成进度",
      teamVelocity: "团队速率",
      codeQuality: "代码质量趋势",
      activityHeatmap: "活跃度热力图",
      pipelineHealth: "流水线健康度",
      resourceUsage: "资源使用率"
    },
    widgets: {
      add: "添加卡片",
      remove: "移除卡片",
      resize: "调整大小",
      configure: "配置卡片",
      noWidgets: "暂未配置任何卡片，点击「添加卡片」开始",
      resetLayout: "重置布局",
      saveLayout: "保存布局",
      layoutSaved: "布局已保存",
      picker: {
        title: "选择小部件",
        searchPlaceholder: "搜索小部件…",
        noMatch: "未找到匹配的小部件",
        categories: {
          chart: "图表",
          metric: "指标",
          table: "表格",
          text: "文本"
        }
      },
      settings: {
        title: "小部件设置",
        namePlaceholder: "小部件标题",
        refreshInterval: "刷新间隔（秒）",
        refreshHint: "0 表示不自动刷新",
        unknownWidget: "未知小部件: {type}"
      },
      empty: {
        dashboard: "仪表盘为空",
        addWidget: "添加小部件"
      },
      toolbar: {
        addWidget: "添加小部件",
        refreshAll: "刷新全部数据"
      }
    },
    sections: {
      overview: "概览",
      projects: "项目动态",
      quality: "质量大盘",
      activity: "团队活跃度",
      resources: "资源与容量"
    },
    empty: {
      noData: "暂无数据",
      noProjects: "暂无活跃项目",
      noIssues: "暂无待处理 Issue",
      loading: "加载仪表盘数据…",
      loadFailed: "仪表盘数据加载失败"
    },
    timeRange: {
      today: "今日",
      week: "本周",
      month: "本月",
      quarter: "本季度",
      year: "今年",
      custom: "自定义"
    },
    refresh: {
      auto: "自动刷新",
      manual: "手动刷新",
      interval: "刷新间隔",
      every30s: "每 30 秒",
      every1m: "每 1 分钟",
      every5m: "每 5 分钟",
      off: "关闭自动刷新"
    },
    export: {
      title: "导出仪表盘",
      pdf: "导出 PDF",
      image: "导出图片",
      csv: "导出 CSV"
    },
    drillDown: {
      clickToExplore: "点击深入查看",
      backToOverview: "返回概览"
    }
  }
};
