<template>
  <RoleKnowledgePage
    title="Executive"
    domains-word="domains"
    description="strategy, industry analysis, roadmap planning, and reading list for executive decision-making."
    category="executiver"
    :subdirs="subdirs"
    :structural-tags="['resources', 'product', 'product-management', 'product-strategy']"
  >
    <template #header>
      <div class="role-page__role-nav">
        <span class="role-page__role-nav-title">Role OKRs</span>
        <button
          v-for="rid in ROLE_IDS"
          :key="rid"
          class="role-page__role-nav-item"
          :class="{ 'is-active': rid === 'executiver' }"
          @click="rid !== 'executiver' && $router.push(`/executiver/okr/${rid}`)"
        >
          <span class="role-page__role-nav-icon">{{ rolesData[rid].icon }}</span>
          <span class="role-page__role-nav-name">{{ rolesData[rid].name }}</span>
        </button>
      </div>
      <div class="role-page__quick-nav">
        <div class="role-page__quick-nav-card" @click="$router.push('/home/index')">
          <span class="role-page__quick-nav-icon">🏠</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Home</span>
            <span class="role-page__quick-nav-desc">Agent harness overview &amp; OKR task orchestration</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/okr')">
          <span class="role-page__quick-nav-icon">🎯</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">OKR Dashboard</span>
            <span class="role-page__quick-nav-desc">Goals, metrics, daily standups, weekly reports & retrospectives</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/rss')">
          <span class="role-page__quick-nav-icon">📡</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">RSS Manager</span>
            <span class="role-page__quick-nav-desc">Feed subscriptions, auto-classification & article management</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/reading-list')">
          <span class="role-page__quick-nav-icon">📚</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Reading List</span>
            <span class="role-page__quick-nav-desc">Curated books, articles & papers with reading status and notes</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/process')">
          <span class="role-page__quick-nav-icon">🔁</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Process Records</span>
            <span class="role-page__quick-nav-desc">需求评审 · 技术评审 · 构建调试 · 测试报告 · 上线 — 全流程自闭环记录</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
      </div>
    </template>
  </RoleKnowledgePage>
</template>

<script setup lang="ts" name="executiverHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import { rolesData, ROLE_IDS } from "./okrData";

const subdirs = [
  { id: "strategy", icon: "🎯", label: "Strategy", color: "#ef4444", desc: "Executive strategy frameworks — Porter's Five Forces, Blue Ocean, SWOT, VRIO, product strategy, business model canvas, and value proposition design for competitive advantage." },
  { id: "industry", icon: "🏭", label: "Industry", color: "#1677ff", desc: "Market intelligence and competitive analysis — AI industry reports (Gartner, McKinsey, a16z, CAICT), competitor landscape mapping, and regional market observation." },
  { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#10b981", desc: "Strategic planning cadence — annual planning, quarterly business reviews, OKR tracking, headcount and budget planning, and organizational alignment." },
  { id: "reading-list", icon: "📚", label: "Reading List", color: "#7c3aed", desc: "Executive development reading — curated books, articles, and reading notes on management, leadership, and industry trends for continuous learning." }
];
</script>

<style scoped lang="scss">
.role-page__role-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.role-page__role-nav-title { margin-right: 4px; font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .3px; }
.role-page__role-nav-item { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 16px; border: 1px solid var(--el-border-color-lighter); background: var(--el-bg-color); cursor: pointer; font-size: 12px; color: var(--el-text-color-regular); transition: all .15s; &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); } &.is-active { background: var(--el-color-primary); border-color: var(--el-color-primary); color: #fff; cursor: default; } }
.role-page__role-nav-icon { font-size: 13px; }
.role-page__quick-nav { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
.role-page__quick-nav-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--el-bg-color); border-radius: 10px; border: 1px solid var(--el-border-color-lighter); cursor: pointer; transition: box-shadow .2s, border-color .2s, transform .2s; &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.08); transform: translateY(-1px); } }
.role-page__quick-nav-icon { font-size: 28px; flex-shrink: 0; }
.role-page__quick-nav-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.role-page__quick-nav-title { font-size: 14px; font-weight: 700; color: var(--el-text-color-primary); }
.role-page__quick-nav-desc { font-size: 11px; color: var(--el-text-color-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.role-page__quick-nav-arrow { font-size: 18px; color: var(--el-text-color-placeholder); flex-shrink: 0; transition: color .2s, transform .2s; .role-page__quick-nav-card:hover & { color: var(--el-color-primary); transform: translateX(3px); } }
</style>
