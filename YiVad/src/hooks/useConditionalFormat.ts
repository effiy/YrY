import { ref, computed } from "vue";

export interface ConditionalFormatRule {
  id: string;
  column: string;
  type: "colorScale" | "dataBar" | "iconSet" | "highlight";
  config: Record<string, any>;
  priority: number;
}

export function useConditionalFormat() {
  const rules = ref<ConditionalFormatRule[]>([]);

  const sortedRules = computed(() => [...rules.value].sort((a, b) => a.priority - b.priority));

  const addRule = (rule: ConditionalFormatRule) => { rules.value.push(rule); };
  const removeRule = (id: string) => { rules.value = rules.value.filter((r) => r.id !== id); };
  const updateRule = (id: string, patch: Partial<ConditionalFormatRule>) => {
    const idx = rules.value.findIndex((r) => r.id === id);
    if (idx !== -1) Object.assign(rules.value[idx], patch);
  };
  const clearRules = () => { rules.value = []; };

  const getCellStyle = (column: string, value: any): Record<string, any> => {
    for (const rule of sortedRules.value) {
      if (rule.column !== column) continue;
      if (rule.type === "highlight") {
        const { operator, target, bgColor, textColor } = rule.config;
        if (operator === "eq" && value === target) return { backgroundColor: bgColor, color: textColor };
        if (operator === "gt" && Number(value) > Number(target)) return { backgroundColor: bgColor, color: textColor };
        if (operator === "lt" && Number(value) < Number(target)) return { backgroundColor: bgColor, color: textColor };
      }
    }
    return {};
  };

  return { rules, sortedRules, addRule, removeRule, updateRule, clearRules, getCellStyle };
}