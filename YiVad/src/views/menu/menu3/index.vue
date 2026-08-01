<template>
  <div class="card content-box">
    <span class="text">I am menu3 🍓🍇🍈🍉</span>
    <el-input v-model="value" placeholder="Test cache"></el-input>
  </div>
</template>

<script setup lang="ts" name="menu3">
import { ref } from "vue";

const value = ref<string>("");
</script>

<style scoped lang="scss">
@use "./index";
</style>
