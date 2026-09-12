<template>
  <div class="cfe">
    <div class="cfe__header">
      <span class="cfe__title">自定义字段</span>
      <el-button size="small" type="primary" @click="addField">添加字段</el-button>
    </div>

    <div class="cfe__list">
      <div
        v-for="(field, idx) in fields"
        :key="field.key || idx"
        class="cfe__item"
      >
        <div class="cfe__item-head">
          <span class="cfe__item-name">{{ field.label || field.name }}</span>
          <el-tag size="small">{{ FIELD_TYPE_LABELS[field.field_type] }}</el-tag>
          <div class="cfe__item-actions">
            <el-button link size="small" @click="editField(idx)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button link size="small" type="danger" @click="removeField(idx)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="!fields.length" description="暂无自定义字段" />
    </div>

    <el-dialog v-model="dialogVisible" :title="editIdx >= 0 ? '编辑字段' : '添加字段'" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="字段名" required>
          <el-input v-model="editForm.name" placeholder="英文字段名" />
        </el-form-item>
        <el-form-item label="显示标签" required>
          <el-input v-model="editForm.label" placeholder="中文显示名称" />
        </el-form-item>
        <el-form-item label="字段类型">
          <el-select v-model="editForm.field_type" style="width:100%">
            <el-option
              v-for="(label, type) in FIELD_TYPE_LABELS"
              :key="type"
              :label="label"
              :value="type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="必填">
          <el-switch v-model="editForm.required" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveField">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="CustomFieldEditor">
import { ref, reactive } from "vue";
import { Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { FIELD_TYPE_LABELS, type CustomFieldDef, type FieldType } from "@/types/customField";
import { createFieldDef, updateFieldDef, deleteFieldDef } from "@/api/modules/customFieldService";

const props = defineProps<{
  fields: CustomFieldDef[];
  entityType: string;
}>();

const emit = defineEmits<{ changed: [] }>();

const dialogVisible = ref(false);
const editIdx = ref(-1);

const defaultForm = () => ({
  name: "",
  label: "",
  field_type: "text" as FieldType,
  required: false,
  description: "",
});

const editForm = reactive(defaultForm());

function addField() {
  editIdx.value = -1;
  Object.assign(editForm, defaultForm());
  dialogVisible.value = true;
}

function editField(idx: number) {
  editIdx.value = idx;
  const field = props.fields[idx];
  Object.assign(editForm, {
    name: field.name,
    label: field.label,
    field_type: field.field_type,
    required: field.required,
    description: field.description,
  });
  dialogVisible.value = true;
}

async function saveField() {
  if (!editForm.name.trim() || !editForm.label.trim()) {
    ElMessage.warning("请填写字段名和显示标签");
    return;
  }
  try {
    if (editIdx.value >= 0) {
      await updateFieldDef(props.fields[editIdx.value].key, { ...editForm });
    } else {
      await createFieldDef({ ...editForm, entity_type: props.entityType });
    }
    ElMessage.success("已保存");
    dialogVisible.value = false;
    emit("changed");
  } catch {
    ElMessage.error("保存失败");
  }
}

async function removeField(idx: number) {
  try {
    await deleteFieldDef(props.fields[idx].key);
    ElMessage.success("已删除");
    emit("changed");
  } catch {
    ElMessage.error("删除失败");
  }
}
</script>

<style scoped lang="scss">
.cfe { margin-top: 8px; }
.cfe__header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}
.cfe__title { font-weight: 500; }
.cfe__list { min-height: 60px; }
.cfe__item {
  padding: 10px 12px; border: 1px solid var(--el-border-color-lighter); border-radius: 6px; margin-bottom: 8px;
}
.cfe__item-head {
  display: flex; align-items: center; gap: 8px;
}
.cfe__item-name { flex: 1; font-size: 14px; }
.cfe__item-actions { display: flex; gap: 2px; }
</style>