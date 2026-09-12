export default {
  rss: {
    menu: "RSS Feeds",
    title: "RSS Feeds",
    scheduler: {
      title: "RSS Scheduler",
      statusUnknown: "Unknown",
      statusRunning: "Running",
      statusStopped: "Stopped",
      refreshStatus: "Refresh status",
      refreshSeeds: "Refresh seeds",
      start: "Start",
      stop: "Stop",
      addSeed: "Add Seed",
      parseAll: "Parse All Now",
      started: "Scheduler started",
      stopped: "Scheduler stopped",
      parseAllDone: "Parsed {total} sources: {ok} ok, {fail} failed",
      parseFailed: "Batch parse failed",
      startFailed: "Failed to start scheduler",
      stopFailed: "Failed to stop scheduler",
      batchParseFailed: "Batch parse failed",
      every: "every",
      config: "Scheduler config",
      configTitle: "Scheduler Configuration",
      configInterval: "Interval (sec)",
      configIntervalPlaceholder: "e.g. 3600 (hourly)",
      configApply: "Apply",
      configApplied: "Config updated",
      configFailed: "Failed to update config",
      importOpml: "Import OPML",
      exportOpml: "Export OPML",
      opmlImported: "Imported {n} seeds",
      opmlImportedWithSkips: "Imported {ok}/{total}, skipped {skipped} duplicate/failed",
      opmlImportFailed: "OPML parse failed",
      opmlExported: "Exported {n} seeds",
      opmlEmpty: "No seeds to export",
      urlInvalid: "Invalid URL (must start with http:// or https://)"
    },
    seeds: {
      title: "Seeds",
      empty: "No seeds configured",
      name: "Name",
      url: "URL",
      category: "Category",
      enabled: "Enabled",
      actions: "Actions",
      addTitle: "Add Seed",
      editTitle: "Edit Seed",
      deleteConfirm: "Delete seed \"{name}\"?",
      deleted: "Deleted",
      added: "Seed added",
      updated: "Seed updated",
      enabledToast: "Enabled",
      disabledToast: "Disabled",
      save: "Save",
      cancel: "Cancel",
      urlPlaceholder: "https://example.com/feed.xml",
      namePlaceholder: "Optional display name",
      categoryPlaceholder: "e.g. aier/methodology (optional override)",
      tagsPlaceholder: "comma-separated",
      urlRequired: "URL is required",
      testFetch: "Test",
      testOk: "Test OK: {saved} new, {updated} updated",
      testFail: "Test failed: {error}",
      interval: "Interval (sec)",
      intervalPlaceholder: "Leave empty to use scheduler global interval",
      itemsUnit: "items",
      lastParsed: "Last parsed",
      neverParsed: "never",
      parsedToday: "today",
      parsedDaysAgo: "{n}d ago",
      stale: "stale",
      staleTooltip: "Seed hasn't updated in 7+ days — feed may be broken or scheduler stopped",
      parseSeed: "Parse this seed now",
      summarizeSeed: "Summarize this seed in aiChat",
      summarizeSeedsBulk: "Summarize {n} seeds in aiChat",
      filterBySource: "Show items from this source only",
      parseImmediately: "Parse immediately after save",
      noItemsTitle: "No RSS items yet",
      noItemsHint: "Add a seed and run parse first.",
      summarizePromptTitle: "Summarize RSS feed: {name}",
      summarizePromptPrelude: "Based on the {n} RSS items below, write a summary of around 300 words (English) or 300 字 (Chinese) covering the key points."
    },
    items: {
      title: "Title",
      source: "Source",
      category: "Category",
      published: "Published",
      readTime: "Read time",
      readMinutes: "~{n} min",
      author: "Author",
      updated: "Updated",
      actions: "Actions",
      searchTooltip: "Search title / link / author",
      discussInAiChat: "Discuss in aiChat",
      discussBatch: "Discuss {n} in aiChat",
      summarizeInAiChat: "Summarize in aiChat",
      summarizeBatch: "Summarize {n} in aiChat",
      batchTruncateHint: "Only the first 8 of {n} selected items were ingested to stay within context limits.",
      viewDetail: "View detail",
      openSource: "Open source link",
      reparseFeed: "Re-parse this feed",
      parseOneOk: "Parsed {name}: {saved} new, {updated} updated",
      parseOneFail: "Parse failed: {error}",
      parseFailed: "Parse failed",
      detailTitle: "RSS Item",
      detailCopyLink: "Copy link",
      detailOpenSource: "Open source",
      detailLinkCopied: "Link copied",
      detailCopyFailed: "Copy failed",
      detailBodyEmpty: "No body available. Open the source link to view the original article.",
      detailBodyError: "Failed to load article body",
      detailFile: "File",
      detailLink: "Link",
      detailTags: "Tags",
      detailDiscussInAiChat: "Send to aiChat",
      quickSummarize: "Summarize",
      quickTranslate: "Translate",
      quickCritique: "Critique",
      deleteItemConfirm: "Delete this RSS item? (Metadata only — the markdown under YiKnowledge is not removed.)",
      deleteBatchConfirm: "Delete {n} selected RSS items?",
      deleteSelected: "Delete selected",
      deleted: "Deleted",
      deleteFailed: "Delete failed",
      markRead: "Mark as read",
      markUnread: "Mark as unread",
      unreadTooltip: "Unread",
      summarize: "Summarize in aiChat",
      detailNext: "Next",
      markAllRead: "Mark current page as read",
      markAllReadDone: "Marked current page as read",
      markSelectedRead: "Mark selected as read",
      exportSelected: "Export as Markdown",
      exportDone: "Exported {n} items to {file}",
      detailShortcutHint: "Shortcuts: j/k navigate · o open source · d discuss · s summarize · t translate · c critique",
      sortUpdatedDesc: "Updated (newest)",
      sortUpdatedAsc: "Updated (oldest)",
      sortCreatedDesc: "Created (newest)",
      star: "Star",
      starred: "Starred",
      unstar: "Unstar",
      showStarredOnly: "Show starred only",
      showUnreadOnly: "Show unread only",
      starTooltip: "Star",
      tagsEditorTitle: "Tags",
      tagsAddPlaceholder: "Add tag and press Enter",
      tagsSaved: "Tags updated",
      tagsSaveFailed: "Failed to update tags",
      relatedSessions: "Related aiChat sessions",
      relatedSessionsAll: "View all",
      relatedSessionsEmpty: "No related aiChat sessions yet"
    },
    manager: {
      breadcrumb: {
        executive: "Executive",
        rss: "RSS"
      },
      sticky: {
        allRolesTitle: "All Roles RSS Manager",
        singleRoleTitle: "{name} RSS Manager",
        multiRoleTitle: "{n} Roles RSS Manager",
        allRolesDesc: "Aggregated RSS feeds and articles across all roles.",
        feeds: "Feeds",
        articles: "Articles",
        today: "Today",
        viewFeeds: "View feed sources",
        viewArticles: "View all articles",
        backToBriefing: "Back to today's briefing"
      },
      sidebar: {
        sections: "Sections",
        view: {
          list: "List",
          card: "Card",
          table: "Table"
        },
        tabs: {
          briefing: "Daily Briefing",
          seeds: "Feed Sources",
          items: "Articles"
        }
      },
      briefing: {
        title: "📰 Daily Briefing",
        todayLabel: "Today · {date}",
        goToday: "Today",
        groupBy: {
          source: "By Source",
          category: "By Category"
        },
        resultCount: "{count} articles · {groups} {unit}",
        groupUnit: {
          source: "sources",
          category: "categories"
        },
        refresh: "Refresh",
        searchPlaceholder: "Search title, author...",
        categoryAll: "All categories",
        clear: "Clear",
        activeFilters: {
          search: "Search: {value}",
          category: "Category: {value}"
        },
        charts: {
          categoryDist: "Category Distribution",
          topSources: "Top Sources",
          volumeTrend: "Volume · Last {n} Days"
        },
        coverage: {
          withSummary: "With summary",
          withAuthor: "With author",
          categorized: "Categorized"
        },
        empty: {
          todayIcon: "🗞️",
          dateIcon: "📭",
          todayTitle: "No new articles today",
          dateTitle: "No articles for this date",
          todayHint: "Go to \"📡 Feed Sources\" to add and parse a feed — your daily briefing will appear here shortly.",
          dateHint: "Try a different date, or jump back to today for the latest.",
          backToday: "Back to Today",
          noMatchIcon: "🔍",
          noMatchTitle: "No matching articles",
          noMatchHint: "The current search or category filters did not match any articles.",
          clearFilters: "Clear filters"
        },
        table: {
          noData: "No articles for this date.",
          source: "Source",
          title: "Title",
          author: "Author",
          published: "Published",
          category: "Category",
          summary: "Summary",
          actions: "Actions",
          detail: "Details",
          deleteConfirm: "Delete this article?"
        },
        deleteOk: "Article deleted",
        deleteFail: "Failed to delete article"
      },
      seeds: {
        title: "📡 Feed Sources",
        resultCount: "{filtered} of {total} sources",
        addSource: "Add Source",
        parseAllBtn: "Parse All",
        quickParseBtn: "Quick Parse",
        searchPlaceholder: "Search name, URL...",
        table: {
          noData: "No feed sources yet. Add one to start fetching articles.",
          name: "Name",
          feedUrl: "Feed URL",
          category: "Category",
          interval: "Interval",
          active: "Active",
          articles: "Articles",
          lastParsed: "Last Parsed",
          actions: "Actions",
          parse: "Parse",
          editing: "...",
          edit: "Edit",
          globalInterval: "global",
          neverParsed: "never"
        },
        card: {
          globalInterval: "global",
          articles: "{n} articles",
          neverParsed: "never"
        },
        deleteConfirm: "Remove this source and all its articles?",
        added: "Added {n} new feed sources",
        dialog: {
          addTitle: "Add Source",
          editTitle: "Edit Source",
          feedUrl: "Feed URL",
          feedUrlPlaceholder: "https://example.com/rss.xml",
          name: "Name",
          namePlaceholder: "Display name",
          targetCategory: "Target Category",
          autoClassify: "Auto-classify",
          overrideHint: "Override classification target. Leave empty for auto.",
          fetchInterval: "Fetch Interval",
          globalDefault: "Global default",
          schedulerHint: "Leave empty to use the global scheduler setting.",
          status: "Status",
          active: "Active",
          paused: "Paused"
        },
        quickParse: {
          title: "Quick Parse URL",
          url: "URL",
          urlPlaceholder: "https://example.com/rss.xml",
          name: "Name",
          nameOptional: "Optional",
          parse: "Parse",
          parseOk: "Parsed: {saved} new, {updated} updated",
          parseFail: "Quick parse failed",
          urlRequired: "URL is required"
        },
        save: {
          urlRequired: "Feed URL is required",
          updateOk: "Source updated",
          addOk: "Source added",
          fail: "Failed to save source"
        },
        remove: {
          ok: "Source removed",
          fail: "Failed to remove source"
        },
        toggle: {
          enabled: "Source enabled",
          disabled: "Source paused",
          fail: "Failed to toggle source"
        },
        parseOne: {
          ok: "Parsed: {saved} new, {updated} updated",
          fail: "Parse failed"
        },
        parseAll: {
          ok: "{total} sources: {ok} ok, {fail} failed",
          fail: "Batch parse failed"
        }
      },
      items: {
        title: "📄 Articles",
        resultCount: "{filtered} of {total} articles",
        batchDelete: "Delete ({n})",
        clearFilters: "Clear",
        exportBtn: "Export",
        refresh: "Refresh",
        searchPlaceholder: "Search title, author...",
        categoryAll: "All categories",
        sourceAll: "All sources",
        timePreset: {
          all: "All",
          today: "Today",
          week: "Week",
          month: "Month"
        },
        dateRange: {
          from: "From",
          to: "To"
        },
        sort: {
          newest: "Newest",
          oldest: "Oldest",
          source: "Source",
          category: "Category"
        },
        activeFilters: {
          search: "Search: {value}",
          category: "Category: {value}",
          source: "Source: {value}",
          date: "Date: {from} ~ {to}"
        },
        recent: {
          label: "Recently opened",
          clear: "✕",
          clearTitle: "Clear recently opened"
        },
        empty: {
          noMatch: "No matching articles",
          noMatchHint: "Adjust the filters or role selection above.",
          clearFilters: "Clear filters",
          noItems: "No articles yet. Add a feed source and click Parse."
        },
        table: {
          title: "Title",
          published: "Published",
          category: "Category",
          actions: "Actions",
          detail: "Details",
          noData: {
            filtered: "No matching articles.",
            empty: "No articles yet. Add a feed source and click Parse."
          },
          deleteConfirm: "Delete this article?"
        },
        export: {
          noData: "No articles to export.",
          ok: "Exported {n} articles",
          fail: "Failed to export articles"
        },
        delete: {
          ok: "Article deleted",
          fail: "Failed to delete article"
        },
        batch: {
          title: "Batch Delete",
          confirm: "Delete {n} articles?",
          deleteBtn: "Delete",
          cancel: "Cancel",
          ok: "Deleted {n} articles"
        }
      },
      detail: {
        defaultTitle: "Article",
        fields: {
          source: "Source",
          author: "Author",
          category: "Category",
          published: "Published",
          tags: "Tags",
          summary: "Summary",
          noSummary: "No summary available for this article.",
          body: "Body",
          loadingBody: "Reading article body…",
          noBodyFile: "No body file — metadata-only record.",
          noBodyContent: "No body content.",
          missingMarkdown: "The ingested markdown for this article is missing from YiKnowledge.",
          unknown: "—"
        },
        open: "Open article"
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
            industry: "Industry · market trends, competitors, reports",
            strategy: "Strategy · frameworks, compliance, positioning",
            roadmap: "Roadmap · planning, OKR, budget",
            readingList: "Reading List · curated executive readings"
          },
          aier: {
            methodology: "Methodology · tools, workflows, best practices",
            foundations: "Foundations · papers, research, theory"
          },
          engineer: {
            ship: "Ship · data & reliability",
            learnLessons: "Learn · Lessons",
            learnWins: "Learn · Wins",
            learnFailures: "Learn · Failures"
          },
          srer: {
            release: "Release · deployment, infrastructure"
          },
          producter: {
            frameworks: "Frameworks · product strategy, growth"
          },
          curator: {
            templates: "Templates · knowledge curation"
          },
          leader: {
            leadership: "Tech Leadership · team, culture, scaling",
            architecture: "Architecture · system design, patterns"
          }
        },
        uncategorized: "Uncategorized",
        unknownSource: "Unknown"
      },
      common: {
        save: "Save",
        cancel: "Cancel"
      },
      time: {
        justNow: "just now",
        minutesAgo: "{n}m ago",
        hoursAgo: "{n}h ago",
        daysAgo: "{n}d ago"
      }
    }
  }
};
