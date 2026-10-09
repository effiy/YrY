<template>
  <div class="empty-pagehelp">
    <el-empty description="">
      <template #image>
        <el-icon :size="48" color="var(--el-color-primary-light-3)"><QuestionFilled /></el-icon>
      </template>
      <h3 class="title">{{ t('help.page.empty_title') }}</h3>
      <p class="desc">{{ t('help.page.empty_desc') }}</p>
      <div class="ctas">
        <el-button type="primary" @click="goFaq">💡 {{ t('help.page.cta_faq') }}</el-button>
        <el-button @click="goCmd">{{ t('help.page.cta_cmd') }}</el-button>
      </div>
    </el-empty>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { QuestionFilled } from "@element-plus/icons-vue";
import { useHelp } from "../useHelp";
const { t } = useI18n();
const route = useRoute();
const help = useHelp();
function goFaq() { help.setActiveTab("faq"); help.open("faq", route.name as string ?? route.path.split("/").pop() ?? ""); }
function goCmd() {
  help.close();
  // 触发命令面板（利用 registry 中已有的 nav.command-palette handler）
  const ev = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: navigator.platform.toLowerCase().includes("mac"), bubbles: true });
  document.dispatchEvent(ev);
}
</script>
<style lang="scss" scoped>
.empty-pagehelp { padding: 12px 0; }
.title { margin: 6px 0 4px; font-size: 14px; color: var(--el-text-color-primary); }
.desc { margin: 0 0 10px; color: var(--el-text-color-secondary); font-size: 12.5px; }
.ctas { display: inline-flex; gap: 8px; margin-top: 4px; }
</style>
