<template>
  <div class="card content-box">
    <span class="text"> Icon Selector 🍓🍇🍈🍉</span>
    <SelectIcon v-model:icon-value="iconValue" />
    <el-descriptions title="Config Options 📚" :column="1" border>
      <el-descriptions-item label="iconValue">
        Two-way bound icon value, e.g.: v-model:icon-value="iconValue"
      </el-descriptions-item>
      <el-descriptions-item label="title"> Dialog title </el-descriptions-item>
      <el-descriptions-item label="clearable"> Whether clearable, default true </el-descriptions-item>
      <el-descriptions-item label="placeholder"> Input placeholder text </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="selectIcon">
import { ref } from "vue";
import SelectIcon from "@/components/SelectIcon/index.vue";
const iconValue = ref("");
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
