<template>
  <div class="card content-box">
    <span class="text"> Tab Operations 🍓🍇🍈🍉</span>
    <div class="mb30">
      <el-input v-model="tabsTitle" placeholder="Please enter content" style="width: 500px">
        <template #append>
          <el-button type="primary" @click="editTabsTitle"> Set Tab Title </el-button>
        </template>
      </el-input>
    </div>
    <el-space class="mb30">
      <el-button type="primary" :icon="Refresh" @click="refresh"> Refresh Current Page </el-button>
      <el-button type="primary" :icon="FullScreen" @click="maximize"> Toggle Fullscreen </el-button>
      <el-button type="primary" :icon="FullScreen" @click="closeOnSide('left')"> Close Left Tabs </el-button>
      <el-button type="primary" :icon="FullScreen" @click="closeOnSide('right')"> Close Right Tabs </el-button>
      <el-button type="primary" :icon="Remove" @click="closeCurrentTab"> Close Current Tab </el-button>
      <el-button type="primary" :icon="CircleClose" @click="closeOtherTab"> Close Others </el-button>
      <el-button type="primary" :icon="FolderDelete" @click="closeAllTab"> Close All </el-button>
    </el-space>
    <el-space class="mb30">
      <el-button type="info" :icon="Promotion" @click="handleToDetail('1')"> Open Detail 1 </el-button>
      <el-button type="info" :icon="Promotion" @click="handleToDetail('2')"> Open Detail 2 </el-button>
      <el-button type="info" :icon="Promotion" @click="handleToDetail('3')"> Open Detail 3 </el-button>
      <el-button type="info" :icon="Promotion" @click="handleToDetail('4')"> Open Detail 4 </el-button>
      <el-button type="info" :icon="Promotion" @click="handleToDetail('5')"> Open Detail 5 </el-button>
    </el-space>
  </div>
</template>

<script setup lang="ts" name="tabs">
import { inject, nextTick, ref } from "vue";
import { HOME_URL } from "@/config";
import { useRoute, useRouter } from "vue-router";
import { useTabsStore } from "@/stores/modules/tabs";
import { useGlobalStore } from "@/stores/modules/global";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { Refresh, FullScreen, Remove, CircleClose, FolderDelete, Promotion } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const tabStore = useTabsStore();
const globalStore = useGlobalStore();
const keepAliveStore = useKeepAliveStore();

// Refresh current page
const refreshCurrentPage: Function = inject("refresh") as Function;
const refresh = () => {
  setTimeout(() => {
    route.meta.isKeepAlive && keepAliveStore.removeKeepAliveName(route.fullPath as string);
    refreshCurrentPage(false);
    nextTick(() => {
      route.meta.isKeepAlive && keepAliveStore.addKeepAliveName(route.fullPath as string);
      refreshCurrentPage(true);
    });
  }, 0);
};

// Set tab title
const tabsTitle = ref("");
const editTabsTitle = () => {
  if (!tabsTitle.value) return ElMessage.warning("Please enter a title");
  tabStore.setTabsTitle(tabsTitle.value);
};

// Toggle fullscreen for current page
const maximize = () => {
  globalStore.setGlobalState("maximize", !globalStore.maximize);
};

// Close current tab
const closeCurrentTab = () => {
  if (route.meta.isAffix) return;
  tabStore.removeTabs(route.fullPath);
};

// Close other tabs
const closeOtherTab = () => {
  tabStore.closeMultipleTab(route.fullPath);
};

// Close tabs on side
const closeOnSide = (direction: "left" | "right") => {
  tabStore.closeTabsOnSide(route.fullPath, direction);
};

// Close all tabs
const closeAllTab = () => {
  tabStore.closeMultipleTab();
  router.push(HOME_URL);
};

// Open detail page
const handleToDetail = (id: string) => {
  router.push(`/assembly/tabs/detail/${id}`);
};
</script>
