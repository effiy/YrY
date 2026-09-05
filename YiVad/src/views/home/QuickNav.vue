<template>
  <div class="ho__quick-nav">
    <template v-for="(group, groupIndex) in quickNavGroups" :key="group.key">
      <div class="ho__quick-nav-group">
        <span class="ho__quick-nav-grouplabel" :style="{ borderLeftColor: groupColors[groupIndex] }">{{ group.label }}</span>
        <template v-for="nav in group.items" :key="nav.key || nav.path">
          <el-popover
            v-if="nav.key === 'knowledge'"
            :visible="knowledgePopoverVisible"
            trigger="click"
            placement="bottom-start"
            :width="200"
            :offset="4"
            popper-class="qn__knowledge-popover"
            @show="knowledgePopoverVisible = true"
            @hide="knowledgePopoverVisible = false"
          >
            <template #reference>
              <div class="ho__quick-card" @click="knowledgePopoverVisible = !knowledgePopoverVisible">
                <span class="ho__quick-icon">{{ nav.icon }}</span>
                <span class="ho__quick-label">{{ nav.label }}</span>
                <span v-if="nav.count !== undefined" class="ho__quick-count">{{ nav.count }}</span>
                <el-icon class="ho__quick-arrow" :class="{ 'is-open': knowledgePopoverVisible }"><ArrowDown /></el-icon>
              </div>
            </template>
            <div class="ho__knowledge-grid">
              <div
                v-for="sub in knowledgeSubPages"
                :key="sub.path"
                class="ho__knowledge-item"
                @click="handleNavigate(sub.path); knowledgePopoverVisible = false"
              >
                <span class="ho__knowledge-item-icon">{{ sub.icon }}</span>
                <span class="ho__knowledge-item-label">{{ sub.label }}</span>
              </div>
            </div>
          </el-popover>
          <div v-else-if="nav.key === 'rss'" class="ho__quick-card" @click="handleNavigate(nav.path)">
            <span class="ho__quick-icon">{{ nav.icon }}</span>
            <span class="ho__quick-label">{{ nav.label }}</span>
            <el-icon class="ho__quick-external"><TopRight /></el-icon>
          </div>
          <div v-else class="ho__quick-card" @click="handleNavigate(nav.path)">
            <span class="ho__quick-icon">{{ nav.icon }}</span>
            <span class="ho__quick-label">{{ nav.label }}</span>
            <span v-if="nav.count !== undefined" class="ho__quick-count">{{ nav.count }}</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="QuickNav">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowDown, TopRight } from "@element-plus/icons-vue";
import { useProjectStore } from "@/stores/modules/project";

interface QuickNavCounts {
  requirementCount: number;
  totalIssues: number;
  bugCount: number;
  totalModules: number;
  chatSessionCount: number;
  knowledgeFileCount: number;
}

const props = defineProps<{
  counts: QuickNavCounts;
}>();

const { t } = useI18n();
const router = useRouter();
const projectStore = useProjectStore();

const groupColors = ["#7c3aed", "#409eff", "#e6a23c", "#67c23a"];
const knowledgePopoverVisible = ref(false);

function handleNavigate(path: string) {
  router.push(path);
}

const knowledgeSubPages = computed(() => [
  { icon: "🤖", label: t("home.knowledgeSubPages.aier"), path: "/aier" },
  { icon: "📚", label: t("home.knowledgeSubPages.curator"), path: "/curator" },
  { icon: "⚙️", label: t("home.knowledgeSubPages.engineer"), path: "/engineer" },
  { icon: "🏆", label: t("home.knowledgeSubPages.executiver"), path: "/executiver" },
  { icon: "⭐", label: t("home.knowledgeSubPages.leader"), path: "/leader" },
  { icon: "📦", label: t("home.knowledgeSubPages.producter"), path: "/producter" },
  { icon: "🔄", label: t("home.knowledgeSubPages.pipeline"), path: "/pipeline" },
  { icon: "🛠️", label: t("home.knowledgeSubPages.skills"), path: "/skills" },
  { icon: "🛡️", label: t("home.knowledgeSubPages.srer"), path: "/srer" },
]);

const quickNavGroups = computed(() => [
  {
    key: "plan",
    label: t("home.quickNavGroups.plan.label"),
    items: [
      { icon: "📌", label: t("home.quickNavItems.kanban.label"), path: "/kanban" },
      { icon: "🗺️", label: t("home.quickNavItems.roadmap.label"), path: "/roadmap", count: props.counts.requirementCount },
      { icon: "🛠️", label: t("home.quickNavItems.skills.label"), path: "/skills" },
    ]
  },
  {
    key: "build",
    label: t("home.quickNavGroups.build.label"),
    items: [
      { icon: "📁", label: t("home.quickNavItems.project.label"), path: "/project", count: projectStore.projects.length },
      { icon: "🎯", label: t("home.quickNavItems.issue.label"), path: "/issue", count: props.counts.totalIssues },
      { icon: "📡", label: t("home.quickNavItems.rss.label"), key: "rss", path: "/dashboard/rssContent" },
    ]
  },
  {
    key: "quality",
    label: t("home.quickNavGroups.quality.label"),
    items: [
      { icon: "🐛", label: t("home.quickNavItems.bug.label"), path: "/bug", count: props.counts.bugCount },
      { icon: "🧩", label: t("home.quickNavItems.module.label"), path: "/module", count: props.counts.totalModules },
      { icon: "🔍", label: t("home.quickNavItems.search.label"), path: "/search" },
    ]
  },
  {
    key: "intelligence",
    label: t("home.quickNavGroups.intelligence.label"),
    items: [
      { icon: "🤖", label: t("home.quickNavItems.aiChat.label"), path: "/aiChat", count: props.counts.chatSessionCount },
      { icon: "📚", label: t("home.quickNavItems.knowledge.label"), key: "knowledge", path: "/knowledge", count: props.counts.knowledgeFileCount },
    ]
  },
]);
</script>

<style scoped lang="scss">
.ho__quick-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.ho__quick-nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ho__quick-nav-grouplabel {
  font-size: 9px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 4px;
  border-left: 2px solid transparent;
}

.ho__quick-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}

.ho__quick-icon {
  font-size: 15px;
  flex-shrink: 0;
  line-height: 1;
}

.ho__quick-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ho__quick-count {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
  text-align: center;
}

.ho__quick-arrow {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  transition: transform 0.2s;
  flex-shrink: 0;

  &.is-open { transform: rotate(180deg); }
}

.ho__quick-external {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  transition: color 0.15s;

  .ho__quick-card:hover & { color: var(--el-color-primary); }
}

.ho__knowledge-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 4px;
}

.ho__knowledge-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: var(--el-fill-color-light); }
}

.ho__knowledge-item-icon {
  font-size: 14px;
  flex-shrink: 0;
  line-height: 1;
}

.ho__knowledge-item-label {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

@media (max-width: 900px) {
  .ho__quick-nav { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .ho__quick-nav { grid-template-columns: 1fr; }
}
</style>

<style lang="scss">
.qn__knowledge-popover {
  padding: 4px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}
</style>
