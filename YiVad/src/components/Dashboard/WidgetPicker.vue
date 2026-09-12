<template>
  <el-dialog v-model="visible" title="选择小部件" width="520px" :close-on-click-modal="false">
    <el-input
      v-model="search"
      placeholder="搜索小部件..."
      size="small"
      :prefix-icon="Search"
      class="widget-picker__search"
      clearable
    />
    <div class="widget-picker__groups" v-for="group in filteredGroups" :key="group.category">
      <div class="widget-picker__category">{{ group.label }}</div>
      <div class="widget-picker__items">
        <div
          v-for="item in group.items"
          :key="item.type"
          class="widget-picker__item"
          @click="selectWidget(item)"
        >
          <div class="widget-picker__item-icon">
            <el-icon :size="20"><component :is="item.icon" /></el-icon>
          </div>
          <div class="widget-picker__item-info">
            <div class="widget-picker__item-name">{{ item.name }}</div>
            <div class="widget-picker__item-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="widget-picker__empty" v-if="filteredGroups.length === 0">
      <span>未找到匹配的小部件</span>
    </div>
  </el-dialog>
</template>

<script setup lang="ts" name="WidgetPicker">
import { ref, computed } from "vue";
import { Search, TrendCharts, DataBoard, Grid, DataAnalysis, Setting } from "@element-plus/icons-vue";

export interface WidgetOption {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: "chart" | "metric" | "table" | "custom";
  defaultSize: { cols: number; rows: number };
}

interface Props {
  modelValue: boolean;
  availableWidgets?: WidgetOption[];
}

const props = withDefaults(defineProps<Props>(), {
  availableWidgets: () => [
    { type: "line-chart", name: "折线图", description: "趋势分析、时间序列", icon: "TrendCharts", category: "chart", defaultSize: { cols: 6, rows: 3 } },
    { type: "bar-chart", name: "柱状图", description: "分类对比", icon: "DataBoard", category: "chart", defaultSize: { cols: 6, rows: 3 } },
    { type: "pie-chart", name: "饼图", description: "占比分析", icon: "DataAnalysis", category: "chart", defaultSize: { cols: 4, rows: 3 } },
    { type: "area-chart", name: "面积图", description: "体量趋势", icon: "TrendCharts", category: "chart", defaultSize: { cols: 6, rows: 3 } },
    { type: "scatter-chart", name: "散点图", description: "相关性分析", icon: "DataBoard", category: "chart", defaultSize: { cols: 6, rows: 3 } },
    { type: "heatmap-chart", name: "热力图", description: "密度分布", icon: "Grid", category: "chart", defaultSize: { cols: 6, rows: 4 } },
    { type: "gauge-chart", name: "仪表盘图", description: "单一指标", icon: "Setting", category: "metric", defaultSize: { cols: 3, rows: 3 } },
    { type: "radar-chart", name: "雷达图", description: "多维对比", icon: "DataBoard", category: "chart", defaultSize: { cols: 6, rows: 4 } },
    { type: "treemap-chart", name: "矩形树图", description: "层级占比", icon: "Grid", category: "chart", defaultSize: { cols: 6, rows: 4 } },
    { type: "funnel-chart", name: "漏斗图", description: "转化率分析", icon: "DataAnalysis", category: "chart", defaultSize: { cols: 4, rows: 4 } },
    { type: "kpi-card", name: "KPI 卡片", description: "关键指标展示", icon: "DataBoard", category: "metric", defaultSize: { cols: 3, rows: 1 } },
    { type: "data-table", name: "数据表格", description: "详细数据列表", icon: "Grid", category: "table", defaultSize: { cols: 12, rows: 4 } },
    { type: "markdown-text", name: "Markdown 文本", description: "自定义文本内容", icon: "Setting", category: "custom", defaultSize: { cols: 6, rows: 2 } },
  ],
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [widget: WidgetOption];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const search = ref("");

const categoryLabels: Record<string, string> = {
  chart: "图表",
  metric: "指标",
  table: "表格",
  custom: "自定义",
};

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase();
  const filtered = q
    ? props.availableWidgets.filter(w => w.name.includes(q) || w.description.includes(q) || w.type.includes(q))
    : props.availableWidgets;

  const groups: Record<string, WidgetOption[]> = {};
  for (const w of filtered) {
    (groups[w.category] ??= []).push(w);
  }

  return Object.entries(groups).map(([category, items]) => ({
    category,
    label: categoryLabels[category] ?? category,
    items,
  }));
});

function selectWidget(item: WidgetOption) {
  emit("select", item);
  visible.value = false;
}
</script>

<style scoped lang="scss">
.widget-picker {
  &__search { margin-bottom: 12px; }
  &__groups { margin-bottom: 12px; }
  &__category {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  &__items { display: flex; flex-direction: column; gap: 4px; }
  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;

    &:hover {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-5);
    }
  }
  &__item-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    border-radius: 6px;
    flex-shrink: 0;
  }
  &__item-name { font-size: 13px; font-weight: 500; }
  &__item-desc { font-size: 11px; color: var(--el-text-color-secondary); }
  &__empty { text-align: center; padding: 24px; color: var(--el-text-color-secondary); }
}
</style>