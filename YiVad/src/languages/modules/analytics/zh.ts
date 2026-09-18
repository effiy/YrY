export default {
  analytics: {
    title: "分析",
    overview: "概览",
    trends: "趋势",
    reports: "报告",
    custom: "自定义分析",
    noData: "暂无数据",
    loading: "加载分析数据…",
    loadFailed: "分析数据加载失败",
    timeRange: {
      label: "时间范围",
      today: "今日",
      yesterday: "昨日",
      last7d: "近 7 天",
      last14d: "近 14 天",
      last30d: "近 30 天",
      last90d: "近 90 天",
      thisMonth: "本月",
      thisQuarter: "本季度",
      thisYear: "今年",
      custom: "自定义范围",
      from: "开始日期",
      to: "结束日期",
      apply: "应用"
    },
    granularity: {
      label: "时间粒度",
      hourly: "按小时",
      daily: "按天",
      weekly: "按周",
      monthly: "按月",
      quarterly: "按季度"
    },
    charts: {
      bar: "柱状图",
      line: "折线图",
      pie: "饼图",
      area: "面积图",
      scatter: "散点图",
      radar: "雷达图",
      heatmap: "热力图",
      funnel: "漏斗图",
      gauge: "仪表盘",
      treemap: "树图"
    },
    metrics: {
      issuesCreated: "创建 Issue",
      issuesClosed: "关闭 Issue",
      bugsReported: "报告 Bug",
      bugsResolved: "解决 Bug",
      storiesCompleted: "完成故事",
      codeCommits: "代码提交",
      prsMerged: "合并 PR",
      deployments: "部署次数",
      leadTime: "交付周期",
      cycleTime: "开发周期",
      changeFailureRate: "变更失败率",
      mttr: "平均恢复时间",
      velocity: "团队速率",
      throughput: "吞吐量"
    },
    dimensions: {
      label: "分析维度",
      byProject: "按项目",
      byModule: "按模块",
      byAssignee: "按负责人",
      byPriority: "按优先级",
      byType: "按类型",
      byStatus: "按状态",
      bySeverity: "按严重程度",
      bySource: "按来源",
      byRole: "按角色",
      byMonth: "按月"
    },
    comparison: {
      label: "对比模式",
      none: "无对比",
      previousPeriod: "与上一周期对比",
      previousYear: "与去年同期对比",
      customBaseline: "自定义基准",
      vs: "对比"
    },
    filters: {
      title: "筛选器",
      addFilter: "添加筛选条件",
      clearAll: "清除全部",
      saveAs: "保存为视图",
      savedViews: "已保存的视图",
      noSavedViews: "暂无已保存的视图",
      deleteView: "删除视图",
      viewSaved: "视图已保存",
      viewDeleted: "视图已删除"
    },
    export: {
      title: "导出",
      csv: "导出 CSV",
      excel: "导出 Excel",
      png: "导出为图片",
      pdf: "导出为 PDF",
      copyToClipboard: "复制数据",
      schedule: "定时导出",
      exporting: "正在导出…",
      exportSuccess: "导出成功",
      exportFailed: "导出失败"
    },
    annotations: {
      add: "添加标记",
      edit: "编辑标记",
      remove: "移除标记",
      date: "日期",
      description: "描述",
      descriptionPlaceholder: "此标记说明（如：版本发布）"
    },
    drilldown: {
      clickToDrill: "点击深入下钻",
      back: "返回上级",
      breadcrumb: "下钻路径"
    },
    empty: {
      noMetrics: "暂无指标数据",
      noCharts: "暂未添加图表",
      insufficient: "数据不足，无法生成分析",
      adjustFilters: "请调整筛选条件或时间范围"
    }
  }
};
