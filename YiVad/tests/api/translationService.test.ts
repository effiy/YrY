import { describe, it, expect } from "vitest";
import {
  getTranslationAnalytics,
  getTranslationMemoryStats,
  getProviderHealth,
  getHourlyTrend,
  getProviderBreakdown,
  type TranslationAnalytics,
  type ProviderHealth,
  type HourlyTrendItem,
  type ProviderBreakdownItem,
} from "@/api/modules/translationService";

describe("translationService API module", () => {
  describe("type exports", () => {
    it("TranslationAnalytics has expected shape", () => {
      const sample: TranslationAnalytics = {
        total_translations: 100,
        period_days: 30,
        by_target_language: [{ language: "zh", count: 50, total_chars: 5000 }],
      };
      expect(sample.total_translations).toBe(100);
      expect(sample.by_target_language[0].language).toBe("zh");
    });

    it("ProviderHealth has expected shape", () => {
      const sample: ProviderHealth = {
        period_hours: 24,
        providers: {
          openai: { total: 100, success: 98, failed: 2, success_rate: 0.98, status: "healthy", total_chars: 5000 },
        },
        memory_entries: 500,
        feedback: { good: 10, bad: 1 },
      };
      expect(sample.providers.openai.status).toBe("healthy");
    });

    it("HourlyTrendItem has expected shape", () => {
      const sample: HourlyTrendItem = { hour: "2026-09-23T14", count: 42, chars: 840 };
      expect(sample.hour).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}$/);
      expect(sample.count).toBeGreaterThan(0);
    });

    it("ProviderBreakdownItem has expected shape", () => {
      const sample: ProviderBreakdownItem = { provider: "openai", count: 1200, success: 1180 };
      expect(sample.success).toBeLessThanOrEqual(sample.count);
    });
  });

  describe("function exports", () => {
    it("getTranslationAnalytics is a function", () => {
      expect(typeof getTranslationAnalytics).toBe("function");
    });

    it("getTranslationMemoryStats is a function", () => {
      expect(typeof getTranslationMemoryStats).toBe("function");
    });

    it("getProviderHealth is a function", () => {
      expect(typeof getProviderHealth).toBe("function");
    });

    it("getHourlyTrend is a function", () => {
      expect(typeof getHourlyTrend).toBe("function");
    });

    it("getProviderBreakdown is a function", () => {
      expect(typeof getProviderBreakdown).toBe("function");
    });
  });
});