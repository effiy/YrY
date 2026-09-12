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
          'tab-bar__item--dirty': tab.dirty,
        }"
        @click="switchTo(tab.id)"
        @auxclick.prevent.middle="closeTab(tab.id)"
        @contextmenu.prevent="showContextMenu($event, tab)"
      >
        <span class="tab-bar__item-title">{{ tab.title }}</span>
        <span
          v-if="tab.closable !== false && !pinnedIds.has(tab.id)"
          class="tab-bar__item-close"
          @click.stop="closeTab(tab.id)"
        >×</span>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="tab-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <div class="tab-context-menu__item" @click="closeTab(contextMenu.tab!.id)">关闭</div>
        <div class="tab-context-menu__item" @click="closeOtherTabs(contextMenu.tab!.id)">关闭其他</div>
        <div class="tab-context-menu__item" @click="closeRightTabs(contextMenu.tab!.id)">关闭右侧</div>
        <div class="tab-context-menu__divider" />
        <div class="tab-context-menu__item" @click="closeAllTabs()">关闭全部</div>
        <div class="tab-context-menu__divider" />
        <div class="tab-context-menu__item" @click="pinnedIds.has(contextMenu.tab!.id) ? unpinTab(contextMenu.tab!.id) : pinTab(contextMenu.tab!.id)">
          {{ pinnedIds.has(contextMenu.tab!.id) ? '取消固定' : '固定' }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useTabWorkspace } from "@/composables/useTabWorkspace";

const {
  tabs, activeId, pinnedIds,
  switchTo, closeTab, closeOtherTabs, closeRightTabs, closeAllTabs,
  pinTab, unpinTab,
} = useTabWorkspace();

const contextMenu = reactive({
  visible: false, x: 0, y: 0, tab: null as any,
});

function showContextMenu(event: MouseEvent, tab: any) {
  contextMenu.visible = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.tab = tab;
}

function hideContextMenu() {
  contextMenu.visible = false;
}

onMounted(() => document.addEventListener("click", hideContextMenu));
onBeforeUnmount(() => document.removeEventListener("click", hideContextMenu));
</script>

<style scoped lang="scss">
.tab-bar {
  display: flex;
  align-items: stretch;
  height: 36px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  user-select: none;
}

.tab-bar__scroll {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar { height: 2px; }
}

.tab-bar__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  border-right: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s, color 0.1s;

  &:hover { background: var(--el-fill-color-light); }

  &--active {
    color: var(--el-color-primary);
    background: var(--el-bg-color-page);
    border-bottom: 2px solid var(--el-color-primary);
  }

  &--pinned { padding-left: 10px; }
}

.tab-bar__item-title {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-bar__item-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1;

  &:hover { background: var(--el-fill-color); color: var(--el-color-danger); }
}

.tab-context-menu {
  position: fixed;
  z-index: 10000;
  min-width: 140px;
  padding: 4px 0;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.tab-context-menu__item {
  padding: 6px 14px;
  font-size: 12px;
  cursor: pointer;
  color: var(--el-text-color-primary);

  &:hover { background: var(--el-fill-color-light); }
}

.tab-context-menu__divider {
  height: 1px;
  margin: 4px 8px;
  background: var(--el-border-color-lighter);
}
</style>