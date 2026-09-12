<template>
  <el-dialog v-model="visible" title="Column Mapping" width="500px">
    <el-table :data="mappings" size="small">
      <el-table-column prop="source" label="Source Column" />
      <el-table-column label="Target Field">
        <template #default="{ row, $index }">
          <el-select v-model="row.target" size="small" filterable placeholder="Select target field">
            <el-option v-for="f in targetFields" :key="f.key" :label="f.label" :value="f.key" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="confirm">Confirm</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

export interface MappingRow {
  source: string;
  target: string;
}

const props = defineProps<{ mappings: MappingRow[]; targetFields: { key: string; label: string }[] }>();
const emit = defineEmits<{ confirm: [mappings: MappingRow[]] }>();

const visible = ref(false);
const open = () => { visible.value = true; };
const close = () => { visible.value = false; };
const confirm = () => { emit("confirm", [...props.mappings]); visible.value = false; };

defineExpose({ open, close });
</script>