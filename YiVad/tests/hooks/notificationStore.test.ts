import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useNotificationStore, type Notification, type NotificationType } from "@/stores/modules/notification";

function makeNotif(overrides: Partial<Notification> = {}): Notification {
  return {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "system",
    priority: "medium",
    title: "Test",
    message: "Test notification",
    read: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("useNotificationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("starts with empty notifications", () => {
    const store = useNotificationStore();
    expect(store.notifications).toHaveLength(0);
    expect(store.unreadCount).toBe(0);
  });

  it("adds notification and increments unread", () => {
    const store = useNotificationStore();
    store.addNotification(makeNotif({ id: "n1" }));
    expect(store.notifications).toHaveLength(1);
    expect(store.unreadCount).toBe(1);
  });

  it("dedupes by id", () => {
    const store = useNotificationStore();
    store.addNotification(makeNotif({ id: "n1", title: "First" }));
    store.addNotification(makeNotif({ id: "n1", title: "Second" }));
    expect(store.notifications).toHaveLength(1);
    expect(store.notifications[0].title).toBe("First");
  });

  it("marks single notification as read", () => {
    const store = useNotificationStore();
    store.addNotification(makeNotif({ id: "n1" }));
    store.markAsRead("n1");
    expect(store.notifications[0].read).toBe(true);
    expect(store.unreadCount).toBe(0);
  });

  it("marks all as read", () => {
    const store = useNotificationStore();
    store.addNotification(makeNotif({ id: "n1" }));
    store.addNotification(makeNotif({ id: "n2" }));
    store.markAllAsRead();
    expect(store.unreadCount).toBe(0);
  });

  it("removes notification by id", () => {
    const store = useNotificationStore();
    store.addNotification(makeNotif({ id: "n1" }));
    store.removeNotification("n1");
    expect(store.notifications).toHaveLength(0);
  });

  it("clears by type", () => {
    const store = useNotificationStore();
    store.addNotification(makeNotif({ id: "n1", type: "system" }));
    store.addNotification(makeNotif({ id: "n2", type: "error" }));
    store.clearByType("system");
    expect(store.notifications).toHaveLength(1);
    expect(store.notifications[0].type).toBe("error");
  });

  it("caps at MAX_CACHED (100)", () => {
    const store = useNotificationStore();
    for (let i = 0; i < 150; i++) {
      store.addNotification(makeNotif({ id: `n-${i}` }));
    }
    expect(store.notifications.length).toBeLessThanOrEqual(100);
  });

  it("unreadNotifications sorts by priority", () => {
    const store = useNotificationStore();
    store.addNotification(makeNotif({ id: "n1", priority: "low" }));
    store.addNotification(makeNotif({ id: "n2", priority: "urgent" }));
    store.addNotification(makeNotif({ id: "n3", priority: "high" }));
    const unread = store.unreadNotifications;
    expect(unread[0].priority).toBe("urgent");
  });

  it("notificationsByType groups correctly", () => {
    const store = useNotificationStore();
    store.addNotification(makeNotif({ id: "n1", type: "system" }));
    store.addNotification(makeNotif({ id: "n2", type: "error" }));
    store.addNotification(makeNotif({ id: "n3", type: "error" }));
    expect(store.notificationsByType.system).toHaveLength(1);
    expect(store.notificationsByType.error).toHaveLength(2);
  });

  it("respects type preferences", () => {
    const store = useNotificationStore();
    store.preferences.system = false;
    store.addNotification(makeNotif({ id: "n1", type: "system" }));
    expect(store.notifications).toHaveLength(0);
  });

  it("quietHours suppresses notifications", () => {
    const store = useNotificationStore();
    store.quietHours = { enabled: true, start: "00:00", end: "23:59" };
    store.addNotification(makeNotif({ id: "n1" }));
    expect(store.notifications).toHaveLength(0);
  });
});
