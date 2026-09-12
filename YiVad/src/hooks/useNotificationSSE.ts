import { ref, onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "@/stores/modules/notification";
import type { Notification } from "@/stores/modules/notification";

interface SSEOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  endpoint?: string;
}

export function useNotificationSSE(options: SSEOptions = {}) {
  const {
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    endpoint = "/notification/stream",
  } = options;

  const store = useNotificationStore();
  const connected = ref(false);
  const error = ref<string | null>(null);

  let eventSource: EventSource | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function getToken(): string {
    try {
      const raw = localStorage.getItem("user-store");
      if (raw) return JSON.parse(raw).token || "";
    } catch { /* ignore */ }
    return "";
  }

  function connect(): void {
    if (eventSource) return;

    const baseUrl = import.meta.env.RSBUILD_ENV_API_URL || "";
    const url = `${baseUrl}${endpoint}`;
    const token = getToken();
    const urlWithToken = token ? `${url}?token=${encodeURIComponent(token)}` : url;

    eventSource = new EventSource(urlWithToken);

    eventSource.onopen = () => {
      connected.value = true;
      error.value = null;
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        store.addNotification(notification);
      } catch {
        console.error("[NotificationSSE] Failed to parse notification:", event.data);
      }
    };

    eventSource.onerror = () => {
      connected.value = false;
      eventSource?.close();
      eventSource = null;

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        error.value = `连接断开，${reconnectInterval / 1000}s 后重连 (${reconnectAttempts}/${maxReconnectAttempts})`;
        reconnectTimer = setTimeout(connect, reconnectInterval);
      } else {
        error.value = "通知服务连接失败，请刷新页面重试";
      }
    };
  }

  function disconnect(): void {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    eventSource?.close();
    eventSource = null;
    connected.value = false;
  }

  onMounted(() => connect());
  onUnmounted(() => disconnect());

  return {
    connected,
    error,
    reconnect: () => {
      disconnect();
      reconnectAttempts = 0;
      connect();
    },
  };
}