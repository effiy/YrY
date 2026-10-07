<template>
  <el-dialog v-model="visible" :title="$t('export.columnMapping')" width="500px">
    <el-table :data="mappings" size="small">
      <el-table-column prop="source" :label="$t('export.sourceColumn')" />
      <el-table-column :label="$t('export.targetField')">
        <template #default="{ row }">
          <el-select v-model="row.target" size="small" filterable :placeholder="$t('export.selectTarget')">
            <el-option v-for="f in targetFields" :key="f.key" :label="f.label" :value="f.key" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">{{ $t("common.cancel") }}</el-button>
      <el-button type="primary" @click="confirm">{{ $t("common.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

useI18n();

export interface MappingRow {
  source: string;
  target: string;
}

const props = defineProps<{ mappings: MappingRow[]; targetFields: { key: string; label: string }[] }>();
const emit = defineEmits<{ confirm: [mappings: MappingRow[]] }>();

const visible = ref(false);

function confirm() {
  emit("confirm", props.mappings);
  visible.value = false;
}

defineExpose({ open: () => { visible.value = true; } });
</script>