<!-- 💥 One-time loading of LayoutComponents -->
<template>
  <el-watermark id="watermark" :font="font" :content="watermark ? ['YiVad', 'Happy Working'] : ''">
    <component :is="LayoutComponents[layout]" />
    <ThemeDrawer />
    <!-- CommandPalette 统一在 App.vue 根级挂载（Teleport to body）。
         此处不再重复挂：避免 login → dashboard 切页后同时存在 2 份 DOM（造成 ⌘K 打开两个
         叠加层、注册 2 份 capture 监听 stopImmediatePropagation 互吞）。-->
    <KeyboardShortcuts />
    <HelpCenterPanel />
  </el-watermark>
</template>

<script setup lang="ts" name="layout">
import { computed, reactive, watch, type Component, onActivated, onDeactivated, onErrorCaptured, onMounted, shallowRef } from "vue";
import { ElWatermark, ElNotification } from "element-plus";
import { LayoutType } from "@/stores/interface";
import { useGlobalStore } from "@/stores/modules/global";
import ThemeDrawer from "./components/ThemeDrawer/index.vue";
import KeyboardShortcuts from "@/components/KeyboardShortcuts/index.vue";
import HelpCenterPanel from "@/components/HelpCenter/HelpCenterPanel.vue";
import { installHelpOS, bindHelpShortcut, helpAPI } from "@/components/HelpCenter/useHelp";
import LayoutVertical from "./LayoutVertical/index.vue";
import LayoutClassic from "./LayoutClassic/index.vue";
import LayoutTransverse from "./LayoutTransverse/index.vue";
import LayoutColumns from "./LayoutColumns/index.vue";
import {
  provideCommandPalette,
  type CommandPaletteHandle
} from "@/composables/useCommandPalette";
import mittBus from "@/utils/mittBus";

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
  html.style.setProperty("--color-watermark", globalStore.isDark ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)");
};
watch(isDark, setWatermarkColor, { immediate: true });

/* ── CommandPalette expose → useCommandPalette provide ──────────────── */
const _vis = shallowRef(false);

/**
 * App.vue 根级已经 provide 了一份同名 key；这里再次 provide 会 override（
 * Vue inject 默认向父链追溯，越靠近 consumer 的 provide 优先级越高）。
 * 好处：layout 下的组件能拿到带 expose 版，但 layout 外（login / showcase / 404 等）
 * 仍会 fallback 到 App.vue 根级那份，保证所有页面 ⌘K 都能开。
 */
function open(initialQuery?: string) {
  mittBus.emit("cmd-palette:open", initialQuery ? { query: initialQuery } : undefined);
  _vis.value = true;
}
function close() {
  mittBus.emit("cmd-palette:close");
  _vis.value = false;
}
function refresh() {
  mittBus.emit("cmd-palette:refresh");
}

const handle: CommandPaletteHandle = {
  open,
  close,
  refresh,
  visible: {
    get value() {
      return _vis.value;
    }
  } as Readonly<{ value: boolean }>
};
provideCommandPalette(handle);

// 与 mittBus fallback 双向同步
mittBus.on("cmd-palette:open", () => { _vis.value = true; });
mittBus.on("cmd-palette:close", () => { _vis.value = false; });

/* ── KeepAlive onActivated/onDeactivated: 重绑定快捷键 & capture 监听 ── */
function rebind() {
  // 不做重注册（shortcuts 在 main.ts 全局 singleton）；仅通知 Registry 已激活。
  // 保留占位 SOP：如果未来引入 per-layout 快捷键，在此处注入 page scope。
  try { shortcutRegistry_NoOp(); } catch { /* noop */ }
}
function unbind() {
  // 对称：SOP 占位（若 layout 切换时需要临时 disable page scope 快捷键，在此处处理）
}
// no-op 占位：避免 tree-shake 警告； rebind/unbind 逻辑在 SOP 中。
function shortcutRegistry_NoOp(): void { /* reserved */ }

onActivated(() => rebind());
onDeactivated(() => unbind());

/* ── HelpOS 入口（对齐 PRD FR-01 / FR-09 / Dev §2 GC-1~5 ── */
// ⚠️ installHelpOS 内部调用 provide()，必须在 setup() 同步执行（Vue 3.5 约束）
installHelpOS({ enabled: () => true /* TODO(feature-flags): 接入 src/shared/feature-flags.ts # YV-09-70/p1 */ });
bindHelpShortcut(helpAPI);

onMounted(() => {
  rebind();
});

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
