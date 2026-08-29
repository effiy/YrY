/**
 * MCP service — wraps YiAi's /mcp/tools + /mcp/call proxy routes.
 *
 * YiAi's own MCP server (server/mcp_server.py) registers tools like
 * chat_with_ollama, list_ollama_models, health_check, list_collections,
 * query_collection. Browsers can't easily do the MCP streamable-HTTP
 * JSON-RPC + SSE handshake, so YiAi exposes these thin REST proxies that
 * call FastMCP's list_tools / call_tool internally.
 *
 * YiAi contract:
 *   GET  /mcp/tools                       → { list: [{ name, description, input_schema }] }
 *   POST /mcp/call { name, arguments }    → { content, structured, raw }
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";
import type { YiAiEnvelope } from "@/api/interface/yiweb";

export interface McpTool {
  name: string;
  description?: string;
  input_schema?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface McpCallResult {
  content: string;
  structured?: unknown;
  raw?: string;
}

async function getJson<T>(path: string): Promise<T> {
  const url = buildYiAiUrl(path);
  const resp = await fetch(url, { method: "GET", headers: yiAiAuthHeaders() });
  if (!resp.ok) {
    throw new Error(`MCP request failed: ${path} HTTP ${resp.status}`);
  }
  const data = (await resp.json()) as YiAiEnvelope<T>;
  if (data.code !== 0) {
    throw new Error(data.message || `MCP request failed: ${path}`);
  }
  return data.data;
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = buildYiAiUrl(path);
  const resp = await fetch(url, {
    method: "POST",
    headers: { ...yiAiAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`MCP request failed: ${path} HTTP ${resp.status}`);
  }
  const data = (await resp.json()) as YiAiEnvelope<T>;
  if (data.code !== 0) {
    throw new Error(data.message || `MCP request failed: ${path}`);
  }
  return data.data;
}

/** List all tools registered on the YiAi MCP server. */
export function listMcpTools(): Promise<McpTool[]> {
  return getJson<McpTool[]>("/mcp/tools").then(list => (Array.isArray(list) ? list : []));
}

/** Invoke a tool on the YiAi MCP server by name with JSON arguments. */
export function callMcpTool(name: string, args: Record<string, unknown> = {}): Promise<McpCallResult> {
  return postJson<McpCallResult>("/mcp/call", { name, arguments: args });
}
