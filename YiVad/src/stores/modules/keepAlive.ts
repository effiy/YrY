import { defineStore } from "pinia";
import { ref } from "vue";

export const useKeepAliveStore = defineStore("yivad-keepAlive", () => {
  const keepAliveName = ref<string[]>([]);

  function addKeepAliveName(name: string) {
    !keepAliveName.value.includes(name) && keepAliveName.value.push(name);
  }

  function removeKeepAliveName(name: string) {
    keepAliveName.value = keepAliveName.value.filter(item => item !== name);
  }

  function setKeepAliveName(names: string[] = []) {
    keepAliveName.value = names;
  }

  return { keepAliveName, addKeepAliveName, removeKeepAliveName, setKeepAliveName };
});
