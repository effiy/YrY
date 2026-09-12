<script setup lang="ts">
import { ref, computed } from "vue";
import type { ConditionalRule, Condition, ConditionGroup, RuleAction } from "@/hooks/useConditionalLogic";

const props = defineProps<{
  modelValue: ConditionalRule[];
  availableFields: { name: string; label: string }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: ConditionalRule[]): void;
}>();

const rules = ref<ConditionalRule[]>([...props.modelValue]);
const editingRule = ref<ConditionalRule | null>(null);
const showEditor = ref(false);

const operators = [
  { value: "equals", label: "等于" },
  { value: "not_equals", label: "不等于" },
  { value: "contains", label: "包含" },
  { value: "not_contains", label: "不包含" },
  { value: "greater_than", label: "大于" },
  { value: "less_than", label: "小于" },
  { value: "is_empty", label: "为空" },
  { value: "is_not_empty", label: "不为空" },
  { value: "starts_with", label: "以...开头" },
  { value: "ends_with", label: "以...结尾" },
] as const;

const actions = [
  { value: "show", label: "显示" },
  { value: "hide", label: "隐藏" },
  { value: "enable", label: "启用" },
  { value: "disable", label: "禁用" },
  { value: "require", label: "设为必填" },
  { value: "optional", label: "设为可选" },
  { value: "set_value", label: "设置值" },
] as const;

function addRule() {
  editingRule.value = {
    id: `rule-${Date.now()}`,
    name: "新规则",
    priority: rules.value.length + 1,
    conditions: { operator: "AND", conditions: [{ field: "", operator: "equals", value: "" }] },
    actions: [{ target: "", action: "show" }],
  };
  showEditor.value = true;
}

function editRule(rule: ConditionalRule) {
  editingRule.value = { ...rule, conditions: JSON.parse(JSON.stringify(rule.conditions)), actions: [...rule.actions] };
  showEditor.value = true;
}

function saveRule() {
  if (!editingRule.value) return;
  const idx = rules.value.findIndex((r) => r.id === editingRule.value!.id);
  if (idx >= 0) {
    rules.value[idx] = editingRule.value;
  } else {
    rules.value.push(editingRule.value);
  }
  emit("update:modelValue", [...rules.value]);
  showEditor.value = false;
  editingRule.value = null;
}

function deleteRule(id: string) {
  rules.value = rules.value.filter((r) => r.id !== id);
  emit("update:modelValue", [...rules.value]);
}

function addCondition(group: ConditionGroup) {
  group.conditions.push({ field: "", operator: "equals", value: "" });
}

function addAction() {
  if (!editingRule.value) return;
  editingRule.value.actions.push({ target: "", action: "show" });
}
</script>

<template>
  <div class="form-conditional-logic">
    <div class="form-conditional-logic__header">
      <h4>条件逻辑规则</h4>
      <el-button size="small" type="primary" @click="addRule">添加规则</el-button>
    </div>

    <el-empty v-if="rules.length === 0" description="暂无规则" :image-size="60" />

    <div v-for="rule in rules" :key="rule.id" class="form-conditional-logic__rule">
      <div class="form-conditional-logic__rule-header">
        <span class="form-conditional-logic__rule-name">{{ rule.name }}</span>
        <span class="form-conditional-logic__rule-priority">优先级: {{ rule.priority }}</span>
        <el-button text size="small" @click="editRule(rule)">编辑</el-button>
        <el-button text size="small" type="danger" @click="deleteRule(rule.id)">删除</el-button>
      </div>
      <div class="form-conditional-logic__rule-summary">
        IF {{ rule.conditions.conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(` ${rule.conditions.operator} `) }}
        THEN {{ rule.actions.map(a => `${a.target} → ${a.action}`).join(', ') }}
      </div>
    </div>

    <!-- Rule editor dialog -->
    <el-dialog
      v-model="showEditor"
      :title="editingRule?.name || '编辑规则'"
      width="680px"
      destroy-on-close
    >
      <template v-if="editingRule">
        <el-form label-position="top" size="small">
          <el-form-item label="规则名称">
            <el-input v-model="editingRule.name" />
          </el-form-item>
          <el-form-item label="优先级">
            <el-input-number v-model="editingRule.priority" :min="0" :max="100" />
          </el-form-item>

          <el-form-item label="条件 (IF)">
            <div class="form-conditional-logic__conditions">
              <div class="form-conditional-logic__condition-operator">
                <el-radio-group v-model="editingRule.conditions.operator">
                  <el-radio value="AND">AND (全部满足)</el-radio>
                  <el-radio value="OR">OR (任一满足)</el-radio>
                </el-radio-group>
              </div>
              <div
                v-for="(cond, ci) in editingRule.conditions.conditions"
                :key="ci"
                class="form-conditional-logic__condition-row"
              >
                <el-select v-model="cond.field" placeholder="选择字段" style="width: 140px">
                  <el-option v-for="f in availableFields" :key="f.name" :label="f.label" :value="f.name" />
                </el-select>
                <el-select v-model="cond.operator" placeholder="运算符" style="width: 120px">
                  <el-option v-for="op in operators" :key="op.value" :label="op.label" :value="op.value" />
                </el-select>
                <el-input v-if="!['is_empty', 'is_not_empty'].includes(cond.operator)" v-model="cond.value" placeholder="值" style="width: 160px" />
                <el-button text type="danger" @click="editingRule.conditions.conditions.splice(ci, 1)">×</el-button>
              </div>
              <el-button size="small" text type="primary" @click="addCondition(editingRule.conditions)">+ 添加条件</el-button>
            </div>
          </el-form-item>

          <el-form-item label="动作 (THEN)">
            <div
              v-for="(action, ai) in editingRule.actions"
              :key="ai"
              class="form-conditional-logic__action-row"
            >
              <el-select v-model="action.target" placeholder="目标字段" style="width: 140px">
                <el-option v-for="f in availableFields" :key="f.name" :label="f.label" :value="f.name" />
              </el-select>
              <el-select v-model="action.action" placeholder="动作" style="width: 120px">
                <el-option v-for="a in actions" :key="a.value" :label="a.label" :value="a.value" />
              </el-select>
              <el-input v-if="action.action === 'set_value'" v-model="action.value" placeholder="值" style="width: 160px" />
              <el-button text type="danger" @click="editingRule.actions.splice(ai, 1)">×</el-button>
            </div>
            <el-button size="small" text type="primary" @click="addAction">+ 添加动作</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <el-button @click="showEditor = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.form-conditional-logic {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h4 { margin: 0; font-size: 15px; }
  }

  &__rule {
    margin-bottom: 12px;
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
  }

  &__rule-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  &__rule-name {
    font-weight: 600;
    font-size: 14px;
  }

  &__rule-priority {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__rule-summary {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-family: monospace;
  }

  &__conditions {
    width: 100%;
    padding: 12px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  &__condition-operator {
    margin-bottom: 8px;
  }

  &__condition-row,
  &__action-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
}
</style>