<template>
  <div class="tab-bar">
    <div class="tab-bar__scroll">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-bar__item"
        :class="{
          'tab-bar__item--active': tab.id === activeId,
          'tab-bar__item--pinned': pinnedIds.has(tab.id),
          'tab-bar__item--dirty': tab.dirty
        }"
        @click="switchTo(tab.id)"
        @auxclick.prevent.middle="closeTab(tab.id)"
        @contextmenu.prevent="onTabContextMenu($event, tab)"
      >
        <span class="tab-bar__item-title">{{ tab.title }}</span>
        <span
          v-if="tab.closable !== false && !pinnedIds.has(tab.id)"
          class="tab-bar__item-close"
          @click.stop="closeTab(tab.id)"
          >×</span
        >
      </div>
    </div>

    <ContextMenu
      :visible="tabCm.visible.value"
      :position="tabCm.position.value"
      :items="menuItems"
      :context="(tabCm.context.value as any) ?? null"
      @hide="tabCm.hide()"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * TabBar — 顶部多标签工作区。
 *
 * 2026-10-09 Refactor (Phase 1 P1-2):
 *   删除内部自持有 Tab 右键「Teleport + backdrop + addEventListener('click')
 *   样板（~35 行），改为复用通用 ContextMenu + useContextMenu 状态机：
 *   - 统一接入 useMenuKeyboard（↑↓/Enter/Esc）与菜单定位防溢出
 *   - 消除与 Kanban/Roadmap 的三处重复样板代码
 */
import { computed } from "vue";
import { useTabWorkspace } from "@/hooks/useTabWorkspace";
import ContextMenu from "@/components/context-menu/ContextMenu.vue";
import { useContextMenu } from "@/composables/menu/useContextMenu";
import type { MenuItem } from "@/components/context-menu/types";

const {
  tabs,
  activeId,
  pinnedIds,
  switchTo,
  closeTab,
  closeOtherTabs,
  closeRightTabs,
  closeAllTabs,
  pinTab,
  unpinTab
} = useTabWorkspace();

const tabCm = useContextMenu();

/** 点击的 tab（从 context.pageContext 获取）。 */
function onTabContextMenu(event: MouseEvent, tab: any) {
  tabCm.show(event, [] as MenuItem[], { pageContext: { tab } });
}

/** 根据当前 context 中的 tab 动态生成菜单。 */
const menuItems = computed<MenuItem[]>(() => {
  const tab = tabCm.context.value?.pageContext?.tab;
  if (!tab) return [];
  const tabId: string = tab.id;
  const isPinned = pinnedIds.value.has(tabId);
  return [
    { id: "close", type: "action", label: "关闭", action: () => closeTab(tabId) },
    { id: "close-other", type: "action", label: "关闭其他", action: () => closeOtherTabs(tabId) },
    { id: "close-right", type: "action", label: "关闭右侧", action: () => closeRightTabs(tabId) },
    { id: "d1", type: "divider" },
    { id: "close-all", type: "action", label: "关闭全部", action: () => closeAllTabs() },
    { id: "d2", type: "divider" },
    {
      id: "pin",
      type: "action",
      label: isPinned ? "取消固定" : "固定",
      action: () => (isPinned ? unpinTab(tabId) : pinTab(tabId))
    }
  ];
});
</script>

<style scoped lang="scss">
.tab-bar {
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;
  width: 100%;
  overflow: hidden;
  background: var(--el-bg-color-page, #f5f7fa);
  border-bottom: 1px solid var(--el-border-color-lighter);
  &__scroll {
    display: flex;
    align-items: stretch;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    scrollbar-width: thin;
  }
  &__item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    padding: 0 14px;
    height: 36px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    border-right: 1px solid var(--el-border-color-lighter);
    transition: color 120ms, background-color 120ms;
    &:hover {
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-light);
    }
    &--active {
      color: var(--el-color-primary);
      background: var(--el-bg-color);
      box-shadow: inset 0 -2px 0 var(--el-color-primary);
    }
    &--pinned::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--el-color-primary);
    }
    &--dirty::after {
      content: "";
      position: absolute;
      top: 6px;
      right: 6px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--el-color-warning);
    }
    &-title {
      white-space: nowrap;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      line-height: 1;
      color: var(--el-text-color-secondary);
      border-radius: 50%;
      transition: color 120ms, background-color 120ms;
      &:hover {
        color: #fff;
        background: var(--el-color-info);
      }
    }
  }
}
</style>
