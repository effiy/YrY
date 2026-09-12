import { ref, onBeforeUnmount, type Ref } from "vue";

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  activeField?: string;
}

interface UseFormCollaborationOptions {
  formId: string;
  userId: string;
  userName: string;
  wsUrl?: string;
}

const USER_COLORS = ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399", "#00D4AA"];

export const useFormCollaboration = (options: UseFormCollaborationOptions) => {
  const { formId, userId, userName, wsUrl = `ws://localhost:10086/ws/collaboration/${formId}` } = options;

  const isConnected = ref(false);
  const users = ref<CollaborationUser[]>([]);
  const lockedFields = ref<Record<string, string>>({}); // field → userId
  const userColor = USER_COLORS[hashCode(userId) % USER_COLORS.length];

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  function hashCode(s: string): number {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function connect() {
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        isConnected.value = true;
        send({ type: "join", userId, userName, color: userColor });
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        } catch { /* ignore malformed messages */ }
      };

      ws.onclose = () => {
        isConnected.value = false;
        stopHeartbeat();
        scheduleReconnect();
      };

      ws.onerror = () => {
        ws?.close();
      };
    } catch {
      scheduleReconnect();
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 3000);
  }

  function startHeartbeat() {
    heartbeatTimer = setInterval(() => {
      send({ type: "ping" });
    }, 15000);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function send(data: Record<string, any>) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  function handleMessage(msg: any) {
    switch (msg.type) {
      case "user_joined":
        users.value.push(msg.user);
        break;
      case "user_left":
        users.value = users.value.filter((u) => u.id !== msg.userId);
        // Release locks held by this user
        for (const field of Object.keys(lockedFields.value)) {
          if (lockedFields.value[field] === msg.userId) {
            delete lockedFields.value[field];
          }
        }
        break;
      case "field_locked":
        lockedFields.value = { ...lockedFields.value, [msg.field]: msg.userId };
        break;
      case "field_unlocked":
        if (lockedFields.value[msg.field] === msg.userId) {
          const next = { ...lockedFields.value };
          delete next[msg.field];
          lockedFields.value = next;
        }
        break;
      case "field_changed":
        // External change notification — caller handles application
        break;
      case "cursor_moved":
        // Update user's active field
        const user = users.value.find((u) => u.id === msg.userId);
        if (user) user.activeField = msg.field;
        break;
      case "users_list":
        users.value = msg.users;
        break;
    }
  }

  /** Lock a field when user focuses it */
  function lockField(field: string) {
    send({ type: "lock_field", field, userId });
    lockedFields.value = { ...lockedFields.value, [field]: userId };
  }

  /** Unlock a field when user blurs it */
  function unlockField(field: string) {
    send({ type: "unlock_field", field, userId });
    if (lockedFields.value[field] === userId) {
      const next = { ...lockedFields.value };
      delete next[field];
      lockedFields.value = next;
    }
  }

  /** Notify other users of field change */
  function broadcastFieldChange(field: string, value: any) {
    send({ type: "field_changed", field, value, userId });
  }

  /** Notify cursor position */
  function broadcastCursor(field: string) {
    send({ type: "cursor_moved", field, userId });
  }

  /** Get lock holder name for a field */
  function getLockHolder(field: string): string | null {
    const uid = lockedFields.value[field];
    if (!uid) return null;
    const user = users.value.find((u) => u.id === uid);
    return user?.name || null;
  }

  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    stopHeartbeat();
    ws?.close();
    ws = null;
  }

  onBeforeUnmount(() => {
    disconnect();
  });

  // Auto-connect
  connect();

  return {
    isConnected,
    users,
    lockedFields,
    userColor,
    lockField,
    unlockField,
    broadcastFieldChange,
    broadcastCursor,
    getLockHolder,
    disconnect,
  };
};