import { ElMessage } from "element-plus";
import type { Ref } from "vue";
import type { SessionDocument, ChatMessage } from "@/api/interface/yiweb";
import type { ToolDefinition, ToolResult } from "@/hooks/useToolRegistry";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";

export interface SlashCommandDeps {
  activeConversation: Ref<SessionDocument | null>;
  sending: Ref<boolean>;
  input: Ref<string>;
  allTools: Ref<ToolDefinition[]>;
  setActiveMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void;
  persistActive: () => Promise<void>;
  createConversation: (title?: string, pageContent?: string, tags?: string[]) => Promise<string>;
  executeTool: (name: string, args: Record<string, unknown>, signal?: AbortSignal) => Promise<ToolResult | null>;
  maybeCompact: () => Promise<void>;
  stopSending: () => void;
  retryLastMessage: () => Promise<void>;
  renameConversation: (key: string, title: string) => Promise<void>;
  exportConversation: () => void;
  exportConversationHtml: () => void;
  conversations: Ref<SessionDocument[]>;
  selectConversation: (key: string) => Promise<void>;
  promptTemplates: Ref<{ name: string; content: string }[]>;
  addTemplate: (name: string, content: string) => boolean;
  removeTemplate: (name: string) => boolean;
  applyTemplate: (name: string, args: string[]) => string | null;
}

export function useSlashCommands(deps: SlashCommandDeps) {
  async function handleCommand(cmd: string): Promise<boolean> {
    const parts = cmd.slice(1).trim().split(/\s+/);
    const name = parts[0]?.toLowerCase();
    const args = parts.slice(1).join(" ");

    switch (name) {
      case "compact":
        await deps.maybeCompact();
        ElMessage.success("Conversation compacted");
        return true;
      case "clear":
        if (!deps.activeConversation.value) return true;
        deps.setActiveMessages(() => []);
        await deps.persistActive();
        ElMessage.success("Conversation cleared");
        return true;
      case "retry":
        await deps.retryLastMessage();
        return true;
      case "stop":
        if (deps.sending.value) deps.stopSending();
        return true;
      case "model":
        ElMessage.info(`Current model: ${DEFAULT_MODEL} (switch via settings)`);
        return true;
      case "steer":
        ElMessage.info("Use /steer <message> while the agent is running to guide its behavior.");
        return true;
      case "followup":
        ElMessage.info("Use /followup <message> while the agent is running to queue a message after it finishes.");
        return true;
      case "skills": {
        if (!deps.activeConversation.value) await deps.createConversation();
        if (!deps.activeConversation.value) return true;
        const { MCP_SERVERS } = await import("@/views/aiChat/mcpServers");
        const tools = (deps.allTools.value ?? []).map(t => {
          const state = t.enabled === false ? "off" : "on";
          const pre = t.preStream ? " · pre" : "";
          return `- **${t.label}** (\`${t.name}\`) [${state}${pre}]: ${t.description}`;
        });
        const mcp = MCP_SERVERS.map(s => {
          const reach = s.browserReachable ? "browser-reachable" : "Node-side only";
          return `- **${s.name}** (${s.type}, ${reach}): ${s.description}`;
        });
        const body = [
          "## Available Skills",
          "",
          "### Built-in Tools",
          ...(tools.length ? tools : ["_(none registered)_"]),
          "",
          "### MCP Servers",
          ...(mcp.length ? mcp : ["_(none configured)_"]),
          "",
          "Toggle tools via the RAG / Web pills in the toolbar. Open the Tools icon for the live Skills panel + MCP health probe.",
        ].join("\n");
        const ts = Date.now();
        const skillMsg: ChatMessage = { type: "pet", message: body, timestamp: ts };
        deps.setActiveMessages(m => [...m, skillMsg]);
        await deps.persistActive();
        return true;
      }
      case "mcp": {
        if (!deps.activeConversation.value) await deps.createConversation();
        if (!deps.activeConversation.value) return true;
        const { MCP_SERVERS } = await import("@/views/aiChat/mcpServers");
        const targets = MCP_SERVERS.filter(s => s.browserReachable && s.url);
        const localOnly = MCP_SERVERS.filter(s => !s.browserReachable);
        const lines: string[] = ["## MCP Health Probe", ""];
        if (localOnly.length) {
          lines.push("### Local-only (stdio, not browser-reachable)");
          for (const s of localOnly) lines.push(`- **${s.name}**: ${s.description}`);
          lines.push("");
        }
        lines.push("### HTTP probes", "_Probing…_");
        const placeholderTs = Date.now();
        const placeholder: ChatMessage = { type: "pet", message: lines.join("\n"), timestamp: placeholderTs };
        deps.setActiveMessages(m => [...m, placeholder]);
        await deps.persistActive();
        const results: string[] = [];
        await Promise.all(targets.map(async (s) => {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 3000);
          const t0 = performance.now();
          try {
            const res = await fetch(s.url!, { method: "GET", signal: ctrl.signal });
            const ms = Math.round(performance.now() - t0);
            const ok = res.ok || res.status < 500;
            results.push(`- **${s.name}** ${ok ? "✓" : "✗"} — HTTP ${res.status} · ${ms}ms`);
          } catch (err: any) {
            const ms = Math.round(performance.now() - t0);
            const msg = err?.name === "AbortError" ? "timeout (3s)" : (err?.message || "unreachable");
            results.push(`- **${s.name}** ✗ — ${msg}${ms ? ` · ${ms}ms` : ""}`);
          } finally {
            clearTimeout(timer);
          }
        }));
        const finalLines = [
          "## MCP Health Probe",
          "",
          ...(localOnly.length
            ? ["### Local-only (stdio, not browser-reachable)",
                ...localOnly.map(s => `- **${s.name}**: ${s.description}`),
                ""]
            : []),
          "### HTTP probes",
          ...results,
        ];
        deps.setActiveMessages(m => {
          const idx = m.findIndex(x => x.timestamp === placeholderTs);
          if (idx < 0) return m;
          const next = [...m];
          next[idx] = { ...next[idx], message: finalLines.join("\n") };
          return next;
        });
        await deps.persistActive();
        return true;
      }
      case "test": {
        if (!deps.activeConversation.value) await deps.createConversation();
        if (!deps.activeConversation.value) return true;
        const toolName = parts[1]?.toLowerCase();
        if (toolName && toolName.startsWith("mcp.")) {
          const mcpName = toolName.slice(4);
          if (!mcpName) {
            const listTs = Date.now();
            const { listMcpTools } = await import("@/api/modules/mcpService");
            let mcpList: string[] = [];
            try {
              const tools = await listMcpTools();
              mcpList = tools.map(t => `  - \`mcp.${t.name}\`: ${t.description ?? ""}`);
            } catch (e: any) {
              mcpList = [`  - _(failed to list: ${e?.message || e})_`];
            }
            deps.setActiveMessages(m => [...m, {
              type: "pet",
              message: `**Usage:** \`/test mcp.<name> [key=value ...]\`\n\n**MCP tools:**\n${mcpList.join("\n")}`,
              timestamp: listTs,
            }]);
            await deps.persistActive();
            return true;
          }
          const argTokens = parts.slice(2);
          const argObj: Record<string, unknown> = {};
          for (const tok of argTokens) {
            const eq = tok.indexOf("=");
            if (eq < 0) continue;
            const k = tok.slice(0, eq);
            const v = tok.slice(eq + 1);
            argObj[k] = /^\d+$/.test(v) ? Number(v) : v;
          }
          const probeTs = Date.now();
          deps.setActiveMessages(m => [...m, {
            type: "pet",
            message: `**Testing MCP \`${mcpName}\`** with args \`${JSON.stringify(argObj)}\`…`,
            timestamp: probeTs,
          }]);
          await deps.persistActive();
          try {
            const { callMcpTool } = await import("@/api/modules/mcpService");
            const result = await callMcpTool(mcpName, argObj);
            const content = (result?.content ?? "").trim();
            const truncated = content.length > 1500
              ? content.slice(0, 1500) + `\n\n_…truncated (${content.length - 1500} more chars)_`
              : content;
            const body = `**MCP \`${mcpName}\` result:**\n\n\`\`\`\n${truncated || "(empty)"}\n\`\`\``;
            deps.setActiveMessages(m => {
              const idx = m.findIndex(x => x.timestamp === probeTs);
              if (idx < 0) return m;
              const next = [...m];
              next[idx] = { ...next[idx], message: body };
              return next;
            });
            await deps.persistActive();
          } catch (err: any) {
            const msg = err?.message || String(err);
            deps.setActiveMessages(m => {
              const idx = m.findIndex(x => x.timestamp === probeTs);
              if (idx < 0) return m;
              const next = [...m];
              next[idx] = { ...next[idx], message: `**MCP \`${mcpName}\` threw:** ${msg}` };
              return next;
            });
            await deps.persistActive();
          }
          return true;
        }
        if (!toolName || toolName === "mcp") {
          const list = (deps.allTools.value ?? [])
            .map(t => `  - \`${t.name}\`: ${t.label}`)
            .join("\n");
          let mcpList: string[] = [];
          try {
            const { listMcpTools } = await import("@/api/modules/mcpService");
            const tools = await listMcpTools();
            mcpList = tools.map(t => `  - \`mcp.${t.name}\`: ${t.description ?? ""}`);
          } catch (e: any) {
            mcpList = [`  - _(MCP /mcp/tools unreachable: ${e?.message || e})_`];
          }
          const usageTs = Date.now();
          deps.setActiveMessages(m => [...m, {
            type: "pet",
            message: `**Usage:** \`/test <tool_name> [key=value ...]\`\n\n**Built-in tools:**\n${list || "_(none)_"}\n\n**MCP tools:**\n${mcpList.join("\n") || "_(none)_"}\n\nUse \`/test mcp.<name> <args>\` to invoke an MCP server tool.`,
            timestamp: usageTs,
          }]);
          await deps.persistActive();
          return true;
        }
        const tool = (deps.allTools.value ?? []).find(t => t.name === toolName);
        if (!tool) {
          const errTs = Date.now();
          deps.setActiveMessages(m => [...m, {
            type: "pet",
            message: `Unknown tool: \`${toolName}\`. Type \`/test\` (no args) to list registered tools.`,
            timestamp: errTs,
          }]);
          await deps.persistActive();
          return true;
        }
        const argTokens2 = parts.slice(2);
        const argObj2: Record<string, unknown> = {};
        for (const tok of argTokens2) {
          const eq = tok.indexOf("=");
          if (eq < 0) continue;
          const k = tok.slice(0, eq);
          const v = tok.slice(eq + 1);
          argObj2[k] = /^\d+$/.test(v) ? Number(v) : v;
        }
        const probeTs2 = Date.now();
        deps.setActiveMessages(m => [...m, {
          type: "pet",
          message: `**Testing \`${toolName}\`** with args \`${JSON.stringify(argObj2)}\`…`,
          timestamp: probeTs2,
        }]);
        await deps.persistActive();
        try {
          const result = await deps.executeTool(toolName, argObj2);
          const content = (result?.content ?? "").trim();
          const error = result?.error;
          const truncated = content.length > 1500
            ? content.slice(0, 1500) + `\n\n_…truncated (${content.length - 1500} more chars)_`
            : content;
          const body = error
            ? `**\`${toolName}\` failed:** ${error}${truncated ? `\n\n\`\`\`\n${truncated}\n\`\`\`` : ""}`
            : `**\`${toolName}\` result:**\n\n\`\`\`\n${truncated || "(empty)"}\n\`\`\``;
          deps.setActiveMessages(m => {
            const idx = m.findIndex(x => x.timestamp === probeTs2);
            if (idx < 0) return m;
            const next = [...m];
            next[idx] = { ...next[idx], message: body };
            return next;
          });
          await deps.persistActive();
        } catch (err: any) {
          const msg = err?.message || String(err);
          deps.setActiveMessages(m => {
            const idx = m.findIndex(x => x.timestamp === probeTs2);
            if (idx < 0) return m;
            const next = [...m];
            next[idx] = { ...next[idx], message: `**\`${toolName}\` threw:** ${msg}` };
            return next;
          });
          await deps.persistActive();
        }
        return true;
      }
      case "rss": {
        if (!deps.activeConversation.value) await deps.createConversation();
        if (!deps.activeConversation.value) return true;
        const { getRssList } = await import("@/api/modules/rssService");
        const { readKnowledgeFile } = await import("@/api/modules/knowledgeService");
        const argQuery = args.trim();
        const listTs = Date.now();
        const placeholder: ChatMessage = {
          type: "pet",
          message: "_Loading recent RSS items…_",
          timestamp: listTs
        };
        deps.setActiveMessages(m => [...m, placeholder]);
        await deps.persistActive();
        let items: Awaited<ReturnType<typeof getRssList>>["data"]["list"] = [];
        try {
          const res = await getRssList({ pageSize: 10 });
          items = res.data?.list ?? [];
        } catch (err: any) {
          deps.setActiveMessages(m => {
            const idx = m.findIndex(x => x.timestamp === listTs);
            if (idx < 0) return m;
            const next = [...m];
            next[idx] = { ...next[idx], message: `**Failed to load RSS items:** ${err?.message || err}` };
            return next;
          });
          await deps.persistActive();
          return true;
        }
        if (!items.length) {
          deps.setActiveMessages(m => {
            const idx = m.findIndex(x => x.timestamp === listTs);
            if (idx < 0) return m;
            const next = [...m];
            next[idx] = { ...next[idx], message: "_No RSS items found. Parse a feed first via /rss page → Parse All._" };
            return next;
          });
          await deps.persistActive();
          return true;
        }
        if (argQuery) {
          const summarizeMatch = argQuery.match(/^summarize\s+(.+)$/i);
          if (summarizeMatch) {
            const source = summarizeMatch[1].trim();
            const itemsRes = await getRssList({ source_name: source, pageSize: 20 });
            const srcItems = itemsRes.data?.list ?? [];
            if (!srcItems.length) {
              deps.setActiveMessages(m => {
                const idx = m.findIndex(x => x.timestamp === listTs);
                if (idx < 0) return m;
                const next = [...m];
                next[idx] = { ...next[idx], message: `_No RSS items found for source \`${source}\`._` };
                return next;
              });
              await deps.persistActive();
              return true;
            }
            const picked = srcItems.slice(0, 8);
            const bodies: string[] = [];
            for (const it of picked) {
              let b = "";
              if (it.file_path) {
                try {
                  const r = await readKnowledgeFile(it.file_path);
                  b = r?.content || "";
                } catch { b = ""; }
              }
              if (!b) b = `_(No body available — see source.)_\n\nSource: ${it.link}`;
              bodies.push(`### ${it.title || "(untitled)"}\n\n_${it.published || "—"}_ · ${it.link || ""}\n\n${b}`);
            }
            const summary = picked
              .map(r => `- **${r.title || "(untitled)"}** · _${r.published || "—"}_`)
              .join("\n");
            const pageContent = `# Summarize RSS feed: ${source}\n\nBased on the ${picked.length} RSS items below, write a concise summary (~300 words) covering the key points.\n\n---\n\n## Items\n\n${summary}\n\n---\n\n${bodies.join("\n\n---\n\n")}`;
            const ctxPaths = picked.map(r => r.file_path).filter((p): p is string => !!p);
            const tags = ["rss", "rss-summary", `rss:${source}`, ...ctxPaths.map(p => `ctx:${p}`)];
            deps.setActiveMessages(m => {
              const idx = m.findIndex(x => x.timestamp === listTs);
              if (idx < 0) return m;
              const next = [...m];
              next[idx] = {
                ...next[idx],
                message: `**Ingesting ${picked.length} items from \`${source}\` into a new conversation for summarization…**`
              };
              return next;
            });
            await deps.persistActive();
            await deps.createConversation(`RSS Summary: ${source}`, pageContent, tags);
            return true;
          }
          const q = argQuery.toLowerCase();
          const match = items.find(it =>
            (it.title || "").toLowerCase().includes(q) ||
            (it.source_name || "").toLowerCase().includes(q)
          );
          if (!match) {
            deps.setActiveMessages(m => {
              const idx = m.findIndex(x => x.timestamp === listTs);
              if (idx < 0) return m;
              const next = [...m];
              next[idx] = { ...next[idx], message: `_No RSS item matching \`${argQuery}\`._` };
              return next;
            });
            await deps.persistActive();
            return true;
          }
          let body = "";
          if (match.file_path) {
            try {
              const r = await readKnowledgeFile(match.file_path);
              body = r?.content || "";
            } catch { body = ""; }
          }
          if (!body) body = `_(No body available — see source.)_\n\nSource: ${match.link}`;
          deps.setActiveMessages(m => {
            const idx = m.findIndex(x => x.timestamp === listTs);
            if (idx < 0) return m;
            const next = [...m];
            next[idx] = {
              ...next[idx],
              message: `**Ingesting RSS item into a new conversation…**\n\n- **${match.title || "(untitled)"}**\n  - Source: ${match.source_name || "—"}\n  - Published: ${match.published || "—"}\n  - Link: ${match.link || "—"}`
            };
            return next;
          });
          await deps.persistActive();
          const tags = match.file_path
            ? [`ctx:${match.file_path}`, "rss", `rss:${match.source_name || "unknown"}`]
            : ["rss", `rss:${match.source_name || "unknown"}`];
          await deps.createConversation(`RSS: ${match.title || match.source_name || "Untitled"}`, body, tags);
          return true;
        }
        const lines = [
          "## Recent RSS Items",
          "",
          "_Click an item title to open it; type `/rss <title substring>` to ingest the first match, or `/rss summarize <source>` to summarize the latest items from a source._",
          "",
          ...items.map(it => {
            const title = it.title || "(untitled)";
            const src = it.source_name || "—";
            const pub = it.published || "—";
            return `- **${title}** · _${src}_ · ${pub}`;
          })
        ];
        deps.setActiveMessages(m => {
          const idx = m.findIndex(x => x.timestamp === listTs);
          if (idx < 0) return m;
          const next = [...m];
          next[idx] = { ...next[idx], message: lines.join("\n") };
          return next;
        });
        await deps.persistActive();
        return true;
      }
      case "name": {
        if (!deps.activeConversation.value) {
          ElMessage.warning("No active conversation to rename");
          return true;
        }
        const newTitle = args.trim();
        if (!newTitle) {
          ElMessage.info("Usage: /name <new title>");
          return true;
        }
        await deps.renameConversation(deps.activeConversation.value.key, newTitle);
        ElMessage.success(`Conversation renamed to "${newTitle}"`);
        return true;
      }
      case "export": {
        deps.exportConversation();
        ElMessage.success("Conversation exported as markdown");
        return true;
      }
      case "exporthtml": {
        deps.exportConversationHtml();
        ElMessage.success("Conversation exported as HTML");
        return true;
      }
      case "template": {
        const subCmd = parts[1]?.toLowerCase();
        const rest = parts.slice(2).join(" ");
        if (!subCmd || subCmd === "list") {
          const list = deps.promptTemplates.value;
          if (!list.length) {
            const ts = Date.now();
            deps.setActiveMessages(m => [...m, { type: "pet", message: "_No saved templates. Use `/template add <name> <content>` to create one._", timestamp: ts }]);
            await deps.persistActive();
            return true;
          }
          const lines = [
            "## Prompt Templates",
            "",
            ...list.map(t => `- **${t.name}**: \`${t.content.length > 60 ? t.content.slice(0, 60) + "…" : t.content}\``),
            "",
            `Use \`/template <name> [arg1 arg2 ...]\` to apply. \`$1\`, \`$2\`, etc. in the template are replaced with the arguments.`,
          ];
          const ts = Date.now();
          deps.setActiveMessages(m => [...m, { type: "pet", message: lines.join("\n"), timestamp: ts }]);
          await deps.persistActive();
          return true;
        }
        if (subCmd === "add") {
          const nameEnd = rest.indexOf(" ");
          if (nameEnd < 0) {
            ElMessage.info("Usage: /template add <name> <content>");
            return true;
          }
          const tName = rest.slice(0, nameEnd).trim();
          const tContent = rest.slice(nameEnd + 1).trim();
          if (!tName || !tContent) {
            ElMessage.info("Usage: /template add <name> <content>");
            return true;
          }
          const ok = deps.addTemplate(tName, tContent);
          ElMessage[ok ? "success" : "warning"](ok ? `Template "${tName}" saved` : `Template "${tName}" already exists`);
          return true;
        }
        if (subCmd === "remove" || subCmd === "rm") {
          const tName = rest.trim();
          if (!tName) {
            ElMessage.info("Usage: /template remove <name>");
            return true;
          }
          const ok = deps.removeTemplate(tName);
          ElMessage[ok ? "success" : "warning"](ok ? `Template "${tName}" removed` : `Template "${tName}" not found`);
          return true;
        }
        // Apply template: /template <name> [arg1 arg2 ...]
        const tName = subCmd;
        const tArgs = parts.slice(2);
        const result = deps.applyTemplate(tName, tArgs);
        if (result === null) {
          ElMessage.warning(`Template "${tName}" not found. Use /template list to see available templates.`);
          return true;
        }
        deps.input.value = result;
        ElMessage.success(`Template "${tName}" applied`);
        return true;
      }
      case "copy": {
        const msgs = deps.activeConversation.value?.messages ?? [];
        const lastAi = [...msgs].reverse().find(m => m.type === "pet" && m.message);
        if (!lastAi?.message) {
          ElMessage.warning("No AI message to copy");
          return true;
        }
        navigator.clipboard.writeText(lastAi.message).then(
          () => ElMessage.success("Copied last AI message"),
          () => ElMessage.error("Copy failed")
        );
        return true;
      }
      case "session": {
        const s = deps.activeConversation.value;
        if (!s) { ElMessage.warning("No active session"); return true; }
        const msgs = s.messages ?? [];
        const totalChars = msgs.reduce((sum, m) => sum + (m.message?.length ?? 0), 0);
        const userMsgs = msgs.filter(m => m.type === "user").length;
        const aiMsgs = msgs.filter(m => m.type === "pet").length;
        const toolCalls = msgs.reduce((sum, m) => sum + (m.toolCalls?.length ?? 0), 0);
        const created = s.createdAt ? new Date(s.createdAt).toLocaleString() : "—";
        const updated = s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "—";
        const info = [
          "## Session Info",
          "",
          `| Key | Value |`,
          `|-----|-------|`,
          `| Title | ${s.title || "—"} |`,
          `| Session Key | \`${s.key}\` |`,
          `| Created | ${created} |`,
          `| Updated | ${updated} |`,
          `| Messages | ${msgs.length} (${userMsgs} user, ${aiMsgs} AI) |`,
          `| Tool Calls | ${toolCalls} |`,
          `| Est. Tokens | ~${Math.ceil(totalChars / 4)} |`,
          `| Context Files | ${(s.tags ?? []).filter(t => t.startsWith("ctx:")).length} |`,
          `| Tags | ${(s.tags ?? []).filter(t => !t.startsWith("ctx:")).join(", ") || "—"} |`,
        ].join("\n");
        const ts = Date.now();
        deps.setActiveMessages(m => [...m, { type: "pet", message: info, timestamp: ts }]);
        await deps.persistActive();
        return true;
      }
      case "new": {
        await deps.createConversation();
        ElMessage.success("New conversation created");
        return true;
      }
      case "resume": {
        const list = deps.conversations.value ?? [];
        if (!list.length) {
          const ts = Date.now();
          deps.setActiveMessages(m => [...m, { type: "pet", message: "_No saved conversations to resume._", timestamp: ts }]);
          await deps.persistActive();
          return true;
        }
        const activeKey = deps.activeConversation.value?.key;
        const lines = [
          "## Resume Session",
          "",
          "Click a session title to switch, or type `/resume <number>` to jump directly.",
          "",
          ...list.slice(0, 20).map((c, i) => {
            const marker = c.key === activeKey ? "▶ " : "";
            const title = c.title || "Untitled";
            const updated = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "";
            const msgCount = (c.messages ?? []).length;
            return `${i + 1}. ${marker}**${title}** · ${msgCount} msgs · ${updated}`;
          }),
        ];
        // If user specified a number, switch to that session
        const num = parseInt(args.trim(), 10);
        if (num >= 1 && num <= list.length) {
          await deps.selectConversation(list[num - 1].key);
          ElMessage.success(`Switched to "${list[num - 1].title || "Untitled"}"`);
          return true;
        }
        const ts = Date.now();
        deps.setActiveMessages(m => [...m, { type: "pet", message: lines.join("\n"), timestamp: ts }]);
        await deps.persistActive();
        return true;
      }
      case "hotkeys": {
        const keys = [
          "## Keyboard Shortcuts",
          "",
          "| Shortcut | Action |",
          "|----------|--------|",
          "| `Enter` | Send message |",
          "| `Shift+Enter` | Newline |",
          "| `Escape` | Stop sending / Clear input |",
          "| `Ctrl+K` / `Cmd+K` | Clear conversation |",
          "| `Ctrl+L` / `Cmd+L` | Clear input |",
          "| `ArrowUp` (at start) | Recall previous prompt |",
          "| `ArrowDown` (at end) | Recall next prompt |",
          "",
          "## Slash Commands",
          "",
          "| Command | Description |",
          "|---------|-------------|",
          "| `/compact` | Compress conversation history |",
          "| `/clear` | Clear all messages |",
          "| `/retry` | Retry last failed message |",
          "| `/stop` | Stop current stream |",
          "| `/model` | Show current model |",
          "| `/steer <msg>` | Steer running agent |",
          "| `/followup <msg>` | Queue follow-up for agent |",
          "| `/name <title>` | Rename conversation |",
          "| `/export` | Export as markdown |",
          "| `/exporthtml` | Export as HTML |",
          "| `/copy` | Copy last AI message |",
          "| `/session` | Show session info |",
          "| `/new` | Start new conversation |",
          "| `/resume [num]` | Switch to another session |",
          "| `/skills` | List available tools |",
          "| `/test <tool>` | Test a tool directly |",
          "| `/rss` | Browse RSS items |",
          "| `/template [list|add|rm|name]` | Manage prompt templates |",
          "| `/hotkeys` | Show this help |",
        ].join("\n");
        const ts = Date.now();
        deps.setActiveMessages(m => [...m, { type: "pet", message: keys, timestamp: ts }]);
        await deps.persistActive();
        return true;
      }
      default:
        return false;
    }
  }

  return { handleCommand };
}