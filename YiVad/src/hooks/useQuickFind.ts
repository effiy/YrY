import { ref, computed } from "vue";

export interface FindMatch {
  rowIndex: number;
  columnKey: string;
  start: number;
  end: number;
}

export function useQuickFind() {
  const visible = ref(false);
  const keyword = ref("");
  const matchCase = ref(false);
  const useRegex = ref(false);
  const currentMatch = ref(-1);
  const matches = ref<FindMatch[]>([]);
  const scopeColumn = ref<string | null>(null);

  const totalMatches = computed(() => matches.value.length);
  const hasResults = computed(() => matches.value.length > 0);
  const statusText = computed(() => {
    if (!keyword.value) return "";
    if (totalMatches.value === 0) return "No matches";
    return `${currentMatch.value + 1} / ${totalMatches.value}`;
  });

  const search = (data: Record<string, any>[], columns: string[]) => {
    matches.value = [];
    currentMatch.value = -1;
    if (!keyword.value) return;

    const targetCols = scopeColumn.value ? [scopeColumn.value] : columns;
    let pattern: RegExp;

    try {
      const flags = matchCase.value ? "g" : "gi";
      const source = useRegex.value ? keyword.value : keyword.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      pattern = new RegExp(source, flags);
    } catch {
      return;
    }

    const result: FindMatch[] = [];
    data.forEach((row, rowIndex) => {
      targetCols.forEach((col) => {
        const text = String(row[col] ?? "");
        let m: RegExpExecArray | null;
        pattern.lastIndex = 0;
        while ((m = pattern.exec(text)) !== null) {
          result.push({ rowIndex, columnKey: col, start: m.index, end: m.index + m[0].length });
          if (!pattern.global) break;
        }
      });
    });

    matches.value = result;
    if (result.length > 0) currentMatch.value = 0;
  };

  const nextMatch = () => {
    if (totalMatches.value === 0) return;
    currentMatch.value = (currentMatch.value + 1) % totalMatches.value;
  };

  const prevMatch = () => {
    if (totalMatches.value === 0) return;
    currentMatch.value = (currentMatch.value - 1 + totalMatches.value) % totalMatches.value;
  };

  const toggle = () => {
    visible.value = !visible.value;
    if (!visible.value) { keyword.value = ""; matches.value = []; }
  };

  const highlight = (rowIndex: number, colKey: string, text: string): string => {
    if (!keyword.value || !visible.value) return text;
    const matched = matches.value.filter((m) => m.rowIndex === rowIndex && m.columnKey === colKey);
    if (matched.length === 0) return text;

    let result = "";
    let lastEnd = 0;
    for (const m of matched) {
      result += text.slice(lastEnd, m.start).replace(/</g, "&lt;").replace(/>/g, "&gt;");
      result += `<mark class="find-highlight">${text.slice(m.start, m.end)}</mark>`;
      lastEnd = m.end;
    }
    result += text.slice(lastEnd).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return result;
  };

  return { visible, keyword, matchCase, useRegex, currentMatch, matches, totalMatches, hasResults, statusText, scopeColumn, search, nextMatch, prevMatch, toggle, highlight };
}