<template>
  <el-config-provider :locale="locale" :size="assemblySize" :button="buttonConfig">
    <router-view></router-view>
    <SparkGlowDefs />
    <MermaidViewer />
    <!-- 根级 CommandPalette 兜底（login 等无 layout 的场景也能打开 ⌘K）
         layouts/index.vue 会再 provide 一个带 expose 的 handle，优先级更高。 -->
    <CommandPalette ref="paletteRef" />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";
import { useTheme } from "@/hooks/useTheme";
import { ElConfigProvider } from "element-plus";
import { LanguageType } from "./stores/interface";
import { useGlobalStore } from "@/stores/modules/global";
import SparkGlowDefs from "@/components/SparkGlowDefs/SparkGlowDefs.vue";
import MermaidViewer from "@/components/MermaidViewer/MermaidViewer.vue";
import CommandPalette from "@/components/CommandPalette/CommandPalette.vue";
import { setupMermaidThemeWatcher } from "@/hooks/useMarkdown";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { normalizeLocale } from "@/languages";
import mittBus from "@/utils/mittBus";
import {
  provideCommandPalette,
  type CommandPaletteHandle
} from "@/composables/useCommandPalette";

const globalStore = useGlobalStore();

// init theme
const { initTheme } = useTheme();
initTheme();

// Watch dark mode and re-initialize mermaid with matching theme colours
setupMermaidThemeWatcher();

// init language
const i18n = useI18n();
onMounted(() => {
  const language = globalStore.language ?? getBrowserLang();
  i18n.locale.value = language;
  globalStore.setGlobalState("language", language as LanguageType);
});

// element language (同时跟随 i18n.locale.value，保证切换即时生效)
const locale = computed(() => {
  const currentLang = normalizeLocale(
    (i18n.locale.value as string) || (globalStore.language as string) || (getBrowserLang() as string)
  );
  return currentLang === "zh" ? zhCn : en;
});

// element assemblySize
const assemblySize = computed(() => globalStore.assemblySize);

// element button config
const buttonConfig = reactive({ autoInsertSpace: false });

/* ── Root-level CommandPalette provide（与 layout 层提供的同 symbol 语义） ── */
const paletteRef = ref<InstanceType<typeof CommandPalette> | null>(null);
const _vis = shallowRef(false);

function open(initialQuery?: string) {
  if (paletteRef.value && typeof paletteRef.value.open === "function") {
    paletteRef.value.open(initialQuery ?? "");
  } else {
    mittBus.emit("cmd-palette:open", initialQuery ? { query: initialQuery } : undefined);
  }
  nextTick(() => { _vis.value = !!(paletteRef.value?.visible ?? true); });
}
function close() {
  if (paletteRef.value && typeof paletteRef.value.close === "function") {
    paletteRef.value.close();
  } else {
    mittBus.emit("cmd-palette:close");
  }
  _vis.value = false;
}
function refresh() {
  if (paletteRef.value && typeof paletteRef.value.refresh === "function") {
    try { paletteRef.value.refresh(); } catch { /* noop */ }
  } else {
    mittBus.emit("cmd-palette:refresh");
  }
}

const rootHandle: CommandPaletteHandle = {
  open,
  close,
  refresh,
  visible: {
    get value() {
      try {
        const v = paletteRef.value?.visible;
        if (typeof v === "boolean") return v;
      } catch { /* fallthrough */ }
      return _vis.value;
    }
  } as Readonly<{ value: boolean }>
};
provideCommandPalette(rootHandle);

// 同步 mittBus 事件到本地 visible stub（与 layouts/index.vue 对齐）
const onMittOpen = () => { _vis.value = true; };
const onMittClose = () => { _vis.value = false; };
mittBus.on("cmd-palette:open", onMittOpen);
mittBus.on("cmd-palette:close", onMittClose);

watch(
  () => paletteRef.value?.visible,
  (v) => {
    if (typeof v === "boolean") _vis.value = v;
  },
  { flush: "post" }
);

onBeforeUnmount(() => {
  mittBus.off("cmd-palette:open", onMittOpen);
  mittBus.off("cmd-palette:close", onMittClose);
});
</script>
