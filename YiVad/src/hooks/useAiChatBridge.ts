import { useAiChatStore } from "@/stores/modules/aiChat";
import { useRouter } from "vue-router";

export interface AiChatBridgePayload {
  title?: string;
  pageContent?: string;
  tags?: string[];
  systemPrompt?: string;
  /** Route path back to the page that spawned this conversation
   *  (e.g. "/brd/engineer/detail/abc?mode=view"). Persisted as a `from:` tag
   *  so ConversationListItem can render a "back to source" link. */
  sourceUrl?: string;
}

/**
 * Bridge into the aiChat page from any other page.
 *
 * Spawns a fresh aiChat conversation seeded with `pageContent` (treated as
 * session context for RAG) + `tags` (ctx:-prefixed tags auto-activate RAG
 * over those files) and routes to /aiChat. The new conversation becomes the
 * active session — aiChat/index.vue's onMounted `loadConversations` picks
 * up the persisted active key, so the route change lands on the seeded
 * conversation even across a full reload.
 */
export function useAiChatBridge() {
  const router = useRouter();

  async function openInAiChat(payload: AiChatBridgePayload): Promise<string | null> {
    const store = useAiChatStore();
    if (!store.conversations.length) {
      await store.loadConversations().catch(() => {});
    }
    const tags = [...(payload.tags ?? [])];
    if (payload.sourceUrl) tags.push(`from:${payload.sourceUrl}`);
    const key = await store.createConversation(payload.title, payload.pageContent, tags);
    if (payload.systemPrompt) store.setSystemPrompt(payload.systemPrompt);
    await router.push({ path: "/aiChat", query: { session: key } });
    return key;
  }

  /**
   * Open an EXISTING aiChat conversation by key. Cross-tab safe — constructs
   * a URL with `?session=<key>` so the link can be shared/bookmarked.
   */
  function linkToAiChatSession(key: string): string {
    return `/aiChat?session=${encodeURIComponent(key)}`;
  }

  /**
   * Deep-link into the aiChat list filtered by a specific tag (e.g.
   * `bug:BUG-001`, `project:foo`, `story:STORY-3`). The ConversationSession
   * sidebar reads `?tag=` and pre-fills its search box, so only sessions
   * carrying that tag are shown. Useful for "view related aiChat sessions"
   * affordances on business pages.
   */
  function linkToAiChatByTag(tag: string): string {
    return `/aiChat?tag=${encodeURIComponent(tag)}`;
  }

  return { openInAiChat, linkToAiChatSession, linkToAiChatByTag };
}

