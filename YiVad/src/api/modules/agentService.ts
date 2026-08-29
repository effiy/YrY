/**
 * Agent tools & skills service — server-side tool catalog from YiAi /agent/tools.
 */

import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";

/** A server-side agent tool descriptor (from `/agent/tools`). */
export interface AgentToolDescriptor {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requires_confirmation: boolean;
  group: string;
}

/** A skill in the YiKnowledge skill suite (from `/agent/tools`). */
export interface AgentSkillDescriptor {
  name: string;
  description: string;
  tags: string[];
  chip: string;
  category: string;
}

/** Response shape of `/agent/tools`. */
export interface AgentToolsResponse {
  tools: AgentToolDescriptor[];
  skills: AgentSkillDescriptor[];
}

/**
 * Fetch the browsable server-side tool + skill catalog from `/agent/tools`
 * (deepseek-harness style: "agent capabilities = tools"). Returns empty lists
 * on failure so the discovery UI degrades to a plain empty state.
 */
export async function listAgentTools(): Promise<AgentToolsResponse> {
  const url = buildYiAiUrl("/agent/tools");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...yiAiAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    return {
      tools: data?.data?.tools ?? [],
      skills: data?.data?.skills ?? [],
    };
  } catch {
    return { tools: [], skills: [] };
  }
}