export default {
  module: {
    list: {
      title: "Modules",
      description: "Manage system module architecture and component dependencies",
      search: "Search modules…",
      searchPlaceholder: "Search by name, key, or lead",
      newModule: "New Module",
      refresh: "Refresh",
      export: "Export CSV",
      filters: "Filters",
      clearAll: "Clear all",
      sortBy: {
        name: "By name",
        issues: "By issues",
        updated: "By updated"
      },
      viewMode: {
        grid: "Grid",
        list: "List"
      },
      empty: {
        noModules: "No modules",
        noMatch: "No matching modules",
        createFirst: "Create your first module"
      }
    },
    detail: {
      notFound: "Module not found",
      notFoundSub: "This module doesn't exist or was deleted.",
      backToModules: "Back to Modules",
      tabs: {
        overview: "Overview",
        issues: "Issues",
        bugs: "Bugs",
        docs: "Docs",
        dependencies: "Dependencies",
        history: "History",
        settings: "Settings"
      },
      overview: {
        description: "Description",
        noDescription: "No description",
        lead: "Lead",
        noLead: "Unassigned",
        members: "Members",
        noMembers: "No members",
        addMember: "Add member",
        stats: {
          openIssues: "Open Issues",
          resolvedIssues: "Resolved Issues",
          openBugs: "Open Bugs",
          resolvedBugs: "Resolved Bugs",
          codeCoverage: "Code Coverage",
          lastDeploy: "Last Deploy"
        },
        activity: {
          title: "Recent Activity",
          empty: "No recent activity"
        }
      },
      dependencies: {
        title: "Dependencies",
        dependsOn: "Depends on",
        dependedBy: "Depended on by",
        noDependencies: "No dependencies",
        add: "Add dependency",
        remove: "Remove dependency",
        circularWarning: "Circular dependency detected"
      },
      history: {
        title: "Change History",
        empty: "No changes recorded",
        created: "Module created",
        updated: "Information updated",
        memberAdded: "Added member {user}",
        memberRemoved: "Removed member {user}",
        dependencyAdded: "Added dependency {module}",
        dependencyRemoved: "Removed dependency {module}"
      }
    },
    table: {
      name: "Name",
      key: "Key",
      project: "Project",
      lead: "Lead",
      issues: "Issues",
      bugs: "Bugs",
      members: "Members",
      status: "Status",
      updated: "Updated",
      actions: "Actions"
    },
    dialog: {
      createTitle: "New Module",
      editTitle: "Edit Module",
      name: "Module name",
      namePlaceholder: "Enter module name",
      nameRequired: "Module name is required",
      key: "Module key",
      keyPlaceholder: "e.g. AUTH_SERVICE",
      keyRequired: "Module key is required",
      keyPattern: "Uppercase letters, digits, underscores only",
      description: "Description",
      descriptionPlaceholder: "Module purpose and responsibility",
      project: "Project",
      lead: "Lead",
      leadPlaceholder: "Module lead",
      status: "Status",
      statusActive: "Active",
      statusMaintenance: "Maintenance",
      statusDeprecated: "Deprecated",
      statusArchived: "Archived",
      tags: "Tags",
      tagsPlaceholder: "Add tags, press Enter to confirm",
      cancel: "Cancel",
      save: "Save",
      createSuccess: "Module created",
      updateSuccess: "Module updated",
      deleteSuccess: "Module deleted",
      deleteConfirm: 'Delete module "{name}"? Associated issues and bugs will also be removed.'
    },
    messages: {
      copied: "Copied {key}",
      clipboardUnavailable: "Clipboard unavailable"
    },
    error: {
      loadFailed: "Failed to load module data",
      saveFailed: "Failed to save module",
      deleteFailed: "Failed to delete module"
    }
  }
};
