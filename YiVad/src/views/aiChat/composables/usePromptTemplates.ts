import { ref } from "vue";
import { loadJson, saveJson } from "@/utils/storage";

interface PromptTemplate {
  name: string;
  content: string;
}

const STORAGE_KEY = "aiChat.promptTemplates";

export function usePromptTemplates() {
  const promptTemplates = ref<PromptTemplate[]>(loadJson(STORAGE_KEY, []));

  function saveTemplates() {
    saveJson(STORAGE_KEY, promptTemplates.value);
  }

  function addTemplate(name: string, content: string): boolean {
    if (promptTemplates.value.some(t => t.name === name)) return false;
    promptTemplates.value = [...promptTemplates.value, { name, content }];
    saveTemplates();
    return true;
  }

  function removeTemplate(name: string): boolean {
    const idx = promptTemplates.value.findIndex(t => t.name === name);
    if (idx < 0) return false;
    promptTemplates.value = promptTemplates.value.filter(t => t.name !== name);
    saveTemplates();
    return true;
  }

  function applyTemplate(name: string, args: string[]): string | null {
    const t = promptTemplates.value.find(t => t.name === name);
    if (!t) return null;
    let result = t.content;
    args.forEach((arg, i) => {
      result = result.replace(new RegExp(`\\$${i + 1}`, "g"), arg);
    });
    return result;
  }

  return { promptTemplates, addTemplate, removeTemplate, applyTemplate };
}