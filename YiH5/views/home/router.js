/**
 * Router — URL hash-based routing.
 * Extracted from home/index.js per refactor-home-controller Story 2.
 */

/**
 * Parse current location.hash into a route descriptor.
 * @returns {{ name: 'list' | 'chat' | 'newsChat', key?: string }}
 */
export function parseRoute() {
  const raw = String(location.hash || "#/").replace(/^#/, "");
  if (!raw || raw === "/") return { name: "list" };

  if (raw.startsWith("/chat")) {
    const qIdx = raw.indexOf("?");
    const qs = qIdx >= 0 ? raw.slice(qIdx + 1) : "";
    const params = new URLSearchParams(qs);
    return { name: "chat", key: params.get("key") || "" };
  }

  if (raw.startsWith("/news-chat")) {
    const qIdx = raw.indexOf("?");
    const qs = qIdx >= 0 ? raw.slice(qIdx + 1) : "";
    const params = new URLSearchParams(qs);
    return { name: "newsChat", key: params.get("key") || "" };
  }

  return { name: "list" };
}

/** Navigate to the session list view. */
export function navigateToList() {
  location.hash = "#/";
}

/** Navigate to a session chat. */
export function navigateToChat(key) {
  location.hash = `#/chat?key=${encodeURIComponent(String(key))}`;
}

/** Navigate to a news chat. */
export function navigateToNewsChatRoute(key) {
  location.hash = `#/news-chat?key=${encodeURIComponent(String(key))}`;
}
