<template>
  <div class="date-range-picker">
    <el-radio-group v-model="preset" size="small" @change="onPresetChange">
      <el-radio-button value="today">Today</el-radio-button>
      <el-radio-button value="week">Week</el-radio-button>
      <el-radio-button value="month">Month</el-radio-button>
      <el-radio-button value="quarter">Quarter</el-radio-button>
      <el-radio-button value="custom">Custom</el-radio-button>
    </el-radio-group>
    <el-date-picker
      v-if="preset === 'custom'"
      v-model="customRange"
      type="daterange"
      range-separator="~"
      start-placeholder="Start"
      end-placeholder="End"
      size="small"
      @change="onCustomChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import dayjs from "dayjs";
import type { DateRange } from "@/types/analytics";

const emit = defineEmits<{ change: [range: DateRange] }>();

const preset = ref<"today" | "week" | "month" | "quarter" | "custom">("month");
const customRange = ref<[Date, Date]>();

const presets: Record<string, () => DateRange> = {
  today: () => ({ start: dayjs().format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") }),
  week: () => ({ start: dayjs().subtract(7, "day").format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") }),
  month: () => ({ start: dayjs().subtract(30, "day").format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") }),
  quarter: () => ({ start: dayjs().subtract(90, "day").format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") }),
};

function onPresetChange(val: string | number | boolean | undefined) {
  if (typeof val !== "string" || val === "custom") return;
  emit("change", presets[val]());
}

function onCustomChange(val: [Date, Date] | null) {
  if (!val) return;
  emit("change", {
    start: dayjs(val[0]).format("YYYY-MM-DD"),
    end: dayjs(val[1]).format("YYYY-MM-DD"),
  });
}

const currentRange = computed(() => presets[preset.value]?.() ?? { start: "", end: "" });
emit("change", currentRange.value);
</script>

<style scoped lang="scss">
.date-range-picker { display: flex; align-items: center; gap: 12px; }
</style>