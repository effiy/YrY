/**
 * Search service — wraps YiAi's /web-search and /web-fetch endpoints.
 */

import type { ApiClient, ApiResponse } from '../client';
import { SEARCH } from '../endpoints';
import type { WebFetchResponse, WebSearchResponse } from '../types';

export class SearchService {
  constructor(private client: ApiClient) {}

  webSearch(
    params: { query: string; max_results?: number },
    signal?: AbortSignal,
  ): Promise<ApiResponse<WebSearchResponse>> {
    return this.client.post<WebSearchResponse>(SEARCH.WEB, params, signal);
  }

  webFetch(
    params: { url: string },
    signal?: AbortSignal,
  ): Promise<ApiResponse<WebFetchResponse>> {
    return this.client.post<WebFetchResponse>(SEARCH.FETCH, params, signal);
  }
}
