<template>
  <div class="card content-box">
    <span class="text">I'm menu1 🍓🍇🍈🍉</span>
    <el-input v-model="value" placeholder="Test cache"></el-input>
  </div>
</template>

<script setup lang="ts" name="menu1">
import { ref } from "vue";
const value = ref<string>("");
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
