<template>
  <div class="card content-box">
    <span class="text">Grid Demo</span>
    <el-alert
      title="Grid is a responsive grid layout system with breakpoint-aware column configuration and optional collapse support. Used heavily by SearchForm."
      type="warning"
      :closable="false"
    />
    <Grid :cols="{ xs: 1, sm: 2, md: 3, lg: 4 } as Record<string, number>" :gap="[16, 16]">
      <GridItem v-for="i in 8" :key="i">
        <div class="grid-demo-item">{{ i }}</div>
      </GridItem>
    </Grid>
    <el-descriptions title="Grid Props" :column="1" border class="mt30">
      <el-descriptions-item label="cols">number | Record&lt;BreakPoint, number&gt; — columns per breakpoint</el-descriptions-item>
      <el-descriptions-item label="collapsed">boolean — collapse extra rows</el-descriptions-item>
      <el-descriptions-item label="collapsedRows">number — visible rows when collapsed, default 1</el-descriptions-item>
      <el-descriptions-item label="gap">[number, number] | number — row &amp; column gap</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="GridItem Props" :column="1" border class="mt30">
      <el-descriptions-item label="suffix">boolean — item is pinned to the right (for action buttons)</el-descriptions-item>
      <el-descriptions-item label="index">number — item index for collapse logic</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoGrid">
import Grid from "@/components/Grid/index.vue";
import GridItem from "@/components/Grid/components/GridItem.vue";
</script>

<style scoped lang="scss">
.grid-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.mt30 { margin-top: 30px; }
</style>