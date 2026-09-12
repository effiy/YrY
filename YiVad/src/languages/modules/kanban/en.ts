export default {
  kanban: {
    stats: {
      total: "Total",
      urgent: "Urgent",
      overdue: "Overdue",
      done: "Done",
      completed: "Completed"
    },
    search: {
      placeholder: "Search issues..."
    },
    filters: {
      typeLabel: "Type",
      priorityLabel: "Priority"
    },
    column: {
      overdueSuffix: " overdue",
      noIssues: "No issues",
      addIssue: "Add issue",
      sort: {
        priority: "By Priority",
        dueDate: "By Due Date",
        recent: "By Recent",
        created: "By Created"
      }
    },
    contextMenu: {
      moveToTodo: "Move to Todo",
      moveToInProgress: "Move to In Progress",
      moveToInReview: "Move to In Review",
      moveToDone: "Move to Done",
      deleteIssue: "Delete"
    },
    createDialog: {
      title: "Create Issue",
      formTitle: "Title",
      formTitlePlaceholder: "Issue title",
      formType: "Type",
      formPriority: "Priority",
      formStatus: "Status",
      formAssignee: "Assignee",
      formAssigneePlaceholder: "Assignee",
      formDueDate: "Due Date",
      formDueDatePlaceholder: "Pick a date",
      formLabels: "Labels",
      formLabelsPlaceholder: "Add labels",
      formDescription: "Description",
      formDescriptionPlaceholder: "Optional description",
      cancel: "Cancel",
      submit: "Create",
      createSuccess: "Issue created",
      deleteConfirm: {
        title: "Delete '{name}'?",
        okText: "Confirm",
        success: "Deleted"
      }
    },
    message: {
      priorityChanged: "'{name}' priority → {priority}",
      statusChanged: "'{name}' → {status}",
      movedTo: "'{name}' moved to {status}"
    }
  }
};
