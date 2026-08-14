<template>
  <div class="card content-box">
    <span class="text">SelectIcon Demo</span>
    <el-alert
      title="SelectIcon is an icon picker component. It renders a popover with a searchable grid of icons, suitable for menu/setting icon selection."
      type="warning"
      :closable="false"
    />
    <SelectIcon :icon-value="icon" @update:icon-value="icon = $event" />
    <p class="mt30">Selected icon: <strong>{{ icon }}</strong></p>
    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="iconValue">string — v-model bound icon name (v-model:icon-value)</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoSelectIcon">
import { ref } from "vue";
import SelectIcon from "@/components/SelectIcon/index.vue";

const icon = ref("HomeFilled");
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>