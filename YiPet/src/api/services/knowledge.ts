/**
 * Knowledge base service — wraps YiAi's /knowledge-* endpoints.
 *
 * YiAi scans ~/YiKnowledge (markdown + YAML frontmatter) and returns
 * metadata + story.md content. Direct REST (not the RPC envelope), same as
 * YiVad's knowledgeService. Uses the shared ApiClient so auth/X-Token flows
 * through the existing interceptor path.
 */
import type { ApiClient, ApiResponse } from '../client';
import { KNOWLEDGE } from '../endpoints';
import type {
  KnowledgeReadResponse,
  KnowledgeScanResponse,
  KnowledgeStoriesResponse,
  KnowledgeStory,
  KnowledgeSyncResponse,
  KnowledgeWriteResponse,
} from '../types';

export class KnowledgeService {
  constructor(private client: ApiClient) {}

  /** Scan the full knowledge tree, or one top-level category if `category` is set. */
  scan(category?: string): Promise<ApiResponse<KnowledgeScanResponse>> {
    return this.client.post<KnowledgeScanResponse>(KNOWLEDGE.SCAN, { category });
  }

  /** Read a single knowledge markdown file (path + parsed frontmatter + body). */
  read(targetFile: string): Promise<ApiResponse<KnowledgeReadResponse>> {
    return this.client.post<KnowledgeReadResponse>(KNOWLEDGE.READ, { target_file: targetFile });
  }

  /** List story.md entries under projects/{project}/ — pass project to filter. */
  listStories(project?: string): Promise<ApiResponse<KnowledgeStoriesResponse>> {
    return this.client.post<KnowledgeStoriesResponse>(KNOWLEDGE.STORIES, { project });
  }

  /** Read a specific story's story.md. */
  readStory(project: string, storyName: string): Promise<ApiResponse<KnowledgeReadResponse>> {
    return this.client.post<KnowledgeReadResponse>(KNOWLEDGE.STORY_READ, {
      project,
      story_name: storyName,
    });
  }

  /** Trigger a full disk → MongoDB reconciliation for ~/YiKnowledge. */
  sync(): Promise<ApiResponse<KnowledgeSyncResponse>> {
    return this.client.post<KnowledgeSyncResponse>(KNOWLEDGE.SYNC, {});
  }

  /**
   * Write a markdown file to the YiKnowledge directory.
   * Idempotent — overwrites if the file already exists.
   */
  write(
    targetFile: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<ApiResponse<KnowledgeWriteResponse>> {
    return this.client.post<KnowledgeWriteResponse>(KNOWLEDGE.WRITE, {
      target_file: targetFile,
      content,
      metadata,
    });
  }

  /** Convenience: fetch + return the parsed story list (or []). */
  async listStoriesAsItems(project?: string): Promise<KnowledgeStory[]> {
    const res = await this.listStories(project);
    return res.ok && res.data ? res.data.stories : [];
  }
}
