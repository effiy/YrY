export default {
  rag: {
    title: "RAG 检索",
    searchPlaceholder: "输入查询内容…",
    search: "搜索",
    searching: "检索中…",
    results: "检索结果",
    resultCount: "共 {total} 条结果（{time}ms）",
    noResults: "未找到相关结果",
    noResultsHint: "尝试调整查询措辞、扩展关键词或切换检索模式",
    sources: "来源",
    relevance: "相关度",
    relevanceHigh: "高相关",
    relevanceMedium: "中相关",
    relevanceLow: "低相关",
    modes: {
      label: "检索模式",
      hybrid: "混合检索",
      hybridDesc: "结合关键词与语义匹配",
      semantic: "语义检索",
      semanticDesc: "基于向量相似度的语义匹配",
      keyword: "关键词检索",
      keywordDesc: "基于 BM25 的精确关键词匹配"
    },
    filters: {
      title: "高级筛选",
      role: "按角色",
      roleAll: "全部角色",
      category: "按分类",
      categoryAll: "全部分类",
      dateRange: "时间范围",
      fileType: "文件类型",
      fileTypeAll: "全部类型",
      minRelevance: "最低相关度",
      clearAll: "清除筛选",
      apply: "应用筛选"
    },
    settings: {
      title: "检索设置",
      topK: "返回结果数",
      topKHint: "控制返回的最相关文档数量",
      chunkSize: "分块大小",
      chunkOverlap: "分块重叠",
      useReranker: "启用重排序",
      rerankerModel: "重排序模型",
      embeddingModel: "嵌入模型"
    },
    resultCard: {
      title: "标题",
      path: "路径",
      role: "角色",
      category: "分类",
      tags: "标签",
      updated: "更新于 {time}",
      score: "相关度：{score}",
      preview: "内容预览",
      expand: "展开全文",
      collapse: "收起全文",
      viewSource: "查看源文件",
      openInKnowledge: "在知识库中打开",
      copyContent: "复制内容",
      contentCopied: "内容已复制"
    },
    chat: {
      title: "基于检索结果问答",
      questionPlaceholder: "基于检索到的文档提问…",
      ask: "提问",
      answering: "生成回答…",
      answer: "回答",
      sourcesUsed: "参考来源",
      noSourcesUsed: "无法确定参考来源",
      startNewChat: "开始新对话",
      clearContext: "清空上下文",
      contextEmpty: "尚未选择任何参考文档"
    },
    feedback: {
      helpful: "有帮助",
      notHelpful: "无帮助",
      report: "反馈问题",
      feedbackSent: "感谢反馈",
      feedbackPlaceholder: "请描述具体问题…",
      submit: "提交反馈"
    },
    history: {
      title: "搜索历史",
      empty: "暂无搜索历史",
      clear: "清空历史",
      reuseSearch: "重新搜索"
    },
    empty: {
      initial: "输入查询内容以检索相关知识",
      loading: "正在加载知识库索引…",
      indexFailed: "知识库索引加载失败"
    },
    error: {
      searchFailed: "检索失败，请稍后重试",
      timeout: "检索超时，请缩小查询范围",
      indexNotReady: "知识库索引尚未就绪"
    }
  }
};
