export default {
  dashboard: {
    title: "Dashboard",
    knowledgeBase: "Knowledge Base Overview",
    custom: "Custom Dashboard",
    welcome: "Welcome back, {name}",
    lastUpdated: "Last Updated",
    stats: {
      totalFiles: "Total Files",
      totalRoles: "Roles",
      activeProjects: "Active Projects",
      openIssues: "Open Issues",
      resolvedBugs: "Resolved Bugs",
      activeSprints: "Active Sprints",
      coverageRate: "Test Coverage",
      uptime: "Uptime"
    },
    charts: {
      issueTrend: "Issue Trend · Last 30 Days",
      bugResolution: "Bug Resolution · Last 14 Days",
      storyProgress: "Story Completion",
      teamVelocity: "Team Velocity",
      codeQuality: "Code Quality Trend",
      activityHeatmap: "Activity Heatmap",
      pipelineHealth: "Pipeline Health",
      resourceUsage: "Resource Usage"
    },
    widgets: {
      add: "Add Widget",
      remove: "Remove Widget",
      resize: "Resize",
      configure: "Configure",
      noWidgets: "No widgets configured. Click Add Widget to start.",
      resetLayout: "Reset Layout",
      saveLayout: "Save Layout",
      layoutSaved: "Layout saved",
      picker: {
        title: "Select Widget",
        searchPlaceholder: "Search widgets…",
        noMatch: "No matching widgets",
        categories: {
          chart: "Chart",
          metric: "Metric",
          table: "Table",
          text: "Text"
        }
      },
      settings: {
        title: "Widget Settings",
        namePlaceholder: "Widget title",
        refreshInterval: "Refresh interval (sec)",
        refreshHint: "0 means no auto-refresh",
        unknownWidget: "Unknown widget: {type}"
      },
      empty: {
        dashboard: "Dashboard is empty",
        addWidget: "Add Widget"
      },
      toolbar: {
        addWidget: "Add Widget",
        refreshAll: "Refresh all data"
      }
    },
    sections: {
      overview: "Overview",
      projects: "Project Activity",
      quality: "Quality Dashboard",
      activity: "Team Activity",
      resources: "Resources & Capacity"
    },
    empty: {
      noData: "No data available",
      noProjects: "No active projects",
      noIssues: "No open issues",
      loading: "Loading dashboard data…",
      loadFailed: "Failed to load dashboard data"
    },
    timeRange: {
      today: "Today",
      week: "This Week",
      month: "This Month",
      quarter: "This Quarter",
      year: "This Year",
      custom: "Custom range"
    },
    refresh: {
      auto: "Auto-refresh",
      manual: "Refresh now",
      interval: "Refresh interval",
      every30s: "Every 30 seconds",
      every1m: "Every minute",
      every5m: "Every 5 minutes",
      off: "Off"
    },
    export: {
      title: "Export Dashboard",
      pdf: "Export PDF",
      image: "Export Image",
      csv: "Export CSV"
    },
    drillDown: {
      clickToExplore: "Click to drill down",
      backToOverview: "Back to overview"
    }
  }
};
