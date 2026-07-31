/**
 * AI prompt generation for story scenarios.
 *
 * Provides an Ollama-driven prompt generator:
 *  - `generateCodingPrompt` — creates a Claude Code prompt from a scenario
 *
 * Results are persisted via the store and shown as notifications with copy-to-clipboard.
 */
import { reactive } from "vue";
import { ElMessage, ElNotification } from "element-plus";
import { useStoryStore } from "@/stores/modules/story";
import { YIAI_OLLAMA_URL } from "@/config/yiweb";
import type { Scenario } from "@/api/modules/story";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function notifyWithCopy(title: string, text: string, copySuccessMsg: string) {
  window.focus();
  copyToClipboard(text);
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  ElNotification({
    title,
    message: `<div style="max-height:calc(88vh - 120px);overflow-y:auto;white-space:pre-wrap;font-size:14px;line-height:1.7;">${escaped}</div>`,
    type: "success",
    duration: 0,
    customClass: "ai-coding-notify",
    dangerouslyUseHTMLString: true,
    onClick: () => {
      copyToClipboard(text);
      ElMessage.success(copySuccessMsg);
    }
  });
}

function buildOllamaUrl(): string {
  return import.meta.env.DEV ? "/ollama" : YIAI_OLLAMA_URL;
}

async function callOllama(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch(`${buildOllamaUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen3.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      stream: false
    })
  });

  if (!response.ok) throw new Error(`Ollama returned ${response.status}`);

  const data = await response.json();
  const result: string = data?.message?.content ?? "";
  if (!result) throw new Error("Empty response from AI");
  return result.trim();
}

export function useAiPrompts() {
  const store = useStoryStore();

  /** Track which scenario keys are currently generating (prevents double-clicks). */
  const generatingCoding = reactive<Set<string>>(new Set());

  /** Generate a Claude Code implementation prompt from a scenario. */
  async function generateCodingPrompt(sc: Scenario) {
    const key = sc.key;
    if (generatingCoding.has(key)) return;
    generatingCoding.add(key);

    try {
      const stepsText = (sc.steps ?? []).map(s => `  ${s.action} ${s.description}`).join("\n");
      const tagsText = (sc.tags ?? []).join(", ");

      const systemPrompt = `You are an expert at writing Claude Code prompts. Given a software scenario (with Gherkin-style Given/When/Then steps), produce a single, self-contained, actionable prompt that a developer can paste directly into Claude Code to implement the scenario. The prompt should:
- Be written in the same language as the scenario description
- Include the scenario's context, requirements, and acceptance criteria
- Mention the tech stack if inferable from the tags
- Be concise but complete — ready to copy-paste and run
- NOT include any preamble, explanation, or markdown fences — just the prompt text itself`;

      const userMessage = `Scenario: ${sc.name}
Description: ${sc.description || "N/A"}
Priority: ${sc.priority.toUpperCase()}
Tags: ${tagsText || "N/A"}
Steps:
${stepsText || "N/A"}

Generate a Claude Code prompt for this scenario.`;

      const result = await callOllama(systemPrompt, userMessage);
      notifyWithCopy("AI Coding Prompt", result, "Prompt copied");
      store.saveAiCodingPrompt(sc.key, result);
    } catch (err) {
      console.error("AI Coding prompt generation failed:", err);
      ElMessage.error("AI Coding prompt generation failed");
    } finally {
      generatingCoding.delete(key);
    }
  }

  return {
    generatingCoding,
    generateCodingPrompt,
    copyToClipboard
  };
}
