export default {
  kanban: {
    stats: {
      total: "总计",
      urgent: "紧急",
      overdue: "逾期",
      done: "已完成",
      completed: "完成率"
    },
    search: {
      placeholder: "搜索 Issue..."
    },
    filters: {
      typeLabel: "类型",
      priorityLabel: "优先级"
    },
    column: {
      overdueSuffix: "项逾期",
      noIssues: "暂无 Issue",
      addIssue: "添加 Issue",
      sort: {
        priority: "按优先级",
        dueDate: "按截止日期",
        recent: "按最近更新",
        created: "按创建时间"
      }
    },
    contextMenu: {
      moveToTodo: "移至待办",
      moveToInProgress: "移至进行中",
      moveToInReview: "移至评审中",
      moveToDone: "移至已完成",
      deleteIssue: "删除 Issue"
    },
    createDialog: {
      title: "创建 Issue",
      formTitle: "标题",
      formTitlePlaceholder: "Issue 标题",
      formType: "类型",
      formPriority: "优先级",
      formStatus: "状态",
      formAssignee: "负责人",
      formAssigneePlaceholder: "负责人姓名",
      formDueDate: "截止日期",
      formDueDatePlaceholder: "选择日期",
      formLabels: "标签",
      formLabelsPlaceholder: "添加标签",
      formDescription: "描述",
      formDescriptionPlaceholder: "可选描述",
      cancel: "取消",
      submit: "创建",
      createSuccess: "Issue 已创建",
      deleteConfirm: {
        title: "确认删除 '{name}'？",
        okText: "确认",
        success: "已删除"
      }
    },
    message: {
      priorityChanged: "'{name}' 优先级 → {priority}",
      statusChanged: "'{name}' 状态 → {status}",
      movedTo: "'{name}' 已移动至 {status}"
    },
    loading: "加载看板数据…",
    loadFailed: "看板数据加载失败",
    swimlane: {
      title: "泳道",
      none: "无泳道",
      byAssignee: "按负责人",
      byPriority: "按优先级",
      byType: "按类型",
      byProject: "按项目",
      byLabel: "按标签"
    },
    wip: {
      title: "在制品限制",
      limit: "限制 {current}/{max}",
      exceeded: "超出在制品限制",
      column: "列限制"
    },
    columnManager: {
      title: "列管理",
      addColumn: "添加列",
      editColumn: "编辑列",
      deleteColumn: "删除列",
      deleteConfirm: "确认删除列「{name}」？列中的 Issue 将移至「待办」。",
      name: "列名称",
      namePlaceholder: "列名称",
      nameRequired: "列名称不能为空",
      colorLabel: "列颜色",
      wipLimit: "WIP 限制",
      wipLimitHint: "留空表示不限",
      save: "保存",
      reset: "恢复默认列"
    },
    viewMode: {
      board: "看板",
      table: "表格"
    }
  }
};
