/**
 * AICR WeChat robots store — robots persisted to localStorage (mirrors YiWeb aicr).
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { loadRobots, saveRobots, sendWeChatMessage } from "@/api/modules/weChatService";
import type { WeChatRobot } from "@/api/modules/weChatService";
export type { WeChatRobot };

export const useAicrWeChatStore = defineStore("yivad-aicr-wechat", () => {
  const robots = ref<WeChatRobot[]>(loadRobots());
  const sending = ref(false);
  const error = ref<string | null>(null);

  function persist() {
    saveRobots(robots.value);
  }

  function addRobot(name = "New bot", webhook = "", enabled = true, autoForward = false) {
    robots.value.push({ name, webhook, enabled, autoForward });
    persist();
  }

  function updateRobot(idx: number, patch: Partial<WeChatRobot>) {
    if (idx < 0 || idx >= robots.value.length) return;
    robots.value[idx] = { ...robots.value[idx], ...patch };
    persist();
  }

  function removeRobot(idx: number) {
    if (idx < 0 || idx >= robots.value.length) return;
    robots.value.splice(idx, 1);
    persist();
  }

  async function sendMessage(robotIdx: number, content: string) {
    const r = robots.value[robotIdx];
    if (!r?.webhook) {
      error.value = "Bot has no webhook configured";
      return;
    }
    sending.value = true;
    error.value = null;
    try {
      await sendWeChatMessage(r.webhook, content);
    } catch (e: any) {
      error.value = e?.message || "Send failed";
    } finally {
      sending.value = false;
    }
  }

  return { robots, sending, error, addRobot, updateRobot, removeRobot, sendMessage };
});
