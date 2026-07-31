<template>
  <div class="card content-box">
    <span class="text"> Tab Detail Page 🍓🍇🍈🍉</span>
    <span class="text">params:{{ route.params }}</span>
    <el-input v-model="value" placeholder="Test detail page cache"></el-input>
  </div>
</template>

<script setup lang="ts" name="tabsDetail">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useTabsStore } from "@/stores/modules/tabs";

const route = useRoute();
const tabStore = useTabsStore();
tabStore.setTabsTitle(`No.${route.params.id} - ${route.meta.title}`);

const value = ref("");
</script>
