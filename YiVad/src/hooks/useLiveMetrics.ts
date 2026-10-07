/**
 * Real-time dashboard metrics via SSE from YiAi /dashboard/live.
 *
 * Connects to the YiAi SSE endpoint and provides live KPI data. Falls back
 * gracefully if the endpoint is unavailable or the connection drops.
 *
 * Usage:
 *   const metrics = useLiveMetrics();
 *   watch(() => metrics.data.value, (d) => { if (d) updateDashboard(d); });
 */
import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { yiAiBaseUrl } from "@/config/yiAi";

export interface LiveMetricData {
  active_issues: number;
  open_bugs: number;
  today_done: number;
  today_created: number;
  overdue_count: number;
  blocked_count: number;
  total_issues: number;
  total_bugs: number;
  server_uptime: number;
  timestamp: number;
}

export interface LiveMetricsState {
  data: Ref<LiveMetricData | null>;
  connected: Ref<boolean>;
  error: Ref<string | null>;
  retry: () => void;
}

export function useLiveMetrics(): LiveMetricsState {
  const data = ref<LiveMetricData | null>(null);
  const connected = ref(false);
  const error = ref<string | null>(null);

  let eventSource: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    if (eventSource) {
      eventSource.close();
    }

    error.value = null;
    const url = `${yiAiBaseUrl}/dashboard/live`;

    try {
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        connected.value = true;
        error.value = null;
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.data) {
            data.value = payload.data;
          }
          if (payload.done) {
            connected.value = false;
          }
        } catch {
          // Ignore malformed frames
        }
      };

      eventSource.onerror = () => {
        connected.value = false;
        eventSource?.close();
        eventSource = null;
        // Reconnect after 10s
        reconnectTimer = setTimeout(connect, 10_000);
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : "SSE connection failed";
      // Fallback: retry after 30s
      reconnectTimer = setTimeout(connect, 30_000);
    }
  }

  function retry() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    connect();
  }

  onMounted(() => connect());
  onUnmounted(() => {
    if (eventSource) eventSource.close();
    if (reconnectTimer) clearTimeout(reconnectTimer);
  });

  return { data, connected, error, retry };
}