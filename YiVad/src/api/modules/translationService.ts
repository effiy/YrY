/**
 * Translation analytics API module — calls YiAi translation RPC endpoints.
 *
 * Consumes the YiAi services/translation/translate_service RPC methods
 * for Dashboard analytics display (translation volume, language distribution,
 * provider health, hourly trends).
 */

import { callService } from "@/api/modules/dataService";

const TRANSLATION_SERVICE = "services.translation.translate_service";

export interface TranslationAnalytics {
  total_translations: number;
  period_days: number;
  by_target_language: Array<{
    language: string;
    count: number;
    total_chars: number;
  }>;
}

export interface TranslationMemoryStats {
  total: number;
  languages: Array<{ _id: string; to_languages: string[] }>;
  providers: Record<string, number>;
}

export interface ProviderHealth {
  period_hours: number;
  providers: Record<string, {
    total: number;
    success: number;
    failed: number;
    success_rate: number;
    status: "healthy" | "degraded" | "down";
    total_chars: number;
  }>;
  memory_entries: number;
  feedback: { good: number; bad: number };
}

export interface HourlyTrendItem {
  hour: string;
  count: number;
  chars: number;
}

export interface ProviderBreakdownItem {
  provider: string;
  count: number;
  success: number;
}

/** Get translation usage analytics for the past N days. */
export function getTranslationAnalytics(
  days?: number,
): Promise<{ code: number; message: string; data: TranslationAnalytics }> {
  return callService<TranslationAnalytics>(TRANSLATION_SERVICE, "translation_analytics", { days: days ?? 30 });
}

/** Get translation memory cache statistics. */
export function getTranslationMemoryStats(): Promise<{ code: number; message: string; data: TranslationMemoryStats }> {
  return callService<TranslationMemoryStats>(TRANSLATION_SERVICE, "translation_memory_stats", {});
}

/** Search translation memory by source text prefix. */
export function searchTranslationMemory(
  prefix: string,
  fromLang?: string,
  toLang?: string,
  limit?: number,
): Promise<{ code: number; message: string; data: Array<{ source: string; target: string; provider: string }> }> {
  return callService(TRANSLATION_SERVICE, "translation_memory_search", {
    prefix,
    from_lang: fromLang ?? "auto",
    to_lang: toLang ?? "zh",
    limit: limit ?? 10,
  });
}

/** Get provider health status for the past N hours. */
export function getProviderHealth(
  hours?: number,
): Promise<{ code: number; message: string; data: ProviderHealth }> {
  return callService<ProviderHealth>(TRANSLATION_SERVICE, "provider_health", { hours: hours ?? 24 });
}

/** Get hourly translation volume trend for the past N days. */
export function getHourlyTrend(
  days?: number,
): Promise<{ code: number; message: string; data: HourlyTrendItem[] }> {
  return callService<HourlyTrendItem[]>(TRANSLATION_SERVICE, "hourly_trend", { days: days ?? 7 });
}

/** Get per-provider usage breakdown for the past N days. */
export function getProviderBreakdown(
  days?: number,
): Promise<{ code: number; message: string; data: ProviderBreakdownItem[] }> {
  return callService<ProviderBreakdownItem[]>(TRANSLATION_SERVICE, "provider_breakdown", { days: days ?? 30 });
}

export interface ProviderRecommendation {
  from_lang: string;
  to_lang: string;
  recommended: string | null;
  providers: Array<{
    name: string;
    success_rate: number;
    status: "healthy" | "degraded" | "down";
    total: number;
    failed: number;
  }>;
  healthy_count: number;
  degraded_count: number;
  down_count: number;
}

/** Get recommended translation providers for a language pair.
 *  Used for smart engine selection and monitoring. */
export function getProviderRecommend(
  fromLang?: string,
  toLang?: string,
): Promise<{ code: number; message: string; data: ProviderRecommendation }> {
  return callService<ProviderRecommendation>(TRANSLATION_SERVICE, "provider_recommend", {
    from_lang: fromLang ?? "auto",
    to_lang: toLang ?? "zh",
  });
}