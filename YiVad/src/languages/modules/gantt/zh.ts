export default {
  gantt: {
    title: "甘特图",
    today: "今天",
    views: {
      day: "日",
      week: "周",
      month: "月",
      quarter: "季度",
      year: "年"
    },
    zoom: {
      in: "放大",
      out: "缩小",
      fit: "适应屏幕",
      reset: "重置视图"
    },
    task: {
      title: "任务名称",
      startDate: "开始日期",
      endDate: "结束日期",
      duration: "工期",
      durationDays: "{n} 天",
      progress: "进度",
      assignee: "负责人",
      status: "状态",
      dependency: "依赖关系",
      noDependencies: "无依赖",
      addDependency: "添加依赖",
      removeDependency: "移除依赖",
      parentTask: "父任务",
      childTasks: "子任务",
      expandAll: "展开全部",
      collapseAll: "收起全部",
      milestone: "里程碑",
      addMilestone: "添加里程碑",
      edit: "编辑任务",
      delete: "删除任务",
      move: "移动任务",
      resize: "调整工期"
    },
    status: {
      notStarted: "未开始",
      inProgress: "进行中",
      completed: "已完成",
      delayed: "已延期",
      blocked: "阻塞",
      cancelled: "已取消"
    },
    dependency: {
      finishToStart: "完成 → 开始",
      startToStart: "开始 → 开始",
      finishToFinish: "完成 → 完成",
      startToFinish: "开始 → 完成"
    },
    tooltip: {
      taskName: "任务",
      start: "开始",
      end: "结束",
      duration: "工期",
      progress: "进度",
      assignee: "负责人",
      dependency: "依赖",
      noDependency: "无依赖关系"
    },
    legend: {
      title: "图例",
      task: "任务",
      milestone: "里程碑",
      dependency: "依赖关系",
      criticalPath: "关键路径",
      today: "今天",
      baseline: "基准计划",
      actual: "实际进度",
      slack: "浮动时间"
    },
    empty: {
      noTasks: "暂无任务",
      noTasksHint: "添加任务或里程碑以开始规划时间线。",
      noMatch: "无匹配结果"
    },
    actions: {
      addTask: "添加任务",
      addGroup: "添加分组",
      deleteGroup: "删除分组",
      exportPng: "导出图片",
      exportPdf: "导出 PDF",
      print: "打印"
    },
    messages: {
      taskCreated: "任务已创建",
      taskUpdated: "任务已更新",
      taskDeleted: "任务已删除",
      taskMoved: "任务时间已调整",
      dependencyAdded: "依赖已添加",
      dependencyRemoved: "依赖已移除"
    }
  }
};
