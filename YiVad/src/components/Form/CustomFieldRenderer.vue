<template>
  <div class="cf-renderer">
    <template v-for="field in fields" :key="field.key">
      <el-form-item :label="field.label" :required="field.required">
        <!-- Text -->
        <el-input
          v-if="field.field_type === 'text'"
          :model-value="getValue(field.key)"
          :maxlength="field.validation?.max_length"
          @update:model-value="setValue(field.key, $event)"
        />
        <!-- Number -->
        <el-input-number
          v-else-if="field.field_type === 'number'"
          :model-value="getValue(field.key)"
          :min="field.validation?.min"
          :max="field.validation?.max"
          @update:model-value="setValue(field.key, $event)"
        />
        <!-- Date -->
        <el-date-picker
          v-else-if="field.field_type === 'date'"
          :model-value="getValue(field.key)"
          type="date"
          @update:model-value="setValue(field.key, $event)"
        />
        <!-- Select -->
        <el-select
          v-else-if="field.field_type === 'select'"
          :model-value="getValue(field.key)"
          @update:model-value="setValue(field.key, $event)"
        >
          <el-option
            v-for="opt in (field.validation?.options || [])"
            :key="opt"
            :label="opt"
            :value="opt"
          />
        </el-select>
        <!-- Multi Select -->
        <el-select
          v-else-if="field.field_type === 'multi_select'"
          :model-value="getValue(field.key) || []"
          multiple
          @update:model-value="setValue(field.key, $event)"
        >
          <el-option
            v-for="opt in (field.validation?.options || [])"
            :key="opt"
            :label="opt"
            :value="opt"
          />
        </el-select>
        <!-- URL -->
        <el-input
          v-else-if="field.field_type === 'url'"
          :model-value="getValue(field.key)"
          placeholder="https://"
          @update:model-value="setValue(field.key, $event)"
        />
        <!-- Checkbox -->
        <el-checkbox
          v-else-if="field.field_type === 'checkbox'"
          :model-value="getValue(field.key)"
          @update:model-value="setValue(field.key, $event)"
        />
        <!-- Default: text -->
        <el-input
          v-else
          :model-value="getValue(field.key)"
          @update:model-value="setValue(field.key, $event)"
        />
      </el-form-item>
    </template>
  </div>
</template>

<script setup lang="ts" name="CustomFieldRenderer">
import { type PropType } from "vue";
import type { CustomFieldDef } from "@/types/customField";

const props = defineProps({
  fields: { type: Array as PropType<CustomFieldDef[]>, required: true },
  values: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
});

const emit = defineEmits<{ "update:values": [values: Record<string, any>] }>();

function getValue(key: string) {
  return props.values[key] ?? null;
}

function setValue(key: string, val: any) {
  emit("update:values", { ...props.values, [key]: val });
}
</script>