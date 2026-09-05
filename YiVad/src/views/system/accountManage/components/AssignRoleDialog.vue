<template>
  <el-dialog
    v-model="visible"
    title="分配角色"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="assign-role">
      <div class="assign-role__info">
        <span class="assign-role__label">用户</span>
        <span class="assign-role__value">{{ username }}</span>
      </div>
      <el-divider />
      <div class="assign-role__roles">
        <span class="assign-role__label">角色</span>
        <el-checkbox-group v-model="selectedRoles" class="assign-role__checkbox-group">
          <el-checkbox v-for="role in allRoles" :key="role.code" :label="role.code" :value="role.code">
            <span>{{ role.name }}</span>
            <span class="assign-role__role-code">{{ role.code }}</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <el-empty v-if="!allRoles.length" description="暂无可分配的角色" :image-size="80" />
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AssignRoleDialog">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { getAllRoles, type RoleDocument } from "@/api/modules/roleService";

const props = defineProps<{
  modelValue: boolean;
  username: string;
  userKey: string;
  currentRoles: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "submit": [roles: string[]];
}>();

const visible = ref(props.modelValue);
const submitting = ref(false);
const allRoles = ref<RoleDocument[]>([]);
const selectedRoles = ref<string[]>([...props.currentRoles]);

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val) {
    selectedRoles.value = [...props.currentRoles];
    loadRoles();
  }
});

watch(visible, (val) => emit("update:modelValue", val));

const loadRoles = async () => {
  try {
    const { data } = await getAllRoles();
    allRoles.value = data as unknown as RoleDocument[];
  } catch {
    allRoles.value = [];
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    emit("submit", selectedRoles.value);
    ElMessage.success("角色分配成功");
    visible.value = false;
  } catch {
    ElMessage.error("角色分配失败");
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  selectedRoles.value = [...props.currentRoles];
};
</script>

<style scoped lang="scss">
.assign-role {
  &__info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-weight: 600;
    color: var(--el-text-color-regular);
    min-width: 40px;
  }

  &__value {
    color: var(--el-text-color-primary);
  }

  &__roles {
    display: flex;
    gap: 12px;
  }

  &__checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__role-code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-left: 6px;
  }
}
</style>