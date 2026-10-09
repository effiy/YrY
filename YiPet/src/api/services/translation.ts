/**
 * Translation API service — wraps YiAi translation RPC via YiPet API client.
 *
 * Enables quick translation of selected text on any page, translation history
 * queries, and translation memory search.
 *
 * Style: Class (consistent with other services) with a `createTranslationService`
 * factory alias preserved for backwards compatibility with existing call sites.
 *
 * Error handling uses the shared `unwrapOrThrow` helper (avoids ~8 copies of
 * the identical `if (!res.ok) throw new Error(res.error || ...)` block).
 */

import type { ApiClient } from '../client';
import { unwrapOrThrow } from '../client';

const MODULE = 'services.translation';
const TRANSLATE_SUBMODULE = `${MODULE}.translate_service`;

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

/* ═══════════════════════════════════════════════════════════════════════
   Service Class
   ═══════════════════════════════════════════════════════════════════════ */

export class TranslationService {
  constructor(private client: ApiClient) {}

  /** Quick translate text using YiAi (defaults to first available LLM provider). */
  async translate(params: TranslateParams): Promise<TranslateResult[]> {
    return unwrapOrThrow(
      await this.client.rpc<TranslateResult[]>(TRANSLATE_SUBMODULE, 'translate', {
        text: params.text,
        from_lang: params.from_lang || 'auto',
        to_lang: params.to_lang || 'zh',
        providers: params.providers || null,
        provider_config: params.provider_config || null,
        use_memory: params.use_memory !== false,
      }),
      'Translation',
    );
  }

  /** Query translation history records. */
  async queryHistory(params: {
    filter?: Record<string, unknown>;
    pageNum?: number;
    pageSize?: number;
  }): Promise<{ list: TranslationRecord[]; total: number }> {
    return unwrapOrThrow(
      await this.client.rpc<{ list: TranslationRecord[]; total: number }>(
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
      ),
      'Translation history query',
    );
  }

  /** Submit translation quality feedback. */
  async feedback(params: {
    source: string;
    target: string;
    rating: 'good' | 'bad';
    provider?: string;
    from_lang?: string;
    to_lang?: string;
  }): Promise<{ success: boolean }> {
    return unwrapOrThrow(
      await this.client.rpc<{ success: boolean }>(TRANSLATE_SUBMODULE, 'translation_feedback', {
        source: params.source,
        target: params.target,
        rating: params.rating,
        provider: params.provider || '',
        from_lang: params.from_lang || '',
        to_lang: params.to_lang || '',
      }),
      'Translation feedback',
    );
  }

  /** Get recommended providers for a language pair based on real-time health. */
  async getProviderRecommend(fromLang?: string, toLang?: string) {
    return unwrapOrThrow(
      await this.client.rpc<{
        recommended: string | null;
        providers: Array<{ name: string; success_rate: number; status: string; total: number }>;
        healthy_count: number;
        degraded_count: number;
        down_count: number;
      }>(TRANSLATE_SUBMODULE, 'provider_recommend', {
        from_lang: fromLang || 'auto',
        to_lang: toLang || 'zh',
      }),
      'Provider recommendation',
    );
  }

  /* ── Translation Analytics ───────────────────────────────────────────── */

  /** Get translation usage analytics for the past N days. */
  async getAnalytics(days?: number) {
    return unwrapOrThrow(
      await this.client.rpc<{
        total_translations: number;
        period_days: number;
        by_target_language: Array<{ language: string; count: number; total_chars: number }>;
      }>(TRANSLATE_SUBMODULE, 'translation_analytics', { days: days ?? 30 }),
      'Translation analytics',
    );
  }

  /** Get provider health status for the past N hours. */
  async getProviderHealth(hours?: number) {
    return unwrapOrThrow(
      await this.client.rpc<{
        period_hours: number;
        providers: Record<string, {
          total: number; success: number; failed: number; success_rate: number; status: string; total_chars: number;
        }>;
        memory_entries: number;
        feedback: { good: number; bad: number };
      }>(TRANSLATE_SUBMODULE, 'provider_health', { hours: hours ?? 24 }),
      'Provider health',
    );
  }

  /** Get hourly translation volume trend for the past N days. */
  async getHourlyTrend(days?: number) {
    return unwrapOrThrow(
      await this.client.rpc<Array<{ hour: string; count: number; chars: number }>>(
        TRANSLATE_SUBMODULE, 'hourly_trend', { days: days ?? 7 },
      ),
      'Hourly trend',
    );
  }

  /** Get per-provider usage breakdown for the past N days. */
  async getProviderBreakdown(days?: number) {
    return unwrapOrThrow(
      await this.client.rpc<Array<{ provider: string; count: number; success: number }>>(
        TRANSLATE_SUBMODULE, 'provider_breakdown', { days: days ?? 30 },
      ),
      'Provider breakdown',
    );
  }

  /** Get translation memory cache statistics. */
  async getMemoryStats() {
    return unwrapOrThrow(
      await this.client.rpc<{
        total: number;
        languages: Array<{ _id: string; to_languages: string[] }>;
        providers: Record<string, number>;
      }>(TRANSLATE_SUBMODULE, 'translation_memory_stats', {}),
      'Translation memory stats',
    );
  }

  /** SSE streaming translation — yields text chunks in real time. */
  async *translateStream(params: {
    text: string;
    from_lang?: string;
    to_lang?: string;
    provider?: string;
    signal?: AbortSignal;
  }): AsyncGenerator<{ chunk?: string; done: boolean; error?: string }> {
    const body = {
      module_name: TRANSLATE_SUBMODULE,
      method_name: 'translate_stream',
      parameters: {
        text: params.text,
        from_lang: params.from_lang ?? 'auto',
        to_lang: params.to_lang ?? 'zh',
        provider: params.provider ?? 'openai',
      },
    };
    for await (const event of this.client.stream('/', body, params.signal)) {
      if (event.done) { yield { done: true }; return; }
      if (event.error) { yield { done: true, error: event.error }; return; }
      const data = event.data as any;
      const message = data?.data?.message ?? data?.message ?? data;
      if (typeof message === 'string') yield { chunk: message, done: false };
    }
    yield { done: true };
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   Backwards-compat factory alias
   ═══════════════════════════════════════════════════════════════════════ */

export function createTranslationService(client: ApiClient): TranslationService {
  return new TranslationService(client);
}