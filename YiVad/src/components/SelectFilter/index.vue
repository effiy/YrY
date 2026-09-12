<template>
  <div class="select-filter">
    <div v-for="item in data" :key="item.key" class="select-filter-item">
      <div class="select-filter-item-title">
        <span>{{ item.title }} :</span>
      </div>
      <span v-if="!item.options.length" class="select-filter-notData">No data ~</span>
      <el-scrollbar>
        <ul class="select-filter-list">
          <li
            v-for="option in item.options"
            :key="option.value"
            :class="{
              active:
                option.value === selected[item.key] ||
                (Array.isArray(selected[item.key]) && selected[item.key].includes(option.value))
            }"
            @click="select(item, option)"
          >
            <slot :row="option">
              <el-icon v-if="option.icon">
                <component :is="option.icon" />
              </el-icon>
              <span>{{ option.label }}</span>
            </slot>
          </li>
        </ul>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts" name="selectFilter">
import { ref, watch } from "vue";

interface OptionsProps {
  value: string | number;
  label: string;
  icon?: string;
}

interface SelectDataProps {
  title: string; // List title
  key: string; // Current filter item key
  multiple?: boolean; // Whether multi-select
  options: OptionsProps[]; // Filter data
}

interface SelectFilterProps {
  data?: SelectDataProps[]; // Selected list data
  defaultValues?: { [key: string]: any }; // Default values
}

const props = withDefaults(defineProps<SelectFilterProps>(), {
  data: () => [],
  defaultValues: () => ({})
});

// Re-receive default values
const selected = ref<{ [key: string]: any }>({});
watch(
  () => props.defaultValues,
  () => {
    props.data.forEach(item => {
      if (item.multiple) selected.value[item.key] = props.defaultValues[item.key] ?? [""];
      else selected.value[item.key] = props.defaultValues[item.key] ?? "";
    });
  },
  { deep: true, immediate: true }
);

// emit
const emit = defineEmits<{
  change: [value: any];
}>();

/**
 * @description Select filter item
 * @param {Object} item Selected list item
 * @param {Object} option Selected value
 * @return void
 * */
const select = (item: SelectDataProps, option: OptionsProps) => {
  if (!item.multiple) {
    // * Single select
    if (selected.value[item.key] !== option.value) selected.value[item.key] = option.value;
  } else {
    // * Multi-select
    // If first value is selected, set directly
    if (item.options[0].value === option.value) selected.value[item.key] = [option.value];
    // If selected value is already selected, deselect it
    if (selected.value[item.key].includes(option.value)) {
      let currentIndex = selected.value[item.key].findIndex((s: any) => s === option.value);
      selected.value[item.key].splice(currentIndex, 1);
      // When all are removed, select the first value
      if (selected.value[item.key].length == 0) selected.value[item.key] = [item.options[0].value];
    } else {
      // When clicking an unselected value, add it
      selected.value[item.key].push(option.value);
      // When all is selected and clicking an unselected value, remove the first value
      if (selected.value[item.key].includes(item.options[0].value)) selected.value[item.key].splice(0, 1);
    }
  }
  emit("change", selected.value);
};
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
