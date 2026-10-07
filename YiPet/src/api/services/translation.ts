/**
 * Translation API service — wraps YiAi translation RPC via YiPet API client.
 *
 * Enables quick translation of selected text on any page, translation history
 * queries, and translation memory search.
 */

import type { ApiClient } from '../client';

const MODULE = 'services.translation';

export interface TranslateResult {
  provider: string;
  text: string;
  from_lang?: string;
  to_lang?: string;
  cached?: boolean;
  error?: string;
}

export interface TranslateParams {
  text: string;
  from_lang?: string;
  to_lang?: string;
  providers?: string[];
  provider_config?: Record<string, Record<string, unknown>>;
  use_memory?: boolean;
}

export interface TranslationRecord {
  _id: string;
  source: string;
  from_lang: string;
  to_lang: string;
  results: string[];
  source_length: number;
  created_at: string;
}

export function createTranslationService(client: ApiClient) {
  return {
    /** Quick translate text using YiAi (defaults to first available LLM provider). */
    async translate(params: TranslateParams): Promise<TranslateResult[]> {
      const res = await client.rpc<TranslateResult[]>(
        `${MODULE}.translate_service`,
        'translate',
        {
          text: params.text,
          from_lang: params.from_lang || 'auto',
          to_lang: params.to_lang || 'zh',
          providers: params.providers || null,
          provider_config: params.provider_config || null,
          use_memory: params.use_memory !== false,
        },
      );
      if (!res.ok) throw new Error(res.error || 'Translation failed');
      return res.data;
    },

    /** Query translation history records. */
    async queryHistory(params: { filter?: Record<string, unknown>; pageNum?: number; pageSize?: number }) {
      const res = await client.rpc<{ list: TranslationRecord[]; total: number }>(
        'services.database.data_service',
        'query_documents',
        {
          cname: 'translation_records',
          filter: params.filter || {},
          pageNum: params.pageNum || 1,
          pageSize: params.pageSize || 20,
          orderBy: 'created_at',
          orderType: 'desc',
        },
      );
      if (!res.ok) throw new Error(res.error || 'Query failed');
      return res.data;
    },

    /** Submit translation quality feedback. */
    async feedback(params: { source: string; target: string; rating: 'good' | 'bad'; provider?: string; from_lang?: string; to_lang?: string }) {
      const res = await client.rpc<{ success: boolean }>(
        `${MODULE}.translate_service`,
        'translation_feedback',
        {
          source: params.source,
          target: params.target,
          rating: params.rating,
          provider: params.provider || '',
          from_lang: params.from_lang || '',
          to_lang: params.to_lang || '',
        },
      );
      if (!res.ok) throw new Error(res.error || 'Feedback failed');
      return res.data;
    },

    /** Get recommended providers for a language pair based on real-time health.
     *  Used for smart engine selection — best provider is ranked first. */
    async getProviderRecommend(fromLang?: string, toLang?: string) {
      const res = await client.rpc<{
        recommended: string | null;
        providers: Array<{ name: string; success_rate: number; status: string; total: number }>;
        healthy_count: number;
        degraded_count: number;
        down_count: number;
      }>(
        `${MODULE}.translate_service`,
        'provider_recommend',
        { from_lang: fromLang || 'auto', to_lang: toLang || 'zh' },
      );
      if (!res.ok) throw new Error(res.error || 'Recommendation failed');
      return res.data;
    },

    /** ── Translation Analytics (cross-project consistency with YiVad) ── */

    /** Get translation usage analytics for the past N days. */
    async getAnalytics(days?: number) {
      const res = await client.rpc<{
        total_translations: number;
        period_days: number;
        by_target_language: Array<{ language: string; count: number; total_chars: number }>;
      }>(`${MODULE}.translate_service`, 'translation_analytics', { days: days ?? 30 });
      if (!res.ok) throw new Error(res.error || 'Analytics failed');
      return res.data;
    },

    /** Get provider health status for the past N hours. */
    async getProviderHealth(hours?: number) {
      const res = await client.rpc<{
        period_hours: number;
        providers: Record<string, { total: number; success: number; failed: number; success_rate: number; status: string; total_chars: number }>;
        memory_entries: number;
        feedback: { good: number; bad: number };
      }>(`${MODULE}.translate_service`, 'provider_health', { hours: hours ?? 24 });
      if (!res.ok) throw new Error(res.error || 'Health check failed');
      return res.data;
    },

    /** Get hourly translation volume trend for the past N days. */
    async getHourlyTrend(days?: number) {
      const res = await client.rpc<Array<{ hour: string; count: number; chars: number }>>(
        `${MODULE}.translate_service`, 'hourly_trend', { days: days ?? 7 },
      );
      if (!res.ok) throw new Error(res.error || 'Trend fetch failed');
      return res.data;
    },

    /** Get per-provider usage breakdown for the past N days. */
    async getProviderBreakdown(days?: number) {
      const res = await client.rpc<Array<{ provider: string; count: number; success: number }>>(
        `${MODULE}.translate_service`, 'provider_breakdown', { days: days ?? 30 },
      );
      if (!res.ok) throw new Error(res.error || 'Breakdown fetch failed');
      return res.data;
    },

    /** Get translation memory cache statistics. */
    async getMemoryStats() {
      const res = await client.rpc<{
        total: number;
        languages: Array<{ _id: string; to_languages: string[] }>;
        providers: Record<string, number>;
      }>(`${MODULE}.translate_service`, 'translation_memory_stats', {});
      if (!res.ok) throw new Error(res.error || 'Memory stats failed');
      return res.data;
    },

    /** SSE streaming translation — yields text chunks in real time. */
    async *translateStream(params: {
      text: string; from_lang?: string; to_lang?: string;
      provider?: string; signal?: AbortSignal;
    }): AsyncGenerator<{ chunk?: string; done: boolean; error?: string }> {
      const body = {
        module_name: `${MODULE}.translate_service`,
        method_name: 'translate_stream',
        parameters: {
          text: params.text,
          from_lang: params.from_lang ?? 'auto',
          to_lang: params.to_lang ?? 'zh',
          provider: params.provider ?? 'openai',
        },
      };
      for await (const event of client.stream('/', body, params.signal)) {
        if (event.done) { yield { done: true }; return; }
        if (event.error) { yield { done: true, error: event.error }; return; }
        const data = event.data as any;
        const message = data?.data?.message ?? data?.message ?? data;
        if (typeof message === 'string') yield { chunk: message, done: false };
      }
      yield { done: true };
    },
  };
}

export type TranslationService = ReturnType<typeof createTranslationService>;