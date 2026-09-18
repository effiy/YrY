export default {
  gantt: {
    title: "Gantt Chart",
    today: "Today",
    views: {
      day: "Day",
      week: "Week",
      month: "Month",
      quarter: "Quarter",
      year: "Year"
    },
    zoom: {
      in: "Zoom in",
      out: "Zoom out",
      fit: "Fit to screen",
      reset: "Reset view"
    },
    task: {
      title: "Task name",
      startDate: "Start date",
      endDate: "End date",
      duration: "Duration",
      durationDays: "{n} day(s)",
      progress: "Progress",
      assignee: "Assignee",
      status: "Status",
      dependency: "Dependencies",
      noDependencies: "No dependencies",
      addDependency: "Add dependency",
      removeDependency: "Remove dependency",
      parentTask: "Parent task",
      childTasks: "Child tasks",
      expandAll: "Expand all",
      collapseAll: "Collapse all",
      milestone: "Milestone",
      addMilestone: "Add milestone",
      edit: "Edit task",
      delete: "Delete task",
      move: "Move task",
      resize: "Resize duration"
    },
    status: {
      notStarted: "Not started",
      inProgress: "In progress",
      completed: "Completed",
      delayed: "Delayed",
      blocked: "Blocked",
      cancelled: "Cancelled"
    },
    dependency: {
      finishToStart: "Finish → Start",
      startToStart: "Start → Start",
      finishToFinish: "Finish → Finish",
      startToFinish: "Start → Finish"
    },
    tooltip: {
      taskName: "Task",
      start: "Start",
      end: "End",
      duration: "Duration",
      progress: "Progress",
      assignee: "Assignee",
      dependency: "Depends on",
      noDependency: "No dependencies"
    },
    legend: {
      title: "Legend",
      task: "Task",
      milestone: "Milestone",
      dependency: "Dependency",
      criticalPath: "Critical path",
      today: "Today",
      baseline: "Baseline",
      actual: "Actual",
      slack: "Slack"
    },
    empty: {
      noTasks: "No tasks",
      noTasksHint: "Add a task or milestone to start planning your timeline.",
      noMatch: "No matching results"
    },
    actions: {
      addTask: "Add task",
      addGroup: "Add group",
      deleteGroup: "Delete group",
      exportPng: "Export PNG",
      exportPdf: "Export PDF",
      print: "Print"
    },
    messages: {
      taskCreated: "Task created",
      taskUpdated: "Task updated",
      taskDeleted: "Task deleted",
      taskMoved: "Task schedule adjusted",
      dependencyAdded: "Dependency added",
      dependencyRemoved: "Dependency removed"
    }
  }
};
