/**
 * WeCom (WeChat) bot service.
 * Robots are stored client-side in localStorage (mirrors YiWeb aicr);
 * this module only handles outbound message dispatch via the YiAi backend.
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";

const ROBOTS_KEY = "aicr_wechat_robots";

export interface WeChatRobot {
  name: string;
  webhook: string;
  enabled: boolean;
  autoForward: boolean;
}

/** Send a text message to a single WeCom bot webhook. */
export async function sendWeChatMessage(webhookUrl: string, content: string): Promise<void> {
  const url = buildYiAiUrl("/wework/send-message");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ webhook_url: webhookUrl, content })
  });
  if (!resp.ok) {
    throw new Error(`Failed to send WeChat message: HTTP ${resp.status}`);
  }
}

/** Load robots from localStorage. */
export function loadRobots(): WeChatRobot[] {
  try {
    const raw = localStorage.getItem(ROBOTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter(r => r && typeof r === "object");
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function saveRobots(robots: WeChatRobot[]): void {
  localStorage.setItem(ROBOTS_KEY, JSON.stringify(robots));
}
