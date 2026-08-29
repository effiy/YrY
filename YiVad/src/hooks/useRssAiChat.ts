/**
 * useRssAiChat — shared aiChat bridge logic for RSS pages.
 *
 * Used by both index.vue (list page) and RssItemDetailDrawer.vue (detail drawer)
 * to avoid duplicating discuss/summarize/quick-action page-content construction
 * and body-loading logic.
 */
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { RSS_QUICK_ACTION_PROMPTS } from "@/api/modules/rssService";
import type { RssItemDocument, RssQuickAction } from "@/api/modules/rssService";

export interface RssAiChatItem {
  title?: string;
  link?: string;
  source_name?: string;
  published?: string;
  file_path?: string;
}

export function useRssAiChat() {
  const { openInAiChat, linkToAiChatByTag } = useAiChatBridge();

  /** Load the markdown body for an RSS item from YiKnowledge. */
  async function loadBody(row: RssAiChatItem): Promise<string> {
    if (!row.file_path) return `_(No body available — see source.)_\n\nSource: ${row.link}`;
    try {
      const r = await readKnowledgeFile(row.file_path);
      return r?.content || `_(No body available — see source.)_\n\nSource: ${row.link}`;
    } catch {
      return `_(Failed to load body.)_\n\nSource: ${row.link}`;
    }
  }

  /** Build the markdown page content for a single RSS item. */
  function buildPageContent(row: RssAiChatItem, body: string): string {
    return `# ${row.title || "(untitled)"}\n\nSource: ${row.source_name || "—"} · Published: ${row.published || "—"}\nSource URL: ${row.link || "—"}\n\n---\n\n${body}`;
  }

  /** Default tags for a single RSS item. */
  function itemTags(row: RssAiChatItem, extra?: string[]): string[] {
    const base = row.file_path
      ? [`ctx:${row.file_path}`, "rss", `rss:${row.source_name || "unknown"}`]
      : ["rss", `rss:${row.source_name || "unknown"}`];
    return extra ? [...base, ...extra] : base;
  }

  const DISCUSS_SYSTEM_PROMPT =
    "You are a research assistant. The user has shared an RSS article as context. Answer questions, extract key points, or summarize on request. Cite the article's source and publish date when relevant. Reply in the user's language.";

  /** Open a single RSS item in aiChat for discussion. */
  async function discussInAiChat(row: RssAiChatItem, body?: string) {
    const content = body ?? (await loadBody(row));
    await openInAiChat({
      title: `RSS: ${row.title || row.source_name || "Untitled"}`,
      pageContent: buildPageContent(row, content),
      tags: itemTags(row),
      sourceUrl: row.link,
      systemPrompt: DISCUSS_SYSTEM_PROMPT
    });
  }

  /** Open a single RSS item in aiChat with a quick action (summarize/translate/critique). */
  async function quickActionInAiChat(row: RssAiChatItem, action: RssQuickAction, body?: string) {
    const content = body ?? (await loadBody(row));
    await openInAiChat({
      title: `RSS ${action}: ${row.title || row.source_name || "Untitled"}`,
      pageContent: buildPageContent(row, content),
      tags: itemTags(row, [`rss-action:${action}`]),
      sourceUrl: row.link,
      systemPrompt: RSS_QUICK_ACTION_PROMPTS[action]
    });
  }

  /** Open a batch of RSS items in aiChat (discuss or summarize). */
  async function openBatchInAiChat(
    rows: RssItemDocument[],
    opts: { titlePrefix: string; tagPrefix: string; systemPrompt: string }
  ) {
    const picked = rows.slice(0, 8);
    const bodies = await Promise.all(picked.map(loadBody));
    const ctxPaths = picked.map(r => r.file_path).filter((p): p is string => !!p);
    const tags = ["rss", opts.tagPrefix, ...ctxPaths.map(p => `ctx:${p}`)];
    const summary = picked
      .map(r => `- **${r.title || "(untitled)"}** · _${r.source_name || "—"}_ · ${r.published || "—"}\n  ${r.link || ""}`)
      .join("\n");
    const pageContent = `# ${opts.titlePrefix} (${picked.length} items)\n\n${summary}\n\n---\n\n${bodies.join("\n\n---\n\n")}`;
    await openInAiChat({
      title: `${opts.titlePrefix}: ${picked.length} items`,
      pageContent,
      tags,
      sourceUrl: picked[0]?.link,
      systemPrompt: opts.systemPrompt
    });
    return { picked, total: rows.length };
  }

  return {
    loadBody,
    buildPageContent,
    itemTags,
    discussInAiChat,
    quickActionInAiChat,
    openBatchInAiChat,
    openInAiChat,
    linkToAiChatByTag,
    DISCUSS_SYSTEM_PROMPT
  };
}