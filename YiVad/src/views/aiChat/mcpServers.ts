/**
 * MCP server registry for the aiChat UI.
 *
 * Mirrors `.mcp.json` (which configures Claude Code's MCP client when working
 * on YiVad). Listed here so the aiChat Skills panel can surface what MCP
 * servers are available alongside the built-in tool registry.
 *
 * Pi-inspired: a single place where external capability providers are
 * declared, so the UI can show "what does the agent have access to".
 *
 * NOTE: stdio servers (e.g. `github` via `npx @modelcontextprotocol/server-github`)
 * are not reachable from a browser — they only work when Claude Code (or
 * another Node-side MCP client) consumes them. HTTP servers like `yiai`
 * can be pinged from the browser via fetch.
 */
export interface McpServerConfig {
  name: string;
  type: "http" | "stdio";
  /** For HTTP servers: the URL. For stdio: the command + args. */
  url?: string;
  command?: string;
  args?: string[];
  /** Short human-readable description shown in the Skills panel. */
  description: string;
  /** True if a browser can reach this server (HTTP only, same-origin or CORS-enabled). */
  browserReachable: boolean;
}

export const MCP_SERVERS: McpServerConfig[] = [
  {
    name: "yiai",
    type: "http",
    url: "http://localhost:10086/mcp",
    description: "YiAi backend — chat, state, database, RSS, health (MCP over streamable HTTP).",
    browserReachable: true,
  },
  {
    name: "github",
    type: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    description: "GitHub MCP server — issues, PRs, code search (Node-side, not browser-reachable).",
    browserReachable: false,
  },
];
