export default {
  notification: {
    title: "通知",
    empty: "暂无通知",
    emptyHint: "当有新的任务分配、评论或状态变更时，通知将出现在这里。",
    markAllRead: "全部标为已读",
    markRead: "标为已读",
    markUnread: "标为未读",
    viewAll: "查看全部",
    loadFailed: "通知加载失败",
    loadMore: "加载更多",
    noMore: "已加载全部通知",
    unreadCount: "{n} 条未读",
    settings: "通知设置",
    clearAll: "清空全部通知",
    clearAllConfirm: "确认清空全部通知？此操作不可撤销。",
    delete: "删除通知",
    filters: {
      all: "全部",
      unread: "未读",
      mentions: "@ 提及",
      assignments: "任务分配",
      comments: "评论回复",
      system: "系统通知"
    },
    types: {
      mention: "{user} 在 {target} 中提及了你",
      assignment: "{user} 将 {target} 分配给你",
      comment: "{user} 评论了 {target}",
      statusChange: "{target} 状态变更为 {status}",
      deadlineReminder: "{target} 将于 {date} 截止",
      overdue: "{target} 已逾期",
      reviewRequested: "{user} 请求你审核 {target}",
      reviewApproved: "{target} 已通过审核",
      reviewRejected: "{target} 未通过审核",
      projectInvitation: "{user} 邀请你加入 {project}",
      system: "系统：{message}",
      announcement: "公告：{message}"
    },
    channels: {
      inApp: "应用内通知",
      email: "邮件通知",
      push: "推送通知",
      wecom: "企业微信通知"
    },
    preferences: {
      title: "通知偏好",
      channelLabel: "通知渠道",
      digestLabel: "摘要模式",
      digestInstant: "即时通知",
      digestHourly: "每小时摘要",
      digestDaily: "每日摘要",
      digestWeekly: "每周摘要",
      muteThread: "静默此通知线程",
      unmuteThread: "取消静默"
    },
    time: {
      justNow: "刚刚",
      minutesAgo: "{n} 分钟前",
      hoursAgo: "{n} 小时前",
      daysAgo: "{n} 天前",
      weeksAgo: "{n} 周前"
    },
    actions: {
      open: "查看详情",
      dismiss: "忽略",
      snooze: "稍后提醒",
      snooze1h: "1 小时后",
      snooze4h: "4 小时后",
      snoozeTomorrow: "明天",
      snoozed: "已设置稍后提醒"
    }
  }
};
