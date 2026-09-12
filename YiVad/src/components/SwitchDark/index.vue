<template>
  <div class="switch-dark">
    <el-tooltip
      v-for="item in modes"
      :key="item.key"
      :content="item.label"
      placement="top"
    >
      <el-button
        :type="globalStore.themeMode === item.key ? 'primary' : 'default'"
        size="small"
        circle
        @click="onModeChange(item.key)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts" name="SwitchDark">
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useGlobalStore } from "@/stores/modules/global";
import { Sunny, Moon, Setting } from "@element-plus/icons-vue";

const { setThemeMode } = useTheme();
const globalStore = useGlobalStore();

const modes = [
  { key: "light" as ThemeMode, label: "Light", icon: Sunny },
  { key: "dark" as ThemeMode, label: "Dark", icon: Moon },
  { key: "auto" as ThemeMode, label: "Auto", icon: Setting }
];

const onModeChange = (mode: ThemeMode) => {
  setThemeMode(mode);
};
</script>

<style scoped lang="scss">
.switch-dark {
  display: flex;
  gap: 4px;
}
</style>