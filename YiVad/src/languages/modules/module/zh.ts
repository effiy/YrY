export default {
  module: {
    list: {
      title: "模块",
      description: "管理系统模块架构与组件依赖",
      search: "搜索模块…",
      searchPlaceholder: "按名称、Key 或负责人搜索",
      newModule: "新建模块",
      refresh: "刷新",
      export: "导出 CSV",
      filters: "筛选",
      clearAll: "清除全部",
      sortBy: {
        name: "按名称",
        issues: "按 Issue 数",
        updated: "按更新时间"
      },
      viewMode: {
        grid: "网格",
        list: "列表"
      },
      empty: {
        noModules: "暂无模块",
        noMatch: "无匹配的模块",
        createFirst: "创建第一个模块"
      }
    },
    detail: {
      notFound: "模块未找到",
      notFoundSub: "此模块不存在或已被删除。",
      backToModules: "返回模块列表",
      tabs: {
        overview: "概览",
        issues: "Issue",
        bugs: "Bug",
        docs: "文档",
        dependencies: "依赖关系",
        history: "变更历史",
        settings: "设置"
      },
      overview: {
        description: "模块描述",
        noDescription: "暂无描述",
        lead: "负责人",
        noLead: "未指定",
        members: "成员",
        noMembers: "暂无成员",
        addMember: "添加成员",
        stats: {
          openIssues: "待处理 Issue",
          resolvedIssues: "已解决 Issue",
          openBugs: "待修复 Bug",
          resolvedBugs: "已解决 Bug",
          codeCoverage: "代码覆盖率",
          lastDeploy: "最近部署"
        },
        activity: {
          title: "最近动态",
          empty: "暂无动态"
        }
      },
      dependencies: {
        title: "模块依赖",
        dependsOn: "依赖的模块",
        dependedBy: "被以下模块依赖",
        noDependencies: "无依赖关系",
        add: "添加依赖",
        remove: "移除依赖",
        circularWarning: "检测到循环依赖"
      },
      history: {
        title: "变更历史",
        empty: "暂无变更记录",
        created: "模块创建",
        updated: "信息更新",
        memberAdded: "添加成员 {user}",
        memberRemoved: "移除成员 {user}",
        dependencyAdded: "添加依赖 {module}",
        dependencyRemoved: "移除依赖 {module}"
      }
    },
    table: {
      name: "名称",
      key: "Key",
      project: "所属项目",
      lead: "负责人",
      issues: "Issue 数",
      bugs: "Bug 数",
      members: "成员数",
      status: "状态",
      updated: "更新时间",
      actions: "操作"
    },
    dialog: {
      createTitle: "新建模块",
      editTitle: "编辑模块",
      name: "模块名称",
      namePlaceholder: "输入模块名称",
      nameRequired: "模块名称不能为空",
      key: "模块标识",
      keyPlaceholder: "如 AUTH_SERVICE",
      keyRequired: "模块标识不能为空",
      keyPattern: "仅允许大写字母、数字和下划线",
      description: "描述",
      descriptionPlaceholder: "模块功能与职责描述",
      project: "所属项目",
      lead: "负责人",
      leadPlaceholder: "模块负责人",
      status: "状态",
      statusActive: "活跃",
      statusMaintenance: "维护中",
      statusDeprecated: "已弃用",
      statusArchived: "已归档",
      tags: "标签",
      tagsPlaceholder: "添加标签，按回车确认",
      cancel: "取消",
      save: "保存",
      createSuccess: "模块已创建",
      updateSuccess: "模块已更新",
      deleteSuccess: "模块已删除",
      deleteConfirm: "确认删除模块「{name}」？关联的 Issue 和 Bug 将一并移除。"
    },
    messages: {
      copied: "已复制 {key}",
      clipboardUnavailable: "剪贴板不可用"
    },
    error: {
      loadFailed: "加载模块数据失败",
      saveFailed: "保存模块失败",
      deleteFailed: "删除模块失败"
    }
  }
};
