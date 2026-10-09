<!-- 💥 Async loading of LayoutComponents -->
<template>
  <el-watermark id="watermark" :font="font" :content="watermark ? ['YiVad', 'Happy Working'] : ''">
    <suspense>
      <template #default>
        <component :is="LayoutComponents[layout]" />
      </template>
      <template #fallback>
        <Loading />
      </template>
    </suspense>
    <ThemeDrawer />
    <!-- CommandPalette 统一在 App.vue 根级挂载（Teleport to body），此处去重避免
         login → dashboard 切页出现 2 份 DOM 叠加。详见 layouts/index.vue 注释。-->
    <KeyboardShortcuts />
  </el-watermark>
</template>

<script setup lang="ts" name="layoutAsync">
import { computed, defineAsyncComponent, reactive, watch, type Component, onActivated, onDeactivated, shallowRef } from "vue";
import { ElWatermark } from "element-plus";
import { LayoutType } from "@/stores/interface";
import { useGlobalStore } from "@/stores/modules/global";
import Loading from "@/components/Loading/index.vue";
import KeyboardShortcuts from "@/components/KeyboardShortcuts/index.vue";
import ThemeDrawer from "./components/ThemeDrawer/index.vue";
import mittBus from "@/utils/mittBus";
import {
  provideCommandPalette,
  type CommandPaletteHandle
} from "@/composables/useCommandPalette";

const LayoutComponents: Record<LayoutType, Component> = {
  vertical: defineAsyncComponent(() => import("./LayoutVertical/index.vue")),
  classic: defineAsyncComponent(() => import("./LayoutClassic/index.vue")),
  transverse: defineAsyncComponent(() => import("./LayoutTransverse/index.vue")),
  columns: defineAsyncComponent(() => import("./LayoutColumns/index.vue"))
};

const globalStore = useGlobalStore();

const isDark = computed(() => globalStore.isDark);
const layout = computed<LayoutType>(() => globalStore.layout);
const watermark = computed(() => globalStore.watermark);

const font = reactive({ color: "rgba(0, 0, 0, .15)" });
watch(isDark, () => (font.color = isDark.value ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)"), {
  immediate: true
});

/* ── Layout 级 provide（override 根级 App.vue provide，优先级更高） ── */
const _vis = shallowRef(false);
const handle: CommandPaletteHandle = {
  open: (q) => { mittBus.emit("cmd-palette:open", q ? { query: q } : undefined); _vis.value = true; },
  close: () => { mittBus.emit("cmd-palette:close"); _vis.value = false; },
  refresh: () => mittBus.emit("cmd-palette:refresh"),
  visible: { get value() { return _vis.value; } } as Readonly<{ value: boolean }>
};
provideCommandPalette(handle);
mittBus.on("cmd-palette:open", () => { _vis.value = true; });
mittBus.on("cmd-palette:close", () => { _vis.value = false; });

onActivated(() => { /* SOP 占位：若有 page scope 快捷键在此处重绑 */ });
onDeactivated(() => { /* SOP 占位：若有 page scope 快捷键在此处解绑 */ });
</script>

<style scoped lang="scss">
.layout {
  min-width: 600px;
}
</style>
