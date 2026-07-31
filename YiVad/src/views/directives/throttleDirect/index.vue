<template>
  <div class="card content-box">
    <span class="text">Throttle Directive 🍇🍇🍇🍓🍓🍓</span>
    <el-button v-throttle="throttleClick" type="primary"> Throttle Button (executes every 1s) </el-button>
  </div>
</template>

<script setup lang="ts" name="throttleDirect">
import { ElMessage } from "element-plus";
const throttleClick = () => {
  ElMessage.success("I am the event triggered by the throttle button 🍍🍓🍌");
};
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
