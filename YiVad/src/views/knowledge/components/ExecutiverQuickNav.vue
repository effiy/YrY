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
withDefaults(
  defineProps<{
    /** 当前页面对应的卡片 key（高亮用）。 */
    active?: "okr" | "rss" | "reading-list" | "process" | "";
  }>(),
  { active: "" }
);

interface QuickNavItem {
  key: "okr" | "rss" | "reading-list" | "process";
  path: string;
  icon: string;
  title: string;
  desc: string;
}

/** 高管知识库统一快捷导航（与 /executiver 首页 quick-nav 保持一致）。 */
const items: QuickNavItem[] = [
  { key: "okr", path: "/executiver/okr", icon: "🎯", title: "OKR Dashboard", desc: "Goals, metrics, daily standups, weekly reports & retrospectives" },
  { key: "rss", path: "/executiver/rss", icon: "📡", title: "RSS Manager", desc: "Feed subscriptions, auto-classification & article management" },
  { key: "reading-list", path: "/executiver/reading-list", icon: "📚", title: "Reading List", desc: "Curated books, articles & papers with reading status and notes" },
  { key: "process", path: "/executiver/process", icon: "🔁", title: "Process Records", desc: "需求评审 · 技术评审 · 构建调试 · 测试报告 · 上线 — 全流程自闭环记录" }
];
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
