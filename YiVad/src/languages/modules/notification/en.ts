export default {
  notification: {
    title: "Notifications",
    empty: "No notifications",
    emptyHint: "Notifications for task assignments, comments, and status changes will appear here.",
    markAllRead: "Mark all as read",
    markRead: "Mark as read",
    markUnread: "Mark as unread",
    viewAll: "View all",
    loadFailed: "Failed to load notifications",
    loadMore: "Load more",
    noMore: "All notifications loaded",
    unreadCount: "{n} unread",
    settings: "Notification settings",
    clearAll: "Clear all notifications",
    clearAllConfirm: "Clear all notifications? This cannot be undone.",
    delete: "Delete notification",
    filters: {
      all: "All",
      unread: "Unread",
      mentions: "@ Mentions",
      assignments: "Assignments",
      comments: "Comments",
      system: "System"
    },
    types: {
      mention: "{user} mentioned you in {target}",
      assignment: "{user} assigned {target} to you",
      comment: "{user} commented on {target}",
      statusChange: "{target} status changed to {status}",
      deadlineReminder: "{target} is due on {date}",
      overdue: "{target} is overdue",
      reviewRequested: "{user} requested your review on {target}",
      reviewApproved: "{target} was approved",
      reviewRejected: "{target} was rejected",
      projectInvitation: "{user} invited you to join {project}",
      system: "System: {message}",
      announcement: "Announcement: {message}"
    },
    channels: {
      inApp: "In-app",
      email: "Email",
      push: "Push",
      wecom: "WeCom"
    },
    preferences: {
      title: "Notification Preferences",
      browserTitle: "Browser Notifications",
      desktopLabel: "Desktop Notifications",
      desktopDesc: "Receive browser notifications when the page is in the background",
      blockedWarning: "Browser notifications are blocked — enable them in browser settings",
      typeTitle: "Notification Types",
      quietTitle: "Do Not Disturb",
      enableQuiet: "Enable DND",
      startTime: "Start time",
      endTime: "End time",
      quietHint: "Notifications won't pop up during DND hours. They will still be saved and viewable in the notification center.",
      connectionTitle: "Connection Status",
      realtimeLabel: "Real-time connection",
      connected: "Connected",
      disconnected: "Disconnected",
      reconnect: "Reconnect",
      channelLabel: "Channels",
      digestLabel: "Digest mode",
      digestInstant: "Instant",
      digestHourly: "Hourly digest",
      digestDaily: "Daily digest",
      digestWeekly: "Weekly digest",
      muteThread: "Mute this thread",
      unmuteThread: "Unmute"
    },
    time: {
      justNow: "just now",
      minutesAgo: "{n}m ago",
      hoursAgo: "{n}h ago",
      daysAgo: "{n}d ago",
      weeksAgo: "{n}w ago"
    },
    actions: {
      open: "View details",
      dismiss: "Dismiss",
      snooze: "Snooze",
      snooze1h: "1 hour",
      snooze4h: "4 hours",
      snoozeTomorrow: "Tomorrow",
      snoozed: "Snoozed"
    }
  }
};
