import { computed, type Ref } from "vue";

export type AggregateFunction = "sum" | "avg" | "count" | "max" | "min";

export interface ColumnCalc {
  column: string;
  func: AggregateFunction;
  label: string;
}

export function useColumnCalculation(data: Ref<Record<string, any>[]>, calcs: Ref<ColumnCalc[]>) {
  const footerData = computed(() => {
    const row: Record<string, any> = {};
    for (const calc of calcs.value) {
      const values = data.value.map((r) => {
        const v = Number(r[calc.column]);
        return isNaN(v) ? null : v;
      }).filter((v) => v !== null) as number[];

      if (values.length === 0) { row[`__calc_${calc.column}_${calc.func}`] = ""; continue; }

      switch (calc.func) {
        case "sum": row[`__calc_${calc.column}_${calc.func}`] = values.reduce((a, b) => a + b, 0); break;
        case "avg": row[`__calc_${calc.column}_${calc.func}`] = values.reduce((a, b) => a + b, 0) / values.length; break;
        case "count": row[`__calc_${calc.column}_${calc.func}`] = values.length; break;
        case "max": row[`__calc_${calc.column}_${calc.func}`] = Math.max(...values); break;
        case "min": row[`__calc_${calc.column}_${calc.func}`] = Math.min(...values); break;
      }
    }
    return row;
  });

  return { footerData };
}