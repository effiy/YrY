import router from "@/routers";
import { defineStore } from "pinia";
import { ref } from "vue";
import { getUrlWithParams } from "@/utils";
import { useKeepAliveStore } from "./keepAlive";
import type { TabsMenuProps } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";

const keepAliveStore = useKeepAliveStore();

export const useTabsStore = defineStore(
  "yivad-tabs",
  () => {
    const tabsMenuList = ref<TabsMenuProps[]>([]);

    function addTabs(tabItem: TabsMenuProps) {
      const dedupKey = tabItem.independentTab ? tabItem.path : (tabItem.name || tabItem.path);
      const existing = tabsMenuList.value.find((item) => {
        const key = item.independentTab ? item.path : (item.name || item.path);
        return key === dedupKey;
      });
      if (existing) {
        existing.path = tabItem.path;
        existing.title = tabItem.title;
      } else {
        tabsMenuList.value.push(tabItem);
      }
      if (!keepAliveStore.keepAliveName.includes(tabItem.path) && tabItem.isKeepAlive) {
        keepAliveStore.addKeepAliveName(tabItem.path);
      }
    }

    function removeTabs(tabPath: string, isCurrent: boolean = true) {
      if (isCurrent) {
        tabsMenuList.value.forEach((item, index) => {
          if (item.path !== tabPath) return;
          const nextTab = tabsMenuList.value[index + 1] || tabsMenuList.value[index - 1];
          if (!nextTab) return;
          router.push(nextTab.path);
        });
      }
      const tabItem = tabsMenuList.value.find((item) => item.path === tabPath);
      tabItem?.isKeepAlive && keepAliveStore.removeKeepAliveName(tabItem.path);
      tabsMenuList.value = tabsMenuList.value.filter((item) => item.path !== tabPath);
    }

    function closeTabsOnSide(path: string, type: "left" | "right") {
      const currentIndex = tabsMenuList.value.findIndex((item) => item.path === path);
      if (currentIndex !== -1) {
        const range = type === "left" ? [0, currentIndex] : [currentIndex + 1, tabsMenuList.value.length];
        tabsMenuList.value = tabsMenuList.value.filter((item, index) => {
          return index < range[0] || index >= range[1] || !item.close;
        });
      }
      const keepAliveList = tabsMenuList.value.filter((item) => item.isKeepAlive);
      keepAliveStore.setKeepAliveName(keepAliveList.map((item) => item.path));
    }

    function closeMultipleTab(tabsMenuValue?: string) {
      tabsMenuList.value = tabsMenuList.value.filter((item) => {
        return item.path === tabsMenuValue || !item.close;
      });
      const keepAliveList = tabsMenuList.value.filter((item) => item.isKeepAlive);
      keepAliveStore.setKeepAliveName(keepAliveList.map((item) => item.path));
    }

    function setTabs(list: TabsMenuProps[]) {
      tabsMenuList.value = list;
    }

    function setTabsTitle(title: string) {
      const currentPath = getUrlWithParams();
      tabsMenuList.value.forEach((item) => {
        if (item.path === currentPath) item.title = title;
      });
    }

    return { tabsMenuList, addTabs, removeTabs, closeTabsOnSide, closeMultipleTab, setTabs, setTabsTitle };
  },
  { persist: piniaPersistConfig("yivad-tabs") }
);
