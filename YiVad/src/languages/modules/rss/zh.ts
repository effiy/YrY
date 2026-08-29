export default {
  rss: {
    menu: "RSS 订阅",
    title: "RSS 订阅源",
    scheduler: {
      title: "RSS 调度器",
      statusUnknown: "未知",
      statusRunning: "运行中",
      statusStopped: "已停止",
      refreshStatus: "刷新状态",
      refreshSeeds: "刷新种子源",
      start: "启动",
      stop: "停止",
      addSeed: "新增种子源",
      parseAll: "立即全部解析",
      started: "调度器已启动",
      stopped: "调度器已停止",
      parseAllDone: "已解析 {total} 个源：成功 {ok}，失败 {fail}",
      parseFailed: "批量解析失败",
      startFailed: "启动失败",
      stopFailed: "停止失败",
      batchParseFailed: "批量解析失败",
      every: "每",
      config: "调度器配置",
      configTitle: "调度器配置",
      configInterval: "间隔（秒）",
      configIntervalPlaceholder: "例如 3600（每小时一次）",
      configApply: "应用",
      configApplied: "配置已更新",
      configFailed: "配置更新失败",
      importOpml: "导入 OPML",
      exportOpml: "导出 OPML",
      opmlImported: "已导入 {n} 个种子源",
      opmlImportedWithSkips: "已导入 {ok}/{total} 个，跳过 {skipped} 个重复/失败",
      opmlImportFailed: "OPML 解析失败",
      opmlExported: "已导出 {n} 个种子源",
      opmlEmpty: "无种子源可导出",
      urlInvalid: "URL 格式不正确（需以 http:// 或 https:// 开头）"
    },
    seeds: {
      title: "种子源",
      empty: "尚未配置任何种子源",
      name: "名称",
      url: "URL",
      category: "分类",
      enabled: "启用",
      actions: "操作",
      addTitle: "新增种子源",
      editTitle: "编辑种子源",
      deleteConfirm: "删除种子源「{name}」？",
      deleted: "已删除",
      added: "已新增",
      updated: "已更新",
      enabledToast: "已启用",
      disabledToast: "已禁用",
      save: "保存",
      cancel: "取消",
      urlPlaceholder: "https://example.com/feed.xml",
      namePlaceholder: "可选显示名",
      categoryPlaceholder: "例如 aier/methodology（可选覆盖）",
      tagsPlaceholder: "逗号分隔",
      urlRequired: "URL 不能为空",
      testFetch: "测试",
      testOk: "测试成功：新增 {saved}，更新 {updated}",
      testFail: "测试失败：{error}",
      interval: "解析间隔（秒）",
      intervalPlaceholder: "留空使用调度器全局间隔",
      itemsUnit: "条",
      lastParsed: "上次解析",
      neverParsed: "从未解析",
      parsedToday: "今天",
      parsedDaysAgo: "{n} 天前",
      stale: "陈旧",
      staleTooltip: "该源已超过 7 天未更新，可能解析失败或调度器未运行",
      parseSeed: "立即解析该源",
      summarizeSeed: "在 aiChat 中汇总该源",
      summarizeSeedsBulk: "汇总 {n} 个源到 aiChat",
      filterBySource: "只看该源的条目",
      parseImmediately: "保存后立即解析",
      noItemsTitle: "尚无 RSS 条目",
      noItemsHint: "请先新增种子源并执行解析",
      summarizePromptTitle: "汇总 RSS 源：{name}",
      summarizePromptPrelude: "请基于以下 {n} 篇 RSS 条目正文，生成一份 300 字以内的中文摘要，按要点列出关键信息。"
    },
    items: {
      title: "标题",
      source: "来源",
      category: "分类",
      published: "发布时间",
      readTime: "阅读时长",
      readMinutes: "约 {n} 分钟",
      author: "作者",
      updated: "更新时间",
      actions: "操作",
      searchTooltip: "搜索标题 / 链接 / 作者",
      discussInAiChat: "在 aiChat 中讨论",
      discussBatch: "在 aiChat 中讨论 {n}",
      summarizeInAiChat: "在 aiChat 中汇总",
      summarizeBatch: "汇总 {n} 篇到 aiChat",
      batchTruncateHint: "选中条目超过 8 条，仅前 8 条已注入以符合上下文上限。",
      viewDetail: "查看详情",
      openSource: "打开源链接",
      reparseFeed: "重新解析该源",
      parseOneOk: "已解析 {name}：新增 {saved}，更新 {updated}",
      parseOneFail: "解析失败：{error}",
      parseFailed: "解析失败",
      detailTitle: "RSS 条目",
      detailCopyLink: "复制链接",
      detailOpenSource: "打开源链接",
      detailLinkCopied: "链接已复制",
      detailCopyFailed: "复制失败",
      detailBodyEmpty: "无可用正文，请打开源链接查看原文。",
      detailBodyError: "正文加载失败",
      detailFile: "文件",
      detailLink: "链接",
      detailTags: "标签",
      detailDiscussInAiChat: "发送到 aiChat 讨论",
      quickSummarize: "摘要",
      quickTranslate: "翻译",
      quickCritique: "评析",
      deleteItemConfirm: "删除该 RSS 条目（仅元数据，YiKnowledge 中的 markdown 不会删除）？",
      deleteBatchConfirm: "删除选中的 {n} 条 RSS 条目？",
      deleteSelected: "删除选中",
      deleted: "已删除",
      deleteFailed: "删除失败",
      markRead: "标记已读",
      markUnread: "标记未读",
      unreadTooltip: "未读",
      summarize: "在 aiChat 中汇总",
      detailNext: "下一条",
      markAllRead: "本页全部标为已读",
      markAllReadDone: "已标记本页为已读",
      markSelectedRead: "选中标为已读",
      exportSelected: "导出为 Markdown",
      exportDone: "已导出 {n} 条到 {file}",
      detailShortcutHint: "快捷键：j/k 切换 · o 打开源 · d 讨论 · s 摘要 · t 翻译 · c 评析",
      sortUpdatedDesc: "按更新时间 倒序",
      sortUpdatedAsc: "按更新时间 正序",
      sortCreatedDesc: "按创建时间 倒序",
      star: "收藏",
      starred: "已收藏",
      unstar: "取消收藏",
      showStarredOnly: "只看收藏",
      showUnreadOnly: "只看未读",
      starTooltip: "收藏",
      tagsEditorTitle: "标签",
      tagsAddPlaceholder: "添加标签后回车",
      tagsSaved: "标签已更新",
      tagsSaveFailed: "标签更新失败",
      relatedSessions: "相关 aiChat 会话",
      relatedSessionsAll: "查看全部",
      relatedSessionsEmpty: "暂无相关 aiChat 会话"
    },
    manager: {
      breadcrumb: {
        executive: "Executive",
        rss: "RSS"
      },
      sticky: {
        allRolesTitle: "全部角色 RSS 管理",
        singleRoleTitle: "{name} RSS 管理",
        multiRoleTitle: "{n} 个角色 RSS 管理",
        allRolesDesc: "聚合全部角色的 RSS 订阅源与文章。",
        feeds: "订阅源",
        articles: "文章",
        today: "今日",
        viewFeeds: "查看订阅源",
        viewArticles: "查看全部文章",
        backToBriefing: "返回今日简报"
      },
      sidebar: {
        sections: "功能区",
        view: {
          list: "列表",
          card: "卡片",
          table: "表格"
        },
        tabs: {
          briefing: "每日简报",
          seeds: "订阅源",
          items: "文章"
        }
      },
      briefing: {
        title: "📰 每日简报",
        todayLabel: "今日 · {date}",
        goToday: "今日",
        groupBy: {
          source: "按来源",
          category: "按分类"
        },
        resultCount: "{count} 篇文章 · {groups} 个{unit}",
        groupUnit: {
          source: "来源",
          category: "分类"
        },
        refresh: "刷新",
        searchPlaceholder: "搜索标题、作者…",
        categoryAll: "全部分类",
        clear: "清除",
        activeFilters: {
          search: "搜索：{value}",
          category: "分类：{value}"
        },
        charts: {
          categoryDist: "分类分布",
          topSources: "Top 来源",
          volumeTrend: "文章量 · 最近 {n} 天"
        },
        coverage: {
          withSummary: "含摘要",
          withAuthor: "含作者",
          categorized: "已分类"
        },
        empty: {
          todayIcon: "🗞️",
          dateIcon: "📭",
          todayTitle: "今日暂无新文章",
          dateTitle: "该日期暂无文章",
          todayHint: "前往「📡 订阅源」添加源并解析，稍后即可在这里生成每日简报。",
          dateHint: "换个日期看看，或返回今日查看最新文章。",
          backToday: "返回今日",
          noMatchIcon: "🔍",
          noMatchTitle: "没有匹配的文章",
          noMatchHint: "当前搜索或分类筛选没有命中任何文章。",
          clearFilters: "清除筛选"
        },
        table: {
          noData: "该日期暂无文章。",
          source: "来源",
          title: "标题",
          author: "作者",
          published: "发布时间",
          category: "分类",
          summary: "摘要",
          actions: "操作",
          detail: "详情",
          deleteConfirm: "删除这篇文章？"
        },
        deleteOk: "文章已删除",
        deleteFail: "删除文章失败"
      },
      seeds: {
        title: "📡 订阅源",
        resultCount: "共 {total} 个，筛选出 {filtered} 个",
        addSource: "添加源",
        parseAllBtn: "全部解析",
        quickParseBtn: "快速解析",
        searchPlaceholder: "搜索名称、URL…",
        table: {
          noData: "尚未配置订阅源，添加一个开始抓取文章。",
          name: "名称",
          feedUrl: "Feed URL",
          category: "分类",
          interval: "间隔",
          active: "启用",
          articles: "文章数",
          lastParsed: "上次解析",
          actions: "操作",
          parse: "解析",
          editing: "…",
          edit: "编辑",
          globalInterval: "全局",
          neverParsed: "从未"
        },
        card: {
          globalInterval: "全局",
          articles: "{n} 篇文章",
          neverParsed: "从未"
        },
        deleteConfirm: "删除该订阅源及其所有文章？",
        added: "已添加 {n} 个新订阅源",
        dialog: {
          addTitle: "添加源",
          editTitle: "编辑源",
          feedUrl: "Feed URL",
          feedUrlPlaceholder: "https://example.com/rss.xml",
          name: "名称",
          namePlaceholder: "显示名称",
          targetCategory: "目标分类",
          autoClassify: "自动分类",
          overrideHint: "覆盖自动分类结果，留空则自动分类。",
          fetchInterval: "抓取间隔",
          globalDefault: "使用全局默认",
          schedulerHint: "留空则使用调度器的全局设置。",
          status: "状态",
          active: "启用",
          paused: "暂停"
        },
        quickParse: {
          title: "快速解析 URL",
          url: "URL",
          urlPlaceholder: "https://example.com/rss.xml",
          name: "名称",
          nameOptional: "可选",
          parse: "解析",
          parseOk: "已解析：新增 {saved}，更新 {updated}",
          parseFail: "快速解析失败",
          urlRequired: "请填写 URL"
        },
        save: {
          urlRequired: "Feed URL 不能为空",
          updateOk: "源已更新",
          addOk: "源已添加",
          fail: "保存源失败"
        },
        remove: {
          ok: "源已删除",
          fail: "删除源失败"
        },
        toggle: {
          enabled: "源已启用",
          disabled: "源已暂停",
          fail: "切换源状态失败"
        },
        parseOne: {
          ok: "已解析：新增 {saved}，更新 {updated}",
          fail: "解析失败"
        },
        parseAll: {
          ok: "{total} 个源：成功 {ok}，失败 {fail}",
          fail: "批量解析失败"
        }
      },
      items: {
        title: "📄 文章",
        resultCount: "共 {total} 篇，筛选出 {filtered} 篇",
        batchDelete: "删除（{n}）",
        clearFilters: "清除",
        exportBtn: "导出",
        refresh: "刷新",
        searchPlaceholder: "搜索标题、作者…",
        categoryAll: "全部分类",
        sourceAll: "全部来源",
        timePreset: {
          all: "全部",
          today: "今日",
          week: "本周",
          month: "本月"
        },
        dateRange: {
          from: "起",
          to: "止"
        },
        sort: {
          newest: "最新",
          oldest: "最早",
          source: "来源",
          category: "分类"
        },
        activeFilters: {
          search: "搜索：{value}",
          category: "分类：{value}",
          source: "来源：{value}",
          date: "日期：{from} ~ {to}"
        },
        recent: {
          label: "最近打开",
          clear: "✕",
          clearTitle: "清空最近打开"
        },
        empty: {
          noMatch: "没有匹配的文章",
          noMatchHint: "请调整筛选条件或角色选择。",
          clearFilters: "清除筛选",
          noItems: "暂无文章，先添加订阅源并点击「解析」。"
        },
        table: {
          title: "标题",
          published: "发布时间",
          category: "分类",
          actions: "操作",
          detail: "详情",
          noData: {
            filtered: "没有匹配的文章。",
            empty: "暂无文章，先添加订阅源并点击「解析」。"
          },
          deleteConfirm: "删除这篇文章？"
        },
        export: {
          noData: "没有可导出的文章。",
          ok: "已导出 {n} 篇文章",
          fail: "导出失败"
        },
        delete: {
          ok: "文章已删除",
          fail: "删除文章失败"
        },
        batch: {
          title: "批量删除",
          confirm: "删除 {n} 篇文章？",
          deleteBtn: "删除",
          cancel: "取消",
          ok: "已删除 {n} 篇文章"
        }
      },
      detail: {
        defaultTitle: "文章",
        fields: {
          source: "来源",
          author: "作者",
          category: "分类",
          published: "发布时间",
          tags: "标签",
          summary: "摘要",
          noSummary: "该文章暂无摘要。",
          body: "正文",
          loadingBody: "正在读取文章正文…",
          noBodyFile: "无正文文件，仅保留元数据记录。",
          noBodyContent: "无正文内容。",
          missingMarkdown: "该文章对应的 YiKnowledge 入库 markdown 已缺失。",
          unknown: "—"
        },
        open: "打开原文"
      },
      categories: {
        groups: {
          executiver: "Executiver",
          aier: "AI Engineer",
          engineer: "Engineer",
          sre: "SRE",
          producter: "Product Manager",
          curator: "Curator",
          leader: "Leader"
        },
        options: {
          executiver: {
            industry: "行业 · 市场趋势、竞品、研报",
            strategy: "战略 · 框架、合规、定位",
            roadmap: "路线图 · 规划、OKR、预算",
            readingList: "阅读清单 · 精选高管读物"
          },
          aier: {
            methodology: "方法论 · 工具、工作流、最佳实践",
            foundations: "基础 · 论文、研究、理论"
          },
          engineer: {
            ship: "交付 · 数据与可靠性",
            learnLessons: "经验 · 教训",
            learnWins: "经验 · 成功案例",
            learnFailures: "经验 · 失败案例"
          },
          srer: {
            release: "发布 · 部署、基础设施"
          },
          producter: {
            frameworks: "框架 · 产品战略、增长"
          },
          curator: {
            templates: "模板 · 知识策展"
          },
          leader: {
            leadership: "技术管理 · 团队、文化、规模化",
            architecture: "架构 · 系统设计、模式"
          }
        },
        uncategorized: "未分类",
        unknownSource: "未知"
      },
      common: {
        save: "保存",
        cancel: "取消"
      },
      time: {
        justNow: "刚刚",
        minutesAgo: "{n} 分钟前",
        hoursAgo: "{n} 小时前",
        daysAgo: "{n} 天前"
      }
    }
  }
};
