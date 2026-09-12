<template>
  <div class="kanban-search-bar">
    <el-input
      v-model="searchLocal"
      :placeholder="t('kanban.search.placeholder')"
      size="small"
      clearable
      style="width: 200px"
      @update:model-value="onInput"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    <HeroDateNav
      :filter-date="filterDate"
      :label="filterDateLabel"
      :is-today="isFilterToday"
      @prev="$emit('prev-day')"
      @next="$emit('next-day')"
      @today="$emit('go-today')"
      @clear="$emit('clear-date')"
    />
  </div>
</template>

<script setup lang="ts" name="KanbanSearchBar">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Search } from "@element-plus/icons-vue";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";

const props = defineProps<{
  search: string;
  filterDate: Date | null;
  filterDateLabel: string;
  isFilterToday: boolean;
}>();

const emit = defineEmits<{
  "update:search": [val: string];
  "search-change": [val: string];
  "prev-day": [];
  "next-day": [];
  "go-today": [];
  "clear-date": [];
}>();

const { t } = useI18n();
const searchLocal = ref(props.search);
watch(() => props.search, (val) => { searchLocal.value = val; });
watch(searchLocal, (val) => emit("update:search", val));

let inputTimer: ReturnType<typeof setTimeout> | null = null;
function onInput(val: string) {
  if (inputTimer) clearTimeout(inputTimer);
  inputTimer = setTimeout(() => emit("search-change", val), 250);
}
</script>

<style scoped lang="scss">
.kanban-search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
</style>
