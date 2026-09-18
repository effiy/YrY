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
    const before = promptTemplates.value.length;
    promptTemplates.value = promptTemplates.value.filter(t => t.name !== name);
    if (promptTemplates.value.length === before) return false;
    saveTemplates();
    return true;
  }

  function applyTemplate(name: string, args: string[]): string | null {
    const t = promptTemplates.value.find(t => t.name === name);
    if (!t) return null;
    let result = t.content;
    args.forEach((arg, i) => {
      // split+join avoids regex special chars in arg and $ replacement patterns
      result = result.split(`$${i + 1}`).join(arg);
    });
    return result;
  }

  return { promptTemplates, addTemplate, removeTemplate, applyTemplate };
}
