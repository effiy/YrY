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
                <el-icon class="ho__quick-icon"><component :is="NAV_ICONS[nav.key]" /></el-icon>
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
                @click="
                  handleNavigate(sub.path);
                  knowledgePopoverVisible = false;
                "
              >
                <span class="ho__knowledge-item-icon">{{ sub.icon }}</span>
                <span class="ho__knowledge-item-label">{{ sub.label }}</span>
              </div>
            </div>
          </el-popover>
          <div v-else-if="nav.key === 'rss'" class="ho__quick-card" @click="handleNavigate(nav.path)">
            <el-icon class="ho__quick-icon"><component :is="NAV_ICONS[nav.key]" /></el-icon>
            <span class="ho__quick-label">{{ nav.label }}</span>
            <el-icon class="ho__quick-external"><TopRight /></el-icon>
          </div>
          <div v-else class="ho__quick-card" @click="handleNavigate(nav.path)">
            <el-icon class="ho__quick-icon"><component :is="NAV_ICONS[nav.key]" /></el-icon>
            <span class="ho__quick-label">{{ nav.label }}</span>
            <span v-if="nav.count !== undefined" class="ho__quick-count">{{ nav.count }}</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="QuickNav">
import { computed, ref, type Component } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ArrowDown,
  TopRight,
  Position,
  MapLocation,
  Setting,
  Folder,
  Aim,
  Connection,
  Warning,
  Grid,
  Search,
  Service,
  Collection
} from "@element-plus/icons-vue";
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

const NAV_ICONS: Record<string, Component> = {
  kanban: Position,
  roadmap: MapLocation,
  skills: Setting,
  project: Folder,
  issue: Aim,
  rss: Connection,
  bug: Warning,
  module: Grid,
  search: Search,
  aiChat: Service,
  knowledge: Collection
};

function handleNavigate(path: string) {
  router.push(path);
}

const knowledgeSubPages = computed(() => [
  { icon: "🤖", label: t("home.knowledgeSubPages.aier"), path: "/knowledge/aier" },
  { icon: "📚", label: t("home.knowledgeSubPages.curator"), path: "/knowledge/curator" },
  { icon: "⚙️", label: t("home.knowledgeSubPages.engineer"), path: "/knowledge/engineer" },
  { icon: "🏆", label: t("home.knowledgeSubPages.executiver"), path: "/knowledge/executive" },
  { icon: "⭐", label: t("home.knowledgeSubPages.leader"), path: "/knowledge/leader" },
  { icon: "📦", label: t("home.knowledgeSubPages.producter"), path: "/knowledge/product" },
  { icon: "🔄", label: t("home.knowledgeSubPages.pipeline"), path: "/knowledge/pipeline" },
  { icon: "🛠️", label: t("home.knowledgeSubPages.skills"), path: "/knowledge/skills" },
  { icon: "🛡️", label: t("home.knowledgeSubPages.srer"), path: "/knowledge/sre" }
]);

const quickNavGroups = computed(() => [
  {
    key: "plan",
    label: t("home.quickNavGroups.plan.label"),
    items: [
      { key: "kanban", label: t("home.quickNavItems.kanban.label"), path: "/kanban" },
      { key: "roadmap", label: t("home.quickNavItems.roadmap.label"), path: "/roadmap", count: props.counts.requirementCount },
      { key: "skills", label: t("home.quickNavItems.skills.label"), path: "/knowledge/skills" }
    ]
  },
  {
    key: "build",
    label: t("home.quickNavGroups.build.label"),
    items: [
      { key: "project", label: t("home.quickNavItems.project.label"), path: "/project", count: projectStore.projects.length },
      { key: "issue", label: t("home.quickNavItems.issue.label"), path: "/issue", count: props.counts.totalIssues },
      { key: "rss", label: t("home.quickNavItems.rss.label"), path: "/dashboard/rss-content" }
    ]
  },
  {
    key: "quality",
    label: t("home.quickNavGroups.quality.label"),
    items: [
      { key: "bug", label: t("home.quickNavItems.bug.label"), path: "/bug", count: props.counts.bugCount },
      { key: "module", label: t("home.quickNavItems.module.label"), path: "/module", count: props.counts.totalModules },
      { key: "search", label: t("home.quickNavItems.search.label"), path: "/search" }
    ]
  },
  {
    key: "intelligence",
    label: t("home.quickNavGroups.intelligence.label"),
    items: [
      { key: "aiChat", label: t("home.quickNavItems.aiChat.label"), path: "/ai-chat", count: props.counts.chatSessionCount },
      {
        key: "knowledge",
        label: t("home.quickNavItems.knowledge.label"),
        path: "/knowledge",
        count: props.counts.knowledgeFileCount
      }
    ]
  }
]);
</script>

<style scoped lang="scss">
.ho__quick-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.ho__quick-nav-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.ho__quick-nav-grouplabel {
  padding: 0 4px;
  font-size: 9px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-left: 2px solid transparent;
}
.ho__quick-card {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.ho__quick-icon {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 1;
}
.ho__quick-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.ho__quick-count {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
  color: var(--el-color-primary);
  text-align: center;
  background: var(--el-color-primary-light-9);
  border-radius: 9px;
}
.ho__quick-arrow {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  transition: transform 0.2s;
  &.is-open {
    transform: rotate(180deg);
  }
}
.ho__quick-external {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  transition: color 0.15s;
  .ho__quick-card:hover & {
    color: var(--el-color-primary);
  }
}
.ho__knowledge-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 4px;
}
.ho__knowledge-item {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.12s;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.ho__knowledge-item-icon {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;
}
.ho__knowledge-item-label {
  font-size: 12px;
  color: var(--el-text-color-primary);
}
</style>

<style lang="scss">
.qn__knowledge-popover {
  padding: 4px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgb(0 0 0 / 10%) !important;
}
</style>
