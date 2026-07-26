<template>
  <div class="card content-box">
    <span class="text">Long Press Directive 🍇🍇🍇🍓🍓🍓</span>
    <el-button v-longpress="longpress" type="primary"> Long press for 2 seconds to trigger </el-button>
  </div>
</template>

<script setup lang="ts" name="longpressDirect">
import { ElMessage } from "element-plus";
const longpress = () => {
  ElMessage.success("Long press event triggered successfully 🎉🎉🎉");
};
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
