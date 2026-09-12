import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type NotificationType = "system" | "user_action" | "ai" | "error";
export type NotificationPriority = "urgent" | "high" | "medium" | "low";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const MAX_CACHED = 100;

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);
  const preferences = ref({
    system: true,
    user_action: true,
    ai: true,
    error: true,
  });
  const quietHours = ref({ enabled: false, start: "22:00", end: "08:00" });
  const browserPermission = ref(typeof Notification !== "undefined" && Notification.permission === "granted");

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);

  const unreadNotifications = computed(() =>
    notifications.value
      .filter((n) => !n.read)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  );

  const notificationsByType = computed(() => {
    const groups: Record<NotificationType, Notification[]> = {
      system: [],
      user_action: [],
      ai: [],
      error: [],
    };
    notifications.value.forEach((n) => groups[n.type]?.push(n));
    return groups;
  });

  function addNotification(notification: Notification): void {
    if (notifications.value.some((n) => n.id === notification.id)) return;
    if (!preferences.value[notification.type]) return;
    if (isInQuietHours()) return;

    notifications.value.unshift(notification);
    if (notifications.value.length > MAX_CACHED) {
      notifications.value = notifications.value.slice(0, MAX_CACHED);
    }

    if (document.visibilityState !== "visible" && browserPermission.value) {
      showBrowserNotification(notification);
    }
  }

  function markAsRead(id: string): void {
    const n = notifications.value.find((n) => n.id === id);
    if (n) n.read = true;
  }

  function markAllAsRead(): void {
    notifications.value.forEach((n) => (n.read = true));
  }

  function removeNotification(id: string): void {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function clearByType(type: NotificationType): void {
    notifications.value = notifications.value.filter((n) => n.type !== type);
  }

  function setNotifications(list: Notification[]): void {
    notifications.value = list.slice(0, MAX_CACHED);
  }

  function isInQuietHours(): boolean {
    if (!quietHours.value.enabled) return false;
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = quietHours.value.start.split(":").map(Number);
    const [eh, em] = quietHours.value.end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (startMin <= endMin) return current >= startMin && current < endMin;
    return current >= startMin || current < endMin;
  }

  function showBrowserNotification(notification: Notification): void {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      tag: notification.id,
    });
  }

  async function requestBrowserPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    browserPermission.value = result === "granted";
    return browserPermission.value;
  }

  function loadPreferences(): void {
    try {
      const raw = localStorage.getItem("yivad-notification-preferences");
      if (raw) {
        const stored = JSON.parse(raw);
        if (stored.preferences) preferences.value = stored.preferences;
        if (stored.quietHours) quietHours.value = stored.quietHours;
      }
    } catch { /* ignore */ }
  }

  function savePreferences(): void {
    localStorage.setItem(
      "yivad-notification-preferences",
      JSON.stringify({ preferences: preferences.value, quietHours: quietHours.value })
    );
  }

  loadPreferences();

  return {
    notifications,
    preferences,
    quietHours,
    browserPermission,
    unreadCount,
    unreadNotifications,
    notificationsByType,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearByType,
    setNotifications,
    requestBrowserPermission,
    loadPreferences,
    savePreferences,
  };
});