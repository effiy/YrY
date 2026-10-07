/**
 * KnowledgeService — YiKnowledge markdown tree access.
 *
 * Knowledge endpoints are direct REST (not RPC envelope).
 * client.post<T>() already unwraps YiAi's {code, message, data} envelope.
 */
import type { ApiClient, ApiResponse } from '../client';
import { KNOWLEDGE } from '../endpoints';
import type { KnowledgeScanResponse, KnowledgeReadResponse, KnowledgeWriteResponse } from '../types';

export class KnowledgeService {
  constructor(private client: ApiClient) {}

  /** Scan the YiKnowledge directory tree. Optionally filter by top-level category. */
  async scan(category?: string): Promise<ApiResponse<KnowledgeScanResponse>> {
    return this.client.post<KnowledgeScanResponse>(
      KNOWLEDGE.SCAN,
      category ? { category } : {},
    );
  }

  /** Read a single markdown file (path + parsed frontmatter + body). */
  async read(targetFile: string): Promise<ApiResponse<KnowledgeReadResponse>> {
    return this.client.post<KnowledgeReadResponse>(
      KNOWLEDGE.READ,
      { target_file: targetFile },
    );
  }

  /** Write/update a markdown file to the YiKnowledge directory. */
  async write(
    targetFile: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<ApiResponse<KnowledgeWriteResponse>> {
    return this.client.post<KnowledgeWriteResponse>(
      KNOWLEDGE.WRITE,
      { target_file: targetFile, content, metadata },
    );
  }

  /** Search content within knowledge base markdown files (60s TTL cache). */
  async search(query: string, category?: string): Promise<ApiResponse<{ results: Array<{ path: string; title: string; snippet: string }> }>> {
    return this.client.post<{ results: Array<{ path: string; title: string; snippet: string }> }>(
      KNOWLEDGE.SEARCH, { query, category },
    );
  }
}