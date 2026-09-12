<template>
  <el-drawer v-model="visible" title="小部件设置" size="360px">
    <el-form label-position="top" size="small">
      <el-form-item label="标题">
        <el-input v-model="localConfig.title" placeholder="小部件标题" />
      </el-form-item>

      <el-form-item label="数据源">
        <el-select v-model="localConfig.dataSource" style="width: 100%">
          <el-option label="静态数据" value="static" />
          <el-option label="RPC 接口" value="rpc" />
        </el-select>
      </el-form-item>

      <template v-if="localConfig.dataSource === 'rpc'">
        <el-form-item label="RPC 模块">
          <el-input v-model="localConfig.rpc!.moduleName" placeholder="如: services.data.my_service" />
        </el-form-item>
        <el-form-item label="RPC 方法">
          <el-input v-model="localConfig.rpc!.methodName" placeholder="如: get_data" />
        </el-form-item>
      </template>

      <el-form-item label="刷新间隔（秒）">
        <el-input-number v-model="localConfig.refreshInterval" :min="0" :max="3600" :step="10" style="width: 100%" />
        <template #extra><span class="tip">0 表示不自动刷新</span></template>
      </el-form-item>

      <el-form-item label="图表类型">
        <el-select v-model="localConfig.chartType" style="width: 100%">
          <el-option label="折线图" value="line-chart" />
          <el-option label="柱状图" value="bar-chart" />
          <el-option label="饼图" value="pie-chart" />
          <el-option label="面积图" value="area-chart" />
          <el-option label="散点图" value="scatter-chart" />
          <el-option label="仪表盘图" value="gauge-chart" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="WidgetSettings">
import { ref, watch } from "vue";
import type { WidgetConfig } from "@/stores/dashboard";

interface Props {
  modelValue: boolean;
  widget: WidgetConfig | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [config: WidgetConfig];
}>();

const visible = ref(false);
const localConfig = ref<WidgetConfig>({
  id: "",
  widgetType: "",
  title: "",
  layout: { x: 0, y: 0, cols: 4, rows: 3 },
  dataSource: "static",
  refreshInterval: 0,
  chartType: "line-chart",
  rpc: { moduleName: "", methodName: "" },
});

watch(() => props.modelValue, (v) => {
  visible.value = v;
  if (v && props.widget) {
    localConfig.value = { ...props.widget };
  }
});

watch(visible, (v) => emit("update:modelValue", v));

function save() {
  emit("save", { ...localConfig.value });
  visible.value = false;
}
</script>

<style scoped lang="scss">
.tip { font-size: 11px; color: var(--el-text-color-secondary); }
</style>