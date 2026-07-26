<template>
  <div class="card content-box">
    <span class="text">Debounce Directive 🍇🍇🍇🍓🍓🍓</span>
    <el-button v-debounce="debounceClick" type="primary"> Debounce Button (executes after 0.5s) </el-button>
  </div>
</template>

<script setup lang="ts" name="debounceDirect">
import { ElMessage } from "element-plus";
const debounceClick = () => {
  ElMessage.success("I am the event triggered by the debounce button 🍍🍓🍌");
};
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
