// Watermark store — manages watermark configuration and enforcement state.
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useWatermarkStore = defineStore("watermark", () => {
  const userEnabled = ref(true);
  const globalForced = ref(false);
  const username = ref("");
  const ipAddress = ref("");
  const color = ref("#000000");
  const opacity = ref(0.06);
  const fontSize = ref(14);
  const fontFamily = ref("system-ui, -apple-system, sans-serif");
  const spacingX = ref(280);
  const spacingY = ref(180);

  const enabled = computed(() => globalForced.value || userEnabled.value);

  function forceEnable() {
    globalForced.value = true;
  }

  function forceDisable() {
    globalForced.value = false;
  }

  function toggleUser(enable: boolean) {
    userEnabled.value = enable;
  }

  function updateConfig(config: Partial<{
    color: string;
    opacity: number;
    fontSize: number;
    spacingX: number;
    spacingY: number;
  }>) {
    if (config.color !== undefined) color.value = config.color;
    if (config.opacity !== undefined) opacity.value = config.opacity;
    if (config.fontSize !== undefined) fontSize.value = config.fontSize;
    if (config.spacingX !== undefined) spacingX.value = config.spacingX;
    if (config.spacingY !== undefined) spacingY.value = config.spacingY;
  }

  function setUserInfo(user: string, ip: string) {
    username.value = user;
    ipAddress.value = ip;
  }

  return {
    userEnabled,
    globalForced,
    username,
    ipAddress,
    color,
    opacity,
    fontSize,
    fontFamily,
    spacingX,
    spacingY,
    enabled,
    forceEnable,
    forceDisable,
    toggleUser,
    updateConfig,
    setUserInfo,
  };
});