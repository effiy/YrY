<!-- 💥 One-time loading of LayoutComponents -->
<template>
  <el-watermark id="watermark" :font="font" :content="watermark ? ['YiVad', 'Happy Working'] : ''">
    <component :is="LayoutComponents[layout]" />
    <ThemeDrawer />
    <CommandPalette />
    <KeyboardShortcuts />
  </el-watermark>
</template>

<script setup lang="ts" name="layout">
import { computed, reactive, watch, type Component, onErrorCaptured } from "vue";
import { ElWatermark, ElNotification } from "element-plus";
import { LayoutType } from "@/stores/interface";
import { useGlobalStore } from "@/stores/modules/global";
import ThemeDrawer from "./components/ThemeDrawer/index.vue";
import CommandPalette from "@/components/CommandPalette/CommandPalette.vue";
import KeyboardShortcuts from "@/components/KeyboardShortcuts/index.vue";
import LayoutVertical from "./LayoutVertical/index.vue";
import LayoutClassic from "./LayoutClassic/index.vue";
import LayoutTransverse from "./LayoutTransverse/index.vue";
import LayoutColumns from "./LayoutColumns/index.vue";

const LayoutComponents: Record<LayoutType, Component> = {
  vertical: LayoutVertical,
  classic: LayoutClassic,
  transverse: LayoutTransverse,
  columns: LayoutColumns
};

const globalStore = useGlobalStore();

const isDark = computed(() => globalStore.isDark);
const layout = computed<LayoutType>(() => globalStore.layout);
const watermark = computed(() => globalStore.watermark);

const font = reactive({ color: "var(--color-watermark)" });

// Define watermark color token based on theme
const setWatermarkColor = () => {
  const html = document.documentElement;
  html.style.setProperty(
    "--color-watermark",
    globalStore.isDark ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)"
  );
};
watch(isDark, setWatermarkColor, { immediate: true });

onErrorCaptured((err, _instance, info) => {
  console.error("[YiVad] Component render error:", err, info);
  ElNotification({
    title: "Component Error",
    message: err instanceof Error ? err.message : String(err),
    type: "error",
    duration: 5000
  });
  return false;
});
</script>

<style scoped lang="scss">
.layout {
  min-width: 600px;
}
</style>
