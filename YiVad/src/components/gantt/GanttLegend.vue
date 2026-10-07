<template>
  <div class="gantt-legend">
    <span class="gantt-legend__item"><span class="gantt-legend__swatch" style="background:#909399" /> 未开始</span>
    <span class="gantt-legend__item"><span class="gantt-legend__swatch" style="background:#409eff" /> 进行中</span>
    <span class="gantt-legend__item"><span class="gantt-legend__swatch" style="background:#e6a23c" /> 评审中</span>
    <span class="gantt-legend__item"><span class="gantt-legend__swatch" style="background:#67c23a" /> 已完成</span>
    <span class="gantt-legend__item"><span class="gantt-legend__swatch is-milestone" /> 里程碑</span>
    <span class="gantt-legend__item"><span class="gantt-legend__line" /> 依赖</span>
    <span class="gantt-legend__item"><span class="gantt-legend__swatch" style="background:#f56c6c" /> 关键路径</span>
    <span class="gantt-legend__item"><span class="gantt-legend__swatch is-overdue" /> 已逾期</span>
  </div>
</template>

<script setup lang="ts" name="GanttLegend">
</script>

<style scoped lang="scss">
.gantt-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.gantt-legend__item {
  display: flex;
  gap: 4px;
  align-items: center;
}
.gantt-legend__swatch {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  &.is-milestone {
    width: 0;
    height: 0;
    border: 7px solid transparent;
    border-bottom-color: #333;
    border-radius: 0;
    background: none;
    transform: rotate(0deg);
  }
  &.is-overdue {
    background: repeating-linear-gradient(-45deg, #f56c6c, #f56c6c 2px, #fff 2px, #fff 5px);
    border: 1px solid #f56c6c;
  }
}
.gantt-legend__line {
  width: 16px;
  height: 1px;
  border-top: 1.5px dashed #999;
}
</style>