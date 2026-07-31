<template>
  <div class="card content-box">
    <span class="text"> Menu Permissions 🍓🍇🍈🍉</span>
    <el-alert
      :title="'Menu permissions are currently implemented via dynamic routing, simulating backend returning different routes based on user roles. Observe the left menu changes (admin account can view all menus; user account can view only partial menus)'"
      type="success"
      :closable="false"
    />
    <el-button class="mt20" type="primary" :icon="Promotion" @click="handleToLogin"> Login as another account </el-button>
  </div>
</template>

<script setup lang="ts" name="authMenu">
import { useRouter } from "vue-router";
import { LOGIN_URL } from "@/config";
import { useUserStore } from "@/stores/modules/user";
import { Promotion } from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();

const handleToLogin = () => {
  userStore.setToken("");
  router.push(LOGIN_URL);
};
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
