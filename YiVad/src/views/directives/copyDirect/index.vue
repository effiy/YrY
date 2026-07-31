<template>
  <div class="card content-box">
    <span class="text">Copy Directive 🍇🍇🍇🍓🍓🍓</span>
    <div class="box-content">
      <el-input v-model="data" placeholder="Please enter content" style="width: 500px">
        <template #append>
          <el-button v-copy="data"> Copy </el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts" name="copyDirect">
import { ref } from "vue";

const data = ref<string>("I am the content being copied 🍒 🍉 🍊");
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
