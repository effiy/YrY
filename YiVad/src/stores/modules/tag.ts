import { defineStore } from "pinia";
import { ref } from "vue";

export interface TagItem {
  id: string;
  name: string;
  color: string;
  count: number;
}

export const useTagStore = defineStore("tag", () => {
  const tags = ref<TagItem[]>(load());

  function load(): TagItem[] {
    try { return JSON.parse(localStorage.getItem("yivad-tags") ?? "[]"); } catch { return []; }
  }
  function persist() { localStorage.setItem("yivad-tags", JSON.stringify(tags.value)); }

  const addTag = (name: string, color?: string) => {
    if (tags.value.find((t) => t.name === name)) return;
    tags.value.push({ id: `tag-${Date.now()}`, name, color: color ?? "#409EFF", count: 0 });
    persist();
  };
  const removeTag = (id: string) => { tags.value = tags.value.filter((t) => t.id !== id); persist(); };
  const renameTag = (id: string, name: string) => {
    const tag = tags.value.find((t) => t.id === id);
    if (tag) { tag.name = name; persist(); }
  };
  const incrementCount = (id: string) => {
    const tag = tags.value.find((t) => t.id === id);
    if (tag) { tag.count++; persist(); }
  };
  const cleanupZero = () => { tags.value = tags.value.filter((t) => t.count > 0); persist(); };

  return { tags, addTag, removeTag, renameTag, incrementCount, cleanupZero };
});