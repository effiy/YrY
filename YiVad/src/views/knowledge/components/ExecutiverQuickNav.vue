<template>
  <div class="role-page__quick-nav">
    <div
      v-for="item in items"
      :key="item.key"
      class="role-page__quick-nav-card"
      :class="{ 'is-active': item.key === active }"
      @click="$router.push(item.path)"
    >
      <span class="role-page__quick-nav-icon">{{ item.icon }}</span>
      <div class="role-page__quick-nav-body">
        <span class="role-page__quick-nav-title">{{ item.title }}</span>
        <span class="role-page__quick-nav-desc">{{ item.desc }}</span>
      </div>
      <span class="role-page__quick-nav-arrow">→</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="ExecutiverQuickNav">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    /** 当前页面对应的卡片 key（高亮用）。 */
    active?: "okr" | "rss" | "reading-list" | "process" | "";
    /** 当前角色页的 role id，OKR 卡片跳转到该角色的 OKR 页（/executiver/okr/:role）。 */
    role?: string;
  }>(),
  { active: "", role: "" }
);

interface QuickNavItem {
  key: "okr" | "rss" | "reading-list" | "process";
  path: string;
  icon: string;
  title: string;
  desc: string;
}

const { t } = useI18n();

/** 高管知识库统一快捷导航（与 /executiver 首页 quick-nav 保持一致）。 */
const items = computed<QuickNavItem[]>(() => [
  { key: "okr", path: props.role ? `/executiver/okr/${props.role}` : "/executiver/okr", icon: "🎯", title: t("home.knowledgeQuickNav.okr.title"), desc: t("home.knowledgeQuickNav.okr.desc") },
  { key: "rss", path: props.role ? `/executiver/rss/${props.role}` : "/executiver/rss", icon: "📡", title: t("home.knowledgeQuickNav.rss.title"), desc: t("home.knowledgeQuickNav.rss.desc") },
  { key: "reading-list", path: "/executiver/reading-list", icon: "📚", title: t("home.knowledgeQuickNav.readingList.title"), desc: t("home.knowledgeQuickNav.readingList.desc") },
  { key: "process", path: "/executiver/process", icon: "🔁", title: t("home.knowledgeQuickNav.process.title"), desc: t("home.knowledgeQuickNav.process.desc") }
]);
</script>

<style scoped lang="scss">
.role-page__quick-nav { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
.role-page__quick-nav-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--el-bg-color); border-radius: 10px; border: 1px solid var(--el-border-color-lighter); cursor: pointer; transition: box-shadow .2s, border-color .2s, transform .2s, background .2s; &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.08); transform: translateY(-1px); } }
.role-page__quick-nav-icon { font-size: 28px; flex-shrink: 0; }
.role-page__quick-nav-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.role-page__quick-nav-title { font-size: 14px; font-weight: 700; color: var(--el-text-color-primary); }
.role-page__quick-nav-desc { font-size: 11px; color: var(--el-text-color-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.role-page__quick-nav-arrow { font-size: 18px; color: var(--el-text-color-placeholder); flex-shrink: 0; transition: color .2s, transform .2s; .role-page__quick-nav-card:hover & { color: var(--el-color-primary); transform: translateX(3px); } }
.role-page__quick-nav-card.is-active { border-color: var(--el-color-primary); background: var(--el-color-primary-light-9); .role-page__quick-nav-arrow { color: var(--el-color-primary); } }
</style>
