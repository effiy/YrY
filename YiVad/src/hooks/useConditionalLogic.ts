import { ref, watch, type Ref } from "vue";

export interface Condition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "between" | "is_empty" | "is_not_empty" | "starts_with" | "ends_with";
  value: any;
}

export interface ConditionGroup {
  operator: "AND" | "OR";
  conditions: Condition[];
  groups?: ConditionGroup[];
}

export interface RuleAction {
  target: string;
  action: "show" | "hide" | "enable" | "disable" | "require" | "optional" | "set_value";
  value?: any;
}

export interface ConditionalRule {
  id: string;
  name: string;
  priority: number;
  conditions: ConditionGroup;
  actions: RuleAction[];
}

interface UseConditionalLogicOptions {
  formData: Ref<Record<string, any>>;
  rules: ConditionalRule[];
}

export const useConditionalLogic = (options: UseConditionalLogicOptions) => {
  const { formData, rules } = options;

  /** Field states computed by rule engine */
  const fieldStates = ref<Record<string, { visible: boolean; disabled: boolean; required: boolean; value?: any }>>({});

  function evaluateCondition(condition: Condition): boolean {
    const value = formData.value[condition.field];

    switch (condition.operator) {
      case "is_empty":
        return value === null || value === undefined || value === "";
      case "is_not_empty":
        return value !== null && value !== undefined && value !== "";
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "contains":
        return typeof value === "string" && value.includes(condition.value);
      case "not_contains":
        return typeof value === "string" && !value.includes(condition.value);
      case "greater_than":
        return Number(value) > Number(condition.value);
      case "less_than":
        return Number(value) < Number(condition.value);
      case "between": {
        const [min, max] = condition.value;
        const n = Number(value);
        return n >= min && n <= max;
      }
      case "starts_with":
        return typeof value === "string" && value.startsWith(condition.value);
      case "ends_with":
        return typeof value === "string" && value.endsWith(condition.value);
      default:
        return false;
    }
  }

  function evaluateGroup(group: ConditionGroup): boolean {
    const results = group.conditions.map(evaluateCondition);
    if (group.groups) {
      results.push(...group.groups.map(evaluateGroup));
    }
    return group.operator === "AND" ? results.every(Boolean) : results.some(Boolean);
  }

  function applyActions(actions: RuleAction[], states: Record<string, { visible: boolean; disabled: boolean; required: boolean; value?: any }>) {
    for (const action of actions) {
      if (!states[action.target]) {
        states[action.target] = { visible: true, disabled: false, required: false };
      }
      const target = states[action.target];

      switch (action.action) {
        case "show":
          target.visible = true;
          break;
        case "hide":
          target.visible = false;
          break;
        case "enable":
          target.disabled = false;
          break;
        case "disable":
          target.disabled = true;
          break;
        case "require":
          target.required = true;
          break;
        case "optional":
          target.required = false;
          break;
        case "set_value":
          target.value = action.value;
          formData.value[action.target] = action.value;
          break;
      }
    }
  }

  function runRules() {
    const states: Record<string, { visible: boolean; disabled: boolean; required: boolean; value?: any }> = {};

    // Sort by priority descending
    const sorted = [...rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sorted) {
      const conditionMet = evaluateGroup(rule.conditions);
      if (conditionMet) {
        applyActions(rule.actions, states);
      }
    }

    fieldStates.value = states;
  }

  // Re-run rules when form data changes
  watch(
    () => formData.value,
    () => runRules(),
    { deep: true, immediate: true }
  );

  /** Test rules with hypothetical values */
  function testRules(testData: Record<string, any>): Record<string, any> {
    const saved = { ...formData.value };
    Object.assign(formData.value, testData);
    runRules();
    const result = { ...fieldStates.value };
    Object.assign(formData.value, saved);
    runRules();
    return result;
  }

  /** Export rules to JSON */
  function exportRules(): string {
    return JSON.stringify(rules, null, 2);
  }

  /** Import rules from JSON */
  function importRules(json: string): ConditionalRule[] {
    return JSON.parse(json);
  }

  return {
    fieldStates,
    runRules,
    testRules,
    exportRules,
    importRules,
  };
};