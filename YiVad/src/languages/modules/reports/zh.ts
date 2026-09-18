export default {
  reports: {
    title: "报告",
    generate: "生成报告",
    generating: "正在生成报告…",
    type: "报告类型",
    dateRange: "日期范围",
    export: "导出",
    noReports: "暂无报告",
    loading: "加载报告列表…",
    loadFailed: "报告数据加载失败",
    types: {
      projectStatus: "项目状态报告",
      sprintReview: "迭代回顾报告",
      qualityReport: "质量报告",
      teamProductivity: "团队生产力报告",
      bugAnalysis: "Bug 分析报告",
      resourceUtilization: "资源使用报告",
      riskAssessment: "风险评估报告",
      okrProgress: "OKR 进展报告",
      codeHealth: "代码健康报告",
      incidentPostmortem: "事件复盘报告",
      weeklyDigest: "周报摘要",
      custom: "自定义报告"
    },
    schedule: {
      title: "定时生成",
      enabled: "已启用定时生成",
      disabled: "定时生成已关闭",
      frequency: "生成频率",
      daily: "每天",
      weekly: "每周",
      biweekly: "每两周",
      monthly: "每月",
      dayOfWeek: "选择星期",
      dayOfMonth: "选择日期",
      time: "生成时间",
      recipients: "接收人",
      recipientsPlaceholder: "输入邮箱地址，按回车添加",
      addRecipient: "添加接收人",
      save: "保存计划",
      saved: "计划已保存"
    },
    templates: {
      title: "报告模板",
      use: "使用模板",
      saveAs: "保存为模板",
      saveAsPlaceholder: "模板名称",
      saved: "模板已保存",
      delete: "删除模板",
      deleteConfirm: "确认删除模板「{name}」？",
      deleted: "模板已删除",
      noTemplates: "暂无保存的模板"
    },
    sections: {
      summary: "摘要",
      metrics: "关键指标",
      charts: "图表",
      details: "详细数据",
      recommendations: "建议与行动项",
      risks: "风险与阻塞",
      timeline: "时间线"
    },
    status: {
      draft: "草稿",
      generating: "生成中",
      ready: "就绪",
      failed: "生成失败",
      archived: "已归档"
    },
    actions: {
      view: "查看报告",
      download: "下载",
      share: "分享",
      copyLink: "复制链接",
      linkCopied: "报告链接已复制",
      archive: "归档",
      restore: "恢复",
      delete: "删除",
      deleteConfirm: "确认删除报告「{name}」？"
    },
    empty: {
      noResults: "暂无匹配的报告",
      adjustFilters: "调整筛选条件或时间范围"
    },
    messages: {
      generated: "报告已生成",
      generationFailed: "报告生成失败",
      deleted: "报告已删除",
      archived: "报告已归档",
      restored: "报告已恢复"
    }
  }
};
