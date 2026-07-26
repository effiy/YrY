<template>
  <div class="card content-box">
    <span class="text">I'm menu2-3 🍓🍇🍈🍉</span>
    <el-input v-model="value" placeholder="Test cache"></el-input>
  </div>
</template>

<script setup lang="ts" name="menu23">
import { ref } from "vue";
const value = ref("");
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
