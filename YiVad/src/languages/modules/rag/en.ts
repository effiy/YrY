export default {
  rag: {
    title: "RAG Search",
    searchPlaceholder: "Enter your query…",
    search: "Search",
    searching: "Searching…",
    results: "Results",
    resultCount: "{total} results ({time}ms)",
    noResults: "No relevant results found",
    noResultsHint: "Try rephrasing your query, expanding keywords, or switching search mode",
    sources: "Sources",
    relevance: "Relevance",
    relevanceHigh: "High",
    relevanceMedium: "Medium",
    relevanceLow: "Low",
    modes: {
      label: "Search Mode",
      hybrid: "Hybrid",
      hybridDesc: "Combines keyword and semantic matching",
      semantic: "Semantic",
      semanticDesc: "Vector similarity-based semantic matching",
      keyword: "Keyword",
      keywordDesc: "Exact BM25 keyword matching"
    },
    filters: {
      title: "Advanced Filters",
      role: "By role",
      roleAll: "All roles",
      category: "By category",
      categoryAll: "All categories",
      dateRange: "Date range",
      fileType: "File type",
      fileTypeAll: "All types",
      minRelevance: "Min relevance",
      clearAll: "Clear filters",
      apply: "Apply filters"
    },
    settings: {
      title: "Search Settings",
      topK: "Result count",
      topKHint: "Number of most relevant documents to return",
      chunkSize: "Chunk size",
      chunkOverlap: "Chunk overlap",
      useReranker: "Enable re-ranker",
      rerankerModel: "Re-ranker model",
      embeddingModel: "Embedding model"
    },
    resultCard: {
      title: "Title",
      path: "Path",
      role: "Role",
      category: "Category",
      tags: "Tags",
      updated: "Updated {time}",
      score: "Relevance: {score}",
      preview: "Preview",
      expand: "Expand",
      collapse: "Collapse",
      viewSource: "View source",
      openInKnowledge: "Open in Knowledge Base",
      copyContent: "Copy content",
      contentCopied: "Content copied"
    },
    chat: {
      title: "Q&A from Search Results",
      questionPlaceholder: "Ask a question based on retrieved documents…",
      ask: "Ask",
      answering: "Generating answer…",
      answer: "Answer",
      sourcesUsed: "Sources referenced",
      noSourcesUsed: "Could not determine source references",
      startNewChat: "Start new chat",
      clearContext: "Clear context",
      contextEmpty: "No reference documents selected"
    },
    feedback: {
      helpful: "Helpful",
      notHelpful: "Not helpful",
      report: "Report issue",
      feedbackSent: "Thank you for your feedback",
      feedbackPlaceholder: "Describe the specific issue…",
      submit: "Submit feedback"
    },
    history: {
      title: "Search History",
      empty: "No search history",
      clear: "Clear history",
      reuseSearch: "Search again"
    },
    empty: {
      initial: "Enter a query to search knowledge",
      loading: "Loading knowledge base index…",
      indexFailed: "Failed to load knowledge base index"
    },
    error: {
      searchFailed: "Search failed, please try again later",
      timeout: "Search timed out, try narrowing your query",
      indexNotReady: "Knowledge base index is not yet ready"
    }
  }
};
