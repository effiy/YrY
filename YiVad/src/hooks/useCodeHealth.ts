import { ref, type Ref } from "vue";
import { analyzeCodeHealth } from "@/api/modules/codeHealthService";
import type { CodeHealthReport } from "@/api/interface/codeHealth";

export type HealthLevel = "good" | "warn" | "danger";

export function useCodeHealth(projectKey: Ref<string>) {
  const report = ref<CodeHealthReport | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function analyze(): Promise<void> {
    const key = projectKey.value;
    if (!key) return;

    loading.value = true;
    error.value = null;

    try {
      const res = await analyzeCodeHealth({ project_key: key });
      if (res.code === 0 && res.data) {
        if ("error" in res.data) {
          error.value = (res.data as unknown as { error: string }).error || "分析失败";
        } else {
          report.value = res.data as CodeHealthReport;
        }
      } else {
        error.value = res.message || "分析失败";
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "分析失败";
    } finally {
      loading.value = false;
    }
  }

  /**
   * Determine health level for a value against thresholds.
   * When `inverted` is true, higher values are better (e.g., comment rate, reuse rate).
   */
  function getLevel(value: number, thresholds: [number, number], inverted = false): HealthLevel {
    const [warn, danger] = thresholds;
    if (inverted) {
      if (value >= warn) return "good";
      if (value >= danger) return "warn";
      return "danger";
    }
    if (value <= warn) return "good";
    if (value <= danger) return "warn";
    return "danger";
  }

  function fmtPct(rate: number): string {
    return `${(rate * 100).toFixed(1)}%`;
  }

  return { report, loading, error, analyze, getLevel, fmtPct };
}