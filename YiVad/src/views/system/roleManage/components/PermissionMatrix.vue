<template>
  <div class="permission-matrix">
    <div class="permission-matrix__toolbar">
      <el-button size="small" text type="primary" @click="selectAll">全选</el-button>
      <el-button size="small" text @click="deselectAll">取消全选</el-button>
    </div>
    <div class="permission-matrix__table">
      <table>
        <thead>
          <tr>
            <th class="permission-matrix__module-col">模块</th>
            <th class="permission-matrix__perm-col">权限</th>
            <th class="permission-matrix__check-col">授予</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="mod in PERMISSION_MODULES" :key="mod.module">
            <tr
              v-for="(perm, permIndex) in mod.permissions"
              :key="perm.code"
              :class="{ 'permission-matrix__row--first': permIndex === 0 }"
            >
              <td v-if="permIndex === 0" :rowspan="mod.permissions.length" class="permission-matrix__module-cell">
                {{ mod.label }}
              </td>
              <td class="permission-matrix__perm-cell">
                <code>{{ perm.code }}</code>
                <span class="permission-matrix__perm-label">{{ perm.label }}</span>
              </td>
              <td class="permission-matrix__check-cell">
                <el-checkbox :model-value="isChecked(perm.code)" @change="(val: boolean) => toggle(perm.code, val)" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts" name="PermissionMatrix">
import { PERMISSION_MODULES, PERMISSIONS, type PermissionCode } from "@/constants/permissions";

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const isChecked = (code: PermissionCode) => props.modelValue.includes(code);

const toggle = (code: PermissionCode, val: boolean) => {
  const next = val
    ? [...props.modelValue, code]
    : props.modelValue.filter(c => c !== code);
  emit("update:modelValue", next);
};

const allCodes = Object.values(PERMISSIONS);

const selectAll = () => emit("update:modelValue", [...allCodes]);
const deselectAll = () => emit("update:modelValue", []);
</script>

<style scoped lang="scss">
.permission-matrix {
  &__toolbar {
    margin-bottom: 12px;
  }

  &__table {
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--el-border-color-lighter);

      th, td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid var(--el-border-color-lighter);
        font-size: 13px;
      }

      th {
        background: var(--el-fill-color-light);
        font-weight: 600;
        color: var(--el-text-color-regular);
      }

      td {
        color: var(--el-text-color-regular);
      }
    }
  }

  &__module-col {
    width: 100px;
  }

  &__perm-col {
    width: auto;
  }

  &__check-col {
    width: 60px;
    text-align: center !important;
  }

  &__module-cell {
    font-weight: 600;
    vertical-align: middle;
    background: var(--el-fill-color-lighter);
  }

  &__perm-cell {
    code {
      font-size: 12px;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      padding: 1px 6px;
      border-radius: 3px;
      margin-right: 8px;
    }
  }

  &__perm-label {
    color: var(--el-text-color-secondary);
  }

  &__check-cell {
    text-align: center;
  }

  &__row--first td {
    border-top: 2px solid var(--el-border-color);
  }
}
</style>